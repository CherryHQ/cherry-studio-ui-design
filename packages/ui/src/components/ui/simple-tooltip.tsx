"use client"

import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"
import { cn } from "../../lib/utils"

export interface SimpleTooltipProps {
  children: React.ReactNode
  /** Tooltip text content */
  content: string
  /** Placement side */
  side?: "top" | "right" | "bottom" | "left"
  /** Offset from trigger */
  sideOffset?: number
  /** Delay before showing (ms) */
  delayDuration?: number
  /** Additional className for the content */
  className?: string
}

/**
 * SimpleTooltip — a simplified API wrapper around Shadcn Tooltip.
 *
 * Usage: `<SimpleTooltip content="Help text">{children}</SimpleTooltip>`
 *
 * This matches Cherry Studio's existing Tooltip API so it can be used as a
 * drop-in replacement for the app-level Tooltip wrapper.
 */
function SimpleTooltip({
  children,
  content,
  side = "right",
  sideOffset = 8,
  delayDuration = 400,
  className,
}: SimpleTooltipProps) {
  if (!content) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild data-slot="simple-tooltip">
          <span className="contents">{children}</span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          className={cn(
            "z-[var(--z-tooltip)] text-xs px-2.5 py-1.5 rounded-[var(--radius-button)] max-w-60 tracking-[-0.14px] leading-relaxed",
            className
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
SimpleTooltip.displayName = "SimpleTooltip"

export { SimpleTooltip }
