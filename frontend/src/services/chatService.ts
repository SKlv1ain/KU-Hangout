import api from './api'

export interface ChatThreadSummary {
  thread_id: number
  plan_id: number
  plan_title: string
  plan_event_time: string | null
  plan_cover_image?: string | null
  is_owner: boolean
  last_message?: string | null
  last_message_timestamp?: string | null
  last_message_sender?: string | null
}

const chatService = {
  async getThreads(): Promise<ChatThreadSummary[]> {
    return api.get('/chat/threads/')
  },
}

export default chatService
