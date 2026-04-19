"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

/* ----------------------------- FilterSidebar ----------------------------- */

export interface FilterSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width in pixels. Default: 220 */
  width?: number
}

const FilterSidebar = React.forwardRef<HTMLDivElement, FilterSidebarProps>(
  ({ width = 220, className, children, style, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "h-full flex-shrink-0 border-r border-border bg-muted/30 flex flex-col overflow-y-auto",
          className
        )}
        style={{ width, ...style }}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
FilterSidebar.displayName = "FilterSidebar"

/* ----------------------------- FilterSection ----------------------------- */

export interface FilterSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

const FilterSection = React.forwardRef<HTMLDivElement, FilterSectionProps>(
  ({ title, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("px-2 py-2", className)} {...props}>
        {title && (
          <p className="px-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
        )}
        <div className="space-y-0.5">{children}</div>
      </div>
    )
  }
)
FilterSection.displayName = "FilterSection"

/* ------------------------------ FilterItem ------------------------------ */

export interface FilterItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label: string
  count?: number
  active?: boolean
}

const FilterItem = React.forwardRef<HTMLButtonElement, FilterItemProps>(
  ({ icon, label, count, active, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          active
            ? "bg-accent text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
          className
        )}
        {...props}
      >
        {icon && (
          <span className="flex-shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">
            {icon}
          </span>
        )}
        <span className="truncate flex-1 text-left">{label}</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
            {count}
          </span>
        )}
      </button>
    )
  }
)
FilterItem.displayName = "FilterItem"

export { FilterSidebar, FilterSection, FilterItem }
