import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import plansService from "@/services/plansService"
import savedPlansService from "@/services/savedPlansService"
import type { PlanDetailData } from "@/components/home/plan-detail-panel"
import type { ParticipantData } from "@/components/plan-card/plan-card-participants"

type PlanState = {
  isJoined: boolean
  isLiked: boolean
  isSaved: boolean
}

type PlansState = Record<string | number, PlanState>

export function usePlanActions(
  user: { id: number; username?: string; profile_picture?: string | null } | null,
  setPlans: React.Dispatch<React.SetStateAction<PlanDetailData[]>>,
  selectedPlan: PlanDetailData | null,
  setSelectedPlan: React.Dispatch<React.SetStateAction<PlanDetailData | null>>,
  plansState: PlansState,
  updatePlanState: (planId: string | number | undefined, updates: Partial<PlanState>) => void,
  reloadPlans: (showLoading?: boolean) => Promise<PlanDetailData[]>
) {
  const navigate = useNavigate()

  const handleJoin = useCallback(async (planId: string | number | undefined) => {
    if (!planId || !user) return
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

        // Update plan: remove current user from participants and update count
        setPlans(prev => prev.map(p => {
          if (p.id === planId) {
            // Remove current user from participants
            const updatedParticipants = p.participants.filter(participant => participant.id !== user.id)
            const updatedPlan = {
              ...p,
              participants: updatedParticipants,
              participantCount: response && typeof response === 'object' && 'people_joined' in response
                ? response.people_joined
                : updatedParticipants.length
            }
            // Update selectedPlan if it's the same plan
            if (selectedPlan && selectedPlan.id === planId) {
              setSelectedPlan(updatedPlan)
            }
            return updatedPlan
          }
          return p
        }))

        // Reload plans from API in background to ensure consistency
        setTimeout(async () => {
          try {
            await reloadPlans(false)
            console.log('Plans reloaded successfully after leave')
          } catch (reloadError) {
            console.error('Error reloading plans after leave:', reloadError)
            // Don't show error to user - optimistic update already showed the change
          }
        }, 500) // Wait 500ms for backend to process
      } else {
        // Join plan
        const numericPlanId = typeof planId === 'string' ? parseInt(planId, 10) : planId
        if (isNaN(numericPlanId)) {
          throw new Error('Invalid plan ID')
        }
        const response = await plansService.joinPlan(numericPlanId)
        updatePlanState(planId, { isJoined: true })

        // Create participant data for current user (optimistic update)
        const newParticipant: ParticipantData = {
          id: user.id,
          name: user.username || 'Unknown',
          image: user.profile_picture || null,
          role: 'MEMBER'
        }

        // Update plan: add current user to participants and update count
        setPlans(prev => prev.map(p => {
          if (p.id === planId) {
            // Check if user is already in participants (avoid duplicates)
            const isAlreadyInParticipants = p.participants.some(participant => participant.id === user.id)
            const updatedParticipants = isAlreadyInParticipants
              ? p.participants
              : [...p.participants, newParticipant]

            const updatedPlan = {
              ...p,
              participants: updatedParticipants,
              participantCount: response.people_joined || updatedParticipants.length
            }
            // Update selectedPlan if it's the same plan
            if (selectedPlan && selectedPlan.id === planId) {
              setSelectedPlan(updatedPlan)
            }
            return updatedPlan
          }
          return p
        }))

        // Reload plans from API in background to ensure consistency
        setTimeout(async () => {
          try {
            await reloadPlans(false)
            console.log('Plans reloaded successfully after join')
          } catch (reloadError) {
            console.error('Error reloading plans after join:', reloadError)
            // Don't show error to user - optimistic update already showed the change
          }
        }, 500) // Wait 500ms for backend to process
      }
    } catch (error) {
      console.error('Error joining/leaving plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to join/leave plan. Please try again.'
      alert(errorMessage)
    }
  }, [user, plansState, updatePlanState, setPlans, selectedPlan, setSelectedPlan, reloadPlans])

  const handleDelete = useCallback(async (planId: string | number | undefined) => {
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
      updatePlanState(planId, { isJoined: false, isLiked: false, isSaved: false })

      // Close detail panel if it's the deleted plan
      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan(null)
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete plan. Please try again.'
      alert(errorMessage)
    }
  }, [setPlans, updatePlanState, selectedPlan, setSelectedPlan])

  const handleLike = useCallback((planId: string | number | undefined) => {
    if (!planId) return
    const currentState = plansState[planId]
    const newLiked = !(currentState?.isLiked ?? false)
    updatePlanState(planId, { isLiked: newLiked })
    console.log('Plan liked:', planId, newLiked)
  }, [plansState, updatePlanState])

  const handleSave = useCallback(async (planId: string | number | undefined) => {
    if (!planId) return
    const currentState = plansState[planId]
    const isCurrentlySaved = currentState?.isSaved ?? false
    const numericPlanId = typeof planId === 'string' ? parseInt(planId, 10) : planId
    
    if (isNaN(numericPlanId)) {
      console.error('Invalid plan ID for save:', planId)
      return
    }

    // Optimistic update
    const newSaved = !isCurrentlySaved
    updatePlanState(planId, { isSaved: newSaved })

    try {
      if (newSaved) {
        await savedPlansService.savePlan(numericPlanId)
      } else {
        await savedPlansService.unsavePlan(numericPlanId)
      }
      // State already updated optimistically, no need to update again
    } catch (error) {
      // Revert on error
      updatePlanState(planId, { isSaved: isCurrentlySaved })
      console.error('Error saving/unsaving plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save/unsave plan. Please try again.'
      alert(errorMessage)
    }
  }, [plansState, updatePlanState])

  const handleChat = useCallback((planId: string | number | undefined) => {
    if (!planId) return
    // Navigate to messages page with planId as query parameter
    navigate(`/messages?planId=${planId}`)
  }, [navigate])

  return {
    handleJoin,
    handleDelete,
    handleLike,
    handleSave,
    handleChat
  }
}

