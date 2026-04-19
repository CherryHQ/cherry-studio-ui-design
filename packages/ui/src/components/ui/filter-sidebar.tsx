"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"

/* ----------------------------- FilterSidebar ----------------------------- */

export interface FilterSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width in pixels. Default: 220 */
  width?: number
}

function FilterSidebar({ width = 220, className, children, style, ref, ...props }: FilterSidebarProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <aside
      ref={ref}
      data-slot="filter-sidebar"
      className={cn(
        "h-full flex-shrink-0 border-r border-border bg-muted/30 flex flex-col tracking-[-0.14px]",
        className
      )}
      style={{ width, ...style }}
      {...props}
    >
      <ScrollArea className="flex-1">
        {children}
      </ScrollArea>
    </aside>
  )
}

/* ----------------------------- FilterSection ----------------------------- */

export interface FilterSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

function FilterSection({ title, className, children, ref, ...props }: FilterSectionProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} data-slot="filter-section" className={cn("px-2 py-2", className)} {...props}>
      {title && (
        <p className="px-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

/* ------------------------------ FilterItem ------------------------------ */

export interface FilterItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label: string
  count?: number
  active?: boolean
}

function FilterItem({ icon, label, count, active, className, ref, ...props }: FilterItemProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      data-slot="filter-item"
      className={cn(
        "w-full justify-start gap-2 px-2.5 py-1.5 text-xs",
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
    </Button>
  )
}

export { FilterSidebar, FilterSection, FilterItem }
