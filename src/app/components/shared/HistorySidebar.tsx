import React, { useState, useMemo } from 'react';
import {
  Trash2, Pin,
  Clock, Maximize2, ListFilter, ChevronDown, Check, FolderOpen,
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

type GroupByMode = 'none' | 'status' | 'group' | 'time';

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

function SidebarItem<T extends HistoryItem>({ item, isActive, onClick, onContextMenu, showStatusDot }: {
  item: T;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  showStatusDot?: boolean;
}) {
  const statusCfg = showStatusDot ? STATUS_DOT_COLORS[item.status] : null;
  return (
    <Button size="inline"
      variant="ghost"
      onClick={onClick}
      onContextMenu={onContextMenu}
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
// History Sidebar
// ===========================

export function HistorySidebar<T extends HistoryItem>({
  items,
  activeItemId,
  onSelectItem,
  onDeleteItem,
  onUpdateItem,
  onExpand,
  onClose,
  entityLabel,
  showStatusDot = false,
}: HistorySidebarProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByMode>('none');

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
  }, [filteredRecent, groupBy, showStatusDot]);

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId });
  };

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
                  {GROUP_BY_OPTIONS.map(opt => (
                    <Button key={opt.key} variant="ghost" size="xs"
                      onClick={() => setGroupBy(opt.key)}
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
        {groupedRecent ? (
          /* Grouped mode */
          Object.entries(groupedRecent).map(([groupLabel, groupItems]) => (
            <div key={groupLabel} className="mb-1">
              <div className="flex items-center gap-1 px-2.5 py-1">
                <FolderOpen size={9} className="text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/40">{groupLabel}</span>
                <span className="text-xs text-muted-foreground/40 tabular-nums">{groupItems.length}</span>
              </div>
              {groupItems.map(item => (
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
