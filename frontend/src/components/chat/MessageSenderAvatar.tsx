import type { MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageSenderAvatarProps {
  name: string
  username?: string
  imageUrl?: string | null
  fallback: string
  hidden?: boolean
}

export function MessageSenderAvatar({
  name,
  username,
  imageUrl,
  fallback,
  hidden = false,
}: MessageSenderAvatarProps) {
  const navigate = useNavigate()
  const label = name.trim() || username || "Unknown user"

  if (hidden) {
    return <div className="h-8 w-8" aria-hidden />
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!username) return
    navigate(`/profile/${username}`)
  }

  const avatar = (
    <button
      type="button"
      onClick={handleClick}
      disabled={!username}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="h-8 w-8">
        {imageUrl ? <AvatarImage src={imageUrl} alt={label} /> : null}
        <AvatarFallback className="text-xs font-semibold">{fallback}</AvatarFallback>
      </Avatar>
    </button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  )
}
