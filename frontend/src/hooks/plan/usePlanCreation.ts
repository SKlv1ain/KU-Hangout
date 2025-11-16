import { useState, useCallback } from "react"
import plansService from "@/services/plansService"
import type { Plan } from "@/services/plansService"
import type { PlanDetailData } from "@/components/home/plan-detail-panel"
import type { CreatePlanFormData } from "@/components/home/create-plan-dialog"
import { convertPlanToDetailData } from "@/lib/planUtils"
import { SAMPLE_IMAGES } from "@/lib/constants"

export function usePlanCreation(
  setPlans: React.Dispatch<React.SetStateAction<PlanDetailData[]>>,
  updatePlanState: (planId: string | number | undefined, updates: Partial<{
    isJoined: boolean
    isLiked: boolean
    isSaved: boolean
  }>) => void,
  reloadPlans: (showLoading?: boolean) => Promise<PlanDetailData[]>,
  setPlanOwners: (updater: (prev: Record<string | number, number>) => Record<string | number, number>) => void
) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreatePlan = useCallback(() => {
    setIsCreateDialogOpen(true)
  }, [])

  const handleSubmitPlan = useCallback(async (data: CreatePlanFormData) => {
    try {
      // Combine date and time into ISO 8601 format
      if (!data.date || !data.time) {
        throw new Error('Date and time are required')
      }

      const [hours, minutes] = data.time.split(':')
      const eventDateTime = new Date(data.date)
      eventDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

      // Create FormData to send images to backend
      const formData = new FormData()

      // Add plan data
      formData.append('title', data.title)
      formData.append('description', data.description)
      // Truncate location to 100 characters (backend max_length limit)
      const location = data.location.length > 100 
        ? data.location.substring(0, 100)
        : data.location
      formData.append('location', location)
      
      // Add lat/lng if available (backend: max_digits=11, decimal_places=8)
      // Need to ensure total digits (including decimal point) <= 11
      // Format: round to 8 decimal places and ensure total digits <= 11
      if (data.lat !== undefined && data.lat !== null) {
        // Round to 8 decimal places
        const latRounded = Math.round(data.lat * 100000000) / 100000000
        // Convert to string and check total digits (excluding decimal point)
        const latStr = latRounded.toString()
        const latDigits = latStr.replace(/[.-]/g, '').length
        if (latDigits <= 11) {
          formData.append('lat', latRounded.toString())
        } else {
          // If still too many digits, truncate to fit max_digits=11
          // Keep integer part and adjust decimal places
          const latParts = latStr.split('.')
          const intPart = latParts[0]
          const decPart = latParts[1] || ''
          const maxDecPlaces = Math.max(0, 11 - intPart.length)
          const truncatedLat = parseFloat(`${intPart}.${decPart.substring(0, maxDecPlaces)}`)
          formData.append('lat', truncatedLat.toString())
        }
      }
      if (data.lng !== undefined && data.lng !== null) {
        // Round to 8 decimal places
        const lngRounded = Math.round(data.lng * 100000000) / 100000000
        // Convert to string and check total digits (excluding decimal point)
        const lngStr = lngRounded.toString()
        const lngDigits = lngStr.replace(/[.-]/g, '').length
        if (lngDigits <= 11) {
          formData.append('lng', lngRounded.toString())
        } else {
          // If still too many digits, truncate to fit max_digits=11
          // Keep integer part and adjust decimal places
          const lngParts = lngStr.split('.')
          const intPart = lngParts[0]
          const decPart = lngParts[1] || ''
          const maxDecPlaces = Math.max(0, 11 - intPart.length)
          const truncatedLng = parseFloat(`${intPart}.${decPart.substring(0, maxDecPlaces)}`)
          formData.append('lng', truncatedLng.toString())
        }
      }
      
      formData.append('event_time', eventDateTime.toISOString())
      formData.append('max_people', data.maxParticipants.toString())

      // Add tags as JSON string (backend will parse it)
      if (data.tags && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags))
      }

      // Add images (only File objects, skip strings)
      data.images.forEach((img) => {
        if (img instanceof File) {
          formData.append('images', img)
        }
      })

      // Call API to create plan with FormData
      const createdPlan: Plan = await plansService.createPlan(formData)

      // OPTIMISTIC UPDATE: Convert to frontend format and add to plans immediately
      const newPlan = convertPlanToDetailData(createdPlan, setPlanOwners)
      // Use images from API response (Cloudinary URLs)
      newPlan.images = createdPlan.images && createdPlan.images.length > 0
        ? createdPlan.images
        : SAMPLE_IMAGES

      // Add new plan to the beginning of the array (optimistic update)
      setPlans((prev) => [newPlan, ...prev])

      // Initialize state for new plan
      updatePlanState(createdPlan.id, {
        isJoined: true,
        isLiked: false,
        isSaved: false,
      })

      // Close dialog immediately for better UX
      setIsCreateDialogOpen(false)

      console.log('Plan created successfully:', createdPlan)

      // RELOAD: Refresh plans from API in background to ensure consistency
      // Wait a bit for backend to process and ensure plan is in the list
      setTimeout(async () => {
        try {
          await reloadPlans(false)
          console.log('Plans reloaded successfully after creation')
        } catch (reloadError) {
          console.error('Error reloading plans after creation:', reloadError)
          // Don't show error to user - optimistic update already showed the plan
          // If reload fails, the optimistic update is still visible
        }
      }, 1000) // Wait 1 second for backend to process

    } catch (error) {
      console.error('Error creating plan:', error)
      
      // Try to extract detailed error message from response
      let errorMessage = 'Failed to create plan. Please try again.'
      
      if (error instanceof Error) {
        // Check if error has response data (from api.ts)
        const errorWithResponse = error as any
        if (errorWithResponse.response?.data) {
          const errorData = errorWithResponse.response.data
          
          // Format validation errors from Django REST Framework
          if (typeof errorData === 'object') {
            const errorMessages: string[] = []
            for (const [field, messages] of Object.entries(errorData)) {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`)
              } else {
                errorMessages.push(`${field}: ${String(messages)}`)
              }
            }
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join('\n')
            } else {
              errorMessage = error.message
            }
          } else {
            errorMessage = String(errorData) || error.message
          }
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
      console.error('Detailed error:', error)

      // Don't close dialog on error so user can retry
      // setIsCreateDialogOpen(false) - commented out to keep dialog open
    }
  }, [setPlans, updatePlanState, reloadPlans, setPlanOwners])

  return {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    handleCreatePlan,
    handleSubmitPlan
  }
}

