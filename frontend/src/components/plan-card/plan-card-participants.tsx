"use client"

import { Users } from "lucide-react"
import { PlanParticipantsAvatarGroup, type ParticipantAvatarData } from "./plan-participants-avatar-group"

export interface ParticipantData {
  id: string | number
  name: string
  image: string | null
  designation?: string
  role?: 'LEADER' | 'MEMBER'
  username?: string
}

interface PlanCardParticipantsProps {
  participants: ParticipantData[]
  participantCount?: number
  className?: string
  maxVisible?: number // Maximum number of avatars to show (default: 5 for plan card)
  separated?: boolean // If true, show avatars separated (no overlap). Default: false (grouped)
}

export function PlanCardParticipants({
  participants,
  participantCount,
  className = "",
  maxVisible = 5, // Default to 5 for plan card
  separated = false // Default to grouped for plan card
}: PlanCardParticipantsProps) {
  const count = participantCount ?? participants.length

  // Convert ParticipantData to ParticipantAvatarData format
  const avatarData: ParticipantAvatarData[] = participants.map(p => ({
    id: p.id,
    name: p.name,
    image: p.image,
    role: p.role,
    username: p.username
  }))

  return (
    <div className={`relative z-0 ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
        <Users className="h-3 w-3" />
        <span className="font-medium">{count} people joined</span>
      </div>
      <div className="flex items-center justify-start relative z-0 pointer-events-auto">
        <PlanParticipantsAvatarGroup
          participants={avatarData}
          maxVisible={maxVisible}
          separated={separated}
        />
      </div>
    </div>
  )
}
