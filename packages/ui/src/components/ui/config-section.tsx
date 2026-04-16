"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface ConfigSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  hint?: string
  actions?: React.ReactNode
  disabled?: boolean
}

function ConfigSection({ title, hint, actions, disabled, className, children, ref, ...props }: ConfigSectionProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="config-section"
      className={cn(
        "bg-muted/50 border border-border rounded-[var(--radius-button)] px-3.5 py-3 space-y-2 tracking-tight",
        disabled && "opacity-30 pointer-events-none",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          {hint && (
            <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}

export { ConfigSection }
