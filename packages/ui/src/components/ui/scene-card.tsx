"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card } from './card'

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
        "gap-0 p-0 overflow-hidden cursor-pointer transition-shadow hover:shadow-sm tracking-tight",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="aspect-video w-full overflow-hidden">
        {skeleton ? (
          <div className="h-full w-full animate-pulse bg-muted" />
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
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </>
        ) : (
          <>
            <h4 className="text-[13px] font-medium truncate">{title}</h4>
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
