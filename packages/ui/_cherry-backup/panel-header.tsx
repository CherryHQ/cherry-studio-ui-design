"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: string | React.ReactNode
  title: string
  desc?: string
  actions?: React.ReactNode
}

const PanelHeader = React.forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ icon, title, desc, actions, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2.5 mb-3", className)}
        {...props}
      >
        {icon && (
          typeof icon === "string" ? (
            <span className="text-sm">{icon}</span>
          ) : (
            icon
          )
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-foreground font-medium">{title}</h3>
          {desc && (
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          )}
        </div>
        {actions}
      </div>
    )
  }
)
PanelHeader.displayName = "PanelHeader"

export { PanelHeader }
