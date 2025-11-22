import { cn } from "@/lib/utils"
import type { ChatReadReceipt } from "@/context/ChatContext"
import { MessageSenderAvatar } from "./MessageSenderAvatar"

interface ReadReceiptsProps {
  receipts: ChatReadReceipt[]
  side: "left" | "right"
  currentUserUsername?: string
  className?: string
}

export function ReadReceipts({ receipts, side, currentUserUsername, className }: ReadReceiptsProps) {
  const filtered = receipts.filter(
    (receipt) => receipt.username && receipt.username !== currentUserUsername
  )

  if (filtered.length === 0) return null

  const uniqueByUser = Array.from(
    filtered.reduce((map, receipt) => {
      if (!receipt.username) return map
      map.set(receipt.username, receipt)
      return map
    }, new Map<string, ChatReadReceipt>())
  ).map(([, receipt]) => receipt)

  const alignClass = side === "right" ? "justify-end" : "justify-end"

  return (
    <div className={cn("flex gap-1", alignClass, className)}>
      {uniqueByUser.map((receipt, index) => {
        const fallback = receipt.displayName ?? receipt.username ?? "??"
        return (
          <div
            key={receipt.username}
            className={cn(
              "rounded-full border border-white shadow-sm overflow-hidden",
              index > 0 ? "-ml-1" : "",
              "h-4 w-4"
            )}
          >
            <MessageSenderAvatar
              name={fallback}
              username={receipt.username}
              imageUrl={receipt.avatar}
              fallback={fallback.slice(0, 2).toUpperCase()}
              size={16}
              className="h-4 w-4"
            />
          </div>
        )
      })}
    </div>
  )
}
