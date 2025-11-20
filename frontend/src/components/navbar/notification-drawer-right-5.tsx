"use client";

import { BellIcon, Loader2, RefreshCcw, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { NotificationItem } from "@/services/notificationsService"
import type { NotificationSocketStatus } from "@/hooks/useNotificationSocket"
import { cn, formatRelativeTime } from "@/lib/utils"

export interface NotificationDrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  notifications?: NotificationItem[]
  unreadCount: number
  loading?: boolean
  markAllLoading?: boolean
  error?: string | null
  socketStatus?: NotificationSocketStatus
  onNotificationClick?: (notification: NotificationItem) => void
  onMarkAllRead?: () => void | Promise<void>
  onRefresh?: () => void | Promise<void>
  title?: string
  subtitle?: string
  emptyStateText?: string
}

const NotificationDrawer = ({
  open = false,
  onOpenChange,
  notifications = [],
  unreadCount,
  loading = false,
  markAllLoading = false,
  error,
  socketStatus = 'idle',
  onNotificationClick,
  onMarkAllRead,
  onRefresh,
  title = 'Notifications',
  subtitle,
  emptyStateText,
}: NotificationDrawerProps) => {
  const realtimeActive = socketStatus === 'open'
  const drawerSubtitle = subtitle ?? (unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up")
  const emptyText = emptyStateText ?? "You're all caught up"

  const getActorName = (notification: NotificationItem) =>
    notification.actor?.display_name || notification.actor?.username || "System"

  const getActorInitials = (notification: NotificationItem) => {
    const name = getActorName(notification)
    const parts = name.trim().split(/\s+/)
    return parts.slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase() || "U"
  }

  const getPlanInitials = (notification: NotificationItem) => {
    const planTitle = notification.plan_title || notification.title || "Plan"
    const parts = planTitle.trim().split(/\s+/)
    return parts.slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase() || "PL"
  }

  const getAvatarImage = (notification: NotificationItem) => {
    if (notification.topic === 'CHAT') {
      return notification.plan_cover_image || null
    }
    return notification.actor?.profile_picture || notification.plan_cover_image || null
  }

  const getPrimaryLabel = (notification: NotificationItem) =>
    notification.topic === 'CHAT'
      ? notification.plan_title || notification.title || "Group chat"
      : getActorName(notification)

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>
                {drawerSubtitle}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    realtimeActive ? "bg-emerald-500" : "bg-muted-foreground"
                  )}
                />
                {realtimeActive ? "Live" : "Offline"}
              </div>
              <Button
                variant="ghost"
                size="icon"
                title="Refresh notifications"
                onClick={() => onRefresh?.()}
                disabled={loading}
              >
                <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" title="Close">
                  <XIcon className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>
        {error && (
          <div className="bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <ScrollArea className="h-[60vh] px-2 py-2">
          {loading && (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          )}
          {!loading && notifications.length === 0 && (
            <div className="flex h-32 flex-col items-center justify-center text-sm text-muted-foreground">
              <BellIcon className="mb-2 h-5 w-5 opacity-60" />
              {emptyText}
            </div>
          )}
          {notifications.length > 0 && (
            <div className="divide-y overflow-hidden rounded-md border bg-background">
              {notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={cn(
                    "flex w-full gap-3 p-4 text-left transition hover:bg-muted/80",
                    !notification.is_read && "bg-muted/50"
                  )}
                  onClick={() => onNotificationClick?.(notification)}
                >
                  <Avatar className="h-10 w-10">
                    {getAvatarImage(notification) && (
                      <AvatarImage src={getAvatarImage(notification) || undefined} alt={getActorName(notification)} />
                    )}
                    <AvatarFallback>
                      {notification.topic === 'CHAT'
                        ? getPlanInitials(notification)
                        : getActorInitials(notification)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {getPrimaryLabel(notification)}
                          </p>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {notification.notification_type_display || notification.topic_display || notification.topic}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(notification.created_at) || 'Just now'}
                      </span>
                    </div>
                    {!notification.is_read && (
                      <span className="text-emerald-500 text-xs font-medium uppercase">New</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <DrawerFooter className="border-t bg-background">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onMarkAllRead?.()}
            disabled={unreadCount === 0 || loading || markAllLoading}
          >
            {markAllLoading ? 'Marking...' : 'Mark all as read'}
          </Button>
          <DrawerClose asChild>
            <Button className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default NotificationDrawer
