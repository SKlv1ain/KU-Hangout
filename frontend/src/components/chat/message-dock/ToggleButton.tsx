import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ToggleButtonProps {
  onToggle: () => void
  isOpen: boolean
  className?: string
}

export function ToggleButton({ onToggle, isOpen, className }: ToggleButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg",
        "hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? "Hide messages dock" : "Show messages dock"}
    >
      <MessageCircle className="h-6 w-6" />
    </motion.button>
  )
}
