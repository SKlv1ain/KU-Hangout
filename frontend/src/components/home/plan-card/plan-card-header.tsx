"use client"

import { MapPin, Calendar, Crown } from "lucide-react"

interface PlanCardHeaderProps {
  title: string
  creatorName: string
  location: string
  dateTime: string
  className?: string
}

export function PlanCardHeader({
  title,
  creatorName,
  location,
  dateTime,
  className = ""
}: PlanCardSimpleHeaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-base font-bold text-foreground">
        {title}
      </h3>
      
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Crown className="h-3 w-3 text-primary" />
        <span>Created by</span>
        <span className="font-semibold text-foreground">{creatorName}</span>
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

