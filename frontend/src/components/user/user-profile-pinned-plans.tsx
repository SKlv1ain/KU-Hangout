"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { PinList, type PinListItem } from "@/components/ui/shadcn-io/pin-list";
import userService, { type UserPlans } from "@/services/userService";
import pinnedPlansService from "@/services/pinnedPlansService";
import { MapPin, Calendar } from "lucide-react";

interface UserProfilePinnedPlansProps {
  username: string;
  isOwner?: boolean;
  isEditMode?: boolean;
}

export default function UserProfilePinnedPlans({ username, isOwner = false, isEditMode = false }: UserProfilePinnedPlansProps) {
  const [plans, setPlans] = useState<UserPlans | null>(null);
  const [loading, setLoading] = useState(true);
  const lastReloadTimeRef = useRef<number>(0);
  const RELOAD_COOLDOWN = 1000; // 1 second cooldown to prevent duplicate reloads

  // Handler for pin/unpin - must be declared before early returns (Rules of Hooks)
  // isPinned parameter means: true = we want to PIN it, false = we want to UNPIN it
  const handlePinToggle = useCallback(async (planId: number, isPinned: boolean) => {
    if (!isOwner || !isEditMode) return;
    
    try {
      if (isPinned) {
        // isPinned = true means we want to PIN it
        await pinnedPlansService.pinPlan(planId);
      } else {
        // isPinned = false means we want to UNPIN it
        await pinnedPlansService.unpinPlan(planId);
      }
      
      // Delay reload to allow animation to complete (500ms animation + buffer)
      // This ensures the optimistic update animation completes before we sync with database
      setTimeout(async () => {
        const now = Date.now();
        // Only reload if enough time has passed since last reload (prevent duplicate calls)
        if (now - lastReloadTimeRef.current > RELOAD_COOLDOWN) {
          lastReloadTimeRef.current = now;
          try {
            const data = await userService.getUserPlans(username);
            const plansData: UserPlans = {
              ...data,
              pinned_plan_ids: data.pinned_plan_ids || []
            };
            setPlans(plansData);
          } catch (reloadError) {
            console.error("[UserProfilePinnedPlans] Error reloading plans:", reloadError);
          }
        }
      }, 500); // Wait for animation to complete (500ms)
    } catch (error: any) {
      console.error("[UserProfilePinnedPlans] Error toggling pin:", error);
      // Check if it's the idempotent message (not a real error)
      if (error?.message?.includes("Plan was not pinned")) {
        // Still reload data to ensure UI is in sync
        setTimeout(async () => {
          const now = Date.now();
          if (now - lastReloadTimeRef.current > RELOAD_COOLDOWN) {
            lastReloadTimeRef.current = now;
            try {
              const data = await userService.getUserPlans(username);
              const plansData: UserPlans = {
                ...data,
                pinned_plan_ids: data.pinned_plan_ids || []
              };
              setPlans(plansData);
            } catch (reloadError) {
              console.error("[UserProfilePinnedPlans] Error reloading plans:", reloadError);
            }
          }
        }, 500);
      }
    }
  }, [username, isOwner, isEditMode, plans?.pinned_plan_ids]);

  const loadPlans = useCallback(async (showLoading = true) => {
    if (!username || username.trim() === "") {
      if (showLoading) setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    
    try {
      const data = await userService.getUserPlans(username);
      // Ensure pinned_plan_ids exists (fallback to empty array)
      const plansData: UserPlans = {
        ...data,
        pinned_plan_ids: data.pinned_plan_ids || []
      };
      // Debug logs removed for production
      setPlans(plansData);
    } catch (error) {
      console.error("[UserProfilePinnedPlans] Error loading plans:", error);
      setPlans(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Reload plans when exiting edit mode (to ensure data is fresh)
  // But only if enough time has passed since last reload (prevent duplicate calls)
  useEffect(() => {
    if (!isEditMode && plans) {
      const now = Date.now();
      // Only reload if enough time has passed since last reload
      if (now - lastReloadTimeRef.current > RELOAD_COOLDOWN) {
        // When exiting edit mode, reload to ensure pinned_plan_ids is up to date
        lastReloadTimeRef.current = now;
        loadPlans(true); // Reload with loading indicator
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!plans) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No plans yet</p>
      </div>
    );
  }

  // Convert plans to PinListItem format
  // Combine joined and created plans, avoiding duplicates
  const allPlansMap = new Map<number, any>();
  const pinnedPlanIds = new Set<number>(plans.pinned_plan_ids || []);

  // First, collect all joined plans
  if (plans.joined_plans && Array.isArray(plans.joined_plans)) {
    plans.joined_plans.forEach((plan) => {
      if (!plan || !plan.id) return;
      allPlansMap.set(plan.id, plan);
    });
  }

  // Then, add created plans (avoid duplicates)
  if (plans.created_plans && Array.isArray(plans.created_plans)) {
    plans.created_plans.forEach((plan) => {
      if (!plan || !plan.id) return;
      // Only add if not already in the map (to avoid duplicates)
      if (!allPlansMap.has(plan.id)) {
        allPlansMap.set(plan.id, plan);
      }
    });
  }

  // Convert to PinListItem format
  const pinListItems: PinListItem[] = [];
  allPlansMap.forEach((plan) => {
    try {
      const eventDate = plan.event_time ? new Date(plan.event_time) : null;
      const dateStr = eventDate && !isNaN(eventDate.getTime())
        ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Date TBD';
      const timeStr = eventDate && !isNaN(eventDate.getTime())
        ? eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';
      
      // Determine if plan is pinned (from pinned_plan_ids)
      const isPinned = pinnedPlanIds.has(plan.id);
      // Determine icon: MapPin for pinned plans, Calendar for unpinned plans
      const icon = isPinned ? MapPin : Calendar;
      
      pinListItems.push({
        id: plan.id,
        name: plan.title || 'Untitled Plan',
        info: `${dateStr}${timeStr ? ` · ${timeStr}` : ''} · ${plan.location || 'Location TBD'}`,
        icon: icon,
        pinned: isPinned,
      });
    } catch (error) {
      console.error("[UserProfilePinnedPlans] Error processing plan:", error, plan);
    }
  });

  if (pinListItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No plans yet</p>
      </div>
    );
  }

  // If not in edit mode, only show pinned plans
  const filteredItems = isEditMode 
    ? pinListItems 
    : pinListItems.filter(item => item.pinned);

  if (!isEditMode && filteredItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No pinned plans yet</p>
      </div>
    );
  }

  // Create a key that includes pinned_plan_ids to force remount when pins change
  const pinListKey = `pin-list-${isEditMode ? 'edit' : 'view'}-${(plans.pinned_plan_ids || []).join(',')}`;

  return (
    <PinList
      key={pinListKey}
      items={filteredItems}
      labels={{
        pinned: 'Pinned Plans',
        unpinned: 'All Plans',
      }}
      readonly={!isOwner || !isEditMode}
      onPinToggle={handlePinToggle}
    />
  );
}

