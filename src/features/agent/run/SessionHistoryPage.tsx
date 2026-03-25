import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pin, Trash2, Tag, MoreHorizontal, Check, ChevronDown, FolderOpen, MessageCircle, History, Search, List, LayoutGrid, ArrowUpDown, Edit3, Plus } from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import type { AgentSession } from './SessionSidebar';

type SortKey = 'time' | 'name' | 'messages';
type GroupMode = 'none' | 'agent' | 'tag';
type ViewMode = 'card' | 'list';

interface Props {
  sessions: AgentSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onUpdateSession: (id: string, updates: Partial<AgentSession>) => void;
  onClose: () => void;
}

// ===========================
// Tag Badge
// ===========================

const TAG_COLORS: Record<string, string> = {
  '前端': 'bg-blue-500/12 text-blue-700 border-blue-500/20',
  'React': 'bg-cyan-500/12 text-cyan-700 border-cyan-500/20',
  '后端': 'bg-violet-500/12 text-violet-700 border-violet-500/20',
  '调研': 'bg-amber-500/12 text-amber-700 border-amber-500/20',
  'AI': 'bg-pink-500/12 text-pink-700 border-pink-500/20',
  '可视化': 'bg-foreground/[0.07] text-foreground/80 border-foreground/[0.1]',
  '安全': 'bg-red-500/12 text-red-700 border-red-500/20',
  '性能': 'bg-orange-500/12 text-orange-700 border-orange-500/20',
  'DevOps': 'bg-indigo-500/12 text-indigo-700 border-indigo-500/20',
  '部署': 'bg-teal-500/12 text-teal-700 border-teal-500/20',
  '移动端': 'bg-sky-500/12 text-sky-700 border-sky-500/20',
  '实时': 'bg-purple-500/12 text-purple-700 border-purple-500/20',
  '竞品': 'bg-yellow-500/12 text-yellow-700 border-yellow-500/20',
};

function TagBadge({ tag, selected, onClick, onRemove, size = 'sm' }: {
  tag: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'xs';
}) {
  const color = TAG_COLORS[tag] || 'bg-gray-500/12 text-gray-700 border-gray-500/20';
  const sizeClass = size === 'sm' ? 'px-2 py-[2px] text-[10px]' : 'px-1.5 py-[1px] text-[9px]';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 rounded-md border transition-all duration-100 ${sizeClass} ${color} ${
        selected ? 'ring-1 ring-foreground/20 shadow-sm' : ''
      } ${onClick ? 'cursor-pointer hover:shadow-sm active:scale-[0.96]' : 'cursor-default'}`}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 text-current opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={8} />
        </button>
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
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent/15 transition-colors"
      >
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.1 }}>
          <ChevronDown size={11} className="text-muted-foreground" />
        </motion.div>
        {icon || <FolderOpen size={11} className="text-muted-foreground" />}
        <span className="text-[11px] text-foreground/90 flex-1 text-left">{title}</span>
        <span className="text-[10px] text-muted-foreground bg-accent/30 px-1.5 py-[1px] rounded-md tabular-nums">{count}</span>
      </button>
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
// Context Menu
// ===========================

function SessionContextMenu({ x, y, session, onClose, onAction }: {
  x: number;
  y: number;
  session: AgentSession;
  onClose: () => void;
  onAction: (action: string, payload?: string) => void;
}) {
  const cx = Math.min(x, window.innerWidth - 180);
  const cy = Math.min(y, window.innerHeight - 200);

  return (
    <div>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.08 }}
        className="fixed z-[60] bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 py-1 min-w-[160px]"
        style={{ left: cx, top: cy }}
      >
        {/* Edit tags */}
        <button
          onClick={() => { onAction('editTags'); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-[6px] text-[10.5px] text-foreground/80 hover:bg-accent/20 transition-colors"
        >
          <Tag size={11} className="text-muted-foreground" />
          <span>{"编辑标签"}</span>
        </button>

        <div className="h-px bg-border/20 my-1" />

        {/* Pin/Unpin */}
        <button
          onClick={() => { onAction('togglePin'); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-[6px] text-[10.5px] text-foreground/80 hover:bg-accent/20 transition-colors"
        >
          <Pin size={11} className={`text-muted-foreground ${session.pinned ? '' : '-rotate-45'}`} />
          <span>{session.pinned ? '取消置顶' : '置顶'}</span>
        </button>

        <div className="h-px bg-border/20 my-1" />

        {/* Delete */}
        <button
          onClick={() => { onAction('delete'); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-[6px] text-[10.5px] text-red-500/80 hover:bg-red-500/8 transition-colors"
        >
          <Trash2 size={11} />
          <span>{"删除"}</span>
        </button>
      </motion.div>
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
      <div className="fixed inset-0 z-[60] bg-black/10" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.12 }}
        className="fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border border-border/40 rounded-xl shadow-2xl shadow-black/15 w-[340px] overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/25">
          <div className="flex items-center gap-2">
            <Tag size={12} className="text-muted-foreground" />
            <span className="text-[11.5px] text-foreground">{"编辑标签"}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors">
            <X size={12} />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="text-[10px] text-muted-foreground mb-2 truncate">{"话题："}{session.title}</p>

          {/* Current tags */}
          <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
            {tags.length === 0 && <span className="text-[10px] text-muted-foreground/50">{"暂无标签"}</span>}
            {tags.map(t => (
              <TagBadge key={t} tag={t} size="sm" onRemove={() => removeTag(t)} />
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 mb-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTag(input); }}
              placeholder="输入新标签名..."
              className="flex-1 bg-accent/15 border border-border/30 rounded-md px-2.5 py-[5px] text-[10.5px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-cherry-primary/40"
            />
            <button
              onClick={() => addTag(input)}
              disabled={!input.trim()}
              className="px-2.5 py-[5px] rounded-md bg-cherry-active-bg text-[10.5px] text-cherry-text hover:bg-cherry-active-border transition-colors disabled:opacity-30"
            >
              {"添加"}
            </button>
          </div>

          {/* Suggested tags */}
          {unusedTags.length > 0 && (
            <div>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.06em]">{"可用标签"}</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {unusedTags.map(t => (
                  <TagBadge key={t} tag={t} size="sm" onClick={() => toggleTag(t)} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-border/25">
          <button onClick={onClose} className="px-3 py-[4px] rounded-md text-[10.5px] text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors">
            {"取消"}
          </button>
          <button onClick={save} className="px-3 py-[4px] rounded-md text-[10.5px] bg-foreground text-background hover:opacity-90 transition-opacity">
            {"保存"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ===========================
// Session Card (card view)
// ===========================

function SessionCard({ session, isActive, isHovered, onSelect, onContextMenu, onMouseEnter, onMouseLeave }: {
  session: AgentSession;
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-100 ${
        isActive
          ? 'bg-cherry-active-bg border border-cherry-ring'
          : 'border border-transparent hover:bg-accent/10 hover:border-border/30'
      }`}
    >
      {/* Agent icon — small */}
      <span className="text-[13px] flex-shrink-0">{AGENT_ICONS[session.agentName] || '🤖'}</span>

      {/* Content — compact two-line */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {session.status === 'active' && (
            <span className="w-[5px] h-[5px] rounded-full bg-cherry-primary animate-pulse flex-shrink-0" />
          )}
          {session.pinned && <Pin size={8} className="text-muted-foreground/50 -rotate-45 flex-shrink-0" />}
          <span className="text-[11px] text-foreground truncate">{session.title}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-[2px]">
          <span className="text-[9.5px] text-muted-foreground/60 flex-shrink-0">{session.agentName}</span>
          <span className="text-muted-foreground/20">{"·"}</span>
          <span className="text-[9.5px] text-muted-foreground/50 tabular-nums flex-shrink-0">{session.messageCount}{" 条"}</span>
          <span className="text-muted-foreground/20">{"·"}</span>
          <span className="text-[9.5px] text-muted-foreground/50 flex-shrink-0">{session.timestamp}</span>
          {session.tags && session.tags.length > 0 && (
            <div className="flex items-center gap-0.5 overflow-hidden ml-0.5">
              {session.tags.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} size="xs" />)}
              {session.tags.length > 2 && <span className="text-[8px] text-muted-foreground/40">+{session.tags.length - 2}</span>}
            </div>
          )}
          {session.group && <span className="text-[9px] text-muted-foreground/40 ml-auto flex-shrink-0">{session.group}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="w-[20px] flex-shrink-0 flex justify-center">
        {isHovered && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
            className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/20 transition-colors"
          >
            <MoreHorizontal size={11} />
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ===========================
// Session List Row (list view)
// ===========================

function SessionListRow({ session, isActive, isHovered, onSelect, onContextMenu, onMouseEnter, onMouseLeave }: {
  session: AgentSession;
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg cursor-pointer transition-all duration-75 group ${
        isActive ? 'bg-cherry-active-bg' : 'hover:bg-accent/10'
      }`}
    >
      <span className="text-[12px] flex-shrink-0 w-5 text-center">{AGENT_ICONS[session.agentName] || '🤖'}</span>
      {session.status === 'active' && <span className="w-[5px] h-[5px] rounded-full bg-cherry-primary animate-pulse flex-shrink-0" />}
      {session.pinned && <Pin size={8} className="text-muted-foreground/50 -rotate-45 flex-shrink-0" />}
      <span className={`text-[11px] flex-1 truncate ${isActive ? 'text-foreground' : 'text-foreground/85'}`}>
        {session.title}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {session.tags?.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} size="xs" />)}
      </div>
      <span className="text-[10px] text-muted-foreground truncate flex-shrink-0 w-[90px] text-right">{session.agentName}</span>
      <div className="flex items-center gap-0.5 flex-shrink-0 w-[36px] justify-end">
        <MessageCircle size={8} className="text-muted-foreground/40" />
        <span className="text-[9px] text-muted-foreground tabular-nums">{session.messageCount}</span>
      </div>
      <span className="text-[10px] text-muted-foreground flex-shrink-0 w-[40px] text-right tabular-nums">{session.timestamp}</span>
      <div className="w-[24px] flex-shrink-0 flex justify-center">
        {isHovered ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
            className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/20 transition-colors"
          >
            <MoreHorizontal size={11} />
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}

// ===========================
// Session History Page
// ===========================

export function SessionHistoryPage({ sessions, activeSessionId, onSelectSession, onDeleteSession, onUpdateSession, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [groupMode, setGroupMode] = useState<GroupMode>('none');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [agentQuery, setAgentQuery] = useState('');

  // Context menu
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; session: AgentSession } | null>(null);
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
  const hasFilters = selectedTags.length > 0 || selectedAgent !== null || statusFilter !== 'all';
  const clearFilters = () => { setSelectedTags([]); setSelectedAgent(null); setStatusFilter('all'); setSearchQuery(''); };

  const handleCtxMenu = (e: React.MouseEvent, session: AgentSession) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, session });
  };

  const handleCtxAction = (action: string, payload?: string) => {
    if (!ctxMenu) return;
    const s = ctxMenu.session;
    if (action === 'editTags') setTagEditSession(s);
    else if (action === 'togglePin') onUpdateSession(s.id, { pinned: !s.pinned });
    else if (action === 'delete') onDeleteSession(s.id);
  };

  const sessionProps = (session: AgentSession) => ({
    session,
    isActive: activeSessionId === session.id,
    isHovered: hoveredId === session.id,
    onSelect: () => { onSelectSession(session.id); onClose(); },
    onContextMenu: (e: React.MouseEvent) => handleCtxMenu(e, session),
    onMouseEnter: () => setHoveredId(session.id),
    onMouseLeave: () => setHoveredId(null),
  });

  const renderSession = (session: AgentSession) =>
    viewMode === 'card'
      ? <SessionCard key={session.id} {...sessionProps(session)} />
      : <SessionListRow key={session.id} {...sessionProps(session)} />;

  const listGap = viewMode === 'card' ? 'gap-1.5' : 'gap-0';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-[48px] border-b border-border/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent/40 flex items-center justify-center">
            <History size={14} className="text-foreground/70" />
          </div>
          <div>
            <h2 className="text-[13px] text-foreground">
              {selectedAgent ? `${selectedAgent} · 话题历史` : '话题历史记录'}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {selectedAgent
                ? `${filteredSessions.length} 个话题 · 筛选自 ${sessions.length} 个`
                : `${sessions.length} 个话题 · ${activeCount} 个运行中`}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Filter Sidebar */}
        <div className="w-[200px] border-r border-border/30 flex flex-col flex-shrink-0 overflow-y-auto py-3 px-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Status */}
          <div className="mb-4">
            <div className="text-[9.5px] text-muted-foreground uppercase tracking-[0.08em] px-1 mb-2">{"状态"}</div>
            <div className="flex flex-col gap-[2px]">
              {([
                { key: 'all' as const, label: '全部', count: sessions.length },
                { key: 'active' as const, label: '运行中', count: activeCount },
                { key: 'completed' as const, label: '已完成', count: sessions.length - activeCount },
              ]).map(item => (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`flex items-center gap-2 px-2.5 py-[5px] rounded-md text-[10.5px] transition-all duration-75 ${
                    statusFilter === item.key ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  {item.key === 'active' && <span className="w-[5px] h-[5px] rounded-full bg-cherry-primary flex-shrink-0" />}
                  {item.key === 'completed' && <Check size={9} className="text-muted-foreground flex-shrink-0" />}
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className="text-[9px] text-muted-foreground tabular-nums">{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Agent list — direct click with search (like assistant page) */}
          <div className="mb-4">
            <div className="text-[9.5px] text-muted-foreground uppercase tracking-[0.08em] px-1 mb-2">{"智能体"}</div>
            {/* Agent search */}
            <div className="flex items-center gap-2 px-2.5 py-[5px] rounded-md bg-accent/15 border border-border/25 mb-2">
              <Search size={10} className="text-muted-foreground/50 flex-shrink-0" />
              <input
                value={agentQuery}
                onChange={(e) => setAgentQuery(e.target.value)}
                placeholder="搜索智能体..."
                className="flex-1 bg-transparent text-[10.5px] text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              {agentQuery && (
                <button onClick={() => setAgentQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={9} />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-[2px]">
              {!agentQuery && (
                <button
                  onClick={() => setSelectedAgent(null)}
                  className={`flex items-center gap-2 px-2.5 py-[5px] rounded-md text-[10.5px] transition-all duration-75 ${
                    !selectedAgent ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <span className="flex-1 text-left">{"全部"}</span>
                  <span className="text-[9px] text-muted-foreground tabular-nums">{sessions.length}</span>
                </button>
              )}
              {allAgents
                .filter(agent => !agentQuery || agent.toLowerCase().includes(agentQuery.toLowerCase()))
                .map(agent => {
                const count = sessions.filter(s => s.agentName === agent).length;
                return (
                  <button
                    key={agent}
                    onClick={() => setSelectedAgent(selectedAgent === agent ? null : agent)}
                    className={`flex items-center gap-2 px-2.5 py-[5px] rounded-md text-[10.5px] transition-all duration-75 ${
                      selectedAgent === agent ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                    }`}
                  >
                    <span className="text-[10px] flex-shrink-0">{AGENT_ICONS[agent] || '🤖'}</span>
                    <span className="flex-1 text-left truncate">{agent}</span>
                    <span className="text-[9px] text-muted-foreground tabular-nums">{count}</span>
                  </button>
                );
              })}
              {agentQuery && allAgents.filter(agent => agent.toLowerCase().includes(agentQuery.toLowerCase())).length === 0 && (
                <div className="px-2.5 py-3 text-[10px] text-muted-foreground/50 text-center">{"无匹配智能体"}</div>
              )}
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 px-2.5 py-[5px] rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors border border-dashed border-border/30 mt-auto"
            >
              <X size={9} />
              {"清除所有筛选"}
            </button>
          )}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/25 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] text-foreground/70">{filteredSessions.length}{" 条结果"}</span>
              {/* Tag filter */}
              <div className="relative">
                <button
                  onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                  className={`flex items-center gap-1 px-2 py-[3px] rounded-md text-[10px] transition-all duration-100 ${
                    tagDropdownOpen || selectedTags.length > 0
                      ? 'bg-foreground/8 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <Tag size={9} />
                  <span>{selectedTags.length > 0 ? `${selectedTags.length} 个标签` : '标签'}</span>
                  <ChevronDown size={8} className={`transition-transform duration-100 ${tagDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {tagDropdownOpen && (
                    <div>
                      <div className="fixed inset-0 z-[55]" onClick={() => { setTagDropdownOpen(false); setTagManageMode(false); }} />
                      <motion.div
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.1 }}
                        className="absolute left-0 top-full mt-1 z-[56] w-[220px] bg-popover border border-border/40 rounded-lg shadow-xl shadow-black/10 py-1 max-h-[280px] overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/30"
                      >
                        {!tagManageMode ? (
                          <div>
                            {(managedTags.length > 0 ? managedTags : allTags).map(tag => {
                              const isSelected = selectedTags.includes(tag);
                              const count = sessions.filter(s => s.tags?.includes(tag)).length;
                              return (
                                <button
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  className={`flex items-center gap-2 w-full px-2.5 py-[5px] text-[10.5px] transition-colors ${
                                    isSelected ? 'bg-foreground/6 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                                    isSelected ? 'border-cherry-primary bg-cherry-primary' : 'border-border/50'
                                  }`}>
                                    {isSelected && <Check size={8} className="text-background" />}
                                  </div>
                                  <TagBadge tag={tag} size="xs" />
                                  <span className="flex-1" />
                                  <span className="text-[9px] text-muted-foreground/50 tabular-nums">{count}</span>
                                </button>
                              );
                            })}
                            {selectedTags.length > 0 && (
                              <div>
                                <div className="h-px bg-border/20 my-0.5" />
                                <button
                                  onClick={() => setSelectedTags([])}
                                  className="flex items-center gap-2 w-full px-2.5 py-[5px] text-[10.5px] text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors"
                                >
                                  <X size={9} className="flex-shrink-0" />
                                  <span>{"清除选择"}</span>
                                </button>
                              </div>
                            )}
                            <div className="h-px bg-border/20 my-0.5" />
                            <button
                              onClick={() => setTagManageMode(true)}
                              className="flex items-center gap-2 w-full px-2.5 py-[5px] text-[10.5px] text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors"
                            >
                              <Edit3 size={9} className="flex-shrink-0" />
                              <span>{"管理标签"}</span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="px-2.5 py-1.5 border-b border-border/20">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-foreground/70">{"管理标签"}</span>
                                <button
                                  onClick={() => setTagManageMode(false)}
                                  className="text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {"返回"}
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
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
                                  className="flex-1 bg-accent/15 border border-border/30 rounded px-2 py-[4px] text-[10px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-cherry-primary/40"
                                />
                                <button
                                  onClick={() => {
                                    const t = newTagInput.trim();
                                    if (t && !managedTags.includes(t)) setManagedTags(prev => [...prev, t].sort());
                                    setNewTagInput('');
                                  }}
                                  disabled={!newTagInput.trim()}
                                  className="p-1 rounded text-cherry-primary-dark hover:bg-cherry-active-bg transition-colors disabled:opacity-30"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                            </div>
                            {(managedTags.length > 0 ? managedTags : allTags).map(tag => {
                              const count = sessions.filter(s => s.tags?.includes(tag)).length;
                              return (
                                <div
                                  key={tag}
                                  className="flex items-center gap-2 px-2.5 py-[5px] text-[10.5px] text-foreground/75 group/tag hover:bg-accent/10 transition-colors"
                                >
                                  <TagBadge tag={tag} size="xs" />
                                  <span className="flex-1" />
                                  <span className="text-[9px] text-muted-foreground/50 tabular-nums">{count}</span>
                                  <Tooltip content="删除标签" side="right"><button
                                    onClick={() => {
                                      setManagedTags(prev => prev.filter(t => t !== tag));
                                      setSelectedTags(prev => prev.filter(t => t !== tag));
                                    }}
                                    className="p-0.5 rounded text-muted-foreground/30 hover:text-red-500 opacity-0 group-hover/tag:opacity-100 transition-all"
                                  >
                                    <Trash2 size={9} />
                                  </button></Tooltip>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              {/* Selected tag badges inline */}
              {selectedTags.length > 0 && (
                <div className="flex items-center gap-1">
                  {selectedTags.map(tag => <TagBadge key={tag} tag={tag} size="xs" onClick={() => toggleTag(tag)} onRemove={() => toggleTag(tag)} />)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Topic search */}
              <div className="flex items-center gap-1.5 px-2 py-[3px] rounded-md bg-accent/15 border border-border/25 w-[160px]">
                <Search size={10} className="text-muted-foreground/50 flex-shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索话题..."
                  className="flex-1 bg-transparent text-[10px] text-foreground placeholder:text-muted-foreground/40 outline-none min-w-0"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <X size={9} />
                  </button>
                )}
              </div>
              <div className="w-px h-4 bg-border/25" />
              {/* View mode */}
              <div className="flex items-center gap-[1px] bg-accent/15 rounded-md p-[2px]">
                <Tooltip content="列表视图" side="bottom"><button
                  onClick={() => setViewMode('list')}
                  className={`p-[4px] rounded transition-all duration-100 ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List size={12} />
                </button></Tooltip>
                <Tooltip content="卡片视图" side="bottom"><button
                  onClick={() => setViewMode('card')}
                  className={`p-[4px] rounded transition-all duration-100 ${viewMode === 'card' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid size={12} />
                </button></Tooltip>
              </div>
              <div className="w-px h-4 bg-border/25" />
              {/* Group */}
              <div className="flex items-center gap-[2px] bg-accent/15 rounded-md p-[2px]">
                {([
                  { key: 'none' as GroupMode, label: '平铺' },
                  { key: 'agent' as GroupMode, label: '智能体' },
                  { key: 'tag' as GroupMode, label: '标签' },
                ] as const).map(g => (
                  <button
                    key={g.key}
                    onClick={() => setGroupMode(g.key)}
                    className={`px-2 py-[3px] rounded text-[10px] transition-all duration-100 ${
                      groupMode === g.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-border/25" />
              {/* Sort */}
              <button
                onClick={() => {
                  if (sortKey === 'time') setSortKey('name');
                  else if (sortKey === 'name') setSortKey('messages');
                  else setSortKey('time');
                }}
                className="flex items-center gap-1 px-2 py-[3px] rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors"
              >
                <ArrowUpDown size={10} />
                {sortKey === 'time' ? '按时间' : sortKey === 'name' ? '按名称' : '按消息数'}
              </button>
            </div>
          </div>

          {/* List header */}
          {viewMode === 'list' && filteredSessions.length > 0 && (
            <div className="flex items-center gap-2.5 px-3 py-[5px] border-b border-border/15 text-[9px] text-muted-foreground uppercase tracking-[0.06em] flex-shrink-0">
              <span className="w-5 flex-shrink-0 text-center">{"智能体"}</span>
              <span className="flex-1">{"标题"}</span>
              <span className="w-[90px] text-right flex-shrink-0">{"类型"}</span>
              <span className="w-[36px] text-right flex-shrink-0">{"消息"}</span>
              <span className="w-[40px] text-right flex-shrink-0">{"时间"}</span>
              <span className="w-[24px] flex-shrink-0" />
            </div>
          )}

          {/* Session List */}
          <div className="flex-1 overflow-y-auto px-2 py-1.5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
            {groupedSessions ? (
              Object.entries(groupedSessions).map(([groupName, groupSessions]) => (
                <GroupSection
                  key={groupName}
                  title={groupName}
                  count={groupSessions.length}
                  icon={groupMode === 'agent'
                    ? <span className="text-[11px]">{AGENT_ICONS[groupName] || '🤖'}</span>
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
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 rounded-xl bg-accent/25 flex items-center justify-center mb-3">
                  <Search size={18} className="text-muted-foreground/40" />
                </div>
                <p className="text-[11px] text-foreground/70 mb-1">{"没有找到匹配的话题"}</p>
                <p className="text-[10px] text-muted-foreground mb-3">{"尝试修改搜索条件或筛选标签"}</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="px-3 py-1.5 rounded-md text-[10px] text-foreground/70 bg-accent/20 hover:bg-accent/30 transition-colors">
                    {"清除筛选条件"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {ctxMenu && (
          <SessionContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            session={ctxMenu.session}
            onClose={() => setCtxMenu(null)}
            onAction={handleCtxAction}
          />
        )}
      </AnimatePresence>

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
