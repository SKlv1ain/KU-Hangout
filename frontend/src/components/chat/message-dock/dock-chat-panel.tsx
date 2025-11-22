import { motion } from "framer-motion"
import type { ChatRoom, ChatMessage } from "@/context/ChatContext"
import { DockChatHeader } from "./DockChatHeader"
import { MessageList } from "@/components/chat/MessageList"
import { MessageComposer } from "@/components/chat/MessageComposer"

interface DockChatPanelProps {
  room?: ChatRoom
  messages: ChatMessage[]
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSend: () => void
  onClose: () => void
  isConnected: boolean
  onMessagesRead?: (messageIds: string[]) => void
}

export function DockChatPanel({
  room,
  messages,
  messageInput,
  onMessageInputChange,
  onSend,
  onClose,
  isConnected,
  onMessagesRead,
}: DockChatPanelProps) {
  const placeholder = room ? `Message ${room.title}` : "Select a chat to start typing"
  const disableInput = !room || !isConnected

  return (
    <motion.div
      key="chat-panel"
      className="flex w-full flex-col gap-3 rounded-2xl border border-emerald-400/20 dark:border-emerald-400/10 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 backdrop-blur-md"
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 320, damping: 30 },
      }}
      exit={{ opacity: 0, y: 12, transition: { duration: 0.15, ease: "easeInOut" } }}
    >
      {room ? (
        <DockChatHeader
          roomId={room.planId}
          roomName={room.title}
          avatarUrl={room.coverImage}
          onClose={onClose}
        />
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">Quick chat</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-muted-foreground hover:text-foreground"
            aria-label="Close quick chat"
          >
            &times;
          </button>
        </div>
      )}

      <MessageList
        messages={messages}
        onMessagesRead={onMessagesRead}
        className="flex-1 min-h-[180px] max-h-72 pr-1"
        emptyState={room ? `Start the conversation with ${room.title}.` : "No chat selected."}
      />

      <MessageComposer
        value={messageInput}
        onChange={onMessageInputChange}
        onSend={onSend}
        onCancel={onClose}
        placeholder={placeholder}
        disabled={disableInput}
        className="pt-1"
      />
    </motion.div>
  )
}
