import { cn } from "@/lib/utils"
import { ChatRoomAvatar } from "./message-dock/chat-room-avatar"

interface BadgeAvatarProps {
  roomName: string
  avatarUrl?: string | null
  unread: number
  size?: number
  accentClass?: string
  accentHex?: string
}

export function BadgeAvatar({ roomName, avatarUrl, unread, size = 48, accentClass, accentHex }: BadgeAvatarProps) {
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <ChatRoomAvatar
        name={roomName}
        avatarUrl={avatarUrl}
        accentClass={accentClass}
        accentHex={accentHex}
        size={size}
      />
      {unread > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-lg",
          )}
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </div>
  )
}
