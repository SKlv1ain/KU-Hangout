import type { ChatMessage, ChatReadReceipt } from "@/context/ChatContext"

const parseReadAt = (value?: string | null) => {
  if (!value) return 0
  const ts = Date.parse(value)
  return Number.isNaN(ts) ? 0 : ts
}

interface LastReadMessageState {
  lastReadMessageId?: string
  readers: ChatReadReceipt[]
}

export function useLastReadMessage(
  messages: ChatMessage[],
  currentUserUsername?: string | null
): LastReadMessageState {
  let lastReadMessageId: string | undefined
  let readers: ChatReadReceipt[] = []
  let bestTimestamp = -Infinity
  let bestIndex = -1

  messages.forEach((message, index) => {
    const messageId = message.id?.toString()
    if (!messageId) return

    const receipts = (message.readReceipts ?? []).filter(
      (receipt) => receipt.username && receipt.username !== currentUserUsername
    )
    if (receipts.length === 0) return

    const newestTs = receipts.reduce((latest, receipt) => {
      const ts = parseReadAt(receipt.readAt)
      return ts > latest ? ts : latest
    }, -Infinity)

    if (newestTs > bestTimestamp || (newestTs === bestTimestamp && index > bestIndex)) {
      bestTimestamp = newestTs
      bestIndex = index
      lastReadMessageId = messageId
      readers = [...receipts].sort((a, b) => parseReadAt(a.readAt) - parseReadAt(b.readAt))
    }
  })

  return { lastReadMessageId, readers }
}
