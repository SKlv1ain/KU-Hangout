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
  bio?: string | null
  website?: string | null
  social_links?: string[] | null
}

export interface UpdateUserProfileInput {
  display_name?: string | null
  bio?: string | null
  website?: string | null
  social_links?: string[]
  contact?: string | null
  profile_picture?: File | null
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

  async updateUserProfile(username: string, input: UpdateUserProfileInput): Promise<UserProfile> {
    const hasFile = input.profile_picture instanceof File
    if (hasFile) {
      const formData = new FormData()
      if (input.display_name !== undefined) formData.append('display_name', input.display_name ?? '')
      if (input.bio !== undefined) formData.append('bio', input.bio ?? '')
      if (input.website !== undefined) formData.append('website', input.website ?? '')
      if (input.social_links !== undefined) {
        formData.append('social_links', JSON.stringify(input.social_links))
      }
      if (input.contact !== undefined) formData.append('contact', input.contact ?? '')
      if (input.profile_picture) formData.append('profile_picture', input.profile_picture)
      return api.patch(`/users/profile/${username}/`, formData)
    }

    const payload: Record<string, unknown> = {}
    if (input.display_name !== undefined) payload.display_name = input.display_name
    if (input.bio !== undefined) payload.bio = input.bio
    if (input.website !== undefined) payload.website = input.website
    if (input.social_links !== undefined) payload.social_links = input.social_links
    if (input.contact !== undefined) payload.contact = input.contact

    return api.patch(`/users/profile/${username}/`, payload)
  },
}

export default userService
