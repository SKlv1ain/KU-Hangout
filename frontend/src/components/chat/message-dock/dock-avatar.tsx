import { motion, type TargetAndTransition } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ChatRoom } from "@/context/ChatContext"
import { ChatRoomAvatar } from "./chat-room-avatar"

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
}

export function DockAvatar({ room, accent, isExpanded, isSelected, onClick, hoverAnimation }: DockAvatarProps) {
  return (
    <motion.button
      className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-full p-0",
        isSelected && isExpanded && "ring-2 ring-white/80"
      )}
      style={{
        border: "none",
        backgroundColor: "transparent",
      }}
      onClick={onClick}
      whileHover={!isExpanded ? hoverAnimation : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Message ${room.title}`}
    >
      <ChatRoomAvatar
        name={room.title}
        avatarUrl={room.coverImage}
        accentClass={accent.backgroundClass}
        accentHex={accent.accentHex}
      />
      {room.unreadCount > 0 && (
        <motion.div
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-amber-500"
          initial={{ scale: 0 }}
          animate={{ scale: isExpanded && !isSelected ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  )}
