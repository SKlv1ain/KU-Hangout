"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarGroup, AvatarGroupTooltip } from "@/components/ui/shadcn-io/avatar-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface ParticipantAvatarData {
  id: string | number
  name: string
  image: string | null
  role?: 'LEADER' | 'MEMBER'
}

interface PlanParticipantsAvatarGroupProps {
  participants: ParticipantAvatarData[]
  maxVisible?: number
  className?: string
  separated?: boolean // If true, show avatars separated (no overlap). Default: false (grouped)
}

/**
 * Reusable AvatarGroup component for displaying plan participants
 * Shows up to maxVisible avatars, with a "+N" avatar for remaining participants
 */
export function PlanParticipantsAvatarGroup({
  participants,
  maxVisible = 5,
  className = "",
  separated = false
}: PlanParticipantsAvatarGroupProps) {
  if (participants.length === 0) {
    return null
  }

  // Get initials from display name or username
  const getInitials = (name: string): string => {
    if (!name) return "?"
    
    // Split by space and get first letter of each word
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      // First letter of first name + first letter of last name
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
    } else if (parts.length === 1 && parts[0].length > 0) {
      // Single word: use first 2 characters
      return parts[0].slice(0, 2).toUpperCase()
    }
    // Fallback: use first character of username if available
    return name[0]?.toUpperCase() || "?"
  }

  const visibleParticipants = participants.slice(0, maxVisible)
  const remainingCount = Math.max(0, participants.length - maxVisible)
  const remainingParticipants = remainingCount > 0 ? participants.slice(maxVisible) : []

  // Create array of Avatar elements
  const avatarElements = visibleParticipants.map((participant) => {
    const isLeader = participant.role === 'LEADER'
    
    // Special styling for Leader: gold border only
    const avatarClassName = isLeader
      ? "size-6 border-[2px] border-amber-500"
      : "size-6 border-[1.5px] border-gray-600 dark:border-gray-300"
    
    return (
      <Avatar key={participant.id} className={avatarClassName}>
        <AvatarImage src={participant.image || undefined} alt={participant.name} />
        <AvatarFallback className={isLeader ? "font-semibold" : ""}>
          {getInitials(participant.name)}
        </AvatarFallback>
        <AvatarGroupTooltip className="z-50 bg-popover border border-border shadow-lg px-3 py-2 rounded-md">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{participant.name}</p>
            {isLeader && (
              <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium border border-amber-500/30">
                Leader
              </span>
            )}
          </div>
        </AvatarGroupTooltip>
      </Avatar>
    )
  })

  // Add remaining count avatar if needed
  if (remainingCount > 0) {
    avatarElements.push(
      <Avatar key="remaining" className="size-6 border-[1.5px] border-gray-600 dark:border-gray-300">
        <AvatarFallback>+{remainingCount}</AvatarFallback>
        <AvatarGroupTooltip className="z-50 bg-popover border border-border shadow-lg px-3 py-2 rounded-md max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-foreground">+{remainingCount} more</p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              {remainingParticipants.map((p) => (
                <div key={p.id}>{p.name}</div>
              ))}
            </div>
          </div>
        </AvatarGroupTooltip>
      </Avatar>
    )
  }

  // If separated, use flex layout with gap instead of AvatarGroup
  if (separated) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className={`flex flex-wrap items-center gap-3 ${className}`}>
          {visibleParticipants.map((participant) => {
            const isLeader = participant.role === 'LEADER'
            const avatarClassName = isLeader
              ? "size-12 border-[3px] border-amber-500"
              : "size-12 border-2 border-gray-600 dark:border-gray-300"
            
            return (
              <Tooltip key={participant.id}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className={avatarClassName}>
                      <AvatarImage src={participant.image || undefined} alt={participant.name} />
                      <AvatarFallback className={isLeader ? "font-semibold" : ""}>
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="z-50 bg-popover border border-border shadow-lg px-3 py-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{participant.name}</p>
                    {isLeader && (
                      <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium border border-amber-500/30">
                        Leader
                      </span>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
          
          {/* Remaining count avatar if needed */}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="size-12 border-2 border-gray-600 dark:border-gray-300">
                    <AvatarFallback>+{remainingCount}</AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent className="z-50 bg-popover border border-border shadow-lg px-3 py-2 rounded-md max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">+{remainingCount} more</p>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {remainingParticipants.map((p) => (
                      <div key={p.id}>{p.name}</div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    )
  }

  return (
    <AvatarGroup variant="motion" className={`h-6 -space-x-1 ${className}`}>
      {avatarElements}
    </AvatarGroup>
  )
}

