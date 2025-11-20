import api from './api'

export interface SubmitRatingResponse {
  id: number
  rating: number
  comment: string | null
  leader_id: number
  created_at: string
  updated_stats: {
    avg_rating: number
    review_count: number
  }
}

const reviewsService = {
  /**
   * Submit or update a rating for a user
   * @param leaderId - The user ID being rated
   * @param rating - Rating value (1-5)
   * @param comment - Optional comment
   */
  async submitRating(
    leaderId: number,
    rating: number,
    comment?: string
  ): Promise<SubmitRatingResponse> {
    return api.post('/api/reviews/', {
      leader_id: leaderId,
      rating,
      comment: comment || null,
    })
  },

  /**
   * Get current user's rating for a specific user
   * @param leaderId - The user ID to get rating for
   * @returns Rating object if exists, null otherwise
   */
  async getUserRating(leaderId: number): Promise<{ rating: number; comment?: string } | null> {
    try {
      const response = await api.get('/api/reviews/', { params: { leader_id: leaderId } })
      // api.get returns null for 404, so check if response exists
      if (response && response.rating !== undefined) {
        return { rating: response.rating, comment: response.comment || undefined }
      }
      return null
    } catch (error: any) {
      // Should not reach here for 404 (handled in api.get), but handle other errors
      console.warn('[reviewsService] Error getting user rating:', error)
      return null
    }
  },
}

export default reviewsService

