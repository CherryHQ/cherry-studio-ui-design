"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ConversationThreadProps {
  children?: React.ReactNode
  depth?: number
  className?: string
}

function ConversationThread({
  children,
  depth = 0,
  className,
}: ConversationThreadProps) {
  const isRoot = depth === 0

  return (
    <div
      data-slot="conversation-thread"
      data-depth={depth}
      className={cn(
        !isRoot && "pl-8 border-l-2 border-border/50 ml-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export { ConversationThread }
