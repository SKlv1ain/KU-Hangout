import { useCallback } from "react"
import type { NotificationItem } from "@/services/notificationsService"
import { useNotifications, getChatNotificationPlanKey } from "@/context/NotificationContext"

export function useChatUnreadCounts() {
  const {
    chatNotifications,
    chatUnreadByPlanId,
    markNotificationAsRead,
    incrementChatUnread,
    clearChatUnread,
  } = useNotifications()

  const getUnreadCount = useCallback(
    (planId: string) => {
      if (!planId) return 0
      return chatUnreadByPlanId[planId] ?? 0
    },
    [chatUnreadByPlanId]
  )

  const acknowledgePlan = useCallback(
    async (planId: string) => {
      if (!planId) return
      const pending = chatNotifications.filter(
        (notification) => !notification.is_read && getChatNotificationPlanKey(notification) === planId
      )

      if (pending.length === 0) {
        clearChatUnread(planId)
        return
      }

      await Promise.all(
        pending.map(async (notification) => {
          try {
            await markNotificationAsRead(notification.id)
          } catch (error) {
            console.error("Failed to acknowledge notification", error)
          }
        })
      )

      clearChatUnread(planId)
    },
    [chatNotifications, markNotificationAsRead, clearChatUnread]
  )

  const ingestNotification = useCallback(
    (notification: NotificationItem) => {
      if (!notification || notification.topic !== "CHAT") {
        return
      }
      const planKey = getChatNotificationPlanKey(notification)
      if (!planKey) {
        return
      }
      if (notification.is_read) {
        clearChatUnread(planKey)
      } else {
        incrementChatUnread(planKey)
      }
    },
    [incrementChatUnread, clearChatUnread]
  )

  return {
    chatUnreadByPlanId,
    getUnreadCount,
    acknowledgePlan,
    ingestNotification,
  }
}
