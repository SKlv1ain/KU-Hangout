import { motion, type TargetAndTransition } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ChatRoom } from "@/context/ChatContext"
import { DockAvatar, type AvatarAccent } from "./dock-avatar"
import { MenuIconButton } from "./menu-icon-button"

interface DockAvatarListProps {
  rooms: ChatRoom[]
  accents: AvatarAccent[]
  isExpanded: boolean
  selectedRoomId: string | null
  onAvatarClick: (roomId: string) => void
  hoverAnimation: TargetAndTransition
}

export function DockAvatarList({
  rooms,
  accents,
  isExpanded,
  selectedRoomId,
  onAvatarClick,
  hoverAnimation,
}: DockAvatarListProps) {
  if (isExpanded) {
    return null
  }

  const visibleRooms = rooms.slice(0, 3)

  return (
    <div className={cn("flex w-full items-center gap-2")}>
      <motion.button
        className="flex h-12 w-12 items-center justify-center"
        style={{ backgroundColor: "transparent", border: "none" }}
        whileHover={{
          scale: 1.02,
          y: -2,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
          },
        }}
        whileTap={{ scale: 0.95 }}
        aria-label="Sparkle"
      >
        <span className="text-2xl">✨</span>
      </motion.button>

      {visibleRooms.map((room, index) => (
        <DockAvatar
          key={room.planId}
          room={room}
          accent={accents[index % accents.length]}
          isExpanded={false}
          isSelected={selectedRoomId === room.planId}
          onClick={() => onAvatarClick(room.planId)}
          hoverAnimation={hoverAnimation}
        />
      ))}

      <MenuIconButton />
    </div>
  )
}
