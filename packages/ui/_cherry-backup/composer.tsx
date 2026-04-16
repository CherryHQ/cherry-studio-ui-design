"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "../../lib/utils"

export interface ComposerProps extends React.HTMLAttributes<HTMLDivElement> {
  onSendMessage: (text: string) => void
  placeholder?: string
  disabled?: boolean
  /** Extra buttons rendered in the left action area */
  leftActions?: React.ReactNode
  /** Extra info/buttons rendered in the right area (before send button) */
  rightInfo?: React.ReactNode
  /** Style variant */
  variant?: "default" | "rounded"
  /** Auto-focus on mount */
  autoFocus?: boolean
  /** Max height for textarea */
  maxHeight?: number
}

const Composer = React.forwardRef<HTMLDivElement, ComposerProps>(
  (
    {
      onSendMessage,
      placeholder = "Type a message...",
      disabled = false,
      leftActions,
      rightInfo,
      variant = "default",
      autoFocus = false,
      maxHeight = 140,
      className,
      ...props
    },
    ref
  ) => {
    const [input, setInput] = React.useState("")
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const handleSend = React.useCallback(() => {
      if (input.trim() && !disabled) {
        onSendMessage(input.trim())
        setInput("")
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      }
    }, [input, disabled, onSendMessage])

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          handleSend()
        }
      },
      [handleSend]
    )

    const handleInput = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
        const el = e.target
        el.style.height = "auto"
        el.style.height = Math.min(el.scrollHeight, maxHeight) + "px"
      },
      [maxHeight]
    )

    const isRounded = variant === "rounded"
    const canSend = input.trim() && !disabled

    return (
      <div ref={ref} className={cn("flex-shrink-0 px-3 pb-3", className)} {...props}>
        <div
          className={cn(
            "relative border bg-background shadow-sm focus-within:border-border/80 transition-all duration-150",
            isRounded
              ? "rounded-2xl border-border/40 bg-card/80 shadow-black/5 focus-within:shadow-md focus-within:shadow-black/8"
              : "rounded-xl border-border/50"
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            autoFocus={autoFocus}
            disabled={disabled}
            className={cn(
              "w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-[1.6] max-h-36",
              isRounded
                ? "min-h-11 px-4 pt-3.5 pb-10 placeholder:text-muted-foreground"
                : "min-h-9 px-3.5 pt-2.5 pb-9"
            )}
          />
          <div
            className={cn(
              "absolute flex items-center justify-between",
              isRounded
                ? "bottom-2 left-3 right-3"
                : "bottom-2 left-2.5 right-2.5"
            )}
          >
            <div className="flex items-center gap-0.5">{leftActions}</div>
            <div className="flex items-center gap-2">
              {rightInfo}
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  canSend
                    ? isRounded
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.92] shadow-sm shadow-primary/25"
                      : "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.92]"
                    : isRounded
                      ? "bg-accent/50 text-muted-foreground cursor-not-allowed"
                      : "bg-accent text-muted-foreground cursor-not-allowed"
                )}
              >
                <ArrowUp size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
Composer.displayName = "Composer"

export { Composer }
