import { useState } from "react"
import Navbar from "@/components/navbar"
import MessageDockDemo from "@/components/home/message-dock"
import FilterDock from "@/components/home/filter-dock"
import { PlanCard } from "@/components/home/plan-card"
import { PlanDetailPanel, type PlanDetailData } from "@/components/home/plan-detail-panel"
import { CreatePlanDialog, type CreatePlanFormData } from "@/components/home/create-plan-dialog"
import { SidebarLayout } from "@/components/home/side-bar"
import type { ParticipantData } from "@/components/plan-card/plan-card-participants"

// Sample data
const samplePeople: ParticipantData[] = [
  {
    id: 1,
    name: "Sai Khun Main",
    designation: "Frontend dev",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=SaiKhunMain&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  },
  {
    id: 2,
    name: "Thanutham Chonsongkram",
    designation: "Frontend dev",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=Thanutham&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  },
  {
    id: 3,
    name: "Peerawat Theerasakul",
    designation: "Backend dev",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=Peerawat&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  },
  {
    id: 4,
    name: "Chanotai Mukdakul",
    designation: "Backend dev",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=Chanotai&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  },
]

const sampleImages = [
  "https://images.unsplash.com/photo-1568036193587-84226a9c5a1b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "https://images.unsplash.com/photo-1654054041538-ad6a3fb653d5?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
]

const sampleTags = [
  { label: "Study", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400/30" },
  { label: "Café", color: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/30" },
  { label: "Weekend", color: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-400/30" },
  { label: "Group", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30" },
]

// Initial plans data
const initialPlans: PlanDetailData[] = [
  {
    id: "1",
    title: "Weekend Café Study Session",
    creatorName: "Sai Khun Main",
    location: "Starbucks @ KU Central",
    dateTime: "Sat, Dec 14 • 2:00 PM",
    description: "Join us for a productive study session! Bring your books and let's tackle assignments together.",
    fullDescription: "Join us for a productive study session at Starbucks! This is a great opportunity to meet new study buddies and work on assignments together. Bring your books, laptops, and a positive attitude. We'll be studying for about 3-4 hours with breaks in between. All majors welcome!",
    tags: sampleTags,
    participants: samplePeople,
    participantCount: 4,
    maxParticipants: 8,
    images: sampleImages,
    requirements: [
      "Bring your own study materials",
      "Laptop or notebook recommended",
      "Respectful and focused environment"
    ]
  },
  {
    id: "2",
    title: "Basketball Game at Sports Complex",
    creatorName: "Thanutham Chonsongkram",
    location: "KU Sports Complex",
    dateTime: "Sun, Dec 15 • 4:00 PM",
    description: "Looking for players to join a friendly basketball match. All skill levels welcome!",
    fullDescription: "Join us for a friendly basketball game at the KU Sports Complex! This is a casual game open to all skill levels. We'll play for about 2 hours with breaks. Bring your own water bottle and wear appropriate sports attire. Let's have fun and stay active!",
    tags: [
      { label: "Sports", color: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-400/30" },
      { label: "Outdoor", color: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-400/30" },
    ],
    participants: samplePeople.slice(0, 2),
    participantCount: 2,
    maxParticipants: 10,
    images: sampleImages,
    requirements: [
      "Sports attire required",
      "Bring water bottle",
      "All skill levels welcome"
    ]
  },
  {
    id: "3",
    title: "Movie Night at Central World",
    creatorName: "Peerawat Theerasakul",
    location: "Central World Cinema",
    dateTime: "Fri, Dec 13 • 7:00 PM",
    description: "Join us for a fun movie night! We're watching the latest blockbuster together.",
    fullDescription: "Let's enjoy a movie night together at Central World Cinema! We'll watch the latest blockbuster and grab some snacks. After the movie, we can discuss it over dinner. All movie lovers are welcome!",
    tags: [
      { label: "Entertainment", color: "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/30" },
      { label: "Social", color: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/30" },
      { label: "Evening", color: "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-400/30" },
    ],
    participants: samplePeople.slice(0, 3),
    participantCount: 3,
    maxParticipants: 6,
    images: sampleImages,
    requirements: [
      "Movie ticket required",
      "Arrive 15 minutes early",
      "Bring money for snacks"
    ]
  },
  {
    id: "4",
    title: "Food Tour Around Siam",
    creatorName: "Chanotai Mukdakul",
    location: "Siam Square",
    dateTime: "Sun, Dec 15 • 12:00 PM",
    description: "Explore the best street food in Siam! Let's try different cuisines together.",
    fullDescription: "Join us for an exciting food tour around Siam Square! We'll explore various street food stalls and restaurants, trying different cuisines from Thai to international. Perfect for food lovers who want to discover new flavors and make new friends!",
    tags: [
      { label: "Food", color: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/30" },
      { label: "Adventure", color: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400/30" },
      { label: "Weekend", color: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-400/30" },
    ],
    participants: samplePeople,
    participantCount: 4,
    maxParticipants: 8,
    images: sampleImages,
    requirements: [
      "Bring cash for food",
      "Come with an empty stomach",
      "Allergy information welcome"
    ]
  }
]

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanDetailData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // State management for all plans
  const [plansState, setPlansState] = useState<Record<string | number, {
    isJoined: boolean
    isLiked: boolean
    isSaved: boolean
  }>>({})

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

  // Format date and time to dateTime string
  const formatDateTime = (date: Date | undefined, time: string): string => {
    if (!date || !time) return ""
    
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    const dayName = days[date.getDay()]
    const monthName = months[date.getMonth()]
    const day = date.getDate()
    
    // Format time (time input type="time" gives format "HH:MM")
    let formattedTime = time
    if (time.includes(":")) {
      const [hours, minutes] = time.split(":")
      const hour = parseInt(hours, 10)
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      formattedTime = `${displayHour}:${minutes} ${ampm}`
    }
    
    return `${dayName}, ${monthName} ${day} • ${formattedTime}`
  }

  const updatePlanState = (planId: string | number | undefined, updates: Partial<{
    isJoined: boolean
    isLiked: boolean
    isSaved: boolean
  }>) => {
    if (!planId) return
    
    setPlansState(prev => ({
      ...prev,
      [planId]: {
        isJoined: prev[planId]?.isJoined || false,
        isLiked: prev[planId]?.isLiked || false,
        isSaved: prev[planId]?.isSaved || false,
        ...updates
      }
    }))

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

  const handleJoin = (planId: string | number | undefined) => {
    if (!planId) return
    const currentState = plansState[planId]
    const newJoined = !(currentState?.isJoined ?? false)
    updatePlanState(planId, { isJoined: newJoined })
    console.log('Plan joined:', planId, newJoined)
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

  const handleCreatePlan = () => {
    setIsCreateDialogOpen(true)
  }

  const handleSubmitPlan = (data: CreatePlanFormData) => {
    // Convert File[] to string[] (URLs)
    const imageUrls = data.images.map((image) => {
      if (typeof image === 'string') {
        return image
      }
      return URL.createObjectURL(image)
    })

    // Convert tags string[] to tags array with colors
    const tagsWithColors = data.tags.map((tag) => ({
      label: tag,
      color: getTagColor(tag)
    }))

    // Generate new plan ID
    const newPlanId = String(Date.now())

    // Create new plan data
    const newPlan: PlanDetailData = {
      id: newPlanId,
      title: data.title,
      creatorName: "You", // TODO: Replace with actual user name from context
      location: data.location,
      dateTime: formatDateTime(data.date, data.time),
      description: data.description,
      fullDescription: data.description, // Use description as full description for now
      tags: tagsWithColors,
      participants: [], // New plan has no participants yet
      participantCount: 0,
      maxParticipants: data.maxParticipants,
      images: imageUrls,
      requirements: data.requirements,
      isJoined: false,
      isLiked: false,
      isSaved: false,
    }

    // Add new plan to plans array (will be added at the beginning)
    setPlans((prev) => [newPlan, ...prev])

    // Initialize state for new plan
    updatePlanState(newPlanId, {
      isJoined: false,
      isLiked: false,
      isSaved: false,
    })

    // Close dialog
    setIsCreateDialogOpen(false)

    console.log('Plan created successfully:', newPlan)
  }

  // Plans state - initialize with initial plans
  const [plans, setPlans] = useState<PlanDetailData[]>(initialPlans)

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
                      { id: 'upcoming', label: 'Upcoming', checked: false },
                      { id: 'ongoing', label: 'Ongoing', checked: false },
                      { id: 'completed', label: 'Completed', checked: false },
                    ],
                  },
                  {
                    id: 'category',
                    label: 'Category',
                    options: [
                      { id: 'study', label: 'Study', checked: false },
                      { id: 'social', label: 'Social', checked: false },
                      { id: 'sports', label: 'Sports', checked: false },
                    ],
                  },
                ]}
                savedButtonText="Saved"
                createButtonText="Create Plan"
                onDateChange={(date) => console.log('Date changed:', date)}
                onFilterChange={(groupId, optionId, checked) => console.log('Filter changed:', { groupId, optionId, checked })}
                onClearFilters={() => console.log('Filters cleared')}
                onSavedClick={() => console.log('Saved clicked')}
                onCreateClick={handleCreatePlan}
              />
              <div className="py-8">
                <div className="space-y-8 pb-8">
                  {/* Plan Cards Grid */}
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
                        />
                      )
                    })}
                  </div>
                  
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