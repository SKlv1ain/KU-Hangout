import type { ChatRoom } from "@/context/ChatContext"

export const getPlanInitials = (title?: string | null) => {
  if (!title) return "PL"
  const parts = title.trim().split(/\s+/)
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "PL"
}

export const selectRecentRooms = (rooms: ChatRoom[]) => {
  return [...rooms].sort((a, b) => {
    const unreadDiff = (b.unreadCount ?? 0) - (a.unreadCount ?? 0)
    if (unreadDiff !== 0) return unreadDiff
    const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0
    const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0
    return timeB - timeA
  })
}
