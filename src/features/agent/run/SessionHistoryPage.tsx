import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pin, Trash2, Tag, MoreHorizontal, Check, ChevronDown, FolderOpen, MessageCircle, History, List, LayoutGrid, ArrowUpDown, Edit3, Plus } from 'lucide-react';
import { Button, Input, EmptyState, SearchInput, Popover, PopoverTrigger, PopoverContent, ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator , Checkbox} from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import type { AgentSession } from './SessionSidebar';

type SortKey = 'time' | 'name' | 'messages';
type GroupMode = 'none' | 'agent' | 'tag';
type ViewMode = 'card' | 'list';
export type SessionDisplayMode = 'floating' | 'docked';

interface Props {
  sessions: AgentSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onUpdateSession: (id: string, updates: Partial<AgentSession>) => void;
  onClose: () => void;
  displayMode?: SessionDisplayMode;
  onDisplayModeChange?: (mode: SessionDisplayMode) => void;
}

// ===========================
// Tag Badge
// ===========================

const TAG_COLORS: Record<string, string> = {
  '前端': 'bg-accent-blue-muted text-accent-blue border-accent-blue/20',
  'React': 'bg-accent-cyan-muted text-accent-cyan border-accent-cyan/20',
  '后端': 'bg-accent-violet-muted text-accent-violet border-accent-violet/20',
  '调研': 'bg-warning-muted text-warning border-warning/20',
  'AI': 'bg-accent-pink-muted text-accent-pink border-accent-pink/20',
  '可视化': 'bg-muted text-foreground border-border/50',
  '安全': 'bg-destructive/12 text-destructive border-destructive/20',
  '性能': 'bg-accent-orange-muted text-accent-orange border-accent-orange/20',
  'DevOps': 'bg-accent-indigo-muted text-accent-indigo border-accent-indigo/20',
  '部署': 'bg-accent-emerald-muted text-accent-emerald border-accent-emerald/20',
  '移动端': 'bg-accent-blue-muted text-accent-blue border-accent-blue/20',
  '实时': 'bg-accent-purple-muted text-accent-purple border-accent-purple/20',
  '竞品': 'bg-accent-amber-muted text-accent-amber border-accent-amber/20',
};

function TagBadge({ tag, selected, onClick, onRemove, size = 'sm' }: {
  tag: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'xs';
}) {
  const color = TAG_COLORS[tag] || 'bg-muted text-foreground border-border/50';
  const sizeClass = size === 'sm' ? 'px-2 py-[2px] text-xs' : 'px-1.5 py-[1px] text-xs';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 rounded-md border transition-all duration-100 ${sizeClass} ${color} ${
        selected ? 'ring-1 ring-ring/20 shadow-sm' : ''
      } ${onClick ? 'cursor-pointer hover:shadow-sm active:scale-[0.97]' : 'cursor-default'}`}
    >
      {tag}
      {onRemove && (
        <Button variant="ghost" size="icon-xs"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 h-auto w-auto p-0 text-current opacity-50 hover:opacity-100 hover:bg-transparent"
        >
          <X size={8} />
        </Button>
      )}
    </span>
  );
}

// ===========================
// Agent Icons
// ===========================

const AGENT_ICONS: Record<string, string> = {
  '全栈工程师': '🛠',
  '调研分析师': '🔍',
  '后端工程师': '⚙️',
  '运维工程师': '🚀',
};

// ===========================
// Session Status Config
// ===========================

const SESSION_STATUS_CONFIG: Record<string, { dot: string; label: string; animate?: boolean }> = {
  active:    { dot: 'bg-warning',        label: '运行中', animate: true },
  completed: { dot: 'bg-success',         label: '已完成' },
  error:     { dot: 'bg-destructive',    label: '失败' },
  paused:    { dot: 'bg-muted-foreground/40', label: '已暂停' },
};

function StatusDot({ status, size = 5 }: { status: string; size?: number }) {
  const cfg = SESSION_STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span
      className={`rounded-full flex-shrink-0 ${cfg.dot} ${cfg.animate ? 'animate-pulse' : ''}`}
      style={{ width: size, height: size }}
    />
  );
}

// ===========================
// Grouped Section
// ===========================

function GroupSection({ title, count, children, defaultOpen = true, icon }: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <Button variant="ghost" size="inline"
        onClick={() => setOpen(!open)}
        className="w-full justify-start gap-2 px-2 py-1.5 font-normal hover:bg-accent/15"
      >
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.1 }}>
          <ChevronDown size={11} className="text-muted-foreground" />
        </motion.div>
        {icon || <FolderOpen size={11} className="text-muted-foreground" />}
        <span className="text-xs text-foreground flex-1 text-left">{title}</span>
        <span className="text-xs text-muted-foreground bg-accent/25 px-1.5 py-[1px] rounded-md tabular-nums">{count}</span>
      </Button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
          >
            <div className="pt-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Tag Editor Popover
// ===========================

function TagEditorPopover({ session, allTags, onUpdate, onClose }: {
  session: AgentSession;
  allTags: string[];
  onUpdate: (tags: string[]) => void;
  onClose: () => void;
}) {
  const [tags, setTags] = useState<string[]>(session.tags || []);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const addTag = (t: string) => {
    const trimmed = t.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const toggleTag = (t: string) => {
    if (tags.includes(t)) removeTag(t);
    else setTags([...tags, t]);
  };

  const save = () => { onUpdate(tags); onClose(); };

  const unusedTags = allTags.filter(t => !tags.includes(t));

  return (
    <div>
      <div className="fixed inset-0 z-[var(--z-floating)] bg-foreground/10" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.12 }}
        className="fixed z-[var(--z-floating)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border/40 rounded-xl shadow-2xl shadow-black/15 w-[340px] overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Tag size={12} className="text-muted-foreground" />
            <span className="text-xs text-foreground">{"编辑标签"}</span>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground">
            <X size={12} />
          </Button>
        </div>

        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground mb-2 truncate">{"话题："}{session.title}</p>

          {/* Current tags */}
          <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
            {tags.length === 0 && <span className="text-xs text-muted-foreground/40">{"暂无标签"}</span>}
            {tags.map(t => (
              <TagBadge key={t} tag={t} size="sm" onRemove={() => removeTag(t)} />
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 mb-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTag(input); }}
              placeholder="输入新标签名..."
              className="flex-1 h-auto bg-accent/15 border-border/30 shadow-none focus-visible:ring-0"
            />
            <Button variant="secondary" size="xs"
              onClick={() => addTag(input)}
              disabled={!input.trim()}
            >
              {"添加"}
            </Button>
          </div>

          {/* Suggested tags */}
          {unusedTags.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-[0.06em]">{"可用标签"}</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {unusedTags.map(t => (
                  <TagBadge key={t} tag={t} size="sm" onClick={() => toggleTag(t)} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-border/30">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            {"取消"}
          </Button>
          <Button size="sm" onClick={save}>
            {"保存"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ===========================
// Session Card (card view)
// ===========================

function SessionCard({ session, isActive, isHovered, onSelect, onEditTags, onTogglePin, onDelete, onMouseEnter, onMouseLeave }: {
  session: AgentSession;
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onEditTags: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onSelect}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-100 ${
            isActive
              ? 'bg-cherry-active-bg border border-cherry-ring'
              : 'border border-transparent hover:bg-accent/15 hover:border-border/30'
          }`}
        >
          {/* Agent icon -- small */}
          <span className="text-sm flex-shrink-0">{session.agentIcon || AGENT_ICONS[session.agentName] || '🤖'}</span>

          {/* Content -- compact two-line */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {session.unread && !isActive && <StatusDot status={session.status} />}
              {session.pinned && <Pin size={8} className="text-muted-foreground/50 -rotate-45 flex-shrink-0" />}
              <span className="text-sm text-foreground truncate">{session.title}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-[2px]">
              <span className="text-xs text-muted-foreground/60 flex-shrink-0">{session.agentName}</span>
              <span className="text-muted-foreground/30">{"\u00b7"}</span>
              <span className="text-xs text-muted-foreground/50 tabular-nums flex-shrink-0">{session.messageCount}{" \u6761"}</span>
              <span className="text-muted-foreground/30">{"\u00b7"}</span>
              <span className="text-xs text-muted-foreground/50 flex-shrink-0">{session.timestamp}</span>
              {session.tags && session.tags.length > 0 && (
                <div className="flex items-center gap-0.5 overflow-hidden ml-0.5">
                  {session.tags.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} size="xs" />)}
                  {session.tags.length > 2 && <span className="text-xs text-muted-foreground/40">+{session.tags.length - 2}</span>}
                </div>
              )}
              {session.group && <span className="text-xs text-muted-foreground/40 ml-auto flex-shrink-0">{session.group}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="w-[20px] flex-shrink-0 flex justify-center">
            {isHovered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MoreHorizontal size={11} className="text-muted-foreground/40" />
              </motion.div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEditTags}>
          <Tag size={14} /> {"\u7f16\u8f91\u6807\u7b7e"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onTogglePin}>
          <Pin size={14} className={session.pinned ? '' : '-rotate-45'} />
          {session.pinned ? '\u53d6\u6d88\u7f6e\u9876' : '\u7f6e\u9876'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 size={14} /> {"\u5220\u9664"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// ===========================
// Session List Row (list view)
// ===========================

function SessionListRow({ session, isActive, isHovered, onSelect, onEditTags, onTogglePin, onDelete, onMouseEnter, onMouseLeave }: {
  session: AgentSession;
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onEditTags: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onSelect}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg cursor-pointer transition-all duration-75 group ${
            isActive ? 'bg-cherry-active-bg' : 'hover:bg-accent/15'
          }`}
        >
          <span className="text-sm flex-shrink-0 w-5 text-center">{session.agentIcon || AGENT_ICONS[session.agentName] || '🤖'}</span>
          {session.unread && !isActive && <StatusDot status={session.status} />}
          {session.pinned && <Pin size={8} className="text-muted-foreground/50 -rotate-45 flex-shrink-0" />}
          <span className={`text-sm flex-1 truncate ${isActive ? 'text-foreground' : 'text-foreground'}`}>
            {session.title}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {session.tags?.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} size="xs" />)}
          </div>
          <span className="text-xs text-muted-foreground truncate flex-shrink-0 w-[90px] text-right">{session.agentName}</span>
          <div className="flex items-center gap-0.5 flex-shrink-0 w-[36px] justify-end">
            <MessageCircle size={8} className="text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground tabular-nums">{session.messageCount}</span>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0 w-[40px] text-right tabular-nums">{session.timestamp}</span>
          <div className="w-[24px] flex-shrink-0 flex justify-center">
            {isHovered ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <MoreHorizontal size={11} className="text-muted-foreground/40" />
              </motion.div>
            ) : null}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEditTags}>
          <Tag size={14} /> {"\u7f16\u8f91\u6807\u7b7e"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onTogglePin}>
          <Pin size={14} className={session.pinned ? '' : '-rotate-45'} />
          {session.pinned ? '\u53d6\u6d88\u7f6e\u9876' : '\u7f6e\u9876'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 size={14} /> {"\u5220\u9664"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// ===========================
// Session History Page
// ===========================

export function SessionHistoryPage({ sessions, activeSessionId, onSelectSession, onDeleteSession, onUpdateSession, onClose, displayMode = 'floating', onDisplayModeChange }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'error'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [groupMode, setGroupMode] = useState<GroupMode>('none');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [agentQuery, setAgentQuery] = useState('');

  // Tag editing
  const [tagEditSession, setTagEditSession] = useState<AgentSession | null>(null);

  // Tag dropdown in toolbar
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagManageMode, setTagManageMode] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const newTagRef = useRef<HTMLInputElement>(null);
  const [managedTags, setManagedTags] = useState<string[]>(() => {
    const tags = new Set<string>();
    sessions.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  });

  useEffect(() => {
    if (tagManageMode) setTimeout(() => newTagRef.current?.focus(), 50);
  }, [tagManageMode]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    sessions.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [sessions]);

  const allAgents = useMemo(() => Array.from(new Set(sessions.map(s => s.agentName))), [sessions]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filteredSessions = useMemo(() => {
    let list = [...sessions];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.agentName.toLowerCase().includes(q) ||
        s.lastMessage.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length > 0) list = list.filter(s => selectedTags.some(t => s.tags?.includes(t)));
    if (selectedAgent) list = list.filter(s => s.agentName === selectedAgent);
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    list.sort((a, b) => {
      if (sortKey === 'name') return a.title.localeCompare(b.title);
      if (sortKey === 'messages') return b.messageCount - a.messageCount;
      return 0;
    });
    return list;
  }, [sessions, searchQuery, selectedTags, selectedAgent, statusFilter, sortKey]);

  const groupedSessions = useMemo(() => {
    if (groupMode === 'none') return null;
    const groups: Record<string, AgentSession[]> = {};
    filteredSessions.forEach(s => {
      if (groupMode === 'agent') {
        const key = s.agentName;
        if (!groups[key]) groups[key] = [];
        groups[key].push(s);
      } else if (groupMode === 'tag') {
        const tags = s.tags && s.tags.length > 0 ? s.tags : ['未标记'];
        tags.forEach(tag => {
          if (!groups[tag]) groups[tag] = [];
          groups[tag].push(s);
        });
      }
    });
    return groups;
  }, [filteredSessions, groupMode]);

  const activeCount = sessions.filter(s => s.status === 'active').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const errorCount = sessions.filter(s => s.status === 'error').length;
  const hasFilters = selectedTags.length > 0 || selectedAgent !== null || statusFilter !== 'all';
  const clearFilters = () => { setSelectedTags([]); setSelectedAgent(null); setStatusFilter('all'); setSearchQuery(''); };

  const sessionProps = (session: AgentSession) => ({
    session,
    isActive: activeSessionId === session.id,
    isHovered: hoveredId === session.id,
    onSelect: () => { onSelectSession(session.id); onClose(); },
    onEditTags: () => setTagEditSession(session),
    onTogglePin: () => onUpdateSession(session.id, { pinned: !session.pinned }),
    onDelete: () => onDeleteSession(session.id),
    onMouseEnter: () => setHoveredId(session.id),
    onMouseLeave: () => setHoveredId(null),
  });

  const renderSession = (session: AgentSession) =>
    viewMode === 'card'
      ? <SessionCard key={session.id} {...sessionProps(session)} />
      : <SessionListRow key={session.id} {...sessionProps(session)} />;

  const listGap = viewMode === 'card' ? 'gap-1.5' : 'gap-0';
  const isDocked = displayMode !== 'floating';

  // ===== Docked compact view =====
  if (isDocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col h-full bg-background"
      >
        {/* Compact header */}
        <div className="flex items-center justify-between px-3 h-[40px] border-b border-border/30 flex-shrink-0">
          <span className="text-xs text-foreground">{"话题"}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1.5 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/15">
              <X size={13} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-2.5 py-2 flex-shrink-0">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="搜索话题..." clearable wrapperClassName="flex items-center gap-1.5 px-2 py-[5px] rounded-md bg-accent/15 border border-border/15" />
        </div>

        {/* Simple session list */}
        <div className="flex-1 overflow-y-auto px-1.5 scrollbar-thin-xs">
          {filteredSessions.length === 0 ? (
            <EmptyState preset="no-result" compact />
          ) : (
            filteredSessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <Button
                  key={s.id}
                  variant="ghost"
                  size="xs"
                  onClick={() => { onSelectSession(s.id); onClose(); }}
                  className={`w-full justify-start px-2.5 py-[7px] font-normal truncate ${
                    isActive
                      ? 'bg-accent/25 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  {s.title}
                </Button>
              );
            })
          )}
        </div>
      </motion.div>
    );
  }

  // ===== Floating full view =====
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-[var(--z-dropdown)] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-[48px] border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent/50 flex items-center justify-center">
            <History size={14} className="text-foreground" />
          </div>
          <div>
            <h2 className="text-sm text-foreground">
              {selectedAgent ? `${selectedAgent} · 话题历史` : '话题历史记录'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedAgent
                ? `${filteredSessions.length} 个话题 · 筛选自 ${sessions.length} 个`
                : `${sessions.length} 个话题 · ${activeCount} 个运行中`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-muted-foreground ml-2">
            <X size={15} />
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Filter Sidebar */}
        <div className="w-[200px] border-r border-border/30 flex flex-col flex-shrink-0 overflow-y-auto py-3 px-3 scrollbar-thin-xs">
          {/* Status */}
          <div className="mb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-[0.08em] px-1 mb-2">{"状态"}</div>
            <div className="flex flex-col gap-[2px]">
              {([
                { key: 'all' as const, label: '全部', count: sessions.length },
                { key: 'active' as const, label: '运行中', count: activeCount },
                { key: 'completed' as const, label: '已完成', count: completedCount },
                { key: 'error' as const, label: '失败', count: errorCount },
              ]).map(item => (
                <Button variant="ghost" size="xs"
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`w-full justify-start gap-2 ${
                    statusFilter === item.key ? 'bg-accent/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  {item.key !== 'all' && <StatusDot status={item.key} />}
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{item.count}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Agent list — direct click with search (like assistant page) */}
          <div className="mb-4">
            <div className="text-xs text-muted-foreground uppercase tracking-[0.08em] px-1 mb-2">{"智能体"}</div>
            {/* Agent search */}
            <SearchInput value={agentQuery} onChange={setAgentQuery} placeholder="搜索智能体..." clearable wrapperClassName="flex items-center gap-2 px-2.5 py-[5px] rounded-md bg-accent/15 border border-border/25 mb-2" />
            <div className="flex flex-col gap-[2px]">
              {!agentQuery && (
                <Button variant="ghost" size="xs"
                  onClick={() => setSelectedAgent(null)}
                  className={`w-full justify-start gap-2 ${
                    !selectedAgent ? 'bg-accent/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <span className="flex-1 text-left">{"全部"}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{sessions.length}</span>
                </Button>
              )}
              {allAgents
                .filter(agent => !agentQuery || agent.toLowerCase().includes(agentQuery.toLowerCase()))
                .map(agent => {
                const count = sessions.filter(s => s.agentName === agent).length;
                return (
                  <Button variant="ghost" size="xs"
                    key={agent}
                    onClick={() => setSelectedAgent(selectedAgent === agent ? null : agent)}
                    className={`w-full justify-start gap-2 ${
                      selectedAgent === agent ? 'bg-accent/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                    }`}
                  >
                    <span className="text-xs flex-shrink-0">{AGENT_ICONS[agent] || '🤖'}</span>
                    <span className="flex-1 text-left truncate">{agent}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                  </Button>
                );
              })}
              {agentQuery && allAgents.filter(agent => agent.toLowerCase().includes(agentQuery.toLowerCase())).length === 0 && (
                <div className="px-2.5 py-3 text-xs text-muted-foreground/40 text-center">{"无匹配智能体"}</div>
              )}
            </div>
          </div>

          {hasFilters && (
            <Button variant="outline" size="xs"
              onClick={clearFilters}
              className="w-full border-dashed border-border/30 text-muted-foreground hover:text-foreground hover:bg-accent/15 mt-auto"
            >
              <X size={9} />
              {"清除所有筛选"}
            </Button>
          )}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground">{filteredSessions.length}{" 条结果"}</span>
              {/* Tag filter */}
              <Popover open={tagDropdownOpen} onOpenChange={(open) => { setTagDropdownOpen(open); if (!open) setTagManageMode(false); }}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="xs"
                    className={`gap-1 ${
                      tagDropdownOpen || selectedTags.length > 0
                        ? 'bg-accent/50 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                    }`}
                  >
                    <Tag size={9} />
                    <span>{selectedTags.length > 0 ? `${selectedTags.length} 个标签` : '标签'}</span>
                    <ChevronDown size={8} className={`transition-transform duration-100 ${tagDropdownOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[220px] p-0 py-1 max-h-[280px] overflow-y-auto scrollbar-thin-xs"
                >
                        {!tagManageMode ? (
                          <div>
                            {(managedTags.length > 0 ? managedTags : allTags).map(tag => {
                              const isSelected = selectedTags.includes(tag);
                              const count = sessions.filter(s => s.tags?.includes(tag)).length;
                              return (
                                <Button variant="ghost" size="xs"
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  className={`w-full justify-start gap-2 ${
                                    isSelected ? 'bg-foreground/6 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                                  }`}
                                >
                                  <Checkbox checked={isSelected} className="flex-shrink-0" />
                                  <TagBadge tag={tag} size="xs" />
                                  <span className="flex-1" />
                                  <span className="text-xs text-muted-foreground/50 tabular-nums">{count}</span>
                                </Button>
                              );
                            })}
                            {selectedTags.length > 0 && (
                              <div>
                                <div className="h-px bg-border/30 my-0.5" />
                                <Button variant="ghost" size="xs"
                                  onClick={() => setSelectedTags([])}
                                  className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/15"
                                >
                                  <X size={9} className="flex-shrink-0" />
                                  <span>{"清除选择"}</span>
                                </Button>
                              </div>
                            )}
                            <div className="h-px bg-border/30 my-0.5" />
                            <Button variant="ghost" size="xs"
                              onClick={() => setTagManageMode(true)}
                              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/15"
                            >
                              <Edit3 size={9} className="flex-shrink-0" />
                              <span>{"管理标签"}</span>
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="px-2.5 py-1.5 border-b border-border/30">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-foreground">{"管理标签"}</span>
                                <Button variant="link" size="inline"
                                  onClick={() => setTagManageMode(false)}
                                  className="p-0 text-muted-foreground hover:text-foreground"
                                >
                                  {"返回"}
                                </Button>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Input
                                  ref={newTagRef}
                                  value={newTagInput}
                                  onChange={(e) => setNewTagInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTagInput.trim()) {
                                      const t = newTagInput.trim();
                                      if (!managedTags.includes(t)) setManagedTags(prev => [...prev, t].sort());
                                      setNewTagInput('');
                                    }
                                  }}
                                  placeholder="新建标签..."
                                  className="flex-1 h-auto bg-accent/15 border-border/30 shadow-none focus-visible:ring-0"
                                />
                                <Button variant="ghost" size="icon-xs"
                                  onClick={() => {
                                    const t = newTagInput.trim();
                                    if (t && !managedTags.includes(t)) setManagedTags(prev => [...prev, t].sort());
                                    setNewTagInput('');
                                  }}
                                  disabled={!newTagInput.trim()}
                                  className="text-foreground hover:bg-accent"
                                >
                                  <Plus size={10} />
                                </Button>
                              </div>
                            </div>
                            {(managedTags.length > 0 ? managedTags : allTags).map(tag => {
                              const count = sessions.filter(s => s.tags?.includes(tag)).length;
                              return (
                                <div
                                  key={tag}
                                  className="flex items-center gap-2 px-2.5 py-[5px] text-xs text-foreground group/tag hover:bg-accent/15 transition-colors"
                                >
                                  <TagBadge tag={tag} size="xs" />
                                  <span className="flex-1" />
                                  <span className="text-xs text-muted-foreground/50 tabular-nums">{count}</span>
                                  <Tooltip content="删除标签" side="right"><Button variant="ghost" size="icon-xs"
                                    onClick={() => {
                                      setManagedTags(prev => prev.filter(t => t !== tag));
                                      setSelectedTags(prev => prev.filter(t => t !== tag));
                                    }}
                                    className="p-0.5 w-auto h-auto text-muted-foreground/40 hover:text-destructive opacity-0 group-hover/tag:opacity-100"
                                  >
                                    <Trash2 size={9} />
                                  </Button></Tooltip>
                                </div>
                              );
                            })}
                          </div>
                        )}
                </PopoverContent>
              </Popover>
              {/* Selected tag badges inline */}
              {selectedTags.length > 0 && (
                <div className="flex items-center gap-1">
                  {selectedTags.map(tag => <TagBadge key={tag} tag={tag} size="xs" onClick={() => toggleTag(tag)} onRemove={() => toggleTag(tag)} />)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Topic search */}
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="搜索话题..." clearable wrapperClassName="flex items-center gap-1.5 px-2 py-[3px] rounded-md bg-accent/15 border border-border/25 w-[160px]" />
              <div className="w-px h-4 bg-border/30" />
              {/* View mode */}
              <div className="flex items-center gap-[1px] bg-accent/15 rounded-md p-[2px]">
                <Tooltip content="列表视图" side="bottom"><Button variant="ghost" size="icon-xs"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
                >
                  <List size={12} />
                </Button></Tooltip>
                <Tooltip content="卡片视图" side="bottom"><Button variant="ghost" size="icon-xs"
                  onClick={() => setViewMode('card')}
                  className={viewMode === 'card' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
                >
                  <LayoutGrid size={12} />
                </Button></Tooltip>
              </div>
              <div className="w-px h-4 bg-border/30" />
              {/* Group */}
              <div className="flex items-center gap-[2px] bg-accent/15 rounded-md p-[2px]">
                {([
                  { key: 'none' as GroupMode, label: '平铺' },
                  { key: 'agent' as GroupMode, label: '智能体' },
                  { key: 'tag' as GroupMode, label: '标签' },
                ] as const).map(g => (
                  <Button variant="ghost" size="xs"
                    key={g.key}
                    onClick={() => setGroupMode(g.key)}
                    className={`${
                      groupMode === g.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                    }`}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
              <div className="w-px h-4 bg-border/30" />
              {/* Sort */}
              <Button variant="ghost" size="xs"
                onClick={() => {
                  if (sortKey === 'time') setSortKey('name');
                  else if (sortKey === 'name') setSortKey('messages');
                  else setSortKey('time');
                }}
                className="gap-1 text-muted-foreground hover:text-foreground hover:bg-accent/15"
              >
                <ArrowUpDown size={10} />
                {sortKey === 'time' ? '按时间' : sortKey === 'name' ? '按名称' : '按消息数'}
              </Button>
            </div>
          </div>

          {/* List header */}
          {viewMode === 'list' && filteredSessions.length > 0 && (
            <div className="flex items-center gap-2.5 px-3 py-[5px] border-b border-border/15 text-xs text-muted-foreground uppercase tracking-[0.06em] flex-shrink-0">
              <span className="w-5 flex-shrink-0 text-center">{"智能体"}</span>
              <span className="flex-1">{"标题"}</span>
              <span className="w-[90px] text-right flex-shrink-0">{"类型"}</span>
              <span className="w-[36px] text-right flex-shrink-0">{"消息"}</span>
              <span className="w-[40px] text-right flex-shrink-0">{"时间"}</span>
              <span className="w-[24px] flex-shrink-0" />
            </div>
          )}

          {/* Session List */}
          <div className="flex-1 overflow-y-auto px-2 py-1.5 scrollbar-thin">
            {groupedSessions ? (
              Object.entries(groupedSessions).map(([groupName, groupSessions]) => (
                <GroupSection
                  key={groupName}
                  title={groupName}
                  count={groupSessions.length}
                  icon={groupMode === 'agent'
                    ? <span className="text-xs">{AGENT_ICONS[groupName] || '🤖'}</span>
                    : groupMode === 'tag'
                      ? <Tag size={10} className="text-muted-foreground" />
                      : undefined
                  }
                >
                  <div className={`flex flex-col ${listGap} pl-2`}>
                    {groupSessions.map(renderSession)}
                  </div>
                </GroupSection>
              ))
            ) : (
              <div className={`flex flex-col ${listGap}`}>
                {filteredSessions.map(renderSession)}
              </div>
            )}

            {filteredSessions.length === 0 && (
              <EmptyState
                preset="no-result"
                actionLabel={hasFilters ? '清除筛选条件' : undefined}
                onAction={hasFilters ? clearFilters : undefined}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tag Editor */}
      <AnimatePresence>
        {tagEditSession && (
          <TagEditorPopover
            session={tagEditSession}
            allTags={allTags}
            onUpdate={(tags) => onUpdateSession(tagEditSession.id, { tags })}
            onClose={() => setTagEditSession(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
