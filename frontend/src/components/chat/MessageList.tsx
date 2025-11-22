import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/context/ChatContext"
import { useAuth } from "@/context/AuthContext"
import { useMessageGrouping } from "@/hooks/useMessageGrouping"
import { useChatScroll } from "@/hooks/useChatScroll"
import { MessageItem } from "./MessageItem"

interface MessageListProps {
  messages: ChatMessage[]
  className?: string
  emptyState?: string
}

export function MessageList({
  messages,
  className,
  emptyState = "Start the conversation!",
}: MessageListProps) {
  const { user } = useAuth()
  const grouped = useMessageGrouping(messages, user?.id)
  const { containerRef } = useChatScroll<HTMLDivElement>({ dependencies: [grouped.length] })

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
          />
        </div>
      ))}
    </div>
  )
}
