import type { Plan } from "@/services/plansService"
import type { PlanDetailData } from "@/components/home/plan-detail-panel"
import type { ParticipantData } from "@/components/plan-card/plan-card-participants"
import { SAMPLE_IMAGES } from "./constants"

const cleanTagLabel = (label: string): string =>
  label.replace(/[["'\]]/g, "").trim()

const expandTagString = (value: string): string[] => {
  const trimmed = value.trim()
  if (!trimmed) return []

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map((item) =>
          typeof item === "string" ? cleanTagLabel(item) : cleanTagLabel(String(item))
        )
      }
    } catch {
      // Ignore parse error and fall through to manual splitting
    }
  }

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((segment) => cleanTagLabel(segment))
      .filter(Boolean)
  }

  return [cleanTagLabel(trimmed)]
}

const normalizeTagInput = (input: unknown): string[] => {
  if (!input) return []

  if (Array.isArray(input)) {
    return input.flatMap((item) => normalizeTagInput(item))
  }

  if (typeof input === "string") {
    return expandTagString(input)
  }

  if (typeof input === "object") {
    if ("name" in (input as Record<string, unknown>)) {
      return normalizeTagInput((input as Record<string, unknown>).name)
    }
    if ("label" in (input as Record<string, unknown>)) {
      return normalizeTagInput((input as Record<string, unknown>).label)
    }
  }

  return []
}

// Helper function to generate tag colors
export const getTagColor = (tagLabel: string): string => {
  const tagColors: Record<string, string> = {
    "Study": "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400/30",
    "Café": "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/30",
    "Weekend": "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-400/30",
    "Group": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30",
    "Sports": "bg-green-500/20 text-green-700 dark:text-green-300 border-green-400/30",
    "Outdoor": "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-400/30",
    "Entertainment": "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-400/30",
    "Social": "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/30",
    "Evening": "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-400/30",
    "Food": "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/30",
    "Adventure": "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400/30",
  }
  return tagColors[tagLabel] || "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-400/30"
}

// Format date and time for display
export const formatDateTime = (eventTime: string): string => {
  const eventDate = new Date(eventTime)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  const dayName = days[eventDate.getDay()]
  const monthName = months[eventDate.getMonth()]
  const day = eventDate.getDate()
  const hours = eventDate.getHours()
  const minutes = eventDate.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"
  const displayHour = hours % 12 || 12
  const formattedTime = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`
  
  return `${dayName}, ${monthName} ${day} • ${formattedTime}`
}

// Convert backend Plan to frontend PlanDetailData
export const convertPlanToDetailData = (
  plan: Plan,
  setPlanOwners: (updater: (prev: Record<string | number, number>) => Record<string | number, number>) => void
): PlanDetailData => {
  // Store leader_id for owner check
  setPlanOwners(prev => ({
    ...prev,
    [plan.id]: plan.leader_id
  }))

  // Debug logging removed to reduce console noise

  // Convert tags
  // Handle both tags_display (array of objects) and tags (array/string from legacy plans)
  let tags: Array<{ label: string; color: string }> = []

  if (plan.tags_display && plan.tags_display.length > 0) {
    const tagNames = plan.tags_display.flatMap((tag) => normalizeTagInput(tag.name))
    tags = tagNames.map((tagName) => ({
      label: tagName,
      color: getTagColor(tagName),
    }))
  } else if (plan.tags && plan.tags.length > 0) {
    const tagNames = normalizeTagInput(plan.tags)
      .map((tagName) => tagName.trim())
      .filter(Boolean)

    tags = tagNames.map((tagName) => ({
      label: tagName,
      color: getTagColor(tagName),
    }))
  }

  // Convert members to ParticipantData format
  const participants: ParticipantData[] = (plan.members || []).map(member => ({
    id: member.user_id,
    name: member.display_name || member.username || 'Unknown',
    image: member.profile_picture,
    designation: member.role === 'LEADER' ? 'Leader' : undefined,
    role: member.role,
    username: member.username,
  }))

  // Find leader in members to get their username
  const leaderMember = plan.members?.find(m => m.role === 'LEADER')
  const creatorUsername = leaderMember?.username || plan.creator_username

  const normalizeCoordinate = (value?: number | string | null): number | null => {
    if (value === undefined || value === null) return null
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null
    }
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return {
    id: plan.id,
    title: plan.title,
    creatorName: leaderMember?.display_name || plan.creator_username,
    creatorUsername: creatorUsername,
    creatorId: plan.leader_id,
    location: plan.location,
    lat: normalizeCoordinate(plan.lat),
    lng: normalizeCoordinate(plan.lng),
    dateTime: formatDateTime(plan.event_time),
    description: plan.description,
    fullDescription: plan.description,
    tags,
    participants,
    participantCount: plan.people_joined,
    maxParticipants: plan.max_people,
    images: plan.images && plan.images.length > 0 ? plan.images : SAMPLE_IMAGES,
    isJoined: plan.joined ?? false,
    isLiked: false,
    isSaved: plan.is_saved ?? false,
    requirements: []
  }
}

// Convert array of backend plans to frontend format
export const convertPlansArray = (
  backendPlans: Plan[],
  setPlanOwners: (updater: (prev: Record<string | number, number>) => Record<string | number, number>) => void
): PlanDetailData[] => {
  return backendPlans.map(plan => convertPlanToDetailData(plan, setPlanOwners))
}

// Check if a plan is saved (prioritize plansState for optimistic updates)
export const isPlanSaved = (
  plan: PlanDetailData,
  plansState: Record<string | number, { isSaved?: boolean }>
): boolean => {
  const planId = plan.id || ''
  // Prioritize plansState (optimistic update) over plan.isSaved (from API)
  if (plansState[planId]?.isSaved !== undefined) {
    return plansState[planId]?.isSaved === true
  }
  // Fallback to plan.isSaved if plansState doesn't have this plan yet
  return plan.isSaved === true
}

// Calculate saved plans count
export const calculateSavedCount = (
  plans: PlanDetailData[],
  plansState: Record<string | number, { isSaved?: boolean }>
): number => {
  return plans.filter(plan => isPlanSaved(plan, plansState)).length
}

// Calculate my plans count (plans created by current user)
export const calculateMyPlansCount = (
  plans: PlanDetailData[],
  planOwners: Record<string | number, number>,
  userId: number | undefined
): number => {
  if (!userId) return 0
  return plans.filter(plan => {
    const planId = plan.id || ''
    return planOwners[planId] === userId
  }).length
}

// Filter plans by active tab
export const filterPlansByTab = (
  plans: PlanDetailData[],
  activeTab: 'feed' | 'saved' | 'my-plans',
  plansState: Record<string | number, { isSaved?: boolean }>,
  planOwners: Record<string | number, number>,
  userId: number | undefined
): PlanDetailData[] => {
  return plans.filter(plan => {
    const planId = plan.id || ''
    
    if (activeTab === 'saved') {
      return isPlanSaved(plan, plansState)
    }
    
    if (activeTab === 'my-plans') {
      return userId !== undefined && planOwners[planId] === userId
    }
    
    // For 'feed' tab, show all plans
    return true
  })
}

// Save minimal plan data to localStorage for message page
export const savePlansToLocalStorage = (plans: PlanDetailData[]): void => {
  try {
    const minimalPlans = plans.map(plan => ({
      id: plan.id,
      title: plan.title,
      creatorName: plan.creatorName
    }))
    localStorage.setItem('ku-hangout-plans', JSON.stringify(minimalPlans))
  } catch (error) {
    console.error('Error saving plans to localStorage:', error)
    // Retry once after clearing old data
    try {
      localStorage.removeItem('ku-hangout-plans')
      const minimalPlans = plans.map(plan => ({
        id: plan.id,
        title: plan.title,
        creatorName: plan.creatorName
      }))
      localStorage.setItem('ku-hangout-plans', JSON.stringify(minimalPlans))
    } catch (retryError) {
      console.error('Error retrying save to localStorage:', retryError)
    }
  }
}
