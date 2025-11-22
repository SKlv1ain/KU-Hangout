import { cn } from "@/lib/utils"
import type { GroupedMessage } from "@/hooks/useMessageGrouping"
import { MessageSenderAvatar } from "./MessageSenderAvatar"
import { ReadReceipts } from "./ReadReceipts"
import { useTimestampFormat } from "@/hooks/useTimestampFormat"

interface MessageItemProps {
  message: GroupedMessage
  currentUserName?: string | null
}

export function MessageItem({ message, currentUserName }: MessageItemProps) {
  const name =
    message.sender ??
    message.senderUsername ??
    (message.isOwn ? currentUserName ?? "You" : "Unknown user")
  const initials = (message.sender ?? message.senderUsername ?? "??").slice(0, 2).toUpperCase()
  const timestamp = useTimestampFormat(message.timestamp)
  const showReceipts = message.isLastInGroup && (message.readReceipts?.length ?? 0) > 0

  if (message.isOwn) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <div className="h-8 w-8" aria-hidden />
          <div className="flex flex-1 flex-col items-end gap-1">
            {message.showSenderLabel && (
              <span className="text-xs font-medium text-muted-foreground">{name}</span>
            )}
            <div className="flex items-end justify-end gap-1">
              {timestamp ? (
                <span className="text-[10px] text-muted-foreground inline-flex items-center mr-1">
                  {timestamp}
                </span>
              ) : null}
              <div
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm text-white",
                  "bg-emerald-500 dark:bg-emerald-600"
                )}
              >
                {message.text}
              </div>
            </div>
            {showReceipts && (
              <ReadReceipts
                receipts={message.readReceipts ?? []}
                side="right"
                currentUserUsername={currentUserName ?? undefined}
                className="mt-0.5 pr-1"
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-end">
      <MessageSenderAvatar
        name={name}
        username={message.senderUsername}
        imageUrl={message.senderAvatar}
        fallback={initials}
        hidden={!message.showAvatar}
      />
      <div className="flex flex-1 items-end gap-2">
        <div className="flex max-w-[75%] flex-col gap-1">
          {message.showSenderLabel && (
            <span className="text-xs font-medium text-muted-foreground">{name}</span>
          )}
          <div className="flex items-end gap-1">
            <div
              className={cn(
                "rounded-2xl border border-border/40 bg-muted px-3 py-2 text-sm dark:bg-muted/50"
              )}
            >
              {message.text}
            </div>
            {timestamp ? (
              <span className="text-[10px] text-muted-foreground inline-flex items-center ml-1">
                {timestamp}
              </span>
            ) : null}
          </div>
        </div>
        {showReceipts && (
          <ReadReceipts
            receipts={message.readReceipts ?? []}
            side="left"
            currentUserUsername={currentUserName ?? undefined}
            className="ml-auto pl-2"
          />
        )}
      </div>
    </div>
  )
}
