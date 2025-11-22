import { cn } from "@/lib/utils"
import { getPlanInitials } from "@/lib/chatUtils"

interface ChatRoomAvatarProps {
  name: string
  avatarUrl?: string | null
  accentClass?: string
  accentHex?: string
  size?: number
}

export function ChatRoomAvatar({ name, avatarUrl, accentClass, accentHex, size = 48 }: ChatRoomAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full overflow-hidden shrink-0 text-sm font-semibold text-emerald-950",
        accentClass
      )}
      style={{ backgroundColor: accentHex, width: size, height: size }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-base">{getPlanInitials(name)}</span>
      )}
    </div>
  )
}
