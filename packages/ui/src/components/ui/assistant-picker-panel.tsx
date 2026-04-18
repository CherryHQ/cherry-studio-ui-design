"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, X, Check, Plus, ChevronRight,
} from 'lucide-react';
import { cn } from "../../lib/utils"
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';
import { Switch } from './switch';

// --- Local types ---

export interface AssistantItem {
  id: string;
  name: string;
  modelProvider?: string;
}

// --- Component ---

export interface AssistantPickerPanelProps {
  /** All available assistants */
  assistants: AssistantItem[];
  selectedAssistants: string[];
  onSelectAssistant: (id: string) => void;
  multiAssistant: boolean;
  onToggleMultiAssistant: () => void;
  /** Emoji map for assistant names, e.g. { "Default": "🤖" } */
  emojiMap?: Record<string, string>;
  /** Called after selecting in single-select mode, or when "create" is clicked */
  onClose?: () => void;
  onCreateAssistant?: () => void;
  /** Auto-focus search input on mount */
  autoFocus?: boolean;
  /** Optional className for root container */
  className?: string;
}

export function AssistantPickerPanel({
  assistants,
  selectedAssistants,
  onSelectAssistant,
  multiAssistant,
  onToggleMultiAssistant,
  emojiMap = {},
  onClose,
  onCreateAssistant,
  autoFocus = true,
  className,
}: AssistantPickerPanelProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  // Auto-focus
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const filteredAssistants = useMemo(() => {
    return assistants.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [assistants, search]);

  const handleSelect = (id: string) => {
    onSelectAssistant(id);
    if (!multiAssistant) onClose?.();
  };

  return (
    <div data-slot="assistant-picker-panel" className={cn('flex flex-col overflow-hidden min-w-[260px] tracking-[-0.14px]', className)}>
      {/* Search */}
      <div className="px-2 pt-1.5 pb-1.5">
        <div className="flex items-center gap-1.5 px-2 py-[4px] rounded-[var(--radius-button)] bg-muted/30 border-[1.5px] border-input">
          <Search size={11} strokeWidth={1.5} className="text-muted-foreground/60 flex-shrink-0" />
          <Input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索助手..."
            className="flex-1 h-auto border-0 bg-transparent text-xs shadow-none px-0 py-0 rounded-none focus-visible:ring-0 focus-visible:border-transparent min-w-0"
          />
          {search && (
            <Button variant="ghost" size="icon-xs" onClick={() => setSearch('')} className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground/60">
              <X size={12} />
            </Button>
          )}
        </div>
      </div>

      {/* Multi-assistant switch */}
      {multiAssistant && (
        <div className="px-3 pb-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground/50">多助手并行（与多模型互斥）</span>
          <Switch checked={multiAssistant} onCheckedChange={() => onToggleMultiAssistant()} className="scale-75" />
        </div>
      )}

      <Separator className="mx-2 bg-border/40 mb-0.5" />

      {/* Assistant list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-1 flex flex-col">
          {filteredAssistants.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground/60">无匹配结果</div>
          ) : (
            filteredAssistants.map(a => {
              const selected = selectedAssistants.includes(a.id);
              return (
                <Button
                  key={a.id}
                  variant="ghost"
                  size="xs"
                  onClick={() => handleSelect(a.id)}
                  className={cn(
                    "w-full justify-start gap-2 px-2 py-[5px] h-auto text-xs mb-px",
                    selected
                      ? 'bg-accent/40 text-popover-foreground'
                      : 'text-popover-foreground hover:bg-accent/50'
                  )}
                >
                  {multiAssistant && (
                      <Checkbox checked={selected} className="size-3.5 pointer-events-none data-[state=checked]:border-cherry-primary data-[state=checked]:bg-cherry-primary" tabIndex={-1} />
                  )}
                  <div className={`w-5 h-5 rounded-[var(--radius-dot)] flex items-center justify-center flex-shrink-0 ${
                    selected ? 'bg-foreground/10' : 'bg-accent/30'
                  }`}>
                    <span className="text-xs leading-none">{emojiMap[a.name] || '\uD83E\uDD16'}</span>
                  </div>
                  <span className="flex-1 truncate text-left">{a.name}</span>
                  {!multiAssistant && selected && <Check size={10} className="text-cherry-primary flex-shrink-0" />}
                  {multiAssistant && a.modelProvider && <span className="text-xs text-muted-foreground/60 flex-shrink-0">{a.modelProvider}</span>}
                </Button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Create link */}
      <Separator className="mx-2 bg-border/40 mt-0.5" />
      <div className="px-1 py-0.5">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => { onClose?.(); onCreateAssistant?.(); }}
          className="w-full justify-start gap-2 px-2 py-[5px] h-auto text-xs text-muted-foreground hover:text-popover-foreground hover:bg-accent/50"
        >
          <Plus size={13} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="flex-1 text-left">去资源库创建</span>
          <ChevronRight size={12} />
        </Button>
      </div>
    </div>
  );
}
