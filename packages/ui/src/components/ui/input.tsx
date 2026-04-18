"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[var(--radius-button)] border-[1.5px] border-input bg-input-background px-6 py-2 text-sm tracking-[-0.13px] shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive-border aria-invalid:ring-destructive-ring aria-invalid:focus-visible:border-destructive-border aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:ring-destructive-ring",
        className
      )}
      {...props}
    />
  )
}

export { Input }
