import api from './api'

export interface NotificationActor {
  id: number
  username: string
  display_name?: string | null
  profile_picture?: string | null
}

export interface NotificationItem {
  id: number
  title: string
  message: string
  notification_type: string
  notification_type_display?: string
  topic: string
  topic_display?: string
  plan: number | null
  plan_id?: number | null
  plan_title?: string | null
  plan_cover_image?: string | null
  chat_thread: number | null
  chat_thread_id?: number | null
  chat_message: number | null
  chat_message_id?: number | null
  actor?: NotificationActor | null
  action_url?: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  read_at?: string | null
  created_at: string
  updated_at: string
  is_deleted: boolean
}

export interface UnreadCountsByTopic {
  [topic: string]: number
}

export interface NotificationListResponse {
  message: string
  status_code: number
  count: number
  page: number
  page_size: number
  has_next: boolean
  unread_count: number
  unread_counts_by_topic?: UnreadCountsByTopic
  notifications: NotificationItem[]
}

export interface NotificationListParams {
  page?: number
  pageSize?: number
  limit?: number
  unreadOnly?: boolean
  topic?: string
}

const notificationsService = {
  async list(params: NotificationListParams = {}): Promise<NotificationListResponse> {
    const query: Record<string, string | number> = {}

    if (typeof params.page === 'number') {
      query.page = params.page
    }

    if (typeof params.pageSize === 'number') {
      query.page_size = params.pageSize
    } else if (typeof params.limit === 'number') {
      query.page_size = params.limit
    }

    if (typeof params.unreadOnly === 'boolean') {
      query.unread_only = params.unreadOnly ? 'true' : 'false'
    }

    if (params.topic) {
      query.topic = params.topic
    }

    const data = await api.get('/notifications/', { params: query })
    return data as NotificationListResponse
  },

  async markAsRead(notificationId: number) {
    return api.patch(`/notifications/${notificationId}/read/`, {})
  },

  async markAllRead(params: { topic?: string } = {}) {
    const payload: Record<string, string> = {}
    if (params.topic) {
      payload.topic = params.topic
    }
    return api.post('/notifications/mark-all-read/', payload)
  },

  async deleteNotification(notificationId: number) {
    return api.delete(`/notifications/${notificationId}/`)
  },

  async clearNotifications(params: { topic?: string } = {}) {
    const payload: Record<string, string> = {}
    if (params.topic) {
      payload.topic = params.topic
    }
    return api.post('/notifications/clear/', payload)
  },
}

export default notificationsService
