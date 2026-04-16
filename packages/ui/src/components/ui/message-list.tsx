"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import type { ChatMessage, ToolCallResult } from "../../types/ai"
import { MarkdownRenderer } from "./markdown-renderer"

/* ----------------------------- MessageList ----------------------------- */

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Dependency array to trigger auto-scroll */
  scrollDeps?: unknown[]
  /** Header content rendered before messages */
  header?: React.ReactNode
}

function MessageList({ scrollDeps = [], header, className, children, ref, ...props }: MessageListProps & { ref?: React.Ref<HTMLDivElement> }) {
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
    <div ref={ref} data-slot="message-list" className="flex-1 min-h-0 flex flex-col" {...props}>
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
  /** AI SDK compatible message object */
  message?: ChatMessage
  /** Whether this message is currently streaming */
  isStreaming?: boolean
  /** Tool call results to render */
  toolResults?: ToolCallResult[]
}

function MessageBubble({ role, avatar, name, timestamp, actions, message, isStreaming, toolResults, className, children, ref, ...props }: MessageBubbleProps & { ref?: React.Ref<HTMLDivElement> }) {
  const isUser = role === "user"

  return (
    <div
      ref={ref}
      data-slot="message-bubble"
      className={cn(
        "flex gap-3",
        isUser && "flex-row-reverse",
        className
      )}
      {...props}
    >
      {avatar && (
        <div className="flex-shrink-0 mt-0.5 size-8">{avatar}</div>
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
            "rounded-[var(--radius-card)] px-3.5 py-2.5 text-[13px] leading-relaxed tracking-tight max-w-[85%]",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-[6px]"
              : "bg-muted/60 text-foreground rounded-tl-[6px]"
          )}
        >
          {children ?? (() => {
            const textContent = message?.parts
              ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join("") ?? ""
            return textContent ? <MarkdownRenderer content={textContent} /> : null
          })()}
          {isStreaming && (
            <span className="inline-flex items-center ml-1">
              <span className="size-1.5 rounded-full bg-current animate-pulse" aria-label="Streaming" />
            </span>
          )}
        </div>
        {toolResults && toolResults.length > 0 && (
          <div className="mt-1.5 space-y-1 max-w-[85%]">
            {toolResults.map((tr) => (
              <div
                key={tr.id}
                className="rounded-[var(--radius-button)] border bg-card px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="font-mono font-medium text-foreground">{tr.toolName}</span>
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs font-medium",
                    tr.status === "done" && "bg-success-muted text-success",
                    tr.status === "error" && "bg-error-muted text-error",
                    tr.status === "running" && "bg-info-muted text-info",
                    tr.status === "pending" && "bg-muted text-muted-foreground"
                  )}>
                    {tr.status}
                  </span>
                </div>
                {tr.status === "done" && tr.result !== undefined && (
                  <p className="mt-1 text-muted-foreground font-mono truncate">
                    {typeof tr.result === "string" ? tr.result : JSON.stringify(tr.result)}
                  </p>
                )}
                {tr.status === "error" && tr.error && (
                  <p className="mt-1 text-error">{tr.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {actions && (
          <div className={cn("flex items-center gap-0.5 mt-0.5", isUser && "flex-row-reverse")}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

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
  /** AI SDK compatible messages array */
  messages?: ChatMessage[]
  /** Loading state */
  isLoading?: boolean
  /** Messages change callback */
  onMessagesChange?: (messages: ChatMessage[]) => void
}

function ChatContainer({ topAddon, bottomAddon, emptyState, hasMessages = true, messages, isLoading, onMessagesChange, className, children, ref, ...props }: ChatContainerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const hasContent = hasMessages || (messages && messages.length > 0)

  if (!hasContent && emptyState) {
    return (
      <div ref={ref} data-slot="chat-container" className={cn("flex flex-col h-full", className)} {...props}>
        <div className="flex-1 flex items-center justify-center">{emptyState}</div>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} data-slot="chat-container" className={cn("flex flex-col h-full", className)} {...props}>
      {topAddon}
      {messages && messages.length > 0 && (
        <MessageList scrollDeps={[messages.length, isLoading]}>
          {messages.map((msg) => {
            const textContent = msg.parts
              ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join("") ?? ""
            return (
              <MessageBubble
                key={msg.id}
                role={msg.role as "user" | "assistant"}
                message={msg}
                isStreaming={msg.isStreaming}
                toolResults={msg.toolResults}
              >
                {textContent || null}
              </MessageBubble>
            )
          })}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <MessageBubble role="assistant" isStreaming>
              <span className="sr-only">Loading</span>
            </MessageBubble>
          )}
        </MessageList>
      )}
      {children}
      {bottomAddon}
    </div>
  )
}

export { MessageList, MessageBubble, ChatContainer }
