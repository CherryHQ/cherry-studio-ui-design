"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface ToolbarProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
}

function Toolbar({
  orientation = "horizontal",
  className,
  ...props
}: ToolbarProps) {
  return (
    <div
      data-slot="toolbar"
      data-orientation={orientation}
      role="toolbar"
      aria-orientation={orientation}
      className={cn(
        "rounded-[var(--radius-card)] bg-card border shadow-sm flex items-center gap-1 p-1.5",
        orientation === "vertical" && "flex-col",
        className
      )}
      {...props}
    />
  )
}

export interface ToolbarSeparatorProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
}

function ToolbarSeparator({
  orientation = "horizontal",
  className,
  ...props
}: ToolbarSeparatorProps) {
  return (
    <div
      data-slot="toolbar-separator"
      role="separator"
      className={cn(
        orientation === "horizontal"
          ? "w-px h-5 bg-border mx-1"
          : "h-px w-5 bg-border my-1",
        className
      )}
      {...props}
    />
  )
}

export { Toolbar, ToolbarSeparator }
