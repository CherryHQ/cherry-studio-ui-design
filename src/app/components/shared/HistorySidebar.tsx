import React, { useState } from 'react';
import {
  Search, Trash2, Pin,
  Clock, Maximize2,
  X,
} from 'lucide-react';
import { Button, Input } from '@cherry-studio/ui';
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
}

interface HistorySidebarProps<T extends HistoryItem> {
  items: T[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<T>) => void;
  onNewItem: () => void;
  onExpand: () => void;
  onHide: () => void;
  entityLabel: string;
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
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.08 }}
        className="fixed z-50 bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 p-1 min-w-[140px]"
        style={{ left: clampedX, top: clampedY }}
      >
        <Button
          variant="ghost"
          size="xs"
          onClick={onPin}
          className="w-full justify-start gap-2 text-foreground/70 hover:bg-accent/15"
        >
          <Pin size={11} className={isPinned ? '' : '-rotate-45'} />
          <span>{isPinned ? '取消置顶' : '置顶'}</span>
        </Button>
        <div className="h-px bg-border/20 my-1" />
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

function SidebarItem<T extends HistoryItem>({ item, isActive, onClick, onContextMenu }: {
  item: T;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`w-full px-2.5 py-[5px] h-auto font-normal rounded-md justify-start gap-1.5 ${
        isActive
          ? 'bg-accent/20 text-foreground'
          : 'text-foreground/70 hover:bg-accent/10 hover:text-foreground'
      }`}
    >
      {item.pinned && (
        <Pin size={8} className="text-foreground/30 flex-shrink-0 -rotate-45" />
      )}
      <span className="text-xs truncate flex-1 text-left">
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
  onHide,
  entityLabel,
}: HistorySidebarProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);

  const pinnedItems = items.filter(s => s.pinned);
  const recentItems = items.filter(s => !s.pinned);

  const filterFn = (s: HistoryItem) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredPinned = pinnedItems.filter(filterFn);
  const filteredRecent = recentItems.filter(filterFn);

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
            <Clock size={12} className="text-foreground/40" />
            <span className="text-xs text-foreground/50">{entityLabel}</span>
            <span className="text-[10px] text-foreground/30 tabular-nums">{items.length}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Tooltip content="展开全部" side="bottom">
              <Button variant="ghost" size="icon-xs" onClick={onExpand}
                className="p-1 w-auto h-auto text-foreground/30 hover:text-foreground/60 hover:bg-accent/15">
                <Maximize2 size={11} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-2.5 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-[5px] rounded-lg bg-accent/10 border border-border/15">
          <Search size={11} className="text-foreground/30 flex-shrink-0" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`搜索${entityLabel}...`}
            className="flex-1 h-auto border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent text-xs text-foreground/70 placeholder:text-foreground/30 py-0 px-0 rounded-none"
          />
          {searchQuery && (
            <Button variant="ghost" size="icon-xs" onClick={() => setSearchQuery('')}
              className="w-auto h-auto p-0 text-foreground/30 hover:text-foreground/60 hover:bg-transparent">
              <X size={9} />
            </Button>
          )}
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-px [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-foreground/10">
        {/* Pinned */}
        {filteredPinned.length > 0 && (
          <div className="mb-1">
            <div className="flex items-center gap-1 px-2.5 py-1">
              <Pin size={9} className="text-foreground/25 -rotate-45" />
              <span className="text-[10px] text-foreground/30">已置顶</span>
            </div>
            {filteredPinned.map(item => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeItemId === item.id}
                onClick={() => onSelectItem(item.id)}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
              />
            ))}
          </div>
        )}

        {/* Recent */}
        {filteredPinned.length > 0 && filteredRecent.length > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1">
            <Clock size={9} className="text-foreground/25" />
            <span className="text-[10px] text-foreground/30">最近</span>
          </div>
        )}
        {filteredRecent.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            onClick={() => onSelectItem(item.id)}
            onContextMenu={(e) => handleContextMenu(e, item.id)}
          />
        ))}

        {filteredPinned.length === 0 && filteredRecent.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-8">
            <Search size={16} className="text-foreground/15 mb-2" />
            <p className="text-xs text-foreground/35">未找到{entityLabel}</p>
          </div>
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
