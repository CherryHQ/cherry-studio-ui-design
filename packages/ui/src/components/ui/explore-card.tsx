"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card } from "./card"

export interface ExploreCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
}

function ExploreCard({
  title,
  description,
  icon,
  className,
  onClick,
  ref,
  ...props
}: ExploreCardProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Card
      ref={ref}
      data-slot="explore-card"
      className={cn(
        "gap-0 p-5 hover:border-border/80 transition-all cursor-pointer tracking-tight",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {icon && (
        <div className="mb-3 text-primary">{icon}</div>
      )}
      <h4 className="text-[13px] font-medium">{title}</h4>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}
    </Card>
  )
}

export { ExploreCard }
