import { useEffect } from "react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/context/ChatContext"
import { useAuth } from "@/context/AuthContext"
import { useMessageGrouping } from "@/hooks/useMessageGrouping"
import { useChatScroll } from "@/hooks/useChatScroll"
import { MessageItem } from "./MessageItem"
import { useLastReadMessage } from "@/hooks/useLastReadMessage"

interface MessageListProps {
  messages: ChatMessage[]
  className?: string
  emptyState?: string
  onMessagesRead?: (messageIds: string[]) => void
}

export function MessageList({
  messages,
  className,
  emptyState = "Start the conversation!",
  onMessagesRead,
}: MessageListProps) {
  const { user } = useAuth()
  const grouped = useMessageGrouping(messages, user?.id)
  const { lastReadMessageId, readers } = useLastReadMessage(grouped, user?.username)
  const { containerRef } = useChatScroll<HTMLDivElement>({ dependencies: [grouped.length] })

  useEffect(() => {
    if (!onMessagesRead || !user) return

    const unreadIds = grouped
      .filter(
        (msg) =>
          !msg.isOwn &&
          !(msg.readReceipts || []).some((receipt) => receipt.username === user.username)
      )
      .map((msg) => msg.id?.toString())
      .filter((id): id is string => Boolean(id))

    const uniqueIds = Array.from(new Set(unreadIds))
    if (uniqueIds.length > 0) {
      onMessagesRead(uniqueIds)
    }
  }, [grouped, onMessagesRead, user])

  if (grouped.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center text-sm text-muted-foreground", className)}>
        {emptyState}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("overflow-y-auto", className)}>
      {grouped.map((message, index) => (
        <div
          key={`${message.id}-${message.timestamp instanceof Date ? message.timestamp.getTime() : message.timestamp}`}
          className={cn(index > 0 ? (message.showSenderLabel ? "mt-3" : "mt-1") : undefined)}
        >
          <MessageItem
            message={message}
            currentUserName={user?.username}
            showReadReceipts={lastReadMessageId === message.id?.toString()}
            readReceipts={readers}
          />
        </div>
      ))}
    </div>
  )
}
