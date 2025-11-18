import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import savedPlansService from "@/services/savedPlansService"

type PlanState = {
  isJoined: boolean
  isLiked: boolean
  isSaved: boolean
}

type PlansState = Record<string | number, PlanState>

export function usePlanState() {
  const { user } = useAuth()
  const [plansState, setPlansState] = useState<PlansState>(() => {
    // Load from localStorage on mount (user-specific)
    const storageKey = user ? `ku-hangout-plans-state-${user.id}` : 'ku-hangout-plans-state'
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading plans state from localStorage:', error)
    }
    return {}
  })

  // Load saved plans from API on mount (if user is authenticated)
  useEffect(() => {
    if (!user) {
      // Clear saved state if user logs out
      setPlansState(prev => {
        const newState = { ...prev }
        Object.keys(newState).forEach(key => {
          newState[key] = { ...newState[key], isSaved: false }
        })
        return newState
      })
      return
    }

    // Load saved plan IDs from API
    const loadSavedPlans = async () => {
      try {
        const savedPlanIds = await savedPlansService.getSavedPlanIds()
        setPlansState(prev => {
          const newState = { ...prev }
          // Mark all saved plans
          savedPlanIds.forEach(planId => {
            newState[planId] = {
              ...newState[planId],
              isJoined: newState[planId]?.isJoined || false,
              isLiked: newState[planId]?.isLiked || false,
              isSaved: true
            }
          })
          // Unmark plans that are no longer saved
          Object.keys(newState).forEach(key => {
            const planId = typeof key === 'string' ? parseInt(key, 10) : key
            if (!isNaN(planId) && !savedPlanIds.includes(planId)) {
              newState[key] = {
                ...newState[key],
                isSaved: false
              }
            }
          })
          return newState
        })
      } catch (error) {
        console.error('Error loading saved plans from API:', error)
      }
    }

    loadSavedPlans()
  }, [user])

  // Save to localStorage whenever plansState changes (user-specific)
  useEffect(() => {
    const storageKey = user ? `ku-hangout-plans-state-${user.id}` : 'ku-hangout-plans-state'
    try {
      // Only save isJoined and isLiked to localStorage, not isSaved (it comes from API)
      const stateToSave: PlansState = {}
      Object.keys(plansState).forEach(key => {
        stateToSave[key] = {
          isJoined: plansState[key].isJoined,
          isLiked: plansState[key].isLiked,
          isSaved: false // Don't persist isSaved in localStorage
        }
      })
      localStorage.setItem(storageKey, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Error saving plans state to localStorage:', error)
    }
  }, [plansState, user])

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

