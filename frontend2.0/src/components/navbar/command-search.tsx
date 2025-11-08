"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  CreditCard,
  Settings,
  User,
  Home,
  Hash,
  UsersRound,
  LogOut,
  MessageSquare,
  Bell,
  Search,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useAuth } from "@/context/AuthContext"

interface CommandSearchProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const [openState, setOpenState] = React.useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const isOpen = open !== undefined ? open : openState
  
  const toggleOpen = React.useCallback(() => {
    if (onOpenChange) {
      onOpenChange(!isOpen)
    } else {
      setOpenState((prev) => !prev)
    }
  }, [isOpen, onOpenChange])

  // Keyboard shortcut handler (⌘K or Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleOpen()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [toggleOpen])

  const runCommand = React.useCallback(
    (command: () => void) => {
      if (onOpenChange) {
        onOpenChange(false)
      } else {
        setOpenState(false)
      }
      command()
    },
    [onOpenChange]
  )

  // Navigation commands
  const navigationCommands = [
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
  ]

  // User commands
  const userCommands = [
    {
      label: "Profile",
      icon: User,
      shortcut: "⌘P",
      action: () => console.log("Navigate to Profile"),
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
  ]

  // Quick actions
  const quickActions = [
    {
      label: "Messages",
      icon: MessageSquare,
      shortcut: "⌘M",
      action: () => console.log("Open Messages"),
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
      action: () => {
        if (onOpenChange) {
          onOpenChange(true)
        } else {
          setOpenState(true)
        }
      },
    },
  ]

  // Logout command
  const logoutCommand = {
    label: "Log out",
    icon: LogOut,
    shortcut: "⌘⇧Q",
    action: async () => {
      await logout()
      navigate("/login")
    },
  }

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setOpenState(newOpen)
    }
  }, [onOpenChange])

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange} showCloseButton={false}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationCommands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => runCommand(cmd.action)}
            >
              <cmd.icon />
              <span>{cmd.label}</span>
              <CommandShortcut>{cmd.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {quickActions.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => runCommand(cmd.action)}
            >
              <cmd.icon />
              <span>{cmd.label}</span>
              <CommandShortcut>{cmd.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          {userCommands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => runCommand(cmd.action)}
            >
              <cmd.icon />
              <span>{cmd.label}</span>
              <CommandShortcut>{cmd.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
          <CommandItem onSelect={() => runCommand(logoutCommand.action)}>
            <logoutCommand.icon />
            <span>{logoutCommand.label}</span>
            <CommandShortcut>{logoutCommand.shortcut}</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

