"use client"

import { MapPin, Calendar, Crown } from "lucide-react"
import { UserProfileHoverCard } from "@/components/user/user-profile-hover-card"

interface PlanCardHeaderProps {
  title: string
  creatorName: string
  creatorId?: number
  creatorUsername?: string
  location: string
  dateTime: string
  className?: string
}

export function PlanCardHeader({
  title,
  creatorName,
  creatorId,
  creatorUsername,
  location,
  dateTime,
  className = ""
}: PlanCardHeaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-base font-bold text-foreground">
        {title}
      </h3>
      
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Crown className="h-3 w-3 text-primary" />
        <span>Created by</span>
        {creatorId ? (
          <UserProfileHoverCard
            userId={creatorId}
            displayName={creatorName}
            username={creatorUsername || creatorName}
            triggerClassName="font-semibold text-foreground"
          />
        ) : (
        <span className="font-semibold text-foreground">{creatorName}</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <MapPin className="h-3 w-3" />
        <span>{location}</span>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Calendar className="h-3 w-3" />
        <span>{dateTime}</span>
      </div>
    </div>
  )
}

