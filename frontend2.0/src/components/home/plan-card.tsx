"use client"

import { useNavigate } from "react-router-dom"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageCarousel } from "@/components/plan-card/image-carousel"
import { PlanCardSimpleHeader } from "./plan-card-simple-header"
import { PlanCardSimpleDescription } from "./plan-card-simple-description"
import { PlanCardParticipants } from "@/components/plan-card/plan-card-participants"
import { PlanCardSimpleActions } from "./plan-card-simple-actions"
import type { ParticipantData } from "@/components/plan-card/plan-card-participants"

export interface PlanCardProps {
  id?: string | number
  title: string
  creatorName: string
  location: string
  dateTime: string
  description: string
  tags: Array<{ label: string; color: string }>
  participants: ParticipantData[]
  participantCount?: number
  images: string[]
  isJoined?: boolean
  isLiked?: boolean
  isSaved?: boolean
  isOwner?: boolean
  onJoin?: (e?: React.MouseEvent) => void
  onDelete?: (e?: React.MouseEvent) => void
  onLike?: (e?: React.MouseEvent) => void
  onSave?: (e?: React.MouseEvent) => void
  onChat?: (e?: React.MouseEvent) => void
  onClick?: () => void
  href?: string
  className?: string
}

export function PlanCard({
  title,
  creatorName,
  location,
  dateTime,
  description,
  tags,
  participants,
  participantCount,
  images,
  isJoined = false,
  isLiked = false,
  isSaved = false,
  isOwner = false,
  onJoin,
  onDelete,
  onLike,
  onSave,
  onChat,
  onClick,
  href,
  className = ""
}: PlanCardProps) {
  const navigate = useNavigate()

  const handleJoin = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onJoin?.(e)
  }

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onLike?.(e)
  }

  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onSave?.(e)
  }

  const handleChat = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onChat?.(e)
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      navigate(href)
    }
    // Removed auto-navigation to /plans/${id} - now handled by parent component
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group relative ${className}`}
    >
      {/* Save Button - Top Right */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSave}
        className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full shadow-sm"
      >
        <Bookmark 
          className={`h-4 w-4 transition-colors ${
            isSaved 
              ? 'fill-yellow-500 text-yellow-500' 
              : 'text-muted-foreground'
          }`} 
        />
      </Button>

      <div className="flex flex-row">
        {/* Image Section - 40% */}
        <div className="w-[40%] flex-shrink-0 relative overflow-hidden rounded-l-lg group-hover:scale-[1.02] transition-transform duration-200">
          <ImageCarousel 
            images={images}
            alt={title}
            className="rounded-l-lg"
            minHeight="280px"
          />
        </div>
        
        {/* Content Section - 60% */}
        <div className="flex-1 p-5 flex flex-col justify-between min-h-[280px] bg-background group-hover:bg-accent/5 transition-colors duration-200">
          <div className="space-y-2">
            <PlanCardSimpleHeader
              title={title}
              creatorName={creatorName}
              location={location}
              dateTime={dateTime}
            />

            <PlanCardSimpleDescription
              description={description}
              tags={tags}
            />
          </div>

          <div className="mt-3 space-y-2">
            <PlanCardParticipants
              participants={participants}
              participantCount={participantCount}
            />

            <PlanCardSimpleActions
              isJoined={isJoined}
              isLiked={isLiked}
              isOwner={isOwner}
              onJoin={handleJoin}
              onDelete={onDelete}
              onLike={handleLike}
              onChat={handleChat}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

