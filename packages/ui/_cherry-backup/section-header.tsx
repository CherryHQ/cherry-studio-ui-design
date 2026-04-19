"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLParagraphElement> {
  title: string
}

const SectionHeader = React.forwardRef<HTMLParagraphElement, SectionHeaderProps>(
  ({ title, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-xs text-muted-foreground font-medium mb-0 mt-2",
          className
        )}
        {...props}
      >
        {title}
      </p>
    )
  }
)
SectionHeader.displayName = "SectionHeader"

export { SectionHeader }
