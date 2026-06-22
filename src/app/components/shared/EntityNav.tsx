import React, { useMemo, useState } from 'react';
import { Plus, Settings, MessageSquare, ChevronDown, ListFilter, Check, MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react';
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
}

export function EntityRail({ title, items, activeId, onSelect, onNew, onConfigure }: EntityRailProps) {
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
          className={`w-full min-w-0 flex items-center gap-2 px-2.5 py-[6px] pr-14 rounded-md text-left transition-colors ${
            active ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/40'
          }`}
        >
          <span className="text-base leading-none flex-shrink-0">{item.avatar}</span>
          <span className={`text-sm truncate flex-1 min-w-0 ${active ? 'font-medium' : ''}`}>{item.name}</span>
        </button>
        {/* Hover actions, inside the pill: settings gear + "…" overflow */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 has-[[data-state=open]]:opacity-100 transition-opacity">
          {onConfigure && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onConfigure(item.id); }}
              title="配置"
              className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-accent/70 transition-colors"
            >
              <Settings size={12} />
            </button>
          )}
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
              <DropdownMenuItem className="gap-2 text-xs"><Pencil size={12} />重命名</DropdownMenuItem>
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
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/15 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground/60">{title}</span>
          <span className="text-xs text-muted-foreground/40 tabular-nums">{items.length}</span>
        </div>
        <div className="flex items-center gap-0.5">
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
          {onNew && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onNew}
              title={`新建${title}`}
              className="p-1 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/40"
            >
              <Plus size={11} />
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-2.5 py-1.5 flex-shrink-0">
        <SearchInput value={query} onChange={setQuery} placeholder={`搜索${title}...`} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-foreground/10">
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
// column — not the viewport). The child is a render-prop receiving `close`
// so selecting a topic can dismiss the panel.

export interface TopicPanelButtonProps {
  label: string;
  count: number;
  children: (close: () => void) => React.ReactNode;
}

export function TopicPanelButton({ label, count, children }: TopicPanelButtonProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setOpen((v) => !v)}
        className={`gap-1.5 px-2 py-[4px] text-xs ${
          open ? 'bg-accent/25 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
        }`}
      >
        <MessageSquare size={13} strokeWidth={1.6} />
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground/50">{count}</span>
        <ChevronDown size={11} />
      </Button>
      {open && (
        <>
          {/* click-away layer — covers the content column */}
          <div className="absolute inset-0 z-[var(--z-modal)]" onClick={close} />
          {/* Far-right floating window, docked to the content column's right edge */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-2 top-[46px] bottom-2 z-[var(--z-modal)] w-[300px] rounded-xl border border-border/40 bg-popover shadow-xl shadow-black/10 overflow-hidden flex flex-col"
          >
            {children(close)}
          </motion.div>
        </>
      )}
    </>
  );
}
