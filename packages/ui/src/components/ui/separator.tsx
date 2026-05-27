"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"

type SeparatorOpacity = 20 | 30 | 40 | 50

interface SeparatorProps extends React.ComponentProps<typeof SeparatorPrimitive.Root> {
  /** Optional opacity tier — 30 (default subtle), 20 (very subtle), 40 / 50 (stronger).
   *  Omit for full-strength `bg-border`. */
  opacity?: SeparatorOpacity
}

const OPACITY_CLASS: Record<SeparatorOpacity, string> = {
  20: 'bg-border/20',
  30: 'bg-border/30',
  40: 'bg-border/40',
  50: 'bg-border/50',
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  opacity,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        opacity ? OPACITY_CLASS[opacity] : "bg-border",
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
export type { SeparatorProps }
