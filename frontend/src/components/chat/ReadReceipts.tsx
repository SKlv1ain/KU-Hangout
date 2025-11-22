import { cn } from "@/lib/utils"
import type { ChatReadReceipt } from "@/context/ChatContext"
import { MessageSenderAvatar } from "./MessageSenderAvatar"

interface ReadReceiptsProps {
  receipts: ChatReadReceipt[]
  side: "left" | "right"
  className?: string
}

export function ReadReceipts({ receipts, side, className }: ReadReceiptsProps) {
  if (!receipts || receipts.length === 0) return null

  const alignClass = side === "right" ? "justify-end" : "justify-end"

  return (
    <div className={cn("flex items-center gap-1", alignClass, className)}>
      {receipts.map((receipt, index) => {
        const fallback = receipt.displayName ?? receipt.username ?? "??"
        return (
          <MessageSenderAvatar
            key={`${receipt.username}-${index}`}
            name={receipt.displayName ?? receipt.username ?? "Unknown user"}
            username={receipt.username}
            imageUrl={receipt.avatar}
            fallback={fallback.slice(0, 2).toUpperCase()}
            size={24}
            className={cn(
              "h-6 w-6 rounded-full border border-background shadow-sm",
              index > 0 ? "-ml-1" : ""
            )}
          />
        )
      })}
    </div>
  )
}
