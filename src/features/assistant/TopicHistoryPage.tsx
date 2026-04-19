import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X, Search, Tag, Pin, Trash2, Check, ChevronDown, History,
  List, LayoutGrid, ArrowUpDown, MoreHorizontal, Edit3, Plus,
  MessageCircle, FolderOpen, PanelRight, Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Input } from '@cherry-studio/ui';
import type { AssistantTopic } from '@/app/types/assistant';

type SortKey = 'time' | 'name' | 'messages';
type GroupMode = 'none' | 'assistant' | 'tag';
type ViewMode = 'card' | 'list';
export type HistoryDisplayMode = 'floating' | 'docked';

interface Props {
  topics: AssistantTopic[];
  activeTopicId: string | null;
  onSelectTopic: (id: string) => void;
  onDeleteTopic: (id: string) => void;
  onUpdateTopic: (id: string, updates: Partial<AssistantTopic>) => void;
  onClose: () => void;
  initialAssistant?: string | null;
  displayMode?: HistoryDisplayMode;
  onDisplayModeChange?: (mode: HistoryDisplayMode) => void;
}

// ===========================
// Tag Badge
// ===========================

const TAG_COLORS: Record<string, string> = {
  'React': 'bg-cyan-500/12 text-cyan-700 border-cyan-500/20',
  'Next.js': 'bg-neutral-500/12 text-neutral-700 border-neutral-500/20',
  '\u524d\u7aef': 'bg-blue-500/12 text-blue-700 border-blue-500/20',
  '\u540e\u7aef': 'bg-violet-500/12 text-violet-700 border-violet-500/20',
  '\u5199\u4f5c': 'bg-amber-500/12 text-amber-700 border-amber-500/20',
  '\u62a5\u544a': 'bg-orange-500/12 text-orange-700 border-orange-500/20',
  'TypeScript': 'bg-sky-500/12 text-sky-700 border-sky-500/20',
  'CSS': 'bg-pink-500/12 text-pink-700 border-pink-500/20',
  '\u4ea7\u54c1': 'bg-foreground/[0.07] text-foreground/80 border-foreground/[0.1]',
  '\u6570\u636e\u5e93': 'bg-indigo-500/12 text-indigo-700 border-indigo-500/20',
  'DevOps': 'bg-teal-500/12 text-teal-700 border-teal-500/20',
  'AI': 'bg-purple-500/12 text-purple-700 border-purple-500/20',
  '\u67b6\u6784': 'bg-red-500/12 text-red-700 border-red-500/20',
  '\u6548\u7387': 'bg-yellow-500/12 text-yellow-700 border-yellow-500/20',
  'MCP': 'bg-rose-500/12 text-rose-700 border-rose-500/20',
  '\u5bf9\u6bd4': 'bg-lime-500/12 text-lime-700 border-lime-500/20',
  '\u672a\u6807\u8bb0': 'bg-gray-500/12 text-gray-700 border-gray-500/20',
};

function TagBadge({ tag, selected, onClick, onRemove, size = 'sm' }: {
  tag: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'xs';
}) {
  const color = TAG_COLORS[tag] || 'bg-gray-500/12 text-gray-700 border-gray-500/20';
  const sizeClass = size === 'sm' ? 'px-2 py-[2px] text-xs' : 'px-1.5 py-[1px] text-[9px]';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 rounded-md border transition-all duration-100 ${sizeClass} ${color} ${
        selected ? 'ring-1 ring-foreground/20 shadow-sm' : ''
      } ${onClick ? 'cursor-pointer hover:shadow-sm active:scale-[0.96]' : 'cursor-default'}`}
    >
      {tag}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 text-current opacity-50 hover:opacity-100 transition-opacity h-auto w-auto p-0"
        >
          <X size={8} />
        </Button>
      )}
    </span>
  );
}

// ===========================
// Assistant Icons
// ===========================

const ASSISTANT_ICONS: Record<string, string> = {
  '\u9ed8\u8ba4\u52a9\u624b': '\u{1F916}',
  '\u5199\u4f5c\u52a9\u624b': '\u270d\ufe0f',
  '\u4ee3\u7801\u4e13\u5bb6': '\u{1F4BB}',
  '\u7ffb\u8bd1\u5b98': '\u{1F310}',
  '\u6570\u636e\u5206\u6790\u5e08': '\u{1F4CA}',
  '\u5b66\u672f\u8bba\u6587\u52a9\u624b': '\u{1F4DD}',
  '\u4ea7\u54c1\u7ecf\u7406': '\u{1F4CB}',
  '\u6cd5\u5f8b\u987e\u95ee': '\u2696\ufe0f',
  'UI \u8bbe\u8ba1\u5e08': '\u{1F3A8}',
  '\u82f1\u8bed\u6559\u5e08': '\u{1F4DA}',
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent/15 transition-colors h-auto"
      >
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.1 }}>
          <ChevronDown size={11} className="text-muted-foreground" />
        </motion.div>
        {icon || <FolderOpen size={11} className="text-muted-foreground" />}
        <span className="text-xs text-foreground/90 flex-1 text-left">{title}</span>
        <span className="text-xs text-muted-foreground bg-accent/30 px-1.5 py-[1px] rounded-md tabular-nums">{count}</span>
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
// Context Menu
// ===========================

function TopicContextMenu({ x, y, topic, onClose, onAction }: {
  x: number;
  y: number;
  topic: AssistantTopic;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  const cx = Math.min(x, window.innerWidth - 180);
  const cy = Math.min(y, window.innerHeight - 260);

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
        <Button
          variant="ghost"
          size="xs"
          onClick={() => { onAction('editTags'); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-[6px] text-xs text-foreground/80 hover:bg-accent/20 transition-colors rounded-none justify-start h-auto"
        >
          <Tag size={11} className="text-muted-foreground" />
          <span>{'\u7f16\u8f91\u6807\u7b7e'}</span>
        </Button>

        <div className="h-px bg-border/20 my-1" />

        {/* Pin/Unpin */}
        <Button
          variant="ghost"
          size="xs"
          onClick={() => { onAction('togglePin'); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-[6px] text-xs text-foreground/80 hover:bg-accent/20 transition-colors rounded-none justify-start h-auto"
        >
          <Pin size={11} className={`text-muted-foreground ${topic.pinned ? '' : '-rotate-45'}`} />
          <span>{topic.pinned ? '\u53d6\u6d88\u7f6e\u9876' : '\u7f6e\u9876'}</span>
        </Button>

        <div className="h-px bg-border/20 my-1" />

        {/* Delete */}
        <Button
          variant="destructive"
          size="xs"
          onClick={() => { onAction('delete'); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-[6px] text-xs text-destructive/80 hover:bg-destructive/8 transition-colors rounded-none justify-start h-auto bg-transparent"
        >
          <Trash2 size={11} />
          <span>{'\u5220\u9664'}</span>
        </Button>
      </motion.div>
    </div>
  );
}

// ===========================
// Tag Editor Popover
// ===========================

function TagEditorPopover({ topic, allTags, onUpdate, onClose }: {
  topic: AssistantTopic;
  allTags: string[];
  onUpdate: (tags: string[]) => void;
  onClose: () => void;
}) {
  const [tags, setTags] = useState<string[]>(topic.tags || []);
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
            <span className="text-[11.5px] text-foreground">{'\u7f16\u8f91\u6807\u7b7e'}</span>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors">
            <X size={12} />
          </Button>
        </div>

        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground mb-2 truncate">{'\u8bdd\u9898\uff1a'}{topic.title}</p>

          {/* Current tags */}
          <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
            {tags.length === 0 && <span className="text-xs text-muted-foreground/50">{'\u6682\u65e0\u6807\u7b7e'}</span>}
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
              placeholder={'\u8f93\u5165\u65b0\u6807\u7b7e\u540d...'}
              className="flex-1 bg-accent/15 border border-border/30 rounded-md px-2.5 py-[5px] text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-cherry-primary/40 h-auto"
            />
            <Button
              variant="default"
              size="xs"
              onClick={() => addTag(input)}
              disabled={!input.trim()}
              className="px-2.5 py-[5px] rounded-md bg-cherry-active-bg text-xs text-cherry-text hover:bg-cherry-active-border transition-colors disabled:opacity-30 h-auto"
            >
              {'\u6dfb\u52a0'}
            </Button>
          </div>

          {/* Suggested tags */}
          {unusedTags.length > 0 && (
            <div>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.06em]">{'\u53ef\u7528\u6807\u7b7e'}</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {unusedTags.map(t => (
                  <TagBadge key={t} tag={t} size="sm" onClick={() => toggleTag(t)} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-border/25">
          <Button variant="outline" size="xs" onClick={onClose} className="px-3 py-[4px] rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors h-auto">
            {'\u53d6\u6d88'}
          </Button>
          <Button variant="default" size="xs" onClick={save} className="px-3 py-[4px] rounded-md text-xs bg-foreground text-background hover:opacity-90 transition-opacity h-auto">
            {'\u4fdd\u5b58'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ===========================
// Topic Card (card view)
// ===========================

function TopicCard({ topic, isActive, isHovered, onSelect, onContextMenu, onMouseEnter, onMouseLeave }: {
  topic: AssistantTopic;
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
      <span className="text-sm flex-shrink-0">{ASSISTANT_ICONS[topic.assistantName] || '\u{1F916}'}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {topic.status === 'active' && (
            <span className="w-[5px] h-[5px] rounded-full bg-cherry-primary animate-pulse flex-shrink-0" />
          )}
          {topic.pinned && <Pin size={8} className="text-muted-foreground/50 -rotate-45 flex-shrink-0" />}
          <span className="text-xs text-foreground truncate">{topic.title}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-[2px]">
          <span className="text-[9.5px] text-muted-foreground/60 flex-shrink-0">{topic.assistantName}</span>
          <span className="text-muted-foreground/20">{'\u00b7'}</span>
          <span className="text-[9.5px] text-muted-foreground/50 tabular-nums flex-shrink-0">{topic.messageCount} {'\u6761'}</span>
          <span className="text-muted-foreground/20">{'\u00b7'}</span>
          <span className="text-[9.5px] text-muted-foreground/50 flex-shrink-0">{topic.timestamp}</span>
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex items-center gap-0.5 overflow-hidden ml-0.5">
              {topic.tags.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} size="xs" />)}
              {topic.tags.length > 2 && <span className="text-[8px] text-muted-foreground/40">+{topic.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="w-[20px] flex-shrink-0 flex justify-center">
        {isHovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
              className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/20 transition-colors h-auto w-auto"
            >
              <MoreHorizontal size={11} />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ===========================
// Topic List Row (list view)
// ===========================

function TopicListRow({ topic, isActive, isHovered, onSelect, onContextMenu, onMouseEnter, onMouseLeave }: {
  topic: AssistantTopic;
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
      <span className="text-sm flex-shrink-0 w-5 text-center">{ASSISTANT_ICONS[topic.assistantName] || '\u{1F916}'}</span>
      {topic.status === 'active' && <span className="w-[5px] h-[5px] rounded-full bg-cherry-primary animate-pulse flex-shrink-0" />}
      {topic.pinned && <Pin size={8} className="text-muted-foreground/50 -rotate-45 flex-shrink-0" />}
      <span className={`text-xs flex-1 truncate ${isActive ? 'text-foreground' : 'text-foreground/85'}`}>
        {topic.title}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {topic.tags?.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} size="xs" />)}
      </div>
      <span className="text-xs text-muted-foreground truncate flex-shrink-0 w-[70px] text-right">{topic.assistantName}</span>
      <div className="flex items-center gap-0.5 flex-shrink-0 w-[36px] justify-end">
        <MessageCircle size={8} className="text-muted-foreground/40" />
        <span className="text-[9px] text-muted-foreground tabular-nums">{topic.messageCount}</span>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0 w-[40px] text-right tabular-nums">{topic.timestamp}</span>
      <div className="w-[24px] flex-shrink-0 flex justify-center">
        {isHovered ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => { e.stopPropagation(); onContextMenu(e); }}
              className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/20 transition-colors h-auto w-auto"
            >
              <MoreHorizontal size={11} />
            </Button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

// ===========================
// Topic History Page
// ===========================

export function TopicHistoryPage({ topics, activeTopicId, onSelectTopic, onDeleteTopic, onUpdateTopic, onClose, initialAssistant, displayMode = 'floating', onDisplayModeChange }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(initialAssistant ?? null);
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [groupMode, setGroupMode] = useState<GroupMode>('none');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [assistantQuery, setAssistantQuery] = useState('');

  // Context menu
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; topic: AssistantTopic } | null>(null);
  // Tag editing
  const [tagEditTopic, setTagEditTopic] = useState<AssistantTopic | null>(null);

  // Tag dropdown in toolbar
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagManageMode, setTagManageMode] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const newTagRef = useRef<HTMLInputElement>(null);
  const [managedTags, setManagedTags] = useState<string[]>(() => {
    const tags = new Set<string>();
    topics.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  });

  useEffect(() => {
    if (tagManageMode) setTimeout(() => newTagRef.current?.focus(), 50);
  }, [tagManageMode]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    topics.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [topics]);

  const allAssistants = useMemo(() => Array.from(new Set(topics.map(t => t.assistantName))), [topics]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filteredTopics = useMemo(() => {
    let list = [...topics];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.assistantName.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length > 0) list = list.filter(t => selectedTags.some(tag => t.tags?.includes(tag)));
    if (selectedAssistant) list = list.filter(t => t.assistantName === selectedAssistant);
    list.sort((a, b) => {
      if (sortKey === 'name') return a.title.localeCompare(b.title);
      if (sortKey === 'messages') return b.messageCount - a.messageCount;
      return 0;
    });
    return list;
  }, [topics, searchQuery, selectedTags, selectedAssistant, sortKey]);

  const groupedTopics = useMemo(() => {
    if (groupMode === 'none') return null;
    const groups: Record<string, AssistantTopic[]> = {};
    if (groupMode === 'assistant') {
      filteredTopics.forEach(t => {
        const key = t.assistantName;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      });
    } else if (groupMode === 'tag') {
      filteredTopics.forEach(t => {
        if (t.tags && t.tags.length > 0) {
          t.tags.forEach(tag => {
            if (!groups[tag]) groups[tag] = [];
            groups[tag].push(t);
          });
        } else {
          if (!groups['\u672a\u6807\u8bb0']) groups['\u672a\u6807\u8bb0'] = [];
          groups['\u672a\u6807\u8bb0'].push(t);
        }
      });
    }
    return groups;
  }, [filteredTopics, groupMode]);

  const hasFilters = selectedTags.length > 0 || selectedAssistant !== null;
  const clearFilters = () => { setSelectedTags([]); setSelectedAssistant(null); setSearchQuery(''); };

  const handleCtxMenu = (e: React.MouseEvent, topic: AssistantTopic) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, topic });
  };

  const handleCtxAction = (action: string) => {
    if (!ctxMenu) return;
    const t = ctxMenu.topic;
    if (action === 'editTags') setTagEditTopic(t);
    else if (action === 'togglePin') onUpdateTopic(t.id, { pinned: !t.pinned });
    else if (action === 'delete') onDeleteTopic(t.id);
  };

  const topicProps = (topic: AssistantTopic) => ({
    topic,
    isActive: activeTopicId === topic.id,
    isHovered: hoveredId === topic.id,
    onSelect: () => { onSelectTopic(topic.id); onClose(); },
    onContextMenu: (e: React.MouseEvent) => handleCtxMenu(e, topic),
    onMouseEnter: () => setHoveredId(topic.id),
    onMouseLeave: () => setHoveredId(null),
  });

  const renderTopic = (topic: AssistantTopic) =>
    viewMode === 'card'
      ? <TopicCard key={topic.id} {...topicProps(topic)} />
      : <TopicListRow key={topic.id} {...topicProps(topic)} />;

  const listGap = viewMode === 'card' ? 'gap-1.5' : 'gap-0';
  // ===== Fullscreen view =====
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
            <h2 className="text-sm text-foreground">
              {selectedAssistant ? `${selectedAssistant} \u00b7 \u8bdd\u9898\u5386\u53f2` : '\u8bdd\u9898\u5386\u53f2\u8bb0\u5f55'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedAssistant
                ? `${filteredTopics.length} \u4e2a\u8bdd\u9898 \u00b7 \u7b5b\u9009\u81ea ${topics.length} \u4e2a`
                : `${topics.length} \u4e2a\u8bdd\u9898`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors">
            <X size={15} />
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Filter Sidebar */}
        <div className="w-[200px] border-r border-border/30 flex flex-col flex-shrink-0 overflow-y-auto py-3 px-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Assistant section */}
          <div className="mb-2">
            <div className="text-[9.5px] text-muted-foreground uppercase tracking-[0.08em] px-1 mb-2">{'\u52a9\u624b'}</div>
            {/* Assistant search */}
            <div className="flex items-center gap-2 px-2.5 py-[5px] rounded-md bg-accent/15 border border-border/25 mb-2">
              <Search size={10} className="text-muted-foreground/50 flex-shrink-0" />
              <Input
                value={assistantQuery}
                onChange={(e) => setAssistantQuery(e.target.value)}
                placeholder={'\u641c\u7d22\u52a9\u624b...'}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 border-none shadow-none h-auto p-0"
              />
              {assistantQuery && (
                <Button variant="ghost" size="icon-xs" onClick={() => setAssistantQuery('')} className="text-muted-foreground hover:text-foreground transition-colors h-auto w-auto p-0">
                  <X size={9} />
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-[2px]">
              {!assistantQuery && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSelectedAssistant(null)}
                  className={`flex items-center gap-2 px-2.5 py-[5px] rounded-md text-xs transition-all duration-75 w-full justify-start h-auto ${
                    !selectedAssistant ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <span className="flex-1 text-left">{'\u5168\u90e8'}</span>
                  <span className="text-[9px] text-muted-foreground tabular-nums">{topics.length}</span>
                </Button>
              )}
              {allAssistants
                .filter(ast => !assistantQuery || ast.toLowerCase().includes(assistantQuery.toLowerCase()))
                .map(ast => {
                const count = topics.filter(t => t.assistantName === ast).length;
                return (
                  <Button
                    variant="ghost"
                    size="xs"
                    key={ast}
                    onClick={() => setSelectedAssistant(selectedAssistant === ast ? null : ast)}
                    className={`flex items-center gap-2 px-2.5 py-[5px] rounded-md text-xs transition-all duration-75 w-full justify-start h-auto ${
                      selectedAssistant === ast ? 'bg-foreground/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                    }`}
                  >
                    <span className="text-xs flex-shrink-0">{ASSISTANT_ICONS[ast] || '\u{1F916}'}</span>
                    <span className="flex-1 text-left truncate">{ast}</span>
                    <span className="text-[9px] text-muted-foreground tabular-nums">{count}</span>
                  </Button>
                );
              })}
              {assistantQuery && allAssistants.filter(ast => ast.toLowerCase().includes(assistantQuery.toLowerCase())).length === 0 && (
                <div className="px-2.5 py-3 text-xs text-muted-foreground/50 text-center">{'\u65e0\u5339\u914d\u52a9\u624b'}</div>
              )}
            </div>
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              size="xs"
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 px-2.5 py-[5px] rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors border border-dashed border-border/30 mt-auto h-auto w-full"
            >
              <X size={9} />
              {'\u6e05\u9664\u6240\u6709\u7b5b\u9009'}
            </Button>
          )}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/25 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/70">{filteredTopics.length} {'\u6761\u7ed3\u679c'}</span>
              {/* Tag filter */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                  className={`flex items-center gap-1 px-2 py-[3px] rounded-md text-xs transition-all duration-100 h-auto ${
                    tagDropdownOpen || selectedTags.length > 0
                      ? 'bg-foreground/8 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                  }`}
                >
                  <Tag size={9} />
                  <span>{selectedTags.length > 0 ? `${selectedTags.length} \u4e2a\u6807\u7b7e` : '\u6807\u7b7e'}</span>
                  <ChevronDown size={8} className={`transition-transform duration-100 ${tagDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
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
                              const count = topics.filter(t => t.tags?.includes(tag)).length;
                              return (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  className={`flex items-center gap-2 w-full px-2.5 py-[5px] text-xs transition-colors rounded-none justify-start h-auto ${
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
                                </Button>
                              );
                            })}
                            {selectedTags.length > 0 && (
                              <div>
                                <div className="h-px bg-border/20 my-0.5" />
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => setSelectedTags([])}
                                  className="flex items-center gap-2 w-full px-2.5 py-[5px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors rounded-none justify-start h-auto"
                                >
                                  <X size={9} className="flex-shrink-0" />
                                  <span>{'\u6e05\u9664\u9009\u62e9'}</span>
                                </Button>
                              </div>
                            )}
                            <div className="h-px bg-border/20 my-0.5" />
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setTagManageMode(true)}
                              className="flex items-center gap-2 w-full px-2.5 py-[5px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors rounded-none justify-start h-auto"
                            >
                              <Edit3 size={9} className="flex-shrink-0" />
                              <span>{'\u7ba1\u7406\u6807\u7b7e'}</span>
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="px-2.5 py-1.5 border-b border-border/20">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-foreground/70">{'\u7ba1\u7406\u6807\u7b7e'}</span>
                                <Button variant="ghost" size="xs"
                                  onClick={() => setTagManageMode(false)}
                                  className="text-[9px] text-muted-foreground hover:text-foreground transition-colors h-auto p-0"
                                >
                                  {'\u8fd4\u56de'}
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
                                  placeholder={'\u65b0\u5efa\u6807\u7b7e...'}
                                  className="flex-1 bg-accent/15 border border-border/30 rounded px-2 py-[4px] text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-cherry-primary/40 h-auto"
                                />
                                <Button variant="ghost" size="icon-xs"
                                  onClick={() => {
                                    const t = newTagInput.trim();
                                    if (t && !managedTags.includes(t)) setManagedTags(prev => [...prev, t].sort());
                                    setNewTagInput('');
                                  }}
                                  disabled={!newTagInput.trim()}
                                  className="p-1 rounded text-cherry-primary-dark hover:bg-cherry-active-bg transition-colors disabled:opacity-30"
                                >
                                  <Plus size={10} />
                                </Button>
                              </div>
                            </div>
                            {(managedTags.length > 0 ? managedTags : allTags).map(tag => {
                              const count = topics.filter(t => t.tags?.includes(tag)).length;
                              return (
                                <div
                                  key={tag}
                                  className="flex items-center gap-2 px-2.5 py-[5px] text-[10.5px] text-foreground/75 group/tag hover:bg-accent/10 transition-colors"
                                >
                                  <TagBadge tag={tag} size="xs" />
                                  <span className="flex-1" />
                                  <span className="text-[9px] text-muted-foreground/50 tabular-nums">{count}</span>
                                  <Tooltip content={'\u5220\u9664\u6807\u7b7e'} side="right"><Button variant="ghost" size="icon-xs"
                                    onClick={() => {
                                      setManagedTags(prev => prev.filter(t => t !== tag));
                                      setSelectedTags(prev => prev.filter(t => t !== tag));
                                    }}
                                    className="p-0.5 rounded text-muted-foreground/30 hover:text-destructive opacity-0 group-hover/tag:opacity-100 transition-all h-auto w-auto"
                                  >
                                    <Trash2 size={9} />
                                  </Button></Tooltip>
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
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={'\u641c\u7d22\u8bdd\u9898...'}
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 min-w-0 border-none shadow-none h-auto p-0"
                />
                {searchQuery && (
                  <Button variant="ghost" size="icon-xs" onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 h-auto w-auto p-0">
                    <X size={9} />
                  </Button>
                )}
              </div>
              <div className="w-px h-4 bg-border/25" />
              {/* View mode */}
              <div className="flex items-center gap-[1px] bg-accent/15 rounded-md p-[2px]">
                <Tooltip content={'\u5217\u8868\u89c6\u56fe'} side="bottom"><Button variant="ghost" size="icon-xs"
                  onClick={() => setViewMode('list')}
                  className={`p-[4px] rounded transition-all duration-100 h-auto w-auto ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List size={12} />
                </Button></Tooltip>
                <Tooltip content={'\u5361\u7247\u89c6\u56fe'} side="bottom"><Button variant="ghost" size="icon-xs"
                  onClick={() => setViewMode('card')}
                  className={`p-[4px] rounded transition-all duration-100 h-auto w-auto ${viewMode === 'card' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid size={12} />
                </Button></Tooltip>
              </div>
              <div className="w-px h-4 bg-border/25" />
              {/* Group */}
              <div className="flex items-center gap-[2px] bg-accent/15 rounded-md p-[2px]">
                {([
                  { key: 'none' as GroupMode, label: '\u5e73\u94fa' },
                  { key: 'assistant' as GroupMode, label: '\u6309\u52a9\u624b' },
                  { key: 'tag' as GroupMode, label: '\u6309\u6807\u7b7e' },
                ] as const).map(g => (
                  <Button variant="ghost" size="xs"
                    key={g.key}
                    onClick={() => setGroupMode(g.key)}
                    className={`px-2 py-[3px] rounded text-xs transition-all duration-100 h-auto ${
                      groupMode === g.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
              <div className="w-px h-4 bg-border/25" />
              {/* Sort */}
              <Button variant="ghost" size="xs"
                onClick={() => {
                  if (sortKey === 'time') setSortKey('name');
                  else if (sortKey === 'name') setSortKey('messages');
                  else setSortKey('time');
                }}
                className="flex items-center gap-1 px-2 py-[3px] rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors h-auto"
              >
                <ArrowUpDown size={10} />
                {sortKey === 'time' ? '\u6309\u65f6\u95f4' : sortKey === 'name' ? '\u6309\u540d\u79f0' : '\u6309\u6d88\u606f\u6570'}
              </Button>
            </div>
          </div>

          {/* List header */}
          {viewMode === 'list' && filteredTopics.length > 0 && (
            <div className="flex items-center gap-2.5 px-3 py-[5px] border-b border-border/15 text-[9px] text-muted-foreground uppercase tracking-[0.06em] flex-shrink-0">
              <span className="w-5 flex-shrink-0 text-center">{'\u52a9\u624b'}</span>
              <span className="flex-1">{'\u6807\u9898'}</span>
              <span className="w-[70px] text-right flex-shrink-0">{'\u7c7b\u578b'}</span>
              <span className="w-[36px] text-right flex-shrink-0">{'\u6d88\u606f'}</span>
              <span className="w-[40px] text-right flex-shrink-0">{'\u65f6\u95f4'}</span>
              <span className="w-[24px] flex-shrink-0" />
            </div>
          )}

          {/* Topic List */}
          <div className="flex-1 overflow-y-auto px-2 py-1.5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
            {groupedTopics ? (
              Object.entries(groupedTopics).map(([groupName, groupTopics]) => (
                <GroupSection
                  key={groupName}
                  title={groupName}
                  count={groupTopics.length}
                  icon={groupMode === 'tag'
                    ? <TagBadge tag={groupName} size="xs" />
                    : groupMode === 'assistant'
                      ? <span className="text-xs">{ASSISTANT_ICONS[groupName] || '\u{1F916}'}</span>
                      : undefined
                  }
                >
                  <div className={`flex flex-col ${listGap} pl-2`}>
                    {groupTopics.map(renderTopic)}
                  </div>
                </GroupSection>
              ))
            ) : (
              <div className={`flex flex-col ${listGap}`}>
                {filteredTopics.map(renderTopic)}
              </div>
            )}

            {filteredTopics.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 rounded-xl bg-accent/25 flex items-center justify-center mb-3">
                  <Search size={18} className="text-muted-foreground/40" />
                </div>
                <p className="text-xs text-foreground/70 mb-1">{'\u6ca1\u6709\u627e\u5230\u5339\u914d\u7684\u8bdd\u9898'}</p>
                <p className="text-xs text-muted-foreground mb-3">{'\u5c1d\u8bd5\u4fee\u6539\u641c\u7d22\u6761\u4ef6\u6216\u7b5b\u9009\u6807\u7b7e'}</p>
                {hasFilters && (
                  <Button variant="ghost" size="xs" onClick={clearFilters} className="px-3 py-1.5 rounded-md text-xs text-foreground/70 bg-accent/20 hover:bg-accent/30 transition-colors h-auto">
                    {'\u6e05\u9664\u7b5b\u9009\u6761\u4ef6'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {ctxMenu && (
          <TopicContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            topic={ctxMenu.topic}
            onClose={() => setCtxMenu(null)}
            onAction={handleCtxAction}
          />
        )}
      </AnimatePresence>

      {/* Tag Editor */}
      <AnimatePresence>
        {tagEditTopic && (
          <TagEditorPopover
            topic={tagEditTopic}
            allTags={allTags}
            onUpdate={(tags) => onUpdateTopic(tagEditTopic.id, { tags })}
            onClose={() => setTagEditTopic(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
