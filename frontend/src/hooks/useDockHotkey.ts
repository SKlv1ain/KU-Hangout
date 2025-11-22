import { useEffect } from "react"

interface UseDockHotkeyOptions {
  toggleDock: () => void
}

export function useDockHotkey({ toggleDock }: UseDockHotkeyOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "Enter") {
        e.preventDefault()
        toggleDock()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggleDock])
}
