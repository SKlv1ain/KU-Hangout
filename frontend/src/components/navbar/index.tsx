import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Navbar09, type Navbar09NavItem } from "@/components/ui/shadcn-io/navbar-09"
import { HouseIcon, Info } from "lucide-react"
import { CommandSearch } from "./command-search"
import { ModeToggle } from "@/components/mode-toggle"
import NotificationDrawer from "./notification-drawer-right-5"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import logoImage from "@/assets/logo.png"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [commandOpen, setCommandOpen] = useState(false)
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false)

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
    // Open command dialog when search is submitted
    setCommandOpen(true)
  }

  const handleSearchClick = () => {
    // Open command dialog when search input is clicked
    setCommandOpen(true)
  }

  const handleMessageClick = () => {
    // TODO: Implement message functionality
    console.log('Message clicked')
  }

  const handleNotificationItemClick = (item: string) => {
    if (item === 'view-all') {
      setNotificationDrawerOpen(true)
    } else {
      // TODO: Implement other notification functionality
    console.log('Notification item clicked:', item)
    }
  }

  const handleUserItemClick = async (item: string) => {
    switch (item) {
      case 'profile':
        // TODO: Navigate to profile page
        console.log('Navigate to profile')
        break
      case 'settings':
        // TODO: Navigate to settings page
        console.log('Navigate to settings')
        break
      case 'billing':
        // TODO: Navigate to billing page
        console.log('Navigate to billing')
        break
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
        notificationCount={3}
        messageIndicator={false}
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
        onNotificationItemClick={handleNotificationItemClick}
        onUserItemClick={handleUserItemClick}
      />
      <CommandSearch open={commandOpen} onOpenChange={setCommandOpen} />
      <NotificationDrawer open={notificationDrawerOpen} onOpenChange={setNotificationDrawerOpen} />
    </>
  )
}

