'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { useChatContext } from "@/context/ChatContext"
import { selectRecentRooms } from "@/lib/chatUtils"
import { DockAvatarList } from "./dock-avatar-list"
import { DockChatPanel } from "./dock-chat-panel"
import type { AvatarAccent } from "./dock-avatar"

const AVATAR_ACCENTS: AvatarAccent[] = [
  { backgroundClass: "bg-emerald-200 dark:bg-emerald-300", accentHex: "#a7f3d0" },
  { backgroundClass: "bg-violet-200 dark:bg-violet-300", accentHex: "#c4b5fd" },
  { backgroundClass: "bg-amber-200 dark:bg-amber-300", accentHex: "#fde68a" },
]

const MAX_ROOMS = 3
const EXPANDED_WIDTH = 448
const PADDING_X = 32
const ITEM_GAP = 8
const AVATAR_SIZE = 48
const ICON_SIZE = 48

export function MessageDock() {
  const { theme } = useTheme()
  const {
    chatRooms,
    selectedRoomId,
    selectRoom,
    messagesByRoomId,
    sendMessage,
    isConnected,
    markMessagesRead,
  } = useChatContext()
  const shouldReduceMotion = useReducedMotion()
  const dockRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messageInput, setMessageInput] = useState("")

  const prioritizedRooms = useMemo(() => {
    const sorted = selectRecentRooms(chatRooms)
    const top = sorted.slice(0, MAX_ROOMS)
    if (selectedRoomId && !top.some((room) => room.planId === selectedRoomId)) {
      const selectedRoom = chatRooms.find((room) => room.planId === selectedRoomId)
      if (selectedRoom) {
        if (top.length >= MAX_ROOMS) {
          top[top.length - 1] = selectedRoom
        } else {
          top.push(selectedRoom)
        }
      }
    }
    return top
  }, [chatRooms, selectedRoomId])

  const activeRoom = selectedRoomId
    ? chatRooms.find((room) => room.planId === selectedRoomId)
    : undefined
  const activeMessages = selectedRoomId ? messagesByRoomId[selectedRoomId] ?? [] : []

  useEffect(() => {
    if (!isExpanded) return
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        handleDockClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const hoverAnimation = shouldReduceMotion
    ? { scale: 1.02 }
    : {
        scale: 1.05,
        y: -8,
        transition: {
          type: "spring" as const,
          stiffness: 400,
          damping: 25,
        },
      }

  const handleAvatarClick = (roomId: string) => {
    if (selectedRoomId === roomId && isExpanded) {
      handleDockClose()
      return
    }

    selectRoom(roomId)
    setIsExpanded(true)
  }

  const handleDockClose = () => {
    setIsExpanded(false)
    setMessageInput("")
  }

  const handleSendMessage = () => {
    if (!selectedRoomId || !messageInput.trim()) return
    const success = sendMessage(selectedRoomId, messageInput)
    if (success) {
      setMessageInput("")
    }
  }

  const avatarCount = Math.min(prioritizedRooms.length, MAX_ROOMS)
  const collapsedItems = 2 + avatarCount // sparkle + avatars + menu
  const totalGap = Math.max(collapsedItems - 1, 0) * ITEM_GAP
  const collapsedWidth =
    PADDING_X + ICON_SIZE /* sparkle */ + avatarCount * AVATAR_SIZE + ICON_SIZE /* menu */ + totalGap

  return (
    <motion.div
      ref={dockRef}
      className="fixed bottom-6 right-6 z-50"
      initial={false}
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className={cn(
          "shadow-2xl backdrop-blur-md border border-emerald-400/20 dark:border-emerald-400/10",
          isExpanded ? "overflow-hidden" : "overflow-visible",
          isExpanded && "border-emerald-400/30 dark:border-emerald-400/20"
        )}
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          backgroundColor:
            theme === "dark"
              ? "rgba(16, 185, 129, 0.05)"
              : "rgba(16, 185, 129, 0.1)",
        }}
        initial={false}
        animate={{
          width: isExpanded ? EXPANDED_WIDTH : collapsedWidth,
          borderRadius: isExpanded ? 28 : 9999,
          paddingTop: isExpanded ? 12 : 8,
          paddingBottom: isExpanded ? 12 : 8,
        }}
        transition={{
          type: "spring",
          stiffness: isExpanded ? 300 : 500,
          damping: isExpanded ? 30 : 35,
          mass: isExpanded ? 0.8 : 0.6,
          background: { duration: 0.2, ease: "easeInOut" },
        }}
      >
        <div className={cn("relative flex w-full flex-col items-stretch gap-2", !isExpanded && "overflow-visible")}>
          <DockAvatarList
            rooms={prioritizedRooms}
            accents={AVATAR_ACCENTS}
            isExpanded={isExpanded}
            selectedRoomId={selectedRoomId}
            onAvatarClick={handleAvatarClick}
            hoverAnimation={hoverAnimation}
          />

          <AnimatePresence>
            {isExpanded && (
              <DockChatPanel
                room={activeRoom}
                messages={activeMessages}
                messageInput={messageInput}
                onMessageInputChange={setMessageInput}
                onSend={handleSendMessage}
                onClose={handleDockClose}
                isConnected={isConnected}
                onMessagesRead={markMessagesRead}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
