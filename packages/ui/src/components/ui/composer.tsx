"use client"

import * as React from "react"
import { ArrowUp, Paperclip, Square, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Textarea } from "./textarea"

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
  /** Controlled input value (from useChat) */
  input?: string
  /** Input change handler (from useChat) */
  onInputChange?: (value: string) => void
  /** Form submit handler (from useChat) */
  onSubmit?: (e: React.FormEvent) => void
  /** Loading state (from useChat) */
  isLoading?: boolean
  /** Stop generation handler (from useChat) */
  onStop?: () => void
  /** File upload handler – called when files are dropped or selected */
  onFileUpload?: (files: File[]) => void
  /** List of attached files to display */
  attachments?: { id: string; name: string; size?: string; type?: string }[]
  /** Remove an attachment by id */
  onRemoveAttachment?: (id: string) => void
  /** Called when user types @query in the textarea */
  onMention?: (query: string) => void
  /** Mention suggestion items */
  mentionItems?: { id: string; name: string; avatar?: React.ReactNode }[]
  /** Called when user selects a mention item */
  onSelectMention?: (item: { id: string; name: string }) => void
}

function Composer({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  leftActions,
  rightInfo,
  variant = "default",
  autoFocus = false,
  maxHeight = 140,
  input: controlledInput,
  onInputChange,
  onSubmit,
  isLoading = false,
  onStop,
  onFileUpload,
  attachments,
  onRemoveAttachment,
  onMention,
  mentionItems,
  onSelectMention,
  className,
  ref,
  ...props
}: ComposerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [internalInput, setInternalInput] = React.useState("")
  const [isDragOver, setIsDragOver] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const isControlled = controlledInput !== undefined
  const inputValue = isControlled ? controlledInput : internalInput

  const handleSend = React.useCallback(() => {
    if (inputValue.trim() && !disabled && !isLoading) {
      onSendMessage(inputValue.trim())
      if (!isControlled) {
        setInternalInput("")
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }, [inputValue, disabled, isLoading, isControlled, onSendMessage])

  const handleFormSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (onSubmit) {
        onSubmit(e)
      } else {
        handleSend()
      }
    },
    [onSubmit, handleSend]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleFormSubmit(e as unknown as React.FormEvent)
      }
    },
    [handleFormSubmit]
  )

  const handleInput = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (!isControlled) {
        setInternalInput(value)
      }
      if (onInputChange) {
        onInputChange(value)
      }
      // Detect @mention queries
      if (onMention) {
        const cursorPos = e.target.selectionStart ?? value.length
        const textBeforeCursor = value.slice(0, cursorPos)
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
        if (mentionMatch) {
          onMention(mentionMatch[1])
        }
      }
      const el = e.target
      el.style.height = "auto"
      el.style.height = Math.min(el.scrollHeight, maxHeight) + "px"
    },
    [maxHeight, isControlled, onInputChange, onMention]
  )

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    },
    []
  )

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
    },
    []
  )

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (onFileUpload && e.dataTransfer.files.length > 0) {
        onFileUpload(Array.from(e.dataTransfer.files))
      }
    },
    [onFileUpload]
  )

  const isRounded = variant === "rounded"
  const canSend = inputValue.trim() && !disabled && !isLoading

  return (
    <div
      ref={ref}
      data-slot="composer"
      className={cn("flex-shrink-0 px-3 pb-3", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      <div
        className={cn(
          "relative border bg-background shadow-sm focus-within:border-border/80 transition-all duration-150",
          isRounded
            ? "rounded-[var(--radius-card)] border-border/40 bg-card/80 shadow-popover backdrop-blur-[6px] focus-within:shadow-popover"
            : "rounded-[var(--radius-button)] border-border/50",
          isDragOver && "border-primary ring-[3px] ring-primary/20"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          autoFocus={autoFocus}
          disabled={disabled}
          className={cn(
            "w-full bg-transparent text-[15px] tracking-tight leading-6 text-foreground placeholder:text-muted-foreground border-0 shadow-none focus-visible:ring-0 rounded-none p-0 resize-none max-h-36",
            isRounded
              ? "min-h-11 px-4 pt-3.5 pb-10 placeholder:text-muted-foreground"
              : "min-h-9 px-3.5 pt-2.5 pb-9"
          )}
        />
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pb-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-1.5 rounded-[var(--radius-button)] bg-muted px-2.5 py-1 text-xs">
                <Paperclip className="size-3" />
                <span className="truncate max-w-[120px]">{att.name}</span>
                {onRemoveAttachment && (
                  <Button variant="ghost" size="icon-xs" onClick={() => onRemoveAttachment(att.id)} className="size-4">
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
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
            {isLoading && onStop ? (
              <Button
                variant="destructive"
                size="icon"
                onClick={onStop}
                className={cn(
                  "size-10 active:scale-[0.92]",
                  isRounded
                    ? "shadow-sm"
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
                aria-label="Stop generation"
              >
                <Square size={10} strokeWidth={2} fill="currentColor" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "size-10 active:scale-[0.92]",
                  canSend
                    ? isRounded
                      ? "shadow-sm shadow-primary/25"
                      : "bg-foreground text-background hover:bg-foreground/90"
                    : isRounded
                      ? "bg-accent/50 text-muted-foreground"
                      : "bg-accent text-muted-foreground"
                )}
              >
                <ArrowUp size={14} strokeWidth={2} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Composer }
