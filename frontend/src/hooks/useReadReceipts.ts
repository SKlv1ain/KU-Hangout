import type { ChatMessage, ChatReadReceipt } from "@/context/ChatContext"

const parseReadAt = (value?: string | null) => {
  if (!value) return 0
  const ts = Date.parse(value)
  return Number.isNaN(ts) ? 0 : ts
}

interface ReadReceiptState {
  lastReadMessageId?: string
  readers: ChatReadReceipt[]
  shouldShow: (messageId?: string | number) => boolean
}

export function useReadReceipts(messages: ChatMessage[]): ReadReceiptState {
  let lastReadMessageId: string | undefined
  let lastReadTimestamp = -Infinity
  let lastIndex = -1
  let readersForLast: ChatReadReceipt[] = []

  messages.forEach((message, index) => {
    const messageId = message.id?.toString()
    if (!messageId) return

    const receipts = message.readReceipts ?? []
    if (receipts.length === 0) return

    // Determine most recent read time for this message
    const newestTimestamp = receipts.reduce((latest, receipt) => {
      const ts = parseReadAt(receipt.readAt)
      return ts > latest ? ts : latest
    }, -Infinity)

    if (
      newestTimestamp > lastReadTimestamp ||
      (newestTimestamp === lastReadTimestamp && index > lastIndex)
    ) {
      lastReadMessageId = messageId
      lastReadTimestamp = newestTimestamp
      lastIndex = index
      readersForLast = [...receipts].sort(
        (a, b) => parseReadAt(a.readAt) - parseReadAt(b.readAt)
      )
    }
  })

  const shouldShow = (messageId?: string | number) => {
    if (!lastReadMessageId || messageId === undefined || messageId === null) return false
    return String(messageId) === lastReadMessageId
  }

  return {
    lastReadMessageId,
    readers: readersForLast,
    shouldShow,
  }
}
