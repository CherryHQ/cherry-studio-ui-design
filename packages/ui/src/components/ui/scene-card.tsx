"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card } from './card'
import { Skeleton } from './skeleton'

export interface SceneCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  image?: string
  skeleton?: boolean
}

function SceneCard({
  title,
  subtitle,
  image,
  skeleton = false,
  className,
  onClick,
  ref,
  ...props
}: SceneCardProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Card
      ref={ref}
      data-slot="scene-card"
      className={cn(
        "gap-0 p-0 overflow-hidden cursor-pointer transition-all hover:shadow-sm hover:border-border/80 tracking-[-0.14px]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="aspect-video w-full overflow-hidden">
        {skeleton ? (
          <Skeleton className="h-full w-full" />
        ) : image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>

      <div className="p-3 space-y-0.5">
        {skeleton ? (
          <>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </>
        ) : (
          <>
            <h4 className="text-sm font-medium truncate">{title}</h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

export { SceneCard }
