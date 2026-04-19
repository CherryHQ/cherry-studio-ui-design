import React, { useState, useRef, useCallback } from 'react';
import { Plus, Code2, FolderOpen, ArrowUp } from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Chat Composer (Input Area)
// ===========================
// Shared input component used by both Agent and Assistant chat interfaces.
// Handles textarea auto-resize, keyboard shortcuts, and action buttons.

export interface ComposerProps {
  onSendMessage: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Extra buttons rendered in the left action area */
  leftActions?: React.ReactNode;
  /** Extra info/buttons rendered in the right area (before send button) */
  rightInfo?: React.ReactNode;
  /** Style variant */
  variant?: 'default' | 'rounded';
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Max height for textarea */
  maxHeight?: number;
}

export function Composer({
  onSendMessage,
  placeholder = '\u8bf7\u8f93\u5165\u4f60\u60f3\u8981\u4e86\u89e3\u7684\u95ee\u9898',
  disabled = false,
  leftActions,
  rightInfo,
  variant = 'default',
  autoFocus = false,
  maxHeight = 140,
}: ComposerProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [input, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
  }, [maxHeight]);

  const isRounded = variant === 'rounded';
  const canSend = input.trim() && !disabled;

  return (
    <div className="flex-shrink-0 px-3 pb-3">
      <div className={`relative border bg-background shadow-sm focus-within:border-border/80 transition-all duration-150 ${
        isRounded
          ? 'rounded-2xl border-border/40 bg-card/80 shadow-black/5 focus-within:shadow-md focus-within:shadow-black/8'
          : 'rounded-xl border-border/50'
      }`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          autoFocus={autoFocus}
          disabled={disabled}
          className={`w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none resize-none leading-[1.6] ${
            isRounded
              ? 'min-h-[44px] px-4 pt-3.5 pb-[38px] placeholder:text-muted-foreground/35'
              : 'min-h-[36px] px-3.5 pt-[10px] pb-[36px]'
          }`}
          style={{ maxHeight: maxHeight + 'px' }}
        />
        <div className={`absolute flex items-center justify-between ${
          isRounded ? 'bottom-[8px] left-3 right-3' : 'bottom-[7px] left-2.5 right-2.5'
        }`}>
          <div className="flex items-center gap-0.5">
            {leftActions || (
              <div className="flex items-center gap-0.5">
                <Tooltip content={"\u6dfb\u52a0"} side="top">
                  <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground hover:bg-accent/20">
                    <Plus size={14} />
                  </Button>
                </Tooltip>
                <Tooltip content={"\u4ee3\u7801"} side="top">
                  <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground hover:bg-accent/20">
                    <Code2 size={14} />
                  </Button>
                </Tooltip>
                <Tooltip content={"\u6dfb\u52a0\u6587\u4ef6\u5939"} side="top">
                  <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground hover:bg-accent/20">
                    <FolderOpen size={14} />
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {rightInfo}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-100 ${
                canSend
                  ? isRounded
                    ? 'bg-cherry-primary text-white hover:bg-cherry-primary-light active:scale-[0.92] shadow-sm shadow-cherry-primary/25'
                    : 'bg-foreground text-background hover:bg-foreground/90 active:scale-[0.92]'
                  : isRounded
                    ? 'bg-accent/50 text-muted-foreground/25 cursor-not-allowed'
                    : 'bg-accent text-muted-foreground/40 cursor-not-allowed'
              }`}
            >
              <ArrowUp size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}