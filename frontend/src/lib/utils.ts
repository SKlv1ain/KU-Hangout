import { formatDistanceToNowStrict } from "date-fns"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateValue?: string | number | Date | null) {
  if (!dateValue) {
    return ""
  }

  try {
    const date =
      typeof dateValue === "string" || typeof dateValue === "number"
        ? new Date(dateValue)
        : dateValue

    if (Number.isNaN(date.getTime())) {
      return ""
    }

    return formatDistanceToNowStrict(date, { addSuffix: true })
  } catch (error) {
    console.error("Failed to format relative time:", error)
    return ""
  }
}
