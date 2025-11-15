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

const userService = {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: number): Promise<UserProfile> {
    return api.get(`/users/${userId}/`)
  },
}

export default userService

