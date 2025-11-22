import { cn } from "@/lib/utils"
import type { ChatReadReceipt } from "@/context/ChatContext"
import { MessageSenderAvatar } from "./MessageSenderAvatar"

interface ReadReceiptsRightProps {
  receipts: ChatReadReceipt[]
  className?: string
}

export function ReadReceiptsRight({ receipts, className }: ReadReceiptsRightProps) {
  if (!receipts || receipts.length === 0) return null

  return (
    <div className={cn("flex items-center justify-end gap-1 pr-1 mt-1", className)}>
      {receipts.map((receipt, index) => {
        const fallback = receipt.displayName ?? receipt.username ?? "??"
        return (
          <MessageSenderAvatar
            key={`${receipt.username}-${index}`}
            name={receipt.displayName ?? receipt.username ?? "Unknown user"}
            username={receipt.username}
            imageUrl={receipt.avatar}
            fallback={fallback.slice(0, 2).toUpperCase()}
            size={16}
            className={cn(
              "h-4 w-4 rounded-full border-2 border-background shadow-sm",
              index > 0 ? "-ml-1" : ""
            )}
          />
        )
      })}
    </div>
  )
}
