import { PlanCard } from "@/components/home/plan-card"
import type { PlanDetailData } from "@/components/home/plan-detail-panel"

type PlanState = {
  isJoined: boolean
  isLiked: boolean
  isSaved: boolean
}

type PlansState = Record<string | number, PlanState>

interface PlanListProps {
  plans: PlanDetailData[]
  plansState: PlansState
  planOwners: Record<string | number, number>
  user: { id: number } | null
  loading: boolean
  onPlanClick: (plan: PlanDetailData) => void
  onJoin: (planId: string | number | undefined) => void
  onDelete: (planId: string | number | undefined) => void
  onLike: (planId: string | number | undefined) => void
  onSave: (planId: string | number | undefined) => void
  onChat: (planId: string | number | undefined) => void
}

export function PlanList({
  plans,
  plansState,
  planOwners,
  user,
  loading,
  onPlanClick,
  onJoin,
  onDelete,
  onLike,
  onSave,
  onChat
}: PlanListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading plans...</p>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No plans found. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const planId = plan.id || ''
        // Use stable key format to ensure React can track components properly
        const stableKey = `plan-${planId}`
        const isOwner = !!(user && planOwners[planId] === user.id)
        return (
          <PlanCard
            key={stableKey}
            id={planId}
            title={plan.title}
            creatorName={plan.creatorName}
            location={plan.location}
            dateTime={plan.dateTime}
            description={plan.description}
            tags={plan.tags}
            participants={plan.participants}
            participantCount={plan.participantCount}
            images={plan.images}
            isJoined={plansState[planId]?.isJoined ?? plan.isJoined ?? false}
            isLiked={plansState[planId]?.isLiked ?? plan.isLiked ?? false}
            isSaved={plansState[planId]?.isSaved ?? plan.isSaved ?? false}
            isOwner={isOwner}
            onClick={() => onPlanClick(plan)}
            onJoin={() => onJoin(planId)}
            onDelete={() => onDelete(planId)}
            onLike={() => onLike(planId)}
            onSave={() => onSave(planId)}
            onChat={() => onChat(planId)}
          />
        )
      })}
    </div>
  )
}

