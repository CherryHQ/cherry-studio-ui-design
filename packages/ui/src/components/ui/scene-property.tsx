"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Card } from './card'

export interface ScenePropertyProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value?: string
  icon?: React.ReactNode
  type?: "ratio" | "material" | "style" | "add"
}

function SceneProperty({
  label,
  value,
  icon,
  type,
  className,
  onClick,
  ref,
  ...props
}: ScenePropertyProps & { ref?: React.Ref<HTMLDivElement> }) {
  const isAdd = type === "add"

  return (
    <Card
      ref={ref}
      data-slot="scene-property"
      data-type={type || undefined}
      className={cn(
        "rounded-[var(--radius-button)] gap-0 p-3 tracking-[-0.14px] hover:bg-accent transition-colors cursor-pointer",
        isAdd && "border-dashed",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center gap-2">
        {isAdd ? (
          <svg
            className="h-4 w-4 text-muted-foreground"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        ) : icon ? (
          <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{label}</p>
          {value && (
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

export { SceneProperty }
