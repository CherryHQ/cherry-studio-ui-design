"use client"

import * as React from "react"
import { Brain, ChevronRight } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

const shakeAnimation = {
  animate: {
    rotate: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 0.8,
      ease: 'easeInOut' as const,
    },
  },
}

export interface ThinkingBlockProps {
  content: string
  duration?: number
  isStreaming?: boolean
  defaultOpen?: boolean
  className?: string
}

function ThinkingBlock({ content, duration, isStreaming = false, defaultOpen = false, className, ref }: ThinkingBlockProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [expanded, setExpanded] = React.useState(defaultOpen || isStreaming)
  const preview = content.split("\n").slice(0, 2).join(" ").slice(0, 80)

  return (
    <div ref={ref} data-slot="thinking-block" className={cn("my-1.5 tracking-[-0.14px]", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 text-left hover:bg-accent/50 justify-start"
      >
        {isStreaming ? (
          <motion.div {...shakeAnimation} className="flex items-center justify-center shrink-0">
            <Brain className="size-3.5 text-accent-purple shrink-0" />
          </motion.div>
        ) : (
          <Brain className="size-3.5 text-primary/70 shrink-0" />
        )}
        <span className="text-xs text-muted-foreground font-medium">
          {isStreaming ? "思考中..." : "Thinking"}
        </span>
        {duration != null && !isStreaming && (
          <span className="text-xs text-muted-foreground/70 tabular-nums">
            {(duration / 1000).toFixed(1)}s
          </span>
        )}
        <span className="flex-1 text-xs text-muted-foreground/70 truncate">
          {!expanded && preview + (content.length > 80 ? "..." : "")}
        </span>
        <ChevronRight
          className={cn(
            "size-3 text-muted-foreground/60 shrink-0 transition-transform duration-[var(--duration-normal)]",
            expanded && "rotate-90"
          )}
        />
      </Button>
      {expanded && (
        <div className="px-2.5 pb-2 mt-1">
          <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
            {content}
          </pre>
        </div>
      )}
    </div>
  )
}

export { ThinkingBlock }
