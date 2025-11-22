"use client"

import { useState, useEffect, useCallback } from "react"
import { CalendarIcon, MapPinIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating"
import { Separator } from "@/components/ui/separator"
import { StarIcon } from "lucide-react"
import reviewsService from "@/services/reviewsService"
import userService, { type UserProfile } from "@/services/userService"
import { useAuth } from "@/context/AuthContext"

interface UserProfileHoverCardProps {
  userId: number
  displayName?: string
  username: string
  profilePicture?: string | null
  avgRating?: number
  reviewCount?: number
  triggerClassName?: string
}

export function UserProfileHoverCard({
  userId,
  displayName,
  username,
  profilePicture,
  avgRating: initialAvgRating,
  reviewCount: initialReviewCount,
  triggerClassName = "",
}: UserProfileHoverCardProps) {
  const { user: currentUser } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [avgRating, setAvgRating] = useState<number>(initialAvgRating || 0)
  const [reviewCount, setReviewCount] = useState<number>(initialReviewCount || 0)
  const [currentRating, setCurrentRating] = useState<number>(0) // Use 0 instead of null to avoid controlled/uncontrolled warning
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHoverOpen, setIsHoverOpen] = useState(false)
  const [hasLoadedRating, setHasLoadedRating] = useState(false)

  // Load user profile data (always load on mount)
  useEffect(() => {
    if (!userId || !currentUser) {
      return
    }

    const loadUserProfile = async () => {
      try {
        const profile = await userService.getUserProfile(userId)
        setUserProfile(profile)
        if (profile.avg_rating !== undefined) {
          // Convert string to number if needed (backend DecimalField returns string)
          const rating = typeof profile.avg_rating === 'string' 
            ? parseFloat(profile.avg_rating) 
            : profile.avg_rating
          setAvgRating(rating || 0)
        }
        if (profile.review_count !== undefined) {
          setReviewCount(profile.review_count)
        }
      } catch (error) {
        console.error('[UserProfileHoverCard] Error loading user profile:', error)
      }
    }

    loadUserProfile()
  }, [userId, currentUser])

  // Load current user's rating only when hover card opens (lazy loading)
  useEffect(() => {
    if (!isHoverOpen || hasLoadedRating || !currentUser || !userId) {
      return
    }

    // Only load current user's rating if they can rate this user (not themselves)
    const canRateUser = currentUser.id !== userId
    if (!canRateUser) {
      return
    }

    const loadRating = async () => {
      try {
        const existingRating = await reviewsService.getUserRating(userId)
        if (existingRating && existingRating.rating) {
          setCurrentRating(existingRating.rating)
        }
        setHasLoadedRating(true)
      } catch (error) {
        // Silently handle errors (404 is expected if no rating exists)
        setHasLoadedRating(true)
      }
    }

    loadRating()
  }, [isHoverOpen, hasLoadedRating, currentUser, userId])

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle rating submission
  const handleRatingChange = useCallback(async (value: number) => {
    if (!currentUser || currentUser.id === userId) return // Can't rate yourself
    
    setIsSubmitting(true)
    try {
      const response = await reviewsService.submitRating(userId, value)
      
      // Optimistic update
      setCurrentRating(value)
      
      // Update stats from response
      if (response.updated_stats) {
        setAvgRating(response.updated_stats.avg_rating)
        setReviewCount(response.updated_stats.review_count)
      }
      
      // Reload user profile to get latest data
      const updatedProfile = await userService.getUserProfile(userId)
      setUserProfile(updatedProfile)
      if (updatedProfile.avg_rating !== undefined) {
        const rating = typeof updatedProfile.avg_rating === 'string' 
          ? parseFloat(updatedProfile.avg_rating) 
          : updatedProfile.avg_rating
        setAvgRating(rating || 0)
      }
      if (updatedProfile.review_count !== undefined) {
        setReviewCount(updatedProfile.review_count)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      // Revert optimistic update on error
      setCurrentRating(0)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentUser, userId])

  const displayNameToShow = displayName || userProfile?.display_name || username
  const profilePictureToShow = profilePicture || userProfile?.profile_picture_url
  
  // Convert avg_rating to number (backend returns string from DecimalField)
  const finalAvgRating = typeof (userProfile?.avg_rating) === 'string' 
    ? parseFloat(userProfile.avg_rating) 
    : (userProfile?.avg_rating ?? avgRating ?? 0)
  const finalReviewCount = userProfile?.review_count ?? reviewCount ?? 0
  const canRate = currentUser && currentUser.id !== userId

  if (!userId) {
    return <span className={triggerClassName}>{displayNameToShow}</span>
  }

  return (
    <span className="inline-block" style={{ pointerEvents: 'auto', zIndex: 10 }}>
      <HoverCard 
        openDelay={200} 
        closeDelay={100}
        onOpenChange={(open) => setIsHoverOpen(open)}
      >
        <HoverCardTrigger asChild>
          <Button
            variant="link"
            className={`p-0 h-auto ${triggerClassName}`}
            style={{ pointerEvents: 'auto' }}
          >
            {displayNameToShow}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent 
          className="w-80 z-[100]" 
          side="right" 
          align="start"
          sideOffset={8}
        >
        <div className="space-y-4">
          {/* User Info Section */}
          <div className="flex justify-between gap-4">
            <Avatar>
              <AvatarImage src={profilePictureToShow || undefined} alt={displayNameToShow} />
              <AvatarFallback>{getInitials(displayNameToShow)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-semibold">{displayNameToShow}</h4>
              <p className="text-sm text-muted-foreground">@{username}</p>
              {userProfile?.contact && (
                <div className="flex items-center text-xs text-muted-foreground pt-1">
                  <MapPinIcon className="mr-1 h-3 w-3" />
                  {userProfile.contact}
                </div>
              )}
              {userProfile?.created_at && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Joined {formatDate(userProfile.created_at)}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Read-only Rating Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1
                  const ratingNum = typeof finalAvgRating === 'number' ? finalAvgRating : parseFloat(String(finalAvgRating)) || 0
                  const isFilled = starValue <= Math.round(ratingNum)
                  return (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${
                        isFilled
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  )
                })}
              </div>
              <span className="text-sm text-muted-foreground">
                ({finalReviewCount} {finalReviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            {(() => {
              const ratingNum = typeof finalAvgRating === 'number' ? finalAvgRating : parseFloat(String(finalAvgRating)) || 0
              return ratingNum > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Average rating: {ratingNum.toFixed(1)} / 5.0
                </p>
              ) : null
            })()}
          </div>

          {/* Interactive Rating Section (Footer) */}
          {canRate && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium">Rate this user</p>
                <Rating
                  defaultValue={currentRating > 0 ? currentRating : 0}
                  onValueChange={handleRatingChange}
                  readOnly={isSubmitting}
                  className="pointer-events-auto"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingButton
                      key={index}
                      className="text-yellow-500"
                      size={20}
                    />
                  ))}
                </Rating>
                {currentRating > 0 && (
                  <p className="text-xs text-muted-foreground">
                    You rated {currentRating} star{currentRating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
    </span>
  )
}

