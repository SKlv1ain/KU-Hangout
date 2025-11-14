"use client"

import { useState, useEffect } from "react"
import { X, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageCarousel } from "@/components/plan-card/image-carousel"
import { PlanCardSimpleHeader } from "./plan-card-simple-header"
import { PlanCardSimpleDescription } from "./plan-card-simple-description"
import { PlanCardParticipants } from "@/components/plan-card/plan-card-participants"
import { PlanCardSimpleActions } from "./plan-card-simple-actions"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Clock, Users, User } from "lucide-react"
import type { ParticipantData } from "@/components/plan-card/plan-card-participants"

export interface PlanDetailData {
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
  fullDescription?: string
  maxParticipants?: number
  category?: string
  requirements?: string[]
}

interface PlanDetailPanelProps {
  plan: PlanDetailData | null
  isOpen: boolean
  onClose: () => void
  isOwner?: boolean
  onJoin?: (e?: React.MouseEvent) => void
  onDelete?: (e?: React.MouseEvent) => void
  onLike?: (e?: React.MouseEvent) => void
  onSave?: (e?: React.MouseEvent) => void
  onChat?: (e?: React.MouseEvent) => void
}

export function PlanDetailPanel({
  plan,
  isOpen,
  onClose,
  isOwner = false,
  onJoin,
  onDelete,
  onLike,
  onSave,
  onChat
}: PlanDetailPanelProps) {
  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onSave?.(e)
  }

  const handleJoin = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onJoin?.(e)
  }

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onLike?.(e)
  }

  const handleChat = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onChat?.(e)
  }

  if (!isOpen || !plan) return null

  return (
    <div 
      className="flex-[2] bg-background border-l border-border shadow-lg flex flex-col flex-shrink-0"
      style={{ height: '100%' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0 gap-3">
        <h2 className="text-lg font-semibold flex-shrink-0">Plan Details</h2>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="h-8 w-8"
          >
            <Bookmark 
              className={`h-4 w-4 transition-colors ${
                plan.isSaved 
                  ? 'fill-yellow-500 text-yellow-500' 
                  : 'text-muted-foreground'
              }`} 
            />
          </Button>
          <PlanCardSimpleActions
            isJoined={plan.isJoined || false}
            isLiked={plan.isLiked || false}
            isOwner={isOwner}
            onJoin={handleJoin}
            onDelete={onDelete}
            onLike={handleLike}
            onChat={handleChat}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-scroll" style={{ minHeight: 0 }}>
        {/* Image Section */}
        <div className="w-full h-64 relative">
          <ImageCarousel 
            images={plan.images}
            alt={plan.title}
            className="w-full h-full"
            minHeight="256px"
          />
        </div>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <PlanCardSimpleHeader
            title={plan.title}
            creatorName={plan.creatorName}
            location={plan.location}
            dateTime={plan.dateTime}
          />

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {plan.fullDescription || plan.description}
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Tags</h3>
            <PlanCardSimpleDescription
              description=""
              tags={plan.tags}
            />
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{plan.location}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-medium">{plan.dateTime}</p>
                </div>
              </div>

              {plan.maxParticipants && (
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Participants</p>
                    <p className="text-sm font-medium">
                      {plan.participantCount || plan.participants.length} / {plan.maxParticipants} people
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Created by</p>
                  <p className="text-sm font-medium">{plan.creatorName}</p>
                </div>
              </div>
            </div>
          </div>

          {plan.requirements && plan.requirements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {plan.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Separator />

          {/* Participants */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Participants</h3>
            <PlanCardParticipants
              participants={plan.participants}
              participantCount={plan.participantCount}
              maxVisible={999} // Show all participants in detail panel (no limit)
              separated={true} // Show avatars separated (not grouped)
            />
          </div>
        </div>
      </div>
    </div>
  )
}

