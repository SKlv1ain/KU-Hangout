import { motion, type TargetAndTransition } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ChatRoom } from "@/context/ChatContext"
import { DockAvatar, type AvatarAccent } from "./dock-avatar"
import { MenuIconButton } from "./menu-icon-button"
import { AvatarWithTooltip } from "./avatar-with-tooltip"
import { ToggleButton } from "./ToggleButton"

interface DockAvatarListProps {
  rooms: ChatRoom[]
  accents: AvatarAccent[]
  isExpanded: boolean
  selectedRoomId: string | null
  onAvatarClick: (roomId: string) => void
  hoverAnimation: TargetAndTransition
  onToggle: () => void
  isOpen: boolean
}

export function DockAvatarList({
  rooms,
  accents,
  isExpanded,
  selectedRoomId,
  onAvatarClick,
  hoverAnimation,
  onToggle,
  isOpen,
}: DockAvatarListProps) {
  if (!isOpen) {
    return (
      <div className="flex w-full items-center justify-center">
        <ToggleButton onToggle={onToggle} isOpen={isOpen} />
      </div>
    )
  }

  if (isExpanded) {
    return null
  }

  const visibleRooms = rooms.slice(0, 3)

  return (
    <div className={cn("flex w-full items-center gap-2 overflow-visible")}>
      <ToggleButton onToggle={onToggle} isOpen={isOpen} />

      {visibleRooms.map((room, index) => (
        <AvatarWithTooltip key={room.planId} roomName={room.title}>
          <DockAvatar
            room={room}
            accent={accents[index % accents.length]}
            isExpanded={false}
            isSelected={selectedRoomId === room.planId}
            onClick={() => onAvatarClick(room.planId)}
            hoverAnimation={hoverAnimation}
            showBadge
            unreadCount={room.unreadCount ?? 0}
            size={44}
          />
        </AvatarWithTooltip>
      ))}

      <MenuIconButton />
    </div>
  )
}
