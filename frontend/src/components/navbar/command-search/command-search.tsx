"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command"
import { useAuth } from "@/context/AuthContext"
import {
  Bell,
  CreditCard,
  Hash,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  User,
  UsersRound,
} from "lucide-react"
import type { CommandSectionConfig } from "./types"
import { CommandSections } from "./command-sections"
import { useCommandSearch } from "./use-command-search"

export interface CommandSearchProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandSearch(props: CommandSearchProps) {
  const { open, onOpenChange } = props
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isOpen, openDialog, closeDialog, runCommand, setOpen } = useCommandSearch({ open, onOpenChange })

  const sections = React.useMemo<CommandSectionConfig[]>(() => {
    const navigation: CommandSectionConfig = {
      heading: "Navigation",
      items: [
        {
          label: "Home",
          icon: Home,
          shortcut: "⌘H",
          action: () => navigate("/home"),
        },
        {
          label: "Hash",
          icon: Hash,
          shortcut: "⌘#",
          action: () => console.log("Navigate to Hash"),
        },
        {
          label: "Groups",
          icon: UsersRound,
          shortcut: "⌘G",
          action: () => console.log("Navigate to Groups"),
        },
      ],
    }

    const quickActions: CommandSectionConfig = {
      heading: "Quick Actions",
      items: [
        {
          label: "Messages",
          icon: MessageSquare,
          shortcut: "⌘M",
          action: () => navigate("/messages"),
        },
        {
          label: "Notifications",
          icon: Bell,
          shortcut: "⌘N",
          action: () => console.log("Open Notifications"),
        },
        {
          label: "Search",
          icon: Search,
          shortcut: "⌘K",
          action: () => setOpen(true),
        },
      ],
    }

    const account: CommandSectionConfig = {
      heading: "Account",
      items: [
        {
          label: "Profile",
          icon: User,
          shortcut: "⌘P",
          action: () => navigate("/profile"),
        },
        {
          label: "Settings",
          icon: Settings,
          shortcut: "⌘S",
          action: () => console.log("Navigate to Settings"),
        },
        {
          label: "Billing",
          icon: CreditCard,
          shortcut: "⌘B",
          action: () => console.log("Navigate to Billing"),
        },
        {
          label: "Log out",
          icon: LogOut,
          shortcut: "⌘⇧Q",
          action: async () => {
            await logout()
            navigate("/login")
          },
        },
      ],
    }

    return [navigation, quickActions, account]
  }, [logout, navigate, setOpen])

  return (
    <CommandDialog open={isOpen} onOpenChange={(next) => (next ? openDialog() : closeDialog())} showCloseButton={false} showOverlay={false}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandSections sections={sections} onSelect={runCommand} />
      </CommandList>
    </CommandDialog>
  )
}
