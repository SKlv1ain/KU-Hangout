"use client"

import { Badge } from "@/components/ui/badge"

interface Tag {
  label: string
  color: string
}

interface PlanCardSimpleDescriptionProps {
  description: string
  tags: Tag[]
  className?: string
}

export function PlanCardSimpleDescription({
  description,
  tags,
  className = ""
}: PlanCardSimpleDescriptionProps) {
  return (
    <div className={className}>
      <p className="text-muted-foreground text-sm line-clamp-2">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`${tag.color} text-xs px-2 py-0.5 border`}
          >
            {tag.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}

