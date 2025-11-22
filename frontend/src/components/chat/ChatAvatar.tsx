import { cn } from "@/lib/utils"
import { MessageSenderAvatar } from "./MessageSenderAvatar"

interface ChatAvatarProps {
  name: string
  username?: string
  imageUrl?: string | null
  fallback: string
  hidden?: boolean
}

export function ChatAvatar({ name, username, imageUrl, fallback, hidden }: ChatAvatarProps) {
  return (
    <MessageSenderAvatar
      name={name}
      username={username}
      imageUrl={imageUrl}
      fallback={fallback}
      hidden={hidden}
      size={32}
      className={cn("h-8 w-8 my-1")}
    />
  )
}
