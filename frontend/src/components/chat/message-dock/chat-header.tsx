import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPlanInitials } from "@/lib/chatUtils"
import type { ChatRoom } from "@/context/ChatContext"

interface MessageDockChatHeaderProps {
  room?: ChatRoom
  isConnected: boolean
  onClose: () => void
}

export function MessageDockChatHeader({ room, isConnected, onClose }: MessageDockChatHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {room?.coverImage && <AvatarImage src={room.coverImage} alt={room.title} />}
          <AvatarFallback>{getPlanInitials(room?.title)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200 truncate">
            {room?.title ?? "Quick chat"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {room ? (isConnected ? "Connected" : "Offline") : "Pick a room to start chatting"}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-transparent px-2 py-1 text-lg leading-none text-muted-foreground hover:text-foreground"
        aria-label="Close quick chat"
      >
        &times;
      </button>
    </div>
  )
}
