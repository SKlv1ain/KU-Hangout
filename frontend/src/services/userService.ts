import api from './api'

export interface UserProfile {
  id: number
  username: string
  display_name?: string | null
  role: string
  avg_rating?: number | string  // Backend DecimalField returns string
  review_count?: number
  contact?: string | null
  profile_picture_url?: string | null
  created_at?: string
}

export interface UserPlans {
  created_plans: any[]
  joined_plans: any[]
  pinned_plan_ids?: number[]
}

export interface Contribution {
  date: string
  type: 'created' | 'joined'
  plan_id: number
  plan_title: string
}

const userService = {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: number): Promise<UserProfile> {
    return api.get(`/users/${userId}/`)
  },

  /**
   * Get user profile by username
   */
  async getUserProfileByUsername(username: string): Promise<UserProfile> {
    return api.get(`/users/profile/${username}/`)
  },

  /**
   * Get user plans (created and joined)
   */
  async getUserPlans(username: string): Promise<UserPlans> {
    return api.get(`/users/${username}/plans/`)
  },

  /**
   * Get user contributions (activity timeline)
   */
  async getUserContributions(username: string): Promise<Contribution[]> {
    return api.get(`/users/${username}/contributions/`)
  },
}

export default userService

