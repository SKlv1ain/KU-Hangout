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
  async leavePlan(planId: number): Promise<JoinPlanResponse> {
    return api.delete(`/plans/${planId}/join/`)
  },
}

export default plansService

