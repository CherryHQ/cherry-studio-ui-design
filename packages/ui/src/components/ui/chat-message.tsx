"use client"

import * as React from "react"
import { Bot, User } from "lucide-react"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback } from "./avatar"
import type { ChatMessage as ChatMessageData, ToolCallResult } from "../../types/ai"
import { MarkdownRenderer } from "./markdown-renderer"
import { ThinkingBlock } from "./thinking-block"
import { ToolCallCard } from "./tool-call-card"
import { StreamingText } from "./streaming-text"
import { MessageActions } from "./message-actions"

export interface ChatMessageProps {
  /** The message object to render */
  message: ChatMessageData
  /** Whether this message is currently being streamed */
  isStreaming?: boolean
  /** Called when the user clicks the copy button */
  onCopy?: () => void
  /** Called when the user clicks the edit button */
  onEdit?: () => void
  /** Called when the user clicks the regenerate button */
  onRegenerate?: () => void
  /** Called when the user gives thumbs up/down feedback */
  onFeedback?: (type: "up" | "down") => void
  /** Current feedback value */
  feedbackValue?: "up" | "down" | null
  /** Whether to show action buttons on assistant messages */
  showActions?: boolean
  /** Custom avatar element to override the default */
  avatar?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

function ChatMessage({
  message,
  isStreaming = false,
  onCopy,
  onEdit,
  onRegenerate,
  onFeedback,
  feedbackValue,
  showActions = true,
  avatar,
  className,
}: ChatMessageProps) {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  // Extract text content from message parts
  const textContent = React.useMemo(() => {
    if (Array.isArray(message.parts)) {
      return message.parts
        .filter(
          (p: { type: string }): p is { type: "text"; text: string } =>
            p.type === "text"
        )
        .map((p: { type: "text"; text: string }) => p.text)
        .join("")
    }
    return ""
  }, [message.parts])

  // Default avatars
  const defaultAvatar = (
    <Avatar data-slot="chat-message-avatar" className="size-8 shrink-0">
      <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <div
      data-slot="chat-message"
      data-role={message.role}
      className={cn(
        "group flex gap-3",
        isUser && "flex-row-reverse",
        className
      )}
    >
      {/* Avatar */}
      {avatar ?? defaultAvatar}

      {/* Content column */}
      <div
        data-slot="chat-message-content"
        className={cn(
          "flex flex-col gap-1 max-w-[80%] min-w-0",
          isUser && "items-end"
        )}
      >
        {/* Thinking block (assistant only) */}
        {isAssistant && message.thinking && (
          <ThinkingBlock content={message.thinking} isStreaming={isStreaming} />
        )}

        {/* Tool call results (assistant only) */}
        {isAssistant &&
          message.toolResults?.map((tc: ToolCallResult, i: number) => (
            <ToolCallCard
              key={tc.id ?? `tool-${i}`}
              toolName={tc.toolName}
              args={tc.args}
              status={tc.status}
              result={tc.result}
              error={tc.error}
            />
          ))}

        {/* Message bubble */}
        <div
          data-slot="chat-message-bubble"
          className={cn(
            "rounded-[var(--radius-card)] px-4 py-3 text-sm leading-relaxed tracking-[-0.14px]",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border"
          )}
        >
          {isStreaming && !textContent ? (
            <StreamingText text="" isStreaming />
          ) : isUser ? (
            <span className="whitespace-pre-wrap">{textContent}</span>
          ) : (
            <MarkdownRenderer content={textContent} />
          )}
          {isStreaming && textContent && (
            <StreamingText text="" isStreaming className="inline" />
          )}
        </div>

        {/* Action buttons (assistant only, not during streaming) */}
        {showActions && isAssistant && !isStreaming && (
          <MessageActions
            onCopy={onCopy}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
            feedbackValue={feedbackValue}
          />
        )}
      </div>
    </div>
  )
}

export { ChatMessage }
