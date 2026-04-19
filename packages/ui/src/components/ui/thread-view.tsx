"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { ScrollArea } from "./scroll-area"
import { Separator } from "./separator"
import { Textarea } from "./textarea"
import { X, Reply, Send } from "lucide-react"

interface ThreadMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: string
  avatarUrl?: string
}

interface ThreadViewProps extends React.ComponentProps<"div"> {
  parentMessage: ThreadMessage
  replies: ThreadMessage[]
  onReply?: (content: string) => void
  onClose?: () => void
  labels?: {
    reply?: string
    replies?: string
    placeholder?: string
  }
}

function MessageRow({ message }: { message: ThreadMessage }) {
  const isUser = message.role === "user"
  return (
    <div className="flex gap-2.5 px-4 py-2.5">
      <Avatar className="size-7 flex-shrink-0 mt-0.5">
        {message.avatarUrl && <AvatarImage src={message.avatarUrl} alt={isUser ? "User" : "Assistant"} />}
        <AvatarFallback className="text-xs">{isUser ? "U" : "AI"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-foreground tracking-[-0.12px]">
            {isUser ? "You" : "Assistant"}
          </span>
          {message.timestamp && (
            <span className="text-xs text-muted-foreground/60">{message.timestamp}</span>
          )}
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}

function ThreadView({ parentMessage, replies, onReply, onClose, labels, className, ...props }: ThreadViewProps) {
  const [draft, setDraft] = React.useState("")
  const l = {
    reply: labels?.reply ?? "回复",
    replies: labels?.replies ?? "条回复",
    placeholder: labels?.placeholder ?? "回复…",
  }

  const handleSubmit = () => {
    if (!draft.trim()) return
    onReply?.(draft.trim())
    setDraft("")
  }

  return (
    <div
      data-slot="thread-view"
      className={cn(
        "flex flex-col h-full rounded-l-[var(--radius-card)] border bg-card",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 flex-shrink-0 border-b border-border/20">
        <div className="flex items-center gap-2">
          <Reply className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground tracking-[-0.12px]">{l.reply}</span>
          <span className="text-xs text-muted-foreground/60">{replies.length} {l.replies}</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close thread">
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <MessageRow message={parentMessage} />
        {replies.length > 0 && (
          <>
            <div className="px-4">
              <Separator className="bg-border/30" />
            </div>
            <div className="py-1">
              {replies.map(msg => (
                <MessageRow key={msg.id} message={msg} />
              ))}
            </div>
          </>
        )}
      </ScrollArea>

      {/* Composer */}
      {onReply && (
        <div className="flex-shrink-0 border-t border-border/20 p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSubmit() } }}
              placeholder={l.placeholder}
              rows={1}
              className="flex-1 resize-none min-h-0 text-xs"
            />
            <Button size="icon-sm" onClick={handleSubmit} disabled={!draft.trim()} aria-label="Send reply">
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { ThreadView }
export type { ThreadViewProps, ThreadMessage }
