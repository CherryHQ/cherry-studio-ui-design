"use client"

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Bot, Cpu,
} from 'lucide-react';
import { cn } from "../../lib/utils"
import { Button } from './button';
import { ModelPickerPanel } from './model-picker-panel';
import { AssistantPickerPanel } from './assistant-picker-panel';

import type { ModelPickerPanelProps } from './model-picker-panel';
import type { AssistantPickerPanelProps } from './assistant-picker-panel';

type ActiveCategory = 'assistant' | 'model' | null;

export interface AtMentionPickerProps {
  /** Props forwarded to AssistantPickerPanel (minus onClose/autoFocus) */
  assistantPickerProps: Omit<AssistantPickerPanelProps, 'onClose' | 'autoFocus'>;
  /** Props forwarded to ModelPickerPanel (minus onClose/autoFocus) */
  modelPickerProps: Omit<ModelPickerPanelProps, 'onClose' | 'autoFocus'>;
  onClose: () => void;
  /** Optional className for root container */
  className?: string;
}

export function AtMentionPicker({
  assistantPickerProps,
  modelPickerProps,
  onClose,
  className,
}: AtMentionPickerProps) {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);

  // Focus search when sub-panel opens
  useEffect(() => {
    if (activeCategory) {
      const t = setTimeout(() => panelRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [activeCategory]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    return () => { if (hoverTimer.current != null) clearTimeout(hoverTimer.current); };
  }, []);

  const switchCategory = (cat: ActiveCategory) => {
    if (cat !== activeCategory) {
      setActiveCategory(cat);
    }
  };

  const clearTimer = () => {
    if (hoverTimer.current != null) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handleCategoryEnter = (cat: ActiveCategory) => {
    clearTimer();
    switchCategory(cat);
  };

  const handleCategoryLeave = () => {
    clearTimer();
    hoverTimer.current = window.setTimeout(() => {
      setActiveCategory(null);
    }, 400);
  };

  const handleSubpanelEnter = () => { clearTimer(); };
  const handleSubpanelLeave = () => {
    clearTimer();
    hoverTimer.current = window.setTimeout(() => {
      setActiveCategory(null);
    }, 400);
  };

  return (
    <div ref={panelRef} data-slot="at-mention-picker" role="menu" onKeyDown={(e) => { if (e.key === "Escape") onClose() }} className={cn('absolute bottom-full left-0 mb-2 z-[var(--z-popover)] flex items-end tracking-[-0.14px]', className)}>
      {/* Level 1: Category selector */}
      <div className="w-[120px] bg-popover border border-border rounded-[var(--radius-button)] shadow-popover py-1 animate-in fade-in slide-in-from-bottom-2 duration-[var(--duration-normal)]">
        <div className="px-1 flex flex-col">
          {/* Assistant option */}
          <div
            className="relative"
            onMouseEnter={() => handleCategoryEnter('assistant')}
            onMouseLeave={handleCategoryLeave}
          >
            <Button
              variant="ghost"
              size="xs"
              onFocus={() => handleCategoryEnter('assistant')}
              aria-expanded={activeCategory === 'assistant'}
              aria-haspopup="true"
              className={cn(
                "w-full justify-start gap-2 px-2.5 py-[7px] h-auto text-xs",
                activeCategory === 'assistant'
                  ? 'bg-accent/50 text-popover-foreground'
                  : 'text-muted-foreground hover:text-popover-foreground hover:bg-accent/50'
              )}
            >
              <Bot size={14} strokeWidth={1.5} className="flex-shrink-0" />
              <span className="flex-1 text-left">助手</span>
              <ChevronRight size={12} className="flex-shrink-0 text-muted-foreground/50" />
            </Button>
          </div>

          {/* Model option */}
          <div
            className="relative"
            onMouseEnter={() => handleCategoryEnter('model')}
            onMouseLeave={handleCategoryLeave}
          >
            <Button
              variant="ghost"
              size="xs"
              onFocus={() => handleCategoryEnter('model')}
              aria-expanded={activeCategory === 'model'}
              aria-haspopup="true"
              className={cn(
                "w-full justify-start gap-2 px-2.5 py-[7px] h-auto text-xs",
                activeCategory === 'model'
                  ? 'bg-accent/50 text-popover-foreground'
                  : 'text-muted-foreground hover:text-popover-foreground hover:bg-accent/50'
              )}
            >
              <Cpu size={14} strokeWidth={1.5} className="flex-shrink-0" />
              <span className="flex-1 text-left">模型</span>
              <ChevronRight size={12} className="flex-shrink-0 text-muted-foreground/50" />
            </Button>
          </div>
        </div>
      </div>

      {/* Level 2: Assistant sub-panel */}
      {activeCategory === 'assistant' && (
        <div
          onMouseEnter={handleSubpanelEnter}
          onMouseLeave={handleSubpanelLeave}
          className="ml-1.5 bg-popover border border-border rounded-[var(--radius-button)] shadow-popover z-[var(--z-popover)] animate-in fade-in slide-in-from-left-1 duration-[var(--duration-fast)] overflow-hidden max-h-[340px]"
        >
          <AssistantPickerPanel
            {...assistantPickerProps}
            onClose={onClose}
            autoFocus={true}
          />
        </div>
      )}

      {/* Level 2: Model sub-panel */}
      {activeCategory === 'model' && (
        <div
          onMouseEnter={handleSubpanelEnter}
          onMouseLeave={handleSubpanelLeave}
          className="ml-1.5 bg-popover border border-border rounded-[var(--radius-button)] shadow-popover z-[var(--z-popover)] animate-in fade-in slide-in-from-left-1 duration-[var(--duration-fast)] overflow-hidden w-[480px]"
        >
          <ModelPickerPanel
            {...modelPickerProps}
            onClose={onClose}
            autoFocus={true}
          />
        </div>
      )}
    </div>
  );
}
