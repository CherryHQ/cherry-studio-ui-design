"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Textarea } from "./textarea"

export interface CommentInputProps {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  className?: string
}

function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Write a comment...",
  className,
}: CommentInputProps) {
  const [internal, setInternal] = React.useState("")
  const current = value ?? internal

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    setInternal(v)
    onChange?.(v)
  }

  function handleSubmit() {
    if (!current.trim()) return
    onSubmit?.(current)
    setInternal("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      data-slot="comment-input"
      className={cn("flex items-end gap-2 p-3 border-t tracking-[-0.14px]", className)}
    >
      <Textarea
        data-slot="comment-input-textarea"
        className="flex-1 min-h-[40px] resize-none"
        placeholder={placeholder}
        value={current}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <Button
        data-slot="comment-input-send"
        size="icon-sm"
        className="size-8 bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!current.trim()}
        onClick={handleSubmit}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  )
}

export { CommentInput }
