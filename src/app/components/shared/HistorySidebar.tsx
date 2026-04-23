import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Trash2, Pin, Plus,
  Clock, Maximize2, ListFilter, ChevronDown, ChevronRight, Check, FolderOpen,
} from 'lucide-react';
import { Button, SearchInput, EmptyState, Popover, PopoverTrigger, PopoverContent } from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Types
// ===========================

export interface HistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  status: string;
  pinned?: boolean;
  unread?: boolean;
  group?: string;
}

type GroupByMode = 'none' | 'status' | 'group' | 'time' | 'custom';

const GROUP_BY_OPTIONS: { key: GroupByMode; label: string }[] = [
  { key: 'none', label: '不分组' },
  { key: 'group', label: '工作目录' },
  { key: 'status', label: '状态' },
  { key: 'time', label: '时间' },
];

const STATUS_LABELS: Record<string, string> = {
  active: '运行中',
  completed: '已完成',
  error: '失败',
  paused: '已暂停',
};

const GROUP_COLLAPSE_LIMIT = 6;

interface HistorySidebarProps<T extends HistoryItem> {
  items: T[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<T>) => void;
  onNewItem: () => void;
  onExpand: () => void;
  onClose: () => void;
  entityLabel: string;
  showStatusDot?: boolean;
  renderIcon?: (item: T) => React.ReactNode;
  renderSubtitle?: (item: T) => React.ReactNode;
  customGroupBy?: {
    label: string;
    getGroupKey: (item: T) => string;
  };
  onNewItemForGroup?: (groupKey: string) => void;
}

// ===========================
// Context Menu
// ===========================

function ItemContextMenu({ x, y, onClose, onDelete, onPin, isPinned }: {
  x: number; y: number; onClose: () => void; onDelete: () => void; onPin: () => void; isPinned?: boolean;
}) {
  const clampedX = Math.min(x, window.innerWidth - 160);
  const clampedY = Math.min(y, window.innerHeight - 160);

  return (
    <div className="contents">
      <div className="fixed inset-0 z-[var(--z-overlay)]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.08 }}
        className="fixed z-[var(--z-overlay)] bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 p-1 min-w-[140px]"
        style={{ left: clampedX, top: clampedY }}
      >
        <Button
          variant="ghost"
          size="xs"
          onClick={onPin}
          className="w-full justify-start gap-2 text-foreground hover:bg-accent/15"
        >
          <Pin size={11} className={isPinned ? '' : '-rotate-45'} />
          <span>{isPinned ? '取消置顶' : '置顶'}</span>
        </Button>
        <div className="h-px bg-border/30 my-1" />
        <Button
          variant="ghost"
          size="xs"
          onClick={onDelete}
          className="w-full justify-start gap-2 text-destructive/70 hover:bg-destructive/8"
        >
          <Trash2 size={11} />
          <span>删除</span>
        </Button>
      </motion.div>
    </div>
  );
}

// ===========================
// Sidebar Item — title only
// ===========================

const STATUS_DOT_COLORS: Record<string, { className: string; animate?: boolean }> = {
  active:    { className: 'bg-warning',           animate: true },
  completed: { className: 'bg-success' },
  error:     { className: 'bg-destructive' },
  paused:    { className: 'bg-muted-foreground/40' },
};

function SidebarItem<T extends HistoryItem>({ item, isActive, onClick, onContextMenu, showStatusDot, onDragStart, onDragOver, onDrop }: {
  item: T;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  showStatusDot?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const statusCfg = showStatusDot ? STATUS_DOT_COLORS[item.status] : null;
  return (
    <Button size="inline"
      variant="ghost"
      onClick={onClick}
      onContextMenu={onContextMenu}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`w-full px-2.5 py-[5px] font-normal rounded-md justify-start gap-1.5 ${
        isActive
          ? 'bg-accent/25 text-foreground'
          : 'text-foreground hover:bg-accent/15 hover:text-foreground'
      }`}
    >
      {statusCfg && item.unread && !isActive && (
        <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${statusCfg.className} ${statusCfg.animate ? 'animate-pulse' : ''}`} />
      )}
      <span className="text-sm truncate flex-1 text-left">
        {item.title}
      </span>
    </Button>
  );
}

// ===========================
// Group Section
// ===========================

function GroupSection<T extends HistoryItem>({
  groupLabel,
  groupItems,
  isCollapsed,
  isExpanded,
  onToggleCollapse,
  onToggleExpand,
  onNewItem,
  activeItemId,
  onSelectItem,
  onUpdateItem,
  onContextMenu,
  showStatusDot,
  dragHandlers,
}: {
  groupLabel: string;
  groupItems: T[];
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggleCollapse: () => void;
  onToggleExpand: () => void;
  onNewItem: () => void;
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<T>) => void;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
  showStatusDot?: boolean;
  dragHandlers: {
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
  };
}) {
  const hasMore = groupItems.length > GROUP_COLLAPSE_LIMIT;
  const visibleItems = (!isCollapsed && hasMore && !isExpanded)
    ? groupItems.slice(0, GROUP_COLLAPSE_LIMIT)
    : groupItems;
  const hiddenCount = groupItems.length - GROUP_COLLAPSE_LIMIT;

  return (
    <div
      className="mb-1"
      draggable
      onDragStart={dragHandlers.onDragStart}
      onDragOver={dragHandlers.onDragOver}
      onDrop={dragHandlers.onDrop}
      onDragEnd={dragHandlers.onDragEnd}
    >
      <div className="group/grp flex items-center gap-1 px-2.5 py-1 cursor-pointer" onClick={onToggleCollapse}>
        {isCollapsed
          ? <ChevronRight size={9} className="text-muted-foreground/40 flex-shrink-0" />
          : <ChevronDown size={9} className="text-muted-foreground/40 flex-shrink-0" />
        }
        <span className="text-xs text-muted-foreground/40 truncate">{groupLabel}</span>
        <span className="text-xs text-muted-foreground/40 tabular-nums flex-shrink-0">{groupItems.length}</span>
        <span className="flex-1" />
        <Button variant="ghost" size="icon-xs"
          onClick={(e) => { e.stopPropagation(); onNewItem(); }}
          className="p-0.5 w-auto h-auto text-muted-foreground/30 hover:text-foreground hover:bg-accent/15 opacity-0 group-hover/grp:opacity-100 transition-opacity"
          title="新建"
        >
          <Plus size={10} />
        </Button>
      </div>
      {!isCollapsed && (
        <>
          {visibleItems.map(item => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activeItemId === item.id}
              onClick={() => { if (item.unread) onUpdateItem(item.id, { unread: false } as Partial<T>); onSelectItem(item.id); }}
              onContextMenu={(e) => onContextMenu(e, item.id)}
              showStatusDot={showStatusDot}
            />
          ))}
          {hasMore && !isExpanded && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onToggleExpand}
              className="w-full justify-center gap-1 px-2 py-0.5 text-muted-foreground/50 hover:text-foreground"
            >
              <span className="text-xs">展开更多</span>
              <span className="text-xs tabular-nums">({hiddenCount})</span>
            </Button>
          )}
          {hasMore && isExpanded && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onToggleExpand}
              className="w-full justify-center gap-1 px-2 py-0.5 text-muted-foreground/50 hover:text-foreground"
            >
              <span className="text-xs">收起</span>
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ===========================
// History Sidebar
// ===========================

export function HistorySidebar<T extends HistoryItem>({
  items,
  activeItemId,
  onSelectItem,
  onDeleteItem,
  onUpdateItem,
  onNewItem,
  onExpand,
  onClose,
  entityLabel,
  showStatusDot = false,
  customGroupBy,
  onNewItemForGroup,
}: HistorySidebarProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByMode>('none');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupOrder, setGroupOrder] = useState<string[] | null>(null);
  const dragRef = useRef<{ dragging: string | null }>({ dragging: null });

  const groupOptions = useMemo(() => {
    const base = [...GROUP_BY_OPTIONS];
    if (customGroupBy) {
      base.push({ key: 'custom', label: customGroupBy.label });
    }
    return base;
  }, [customGroupBy]);

  const pinnedItems = items.filter(s => s.pinned);
  const recentItems = items.filter(s => !s.pinned);

  const filterFn = (s: HistoryItem) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredPinned = pinnedItems.filter(filterFn);
  const filteredRecent = recentItems.filter(filterFn);

  const groupedRecent = useMemo(() => {
    if (!showStatusDot || groupBy === 'none') return null;
    const groups: Record<string, T[]> = {};
    for (const item of filteredRecent) {
      let key: string;
      if (groupBy === 'status') {
        key = STATUS_LABELS[item.status] || item.status;
      } else if (groupBy === 'group') {
        key = item.group || '未分类';
      } else if (groupBy === 'custom' && customGroupBy) {
        key = customGroupBy.getGroupKey(item);
      } else {
        // time
        const t = item.timestamp;
        if (t.includes(':')) key = '今天';
        else if (t === '昨天') key = '昨天';
        else if (t.includes('天前')) key = '本周';
        else key = '更早';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [filteredRecent, groupBy, showStatusDot, customGroupBy]);

  // Sorted group entries — respect user drag order
  const sortedGroupEntries = useMemo((): [string, T[]][] | null => {
    if (!groupedRecent) return null;
    const entries: [string, T[]][] = Object.entries(groupedRecent);
    if (!groupOrder) return entries;
    return [...entries].sort((a: [string, T[]], b: [string, T[]]) => {
      const ia = groupOrder.indexOf(a[0]);
      const ib = groupOrder.indexOf(b[0]);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [groupedRecent, groupOrder]);

  const toggleCollapse = useCallback((label: string) => {
    setCollapsedGroups((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((label: string) => {
    setExpandedGroups((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId });
  };

  // Reset group UI state when switching groupBy mode
  const handleSetGroupBy = useCallback((mode: GroupByMode) => {
    setGroupBy(mode);
    setCollapsedGroups(new Set());
    setExpandedGroups(new Set());
    setGroupOrder(null);
  }, []);

  // Drag handlers for group reordering
  const makeGroupDragHandlers = useCallback((groupLabel: string) => ({
    onDragStart: (e: React.DragEvent) => {
      dragRef.current.dragging = groupLabel;
      e.dataTransfer.effectAllowed = 'move';
      // Make drag image semi-transparent
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '0.5';
      }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragRef.current.dragging;
      if (!from || from === groupLabel || !sortedGroupEntries) return;
      const currentOrder = sortedGroupEntries.map(([k]: [string, T[]]) => k);
      const fromIdx = currentOrder.indexOf(from);
      const toIdx = currentOrder.indexOf(groupLabel);
      if (fromIdx === -1 || toIdx === -1) return;
      const next = [...currentOrder];
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, from);
      setGroupOrder(next);
      dragRef.current.dragging = null;
    },
    onDragEnd: () => {
      dragRef.current.dragging = null;
      // Restore opacity on all group elements
      document.querySelectorAll('[draggable="true"]').forEach(el => {
        (el as HTMLElement).style.opacity = '';
      });
    },
  }), [sortedGroupEntries]);

  return (
    <div className="flex flex-col h-full select-none border-r border-border/15">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/15 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/60">{entityLabel}</span>
            <span className="text-xs text-muted-foreground/40 tabular-nums">{items.length}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {showStatusDot && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon-xs"
                    className={`p-1 w-auto h-auto ${groupBy !== 'none' ? 'text-primary' : 'text-muted-foreground/40'} hover:text-foreground hover:bg-accent/15`}>
                    <ListFilter size={11} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[140px] p-1">
                  <div className="text-xs text-muted-foreground/60 px-2 py-1">Group by</div>
                  {groupOptions.map((opt: { key: GroupByMode; label: string }) => (
                    <Button key={opt.key} variant="ghost" size="xs"
                      onClick={() => handleSetGroupBy(opt.key)}
                      className={`w-full justify-start gap-2 px-2 ${groupBy === opt.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <span className="flex-1 text-left">{opt.label}</span>
                      {groupBy === opt.key && <Check size={10} className="text-primary flex-shrink-0" />}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            )}
            <Tooltip content="展开全部" side="bottom">
              <Button variant="ghost" size="icon-xs" onClick={onExpand}
                className="p-1 w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/15">
                <Maximize2 size={11} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-2.5 py-1.5 flex-shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`搜索${entityLabel}...`}
        />
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-px [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-foreground/10">
        {/* Pinned */}
        {filteredPinned.length > 0 && (
          <div className="mb-1">
            <div className="flex items-center gap-1 px-2.5 py-1">
              <Pin size={9} className="text-muted-foreground/40 -rotate-45" />
              <span className="text-xs text-muted-foreground/40">已置顶</span>
            </div>
            {filteredPinned.map(item => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeItemId === item.id}
                onClick={() => { if (item.unread) onUpdateItem(item.id, { unread: false } as Partial<T>); onSelectItem(item.id); }}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
                showStatusDot={showStatusDot}
              />
            ))}
          </div>
        )}

        {/* Recent */}
        {sortedGroupEntries ? (
          /* Grouped mode */
          sortedGroupEntries.map(([groupLabel, groupItems]: [string, T[]]) => (
            <GroupSection
              key={groupLabel}
              groupLabel={groupLabel}
              groupItems={groupItems}
              isCollapsed={collapsedGroups.has(groupLabel)}
              isExpanded={expandedGroups.has(groupLabel)}
              onToggleCollapse={() => toggleCollapse(groupLabel)}
              onToggleExpand={() => toggleExpand(groupLabel)}
              onNewItem={() => onNewItemForGroup ? onNewItemForGroup(groupLabel) : onNewItem()}
              activeItemId={activeItemId}
              onSelectItem={onSelectItem}
              onUpdateItem={onUpdateItem}
              onContextMenu={handleContextMenu}
              showStatusDot={showStatusDot}
              dragHandlers={makeGroupDragHandlers(groupLabel)}
            />
          ))
        ) : (
          /* Flat mode */
          <>
            {filteredPinned.length > 0 && filteredRecent.length > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1">
                <Clock size={9} className="text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/40">最近</span>
              </div>
            )}
            {filteredRecent.map(item => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeItemId === item.id}
                onClick={() => { if (item.unread) onUpdateItem(item.id, { unread: false } as Partial<T>); onSelectItem(item.id); }}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
                showStatusDot={showStatusDot}
              />
            ))}
          </>
        )}

        {filteredPinned.length === 0 && filteredRecent.length === 0 && searchQuery && (
          <EmptyState preset="no-result" title={`未找到${entityLabel}`} compact />
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ItemContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            isPinned={items.find(s => s.id === contextMenu.itemId)?.pinned}
            onPin={() => {
              const item = items.find(s => s.id === contextMenu.itemId);
              if (item) onUpdateItem(item.id, { pinned: !item.pinned } as Partial<T>);
              setContextMenu(null);
            }}
            onDelete={() => {
              onDeleteItem(contextMenu.itemId);
              setContextMenu(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
