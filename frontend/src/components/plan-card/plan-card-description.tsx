"use client"

import { CardItem } from "@/components/ui/shadcn-io/3d-card"
import { Badge } from "@/components/ui/badge"

interface Tag {
  label: string
  color: string
}

interface PlanCardDescriptionProps {
  description: string
  tags: Tag[]
  translateZ?: string
  className?: string
}

export function PlanCardDescription({
  description,
  tags,
  translateZ = "70",
  className = ""
}: PlanCardDescriptionProps) {
  return (
    <div className={className}>
      <CardItem
        translateZ={translateZ}
        className="text-emerald-100/70 text-[10px] line-clamp-2"
      >
        {description}
      </CardItem>

      {/* Tags */}
      <CardItem
        as="div"
        translateZ="60"
        className="flex flex-wrap gap-1.5 mt-2"
      >
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`${tag.color} text-[10px] px-2 py-0.5 border`}
          >
            {tag.label}
          </Badge>
        ))}
      </CardItem>
    </div>
  )
}

