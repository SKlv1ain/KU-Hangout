import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/navbar"
import MessageDockDemo from "@/components/home/message-dock"
import FilterDock from "@/components/home/filter-dock"
import { PlanCard } from "@/components/home/plan-card"
import { PlanDetailPanel, type PlanDetailData } from "@/components/home/plan-detail-panel"
import { CreatePlanDialog, type CreatePlanFormData } from "@/components/home/create-plan-dialog"
import { SidebarLayout } from "@/components/home/side-bar"
import plansService, { type Plan } from "@/services/plansService"

const sampleImages = [
  "https://images.unsplash.com/photo-1568036193587-84226a9c5a1b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "https://images.unsplash.com/photo-1654054041538-ad6a3fb653d5?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
]

export default function HomePage() {
  const navigate = useNavigate()
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

  // Helper function to generate tag colors
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


  // Convert backend Plan to frontend PlanDetailData
  const convertPlanToDetailData = (plan: Plan): PlanDetailData => {
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
      images: sampleImages, // Backend doesn't have images yet, use sample
      isJoined: false, // Will be checked from plansState
      isLiked: false,
      isSaved: false,
      requirements: [] // Backend doesn't have requirements yet
    }
  }

  // Load plans from API
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true)
        const backendPlans = await plansService.getPlans(filterParams)
        const convertedPlans = backendPlans.map(convertPlanToDetailData)
        setPlans(convertedPlans)
      } catch (error) {
        console.error('Error loading plans:', error)
        // Fallback to empty array on error
        setPlans([])
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [filterParams])

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
        await plansService.leavePlan(numericPlanId)
        updatePlanState(planId, { isJoined: false })
        // Update plan's people_joined count
        setPlans(prev => prev.map(p => 
          p.id === planId 
            ? { ...p, participantCount: Math.max((p.participantCount || 0) - 1, 0) }
            : p
        ))
      } else {
        // Join plan
        const numericPlanId = typeof planId === 'string' ? parseInt(planId, 10) : planId
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
      // Show error message to user (optional)
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

      // Create plan payload
      const payload = {
        title: data.title,
        description: data.description,
        location: data.location,
        lat: null, // TODO: Add geocoding for lat/lng
        lng: null,
        event_time: eventDateTime.toISOString(),
        max_people: data.maxParticipants,
        tags: data.tags
      }

      // Call API to create plan
      const createdPlan = await plansService.createPlan(payload)
      
      // Convert to frontend format and add to plans
      const newPlan = convertPlanToDetailData(createdPlan)
      
      // Add new plan to plans array (will be added at the beginning)
      setPlans((prev) => [newPlan, ...prev])

      // Initialize state for new plan
      updatePlanState(createdPlan.id, {
        isJoined: false, // User is leader, but not "joined" in the same sense
        isLiked: false,
        isSaved: false,
      })

      // Close dialog
      setIsCreateDialogOpen(false)

      console.log('Plan created successfully:', createdPlan)
    } catch (error) {
      console.error('Error creating plan:', error)
      // Show error message to user (optional)
      alert('Failed to create plan. Please try again.')
    }
  }

  // Save plans to localStorage whenever plans change (for message page)
  useEffect(() => {
    try {
      localStorage.setItem('ku-hangout-plans', JSON.stringify(plans))
    } catch (error) {
      console.error('Error saving plans to localStorage:', error)
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
                      return (
                        <PlanCard
                          key={planId}
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
                          onClick={() => handlePlanClick(plan)}
                          onJoin={() => handleJoin(planId)}
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
            onJoin={() => handleJoin(selectedPlan?.id)}
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