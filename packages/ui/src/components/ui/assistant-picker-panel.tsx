"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Search, X, Check, Plus, ChevronRight, Bolt, Filter, Pin,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { cn } from "../../lib/utils"
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
  tags?: string[];
  updatedAt?: string;
}

type SortOrder = 'recent' | 'oldest' | null;

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
  /** Callback when user clicks config icon on an assistant item */
  onConfigureAssistant?: (id: string) => void;
  /** Controlled list of pinned assistant IDs */
  pinnedIds?: string[];
  /** Callback when user pins/unpins an assistant */
  onTogglePin?: (id: string) => void;
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
  onConfigureAssistant,
  pinnedIds = [],
  onTogglePin,
}: AssistantPickerPanelProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [contextMenu]);

  // Collect all tags
  const allTags = useMemo(() => {
    const s = new Set<string>();
    assistants.forEach(a => a.tags?.forEach(t => s.add(t)));
    return Array.from(s);
  }, [assistants]);

  // Filter, sort, group
  const { pinnedAssistants, unpinnedAssistants } = useMemo(() => {
    let filtered = assistants.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeTag && !a.tags?.includes(activeTag)) return false;
      return true;
    });

    // Sort by time
    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const ta = a.updatedAt || '';
        const tb = b.updatedAt || '';
        return sortOrder === 'recent' ? tb.localeCompare(ta) : ta.localeCompare(tb);
      });
    }

    const pinned = filtered.filter(a => pinnedSet.has(a.id));
    const unpinned = filtered.filter(a => !pinnedSet.has(a.id));
    return { pinnedAssistants: pinned, unpinnedAssistants: unpinned };
  }, [assistants, search, activeTag, sortOrder, pinnedSet]);

  const handleSelect = (id: string) => {
    onSelectAssistant(id);
    if (!multiAssistant) onClose?.();
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    if (!onTogglePin) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
  }, [onTogglePin]);

  const renderRow = (a: AssistantItem) => {
    const selected = selectedAssistants.includes(a.id);
    const isPinned = pinnedSet.has(a.id);

    return (
      <button
        key={a.id}
        onClick={() => handleSelect(a.id)}
        onContextMenu={(e) => handleContextMenu(e, a.id)}
        className={cn(
          "group w-full flex items-center gap-2.5 px-3 py-[5px] mb-0.5 text-left transition-all duration-[var(--duration-fast)] rounded-lg cursor-pointer",
          selected
            ? 'bg-accent/40 text-foreground'
            : 'text-foreground/80 hover:bg-accent/20'
        )}
      >
        {multiAssistant && (
          <Checkbox checked={selected} className="size-3.5 pointer-events-none data-[state=checked]:border-cherry-primary data-[state=checked]:bg-cherry-primary flex-shrink-0" tabIndex={-1} />
        )}
        <span className="text-base leading-none flex-shrink-0">{emojiMap[a.name] || '\uD83E\uDD16'}</span>
        <span className={cn("text-sm truncate flex-1 min-w-0", selected && 'font-medium')}>{a.name}</span>
        {/* Trailing icon area */}
        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          {!multiAssistant && selected ? (
            <Check size={14} className="text-foreground/50" />
          ) : isPinned ? (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin?.(a.id); }}
              className="text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
              aria-label="Unpin"
            >
              <Pin size={13} className="rotate-45" />
            </button>
          ) : onConfigureAssistant ? (
            <button
              onClick={(e) => { e.stopPropagation(); onConfigureAssistant(a.id); }}
              className="text-muted-foreground/15 opacity-0 group-hover:opacity-100 hover:text-muted-foreground/40 transition-all"
              aria-label="Configure"
            >
              <Bolt size={13} />
            </button>
          ) : null}
        </span>
      </button>
    );
  };

  return (
    <div data-slot="assistant-picker-panel" className={cn('flex flex-col overflow-hidden min-w-[280px] tracking-[-0.14px]', className)}>
      {/* Search + Filter toggle */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 px-2.5 py-[7px] rounded-xl bg-muted/40">
          <Search size={14} className="text-muted-foreground/40 flex-shrink-0" />
          <Input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索助手..."
            className="flex-1 h-auto border-0 bg-transparent text-sm shadow-none px-0 py-0 rounded-none focus-visible:ring-0 focus-visible:border-transparent min-w-0 placeholder:text-muted-foreground/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
              <X size={12} />
            </button>
          )}
          <button
            onClick={() => setShowFilter(v => !v)}
            className={cn(
              "w-5 h-5 flex items-center justify-center rounded transition-colors flex-shrink-0",
              showFilter ? 'text-foreground/60 bg-accent/40' : 'text-muted-foreground/30 hover:text-muted-foreground/50'
            )}
          >
            <Filter size={12} />
          </button>
        </div>
      </div>

      {/* Filter panel (collapsible) */}
      {showFilter && (
        <div className="px-3 pb-2 space-y-1.5">
          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    "px-2 py-[3px] rounded-full text-xs border transition-colors cursor-pointer",
                    activeTag === tag
                      ? 'bg-foreground/8 text-foreground/80 border-border/60'
                      : 'bg-transparent text-muted-foreground/50 border-border/40 hover:bg-accent/20 hover:text-muted-foreground/70'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground/35">排序</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'recent' ? null : 'recent')}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-xs border transition-colors cursor-pointer",
                sortOrder === 'recent'
                  ? 'bg-foreground/8 text-foreground/80 border-border/60'
                  : 'bg-transparent text-muted-foreground/50 border-border/40 hover:bg-accent/20 hover:text-muted-foreground/70'
              )}
            >
              <ArrowDown size={10} />
              <span>最近</span>
            </button>
            <button
              onClick={() => setSortOrder(sortOrder === 'oldest' ? null : 'oldest')}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-xs border transition-colors cursor-pointer",
                sortOrder === 'oldest'
                  ? 'bg-foreground/8 text-foreground/80 border-border/60'
                  : 'bg-transparent text-muted-foreground/50 border-border/40 hover:bg-accent/20 hover:text-muted-foreground/70'
              )}
            >
              <ArrowUp size={10} />
              <span>最早</span>
            </button>
          </div>
        </div>
      )}

      {/* Multi-assistant switch */}
      <div className="px-3 pb-1.5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground/50">多助手并行（与多模型互斥）</span>
        <Switch checked={multiAssistant} onCheckedChange={() => onToggleMultiAssistant()} className="scale-75" />
      </div>

      <Separator className="bg-border/20" />

      {/* Assistant list */}
      <ScrollArea className="h-[320px]">
        <div className="py-1 px-1.5">
          {pinnedAssistants.length === 0 && unpinnedAssistants.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground/40">无匹配结果</div>
          ) : (
            <>
              {pinnedAssistants.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground/35 px-3 pt-2 pb-1">已固定</div>
                  {pinnedAssistants.map(renderRow)}
                </>
              )}
              {unpinnedAssistants.map(renderRow)}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Create link */}
      <Separator className="bg-border/20" />
      <div className="px-1.5 py-1">
        <button
          onClick={() => { onClose?.(); onCreateAssistant?.(); }}
          className="w-full flex items-center gap-2.5 px-3 py-[5px] text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent/20 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={14} className="flex-shrink-0" />
          <span className="flex-1">新建助手</span>
          <ChevronRight size={12} className="text-muted-foreground/40" />
        </button>
      </div>

      {/* Context menu for Pin */}
      {contextMenu && (
        <div
          className="fixed z-[9999] bg-popover border border-border rounded-lg shadow-popover py-1 px-1 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button
            onClick={() => { onTogglePin?.(contextMenu.id); setContextMenu(null); }}
            className="flex items-center gap-2 px-2.5 py-[5px] text-sm text-foreground/80 hover:bg-accent/30 rounded-md transition-colors cursor-pointer w-full text-left"
          >
            <Pin size={12} className={pinnedSet.has(contextMenu.id) ? 'rotate-45' : ''} />
            <span>{pinnedSet.has(contextMenu.id) ? '取消固定' : '固定'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
