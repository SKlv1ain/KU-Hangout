import api from './api'
import type { Plan } from './plansService'

const pinnedPlansService = {
  /**
   * Pin a plan for the current user
   */
  async pinPlan(planId: number): Promise<void> {
    try {
      const response = await api.post(`/plans/${planId}/pin/`, {})
      console.log("[pinnedPlansService] Pin plan response:", response)
      return response
    } catch (error: any) {
      console.error("[pinnedPlansService] Error pinning plan:", error)
      throw error
    }
  },

  /**
   * Unpin a plan for the current user
   */
  async unpinPlan(planId: number): Promise<void> {
    try {
      const response = await api.delete(`/plans/${planId}/pin/`)
      console.log("[pinnedPlansService] Unpin plan response:", response)
      // Backend returns 200 OK with message even if plan was not pinned (idempotent)
      // This is not an error, so we don't throw
      return response
    } catch (error: any) {
      console.error("[pinnedPlansService] Error unpinning plan:", error)
      // Check if it's the idempotent message (not a real error)
      if (error?.message?.includes("Plan was not pinned")) {
        console.log("[pinnedPlansService] Plan was already unpinned (idempotent)")
        return // Not an error
      }
      throw error
    }
  },

  /**
   * Get all pinned plans for the current user
   */
  async getPinnedPlans(): Promise<Plan[]> {
    return api.get('/plans/pinned/')
  },

  /**
   * Get only the IDs of pinned plans (for quick checking)
   */
  async getPinnedPlanIds(): Promise<number[]> {
    const pinnedPlans = await this.getPinnedPlans()
    return pinnedPlans.map(plan => plan.id)
  },
}

export default pinnedPlansService

