import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import chatService from "@/services/chatService"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useAuth } from "@/context/AuthContext"
import { useChatUnreadCounts } from "@/hooks/useChatUnreadCounts"

export interface ChatMessage {
  id: string | number
  roomId: string
  sender: string
  senderUsername?: string
  senderAvatar?: string | null
  senderId?: number
  text: string
  timestamp: Date
}

export interface ChatRoom {
  planId: string
  threadId: number
  title: string
  coverImage?: string | null
  lastMessage?: string | null
  lastMessageSender?: string | null
  lastMessageTime?: Date | null
  unreadCount: number
  isOwner?: boolean
}

type MessagesByRoomId = Record<string, ChatMessage[]>

interface ChatContextValue {
  chatRooms: ChatRoom[]
  messagesByRoomId: MessagesByRoomId
  selectedRoomId: string | null
  isLoadingRooms: boolean
  isConnected: boolean
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  connectionError: string | null
  selectRoom: (roomId: string | number | null) => void
  sendMessage: (roomId: string, text: string) => boolean
  addIncomingMessage: (roomId: string, message: ChatMessage) => void
  markRoomAsRead: (roomId: string) => void
  refreshRooms: () => Promise<void>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

const CHAT_ROOMS_CACHE_KEY = "ku-hangout-chat-threads"
const PLAN_STORAGE_KEYS = new Set([
  CHAT_ROOMS_CACHE_KEY,
  "ku-hangout-plans",
  "ku-hangout-plans-state",
])

const parseServerTimestamp = (timestamp?: string | null): Date | null => {
  if (!timestamp) return null
  try {
    return new Date(timestamp.replace(" ", "T") + "+07:00")
  } catch {
    return null
  }
}

const normalizeRoomId = (roomId: string | number) => roomId.toString()

const generateMessageId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const normalizeMessage = (roomId: string, raw: any): ChatMessage => {
  let parsedTimestamp: Date
  if (raw.timestamp instanceof Date) {
    parsedTimestamp = raw.timestamp
  } else {
    parsedTimestamp = parseServerTimestamp(raw.timestamp) ?? new Date()
  }

  const senderUsername =
    raw.username ??
    raw.user_username ??
    raw.senderUsername ??
    raw.sender_username ??
    raw.user ??
    raw.sender

  const senderAvatar =
    raw.profile_picture ??
    raw.profilePicture ??
    raw.senderAvatar ??
    raw.avatar ??
    null

  return {
    id: raw.id ?? raw.message_id ?? generateMessageId(),
    roomId,
    sender: raw.user ?? raw.sender ?? senderUsername ?? "Unknown",
    senderUsername,
    senderAvatar: senderAvatar || null,
    senderId: raw.user_id ?? raw.senderId,
    text: raw.message ?? raw.text ?? "",
    timestamp: parsedTimestamp,
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { chatUnreadByPlanId, getUnreadCount, acknowledgePlan } = useChatUnreadCounts()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messagesByRoomId, setMessagesByRoomId] = useState<MessagesByRoomId>({})
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const lastErrorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setChatRooms((prev) =>
      prev.map((room) => {
        const nextUnread = chatUnreadByPlanId[room.planId] ?? 0
        if (room.unreadCount === nextUnread) {
          return room
        }
        return {
          ...room,
          unreadCount: nextUnread,
        }
      })
    )
  }, [chatUnreadByPlanId])

  const refreshRooms = useCallback(async () => {
    if (!user) {
      setChatRooms([])
      setSelectedRoomId(null)
      setMessagesByRoomId({})
      return
    }

    setIsLoadingRooms(true)
    try {
      const threads = await chatService.getThreads()
      const rooms: ChatRoom[] = threads.map((thread) => {
        const planId = normalizeRoomId(thread.plan_id)
        return {
          planId,
          threadId: thread.thread_id,
          title: thread.plan_title || `Plan ${thread.plan_id}`,
          coverImage: thread.plan_cover_image ?? null,
          lastMessage: thread.last_message ?? undefined,
          lastMessageSender: thread.last_message_sender ?? undefined,
          lastMessageTime: parseServerTimestamp(thread.last_message_timestamp),
          unreadCount: getUnreadCount(planId),
          isOwner: thread.is_owner,
        }
      })

      rooms.sort((a, b) => {
        const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0
        const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0
        return timeB - timeA
      })

      setChatRooms(rooms)

      try {
        localStorage.setItem(
          CHAT_ROOMS_CACHE_KEY,
          JSON.stringify(
            rooms.map((room) => ({
              planId: room.planId,
              title: room.title,
              coverImage: room.coverImage ?? null,
            }))
          )
        )
      } catch (storageError) {
        console.error("Failed to persist chat threads for fallback:", storageError)
      }
    } catch (error) {
      console.error("Error loading chat threads:", error)
      try {
        const cached = localStorage.getItem(CHAT_ROOMS_CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          const fallbackRooms: ChatRoom[] = parsed.map((item: any) => {
            const planId = normalizeRoomId(item.planId)
            return {
              planId,
              threadId: -1,
              title: item.title,
              coverImage: item.coverImage ?? null,
              unreadCount: getUnreadCount(planId),
            }
          })
          setChatRooms(fallbackRooms)
        }
      } catch (cacheError) {
        console.error("Error loading cached chat threads:", cacheError)
      }
    } finally {
      setIsLoadingRooms(false)
    }
  }, [user, getUnreadCount])

  useEffect(() => {
    refreshRooms()
    // Reload when window regains focus
    const handleFocus = () => refreshRooms()
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && PLAN_STORAGE_KEYS.has(event.key)) {
        refreshRooms()
      }
    }
    window.addEventListener("focus", handleFocus)
    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [refreshRooms])

  const markRoomAsRead = useCallback((roomId: string) => {
    setChatRooms((prev) =>
      prev.map((room) =>
        room.planId === roomId
          ? {
              ...room,
              unreadCount: 0,
            }
          : room
      )
    )
    void acknowledgePlan(roomId)
  }, [acknowledgePlan])

  const selectRoom = useCallback(
    (roomId: string | number | null) => {
      const normalized = roomId ? normalizeRoomId(roomId) : null
      setSelectedRoomId(normalized)
      if (normalized) {
        markRoomAsRead(normalized)
      }
    },
    [markRoomAsRead]
  )

  const addIncomingMessage = useCallback(
    (roomId: string, message: ChatMessage) => {
      setMessagesByRoomId((prev) => {
        const existing = prev[roomId] ?? []
        return {
          ...prev,
          [roomId]: [...existing, message],
        }
      })

      setChatRooms((prev) =>
        prev.map((room) =>
          room.planId === roomId
            ? {
                ...room,
                lastMessage: message.text,
                lastMessageSender: message.sender,
                lastMessageTime: message.timestamp,
                unreadCount:
                  selectedRoomId && selectedRoomId === roomId
                    ? 0
                    : (room.unreadCount ?? 0) + 1,
              }
            : room
        )
      )
    },
    [selectedRoomId]
  )

  const setIncomingHistory = useCallback((roomId: string, messages: ChatMessage[]) => {
    setMessagesByRoomId((prev) => ({
      ...prev,
      [roomId]: messages,
    }))
    markRoomAsRead(roomId)
  }, [markRoomAsRead])

  const clearConnectionError = useCallback(() => {
    if (lastErrorTimeout.current) {
      clearTimeout(lastErrorTimeout.current)
    }
    lastErrorTimeout.current = setTimeout(() => {
      setConnectionError(null)
    }, 5000)
  }, [])

  const handleWebSocketMessage = useCallback(
    (data: any) => {
      if (!selectedRoomId) return

      if (data.type === "chat_history" && Array.isArray(data.messages)) {
        const history = data.messages.map((msg: any) => normalizeMessage(selectedRoomId, msg))
        setIncomingHistory(selectedRoomId, history)
        return
      }

      if (data.type === "new_message") {
        const message = normalizeMessage(selectedRoomId, data)
        addIncomingMessage(selectedRoomId, message)
      }
    },
    [addIncomingMessage, selectedRoomId, setIncomingHistory]
  )

  const handleWebSocketError = useCallback((error: string) => {
    if (error && !error.toLowerCase().includes("reconnect")) {
      setConnectionError(error)
      clearConnectionError()
    }
  }, [clearConnectionError])

  const handleWebSocketConnect = useCallback(() => {
    setConnectionError(null)
  }, [])

  const handleWebSocketDisconnect = useCallback(() => {
    // no-op for now, state handled via hook
  }, [])

  const {
    isConnected,
    connectionStatus,
    sendMessage: sendMessageThroughSocket,
  } = useWebSocket({
    planId: selectedRoomId,
    onMessage: handleWebSocketMessage,
    onError: handleWebSocketError,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect,
  })

  const sendMessage = useCallback(
    (roomId: string, text: string) => {
      if (!text.trim() || !roomId) return false
      if (roomId !== selectedRoomId) {
        console.warn("Attempted to send message to non-selected room", roomId)
        return false
      }
      return sendMessageThroughSocket(text)
    },
    [selectedRoomId, sendMessageThroughSocket]
  )

  const value = useMemo(
    () => ({
      chatRooms,
      messagesByRoomId,
      selectedRoomId,
      isLoadingRooms,
      isConnected,
      connectionStatus,
      connectionError,
      selectRoom,
      sendMessage,
      addIncomingMessage,
      markRoomAsRead,
      refreshRooms,
    }),
    [
      chatRooms,
      messagesByRoomId,
      selectedRoomId,
      isLoadingRooms,
      isConnected,
      connectionStatus,
      connectionError,
      selectRoom,
      sendMessage,
      addIncomingMessage,
      markRoomAsRead,
      refreshRooms,
    ]
  )

  useEffect(() => {
    return () => {
      if (lastErrorTimeout.current) {
        clearTimeout(lastErrorTimeout.current)
      }
    }
  }, [])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
