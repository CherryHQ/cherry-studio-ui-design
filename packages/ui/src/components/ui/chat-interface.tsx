"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { MessageList } from "./message-list"
import { Composer, type ComposerProps } from "./composer"

// ===========================
// Chat Interface
// ===========================
// Unified chat interface component that combines MessageList + Composer.
// Designed as a flexible container that both Agent and Assistant pages can use.

export interface ChatInterfaceProps {
  /** Messages to render, passed as children for maximum flexibility */
  children: React.ReactNode
  /** Dependency for auto-scroll (typically the messages array) */
  scrollDeps: unknown[]
  /** Callback when user sends a message */
  onSendMessage: (content: string) => void
  /** Header content above the message list (e.g., WorkflowPanel) */
  listHeader?: React.ReactNode
  /** Content rendered above the message list but below the header (e.g., Agent WorkflowSteps) */
  topAddon?: React.ReactNode
  /** Content rendered below messages but above the composer (e.g., ParallelResponsesBlock) */
  bottomAddon?: React.ReactNode
  /** Empty state shown when there are no messages */
  emptyState?: React.ReactNode
  /** Whether there are messages to display */
  hasMessages?: boolean
  /** Additional class for the message list */
  messageListClassName?: string
  /** Composer configuration */
  composerProps?: Partial<Omit<ComposerProps, "onSendMessage">>
  /** Completely custom composer (overrides default) */
  customComposer?: React.ReactNode
  /** Additional class for the root container */
  className?: string
}

export function ChatInterface({
  children,
  scrollDeps,
  onSendMessage,
  listHeader,
  topAddon,
  bottomAddon,
  emptyState,
  hasMessages = true,
  messageListClassName,
  composerProps,
  customComposer,
  className,
}: ChatInterfaceProps) {
  // Show empty state if no messages
  if (!hasMessages && emptyState) {
    return (
      <div data-slot="chat-interface" className={cn("flex flex-col h-full tracking-tight", className)}>
        {emptyState}
        {customComposer !== undefined ? customComposer : (
          <Composer onSendMessage={onSendMessage} {...composerProps} />
        )}
      </div>
    )
  }

  return (
    <div data-slot="chat-interface" className={cn("flex flex-col h-full tracking-tight", className)}>
      {topAddon}
      <MessageList
        scrollDeps={scrollDeps}
        className={messageListClassName}
        header={listHeader}
      >
        {children}
      </MessageList>
      {bottomAddon}
      {customComposer !== undefined ? customComposer : (
        <Composer onSendMessage={onSendMessage} {...composerProps} />
      )}
    </div>
  )
}
