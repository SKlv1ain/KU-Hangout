"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlanCardSimpleActionsProps {
  isJoined: boolean
  isLiked: boolean
  onJoin: (e?: React.MouseEvent) => void
  onLike: (e?: React.MouseEvent) => void
  className?: string
}

export function PlanCardSimpleActions({
  isJoined,
  isLiked,
  onJoin,
  onLike,
  className = ""
}: PlanCardSimpleActionsProps) {
  return (
    <div className={`flex gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
      <Button
        onClick={onJoin}
        className={`flex-1 text-xs font-semibold ${
          isJoined 
            ? 'bg-primary hover:bg-primary/90' 
            : 'bg-primary hover:bg-primary/90'
        }`}
        size="sm"
      >
        {isJoined ? 'Joined' : 'Join'}
      </Button>
      <Button
        onClick={onLike}
        variant="outline"
        size="sm"
        className={`px-3 text-xs font-semibold ${
          isLiked
            ? 'border-red-400/50 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400'
            : 'border-border hover:bg-accent'
        }`}
      >
        <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      </Button>
    </div>
  )
}

