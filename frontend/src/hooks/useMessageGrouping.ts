import { useMemo } from "react"
import type { ChatMessage } from "@/context/ChatContext"

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

      return {
        ...message,
        isOwn,
        showAvatar: !isOwn && !sameAsPrevious,
        showSenderLabel: !sameAsPrevious,
        isLastInGroup: !sameAsNext,
      }
    })
  }, [messages, currentUserId])
}
