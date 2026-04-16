"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: string | React.ReactNode
  title: string
  desc?: string
  actions?: React.ReactNode
}

function PanelHeader({ icon, title, desc, actions, className, ref, ...props }: PanelHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="panel-header"
      className={cn("flex items-center gap-2.5 mb-3 tracking-tight", className)}
      {...props}
    >
      {icon && (
        typeof icon === "string" ? (
          <span className="text-[13px]">{icon}</span>
        ) : (
          icon
        )
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] text-foreground font-medium">{title}</h3>
        {desc && (
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        )}
      </div>
      {actions}
    </div>
  )
}

export { PanelHeader }
