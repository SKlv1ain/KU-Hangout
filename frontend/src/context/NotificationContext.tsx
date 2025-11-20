import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { useNotificationSocket, type NotificationSocketStatus } from '@/hooks/useNotificationSocket'
import notificationsService, { type NotificationItem, type UnreadCountsByTopic } from '@/services/notificationsService'

import { useAuth } from './AuthContext'

type NotificationTopic = NotificationItem['topic']

interface NotificationContextValue {
  notifications: NotificationItem[] // All topics (legacy)
  systemNotifications: NotificationItem[]
  chatNotifications: NotificationItem[]
  unreadCount: number
  systemUnreadCount: number
  chatUnreadCount: number
  loading: boolean
  error: string | null
  socketStatus: NotificationSocketStatus
  markAllLoading: boolean
  refresh: () => Promise<void>
  markNotificationAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: (topic?: NotificationTopic) => Promise<void>
  deleteNotification: (notificationId: number) => Promise<void>
  clearNotifications: (topic?: NotificationTopic) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const MAX_NOTIFICATIONS = 25

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const notificationsRef = useRef<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [topicUnreadCounts, setTopicUnreadCounts] = useState<UnreadCountsByTopic>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markAllLoading, setMarkAllLoading] = useState(false)

  const setNotificationsWithRef = useCallback((value: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])) => {
    setNotifications((prev) => {
      const next = typeof value === 'function' ? (value as (items: NotificationItem[]) => NotificationItem[])(prev) : value
      notificationsRef.current = next
      return next
    })
  }, [])

  const applyServerUnreadCounts = useCallback((total?: number, perTopic?: UnreadCountsByTopic) => {
    if (typeof total === 'number') {
      setUnreadCount(total)
    }
    if (perTopic && typeof perTopic === 'object') {
      setTopicUnreadCounts(perTopic)
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false)
      setError(null)
      setUnreadCount(0)
      setTopicUnreadCounts({})
      setNotificationsWithRef([])
      return
    }

    setLoading(true)
    try {
      const response = await notificationsService.list({ page: 1, pageSize: MAX_NOTIFICATIONS })
      const sorted = (response.notifications ?? [])
        .map((notification) => ({ ...notification, metadata: notification.metadata ?? {} }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setNotificationsWithRef(sorted)
      applyServerUnreadCounts(response.unread_count, response.unread_counts_by_topic)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load notifications.'
      console.error(message, err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, setNotificationsWithRef, applyServerUnreadCounts])

  useEffect(() => {
    if (!user) {
      setNotificationsWithRef([])
      setUnreadCount(0)
      setError(null)
      return
    }

    refresh().catch(() => null)
  }, [user, refresh, setNotificationsWithRef])

  const markNotificationAsRead = useCallback(
    async (notificationId: number) => {
      if (!user) {
        return
      }

      const existing = notificationsRef.current.find((item) => item.id === notificationId)
      if (existing?.is_read) {
        return
      }

      try {
        const response = await notificationsService.markAsRead(notificationId)
        setNotificationsWithRef((prev) =>
          prev.map((item) =>
            item.id === notificationId
              ? { ...item, is_read: true, read_at: new Date().toISOString() }
              : item
          )
        )

        if (response && typeof response === 'object') {
          applyServerUnreadCounts(response.unread_count, response.unread_counts_by_topic)
        } else if (existing && !existing.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
          if (existing.topic) {
            setTopicUnreadCounts((prev) => {
              const next = { ...prev }
              const current = next[existing.topic] ?? 0
              next[existing.topic] = Math.max(0, current - 1)
              return next
            })
          }
        }
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update notification.'
        setError(message)
        throw err
      }
    },
    [user, setNotificationsWithRef, applyServerUnreadCounts]
  )

  const markAllAsRead = useCallback(async (topic?: NotificationTopic) => {
    if (!user) {
      return
    }

    setMarkAllLoading(true)
    try {
      const response = await notificationsService.markAllRead({ topic })
      setNotificationsWithRef((prev) =>
        prev.map((item) => {
          if (item.is_read) {
            return item
          }
          if (topic && item.topic !== topic) {
            return item
          }
          return { ...item, is_read: true, read_at: new Date().toISOString() }
        })
      )
      const unreadFromServer = typeof response?.unread_count === 'number' ? response.unread_count : undefined
      applyServerUnreadCounts(unreadFromServer, response?.unread_counts_by_topic)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to mark notifications as read.'
      setError(message)
      throw err
    } finally {
      setMarkAllLoading(false)
    }
  }, [user, setNotificationsWithRef, applyServerUnreadCounts])

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      if (!user) {
        return
      }

      const target = notificationsRef.current.find((item) => item.id === notificationId)

      try {
        const response = await notificationsService.deleteNotification(notificationId)
        setNotificationsWithRef((prev) => prev.filter((item) => item.id !== notificationId))

        if (response && typeof response === 'object') {
          applyServerUnreadCounts(response.unread_count, response.unread_counts_by_topic)
        } else if (target && !target.is_read && target.topic) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
          setTopicUnreadCounts((prev) => {
            const next = { ...prev }
            const current = next[target.topic] ?? 0
            next[target.topic] = Math.max(0, current - 1)
            return next
          })
        }
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to delete notification.'
        setError(message)
        throw err
      }
    },
    [user, setNotificationsWithRef, applyServerUnreadCounts]
  )

  const clearNotifications = useCallback(
    async (topic?: NotificationTopic) => {
      if (!user) {
        return
      }

      try {
        const response = await notificationsService.clearNotifications({ topic })

        setNotificationsWithRef((prev) => {
          if (!topic) {
            return []
          }
          return prev.filter((item) => item.topic !== topic)
        })

        if (response && typeof response === 'object') {
          applyServerUnreadCounts(response.unread_count, response.unread_counts_by_topic)
        } else {
          // Fallback adjustment if server did not include updated counts
          setUnreadCount((prev) => (topic ? prev - (topicUnreadCounts?.[topic] ?? 0) : 0))
          if (topic) {
            setTopicUnreadCounts((prev) => {
              const next = { ...prev }
              next[topic] = 0
              return next
            })
          } else {
            setTopicUnreadCounts({})
          }
        }
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to clear notifications.'
        setError(message)
        throw err
      }
    },
    [user, setNotificationsWithRef, applyServerUnreadCounts, topicUnreadCounts]
  )

  const handleRealtimeNotification = useCallback(
    (incoming: NotificationItem) => {
      if (!incoming) {
        return
      }

      const normalized: NotificationItem = { ...incoming, metadata: incoming.metadata ?? {} }
      const existing = notificationsRef.current.find((item) => item.id === normalized.id)

      setNotificationsWithRef((prev) => {
        const filtered = prev.filter((item) => item.id !== normalized.id)
        const merged = [normalized, ...filtered]
        merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        return merged.slice(0, MAX_NOTIFICATIONS)
      })

      if (!normalized.is_read) {
        if (!existing || existing.is_read) {
          setUnreadCount((prev) => prev + 1)
          if (normalized.topic) {
            setTopicUnreadCounts((prev) => ({
              ...prev,
              [normalized.topic]: (prev?.[normalized.topic] ?? 0) + 1,
            }))
          }
        }
      } else if (existing && !existing.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
        if (existing.topic) {
          setTopicUnreadCounts((prev) => ({
            ...prev,
            [existing.topic]: Math.max(0, (prev?.[existing.topic] ?? 0) - 1),
          }))
        }
      }
    },
    [setNotificationsWithRef]
  )

  const handleSocketError = useCallback((message?: string) => {
    if (message) {
      console.error(message)
      setError(message)
    }
  }, [])

  const socketStatus = useNotificationSocket({
    enabled: Boolean(user),
    onNotification: handleRealtimeNotification,
    onError: handleSocketError,
  })

  const chatNotifications = useMemo(
    () => notifications.filter((notification) => notification.topic === 'CHAT'),
    [notifications]
  )
  const systemNotifications = useMemo(
    () => notifications.filter((notification) => notification.topic !== 'CHAT'),
    [notifications]
  )
  const chatUnreadCount = topicUnreadCounts?.CHAT ?? 0
  const systemUnreadCount = Math.max(unreadCount - chatUnreadCount, 0)

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      systemNotifications,
      chatNotifications,
      unreadCount,
      systemUnreadCount,
      chatUnreadCount,
      loading,
      error,
      socketStatus,
      markAllLoading,
      refresh,
      markNotificationAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    }),
    [
      notifications,
      systemNotifications,
      chatNotifications,
      unreadCount,
      systemUnreadCount,
      chatUnreadCount,
      loading,
      error,
      socketStatus,
      markAllLoading,
      refresh,
      markNotificationAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    ]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
