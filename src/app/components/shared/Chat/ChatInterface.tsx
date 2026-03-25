import React from 'react';
import { MessageList } from './MessageList';
import { Composer, type ComposerProps } from './Composer';

// ===========================
// Chat Interface
// ===========================
// Unified chat interface component that combines MessageList + Composer.
// Designed as a flexible container that both Agent and Assistant pages can use.

export interface ChatInterfaceProps {
  /** Messages to render, passed as children for maximum flexibility */
  children: React.ReactNode;
  /** Dependency for auto-scroll (typically the messages array) */
  scrollDeps: unknown[];
  /** Callback when user sends a message */
  onSendMessage: (content: string) => void;
  /** Header content above the message list (e.g., WorkflowPanel) */
  listHeader?: React.ReactNode;
  /** Content rendered above the message list but below the header (e.g., Agent WorkflowSteps) */
  topAddon?: React.ReactNode;
  /** Content rendered below messages but above the composer (e.g., ParallelResponsesBlock) */
  bottomAddon?: React.ReactNode;
  /** Empty state shown when there are no messages */
  emptyState?: React.ReactNode;
  /** Whether there are messages to display */
  hasMessages?: boolean;
  /** Additional class for the message list */
  messageListClassName?: string;
  /** Composer configuration */
  composerProps?: Partial<Omit<ComposerProps, 'onSendMessage'>>;
  /** Completely custom composer (overrides default) */
  customComposer?: React.ReactNode;
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
}: ChatInterfaceProps) {
  // Show empty state if no messages
  if (!hasMessages && emptyState) {
    return (
      <div className="flex flex-col h-full">
        {emptyState}
        {customComposer !== undefined ? customComposer : (
          <Composer onSendMessage={onSendMessage} {...composerProps} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
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
  );
}

// Re-export sub-components for individual use
export { MessageList } from './MessageList';
export { Composer, type ComposerProps } from './Composer';
export { AttachmentList } from './AttachmentList';