import { motion, type TargetAndTransition } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ChatRoom } from "@/context/ChatContext"
import { ChatRoomAvatar } from "./chat-room-avatar"
import { BadgeAvatar } from "../BadgeAvatar"

export interface AvatarAccent {
  backgroundClass: string
  accentHex: string
}

interface DockAvatarProps {
  room: ChatRoom
  accent: AvatarAccent
  isExpanded: boolean
  isSelected: boolean
  onClick: () => void
  hoverAnimation: TargetAndTransition
  showBadge?: boolean
  unreadCount?: number
  size?: number
}

export function DockAvatar({
  room,
  accent,
  isExpanded,
  isSelected,
  onClick,
  hoverAnimation,
  showBadge = false,
  unreadCount = 0,
  size = 48,
}: DockAvatarProps) {
  return (
    <motion.button
      className={cn(
        "relative flex items-center justify-center rounded-full p-0",
        isSelected && isExpanded && "ring-2 ring-white/80"
      )}
      style={{
        border: "none",
        backgroundColor: "transparent",
        width: size,
        height: size,
      }}
      onClick={onClick}
      whileHover={!isExpanded ? hoverAnimation : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={
        showBadge && unreadCount > 0
          ? `${room.title} (${unreadCount > 99 ? "99+" : unreadCount} unread messages)`
          : `Message ${room.title}`
      }
    >
      {showBadge ? (
        <BadgeAvatar
          roomName={room.title}
          avatarUrl={room.coverImage}
          unread={unreadCount}
          size={size}
          accentClass={accent.backgroundClass}
          accentHex={accent.accentHex}
        />
      ) : (
        <ChatRoomAvatar
          name={room.title}
          avatarUrl={room.coverImage}
          accentClass={accent.backgroundClass}
          accentHex={accent.accentHex}
          size={size}
        />
      )}
    </motion.button>
  )
}
