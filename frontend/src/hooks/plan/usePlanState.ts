import { useState, useEffect } from "react"

type PlanState = {
  isJoined: boolean
  isLiked: boolean
  isSaved: boolean
}

type PlansState = Record<string | number, PlanState>

export function usePlanState() {
  const [plansState, setPlansState] = useState<PlansState>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem('ku-hangout-plans-state')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading plans state from localStorage:', error)
    }
    return {}
  })

  // Save to localStorage whenever plansState changes
  useEffect(() => {
    try {
      localStorage.setItem('ku-hangout-plans-state', JSON.stringify(plansState))
    } catch (error) {
      console.error('Error saving plans state to localStorage:', error)
    }
  }, [plansState])

  const updatePlanState = (
    planId: string | number | undefined,
    updates: Partial<PlanState>
  ) => {
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
      return newState
    })
  }

  const getPlanState = (planId: string | number | undefined): PlanState | undefined => {
    if (!planId) return undefined
    return plansState[planId]
  }

  return {
    plansState,
    updatePlanState,
    getPlanState,
    setPlansState
  }
}

