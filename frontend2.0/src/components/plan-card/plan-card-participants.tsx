"use client"

import { Users } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/ui/shadcn-io/avatar-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface ParticipantData {
  id: string | number
  name: string
  image: string
  designation?: string
}

interface PlanCardParticipantsProps {
  participants: ParticipantData[]
  participantCount?: number
  className?: string
}

export function PlanCardParticipants({
  participants,
  participantCount,
  className = ""
}: PlanCardParticipantsProps) {
  const count = participantCount ?? participants.length

  return (
    <div className={`relative z-0 ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
        <Users className="h-3 w-3" />
        <span className="font-medium">{count} people joined</span>
      </div>
      <div className="flex items-center justify-start relative z-0 pointer-events-auto flex-row">
        <TooltipProvider>
          <AvatarGroup variant="css" className="flex-row">
            {participants.map((participant) => (
              <Tooltip key={participant.id}>
                <TooltipTrigger asChild>
                  <Avatar className="size-8 border-2 border-background">
                    <AvatarImage src={participant.image} alt={participant.name} />
                    <AvatarFallback>
                      {participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm font-medium">{participant.name}</div>
                  {participant.designation && (
                    <div className="text-xs text-muted-foreground">{participant.designation}</div>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </AvatarGroup>
        </TooltipProvider>
      </div>
    </div>
  )
}

