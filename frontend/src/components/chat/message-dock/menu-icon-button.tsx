import { motion } from "framer-motion"

interface MenuIconButtonProps {
  onClick?: () => void
}

export function MenuIconButton({ onClick }: MenuIconButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground"
      style={{ backgroundColor: "transparent", border: "none" }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Menu"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </motion.button>
  )
}
