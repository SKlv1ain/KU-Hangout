import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPlanInitials } from "@/lib/chatUtils"

interface DockChatHeaderProps {
  roomId: string
  roomName: string
  avatarUrl?: string | null
  onClose: () => void
}

export function DockChatHeader({ roomId, roomName, avatarUrl, onClose }: DockChatHeaderProps) {
  const navigate = useNavigate()

  const handleNavigate = useCallback(() => {
    navigate(`/messages?planId=${roomId}`)
  }, [navigate, roomId])

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={roomName} />}
          <AvatarFallback>{getPlanInitials(roomName)}</AvatarFallback>
        </Avatar>
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200 truncate">{roomName}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <motion.button
          type="button"
          onClick={handleNavigate}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/60 text-emerald-700 dark:text-emerald-200 backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open full chat"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </motion.button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-muted-foreground hover:text-foreground"
          aria-label="Close quick chat"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
