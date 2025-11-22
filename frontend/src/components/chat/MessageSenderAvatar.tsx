import type { MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageSenderAvatarProps {
  name: string
  username?: string
  imageUrl?: string | null
  fallback: string
  hidden?: boolean
  size?: number
  className?: string
}

export function MessageSenderAvatar({
  name,
  username,
  imageUrl,
  fallback,
  hidden = false,
  size,
  className,
}: MessageSenderAvatarProps) {
  const navigate = useNavigate()
  const label = name.trim() || username || "Unknown user"
  const dimension = size ?? 32
  const sizeStyle = size ? { width: dimension, height: dimension } : undefined
  const sizeClass = size ? undefined : "h-8 w-8"

  if (hidden) {
    return <div className={cn(sizeClass)} style={sizeStyle} aria-hidden />
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
      className={cn(
        "flex items-center justify-center rounded-full disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        sizeClass,
        className
      )}
      style={sizeStyle}
    >
      <Avatar className={cn(sizeClass)} style={sizeStyle}>
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
