"use client"

import { CardItem } from "@/components/ui/shadcn-io/3d-card"
import { Heart } from "lucide-react"

interface PlanCardActionsProps {
  isJoined: boolean
  isLiked: boolean
  onJoin: () => void
  onLike: () => void
  translateZ?: string
  className?: string
}

export function PlanCardActions({
  isJoined,
  isLiked,
  onJoin,
  onLike,
  translateZ = "20",
  className = ""
}: PlanCardActionsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <CardItem
        translateZ={translateZ}
        as="button"
        onClick={onJoin}
        className={`flex-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors ${
          isJoined 
            ? 'bg-emerald-600 hover:bg-emerald-700' 
            : 'bg-emerald-500 hover:bg-emerald-600'
        }`}
      >
        {isJoined ? 'Joined' : 'Join'}
      </CardItem>
      <CardItem
        translateZ={translateZ}
        as="button"
        onClick={onLike}
        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
          isLiked
            ? 'border-red-400/50 bg-red-500/20 hover:bg-red-500/30 text-red-200'
            : 'border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200'
        }`}
      >
        <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      </CardItem>
    </div>
  )
}

