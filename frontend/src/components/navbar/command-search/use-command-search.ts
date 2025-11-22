import * as React from "react"

interface UseCommandSearchOptions {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function useCommandSearch({ open, onOpenChange }: UseCommandSearchOptions) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : uncontrolledOpen

  const setOpen = React.useCallback(
    (value: boolean) => {
      onOpenChange?.(value)
      if (!isControlled) {
        setUncontrolledOpen(value)
      }
    },
    [isControlled, onOpenChange]
  )

  const toggle = React.useCallback(() => {
    setOpen(!isOpen)
  }, [isOpen, setOpen])

  React.useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        toggle()
      }
    }

    document.addEventListener("keydown", handleKeydown)
    return () => document.removeEventListener("keydown", handleKeydown)
  }, [toggle])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  const openDialog = React.useCallback(() => setOpen(true), [setOpen])
  const closeDialog = React.useCallback(() => setOpen(false), [setOpen])

  return {
    isOpen,
    openDialog,
    closeDialog,
    runCommand,
    setOpen,
  }
}
