import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Trash2, Pin, Plus, Pencil, Sparkles, Archive,
  Clock, Maximize2, ListFilter, ChevronDown, ChevronRight, ChevronsDown, Check, FolderOpen,
  Tag, X, User,
} from 'lucide-react';
import { Button, SearchInput, EmptyState, Popover, PopoverTrigger, PopoverContent, Checkbox, Badge } from '@cherry-studio/ui';
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
  archived?: boolean;
  assistantName?: string;
  tags?: string[];
}

type GroupByMode = 'none' | 'status' | 'group' | 'time' | 'custom';

const GROUP_BY_OPTIONS: { key: GroupByMode; label: string }[] = [
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
  onRenameGroup?: (oldName: string, newName: string) => void;
}

// ===========================
// Context Menu
// ===========================

function ItemContextMenu({ x, y, onClose, onDelete, onPin, onEdit, onGenerate, onArchive, isPinned }: {
  x: number; y: number; onClose: () => void; onDelete: () => void; onPin: () => void; onEdit: () => void; onGenerate: () => void; onArchive: () => void; isPinned?: boolean;
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
        className="fixed z-[var(--z-overlay)] bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 p-0.5 min-w-0"
        style={{ left: clampedX, top: clampedY }}
      >
        <Button
          variant="ghost"
          size="inline"
          onClick={onEdit}
          className="w-full justify-start gap-1.5 px-2 py-[3px] text-foreground hover:bg-accent/15"
        >
          <Pencil size={10} />
          <span>编辑</span>
        </Button>
        <Button
          variant="ghost"
          size="inline"
          onClick={onGenerate}
          className="w-full justify-start gap-1.5 px-2 py-[3px] text-foreground hover:bg-accent/15"
        >
          <Sparkles size={10} />
          <span>生成话题名</span>
        </Button>
        <Button
          variant="ghost"
          size="inline"
          onClick={onPin}
          className="w-full justify-start gap-1.5 px-2 py-[3px] text-foreground hover:bg-accent/15"
        >
          <Pin size={10} className={isPinned ? '' : '-rotate-45'} />
          <span>{isPinned ? '取消置顶' : '置顶'}</span>
        </Button>
        <Button
          variant="ghost"
          size="inline"
          onClick={onArchive}
          className="w-full justify-start gap-1.5 px-2 py-[3px] text-foreground hover:bg-accent/15"
        >
          <Archive size={10} />
          <span>归档</span>
        </Button>
        <Button
          variant="ghost"
          size="inline"
          onClick={onDelete}
          className="w-full justify-start gap-1.5 px-2 py-[3px] text-destructive/70 hover:bg-destructive/8"
        >
          <Trash2 size={10} />
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

function SidebarItem<T extends HistoryItem>({ item, isActive, isEditing, onClick, onContextMenu, onCommitEdit, onArchive, showStatusDot, onDragStart, onDragOver, onDrop }: {
  item: T;
  isActive: boolean;
  isEditing?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onCommitEdit?: (newTitle: string) => void;
  onArchive?: () => void;
  showStatusDot?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const statusCfg = showStatusDot ? STATUS_DOT_COLORS[item.status] : null;
  const editRef = useRef<HTMLInputElement>(null);
  const [editVal, setEditVal] = useState(item.title);

  useEffect(() => {
    if (isEditing && editRef.current) {
      setEditVal(item.title);
      editRef.current.focus();
      editRef.current.select();
    }
  }, [isEditing, item.title]);

  const commit = () => {
    const trimmed = editVal.trim();
    if (trimmed && trimmed !== item.title && onCommitEdit) {
      onCommitEdit(trimmed);
    } else if (onCommitEdit) {
      onCommitEdit(item.title);
    }
  };

  if (isEditing) {
    return (
      <div className={`w-full px-2.5 py-[3px] rounded-md ${isActive ? 'bg-accent/25' : ''}`}>
        <input
          ref={editRef}
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') onCommitEdit?.(item.title);
          }}
          className="w-full text-sm bg-accent/50 rounded px-1.5 py-[2px] border border-border/40 outline-none focus:border-primary/50 text-foreground"
        />
      </div>
    );
  }

  return (
    <div className="group/item flex items-center">
      <Button size="inline"
        variant="ghost"
        onClick={onClick}
        onContextMenu={onContextMenu}
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex-1 min-w-0 px-2.5 py-[5px] font-normal rounded-md justify-start gap-1.5 ${
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
      {onArchive && (
        <button
          onClick={(e) => { e.stopPropagation(); onArchive(); }}
          className="p-0.5 flex-shrink-0 text-muted-foreground/30 hover:text-foreground opacity-0 group-hover/item:opacity-100 transition-opacity"
          title="归档"
        >
          <Archive size={11} />
        </button>
      )}
    </div>
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
  onRenameGroup,
  editingItemId,
  onCommitEdit,
  onArchiveItem,
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
  onRenameGroup?: (oldName: string, newName: string) => void;
  editingItemId: string | null;
  onCommitEdit: (id: string, newTitle: string) => void;
  onArchiveItem?: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(groupLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== groupLabel && onRenameGroup) {
      onRenameGroup(groupLabel, trimmed);
    }
    setIsEditing(false);
    setEditValue(trimmed || groupLabel);
  };

  const hasMore = groupItems.length > GROUP_COLLAPSE_LIMIT;
  const visibleItems = (!isCollapsed && hasMore && !isExpanded)
    ? groupItems.slice(0, GROUP_COLLAPSE_LIMIT)
    : groupItems;
  const hiddenCount = groupItems.length - GROUP_COLLAPSE_LIMIT;

  return (
    <div
      className="mb-1"
      draggable={!isEditing}
      onDragStart={dragHandlers.onDragStart}
      onDragOver={dragHandlers.onDragOver}
      onDrop={dragHandlers.onDrop}
      onDragEnd={dragHandlers.onDragEnd}
    >
      <div className="group/grp flex items-center gap-1 px-2.5 py-1 cursor-pointer" onClick={() => !isEditing && onToggleCollapse()}>
        {isCollapsed
          ? <ChevronRight size={9} className="text-muted-foreground/40 flex-shrink-0" />
          : <ChevronDown size={9} className="text-muted-foreground/40 flex-shrink-0" />
        }
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setIsEditing(false); setEditValue(groupLabel); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-muted-foreground bg-accent/50 rounded px-1 py-0 border border-border/40 outline-none focus:border-primary/50 w-20"
          />
        ) : (
          <span className="text-xs text-muted-foreground/40 truncate">{groupLabel}</span>
        )}
        <span className="text-xs text-muted-foreground/40 tabular-nums flex-shrink-0">{groupItems.length}</span>
        <span className="flex-1" />
        {onRenameGroup && !isEditing && (
          <Button variant="ghost" size="icon-xs"
            onClick={(e) => { e.stopPropagation(); setEditValue(groupLabel); setIsEditing(true); }}
            className="p-0.5 w-auto h-auto text-muted-foreground/30 hover:text-foreground hover:bg-accent/15 opacity-0 group-hover/grp:opacity-100 transition-opacity"
            title="重命名"
          >
            <Pencil size={9} />
          </Button>
        )}
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
              isEditing={editingItemId === item.id}
              onClick={() => { if (item.unread) onUpdateItem(item.id, { unread: false } as Partial<T>); onSelectItem(item.id); }}
              onContextMenu={(e) => onContextMenu(e, item.id)}
              onCommitEdit={(newTitle) => onCommitEdit(item.id, newTitle)}
              onArchive={onArchiveItem ? () => onArchiveItem(item.id) : undefined}
              showStatusDot={showStatusDot}
            />
          ))}
          {hasMore && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onToggleExpand}
              className="w-full justify-center py-0 text-muted-foreground/40 hover:text-foreground"
            >
              <ChevronsDown size={12} className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
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
  onRenameGroup,
}: HistorySidebarProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByMode>('group');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupOrder, setGroupOrder] = useState<string[] | null>(null);
  const dragRef = useRef<{ dragging: string | null }>({ dragging: null });

  // --- Filter state ---
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const [assistantFilterOpen, setAssistantFilterOpen] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => item.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [items]);

  const allAssistants = useMemo(() => Array.from(new Set(items.map(item => item.assistantName).filter(Boolean) as string[])), [items]);

  const hasItemMetadata = allTags.length > 0 || allAssistants.length > 0;

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }, []);

  const groupOptions = useMemo(() => {
    const base = [...GROUP_BY_OPTIONS];
    if (customGroupBy) {
      base.push({ key: 'custom', label: customGroupBy.label });
    }
    return base;
  }, [customGroupBy]);

  const [showArchived, setShowArchived] = useState(false);
  const activeItems = items.filter(s => !s.archived);
  const archivedItems = items.filter(s => s.archived);
  const pinnedItems = activeItems.filter(s => s.pinned);
  const recentItems = activeItems.filter(s => !s.pinned);

  const filterFn = (s: HistoryItem) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => s.tags?.includes(tag));
    const matchesAssistant = !selectedAssistant || s.assistantName === selectedAssistant;
    return matchesSearch && matchesTags && matchesAssistant;
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedAssistant !== null;

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
        key = item.group || '任务';
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

  // Sorted group entries — '任务' first, then respect user drag order
  const sortedGroupEntries = useMemo((): [string, T[]][] | null => {
    if (!groupedRecent) return null;
    const entries: [string, T[]][] = Object.entries(groupedRecent);
    // Default sort: '任务' always first
    const sorted = [...entries].sort((a: [string, T[]], b: [string, T[]]) => {
      if (a[0] === '任务') return -1;
      if (b[0] === '任务') return 1;
      if (!groupOrder) return 0;
      const ia = groupOrder.indexOf(a[0]);
      const ib = groupOrder.indexOf(b[0]);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return sorted;
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
                    className="p-1 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
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

      {/* Tag & Assistant Filters */}
      {hasItemMetadata && (
        <div className="px-2.5 pb-1.5 flex-shrink-0 flex flex-wrap items-center gap-1">
          {/* Tag filter */}
          {allTags.length > 0 && (
            <Popover open={tagFilterOpen} onOpenChange={setTagFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="inline"
                  className={`flex items-center gap-1 px-1.5 py-[2px] rounded-md text-xs transition-all duration-100 ${
                    tagFilterOpen || selectedTags.length > 0
                      ? 'bg-accent/50 text-foreground'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <Tag size={9} />
                  <span>{selectedTags.length > 0 ? `${selectedTags.length}` : '标签'}</span>
                  <ChevronDown size={8} className={`transition-transform duration-100 ${tagFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[180px] p-0 py-1 max-h-[240px] overflow-y-auto scrollbar-thin-xs">
                {allTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  const count = items.filter(item => item.tags?.includes(tag)).length;
                  return (
                    <Button size="inline" variant="ghost" key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`flex items-center gap-2 w-full px-2.5 py-[4px] text-xs transition-colors rounded-none justify-start ${
                        isSelected ? 'bg-foreground/6 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                      }`}
                    >
                      <Checkbox checked={isSelected} className="flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{tag}</span>
                      <span className="text-xs text-muted-foreground/50 tabular-nums">{count}</span>
                    </Button>
                  );
                })}
                {selectedTags.length > 0 && (
                  <>
                    <div className="h-px bg-border/30 my-0.5" />
                    <Button size="inline" variant="ghost"
                      onClick={() => setSelectedTags([])}
                      className="flex items-center gap-2 w-full px-2.5 py-[4px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors rounded-none justify-start"
                    >
                      <X size={9} className="flex-shrink-0" />
                      <span>清除选择</span>
                    </Button>
                  </>
                )}
              </PopoverContent>
            </Popover>
          )}

          {/* Assistant filter */}
          {allAssistants.length > 0 && (
            <Popover open={assistantFilterOpen} onOpenChange={setAssistantFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="inline"
                  className={`flex items-center gap-1 px-1.5 py-[2px] rounded-md text-xs transition-all duration-100 ${
                    assistantFilterOpen || selectedAssistant
                      ? 'bg-accent/50 text-foreground'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <User size={9} />
                  <span className="truncate max-w-[60px]">{selectedAssistant || '助手'}</span>
                  <ChevronDown size={8} className={`transition-transform duration-100 ${assistantFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[160px] p-0 py-1 max-h-[240px] overflow-y-auto scrollbar-thin-xs">
                <Button size="inline" variant="ghost"
                  onClick={() => { setSelectedAssistant(null); setAssistantFilterOpen(false); }}
                  className={`flex items-center gap-2 w-full px-2.5 py-[4px] text-xs transition-colors rounded-none justify-start ${
                    !selectedAssistant ? 'bg-foreground/6 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <span className="flex-1 text-left">全部</span>
                  <span className="text-xs text-muted-foreground/50 tabular-nums">{items.length}</span>
                </Button>
                {allAssistants.map(ast => {
                  const count = items.filter(item => item.assistantName === ast).length;
                  return (
                    <Button size="inline" variant="ghost" key={ast}
                      onClick={() => { setSelectedAssistant(selectedAssistant === ast ? null : ast); setAssistantFilterOpen(false); }}
                      className={`flex items-center gap-2 w-full px-2.5 py-[4px] text-xs transition-colors rounded-none justify-start ${
                        selectedAssistant === ast ? 'bg-foreground/6 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                      }`}
                    >
                      <span className="flex-1 text-left truncate">{ast}</span>
                      <span className="text-xs text-muted-foreground/50 tabular-nums">{count}</span>
                    </Button>
                  );
                })}
              </PopoverContent>
            </Popover>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="inline"
              onClick={() => { setSelectedTags([]); setSelectedAssistant(null); }}
              className="p-0.5 text-muted-foreground/40 hover:text-foreground transition-colors"
              title="清除筛选"
            >
              <X size={10} />
            </Button>
          )}
        </div>
      )}

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
                isEditing={editingItemId === item.id}
                onClick={() => { if (item.unread) onUpdateItem(item.id, { unread: false } as Partial<T>); onSelectItem(item.id); }}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
                onCommitEdit={(newTitle) => { onUpdateItem(item.id, { title: newTitle } as Partial<T>); setEditingItemId(null); }}
                onArchive={() => onUpdateItem(item.id, { archived: true } as Partial<T>)}
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
              onRenameGroup={onRenameGroup}
              editingItemId={editingItemId}
              onCommitEdit={(id, newTitle) => { onUpdateItem(id, { title: newTitle } as Partial<T>); setEditingItemId(null); }}
              onArchiveItem={(id) => onUpdateItem(id, { archived: true } as Partial<T>)}
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
                isEditing={editingItemId === item.id}
                onClick={() => { if (item.unread) onUpdateItem(item.id, { unread: false } as Partial<T>); onSelectItem(item.id); }}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
                onCommitEdit={(newTitle) => { onUpdateItem(item.id, { title: newTitle } as Partial<T>); setEditingItemId(null); }}
                onArchive={() => onUpdateItem(item.id, { archived: true } as Partial<T>)}
                showStatusDot={showStatusDot}
              />
            ))}
          </>
        )}

        {filteredPinned.length === 0 && filteredRecent.length === 0 && searchQuery && (
          <EmptyState preset="no-result" title={`未找到${entityLabel}`} compact />
        )}

        {/* Archived */}
        {archivedItems.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-1 px-2.5 py-1 cursor-pointer" onClick={() => setShowArchived(v => !v)}>
              {showArchived
                ? <ChevronDown size={9} className="text-muted-foreground/40 flex-shrink-0" />
                : <ChevronRight size={9} className="text-muted-foreground/40 flex-shrink-0" />
              }
              <Archive size={9} className="text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/40">归档</span>
              <span className="text-xs text-muted-foreground/40 tabular-nums">{archivedItems.length}</span>
            </div>
            {showArchived && archivedItems.filter(filterFn).map(item => (
              <div key={item.id} className="group/item flex items-center">
                <Button size="inline"
                  variant="ghost"
                  onClick={() => onSelectItem(item.id)}
                  className="flex-1 min-w-0 px-2.5 py-[5px] font-normal rounded-md justify-start gap-1.5 text-muted-foreground hover:bg-accent/15 hover:text-foreground"
                >
                  <span className="text-sm truncate flex-1 text-left">{item.title}</span>
                </Button>
                <button
                  onClick={() => onUpdateItem(item.id, { archived: false } as Partial<T>)}
                  className="p-0.5 flex-shrink-0 text-muted-foreground/30 hover:text-foreground opacity-0 group-hover/item:opacity-100 transition-opacity"
                  title="取消归档"
                >
                  <Archive size={11} />
                </button>
              </div>
            ))}
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
            onEdit={() => {
              setEditingItemId(contextMenu.itemId);
              setContextMenu(null);
            }}
            onGenerate={() => {
              const item = items.find(s => s.id === contextMenu.itemId);
              if (item) {
                const generated = `${item.title} — AI`;
                onUpdateItem(item.id, { title: generated } as Partial<T>);
              }
              setContextMenu(null);
            }}
            onPin={() => {
              const item = items.find(s => s.id === contextMenu.itemId);
              if (item) onUpdateItem(item.id, { pinned: !item.pinned } as Partial<T>);
              setContextMenu(null);
            }}
            onArchive={() => {
              onUpdateItem(contextMenu.itemId, { archived: true } as Partial<T>);
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
