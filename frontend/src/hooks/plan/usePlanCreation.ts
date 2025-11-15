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
      formData.append('location', data.location)
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
      // Show error message to user
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to create plan. Please try again.'
      alert(errorMessage)

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

