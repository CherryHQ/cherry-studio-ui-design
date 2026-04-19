"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Separator } from './separator'

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
        "rounded-[var(--radius-panel)] bg-card border shadow-sm flex items-center gap-1 p-1.5",
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
    <Separator
      data-slot="toolbar-separator"
      orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
      className={cn(
        orientation === "horizontal"
          ? "h-5 mx-1"
          : "w-5 my-1",
        className
      )}
      {...props}
    />
  )
}

export { Toolbar, ToolbarSeparator }
