"use client"

// ===========================
// Message Error Block
// ===========================
// Inline red banner that surfaces an error attached to a chat message or
// tool call. Mirrors Cherry Studio's original pattern of rendering
// `error?: string` alongside the failed message with simple affordances
// (Retry, Copy, optional Details disclosure).

import * as React from 'react';
import { AlertTriangle, RotateCcw, Copy, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface MessageErrorBlockProps {
  /** Primary error message text — required, what the user sees first. */
  message: string;
  /** Optional error code or short label rendered as a pill (e.g. `429`, `rate_limit`). */
  code?: string;
  /** Optional verbose payload (stack trace, JSON, etc.) shown when the user expands details. */
  details?: string;
  /** Visual density — `compact` for inline use inside tool-call rows, `default` for message bubbles. */
  size?: 'compact' | 'default';
  /** Optional retry handler. When provided, a retry button is rendered. */
  onRetry?: () => void;
  /** Override the retry button label. Default: "重试". */
  retryLabel?: string;
  /** Optional className appended to the root. */
  className?: string;
}

export function MessageErrorBlock({
  message,
  code,
  details,
  size = 'default',
  onRetry,
  retryLabel = '重试',
  className,
}: MessageErrorBlockProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    const payload = details ? `${message}\n\n${details}` : message;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(payload).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }, [message, details]);

  const compact = size === 'compact';
  const iconSize = compact ? 11 : 13;

  return (
    <div
      data-slot="message-error-block"
      role="alert"
      className={cn(
        'rounded-[var(--radius-button)] border border-destructive/20 bg-destructive/5',
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2.5',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          size={iconSize}
          className={cn('text-destructive flex-shrink-0', compact ? 'mt-[3px]' : 'mt-0.5')}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                'text-destructive font-medium leading-snug',
                compact ? 'text-[11px]' : 'text-xs',
              )}
            >
              {message}
            </span>
            {code && (
              <span
                className={cn(
                  'inline-flex items-center px-1.5 py-px rounded font-mono leading-none',
                  'bg-destructive/10 text-destructive/80',
                  compact ? 'text-[9px]' : 'text-[10px]',
                )}
              >
                {code}
              </span>
            )}
          </div>

          {/* Actions row */}
          {(onRetry || details) && (
            <div
              className={cn(
                'flex items-center gap-0.5 flex-wrap',
                compact ? 'mt-1 -ml-1' : 'mt-1.5 -ml-1',
              )}
            >
              {onRetry && (
                <Button
                  variant="ghost"
                  size="inline"
                  onClick={onRetry}
                  className={cn(
                    'gap-1 px-1.5 py-0.5 rounded text-destructive/80 hover:text-destructive hover:bg-destructive/10',
                    compact ? 'text-[10px]' : 'text-[11px]',
                  )}
                >
                  <RotateCcw size={compact ? 9 : 10} />
                  <span>{retryLabel}</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="inline"
                onClick={handleCopy}
                className={cn(
                  'gap-1 px-1.5 py-0.5 rounded text-destructive/70 hover:text-destructive hover:bg-destructive/10',
                  compact ? 'text-[10px]' : 'text-[11px]',
                )}
              >
                {copied ? <Check size={compact ? 9 : 10} /> : <Copy size={compact ? 9 : 10} />}
                <span>{copied ? '已复制' : '复制错误'}</span>
              </Button>
              {details && (
                <Button
                  variant="ghost"
                  size="inline"
                  onClick={() => setShowDetails((v) => !v)}
                  className={cn(
                    'gap-1 px-1.5 py-0.5 rounded text-destructive/70 hover:text-destructive hover:bg-destructive/10',
                    compact ? 'text-[10px]' : 'text-[11px]',
                  )}
                >
                  {showDetails ? <ChevronUp size={compact ? 9 : 10} /> : <ChevronDown size={compact ? 9 : 10} />}
                  <span>{showDetails ? '收起详情' : '查看详情'}</span>
                </Button>
              )}
            </div>
          )}

          {details && showDetails && (
            <pre
              className={cn(
                'mt-1.5 px-2 py-1.5 rounded bg-destructive/8 border border-destructive/15',
                'text-destructive/80 font-mono whitespace-pre-wrap break-all leading-snug',
                compact ? 'text-[10px]' : 'text-[11px]',
              )}
            >
              {details}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
