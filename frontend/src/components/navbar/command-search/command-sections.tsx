import * as React from "react"
import {
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command"
import type { CommandAction, CommandSectionConfig } from "./types"

interface CommandSectionsProps {
  sections: CommandSectionConfig[]
  onSelect: (action: CommandAction) => void
}

export function CommandSections({ sections, onSelect }: CommandSectionsProps) {
  return (
    <>
      {sections.map((section, index) => (
        <React.Fragment key={section.heading}>
          <CommandGroup heading={section.heading}>
            {section.items.map((item) => (
              <CommandItem key={item.label} onSelect={() => onSelect(item.action)}>
                <item.icon />
                <span>{item.label}</span>
                {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
              </CommandItem>
            ))}
          </CommandGroup>
          {index < sections.length - 1 ? <CommandSeparator /> : null}
        </React.Fragment>
      ))}
    </>
  )
}
