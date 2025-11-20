'use client';

import * as React from 'react';
import { useEffect, useState, useRef, useId } from 'react';
import {
  HashIcon,
  HouseIcon,
  MailIcon,
  SearchIcon,
  UsersRound,
  BellIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatRelativeTime } from '@/lib/utils';

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 324 323' fill='currentColor' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect
        x='88.1023'
        y='144.792'
        width='151.802'
        height='36.5788'
        rx='18.2894'
        transform='rotate(-38.5799 88.1023 144.792)'
        fill='currentColor'
      />
      <rect
        x='85.3459'
        y='244.537'
        width='151.802'
        height='36.5788'
        rx='18.2894'
        transform='rotate(-38.5799 85.3459 244.537)'
        fill='currentColor'
      />
    </svg>
  );
};

// Hamburger icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

export interface NavbarNotificationItem {
  id: number;
  title?: string | null;
  message?: string | null;
  created_at: string;
  is_read: boolean;
  topic?: string | null;
  notification_type_display?: string | null;
  topic_display?: string | null;
  plan_title?: string | null;
  plan_cover_image?: string | null;
  actor?: {
    id: number;
    username: string;
    display_name?: string | null;
    profile_picture?: string | null;
  } | null;
}

interface NotificationMenuProps {
  notificationCount?: number;
  notifications?: NavbarNotificationItem[];
  notificationsLoading?: boolean;
  onItemClick?: (item: NavbarNotificationItem) => void;
  onViewAll?: () => void;
  onMarkAllNotificationsRead?: () => void;
}

const getActorName = (item?: NavbarNotificationItem) =>
  item?.actor?.display_name || item?.actor?.username || 'System';

const getActorInitials = (item?: NavbarNotificationItem) => {
  const name = getActorName(item);
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || 'U';
};

const getPlanInitials = (item?: NavbarNotificationItem) => {
  const title = item?.plan_title || item?.title || 'Plan';
  const parts = title.trim().split(/\s+/);
  return parts.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || 'PL';
};

const getNotificationAvatarSrc = (item?: NavbarNotificationItem | null) => {
  if (!item) return null;
  if (item.topic === 'CHAT') {
    return item.plan_cover_image || null;
  }
  return item.actor?.profile_picture || item.plan_cover_image || null;
};

const getPrimaryLabel = (item?: NavbarNotificationItem) => {
  if (!item) return '';
  if (item.topic === 'CHAT') {
    return item.plan_title || item.title || 'Group chat';
  }
  return getActorName(item);
};

// Notification Menu Component
const NotificationMenu = ({ 
  notificationCount = 0, 
  notifications = [],
  notificationsLoading = false,
  onItemClick,
  onViewAll,
  onMarkAllNotificationsRead,
}: NotificationMenuProps) => {
  const preview = notifications.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 relative rounded-full transition-all hover:bg-emerald-600/10 dark:hover:bg-emerald-400/20 hover:shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
          style={{ backgroundColor: 'transparent', border: 'none', color: 'hsl(var(--foreground))' }}
        >
          <BellIcon size={16} style={{ color: 'hsl(var(--foreground))' }} />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <span className="text-xs text-muted-foreground">{notificationCount} unread</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificationsLoading ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">Loading notifications...</div>
        ) : preview.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">You're all caught up</div>
        ) : (
          preview.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start gap-3 py-2"
              onClick={() => onItemClick?.(notification)}
            >
              <Avatar className="h-8 w-8">
                {getNotificationAvatarSrc(notification) && (
                  <AvatarImage src={getNotificationAvatarSrc(notification) || undefined} alt={getActorName(notification)} />
                )}
                <AvatarFallback className="text-xs">
                  {notification.topic === 'CHAT'
                    ? getPlanInitials(notification)
                    : getActorInitials(notification)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold leading-tight">
                      {getPrimaryLabel(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message || 'Tap to view details'}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(notification.created_at) || ''}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium uppercase">
                    {notification.notification_type_display || notification.topic_display || notification.topic}
                  </span>
                  {!notification.is_read && (
                    <span className="text-emerald-500 font-medium uppercase">Unread</span>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={notificationCount === 0}
          onClick={() => onMarkAllNotificationsRead?.()}
        >
          Mark all as read
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewAll?.()}>
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type NavbarMessageItem = NavbarNotificationItem

interface MessageMenuProps {
  messageCount?: number;
  messages?: NavbarMessageItem[];
  messagesLoading?: boolean;
  hasUnreadIndicator?: boolean;
  onItemClick?: (item: NavbarMessageItem) => void;
  onViewAll?: () => void;
  onMarkAllMessagesRead?: () => void;
  fallbackClick?: () => void;
}

const MessageMenu = ({
  messageCount = 0,
  messages = [],
  messagesLoading = false,
  hasUnreadIndicator = false,
  onItemClick,
  onViewAll,
  onMarkAllMessagesRead,
  fallbackClick,
}: MessageMenuProps) => {
  const preview = messages.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative size-8 rounded-full shadow-none transition-all hover:bg-emerald-600/10 dark:hover:bg-emerald-400/20 hover:shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
          variant="ghost"
          size="icon"
          style={{ backgroundColor: 'transparent', border: 'none', color: 'hsl(var(--foreground))' }}
        >
          <MailIcon size={16} aria-hidden={true} style={{ color: 'hsl(var(--foreground))' }} />
          {(hasUnreadIndicator || messageCount > 0) && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {messageCount > 9 ? '9+' : messageCount || ''}
            </Badge>
          )}
          {hasUnreadIndicator && messageCount === 0 && (
            <div
              aria-hidden={true}
              className="bg-primary absolute top-0.5 right-0.5 size-1 rounded-full"
            />
          )}
          <span className="sr-only">Messages</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Messages</span>
          <span className="text-xs text-muted-foreground">{messageCount} unread</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {messagesLoading ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">Loading messages...</div>
        ) : preview.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">No recent chat updates</div>
        ) : (
          preview.map((message) => (
            <DropdownMenuItem
              key={message.id}
              className="flex items-start gap-3 py-2"
              onClick={() => onItemClick?.(message)}
            >
              <Avatar className="h-8 w-8">
                {getNotificationAvatarSrc(message) && (
                  <AvatarImage src={getNotificationAvatarSrc(message) || undefined} alt={getActorName(message)} />
                )}
                <AvatarFallback className="text-xs">
                  {message.topic === 'CHAT'
                    ? getPlanInitials(message)
                    : getActorInitials(message)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold leading-tight">
                      {getPrimaryLabel(message)}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {message.message || 'Tap to open chat'}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(message.created_at) || ''}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  {!message.is_read && (
                    <span className="text-emerald-500 font-medium uppercase">Unread</span>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={messageCount === 0}
          onClick={() => onMarkAllMessagesRead?.()}
        >
          Mark all as read
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => (onViewAll ?? fallbackClick)?.()}>
          View all messages
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// User Menu Component
const UserMenu = ({
  userName = 'John Doe',
  userEmail = 'john@example.com',
  userAvatar,
  onItemClick
}: {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onItemClick?: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="ghost" 
        className="h-9 px-2 py-0 transition-all hover:bg-emerald-600/10 dark:hover:bg-emerald-400/20 hover:shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
        style={{ backgroundColor: 'transparent', border: 'none', color: 'hsl(var(--foreground))' }}
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="text-xs">
            {userName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon className="h-3 w-3 ml-1" style={{ color: 'hsl(var(--foreground))' }} />
        <span className="sr-only">User menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {userEmail}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.('profile')}>
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('settings')}>
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.('billing')}>
        Billing
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.('logout')}>
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Types
export interface Navbar09NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  isActive?: boolean;
}

export interface Navbar09Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoText?: string;
  logoHref?: string;
  navigationLinks?: Navbar09NavItem[];
  searchPlaceholder?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  messageCount?: number;
  notifications?: NavbarNotificationItem[];
  notificationsLoading?: boolean;
  messageNotifications?: NavbarMessageItem[];
  messageNotificationsLoading?: boolean;
  messageIndicator?: boolean;
  themeToggle?: React.ReactNode;
  leftContent?: React.ReactNode;
  onNavItemClick?: (href: string) => void;
  onSearchSubmit?: (query: string) => void;
  onSearchClick?: () => void;
  onMessageClick?: () => void;
  onNotificationItemClick?: (item: NavbarNotificationItem) => void;
  onMessageItemClick?: (item: NavbarMessageItem) => void;
  onViewAllNotifications?: () => void;
  onMarkAllNotificationsRead?: () => void;
  onViewAllMessages?: () => void;
  onMarkAllMessagesRead?: () => void;
  onUserItemClick?: (item: string) => void;
}

// Default navigation links with icons
const defaultNavigationLinks: Navbar09NavItem[] = [
  { href: '#', label: 'Home', icon: HouseIcon },
  { href: '#', label: 'Hash', icon: HashIcon },
  { href: '#', label: 'Groups', icon: UsersRound },
];

export const Navbar09 = React.forwardRef<HTMLElement, Navbar09Props>(
  (
    {
      className,
      logo = <Logo />,
      logoText,
      logoHref = '#',
      navigationLinks = defaultNavigationLinks,
      searchPlaceholder = 'Search...',
      userName = 'John Doe',
      userEmail = 'john@example.com',
      userAvatar,
      notificationCount = 0,
      messageCount = 0,
      notifications = [],
      notificationsLoading = false,
      messageNotifications,
      messageNotificationsLoading = false,
      messageIndicator = true,
      themeToggle,
      leftContent,
      onNavItemClick,
      onSearchSubmit,
      onSearchClick,
      onMessageClick,
      onNotificationItemClick,
      onMessageItemClick,
      onViewAllNotifications,
      onMarkAllNotificationsRead,
      onViewAllMessages,
      onMarkAllMessagesRead,
      onUserItemClick,
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const searchId = useId();

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };

      checkWidth();

      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    // Combine refs
    const combinedRef = React.useCallback((node: HTMLElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const query = formData.get('search') as string;
      if (onSearchSubmit) {
        onSearchSubmit(query);
      }
    };

    return (
      <header
        ref={combinedRef}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline',
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex flex-1 items-center gap-2">
            {/* Left content (e.g., SidebarTrigger) */}
            {leftContent && (
              <div className="flex items-center gap-2">
                {leftContent}
              </div>
            )}
            {/* Mobile menu trigger */}
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group h-8 w-8 text-foreground transition-all hover:bg-emerald-600/10 dark:hover:bg-emerald-400/20 hover:shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                    variant="ghost"
                    size="icon"
                    style={{ backgroundColor: 'transparent', border: 'none' }}
                  >
                    <HamburgerIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-48 p-1">
                  <NavigationMenu className="max-w-none">
                    <NavigationMenuList className="flex-col items-start gap-0">
                      {navigationLinks.map((link, index) => {
                        const Icon = link.icon;
                        const isActive = link.isActive ?? false;
                        return (
                          <NavigationMenuItem key={index} className="w-full">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (onNavItemClick && link.href) onNavItemClick(link.href);
                              }}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-emerald-600/10 dark:hover:bg-emerald-400/20 hover:shadow-sm focus:bg-emerald-600/10 dark:focus:bg-emerald-400/20 focus:shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer no-underline",
                                isActive && "bg-emerald-600/15 dark:bg-emerald-400/25 shadow-sm border border-emerald-500/30 dark:border-emerald-400/40"
                              )}
                              style={{ backgroundColor: isActive ? undefined : 'transparent', border: isActive ? undefined : 'none' }}
                            >
                              <Icon
                                size={16}
                                className="text-foreground"
                                aria-hidden={true}
                              />
                              <span>{link.label}</span>
                            </button>
                          </NavigationMenuItem>
                        );
                      })}
                    </NavigationMenuList>
                  </NavigationMenu>
                </PopoverContent>
              </Popover>
            )}
            <div className="flex items-center gap-6">
              <a
                href={logoHref}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavItemClick && logoHref) onNavItemClick(logoHref);
                }}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl">
                  {logo}
                </div>
                {logoText && (
                  <span className="font-bold text-xl">{logoText}</span>
                )}
              </a>
              {/* Search form */}
              <form onSubmit={handleSearchSubmit} className="relative w-64 md:w-80">
                <Input
                  id={searchId}
                  name="search"
                  className="peer h-8 w-full ps-8 pe-12 cursor-pointer"
                  placeholder={searchPlaceholder}
                  type="search"
                  onClick={onSearchClick}
                  readOnly
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                  <SearchIcon size={16} />
                </div>
                <div className="text-muted-foreground/50 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-xs">
                  ⌘K
                </div>
              </form>
            </div>
          </div>
          {/* Middle area */}
          {!isMobile && (
            <NavigationMenu className="flex">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = link.isActive ?? false;
                  return (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          if (onNavItemClick && link.href) onNavItemClick(link.href);
                        }}
                        className={cn(
                          "flex size-8 items-center justify-center p-1.5 rounded-md transition-all hover:bg-emerald-600/10 dark:hover:bg-emerald-400/20 hover:shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer text-foreground",
                          isActive && "bg-emerald-600/15 dark:bg-emerald-400/25 shadow-sm border border-emerald-500/30 dark:border-emerald-400/40"
                        )}
                        title={link.label}
                      >
                        <Icon aria-hidden={true} className="text-foreground" />
                        <span className="sr-only">{link.label}</span>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          )}
          {/* Right side */}
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              {/* Messages */}
              {messageNotifications ? (
                <MessageMenu
                  messageCount={messageCount}
                  messages={messageNotifications}
                  messagesLoading={messageNotificationsLoading}
                  hasUnreadIndicator={messageIndicator}
                  onItemClick={onMessageItemClick}
                  onViewAll={onViewAllMessages}
                  onMarkAllMessagesRead={onMarkAllMessagesRead}
                  fallbackClick={onMessageClick}
                />
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="relative size-8 rounded-full shadow-none transition-all hover:bg-emerald-600/10 dark:hover:bg-emerald-400/20 hover:shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  style={{ backgroundColor: 'transparent', border: 'none', color: 'hsl(var(--foreground))' }}
                  aria-label="Open messages"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onMessageClick) onMessageClick();
                  }}
                >
                  <MailIcon size={16} aria-hidden={true} style={{ color: 'hsl(var(--foreground))' }} />
                  {messageIndicator && (
                    <div
                      aria-hidden={true}
                      className="bg-primary absolute top-0.5 right-0.5 size-1 rounded-full"
                    />
                  )}
                </Button>
              )}
              {/* Notification menu */}
              <NotificationMenu 
                notificationCount={notificationCount}
                notifications={notifications}
                notificationsLoading={notificationsLoading}
                onItemClick={onNotificationItemClick}
                onViewAll={onViewAllNotifications}
                onMarkAllNotificationsRead={onMarkAllNotificationsRead}
              />
              {/* Theme toggle */}
              {themeToggle && (
                <div className="flex items-center">
                  {themeToggle}
                </div>
              )}
            </div>
            {/* User menu */}
            <UserMenu 
              userName={userName}
              userEmail={userEmail}
              userAvatar={userAvatar}
              onItemClick={onUserItemClick}
            />
          </div>
        </div>
      </header>
    );
  }
);

Navbar09.displayName = 'Navbar09';

export { Logo, HamburgerIcon, NotificationMenu, UserMenu };
