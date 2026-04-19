"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLParagraphElement> {
  title: string
}

function SectionHeader({ title, className, ref, ...props }: SectionHeaderProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  return (
    <p
      ref={ref}
      data-slot="section-header"
      className={cn(
        "text-xs text-muted-foreground font-medium tracking-[-0.12px] mb-0 mt-2",
        className
      )}
      {...props}
    >
      {title}
    </p>
  )
}

export { SectionHeader }
