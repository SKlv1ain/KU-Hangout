import { motion, type TargetAndTransition } from "framer-motion"
import { cn } from "@/lib/utils"
import { getPlanInitials } from "@/lib/chatUtils"
import type { ChatRoom } from "@/context/ChatContext"

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
        "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-emerald-950",
        accent.backgroundClass,
        isSelected && isExpanded && "bg-white/90"
      )}
      style={{
        border: "none",
        backgroundColor: isSelected && isExpanded ? "rgba(255, 255, 255, 0.9)" : accent.accentHex,
      }}
      onClick={onClick}
      whileHover={!isExpanded ? hoverAnimation : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Message ${room.title}`}
    >
      {room.coverImage ? (
        <img src={room.coverImage} alt={room.title} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <span className="text-base">{getPlanInitials(room.title)}</span>
      )}
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
