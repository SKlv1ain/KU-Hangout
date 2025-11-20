import { useState, useEffect, useCallback } from "react"
import plansService, { type Plan } from "@/services/plansService"
import type { PlanDetailData } from "@/components/home/plan-detail-panel"
import { convertPlansArray } from "@/lib/planUtils"

type FilterParams = {
  filter?: 'hot' | 'new' | 'expiring' | 'all'
  category?: string
  search?: string
}

export function usePlans(
  filterParams: FilterParams,
  setPlanOwners: (updater: (prev: Record<string | number, number>) => Record<string | number, number>) => void
) {
  const [plans, setPlans] = useState<PlanDetailData[]>([])
  const [loading, setLoading] = useState(true)

  const reloadPlans = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true)
      }

      const backendPlans = await plansService.getPlans(filterParams)
      const convertedPlans = convertPlansArray(backendPlans, setPlanOwners)
      setPlans(convertedPlans)

      return convertedPlans
    } catch (error) {
      console.error('Error reloading plans:', error)
      throw error
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [filterParams, setPlanOwners])

  // Load plans from API when filterParams change
  useEffect(() => {
    reloadPlans(true).catch(() => {
      // On error, keep existing plans or set empty array
      setPlans([])
    })
  }, [reloadPlans])

  return {
    plans,
    setPlans,
    loading,
    reloadPlans
  }
}

