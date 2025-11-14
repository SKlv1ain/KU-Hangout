import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/navbar"
import MessageDockDemo from "@/components/home/message-dock"
import FilterDock from "@/components/home/filter-dock"
import { PlanCard } from "@/components/home/plan-card"
import { PlanDetailPanel, type PlanDetailData } from "@/components/home/plan-detail-panel"
import { CreatePlanDialog, type CreatePlanFormData } from "@/components/home/create-plan-dialog"
import { SidebarLayout } from "@/components/home/side-bar"
import plansService, { type Plan } from "@/services/plansService"
import { useAuth } from "@/context/AuthContext"

const sampleImages = [
  "https://images.unsplash.com/photo-1568036193587-84226a9c5a1b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "https://images.unsplash.com/photo-1654054041538-ad6a3fb653d5?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
]

// Helper function to generate tag colors (moved outside component for better performance)
const getTagColor = (tagLabel: string): string => {
  const tagColors: Record<string, string> = {
    "Study": "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400/30",
    "Café": "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/30",
    "Weekend": "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-400/30",
    "Group": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30",
    "Sports": "bg-green-500/20 text-green-700 dark:text-green-300 border-green-400/30",
    "Outdoor": "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-400/30",
    "Entertainment": "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/30",
    "Social": "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/30",
    "Evening": "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-400/30",
    "Food": "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/30",
    "Adventure": "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400/30",
  }
  return tagColors[tagLabel] || "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-400/30"
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<PlanDetailData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterParams, setFilterParams] = useState<{ filter?: 'hot' | 'new' | 'expiring' | 'all'; category?: string; search?: string }>({})
  
  // State management for all plans
  const [plansState, setPlansState] = useState<Record<string | number, {
    isJoined: boolean
    isLiked: boolean
    isSaved: boolean
  }>>({})
  
  // Plans state - initialize empty, will be loaded from API
  const [plans, setPlans] = useState<PlanDetailData[]>([])

  // Store plan leader_id mapping for owner check
  const [planOwners, setPlanOwners] = useState<Record<string | number, number>>({})

  // Convert backend Plan to frontend PlanDetailData (memoized to prevent unnecessary re-renders)
  const convertPlanToDetailData = useCallback((plan: Plan): PlanDetailData => {
    const eventDate = new Date(plan.event_time)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    const dayName = days[eventDate.getDay()]
    const monthName = months[eventDate.getMonth()]
    const day = eventDate.getDate()
    const hours = eventDate.getHours()
    const minutes = eventDate.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHour = hours % 12 || 12
    const formattedTime = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`
    
    // Convert tags
    const tags = (plan.tags_display || []).map(tag => ({
      label: tag.name,
      color: getTagColor(tag.name)
    }))

    // Store leader_id for owner check
    setPlanOwners(prev => ({
      ...prev,
      [plan.id]: plan.leader_id
    }))

    return {
      id: plan.id,
      title: plan.title,
      creatorName: plan.creator_username,
      location: plan.location,
      dateTime: `${dayName}, ${monthName} ${day} • ${formattedTime}`,
      description: plan.description,
      fullDescription: plan.description,
      tags,
      participants: [], // Will be loaded separately if needed
      participantCount: plan.people_joined,
      maxParticipants: plan.max_people,
      images: plan.images && plan.images.length > 0 ? plan.images : sampleImages, // Use images from API (Cloudinary URLs)
      isJoined: plan.joined ?? false,
      isLiked: false,
      isSaved: false,
      requirements: [] // Backend doesn't have requirements yet
    }
  }, []) // Empty deps - setPlanOwners is a state setter and doesn't change

  // Helper function to convert array of backend plans to frontend format (memoized)
  const convertPlansArray = useCallback((backendPlans: Plan[]): PlanDetailData[] => {
    return backendPlans.map(plan => convertPlanToDetailData(plan))
  }, [convertPlanToDetailData])

  // Helper function to reload plans from API (reusable, memoized)
  const reloadPlans = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      
      const backendPlans = await plansService.getPlans(filterParams)
      const convertedPlans = convertPlansArray(backendPlans)
      setPlans(convertedPlans)
      
      // Update plans state from backend
      const newPlansState: Record<string | number, {
        isJoined: boolean
        isLiked: boolean
        isSaved: boolean
      }> = {}
      
      for (const plan of backendPlans) {
        newPlansState[plan.id] = {
          isJoined: plan.joined || false,
          isLiked: false, // Backend doesn't have like yet
          isSaved: false, // Backend doesn't have save yet
        }
      }
      
      setPlansState(prev => ({
        ...prev,
        ...newPlansState
      }))
      
      return convertedPlans
    } catch (error) {
      console.error('Error reloading plans:', error)
      throw error
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [filterParams, convertPlansArray])

  // Images are now loaded from API, no need to load from localStorage

  // Load plans from API when filterParams change
  useEffect(() => {
    reloadPlans(true).catch(() => {
      // On error, keep existing plans or set empty array
      setPlans([])
    })
  }, [reloadPlans])

  // Images are now loaded from API, no need to update from planImages state

  const updatePlanState = (planId: string | number | undefined, updates: Partial<{
    isJoined: boolean
    isLiked: boolean
    isSaved: boolean
  }>) => {
    if (!planId) return
    
    setPlansState(prev => {
      const newState = {
        ...prev,
        [planId]: {
          isJoined: prev[planId]?.isJoined || false,
          isLiked: prev[planId]?.isLiked || false,
          isSaved: prev[planId]?.isSaved || false,
          ...updates
        }
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('ku-hangout-plans-state', JSON.stringify(newState))
      } catch (error) {
        console.error('Error saving plans state to localStorage:', error)
      }
      
      return newState
    })

    // Update selectedPlan if it's the same plan
    if (selectedPlan && selectedPlan.id === planId) {
      setSelectedPlan(prev => prev ? {
        ...prev,
        ...updates
      } : null)
    }
  }

  const handlePlanClick = (planData: PlanDetailData) => {
    const planId = planData.id
    const currentState = plansState[planId || '']
    
    setSelectedPlan({
      ...planData,
      isJoined: currentState?.isJoined ?? planData.isJoined ?? false,
      isLiked: currentState?.isLiked ?? planData.isLiked ?? false,
      isSaved: currentState?.isSaved ?? planData.isSaved ?? false,
    })
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedPlan(null)
  }

  const handleJoin = async (planId: string | number | undefined) => {
    if (!planId) return
    const currentState = plansState[planId]
    const isCurrentlyJoined = currentState?.isJoined ?? false
    
    try {
      if (isCurrentlyJoined) {
        // Leave plan
        const numericPlanId = typeof planId === 'string' ? parseInt(planId, 10) : planId
        if (isNaN(numericPlanId)) {
          throw new Error('Invalid plan ID')
        }
        const response = await plansService.leavePlan(numericPlanId)
        console.log('Leave plan response:', response)
        updatePlanState(planId, { isJoined: false })
        // Update plan's people_joined count from response
        // Response is a Plan object with people_joined field
        if (response && typeof response === 'object' && 'people_joined' in response) {
          console.log('Updating participantCount to:', response.people_joined)
          setPlans(prev => prev.map(p => {
            if (p.id === planId) {
              console.log('Before update:', p.participantCount, 'After update:', response.people_joined)
              return { ...p, participantCount: response.people_joined }
            }
            return p
          }))
        } else {
          console.error('Invalid response from leavePlan:', response)
        }
      } else {
        // Join plan
        const numericPlanId = typeof planId === 'string' ? parseInt(planId, 10) : planId
        if (isNaN(numericPlanId)) {
          throw new Error('Invalid plan ID')
        }
        const response = await plansService.joinPlan(numericPlanId)
        updatePlanState(planId, { isJoined: true })
        // Update plan's people_joined count
        setPlans(prev => prev.map(p => 
          p.id === planId 
            ? { ...p, participantCount: response.people_joined }
            : p
        ))
      }
    } catch (error) {
      console.error('Error joining/leaving plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to join/leave plan. Please try again.'
      alert(errorMessage)
    }
  }

  const handleDelete = async (planId: string | number | undefined) => {
    if (!planId) return
    
    try {
      const numericPlanId = typeof planId === 'string' ? parseInt(planId, 10) : planId
      if (isNaN(numericPlanId)) {
        throw new Error('Invalid plan ID')
      }
      
      await plansService.deletePlan(numericPlanId)
      
      // Remove plan from list
      setPlans(prev => prev.filter(p => p.id !== planId))
      
      // Remove from state
      setPlansState(prev => {
        const newState = { ...prev }
        delete newState[planId]
        return newState
      })
      
      // Close detail panel if it's the deleted plan
      if (selectedPlan && selectedPlan.id === planId) {
        setIsDetailOpen(false)
        setSelectedPlan(null)
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete plan. Please try again.'
      alert(errorMessage)
    }
  }

  const handleLike = (planId: string | number | undefined) => {
    if (!planId) return
    const currentState = plansState[planId]
    const newLiked = !(currentState?.isLiked ?? false)
    updatePlanState(planId, { isLiked: newLiked })
    console.log('Plan liked:', planId, newLiked)
  }

  const handleSave = (planId: string | number | undefined) => {
    if (!planId) return
    const currentState = plansState[planId]
    const newSaved = !(currentState?.isSaved ?? false)
    updatePlanState(planId, { isSaved: newSaved })
    console.log('Plan saved:', planId, newSaved)
  }

  const handleChat = (planId: string | number | undefined) => {
    if (!planId) return
    // Navigate to messages page with planId as query parameter
    navigate(`/messages?planId=${planId}`)
  }

  const handleCreatePlan = () => {
    setIsCreateDialogOpen(true)
  }

  const handleSubmitPlan = async (data: CreatePlanFormData) => {
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
      const createdPlan = await plansService.createPlan(formData)
      
      // OPTIMISTIC UPDATE: Convert to frontend format and add to plans immediately
      const newPlan = convertPlanToDetailData(createdPlan)
      // Use images from API response (Cloudinary URLs)
      newPlan.images = createdPlan.images && createdPlan.images.length > 0 
        ? createdPlan.images 
        : sampleImages
      
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
  }

  // Save only plan IDs and titles to localStorage (for message page) - not full plans with images
  useEffect(() => {
    try {
      // Only save minimal data needed for message page (plan IDs and titles)
      const minimalPlans = plans.map(plan => ({
        id: plan.id,
        title: plan.title,
        creatorName: plan.creatorName
      }))
      localStorage.setItem('ku-hangout-plans', JSON.stringify(minimalPlans))
    } catch (error) {
      console.error('Error saving plans to localStorage:', error)
      // If still fails, try to clear old data and save again
      try {
        localStorage.removeItem('ku-hangout-plans')
        const minimalPlans = plans.map(plan => ({
          id: plan.id,
          title: plan.title,
          creatorName: plan.creatorName
        }))
        localStorage.setItem('ku-hangout-plans', JSON.stringify(minimalPlans))
      } catch (retryError) {
        console.error('Error retrying save to localStorage:', retryError)
      }
    }
  }, [plans])

  return (
    <SidebarLayout contentClassName="h-screen bg-background overflow-hidden">
      <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)', maxHeight: 'calc(100vh - 4rem)' }}>
          {/* Main Content - 60% when detail is open, 100% when closed */}
          <div 
            className={`${isDetailOpen ? 'flex-[3]' : 'flex-1'} transition-all duration-300`}
            style={{ height: '100%', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden' }}
          >
            <div className="container mx-auto px-4">
              <FilterDock
                filterGroups={[
                  {
                    id: 'status',
                    label: 'Status',
                    options: [
                      { id: 'all', label: 'All', checked: filterParams.filter === 'all' || !filterParams.filter },
                      { id: 'hot', label: 'Hot', checked: filterParams.filter === 'hot' },
                      { id: 'new', label: 'New', checked: filterParams.filter === 'new' },
                      { id: 'expiring', label: 'Expiring', checked: filterParams.filter === 'expiring' },
                    ],
                  },
                  {
                    id: 'category',
                    label: 'Category',
                    options: [
                      { id: 'all', label: 'All', checked: !filterParams.category || filterParams.category === 'all' },
                      { id: 'sports', label: 'Sports', checked: filterParams.category === 'sports' },
                      { id: 'food', label: 'Food', checked: filterParams.category === 'food' },
                      { id: 'travel', label: 'Travel', checked: filterParams.category === 'travel' },
                      { id: 'art', label: 'Art', checked: filterParams.category === 'art' },
                      { id: 'music', label: 'Music', checked: filterParams.category === 'music' },
                      { id: 'movie', label: 'Movies', checked: filterParams.category === 'movie' },
                      { id: 'game', label: 'Games', checked: filterParams.category === 'game' },
                    ],
                  },
                ]}
                savedButtonText="Saved"
                createButtonText="Create Plan"
                onDateChange={(date) => {
                  // TODO: Implement date filter
                  console.log('Date changed:', date)
                }}
                onFilterChange={(groupId, optionId, checked) => {
                  if (checked) {
                    if (groupId === 'status') {
                      setFilterParams(prev => ({ 
                        ...prev, 
                        filter: optionId === 'all' ? undefined : (optionId as 'hot' | 'new' | 'expiring' | 'all')
                      }))
                    } else if (groupId === 'category') {
                      setFilterParams(prev => ({ ...prev, category: optionId === 'all' ? undefined : optionId }))
                    }
                  }
                }}
                onClearFilters={() => {
                  setFilterParams({})
                }}
                onSavedClick={() => {
                  // TODO: Implement saved plans filter
                  console.log('Saved clicked')
                }}
                onCreateClick={handleCreatePlan}
              />
              <div className="py-8">
                <div className="space-y-8 pb-8">
                  {/* Plan Cards Grid */}
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">Loading plans...</p>
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">No plans found. Create one to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {plans.map((plan) => {
                      const planId = plan.id || ''
                      // Use stable key format to ensure React can track components properly
                      const stableKey = `plan-${planId}`
                      const isOwner = !!(user && planOwners[planId] === user.id)
                      return (
                        <PlanCard
                          key={stableKey}
                          id={planId}
                          title={plan.title}
                          creatorName={plan.creatorName}
                          location={plan.location}
                          dateTime={plan.dateTime}
                          description={plan.description}
                          tags={plan.tags}
                          participants={plan.participants}
                          participantCount={plan.participantCount}
                          images={plan.images}
                          isJoined={plansState[planId]?.isJoined ?? plan.isJoined ?? false}
                          isLiked={plansState[planId]?.isLiked ?? plan.isLiked ?? false}
                          isSaved={plansState[planId]?.isSaved ?? plan.isSaved ?? false}
                          isOwner={isOwner}
                          onClick={() => handlePlanClick(plan)}
                          onJoin={() => handleJoin(planId)}
                          onDelete={() => handleDelete(planId)}
                          onLike={() => handleLike(planId)}
                          onSave={() => handleSave(planId)}
                          onChat={() => handleChat(planId)}
                        />
                      )
                    })}
                    </div>
                  )}
                  
        <MessageDockDemo />
      </div>
    </div>
            </div>
          </div>

          {/* Detail Panel - 40% */}
          <PlanDetailPanel
            plan={selectedPlan}
            isOpen={isDetailOpen}
            onClose={handleCloseDetail}
            isOwner={user && selectedPlan ? planOwners[selectedPlan.id || ''] === user.id : false}
            onJoin={() => handleJoin(selectedPlan?.id)}
            onDelete={() => handleDelete(selectedPlan?.id)}
            onLike={() => handleLike(selectedPlan?.id)}
            onSave={() => handleSave(selectedPlan?.id)}
            onChat={() => handleChat(selectedPlan?.id)}
          />
        </div>
      </div>

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleSubmitPlan}
      />
    </SidebarLayout>
  )
}