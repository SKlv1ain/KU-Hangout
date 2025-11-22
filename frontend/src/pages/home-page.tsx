import { useState, useEffect, useRef, useMemo } from "react"
import Navbar from "@/components/navbar"
import { MessageDockDemo } from "@/components/home/message-dock"
import { FilterDock } from "@/components/home/filter-dock"
import { PlanDetailPanel, type PlanDetailData } from "@/components/home/plan-detail-panel"
import { CreatePlanDialog } from "@/components/home/create-plan-dialog"
import { SidebarLayout } from "@/components/home/side-bar"
import { PlanList } from "@/components/home/plan-list"
import { useAuth } from "@/context/AuthContext"
import { usePlans, usePlanState, usePlanFilters, usePlanActions, usePlanCreation } from "@/hooks/plan"
import { FILTER_GROUPS } from "@/lib/constants"
import {
  calculateSavedCount,
  calculateMyPlansCount,
  filterPlansByTab,
  savePlansToLocalStorage
} from "@/lib/planUtils"

export default function HomePage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<PlanDetailData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Store plan leader_id mapping for owner check
  const [planOwners, setPlanOwners] = useState<Record<string | number, number>>({})
  
  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Custom hooks
  const { filterParams, handleFilterChange, handleClearFilters, activeTab, setActiveTab } = usePlanFilters()
  const { plansState, updatePlanState } = usePlanState()
  const { plans, setPlans, loading, reloadPlans } = usePlans(filterParams, setPlanOwners)
  const { handleJoin, handleDelete, handleLike, handleSave, handleChat } = usePlanActions(
    user,
    setPlans,
    selectedPlan,
    setSelectedPlan,
    plansState,
    updatePlanState,
    reloadPlans
  )
  const { isCreateDialogOpen, setIsCreateDialogOpen, handleCreatePlan, handleSubmitPlan } = usePlanCreation(
    setPlans,
    updatePlanState,
    reloadPlans,
    setPlanOwners
  )

  // Update selectedPlan state when plansState changes
  useEffect(() => {
    if (selectedPlan) {
      const currentState = plansState[selectedPlan.id || '']
      if (currentState) {
        setSelectedPlan(prev => prev ? {
          ...prev,
          ...currentState
        } : null)
      }
    }
  }, [plansState, selectedPlan?.id])

  const handlePlanClick = (planData: PlanDetailData) => {
    const planId = planData.id || ''
    const currentState = plansState[planId]
    
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

  // Calculate counts using utility functions
  const savedCount = useMemo(
    () => calculateSavedCount(plans, plansState),
    [plans, plansState]
  )

  const myPlansCount = useMemo(
    () => calculateMyPlansCount(plans, planOwners, user?.id),
    [plans, planOwners, user?.id]
  )

  // Filter plans by active tab
  const filteredPlans = useMemo(
    () => filterPlansByTab(plans, activeTab, plansState, planOwners, user?.id),
    [plans, activeTab, plansState, planOwners, user?.id]
  )

  // Prepare filter groups with checked state
  const filterGroupsWithState = useMemo(
    () => FILTER_GROUPS.map(group => ({
      ...group,
      options: group.options.map(option => ({
        ...option,
        checked: group.id === 'status'
          ? (filterParams.filter === option.id || (option.id === 'all' && !filterParams.filter))
          : (filterParams.category === option.id || (option.id === 'all' && !filterParams.category))
      }))
    })),
    [filterParams]
  )

  // Calculate isOwner for selected plan
  const isOwner = useMemo(
    () => user && selectedPlan ? planOwners[selectedPlan.id || ''] === user.id : false,
    [user, selectedPlan, planOwners]
  )

  // Save minimal plan data to localStorage for message page
  useEffect(() => {
    savePlansToLocalStorage(plans)
  }, [plans])

  // Scroll to top when tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [activeTab])

  return (
    <SidebarLayout contentClassName="h-screen bg-background overflow-hidden">
      <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)', maxHeight: 'calc(100vh - 4rem)' }}>
          {/* Main Content - 60% when detail is open, 100% when closed */}
          <div 
            ref={scrollContainerRef}
            className={`${isDetailOpen ? 'flex-[3]' : 'flex-1'} transition-all duration-300`}
            style={{ height: '100%', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden' }}
          >
            <div className="container mx-auto px-4">
              <FilterDock
                filterGroups={filterGroupsWithState}
                createButtonText="Create Plan"
                activeTab={activeTab}
                savedCount={savedCount}
                myPlansCount={myPlansCount}
                onDateChange={(date: Date | undefined) => {
                  // TODO: Implement date filter
                  console.log('Date changed:', date)
                }}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                onTabChange={setActiveTab}
                onCreateClick={handleCreatePlan}
              />
              <div className="py-8">
                <div className="space-y-8 pb-8">
                  <PlanList
                    plans={filteredPlans}
                    plansState={plansState}
                    planOwners={planOwners}
                    user={user}
                    loading={loading}
                    onPlanClick={handlePlanClick}
                    onJoin={handleJoin}
                    onDelete={handleDelete}
                    onLike={handleLike}
                    onSave={handleSave}
                    onChat={handleChat}
                        />
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
            isOwner={isOwner}
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