import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ChatRoom, ChatMessage } from "@/context/ChatContext"
import { useAuth } from "@/context/AuthContext"
import { MessageDockChatHeader } from "./chat-header"

interface DockChatPanelProps {
  room?: ChatRoom
  messages: ChatMessage[]
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSend: () => void
  onClose: () => void
  isConnected: boolean
}

export function DockChatPanel({
  room,
  messages,
  messageInput,
  onMessageInputChange,
  onSend,
  onClose,
  isConnected,
}: DockChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, room?.planId])

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
      <MessageDockChatHeader room={room} isConnected={isConnected} onClose={onClose} />

      <div ref={scrollRef} className="flex-1 min-h-[180px] max-h-72 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground/80">
            {room ? `Start the conversation with ${room.title}.` : "No chat selected."}
          </p>
        ) : (
          messages.map((entry) => (
            <div
              key={`${entry.id}-${entry.timestamp.getTime()}`}
              className={cn("flex", user && entry.senderId === user.id ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-xs font-medium shadow-sm",
                  user && entry.senderId === user.id
                    ? "bg-emerald-500/70 dark:bg-emerald-600/60 text-white backdrop-blur-sm"
                    : entry.sender === "System"
                    ? "bg-white/40 dark:bg-white/10 text-foreground border border-emerald-200/30 dark:border-emerald-800/30 backdrop-blur-sm"
                    : "bg-white/70 dark:bg-emerald-950/30 text-foreground border border-emerald-200/30 dark:border-emerald-800/30 backdrop-blur-sm"
                )}
              >
                <div className="text-[10px] font-semibold mb-0.5">{entry.sender}</div>
                <div>{entry.text}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <motion.input
          type="text"
          value={messageInput}
          onChange={(e) => onMessageInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend()
            }
            if (e.key === "Escape") {
              onClose()
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-emerald-300/40 dark:border-emerald-700/40 bg-white/50 dark:bg-white/10 px-3 py-2 text-sm font-medium text-foreground placeholder-muted-foreground outline-none transition backdrop-blur-sm focus:border-emerald-400/60 dark:focus:border-emerald-500/60 focus:ring-0"
          style={{ color: "hsl(var(--foreground))" }}
          autoFocus
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.1, type: "spring", stiffness: 400, damping: 30 } }}
          exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeOut" } }}
          disabled={disableInput}
        />
        <motion.button
          key="send"
          onClick={onSend}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 dark:border-emerald-600/40 bg-emerald-500/60 dark:bg-emerald-600/50 text-white backdrop-blur-sm transition-colors hover:bg-emerald-500/80 dark:hover:bg-emerald-600/70 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          disabled={disableInput || !messageInput.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <path d="m22 2-7 20-4-9-9-4z" />
            <path d="M22 2 11 13" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}
