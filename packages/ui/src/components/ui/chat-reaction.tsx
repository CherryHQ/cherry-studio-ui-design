"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

interface ChatReactionProps extends React.ComponentProps<"button"> {
  emoji: string
  count: number
  active?: boolean
}

function ChatReaction({
  emoji,
  count,
  active = false,
  className,
  ...props
}: ChatReactionProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      data-slot="chat-reaction"
      data-active={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-normal",
        active
          ? "border border-primary/30 bg-primary/10 text-foreground"
          : "border border-transparent bg-accent/50 text-muted-foreground hover:bg-accent/80",
        className,
      )}
      {...props}
    >
      <span>{emoji}</span>
      <span className="tabular-nums">{count}</span>
    </Button>
  )
}

interface ChatReactionBarProps extends React.ComponentProps<"div"> {
  reactions?: ChatReactionProps[]
  onAdd?: () => void
  onReactionToggle?: (emoji: string) => void
}

function ChatReactionBar({
  reactions = [],
  onAdd,
  onReactionToggle,
  children,
  className,
  ...props
}: ChatReactionBarProps) {
  return (
    <div
      data-slot="chat-reaction-bar"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    >
      {reactions.map((reaction) => (
        <ChatReaction
          key={reaction.emoji}
          {...reaction}
          onClick={() => onReactionToggle?.(reaction.emoji)}
        />
      ))}
      {children}
      {onAdd && <ChatReactionPicker onClick={onAdd} />}
    </div>
  )
}

function ChatReactionPicker({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Button
      variant="ghost"
      size="icon"
      data-slot="chat-reaction-picker"
      aria-label="Add reaction"
      className={cn(
        "size-7 rounded-full bg-accent/30 text-muted-foreground hover:bg-accent/60",
        className,
      )}
      {...props}
    >
      <Plus className="size-3.5" />
    </Button>
  )
}

export { ChatReaction, ChatReactionBar, ChatReactionPicker }
export type { ChatReactionProps, ChatReactionBarProps }
