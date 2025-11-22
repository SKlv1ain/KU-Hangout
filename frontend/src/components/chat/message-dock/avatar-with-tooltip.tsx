import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface AvatarWithTooltipProps {
  roomName: string
  children: React.ReactNode
}

export function AvatarWithTooltip({ roomName, children }: AvatarWithTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-md bg-emerald-600 px-2 py-1 text-xs text-white shadow-lg z-50"
          >
            {roomName}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
