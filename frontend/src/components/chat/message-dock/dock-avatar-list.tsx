import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ChatRoom } from "@/context/ChatContext"
import { DockAvatar, type AvatarAccent } from "./dock-avatar"

interface DockAvatarListProps {
  rooms: ChatRoom[]
  accents: AvatarAccent[]
  isExpanded: boolean
  selectedRoomId: string | null
  onAvatarClick: (roomId: string) => void
  hoverAnimation: TargetAndTransition
  onOpenFullChat: () => void
}

export function DockAvatarList({
  rooms,
  accents,
  isExpanded,
  selectedRoomId,
  onAvatarClick,
  hoverAnimation,
  onOpenFullChat,
}: DockAvatarListProps) {
  return (
    <div className={cn("flex w-full items-center gap-2", isExpanded && "gap-1.5")}
    >
      <motion.div
        className="flex items-center justify-center"
        animate={{
          opacity: isExpanded ? 0 : 1,
          x: isExpanded ? -20 : 0,
          scale: isExpanded ? 0.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <motion.button
          className={cn("flex items-center justify-center cursor-pointer", isExpanded ? "h-8 w-8" : "h-12 w-12")}
          style={{ backgroundColor: "transparent", border: "none" }}
          whileHover={
            !isExpanded
              ? {
                  scale: 1.02,
                  y: -2,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  },
                }
              : undefined
          }
          whileTap={{ scale: 0.95 }}
          aria-label="Sparkle"
        >
          <span className="text-2xl">✨</span>
        </motion.button>
      </motion.div>

      <motion.div
        className="h-6 w-px bg-gray-300 -ml-2 mr-2"
        animate={{ opacity: isExpanded ? 0 : 1, scaleY: isExpanded ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {rooms.map((room, index) => (
        <DockAvatar
          key={room.planId}
          room={room}
          accent={accents[index % accents.length]}
          isExpanded={isExpanded}
          isSelected={selectedRoomId === room.planId}
          onClick={() => onAvatarClick(room.planId)}
          hoverAnimation={hoverAnimation}
        />
      ))}

      <motion.div
        className="h-6 w-px bg-gray-300 -mr-2 ml-2"
        animate={{ opacity: isExpanded ? 0 : 1, scaleY: isExpanded ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      <div className="ml-auto flex items-center gap-1">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.button
              key="menu"
              className={cn("flex items-center justify-center cursor-pointer", isExpanded ? "h-8 w-8" : "h-12 w-12")}
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
              aria-label="Menu"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              key="expand"
              onClick={onOpenFullChat}
              className="flex h-8 w-8 items-center justify-center cursor-pointer"
              style={{ backgroundColor: "transparent", border: "none" }}
              whileHover={{
                scale: 1.1,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                },
              }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open full chat"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
