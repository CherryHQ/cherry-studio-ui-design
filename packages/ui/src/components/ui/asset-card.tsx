"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card } from './card'

export interface AssetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  metadata?: string
}

function AssetCard({
  title,
  description,
  icon,
  metadata,
  className,
  onClick,
  ref,
  ...props
}: AssetCardProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Card
      ref={ref}
      data-slot="asset-card"
      className={cn(
        "gap-0 p-4 hover:shadow-sm transition-shadow cursor-pointer tracking-[-0.14px]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium truncate">{title}</h4>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          {metadata && (
            <span className="mt-1.5 inline-block text-xs text-muted-foreground/70">
              {metadata}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export { AssetCard }
