import { format, isValid } from "date-fns"
import { cn } from "@/lib/utils"
import type { GroupedMessage } from "@/hooks/useMessageGrouping"
import type { ChatReadReceipt } from "@/context/ChatContext"
import { MessageSenderAvatar } from "./MessageSenderAvatar"

interface MessageMetaProps {
  message: GroupedMessage
  isOwn: boolean
  currentUserUsername?: string
}

interface ReadReceiptAvatarsProps {
  receipts: ChatReadReceipt[]
  currentUserUsername?: string
}

function ReadReceiptAvatars({ receipts, currentUserUsername }: ReadReceiptAvatarsProps) {
  const filtered = receipts.filter(
    (receipt) => receipt.username && receipt.username !== currentUserUsername
  )

  if (filtered.length === 0) return null

  const uniqueByUser = Array.from(
    filtered.reduce((map, receipt) => {
      map.set(receipt.username, receipt)
      return map
    }, new Map<string, ChatReadReceipt>())
  ).map(([, receipt]) => receipt)

  return (
    <div className="flex items-center">
      {uniqueByUser.map((receipt, index) => {
        const fallback = receipt.displayName ?? receipt.username ?? "??"
        return (
          <div
            key={receipt.username}
            className={cn("rounded-full border-2 border-background", index > 0 ? "-ml-2" : "")}
          >
            <MessageSenderAvatar
              name={receipt.displayName ?? receipt.username ?? "Unknown user"}
              username={receipt.username}
              imageUrl={receipt.avatar}
              fallback={fallback.slice(0, 2).toUpperCase()}
              size={18}
            />
          </div>
        )
      })}
    </div>
  )
}

export function MessageMeta({ message, isOwn, currentUserUsername }: MessageMetaProps) {
  const timeLabel =
    message.timestamp instanceof Date && isValid(message.timestamp)
      ? format(message.timestamp, "HH:mm")
      : ""

  const receipts = message.readReceipts ?? []

  if (!timeLabel && receipts.length === 0) {
    return null
  }

  if (isOwn) {
    return (
      <div className="mt-1 flex items-center justify-end gap-2 pr-1 text-xs text-muted-foreground">
        {timeLabel ? <span>{timeLabel}</span> : null}
        <ReadReceiptAvatars receipts={receipts} currentUserUsername={currentUserUsername} />
      </div>
    )
  }

  return (
    <div className="ml-2 flex items-center gap-2 text-xs text-muted-foreground">
      {timeLabel ? <span>{timeLabel}</span> : null}
      <ReadReceiptAvatars receipts={receipts} currentUserUsername={currentUserUsername} />
    </div>
  )
}
