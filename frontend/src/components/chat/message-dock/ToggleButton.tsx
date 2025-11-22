import { ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ToggleButtonProps {
  onToggle: () => void
  isOpen: boolean
  className?: string
}

export function ToggleButton({ onToggle, isOpen, className }: ToggleButtonProps) {
  const Icon = isOpen ? ChevronDown : ChevronUp

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm",
            "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          aria-label={isOpen ? "Hide messages dock" : "Show messages dock"}
        >
          <Icon className="h-5 w-5" />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top">cmd + enter</TooltipContent>
    </Tooltip>
  )
}
