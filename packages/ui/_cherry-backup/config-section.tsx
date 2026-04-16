"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface ConfigSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  hint?: string
  actions?: React.ReactNode
  disabled?: boolean
}

const ConfigSection = React.forwardRef<HTMLDivElement, ConfigSectionProps>(
  ({ title, hint, actions, disabled, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted/50 border border-border rounded-xl px-3.5 py-3 space-y-2",
          disabled && "opacity-50 pointer-events-none",
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
)
ConfigSection.displayName = "ConfigSection"

export { ConfigSection }
