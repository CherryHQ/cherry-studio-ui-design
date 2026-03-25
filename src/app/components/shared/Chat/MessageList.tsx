import React, { useRef, useEffect } from 'react';

// ===========================
// Message List Container
// ===========================
// Handles auto-scrolling and consistent styling for message lists.
// Used by both Agent ChatPanel and Assistant chat.

export interface MessageListProps {
  /** Dependency array to trigger auto-scroll (typically the messages array) */
  scrollDeps: unknown[];
  /** The message content to render */
  children: React.ReactNode;
  /** Additional className for the scroll container */
  className?: string;
  /** Header content rendered before messages (e.g., WorkflowPanel) */
  header?: React.ReactNode;
}

export function MessageList({
  scrollDeps,
  children,
  className = '',
  header,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, scrollDeps);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {header}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-3.5 py-4 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full ${className}`}
      >
        {children}
      </div>
    </div>
  );
}