import { useMemo } from "react"
import type { ChatMessage } from "@/context/ChatContext"
import { FOUR_MINUTES_MS, isLastVisibleAvatar } from "./useAvatarVisibility"

export interface GroupedMessage extends ChatMessage {
  isOwn: boolean
  showAvatar: boolean
  showSenderLabel: boolean
  isLastInGroup: boolean
}

export function useMessageGrouping(messages: ChatMessage[], currentUserId?: number | string | null) {
  return useMemo<GroupedMessage[]>(() => {
    return messages.map((message, index) => {
      const previous = messages[index - 1]
      const next = messages[index + 1]
      const sameAsPrevious = previous ? previous.senderId === message.senderId : false
      const sameAsNext = next ? next.senderId === message.senderId : false
      const isOwn = currentUserId ? String(message.senderId) === String(currentUserId) : false

      const currentTs = message.timestamp instanceof Date ? message.timestamp.getTime() : null
      const prevTs =
        previous && previous.timestamp instanceof Date ? previous.timestamp.getTime() : null
      const nextTs = next && next.timestamp instanceof Date ? next.timestamp.getTime() : null

      const gapWithPrev = prevTs !== null && currentTs !== null ? currentTs - prevTs : 0
      const gapWithNext = nextTs !== null && currentTs !== null ? nextTs - currentTs : 0

      const gapBreakPrev = previous ? gapWithPrev >= FOUR_MINUTES_MS : false
      const gapBreakNext = next ? gapWithNext >= FOUR_MINUTES_MS : false

      const sameGroupPrev = sameAsPrevious && !gapBreakPrev
      const sameGroupNext = sameAsNext && !gapBreakNext

      return {
        ...message,
        isOwn,
        showAvatar: !isOwn && isLastVisibleAvatar(messages, index),
        showSenderLabel: !sameGroupPrev,
        isLastInGroup: !sameGroupNext,
      }
    })
  }, [messages, currentUserId])
}
