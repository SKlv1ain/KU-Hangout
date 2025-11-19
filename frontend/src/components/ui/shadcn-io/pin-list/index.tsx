'use client';
 
import * as React from 'react';
import { Pin } from 'lucide-react';
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';
import { cn } from '@/lib/utils';
 
type PinListItem = {
  id: number;
  name: string;
  info: string;
  icon: React.ElementType;
  pinned: boolean;
};
 
type PinListProps = {
  items: PinListItem[];
  labels?: {
    pinned?: string;
    unpinned?: string;
  };
  transition?: Transition;
  labelMotionProps?: HTMLMotionProps<'p'>;
  className?: string;
  labelClassName?: string;
  pinnedSectionClassName?: string;
  unpinnedSectionClassName?: string;
  zIndexResetDelay?: number;
  readonly?: boolean;
  onPinToggle?: (id: number, pinned: boolean) => void | Promise<void>;
} & HTMLMotionProps<'div'>;
 
function PinList({
  items,
  labels = { pinned: 'Pinned Items', unpinned: 'All Items' },
  transition = { stiffness: 320, damping: 20, mass: 0.8, type: 'spring' },
  labelMotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: 'easeInOut' },
  },
  className,
  labelClassName,
  pinnedSectionClassName,
  unpinnedSectionClassName,
  zIndexResetDelay = 500,
  readonly = false,
  onPinToggle,
  ...props
}: PinListProps) {
  const [listItems, setListItems] = React.useState(items);
  const [togglingGroup, setTogglingGroup] = React.useState<
    'pinned' | 'unpinned' | null
  >(null);
  const isTogglingRef = React.useRef(false);

  // Sync state with props when items change
  // Use pin status from props (from database) instead of preserving from state
  // But delay sync if we're currently toggling to allow animation to complete
  React.useEffect(() => {
    // Don't sync if we're currently toggling (let animation complete first)
    if (isTogglingRef.current) {
      // Delay sync until after animation completes and data reload
      const timeoutId = setTimeout(() => {
        // Remove duplicates by id and use pin status from props
        const uniqueItems = Array.from(
          new Map(items.map(item => [item.id, item])).values()
        );
        console.log("[PinList] Syncing state with props after animation:", uniqueItems);
        setListItems(uniqueItems);
        isTogglingRef.current = false;
      }, zIndexResetDelay + 200); // Wait for animation + buffer for data reload
      return () => clearTimeout(timeoutId);
    }
    
    // Remove duplicates by id and use pin status from props
    const uniqueItems = Array.from(
      new Map(items.map(item => [item.id, item])).values()
    );
    
    // Always update to match props (props are source of truth from database)
    setListItems(uniqueItems);
  }, [items, zIndexResetDelay]);

  // Remove duplicates by id
  const uniqueListItems = React.useMemo(() => {
    const seen = new Set<number>();
    return listItems.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }, [listItems]);

  const pinned = uniqueListItems.filter((u) => u.pinned);
  const unpinned = uniqueListItems.filter((u) => !u.pinned);
 
  const toggleStatus = (id: number) => {
    if (readonly) return; // Don't allow toggling in readonly mode
    
    const item = uniqueListItems.find((u) => u.id === id);
    if (!item) return;
 
    const newPinnedStatus = !item.pinned;
    
    console.log("[PinList] toggleStatus called:", { id, currentPinned: item.pinned, newPinnedStatus });
    
    // Mark that we're toggling to prevent immediate sync with props
    isTogglingRef.current = true;
    
    // Optimistic update first (immediate UI feedback)
    setTogglingGroup(item.pinned ? 'pinned' : 'unpinned');
    setListItems((prev) => {
      // Remove duplicates first
      const seen = new Set<number>();
      const uniquePrev = prev.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      
      const idx = uniquePrev.findIndex((u) => u.id === id);
      if (idx === -1) return uniquePrev;
      const updated = [...uniquePrev];
      const [item] = updated.splice(idx, 1);
      if (!item) return uniquePrev;
      const toggled = { ...item, pinned: newPinnedStatus };
      if (toggled.pinned) updated.push(toggled);
      else updated.unshift(toggled);
      return updated;
    });
    
    // Call onPinToggle callback if provided (for API calls)
    // newPinnedStatus = true means we want to PIN it (call pinPlan)
    // newPinnedStatus = false means we want to UNPIN it (call unpinPlan)
    if (onPinToggle) {
      console.log("[PinList] Calling onPinToggle with:", { id, newPinnedStatus });
      const result = onPinToggle(id, newPinnedStatus);
      // Handle async callback
      if (result instanceof Promise) {
        result.catch(error => {
          console.error("[PinList] Error in onPinToggle callback:", error);
          // Revert optimistic update on error
          setListItems((prev) => {
            const seen = new Set<number>();
            const uniquePrev = prev.filter(item => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
            const idx = uniquePrev.findIndex((u) => u.id === id);
            if (idx === -1) return uniquePrev;
            const updated = [...uniquePrev];
            const [item] = updated.splice(idx, 1);
            if (!item) return uniquePrev;
            const reverted = { ...item, pinned: !newPinnedStatus };
            if (reverted.pinned) updated.push(reverted);
            else updated.unshift(reverted);
            return updated;
          });
          isTogglingRef.current = false; // Reset on error
        });
      }
    }
    
    // Reset group z-index after the animation duration (keep in sync with animation timing)
    setTimeout(() => {
      setTogglingGroup(null);
      // Keep isTogglingRef.current = true until data reload completes
      // It will be reset in useEffect when sync happens
    }, zIndexResetDelay);
  };
 
  return (
    <motion.div className={cn('space-y-10', className)} {...props}>
      <LayoutGroup>
        <div className="min-h-0">
          <AnimatePresence mode="wait">
            {pinned.length > 0 && (
              <motion.p
                layout
                key="pinned-label"
                className={cn(
                  'font-medium px-3 text-neutral-500 dark:text-neutral-300 text-sm mb-2',
                  labelClassName,
                )}
                {...labelMotionProps}
              >
                {labels.pinned}
              </motion.p>
            )}
          </AnimatePresence>
          {pinned.length > 0 && (
            <div
              className={cn(
                'space-y-3 relative min-h-0',
                togglingGroup === 'pinned' ? 'z-5' : 'z-10',
                pinnedSectionClassName,
              )}
            >
              {pinned.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  onClick={() => toggleStatus(item.id)}
                  transition={transition}
                  layout
                  className={`flex items-center justify-between gap-5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 p-2 ${readonly ? '' : 'cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-background p-2">
                      {React.createElement(item.icon as React.ComponentType<any>, { className: "size-5 text-neutral-500 dark:text-neutral-400" })}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {item.info}
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center justify-center size-8 rounded-full bg-neutral-400 dark:bg-neutral-600 flex-shrink-0">
                    <Pin className="size-4 text-white fill-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
 
        <div className="min-h-0">
          <AnimatePresence mode="wait">
            {unpinned.length > 0 && (
              <motion.p
                layout
                key="all-label"
                className={cn(
                  'font-medium px-3 text-neutral-500 dark:text-neutral-300 text-sm mb-2',
                  labelClassName,
                )}
                {...labelMotionProps}
              >
                {labels.unpinned}
              </motion.p>
            )}
          </AnimatePresence>
          {unpinned.length > 0 && (
            <div
              className={cn(
                'space-y-3 relative min-h-0',
                togglingGroup === 'unpinned' ? 'z-5' : 'z-10',
                unpinnedSectionClassName,
              )}
            >
              {unpinned.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  onClick={() => toggleStatus(item.id)}
                  transition={transition}
                  layout
                  className={`flex items-center justify-between gap-5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 p-2 group ${readonly ? '' : 'cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-background p-2">
                      {React.createElement(item.icon as React.ComponentType<any>, { className: "size-5 text-neutral-500 dark:text-neutral-400" })}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {item.info}
                      </div>
                    </div>
                  </div>
                    {!readonly && (
                      <div className="flex items-center justify-center size-8 rounded-full bg-neutral-400 dark:bg-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex-shrink-0">
                    <Pin className="size-4 text-white" />
                  </div>
                    )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </LayoutGroup>
    </motion.div>
  );
}
 
export { PinList, type PinListProps, type PinListItem };