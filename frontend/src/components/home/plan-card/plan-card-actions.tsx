"use client"

import { useState } from "react"
import { Heart, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PlanCardActionsProps {
  isJoined: boolean
  isLiked: boolean
  isOwner?: boolean
  onJoin: (e?: React.MouseEvent) => void
  onDelete?: (e?: React.MouseEvent) => void
  onLike: (e?: React.MouseEvent) => void
  onChat?: (e?: React.MouseEvent) => void
  className?: string
}

export function PlanCardActions({
  isJoined,
  isLiked,
  isOwner = false,
  onJoin,
  onDelete,
  onLike,
  onChat,
  className = ""
}: PlanCardSimpleActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onDelete?.(e)
    setDeleteDialogOpen(false)
  }

  const handleLeave = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    onJoin?.(e) // Leave uses the same handler as join
    setLeaveDialogOpen(false)
  }

  // Owner sees Delete button
  if (isOwner) {
    return (
      <div className={`flex gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="flex-1 text-xs font-semibold"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteDialogOpen(true)
              }}
            >
              Delete Plan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the plan
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {onChat && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onChat?.(e)
            }}
            variant="outline"
            size="sm"
            className="px-3 text-xs font-semibold border-border hover:bg-accent"
          >
            <MessageSquare className="h-3 w-3" />
          </Button>
        )}
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

  // Non-owner sees Join/Leave button
  return (
    <div className={`flex gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
      {isJoined ? (
        <>
          <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex-1 text-xs font-semibold"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setLeaveDialogOpen(true)
                }}
              >
                Leave
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave this plan? You will no longer receive
                  updates or be able to participate in this plan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={handleLeave}
                >
                  Leave
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {onChat && (
            <Button
              onClick={onChat}
              variant="outline"
              size="sm"
              className="px-3 text-xs font-semibold border-border hover:bg-accent"
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          )}
        </>
      ) : (
        <Button
          onClick={onJoin}
          className="flex-1 text-xs font-semibold bg-primary hover:bg-primary/90"
          size="sm"
        >
          Join
        </Button>
      )}
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

