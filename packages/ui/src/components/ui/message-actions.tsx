"use client"

import * as React from "react"
import {
  Copy,
  Check,
  Pencil,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

export interface MessageActionsProps {
  onCopy?: () => void
  onEdit?: () => void
  onRegenerate?: () => void
  onFeedback?: (type: "up" | "down") => void
  feedbackValue?: "up" | "down" | null
  className?: string
}

function MessageActions({
  onCopy,
  onEdit,
  onRegenerate,
  onFeedback,
  feedbackValue,
  className,
}: MessageActionsProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(() => {
    onCopy?.()
    setCopied(true)
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [onCopy])

  return (
    <div
      data-slot="message-actions"
      className={cn(
        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
    >
      {/* Copy */}
      <Button
        data-slot="message-action-button"
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        className="size-7 text-muted-foreground hover:text-foreground"
        aria-label={copied ? "Copied" : "Copy"}
      >
        {copied ? (
          <Check className="size-3.5 text-success" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>

      {/* Edit */}
      {onEdit && (
        <Button
          data-slot="message-action-button"
          variant="ghost"
          size="icon-xs"
          onClick={onEdit}
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label="Edit"
        >
          <Pencil className="size-3.5" />
        </Button>
      )}

      {/* Regenerate */}
      {onRegenerate && (
        <Button
          data-slot="message-action-button"
          variant="ghost"
          size="icon-xs"
          onClick={onRegenerate}
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label="Regenerate"
        >
          <RefreshCw className="size-3.5" />
        </Button>
      )}

      {/* Feedback: Thumbs Up */}
      {onFeedback && (
        <>
          <Button
            data-slot="message-action-button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onFeedback("up")}
            className={cn(
              "size-7",
              feedbackValue === "up"
                ? "text-accent-blue bg-accent-blue-muted"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Thumbs up"
            aria-pressed={feedbackValue === "up"}
          >
            <ThumbsUp className="size-3.5" />
          </Button>

          {/* Feedback: Thumbs Down */}
          <Button
            data-slot="message-action-button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onFeedback("down")}
            className={cn(
              "size-7",
              feedbackValue === "down"
                ? "text-destructive bg-destructive/10"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Thumbs down"
            aria-pressed={feedbackValue === "down"}
          >
            <ThumbsDown className="size-3.5" />
          </Button>
        </>
      )}
    </div>
  )
}

export { MessageActions }
