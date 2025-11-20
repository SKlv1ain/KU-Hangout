"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { SidebarLayout } from "@/components/home/side-bar"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useAuth } from "@/context/AuthContext"
import chatService from "@/services/chatService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: string | number
  sender: string
  senderId?: number
  text: string
  timestamp: Date | string
}

interface ChatRoom {
  planId: string | number
  threadId: number
  title: string
  coverImage?: string | null
  lastMessage?: string | null
  lastMessageSender?: string | null
  lastMessageTime?: Date
  unreadCount?: number
  isOwner?: boolean
}

const getPlanInitials = (title?: string | null) => {
  if (!title) return "PL"
  const parts = title.trim().split(/\s+/)
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "PL"
}

export default function MessagePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('planId')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(planId)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const loadChatRooms = useCallback(async () => {
    try {
      const threads = await chatService.getThreads()
      const rooms: ChatRoom[] = threads.map((thread) => ({
        planId: thread.plan_id,
        threadId: thread.thread_id,
        title: thread.plan_title || `Plan ${thread.plan_id}`,
        coverImage: thread.plan_cover_image ?? null,
        lastMessage: thread.last_message ?? null,
        lastMessageSender: thread.last_message_sender ?? null,
        lastMessageTime: thread.last_message_timestamp ? new Date(thread.last_message_timestamp) : undefined,
        unreadCount: 0,
        isOwner: thread.is_owner,
      }))

      rooms.sort((a, b) => {
        const timeA = a.lastMessageTime ? a.lastMessageTime.getTime() : 0
        const timeB = b.lastMessageTime ? b.lastMessageTime.getTime() : 0
        return timeB - timeA
      })

      setChatRooms(rooms)

      // Persist minimal info for fallback scenarios
      try {
        localStorage.setItem('ku-hangout-chat-threads', JSON.stringify(rooms.map(room => ({
          planId: room.planId,
          title: room.title,
          coverImage: room.coverImage ?? null,
        }))))
      } catch (storageError) {
        console.error('Failed to persist chat threads for fallback:', storageError)
      }
    } catch (error) {
      console.error('Error loading chat threads:', error)

      // Fallback to cached data if available
      try {
        const cached = localStorage.getItem('ku-hangout-chat-threads')
        if (cached) {
          const parsed = JSON.parse(cached)
          const fallbackRooms: ChatRoom[] = parsed.map((item: any) => ({
            planId: item.planId,
            threadId: -1,
            title: item.title,
            coverImage: item.coverImage ?? null,
            unreadCount: 0,
          }))
          setChatRooms(fallbackRooms)
        }
      } catch (cacheError) {
        console.error('Error loading cached chat threads:', cacheError)
      }
    }
  }, [])

  useEffect(() => {
    loadChatRooms()

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'ku-hangout-plans' || event.key === 'ku-hangout-plans-state') {
        loadChatRooms()
      }
    }

    const handleFocus = () => {
      loadChatRooms()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadChatRooms])

  // Update selected plan when planId or chat rooms change
  useEffect(() => {
    if (planId) {
      const roomExists = chatRooms.some((room) => room.planId.toString() === planId)

      if (!roomExists && chatRooms.length > 0) {
        const firstRoom = chatRooms[0]
        setSelectedPlanId(firstRoom.planId.toString())
        navigate(`/messages?planId=${firstRoom.planId}`, { replace: true })
        loadMessagesForPlan()
        return
      }

      if (roomExists && selectedPlanId !== planId) {
        setSelectedPlanId(planId)
        loadMessagesForPlan()
      }
      return
    }

    if (chatRooms.length > 0) {
      const hasSelectedRoom = selectedPlanId
        ? chatRooms.some((room) => room.planId.toString() === selectedPlanId)
        : false

      if (!hasSelectedRoom) {
        const firstRoom = chatRooms[0]
        setSelectedPlanId(firstRoom.planId.toString())
        navigate(`/messages?planId=${firstRoom.planId}`, { replace: true })
        loadMessagesForPlan()
      }
    } else if (selectedPlanId) {
      setSelectedPlanId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, chatRooms, selectedPlanId])

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'chat_history' && data.messages) {
      // Convert backend message format to frontend format
      // Backend sends timestamp as "YYYY-MM-DD HH:MM:SS" (Bangkok time)
      const formattedMessages: Message[] = data.messages.map((msg: any) => {
        // Parse timestamp from "YYYY-MM-DD HH:MM:SS" format
        let timestamp: Date
        try {
          // Backend sends in format "YYYY-MM-DD HH:MM:SS"
          timestamp = new Date(msg.timestamp.replace(' ', 'T') + '+07:00') // Bangkok timezone
        } catch (e) {
          timestamp = new Date()
        }
        
        return {
          id: msg.id,
          sender: msg.user,
          senderId: msg.user_id,
          text: msg.message,
          timestamp
        }
      })
      setMessages(formattedMessages)
    } else if (data.type === 'new_message') {
      // Add new message to the list
      // Backend sends timestamp as "YYYY-MM-DD HH:MM:SS" (Bangkok time)
      let timestamp: Date
      try {
        if (data.timestamp) {
          timestamp = new Date(data.timestamp.replace(' ', 'T') + '+07:00') // Bangkok timezone
        } else {
          timestamp = new Date()
        }
      } catch (e) {
        timestamp = new Date()
      }
      
      const newMessage: Message = {
        id: data.message_id || Date.now(),
        sender: data.user || 'Unknown',
        senderId: data.user_id,
        text: data.message || '',
        timestamp
      }
      setMessages((prev) => [...prev, newMessage])
      
      // Update last message in chat rooms
      setChatRooms((prev) =>
        prev.map((room) =>
          room.planId.toString() === selectedPlanId
            ? {
                ...room,
                lastMessage: newMessage.text,
                lastMessageTime: timestamp,
              }
            : room
        )
      )
    }
  }, [selectedPlanId])

  const handleWebSocketError = useCallback((error: string) => {
    // Only show error if connection is actually disconnected
    // Don't show error during normal reconnection attempts
    if (error && !error.includes('reconnect')) {
      console.error('WebSocket error:', error)
      setConnectionError(error)
      // Clear error after 5 seconds
      setTimeout(() => {
        setConnectionError(null)
      }, 5000)
    }
  }, [])

  const handleWebSocketConnect = useCallback(() => {
    setConnectionError(null)
    console.log('WebSocket connected successfully')
  }, [])

  const handleWebSocketDisconnect = useCallback(() => {
    // Only log disconnect if we're not in the middle of reconnecting
    // This prevents showing "disconnected" message during normal reconnection
    // The connection status will be updated by the hook itself
  }, [])

  // Initialize WebSocket connection
  const { isConnected, connectionStatus, sendMessage } = useWebSocket({
    planId: selectedPlanId,
    onMessage: handleWebSocketMessage,
    onError: handleWebSocketError,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect,
  })

  const loadMessagesForPlan = () => {
    // Messages will be loaded via WebSocket when connection is established
    // Clear messages while connecting
    setMessages([])
  }

  const handleSelectRoom = (roomPlanId: string | number) => {
    setSelectedPlanId(roomPlanId.toString())
    navigate(`/messages?planId=${roomPlanId}`)
    loadMessagesForPlan()
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return

    const success = sendMessage(inputMessage)
    if (success) {
      setInputMessage("")
    } else {
      setConnectionError('Failed to send message. Please check your connection.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectedRoom = chatRooms.find(room => room.planId.toString() === selectedPlanId)

  return (
    <SidebarLayout contentClassName="h-screen bg-background overflow-hidden">
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex flex-1 overflow-hidden divide-x divide-border" style={{ height: 'calc(100vh - 4rem)', maxHeight: 'calc(100vh - 4rem)' }}>
          {/* Left Sidebar - Chat Rooms List (30%) */}
          <div className="w-[30%] flex flex-col border-r border-border flex-shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-semibold">Chat Rooms</h2>
              <p className="text-sm text-muted-foreground">{chatRooms.length} active rooms</p>
            </div>

            {/* Chat Rooms List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {chatRooms.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2 p-4">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No chat rooms yet</p>
                    <p className="text-xs text-muted-foreground">Join a plan to start chatting!</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {chatRooms.map((room) => (
                    <button
                      key={room.planId}
                      onClick={() => handleSelectRoom(room.planId)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-accent transition-colors",
                        selectedPlanId === room.planId.toString() && "bg-accent border-l-2 border-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          {room.coverImage && (
                            <AvatarImage src={room.coverImage} alt={room.title} />
                          )}
                          <AvatarFallback>{getPlanInitials(room.title)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{room.title}</h3>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {room.lastMessage
                                  ? room.lastMessageSender
                                    ? `${room.lastMessageSender}: ${room.lastMessage}`
                                    : room.lastMessage
                                  : "No messages yet"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {room.lastMessageTime
                                  ? room.lastMessageTime.toLocaleString()
                                  : ""}
                              </p>
                            </div>
                            {room.unreadCount && room.unreadCount > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 flex-shrink-0">
                                {room.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Chat Interface (70%) */}
          <div className="flex-[70%] flex flex-col min-w-0">
            {selectedPlanId && selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12">
                      {selectedRoom.coverImage && (
                        <AvatarImage src={selectedRoom.coverImage} alt={selectedRoom.title} />
                      )}
                      <AvatarFallback>{getPlanInitials(selectedRoom.title)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold truncate">{selectedRoom.title}</h1>
                        {isConnected ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isConnected ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                      </p>
                      {connectionError && (
                        <p className="text-xs text-destructive mt-1">{connectionError}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-2">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                        <p className="text-xs text-muted-foreground">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${user && message.senderId === user.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg p-3",
                            user && message.senderId === user.id
                              ? "bg-primary text-primary-foreground"
                              : message.sender === "System"
                              ? "bg-muted text-muted-foreground"
                              : "bg-accent"
                          )}
                        >
                          <div className="text-xs font-semibold mb-1">{message.sender}</div>
                          <div className="text-sm">{message.text}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp instanceof Date
                              ? message.timestamp.toLocaleTimeString()
                              : new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="flex items-center gap-2 p-4 border-t border-border flex-shrink-0">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? "Type a message..." : "Connecting..."}
                    className="flex-1"
                    disabled={!isConnected}
                  />
                  <Button onClick={handleSendMessage} size="icon" disabled={!isConnected || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              // Default view when no room selected
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                  <h1 className="text-2xl font-bold">Select a chat room</h1>
                  <p className="text-muted-foreground">Choose a room from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
