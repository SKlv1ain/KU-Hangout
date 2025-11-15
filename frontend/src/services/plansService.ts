import api from './api'

export interface Plan {
  id: number
  title: string
  description: string
  location: string
  lat?: number | null
  lng?: number | null
  leader_id: number
  creator_username: string
  event_time: string
  max_people: number
  people_joined: number
  create_at: string
  tags?: string[]
  tags_display?: Array<{ id: number; name: string }>
  is_expired: boolean
  time_until_event: string
  joined?: boolean
  role?: 'LEADER' | 'MEMBER' | null
}

export interface CreatePlanPayload {
  title: string
  description: string
  location: string
  lat?: number | null
  lng?: number | null
  event_time: string // ISO 8601 format
  max_people: number
  tags?: string[]
}

export interface JoinPlanResponse {
  id: number
  joined: boolean
  role: 'LEADER' | 'MEMBER'
  people_joined: number
  max_people: number
}

// LeavePlanResponse is the same as Plan since backend returns full plan data
export type LeavePlanResponse = Plan

export interface PlansListParams {
  filter?: 'hot' | 'new' | 'expiring' | 'all'
  category?: string
  search?: string
}

const plansService = {
  /**
   * Get list of plans with optional filters
   */
  async getPlans(params?: PlansListParams): Promise<Plan[]> {
    return api.get('/homepage/list/', { params })
  },

  /**
   * Get a single plan by ID
   */
  async getPlanById(planId: number): Promise<Plan> {
    return api.get(`/homepage/${planId}/`)
  },

  /**
   * Create a new plan
   */
  async createPlan(payload: CreatePlanPayload): Promise<Plan> {
    return api.post('/plans/create/', payload)
  },

  /**
   * Join a plan
   */
  async joinPlan(planId: number): Promise<JoinPlanResponse> {
    return api.post(`/plans/${planId}/join/`, {})
  },

  /**
   * Leave a plan
   */
  async leavePlan(planId: number): Promise<LeavePlanResponse> {
    return api.delete(`/plans/${planId}/join/`)
  },

  /**
   * Delete a plan (only owner can delete)
   */
  async deletePlan(planId: number): Promise<{ message: string }> {
    return api.delete(`/plans/${planId}/`)
  },

  /**
   * Get plan membership info (includes joined status and role)
   */
  async getPlanMembership(planId: number): Promise<Plan & { joined: boolean; role: 'LEADER' | 'MEMBER' | null }> {
    return api.get(`/homepage/${planId}/`)
  },
}

export default plansService

