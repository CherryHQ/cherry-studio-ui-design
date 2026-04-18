"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"

export interface TagsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  tags: { label: string; variant?: "default" | "outline" }[]
}

function TagsCard({
  title,
  tags,
  className,
  ref,
  ...props
}: TagsCardProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="tags-card"
      className={cn("rounded-[var(--radius-card)] border bg-card p-4 tracking-[-0.14px]", className)}
      {...props}
    >
      {title && (
        <h4 className="mb-2 text-sm font-medium">{title}</h4>
      )}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag.label} variant={tag.variant ?? "secondary"}>
            {tag.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export { TagsCard }
