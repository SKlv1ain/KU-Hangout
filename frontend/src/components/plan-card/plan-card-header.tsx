"use client"

import { CardItem } from "@/components/ui/shadcn-io/3d-card"
import { MapPin, Calendar, Crown } from "lucide-react"
import { UserProfileHoverCard } from "@/components/user/user-profile-hover-card"

interface PlanCardHeaderProps {
  title: string
  creatorName: string
  creatorId?: number
  creatorUsername?: string
  location: string
  dateTime: string
  translateZ?: string
  className?: string
}

export function PlanCardHeader({
  title,
  creatorName,
  creatorId,
  creatorUsername,
  location,
  dateTime,
  translateZ = "60",
  className = ""
}: PlanCardHeaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <CardItem
        translateZ="50"
        className="text-base font-bold text-emerald-50"
      >
        {title}
      </CardItem>
      
      <CardItem
        as="div"
        translateZ={translateZ}
        className="flex items-center gap-2 text-emerald-200/80 text-xs"
      >
        <Crown className="h-3 w-3 text-emerald-300" />
        <span className="text-emerald-100/90">Created by</span>
        {creatorId ? (
          <UserProfileHoverCard
            userId={creatorId}
            displayName={creatorName}
            username={creatorUsername || creatorName}
            triggerClassName="font-semibold text-emerald-50"
          />
        ) : (
        <span className="font-semibold text-emerald-50">{creatorName}</span>
        )}
      </CardItem>

      <CardItem
        as="div"
        translateZ={translateZ}
        className="flex items-center gap-2 text-emerald-200/80 text-xs"
      >
        <MapPin className="h-3 w-3" />
        <span>{location}</span>
      </CardItem>

      <CardItem
        as="div"
        translateZ={translateZ}
        className="flex items-center gap-2 text-emerald-200/80 text-xs"
      >
        <Calendar className="h-3 w-3" />
        <span>{dateTime}</span>
      </CardItem>
    </div>
  )
}

