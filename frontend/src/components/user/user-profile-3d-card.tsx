"use client";
import { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/shadcn-io/3d-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import userService, { type UserProfile } from "@/services/userService";
import { Star, Mail, Calendar, Globe, Medal, TrendingUp, Users } from "lucide-react";
import UserProfileEditButton from "@/components/user/user-profile-edit-button";
import { Link } from "react-router-dom";

type PreviewProfile = Partial<UserProfile> & { profile_picture_preview?: string | null }

interface ThreeDCardDemoProps {
  username?: string;
  onEditProfile?: (profile?: UserProfile | null) => void;
  containerClassName?: string;
  showEditButton?: boolean;
  refreshKey?: number;
  previewProfile?: PreviewProfile | null;
}

export default function ThreeDCardDemo({ username, onEditProfile, containerClassName, showEditButton = true, refreshKey, previewProfile = null }: ThreeDCardDemoProps = {}) {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [planStats, setPlanStats] = useState<{ created: number; joined: number } | null>(null);
  const [planStatsLoading, setPlanStatsLoading] = useState(false);

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
  }, [username, authUser?.id, refreshKey]);

  const targetUsername = username || userProfile?.username || authUser?.username || null;

  useEffect(() => {
    if (!targetUsername) return;
    let active = true;

    const loadPlanStats = async () => {
      try {
        setPlanStatsLoading(true);
        const data = await userService.getUserPlans(targetUsername);
        if (!active) return;
        const createdCount = Array.isArray(data.created_plans) ? data.created_plans.length : 0;
        const joinedCount = Array.isArray(data.joined_plans) ? data.joined_plans.length : 0;
        setPlanStats({ created: createdCount, joined: joinedCount });
      } catch (error) {
        console.error("[UserProfile3DCard] Error loading plan stats:", error);
        if (active) setPlanStats(null);
      } finally {
        if (active) setPlanStatsLoading(false);
      }
    };

    loadPlanStats();

    return () => {
      active = false;
    };
  }, [targetUsername]);

  const isViewingOwnProfile = !username || authUser?.username === username;
  const mergedPreview = previewProfile ?? {};
  const baseProfile = userProfile ?? (isViewingOwnProfile ? authUser ?? null : null);

  const displayName = mergedPreview.display_name
    ?? baseProfile?.display_name
    ?? baseProfile?.username
    ?? username
    ?? "Guest";

  const displayUsername = mergedPreview.username
    ?? baseProfile?.username
    ?? "";

  const profilePicture = mergedPreview.profile_picture_preview
    ?? mergedPreview.profile_picture_url
    ?? baseProfile?.profile_picture_url
    ?? (baseProfile as any)?.profile_picture
    ?? null;

  const bio = mergedPreview.bio
    ?? (baseProfile as any)?.bio
    ?? null;

  const rawAvgRating = mergedPreview.avg_rating
    ?? baseProfile?.avg_rating
    ?? 0;
  const avgRating = typeof rawAvgRating === 'string'
    ? parseFloat(rawAvgRating)
    : (rawAvgRating ?? 0);

  const reviewCount = mergedPreview.review_count
    ?? baseProfile?.review_count
    ?? 0;

  const contact = mergedPreview.contact
    ?? baseProfile?.contact
    ?? "";

  const createdAt = mergedPreview.created_at
    ?? baseProfile?.created_at
    ?? "";
  const profileUrl = displayUsername ? `/profile/${displayUsername}` : null;

  const normalizeUrl = (value?: string | null) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      return new URL(withProtocol).href;
    } catch {
      return null;
    }
  };

  const resolvedSocialLinks = (() => {
    const sources = [
      mergedPreview.social_links,
      (baseProfile as any)?.social_links,
    ];
    for (const source of sources) {
      if (Array.isArray(source) && source.length > 0) {
        return source as string[];
      }
    }
    const fallbackWebsite = mergedPreview.website
      ?? userProfile?.website
      ?? authUser?.website
      ?? null;
    return fallbackWebsite ? [fallbackWebsite] : [];
  })();

  const socialLinkItems = resolvedSocialLinks
    .map((link) => normalizeUrl(link))
    .filter(Boolean)
    .map((url) => {
      if (!url) return null;
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.replace(/^www\./i, "");
        const segments = parsed.pathname.split("/").filter(Boolean);
        const label = segments.length > 0 ? segments[segments.length - 1] : hostname;
        return {
          url: parsed.href,
          hostname,
          label,
          faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Array<{ url: string; hostname: string; label: string; faviconUrl: string }>;

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

  const canEditProfile = !username || authUser?.username === username;
  const shouldShowEditButton = showEditButton && canEditProfile;

  const resolvedContainerClass = containerClassName ?? "py-8";

  if (loading) {
    return (
      <CardContainer className="inter-var" containerClassName={resolvedContainerClass}>
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
    <CardContainer className="inter-var" containerClassName={resolvedContainerClass}>
      <CardBody className="bg-gray-50 relative group/card shadow-lg shadow-black/10 dark:shadow-[0_12px_45px_rgba(255,255,255,0.2)] hover:shadow-[0_30px_95px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_55px_160px_rgba(255,255,255,0.95)] dark:bg-black dark:border-white/[0.25] border-black/[0.08] w-auto sm:w-[24rem] h-auto rounded-xl p-6 border transition-shadow duration-300">
        {shouldShowEditButton && (
          <CardItem
            translateZ="80"
            className="absolute top-4 right-4"
          >
            <UserProfileEditButton
              onClick={() => onEditProfile?.(userProfile)}
            />
          </CardItem>
        )}
        <CardItem translateZ="150" className="w-full mt-4 flex justify-center">
          {profileUrl ? (
            <Link
              to={profileUrl}
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-shadow"
            >
              <div className="relative h-52 w-52 rounded-full overflow-hidden border-4 border-white/80 dark:border-white/40 shadow-lg transition-transform duration-500 ease-out group-hover/card:scale-115">
                <Avatar className="h-full w-full">
                  <AvatarImage src={profilePicture || undefined} alt={displayName} />
                  <AvatarFallback className="text-6xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          ) : (
            <div className="relative h-52 w-52 rounded-full overflow-hidden border-4 border-white/80 dark:border-white/40 shadow-lg transition-transform duration-500 ease-out group-hover/card:scale-115">
              <Avatar className="h-full w-full">
                <AvatarImage src={profilePicture || undefined} alt={displayName} />
                <AvatarFallback className="text-6xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </CardItem>

        <CardItem translateZ="60" className="w-full mt-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/40 px-3 py-3 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                <Users className="h-3.5 w-3.5" />
                Created
              </div>
              <p className="mt-1.5 text-xl font-semibold text-neutral-800 dark:text-white">
                {planStatsLoading ? "…" : planStats?.created ?? "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/40 px-3 py-3 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                <TrendingUp className="h-3.5 w-3.5" />
                Joined
              </div>
              <p className="mt-1.5 text-xl font-semibold text-neutral-800 dark:text-white">
                {planStatsLoading ? "…" : planStats?.joined ?? "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/40 px-3 py-3 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                <Medal className="h-3.5 w-3.5" />
                Rating
              </div>
              <p className="mt-1.5 text-xl font-semibold text-neutral-800 dark:text-white">
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {reviewCount} review{reviewCount === 1 ? "" : "s"}
              </p>
            </div>
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

          {socialLinkItems.length > 0 && (
            <CardItem
              translateZ="65"
              className="flex flex-wrap items-center justify-center gap-2"
            >
              {socialLinkItems.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-sm text-neutral-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-200"
                >
                  <span className="relative h-4 w-4">
                    <Globe className="h-4 w-4 text-neutral-400" />
                    {item.faviconUrl && (
                      <img
                        src={item.faviconUrl}
                        alt={item.hostname}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                        className="absolute inset-0 h-4 w-4"
                      />
                    )}
                  </span>
                  <span className="truncate max-w-[140px]">{item.label}</span>
                </a>
              ))}
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
