"use client"

// ===========================
// Message Error Block
// ===========================
// Subtle inline error note. Mirrors Cherry Studio's source pattern:
// `<p className="mt-1 text-error">{error}</p>` — a single line of red text
// alongside the failed message, no filled banner, no heavy chrome.
// Optional "重试" appears as a tiny inline link when a handler is provided.

import * as React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MessageErrorBlockProps {
  /** Primary error message text — required, what the user sees first. */
  message: string;
  /** Optional error code rendered as muted mono suffix (e.g. `429`). */
  code?: string;
  /** Visual density — `compact` shrinks the line height for tool-call rows. */
  size?: 'compact' | 'default';
  /** Optional retry handler. When provided, a small inline "重试" link is shown. */
  onRetry?: () => void;
  /** Override the retry link label. Default: "重试". */
  retryLabel?: string;
  /** Optional className appended to the root. */
  className?: string;
}

export function MessageErrorBlock({
  message,
  code,
  size = 'default',
  onRetry,
  retryLabel = '重试',
  className,
}: MessageErrorBlockProps) {
  const compact = size === 'compact';

  return (
    <div
      data-slot="message-error-block"
      role="alert"
      className={cn(
        'flex items-center gap-1.5 text-destructive/80',
        compact ? 'text-[11px]' : 'text-xs',
        className,
      )}
    >
      <AlertCircle size={compact ? 10 : 11} className="flex-shrink-0 opacity-80" />
      <span className="leading-snug">{message}</span>
      {code && (
        <span className={cn('font-mono opacity-60', compact ? 'text-[10px]' : 'text-[10px]')}>
          {code}
        </span>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-0.5 inline-flex items-center gap-0.5 text-destructive/70 hover:text-destructive underline-offset-2 hover:underline"
        >
          <RotateCcw size={compact ? 9 : 10} />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}
