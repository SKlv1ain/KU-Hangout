"use client";
import { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/shadcn-io/3d-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import userService, { type UserProfile } from "@/services/userService";
import { Star, Mail, Calendar } from "lucide-react";

interface ThreeDCardDemoProps {
  username?: string;
}

export default function ThreeDCardDemo({ username }: ThreeDCardDemoProps = {}) {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        if (username) {
          // Fetch profile by username
          const profile = await userService.getUserProfileByUsername(username);
          setUserProfile(profile);
        } else if (authUser?.id) {
          // Fallback to current user
          const profile = await userService.getUserProfile(authUser.id);
          setUserProfile(profile);
        } else {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("[UserProfile3DCard] Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [username, authUser?.id]);

  const displayName = userProfile?.display_name || authUser?.username || "Guest";
  const displayUsername = userProfile?.username || authUser?.username || "";
  const profilePicture = userProfile?.profile_picture_url || authUser?.profile_picture || null;
  const bio = (userProfile as any)?.bio || null; // Bio field (may not exist in backend yet)
  const avgRating = typeof userProfile?.avg_rating === 'string' 
    ? parseFloat(userProfile.avg_rating) 
    : (userProfile?.avg_rating ?? 0);
  const reviewCount = userProfile?.review_count ?? 0;
  const contact = userProfile?.contact || authUser?.contact || "";
  const createdAt = userProfile?.created_at || authUser?.created_at || "";

  // Get initials: first character of display_name, or first character of username if no display_name
  const getInitials = (): string => {
    if (displayName && displayName !== "Guest") {
      return displayName[0]?.toUpperCase() || "?";
    }
    if (username) {
      return username[0]?.toUpperCase() || "?";
    }
    return "?";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <CardContainer className="inter-var" containerClassName="py-8">
        <CardBody className="bg-gray-50 relative group/card shadow-lg shadow-black/10 dark:shadow-[0_12px_45px_rgba(255,255,255,0.2)] hover:shadow-[0_30px_95px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_55px_160px_rgba(255,255,255,0.95)] dark:bg-black dark:border-white/[0.25] border-black/[0.08] w-auto sm:w-[24rem] h-auto rounded-xl p-4 border transition-shadow duration-300">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-52 w-52 mx-auto rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </CardBody>
      </CardContainer>
    );
  }

  return (
    <CardContainer className="inter-var" containerClassName="py-8">
      <CardBody className="bg-gray-50 relative group/card shadow-lg shadow-black/10 dark:shadow-[0_12px_45px_rgba(255,255,255,0.2)] hover:shadow-[0_30px_95px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_55px_160px_rgba(255,255,255,0.95)] dark:bg-black dark:border-white/[0.25] border-black/[0.08] w-auto sm:w-[24rem] h-auto rounded-xl p-6 border transition-shadow duration-300">
        <CardItem translateZ="150" className="w-full mt-4 flex justify-center">
          <div className="relative h-52 w-52 rounded-full overflow-hidden border-4 border-white/80 dark:border-white/40 shadow-lg transition-transform duration-500 ease-out group-hover/card:scale-115">
            <Avatar className="h-full w-full">
              <AvatarImage src={profilePicture || undefined} alt={displayName} />
              <AvatarFallback className="text-6xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardItem>

        <div className="mt-6 space-y-3">
          <CardItem
            translateZ="50"
            className="text-2xl font-bold text-neutral-700 dark:text-white text-center"
          >
            {displayName}
          </CardItem>
          
          {displayUsername && (
            <CardItem
              translateZ="60"
              className="text-sm text-neutral-500 dark:text-neutral-400 text-center"
            >
              @{displayUsername}
            </CardItem>
          )}

          {/* Bio Section - Only show if bio exists */}
          {bio ? (
            <CardItem
              translateZ="65"
              className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700"
            >
              <div className="text-sm text-neutral-600 dark:text-neutral-300 text-center">
                <p className="whitespace-pre-wrap break-words">{bio}</p>
              </div>
            </CardItem>
          ) : null}

          {(avgRating > 0 || reviewCount > 0) && (
            <CardItem
              translateZ="70"
              className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-300"
            >
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{avgRating > 0 ? avgRating.toFixed(1) : "0.0"}</span>
              <span className="text-neutral-500 dark:text-neutral-400">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </CardItem>
          )}

          {contact && (
            <CardItem
              translateZ="70"
              className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-300"
            >
              <Mail className="h-4 w-4" />
              <span>{contact}</span>
            </CardItem>
          )}

          {createdAt && (
            <CardItem
              translateZ="70"
              className="flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Joined {formatDate(createdAt)}</span>
            </CardItem>
          )}
        </div>
      </CardBody>
    </CardContainer>
  );
}