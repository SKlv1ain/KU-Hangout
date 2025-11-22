import { cn } from "@/lib/utils"
import type { ChatReadReceipt } from "@/context/ChatContext"
import { MessageSenderAvatar } from "./MessageSenderAvatar"

interface ReadReceiptsLeftProps {
  receipts: ChatReadReceipt[]
  className?: string
}

export function ReadReceiptsLeft({ receipts, className }: ReadReceiptsLeftProps) {
  if (!receipts || receipts.length === 0) return null

  return (
    <div className={cn("flex items-center gap-1 justify-end", className)}>
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
