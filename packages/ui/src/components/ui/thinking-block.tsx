"use client"

import * as React from "react"
import { Brain, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

export interface ThinkingBlockProps {
  content: string
  duration?: number
  defaultOpen?: boolean
  className?: string
}

function ThinkingBlock({ content, duration, defaultOpen = false, className, ref }: ThinkingBlockProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [expanded, setExpanded] = React.useState(defaultOpen)
  const preview = content.split("\n").slice(0, 2).join(" ").slice(0, 80)

  return (
    <div ref={ref} data-slot="thinking-block" className={cn("my-1.5 tracking-tight", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-left hover:bg-accent/50 justify-start"
      >
        <Brain className="size-3.5 text-primary/70 shrink-0" />
        <span className="text-xs text-muted-foreground font-medium">Thinking</span>
        {duration != null && (
          <span className="text-xs text-muted-foreground/50 tabular-nums">
            {(duration / 1000).toFixed(1)}s
          </span>
        )}
        <span className="flex-1 text-xs text-muted-foreground/40 truncate">
          {!expanded && preview + (content.length > 80 ? "..." : "")}
        </span>
        <ChevronRight
          className={cn(
            "size-3 text-muted-foreground/40 shrink-0 transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
      </Button>
      {expanded && (
        <div className="pl-8 pr-3 pb-2 border-l-2 border-primary/20 ml-4 mt-1">
          <pre className="text-xs text-muted-foreground/60 leading-relaxed whitespace-pre-wrap font-sans">
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}

export { ThinkingBlock }
