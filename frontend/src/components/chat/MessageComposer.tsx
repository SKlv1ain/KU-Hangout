import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MessageComposerProps {
  value: string
  placeholder?: string
  disabled?: boolean
  onChange: (value: string) => void
  onSend: () => void
  onCancel?: () => void
  className?: string
}

export function MessageComposer({
  value,
  placeholder,
  disabled,
  onChange,
  onSend,
  onCancel,
  className,
}: MessageComposerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend()
          }
          if (e.key === "Escape") {
            onCancel?.()
          }
        }}
        placeholder={placeholder}
        className="flex-1 rounded-full border border-border/60 bg-background/90 px-3 py-2 text-sm font-medium text-foreground placeholder-muted-foreground outline-none transition focus:border-emerald-400/60 focus:ring-0"
        disabled={disabled}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.1, type: "spring", stiffness: 400, damping: 30 } }}
        exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeOut" } }}
      />
      <motion.button
        type="button"
        onClick={onSend}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/80 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        disabled={disabled || !value.trim()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m22 2-7 20-4-9-9-4z" />
          <path d="M22 2 11 13" />
        </svg>
      </motion.button>
    </div>
  )
}
