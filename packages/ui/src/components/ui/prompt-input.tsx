"use client"

import * as React from "react"
import { ArrowUp, Plus, Sparkles, ChevronDown, Mic, X, Loader2, Paperclip } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Textarea } from "./textarea"

// ===========================
// Types
// ===========================

export interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  onStop?: () => void
  /** Left side: upload button handler */
  onUpload?: () => void
  /** Left side: inspiration dropdown handler */
  onInspiration?: () => void
  inspirationOpen?: boolean
  /** Right side: model selector */
  modelName?: string
  onModelSelect?: () => void
  /** Right side: voice input */
  onVoice?: () => void
  isRecording?: boolean
  /** File attachments */
  attachments?: { id: string; name: string }[]
  onRemoveAttachment?: (id: string) => void
  /** Connection status indicator */
  status?: "idle" | "connected" | "typing" | "error"
  /** Collapsed mode: only toolbar, no text area */
  collapsed?: boolean
  onExpand?: () => void
  /** Top toolbar slot (e.g. pagination ← | → ) */
  topToolbar?: React.ReactNode
  /** Custom slot: extra left actions */
  leftActions?: React.ReactNode
  /** Custom slot: extra right actions */
  rightActions?: React.ReactNode
  className?: string
}

// ===========================
// Status indicator colors
// ===========================
const STATUS_COLORS: Record<string, string> = {
  idle: "bg-muted-foreground/30",
  connected: "bg-success",
  typing: "bg-accent-amber",
  error: "bg-error",
}

// ===========================
// Component
// ===========================

function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask me anything...",
  disabled = false,
  isLoading = false,
  onStop,
  onUpload,
  onInspiration,
  inspirationOpen,
  modelName,
  onModelSelect,
  onVoice,
  isRecording,
  attachments,
  onRemoveAttachment,
  status = "idle",
  collapsed = false,
  onExpand,
  topToolbar,
  leftActions,
  rightActions,
  className,
}: PromptInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    // Auto-resize
    const el = e.currentTarget
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 200) + "px"
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault()
      onSubmit()
    }
  }

  // Sync textarea height when value is cleared externally
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [value])

  const canSubmit = value.trim().length > 0 && !disabled

  return (
    <div
      data-slot="prompt-input"
      className={cn(
        "relative flex flex-col gap-6 rounded-[var(--radius-card)] border border-border bg-popover p-3 tracking-[-0.14px]",
        "backdrop-blur-[6px]",
        "shadow-[0px_18px_24px_-20px_rgba(0,0,0,0.13),0px_8px_16px_-12px_rgba(0,0,0,0.08)]",
        "before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_2px_0_0_var(--surface-01,white)] dark:before:shadow-none before:pointer-events-none",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Top toolbar (e.g. pagination) */}
      {topToolbar && (
        <div className="flex items-center justify-center -mt-1 -mx-1">
          {topToolbar}
        </div>
      )}

      {/* Text area + status indicator (hidden in collapsed mode) */}
      {!collapsed && (
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled || isLoading}
            className="w-full border-0 shadow-none focus-visible:ring-0 rounded-none p-0 text-base leading-[24px] tracking-[-0.3px] min-h-[24px] max-h-[200px] resize-none bg-transparent placeholder:text-muted-foreground"
          />
          {/* Status dot */}
          {status !== "idle" && (
            <div className={cn(
              "absolute top-0 right-0 w-2 h-2 rounded-full",
              STATUS_COLORS[status] || STATUS_COLORS.idle
            )} />
          )}
        </div>
      )}

      {/* Attachments */}
      {!collapsed && attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 -mt-4">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-1.5 rounded-[var(--radius-button)] bg-muted px-2.5 py-1 text-xs tracking-[-0.14px]">
              <Paperclip className="size-3 text-muted-foreground" />
              <span className="truncate max-w-[120px]">{att.name}</span>
              {onRemoveAttachment && (
                <Button variant="ghost" size="icon-xs" onClick={() => onRemoveAttachment(att.id)} className="size-4 text-muted-foreground">
                  <X className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left actions */}
        <div className="flex items-center gap-2">
          {/* Upload button */}
          {onUpload && (
            <Button
              variant="outline"
              size="icon"
              onClick={onUpload}
              disabled={isLoading}
              aria-label="Add attachment"
              className="h-10 w-10 rounded-[var(--radius-button)] border-input text-muted-foreground"
            >
              <Plus className="size-5" />
            </Button>
          )}

          {/* Inspiration dropdown */}
          {onInspiration && (
            <Button
              variant="outline"
              onClick={onInspiration}
              disabled={isLoading}
              className={cn(
                "h-10 rounded-[var(--radius-button)] border-input px-2.5 gap-3 text-md font-medium",
                inspirationOpen && "bg-accent"
              )}
            >
              <Sparkles className="size-4" />
              <span>Inspiration</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          )}

          {leftActions}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {rightActions}

          {/* Model selector */}
          {onModelSelect && (
            <Button
              variant="ghost"
              onClick={onModelSelect}
              disabled={isLoading}
              className="rounded-[var(--radius-button)] px-3 py-2.5 text-md font-medium gap-3"
            >
              <span>{modelName || "Model"}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          )}

          {/* Voice button */}
          {onVoice && (
            <Button
              variant="outline"
              size="icon"
              onClick={onVoice}
              disabled={isLoading}
              aria-label="Voice input"
              className="h-10 w-10 rounded-[var(--radius-button)] border-input text-muted-foreground"
            >
              {isRecording ? <X className="size-5" /> : <Mic className="size-5" />}
            </Button>
          )}

          {/* Submit / Stop button */}
          {isLoading ? (
            <Button
              variant="secondary"
              size="icon"
              onClick={onStop}
              aria-label="Stop generation"
              className="size-10 rounded-[var(--radius-button)]"
            >
              <Loader2 className="size-5 animate-spin" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="icon"
              onClick={onSubmit}
              disabled={!canSubmit}
              aria-label="Send message"
              className="size-10 rounded-[var(--radius-button)]"
            >
              <ArrowUp className="size-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export { PromptInput }
