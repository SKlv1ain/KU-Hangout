"use client"

import { useState, useEffect, type KeyboardEvent } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { SidebarLayout } from "@/components/home/side-bar"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageSquare, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPlanInitials } from "@/lib/chatUtils"
import { useAuth } from "@/context/AuthContext"
import { useChatContext } from "@/context/ChatContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeAvatar } from "@/components/chat/BadgeAvatar"
import { useChatUnreadCounts } from "@/hooks/useChatUnreadCounts"

export default function MessagePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get("planId")
  const [inputMessage, setInputMessage] = useState("")
  const {
    chatRooms,
    messagesByRoomId,
    selectedRoomId,
    selectRoom,
    sendMessage,
    isConnected,
    connectionStatus,
    connectionError,
  } = useChatContext()
  const { getUnreadCount, acknowledgePlan } = useChatUnreadCounts()

  const messages = selectedRoomId ? messagesByRoomId[selectedRoomId] ?? [] : []
  const selectedRoom = selectedRoomId
    ? chatRooms.find((room) => room.planId === selectedRoomId)
    : undefined

  useEffect(() => {
    if (planId) {
      const roomExists = chatRooms.some((room) => room.planId === planId)
      if (roomExists) {
        if (selectedRoomId !== planId) {
          selectRoom(planId)
        }
      } else if (chatRooms.length > 0) {
        const fallbackRoomId = chatRooms[0].planId
        selectRoom(fallbackRoomId)
        navigate(`/messages?planId=${fallbackRoomId}`, { replace: true })
      }
      return
    }

    if (!planId) {
      if (selectedRoomId) {
        navigate(`/messages?planId=${selectedRoomId}`, { replace: true })
        return
      }
      if (chatRooms.length > 0) {
        const fallbackRoomId = chatRooms[0].planId
        selectRoom(fallbackRoomId)
        navigate(`/messages?planId=${fallbackRoomId}`, { replace: true })
      }
    }
  }, [planId, chatRooms, selectedRoomId, selectRoom, navigate])

  const handleSelectRoom = (roomPlanId: string | number) => {
    const normalizedRoomId = roomPlanId.toString()
    if (normalizedRoomId !== selectedRoomId) {
      selectRoom(normalizedRoomId)
      void acknowledgePlan(normalizedRoomId)
    }
    navigate(`/messages?planId=${normalizedRoomId}`)
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedRoomId || !isConnected) return
    const success = sendMessage(selectedRoomId, inputMessage)
    if (success) {
      setInputMessage("")
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <SidebarLayout contentClassName="h-screen bg-background overflow-hidden">
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div
          className="flex flex-1 overflow-hidden divide-x divide-border"
          style={{ height: "calc(100vh - 4rem)", maxHeight: "calc(100vh - 4rem)" }}
        >
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
                  {chatRooms.map((room) => {
                    const roomUnread = getUnreadCount(room.planId.toString())
                    return (
                      <button
                      key={room.planId}
                      onClick={() => handleSelectRoom(room.planId)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-accent transition-colors",
                        selectedRoomId === room.planId && "bg-accent border-l-2 border-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <BadgeAvatar roomName={room.title} avatarUrl={room.coverImage ?? undefined} unread={roomUnread} size={48} />
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
                                {room.lastMessageTime ? room.lastMessageTime.toLocaleString() : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Chat Interface (70%) */}
          <div className="flex-[70%] flex flex-col min-w-0">
            {selectedRoomId && selectedRoom ? (
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
                        {isConnected ? "Connected" : connectionStatus === "connecting" ? "Connecting..." : "Disconnected"}
                      </p>
                      {connectionError && <p className="text-xs text-destructive mt-1">{connectionError}</p>}
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
                          <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
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
