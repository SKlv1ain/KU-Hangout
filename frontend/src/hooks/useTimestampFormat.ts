import { useMemo } from "react"
import { format, isValid } from "date-fns"

export function useTimestampFormat(timestamp?: Date | null) {
  return useMemo(() => {
    if (!timestamp || !(timestamp instanceof Date) || !isValid(timestamp)) return ""
    return format(timestamp, "HH:mm")
  }, [timestamp])
}
