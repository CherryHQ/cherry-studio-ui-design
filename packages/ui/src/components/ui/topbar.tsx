"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface TopbarProps extends React.ComponentProps<"header"> {}

function Topbar({ className, ...props }: TopbarProps) {
  return (
    <header
      data-slot="topbar"
      className={cn(
        "h-14 border-b bg-background flex items-center justify-between px-4 gap-4",
        className
      )}
      {...props}
    />
  )
}

export interface TopbarSectionProps extends React.ComponentProps<"div"> {}

function TopbarSection({ className, ...props }: TopbarSectionProps) {
  return (
    <div
      data-slot="topbar-section"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

export { Topbar, TopbarSection }
