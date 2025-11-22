"use client"

import * as React from "react"
import { Home, MessageSquare, UserRound } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const navMain = [
    {
    title: "Home",
    url: "/home",
    icon: Home,
    isActive: false,
    },
    {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
    isActive: false,
    },
    {
    title: "Profile",
    url: "/profile",
    icon: UserRound,
    isActive: false,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Format user data for NavUser component
  const userData = user ? {
    name: user.username || "User",
    email: user.contact || "",
    avatar: user.profile_picture || "",
  } : {
    name: "Guest",
    email: "",
    avatar: "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Logo/Brand can go here if needed */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
