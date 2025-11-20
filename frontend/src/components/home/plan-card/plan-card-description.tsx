"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type TagInput =
  | Array<{ label?: string; color?: string }>
  | string[]
  | string
  | null
  | undefined

interface PlanCardDescriptionProps {
  description?: string
  tags?: TagInput
  className?: string
}

function normalizeTags(tagsInput: TagInput): Array<{ label: string }> {
  if (!tagsInput) return []

  const cleanLabel = (value: unknown): string => {
    if (typeof value === "string") {
      return value.replace(/[["'\]]/g, "").trim()
    }
    if (value && typeof value === "object" && "label" in value) {
      return cleanLabel((value as { label?: string }).label ?? "")
    }
    return value !== undefined && value !== null ? String(value).trim() : ""
  }

  const fromString = (value: string): string[] => {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map(cleanLabel).filter(Boolean)
      }
    } catch {
      // Ignore JSON parse error and fallback to manual splitting
    }

    return value
      .split(",")
      .map(cleanLabel)
      .filter(Boolean)
  }

  if (Array.isArray(tagsInput)) {
    return tagsInput
      .map((tag) => (typeof tag === "string" ? cleanLabel(tag) : cleanLabel(tag?.label ?? tag)))
      .filter(Boolean)
      .map((label) => ({ label }))
  }

  if (typeof tagsInput === "string") {
    return fromString(tagsInput).map((label) => ({ label }))
  }

  return []
}

export function PlanCardDescription({
  description,
  tags,
  className = "",
}: PlanCardDescriptionProps) {
  const normalizedTags = normalizeTags(tags)

  return (
    <div className={cn("space-y-2", className)}>
      {description && (
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {normalizedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {normalizedTags.map((tag, index) => (
            <Badge
              key={`${tag.label}-${index}`}
              className="text-white border-transparent text-xs px-2.5 py-0.5 rounded-full font-medium transition-opacity shadow-sm"
              style={{
                backgroundColor: "oklch(0.38 0.07 169)",
              }}
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

