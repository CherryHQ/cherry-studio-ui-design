"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[var(--radius-button)] border-[1.5px] border-input bg-input-background px-3 py-2 text-sm tracking-[-0.14px] shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-30 aria-invalid:border-destructive-border aria-invalid:ring-destructive-ring dark:bg-input/30 dark:aria-invalid:ring-destructive-ring",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
