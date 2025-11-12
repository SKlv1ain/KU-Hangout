import type { LucideIcon } from "lucide-react"

export type CommandAction = () => void | Promise<void>

export type CommandItemConfig = {
  label: string
  icon: LucideIcon
  shortcut?: string
  action: CommandAction
}

export type CommandSectionConfig = {
  heading: string
  items: CommandItemConfig[]
}
