"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

/* ----------------------------- MessageList ----------------------------- */

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Dependency array to trigger auto-scroll */
  scrollDeps?: unknown[]
  /** Header content rendered before messages */
  header?: React.ReactNode
}

const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  ({ scrollDeps = [], header, className, children, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, scrollDeps)

    return (
      <div ref={ref} className="flex-1 min-h-0 flex flex-col" {...props}>
        {header}
        <div
          ref={scrollRef}
          className={cn(
            "flex-1 overflow-y-auto px-3.5 py-4 space-y-4 scrollbar-thin",
            "[&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full",
            className
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)
MessageList.displayName = "MessageList"

/* ----------------------------- MessageBubble ----------------------------- */

export interface MessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Who sent this message */
  role: "user" | "assistant"
  /** Avatar element */
  avatar?: React.ReactNode
  /** Sender name */
  name?: string
  /** Timestamp */
  timestamp?: string
  /** Actions toolbar (copy, edit, etc.) */
  actions?: React.ReactNode
}

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ role, avatar, name, timestamp, actions, className, children, ...props }, ref) => {
    const isUser = role === "user"

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3",
          isUser && "flex-row-reverse",
          className
        )}
        {...props}
      >
        {avatar && (
          <div className="flex-shrink-0 mt-0.5">{avatar}</div>
        )}
        <div className={cn("flex-1 min-w-0 space-y-1", isUser && "flex flex-col items-end")}>
          {(name || timestamp) && (
            <div className={cn("flex items-center gap-2", isUser && "flex-row-reverse")}>
              {name && (
                <span className="text-xs font-medium text-foreground/70">{name}</span>
              )}
              {timestamp && (
                <span className="text-xs text-muted-foreground">{timestamp}</span>
              )}
            </div>
          )}
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-md"
                : "bg-muted/60 text-foreground rounded-tl-md"
            )}
          >
            {children}
          </div>
          {actions && (
            <div className={cn("flex items-center gap-0.5 mt-0.5", isUser && "flex-row-reverse")}>
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)
MessageBubble.displayName = "MessageBubble"

/* ----------------------------- ChatContainer ----------------------------- */

export interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content above the message list */
  topAddon?: React.ReactNode
  /** Content below messages but above composer */
  bottomAddon?: React.ReactNode
  /** Empty state when no messages */
  emptyState?: React.ReactNode
  /** Whether there are messages */
  hasMessages?: boolean
}

const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ topAddon, bottomAddon, emptyState, hasMessages = true, className, children, ...props }, ref) => {
    if (!hasMessages && emptyState) {
      return (
        <div ref={ref} className={cn("flex flex-col h-full", className)} {...props}>
          <div className="flex-1 flex items-center justify-center">{emptyState}</div>
          {children}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("flex flex-col h-full", className)} {...props}>
        {topAddon}
        {children}
        {bottomAddon}
      </div>
    )
  }
)
ChatContainer.displayName = "ChatContainer"

export { MessageList, MessageBubble, ChatContainer }
