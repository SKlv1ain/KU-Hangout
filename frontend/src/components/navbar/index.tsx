import { useCallback, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Navbar09, type Navbar09NavItem, type NavbarNotificationItem } from "@/components/ui/shadcn-io/navbar-09"
import { HouseIcon, Info } from "lucide-react"
import { CommandSearch } from "./command-search"
import { ModeToggle } from "@/components/mode-toggle"
import NotificationDrawer from "./notification-drawer-right-5"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import logoImage from "@/assets/logo.png"
import { useNotifications } from "@/context/NotificationContext"
import type { NotificationItem } from "@/services/notificationsService"
import { toast } from "sonner"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [commandOpen, setCommandOpen] = useState(false)
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false)
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false)
  const {
    systemNotifications,
    chatNotifications,
    systemUnreadCount,
    chatUnreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    socketStatus,
    markAllLoading,
    markNotificationAsRead,
    markAllAsRead,
    refresh,
    clearNotifications,
  } = useNotifications()

  const navigationLinks: Navbar09NavItem[] = [
    { href: '/about', label: 'About Us', icon: Info, isActive: location.pathname === '/about' },
    { href: '/home', label: 'Home', icon: HouseIcon, isActive: location.pathname === '/home' }
  ]

  const handleNavItemClick = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href)
    }
  }

  const handleSearchSubmit = (_query: string) => {
    setCommandOpen(true)
  }

  const handleSearchClick = () => {
    setCommandOpen(true)
  }

  const handleMessageClick = () => {
    setChatDrawerOpen(true)
  }

  const handleNotificationNavigation = useCallback((notification: NotificationItem) => {
    if (notification.action_url) {
      window.location.href = notification.action_url
      return
    }

    if (notification.topic === 'CHAT') {
      navigate('/messages')
    } else {
      navigate('/home')
    }
  }, [navigate])

  const handleNotificationAction = useCallback(async (notification: NotificationItem, closeDrawer?: () => void) => {
    try {
      await markNotificationAsRead(notification.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update notification.'
      toast.error(message)
    }

    handleNotificationNavigation(notification)
    closeDrawer?.()
  }, [handleNotificationNavigation, markNotificationAsRead])

  const handleNotificationSelect = useCallback((notification: NotificationItem) => {
    handleNotificationAction(notification, () => setNotificationDrawerOpen(false))
  }, [handleNotificationAction])

  const handleChatNotificationSelect = useCallback((notification: NotificationItem) => {
    handleNotificationAction(notification, () => setChatDrawerOpen(false))
  }, [handleNotificationAction])


  const handleNotificationsMarkAll = useCallback(async (topic?: NotificationItem['topic']) => {
    try {
      await markAllAsRead(topic)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to mark all notifications as read.'
      toast.error(message)
    }
  }, [markAllAsRead])

  const handleClearAllNotifications = useCallback(async () => {
    try {
      await clearNotifications('PLAN')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to clear notifications.'
      toast.error(message)
    }
  }, [clearNotifications])

  const handleClearAllChatNotifications = useCallback(async () => {
    try {
      await clearNotifications('CHAT')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to clear chat notifications.'
      toast.error(message)
    }
  }, [clearNotifications])

  const handleNotificationsRefresh = useCallback(async () => {
    try {
      await refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to refresh notifications.'
      toast.error(message)
    }
  }, [refresh])

  const notificationPreviewItems = useMemo<NavbarNotificationItem[]>(() => (
    systemNotifications.slice(0, 5).map((notification) => ({
      id: notification.id,
      title: notification.title || notification.notification_type_display || 'Notification',
      message: notification.message,
      created_at: notification.created_at,
      is_read: notification.is_read,
      topic: notification.topic,
      notification_type: notification.notification_type,
      notification_type_display: notification.notification_type_display,
      topic_display: notification.topic_display,
      plan_title: notification.plan_title,
      plan_cover_image: notification.plan_cover_image,
      actor: notification.actor,
    }))
  ), [systemNotifications])
  const chatPreviewItems = useMemo<NavbarNotificationItem[]>(() => (
    chatNotifications.slice(0, 5).map((notification) => ({
      id: notification.id,
      title: notification.title || notification.notification_type_display || 'Chat notification',
      message: notification.message,
      created_at: notification.created_at,
      is_read: notification.is_read,
      topic: notification.topic,
      notification_type_display: notification.notification_type_display,
      topic_display: notification.topic_display,
      plan_title: notification.plan_title,
      plan_cover_image: notification.plan_cover_image,
      actor: notification.actor,
    }))
  ), [chatNotifications])

  const handleNotificationMenuClick = useCallback((item: NavbarNotificationItem) => {
    const target = systemNotifications.find((notification) => notification.id === item.id)
    if (target) {
      handleNotificationSelect(target)
    } else {
      setNotificationDrawerOpen(true)
    }
  }, [systemNotifications, handleNotificationSelect])

  const handleChatMenuClick = useCallback((item: NavbarNotificationItem) => {
    const target = chatNotifications.find((notification) => notification.id === item.id)
    if (target) {
      handleChatNotificationSelect(target)
    } else {
      setChatDrawerOpen(true)
    }
  }, [chatNotifications, handleChatNotificationSelect])

  const handleUserItemClick = async (item: string) => {
    switch (item) {
      case 'profile':
        navigate('/profile')
        break
      // case 'settings':
      //   // TODO: Navigate to settings page
      //   console.log('Navigate to settings')
      //   break
    
      case 'logout':
        await logout()
        navigate('/login')
        break
      default:
        console.log('User item clicked:', item)
    }
  }

  return (
    <>
      <Navbar09
        logoHref="/home"
        logo={
          <img
            src={logoImage}
            alt="KU-Hangout logo"
            className="h-10 w-auto"
          />
        }
        logoText="KU-Hangout"
        navigationLinks={navigationLinks}
        searchPlaceholder="Search..."
        userName={user?.username || 'User'}
        userEmail={user?.username || 'user@example.com'}
        userAvatar={user?.profile_picture}
        notificationCount={systemUnreadCount}
        messageCount={chatUnreadCount}
        notifications={notificationPreviewItems}
        notificationsLoading={notificationsLoading}
        messageNotifications={chatPreviewItems}
        messageNotificationsLoading={notificationsLoading}
        messageIndicator={chatUnreadCount > 0}
        themeToggle={<ModeToggle />}
        leftContent={
          <>
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </>
        }
        onNavItemClick={handleNavItemClick}
        onSearchSubmit={handleSearchSubmit}
        onSearchClick={handleSearchClick}
        onMessageClick={handleMessageClick}
        onNotificationItemClick={handleNotificationMenuClick}
        onMessageItemClick={handleChatMenuClick}
        onViewAllNotifications={() => setNotificationDrawerOpen(true)}
        onMarkAllNotificationsRead={() => handleNotificationsMarkAll('PLAN')}
        onViewAllMessages={() => setChatDrawerOpen(true)}
        onMarkAllMessagesRead={() => handleNotificationsMarkAll('CHAT')}
        onUserItemClick={handleUserItemClick}
      />
      <CommandSearch open={commandOpen} onOpenChange={setCommandOpen} />
      <NotificationDrawer
        open={notificationDrawerOpen}
        onOpenChange={setNotificationDrawerOpen}
        notifications={systemNotifications}
        unreadCount={systemUnreadCount}
        loading={notificationsLoading}
        error={notificationsError}
        socketStatus={socketStatus}
        markAllLoading={markAllLoading}
        onNotificationClick={handleNotificationSelect}
        onMarkAllRead={() => handleNotificationsMarkAll('PLAN')}
        onClearAll={handleClearAllNotifications}
        onRefresh={handleNotificationsRefresh}
      />
      <NotificationDrawer
        open={chatDrawerOpen}
        onOpenChange={setChatDrawerOpen}
        notifications={chatNotifications}
        unreadCount={chatUnreadCount}
        loading={notificationsLoading}
        error={notificationsError}
        socketStatus={socketStatus}
        markAllLoading={markAllLoading}
        onNotificationClick={handleChatNotificationSelect}
        onMarkAllRead={() => handleNotificationsMarkAll('CHAT')}
        onClearAll={handleClearAllChatNotifications}
        onRefresh={handleNotificationsRefresh}
        title="Chat Notifications"
        subtitle={chatUnreadCount > 0 ? `${chatUnreadCount} unread chats` : 'All caught up'}
        emptyStateText="No chat updates yet"
      />
    </>
  )
}
