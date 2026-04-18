"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/* ---------- Props ---------- */

interface SuggestionBoxProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode
  title: string
  description?: string
}

interface SuggestionGridProps extends React.ComponentProps<"div"> {
  suggestions: SuggestionBoxProps[]
  columns?: 2 | 3 | 4
}

/* ---------- SuggestionBox ---------- */

function SuggestionBox({
  icon,
  title,
  description,
  className,
  onClick,
  onKeyDown,
  ...props
}: SuggestionBoxProps) {
  return (
    <div
      data-slot="suggestion-box"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).click()
        }
        onKeyDown?.(e)
      }}
      {...props}
      className={cn(
        "flex flex-col items-start gap-1 rounded-[var(--radius-card)] border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-accent/30 cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
    >
      {icon && <span className="text-lg mb-1">{icon}</span>}
      <span className="text-sm font-medium text-foreground">{title}</span>
      {description && (
        <span className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </span>
      )}
    </div>
  )
}

/* ---------- SuggestionGrid ---------- */

function SuggestionGrid({
  suggestions,
  columns = 2,
  className,
  ...props
}: SuggestionGridProps) {
  const colsClass =
    columns === 3
      ? "grid-cols-3"
      : columns === 4
        ? "grid-cols-4"
        : "grid-cols-2"

  return (
    <div data-slot="suggestion-grid" {...props} className={cn("grid gap-3", colsClass, className)}>
      {suggestions.map((suggestion, index) => (
        <SuggestionBox key={index} {...suggestion} />
      ))}
    </div>
  )
}

export { SuggestionBox, SuggestionGrid }
export type { SuggestionBoxProps, SuggestionGridProps }
