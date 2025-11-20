"use client"

import { CardItem } from "@/components/ui/shadcn-io/3d-card"
import { Badge } from "@/components/ui/badge"

type TagInput =
  | Array<{ label?: string; color?: string }>
  | string[]
  | string
  | null
  | undefined

interface PlanCardDescriptionProps {
  description?: string
  tags?: TagInput
  translateZ?: string
  className?: string
}

  const cleanLabel = (value: unknown): string => {
  if (typeof value === "string") {
      return value.replace(/[["'\]]/g, "").trim()
  }
  if (value && typeof value === "object" && "label" in value) {
    return cleanLabel((value as { label?: string }).label ?? "")
  }
  return value !== undefined && value !== null ? String(value).trim() : ""
}

const normalizeTags = (tagsInput: TagInput): Array<{ label: string }> => {
  if (!tagsInput) return []

  if (Array.isArray(tagsInput)) {
    return tagsInput
      .map((tag) => (typeof tag === "string" ? cleanLabel(tag) : cleanLabel(tag?.label ?? tag)))
      .filter(Boolean)
      .map((label) => ({ label }))
  }

  if (typeof tagsInput === "string") {
    try {
      const parsed = JSON.parse(tagsInput)
      if (Array.isArray(parsed)) {
        return parsed.map(cleanLabel).filter(Boolean).map((label) => ({ label }))
      }
    } catch {
      // Ignore JSON parse error and fall through
    }

    return tagsInput
      .split(",")
      .map(cleanLabel)
      .filter(Boolean)
      .map((label) => ({ label }))
  }

  return []
}

export function PlanCardDescription({
  description,
  tags,
  translateZ = "70",
  className = "",
}: PlanCardDescriptionProps) {
  const normalizedTags = normalizeTags(tags)

  return (
    <div className={className}>
      {description && (
        <CardItem
          translateZ={translateZ}
          className="text-emerald-100/80 text-[11px] leading-relaxed line-clamp-2"
        >
          {description}
        </CardItem>
      )}

      {normalizedTags.length > 0 && (
        <CardItem
          as="div"
          translateZ="60"
          className="flex flex-wrap gap-1.5 mt-2"
        >
          {normalizedTags.map((tag, index) => (
            <Badge
              key={`${tag.label}-${index}`}
              className="text-white border-transparent text-[10px] px-2 py-0.5 rounded-full font-medium tracking-tight transition-opacity shadow-sm"
              style={{
                backgroundColor: "oklch(0.38 0.07 169)",
              }}
            >
              {tag.label}
            </Badge>
          ))}
        </CardItem>
      )}
    </div>
  )
}

