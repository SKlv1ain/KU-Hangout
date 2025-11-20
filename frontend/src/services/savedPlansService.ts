import api from './api'
import type { Plan } from './plansService'

const savedPlansService = {
  /**
   * Save a plan for the current user
   */
  async savePlan(planId: number): Promise<void> {
    await api.post(`/plans/${planId}/save/`, {})
  },

  /**
   * Unsave a plan for the current user
   */
  async unsavePlan(planId: number): Promise<void> {
    await api.delete(`/plans/${planId}/save/`)
  },

  /**
   * Get all saved plans for the current user
   */
  async getSavedPlans(): Promise<Plan[]> {
    return api.get('/plans/saved/')
  },

  /**
   * Get only the IDs of saved plans (for quick checking)
   */
  async getSavedPlanIds(): Promise<number[]> {
    const savedPlans = await this.getSavedPlans()
    return savedPlans.map(plan => plan.id)
  },
}

export default savedPlansService

