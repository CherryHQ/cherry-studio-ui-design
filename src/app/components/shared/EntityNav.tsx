import React, { useMemo, useState, useRef } from 'react';
import { Plus, MessageSquare, ChevronDown, ListFilter, Check, MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import {
  Button, SearchInput, Popover, PopoverTrigger, PopoverContent,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@cherry-studio/ui';

// ===========================
// EntityRail
// ===========================
// The list rail that holds the assistants (chat) / agents (Agent page).
// Selecting a row switches the active assistant/agent. Search + a tag filter
// narrow the list. Topics for the selected entity live in the header
// TopicPanelButton (far-right floating panel) instead.

export interface EntityRailItem {
  id: string;
  name: string;
  avatar: string;
  tags?: string[];
  /** Used by the "按时间" sort (most recent first). */
  updatedAt?: string;
}

export interface EntityRailProps {
  title: string;
  items: EntityRailItem[];
  activeId: string | null | undefined;
  onSelect: (id: string) => void;
  onNew?: () => void;
  onConfigure?: (id: string) => void;
  /** "编辑" overflow-menu action — opens the entity's edit page. */
  onEdit?: (id: string) => void;
  /** Show the search box above the list. Defaults to true; set false for short lists. */
  searchable?: boolean;
  /** Show the sort/filter control in the header. Defaults to true. */
  filterable?: boolean;
  /** When set, the "new" button shows this label next to the + icon (V1 style). */
  newLabel?: string;
  /** Render the "new" action as the first row of the list (Codex "New chat"
   * style) instead of a header button, and hide the title/count header. */
  newAsRow?: boolean;
}

export function EntityRail({ title, items, activeId, onSelect, onNew, onEdit, searchable = true, filterable = true, newLabel, newAsRow }: EntityRailProps) {
  const [query, setQuery] = useState('');
  const [groupByTag, setGroupByTag] = useState(false);
  const [sort, setSort] = useState<'default' | 'time' | 'name'>('default');

  const hasTags = useMemo(() => items.some((i) => i.tags && i.tags.length > 0), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((i) => !q || i.name.toLowerCase().includes(q));
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    if (sort === 'time') return [...list].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    return list;
  }, [items, query, sort]);

  // When grouping by tag, an entity shows under each of its tags.
  const groups = useMemo(() => {
    if (!groupByTag) return null;
    const map = new Map<string, EntityRailItem[]>();
    filtered.forEach((item) => {
      const tags = item.tags && item.tags.length > 0 ? item.tags : ['未分类'];
      tags.forEach((tag) => {
        if (!map.has(tag)) map.set(tag, []);
        map.get(tag)!.push(item);
      });
    });
    return Array.from(map.entries());
  }, [filtered, groupByTag]);

  const menuActive = sort !== 'default' || groupByTag;

  const renderRow = (item: EntityRailItem) => {
    const active = item.id === activeId;
    return (
      <div key={item.id} className="group/row relative">
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          className={`w-full min-w-0 flex items-center gap-2 px-2.5 py-[6px] pr-9 rounded-md text-left transition-colors ${
            active ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/40'
          }`}
        >
          <span className="text-base leading-none flex-shrink-0">{item.avatar}</span>
          <span className={`text-sm truncate flex-1 min-w-0 ${active ? 'font-medium' : ''}`}>{item.name}</span>
        </button>
        {/* Hover actions, inside the pill: "…" overflow */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 has-[[data-state=open]]:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                title="更多"
                className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-accent/70 transition-colors"
              >
                <MoreHorizontal size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onEdit?.(item.id)}><Pencil size={12} />编辑</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs"><Copy size={12} />复制</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive"><Trash2 size={12} />删除</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full select-none border-r border-border/15">
      {/* Header — hidden when the "new" action lives in the list (newAsRow). */}
      {!newAsRow && (
      <div className="px-3 py-2.5 border-b border-border/15 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground/60">{title}</span>
          <span className="text-xs text-muted-foreground/40 tabular-nums">{items.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {filterable && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                title="筛选与排序"
                className={`p-1 w-auto h-auto hover:bg-accent/40 ${menuActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ListFilter size={11} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[160px] p-1">
              {([
                { key: 'time' as const, label: '按时间' },
                { key: 'name' as const, label: 'A 到 Z' },
              ]).map((opt) => (
                <Button
                  key={opt.key}
                  variant="ghost"
                  size="xs"
                  onClick={() => setSort((cur) => (cur === opt.key ? 'default' : opt.key))}
                  className={`w-full justify-start gap-2 px-2 ${sort === opt.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {sort === opt.key && <Check size={10} className="text-primary flex-shrink-0" />}
                </Button>
              ))}
              {hasTags && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setGroupByTag((v) => !v)}
                  className={`w-full justify-start gap-2 px-2 ${groupByTag ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <span className="flex-1 text-left">按标签</span>
                  {groupByTag && <Check size={10} className="text-primary flex-shrink-0" />}
                </Button>
              )}
            </PopoverContent>
          </Popover>
          )}
          {onNew && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onNew}
              title={`新建${title}`}
              className={`w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/40 ${newLabel ? 'gap-1 px-1.5 py-1 text-xs' : 'p-1'}`}
            >
              <Plus size={11} />
              {newLabel && <span>{newLabel}</span>}
            </Button>
          )}
        </div>
      </div>
      )}

      {/* Search */}
      {searchable && (
        <div className="px-2.5 py-1.5 flex-shrink-0">
          <SearchInput value={query} onChange={setQuery} placeholder={`搜索${title}...`} />
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-foreground/10">
        {/* Codex-style "new" row pinned above the list. */}
        {newAsRow && onNew && (
          <button
            type="button"
            onClick={onNew}
            className="w-full min-w-0 flex items-center gap-2 px-2.5 py-[6px] rounded-md text-left text-foreground/80 hover:bg-accent/40 transition-colors mb-0.5"
          >
            <Plus size={16} strokeWidth={1.75} className="flex-shrink-0 text-muted-foreground" />
            <span className="text-sm truncate flex-1 min-w-0">{newLabel ?? `新建${title}`}</span>
          </button>
        )}
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground/40">无匹配结果</div>
        ) : groups ? (
          groups.map(([tag, rows]) => (
            <div key={tag} className="mb-1">
              <div className="flex items-center gap-1 px-2.5 py-1">
                <span className="text-xs text-muted-foreground/40">{tag}</span>
                <span className="text-xs text-muted-foreground/30 tabular-nums">{rows.length}</span>
              </div>
              {rows.map(renderRow)}
            </div>
          ))
        ) : (
          <div className="space-y-px">{filtered.map(renderRow)}</div>
        )}
      </div>
    </div>
  );
}

// ===========================
// TopicPanelButton
// ===========================
// A header button that toggles a floating panel docked to the far-right edge
// (浮窗) of the page content holding the topic/session list (HistorySidebar)
// for the selected entity. The panel is positioned `absolute` so it stays
// inside the app window (the nearest `relative` ancestor — the content
// column — not the viewport). It can be pinned (固定) to the right side so it
// stays put instead of closing on click-away. The child is a render-prop
// receiving `{ close, pinned, togglePin }`.

export interface TopicPanelButtonProps {
  label: string;
  count: number;
  /** Controlled pin: lift the pinned (固定) state to the parent so it can dock
   * the panel into a shared module (e.g. tabbed with artifacts). When provided,
   * this component renders only the floating popover; the parent renders the
   * pinned/docked panel itself. */
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  /** Leading icon — defaults to a chat bubble; pass e.g. <History/> for the
   * agent session list. */
  icon?: React.ReactNode;
  children: (api: { close: () => void; pinned: boolean; togglePin: () => void }) => React.ReactNode;
}

export function TopicPanelButton({ label, count, pinned: pinnedProp, onPinnedChange, icon, children }: TopicPanelButtonProps) {
  const controlled = onPinnedChange !== undefined;
  const [open, setOpen] = useState(false);
  const [internalPinned, setInternalPinned] = useState(false);
  const pinned = controlled ? !!pinnedProp : internalPinned;

  // Selecting an item / pressing close only dismisses the panel when unpinned.
  const close = () => { if (!pinned) setOpen(false); };
  const togglePin = () => {
    if (controlled) { onPinnedChange!(!pinned); setOpen(false); }
    else setInternalPinned((v) => !v);
  };
  // In controlled mode the parent renders the pinned panel, so here we only
  // render the floating popover.
  const showPanel = controlled ? (open && !pinned) : (open || internalPinned);
  const active = open || pinned;
  // Controlled (docked) mode: clicking the button toggles the docked side panel
  // directly — content shifts to make room — instead of opening a transient
  // floating popover. The panel then stays put until the user closes it.
  const handleTrigger = () => {
    if (controlled) onPinnedChange!(!pinned);
    else setOpen((v) => !v);
  };

  // The floating panel is freely resizable from its bottom-left corner. It is
  // anchored top-right, so dragging the corner left widens it and dragging it
  // down makes it taller. Defaults to a compact size so it doesn't cover the
  // chat; capped to the column height via maxHeight.
  const [panelWidth, setPanelWidth] = useState(300);
  const [panelHeight, setPanelHeight] = useState(500);
  const resizing = useRef(false);
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelWidth;
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    const startH = rect ? rect.height : 600;
    const top = rect ? rect.top : 46;
    const maxH = window.innerHeight - top - 8;
    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      setPanelWidth(Math.max(260, Math.min(720, startW - (ev.clientX - startX))));
      setPanelHeight(Math.max(240, Math.min(maxH, startH + (ev.clientY - startY))));
    };
    const onUp = () => {
      resizing.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'nesw-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="xs"
        onClick={handleTrigger}
        className={`gap-1.5 px-2 py-[4px] text-xs ${
          active ? 'bg-accent/25 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
        }`}
      >
        {icon ?? <MessageSquare size={13} strokeWidth={1.6} />}
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground/50">{count}</span>
        <ChevronDown size={11} />
      </Button>
      {showPanel && (
        <>
          {/* click-away layer — only when floating (unpinned) */}
          {!pinned && <div className="absolute inset-0 z-[var(--z-modal)]" onClick={() => setOpen(false)} />}
          {/* Far-right floating/pinned panel, docked to the content column's right edge */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: panelWidth, height: panelHeight, maxHeight: 'calc(100% - 54px)' }}
            className="absolute right-2 top-[46px] z-[var(--z-modal)] rounded-xl border border-border/40 bg-popover shadow-xl shadow-black/10 overflow-hidden flex flex-col"
          >
            {children({ close, pinned, togglePin })}
            {/* Bottom-left corner drag handle — resize width + height. No
                visible mark; the resize cursor on hover is the affordance. */}
            <div
              onMouseDown={handleResizeStart}
              title="拖拽调整大小"
              className="absolute left-0 bottom-0 w-4 h-4 cursor-nesw-resize z-20"
            />
          </motion.div>
        </>
      )}
    </>
  );
}
