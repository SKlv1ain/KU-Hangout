import type { ChatMessage } from "@/context/ChatContext"

const FOUR_MINUTES_MS = 4 * 60 * 1000

const getSenderKey = (message?: ChatMessage) => {
  if (!message) return null
  if (message.senderId !== undefined && message.senderId !== null) {
    return String(message.senderId)
  }
  if (message.senderUsername) return message.senderUsername
  return message.sender
}

const getTimestamp = (value?: Date) => {
  if (!value || !(value instanceof Date)) return null
  return value.getTime()
}

export function isLastVisibleAvatar(messages: ChatMessage[], index: number) {
  const current = messages[index]
  if (!current) return false

  const prev = messages[index - 1]
  const next = messages[index + 1]

  const currentSender = getSenderKey(current)
  const prevSender = getSenderKey(prev)
  const nextSender = getSenderKey(next)

  const currentTs = getTimestamp(current.timestamp)
  const prevTs = getTimestamp(prev?.timestamp)
  const nextTs = getTimestamp(next?.timestamp)

  const gapWithPrev = prevTs !== null && currentTs !== null ? currentTs - prevTs : null
  const gapWithNext = nextTs !== null && currentTs !== null ? nextTs - currentTs : null

  const senderChangedNext = nextSender !== null && nextSender !== currentSender
  const senderChangedPrev = prevSender !== null && prevSender !== currentSender

  const largeGapPrev = gapWithPrev !== null && gapWithPrev >= FOUR_MINUTES_MS
  const largeGapNext = gapWithNext !== null && gapWithNext >= FOUR_MINUTES_MS

  const isEndOfList = !next
  const isLastOfSender = senderChangedNext || largeGapNext || isEndOfList

  return isLastOfSender || senderChangedPrev || largeGapPrev || isEndOfList
}

export { FOUR_MINUTES_MS }
