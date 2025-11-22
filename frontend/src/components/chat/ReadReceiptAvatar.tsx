import { cn } from "@/lib/utils"
import type { ChatReadReceipt } from "@/context/ChatContext"
import { MessageSenderAvatar } from "./MessageSenderAvatar"

interface ReadReceiptAvatarProps {
  receipt: ChatReadReceipt
  className?: string
}

export function ReadReceiptAvatar({ receipt, className }: ReadReceiptAvatarProps) {
  const fallback = (receipt.displayName ?? receipt.username ?? "??").slice(0, 2).toUpperCase()

  return (
    <MessageSenderAvatar
      name={receipt.displayName ?? receipt.username ?? "Unknown user"}
      username={receipt.username}
      imageUrl={receipt.avatar ?? null}
      fallback={fallback}
      size={16}
      className={cn("h-4 w-4 rounded-full border border-white shadow-sm -ml-1", className)}
    />
  )
}
