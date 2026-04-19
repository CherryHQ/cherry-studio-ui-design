"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"
import { Button } from "./button"
import { ScrollArea, ScrollBar } from "./scroll-area"

/* ---------- Props ---------- */

export interface QuestionCardProps extends React.ComponentProps<"button"> {
  question: string
  category?: string
  icon?: React.ReactNode
}

export interface QuestionCardGroupProps extends React.ComponentProps<"div"> {
  questions: QuestionCardProps[]
  layout?: "horizontal" | "vertical"
}

/* ---------- QuestionCard ---------- */

function QuestionCard({
  question,
  category,
  icon,
  className,
  ...props
}: QuestionCardProps) {
  return (
    <Button
      variant="ghost"
      data-slot="question-card"
      {...props}
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-button)] border border-border/30 bg-background px-4 py-3 h-auto text-left font-normal whitespace-normal hover:bg-accent/20 hover:border-border/60 hover:shadow-sm cursor-pointer",
        "min-w-[200px] max-w-[280px] flex-shrink-0",
        className,
      )}
    >
      {icon && <span className="flex-shrink-0 text-muted-foreground mt-0.5">{icon}</span>}
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <span className="text-sm text-foreground line-clamp-2">{question}</span>
        {category && (
          <Badge variant="secondary" className="w-fit text-xs px-1.5 py-0">
            {category}
          </Badge>
        )}
      </div>
    </Button>
  )
}

/* ---------- QuestionCardGroup ---------- */

function QuestionCardGroup({
  questions,
  layout = "vertical",
  className,
  ...props
}: QuestionCardGroupProps) {
  if (layout === "horizontal") {
    return (
      <div data-slot="question-card-group" {...props} className={className}>
        <ScrollArea className="w-full">
          <div className="flex gap-3 snap-x pb-2">
            {questions.map((q, i) => (
              <QuestionCard key={q.question || i} {...q} className="snap-start" />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    )
  }

  return (
    <div data-slot="question-card-group" {...props} className={cn("flex flex-col gap-3", className)}>
      {questions.map((q, i) => (
        <QuestionCard key={q.question || i} {...q} className="max-w-none" />
      ))}
    </div>
  )
}

export { QuestionCard, QuestionCardGroup }
