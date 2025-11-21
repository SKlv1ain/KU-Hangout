import { cn } from "@/lib/utils"
import { getPlanInitials } from "@/lib/chatUtils"

interface ChatRoomAvatarProps {
  name: string
  avatarUrl?: string | null
  accentClass?: string
  accentHex?: string
}

export function ChatRoomAvatar({ name, avatarUrl, accentClass, accentHex }: ChatRoomAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex h-12 w-12 items-center justify-center rounded-full overflow-hidden text-sm font-semibold text-emerald-950",
        accentClass
      )}
      style={{ backgroundColor: accentHex }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-base">{getPlanInitials(name)}</span>
      )}
    </div>
  )
}
