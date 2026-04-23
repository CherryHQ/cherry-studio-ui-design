import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  ArrowLeft, ChevronDown, ChevronRight, FolderOpen, Download,
  Bot, Columns2,
  Sparkles, Plus, ArrowUp,
  FileText, Zap, Search as SearchIcon, BookOpen, History,
  MessageCirclePlus,
  Code2, Folder, Tag,
  X,
  Check,
  Edit3, Clock,
  Workflow, Cable, Layers,
  Compass, Wrench, PenTool, Bolt, Filter, Pin, ArrowDown,
  Paperclip, Globe, Brain,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Switch, Textarea, EmptyState, Popover, PopoverTrigger, PopoverContent, SearchInput, Typography, BrandLogo, Separator, ScrollArea, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { usePinnedAgents } from '@/app/hooks/usePinnedAgents';
import { FileExplorer } from './FileExplorer';
import { ArtifactViewer } from './ArtifactViewer';
import { ChatPanel } from './ChatPanel';
import type { AgentChatMessage, AgentSession, AgentSessionData } from '@/app/types/agent';
import { SessionHistoryPage, type SessionDisplayMode } from './SessionHistoryPage';
import { HistorySidebar } from '@/app/components/shared/HistorySidebar';
import { useHistorySidebar } from '@/app/hooks/useHistorySidebar';
import {
  MOCK_SESSIONS, MODELS, SESSION_DATA_MAP, EMPTY_SESSION_DATA,
  DEFAULT_INITIAL_FILES,
} from '@/app/mock';

// Backward-compatible aliases
type ChatMessage = AgentChatMessage;
type SessionData = AgentSessionData;
import {
  AGENT_PROVIDER_COLORS,
  RUN_MODE_LABELS, CAP_TAB_CONFIG,
  BUILTIN_TOOLS_CATALOG, MCP_CATALOG, SKILLS_CATALOG,
  BUILTIN_TOOL_CATEGORIES, AGENT_TAGS,
  AVAILABLE_AGENTS,
  type AgentCapTab as CapTab,
  type AgentBuiltinTool as BuiltinTool,
  type AgentMcpService as McpService,
  type AgentSkillItem as AgentSkill,
} from '@/app/config/agentTools';

// ===========================
// Agent Picker Dropdown
// ===========================

function AgentPicker({
  selectedAgent,
  onSelectAgent,
  onCreateNew,
  onAvatarClick,
  onConfigureAgent,
  pinnedIds = [],
  onTogglePin,
}: {
  selectedAgent: typeof AVAILABLE_AGENTS[0];
  onSelectAgent: (agent: typeof AVAILABLE_AGENTS[0]) => void;
  onCreateNew: () => void;
  onAvatarClick?: () => void;
  onConfigureAgent?: (agent: typeof AVAILABLE_AGENTS[0]) => void;
  pinnedIds?: string[];
  onTogglePin?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);

  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [contextMenu]);

  const { pinned, unpinned } = useMemo(() => {
    let filtered = AVAILABLE_AGENTS.filter(a => {
      const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || a.tags.includes(activeTag);
      return matchSearch && matchTag;
    });
    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const ta = a.createdAt || '';
        const tb = b.createdAt || '';
        return sortOrder === 'recent' ? tb.localeCompare(ta) : ta.localeCompare(tb);
      });
    }
    return {
      pinned: filtered.filter(a => pinnedSet.has(a.id)),
      unpinned: filtered.filter(a => !pinnedSet.has(a.id)),
    };
  }, [search, activeTag, sortOrder, pinnedSet]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) { setSearch(''); setActiveTag(null); }
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    if (!onTogglePin) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
  }, [onTogglePin]);

  const renderAgentRow = (a: typeof AVAILABLE_AGENTS[0]) => {
    const isSelected = selectedAgent.id === a.id;
    const isPinned = pinnedSet.has(a.id);
    return (
      <button
        key={a.id}
        onClick={() => { onSelectAgent(a); setOpen(false); }}
        onContextMenu={(e) => handleContextMenu(e, a.id)}
        className={`group w-full flex items-center gap-2.5 px-3 py-[5px] mb-0.5 text-left transition-all duration-[var(--duration-fast)] rounded-lg cursor-pointer ${
          isSelected ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/20'
        }`}
      >
        <span className="text-base leading-none flex-shrink-0">{a.avatar}</span>
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className={`text-sm truncate w-full ${isSelected ? 'font-medium' : ''}`}>{a.name}</span>
          <span className="text-xs text-muted-foreground/40 truncate w-full">{a.desc}</span>
        </div>
        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          {isSelected ? (
            <Check size={14} className="text-foreground/50" />
          ) : isPinned ? (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin?.(a.id); }}
              className="text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
            >
              <Pin size={13} className="rotate-45" />
            </button>
          ) : onConfigureAgent ? (
            <button
              onClick={(e) => { e.stopPropagation(); onConfigureAgent(a); setOpen(false); }}
              className="text-muted-foreground/15 opacity-0 group-hover:opacity-100 hover:text-muted-foreground/40 transition-all"
            >
              <Bolt size={13} />
            </button>
          ) : null}
        </span>
      </button>
    );
  };

  return (
    <div className="relative flex items-center">
      <Tooltip content="智能体信息" side="bottom">
        <Button variant="ghost" size="icon-xs"
          onClick={(e) => { e.stopPropagation(); onAvatarClick?.(); }}
          className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-border/20 text-sm flex-shrink-0 hover:from-accent/50 hover:to-accent/25 hover:border-border/40 active:scale-[0.97] mr-1 p-0"
        >
          {selectedAgent.avatar}
        </Button>
      </Tooltip>

      <Popover open={open} onOpenChange={(v) => { if (v) handleOpen(); else setOpen(false); }}>
        <PopoverTrigger asChild>
          <Button size="inline" variant="ghost"
            className={`gap-1 px-1.5 py-[3px] text-xs ${open ? 'bg-accent/25 text-foreground' : 'text-foreground hover:text-foreground hover:bg-accent/15'}`}
          >
            <span className="truncate max-w-[160px]">{selectedAgent.name}</span>
            <ChevronDown size={8} className={`text-muted-foreground/50 flex-shrink-0 transition-transform duration-100 ${open ? 'rotate-180' : ''}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-[380px]">
          {/* Search + Filter toggle */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-2.5 py-[7px] rounded-xl bg-muted/40">
              <SearchIcon size={14} className="text-muted-foreground/40 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索智能体..." autoFocus
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/30 min-w-0" />
              {search && (
                <button onClick={() => setSearch('')} className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
                  <X size={12} />
                </button>
              )}
              <button
                onClick={() => setShowFilter(v => !v)}
                className={`w-5 h-5 flex items-center justify-center rounded transition-colors flex-shrink-0 ${
                  showFilter ? 'text-foreground/60 bg-accent/40' : 'text-muted-foreground/30 hover:text-muted-foreground/50'
                }`}
              >
                <Filter size={12} />
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div className="px-3 pb-2 space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {AGENT_TAGS.map(tag => (
                  <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`px-2 py-[3px] rounded-full text-xs border transition-colors cursor-pointer ${
                      activeTag === tag
                        ? 'bg-foreground/8 text-foreground/80 border-border/60'
                        : 'bg-transparent text-muted-foreground/50 border-border/40 hover:bg-accent/20 hover:text-muted-foreground/70'
                    }`}>{tag}</button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground/35">排序</span>
                <button onClick={() => setSortOrder(sortOrder === 'recent' ? null : 'recent')}
                  className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-xs border transition-colors cursor-pointer ${
                    sortOrder === 'recent' ? 'bg-foreground/8 text-foreground/80 border-border/60' : 'bg-transparent text-muted-foreground/50 border-border/40 hover:bg-accent/20'
                  }`}><ArrowDown size={10} /><span>最近</span></button>
                <button onClick={() => setSortOrder(sortOrder === 'oldest' ? null : 'oldest')}
                  className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-xs border transition-colors cursor-pointer ${
                    sortOrder === 'oldest' ? 'bg-foreground/8 text-foreground/80 border-border/60' : 'bg-transparent text-muted-foreground/50 border-border/40 hover:bg-accent/20'
                  }`}><ArrowUp size={10} /><span>最早</span></button>
              </div>
            </div>
          )}

          {!showFilter && (
            <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
              <Tag size={10} className="text-muted-foreground/30 flex-shrink-0" />
              {AGENT_TAGS.map(tag => (
                <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-2 py-[3px] rounded-full text-xs border transition-colors cursor-pointer ${
                    activeTag === tag
                      ? 'bg-foreground/8 text-foreground/80 border-border/60'
                      : 'bg-transparent text-muted-foreground/50 border-border/40 hover:bg-accent/20 hover:text-muted-foreground/70'
                  }`}>{tag}</button>
              ))}
            </div>
          )}

          <Separator className="bg-border/20" />

          <ScrollArea className="h-[300px]">
            <div className="py-1 px-1.5">
              {pinned.length === 0 && unpinned.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground/40">无匹配结果</div>
              ) : (
                <>
                  {pinned.length > 0 && (
                    <>
                      <div className="text-xs text-muted-foreground/35 px-3 pt-2 pb-1">已固定</div>
                      {pinned.map(renderAgentRow)}
                    </>
                  )}
                  {unpinned.map(renderAgentRow)}
                </>
              )}
            </div>
          </ScrollArea>

          <Separator className="bg-border/20" />
          <div className="px-1.5 py-1">
            <button onClick={() => { setOpen(false); onCreateNew(); }}
              className="w-full flex items-center gap-2.5 px-3 py-[5px] text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent/20 rounded-lg transition-colors cursor-pointer">
              <Plus size={14} className="flex-shrink-0" />
              <span className="flex-1">新建 Agent</span>
              <ChevronRight size={12} className="text-muted-foreground/40" />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Context menu for Pin */}
      {contextMenu && (
        <div
          className="fixed z-[9999] bg-popover border border-border rounded-lg shadow-popover py-1 px-1 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button onClick={() => { onTogglePin?.(contextMenu.id); setContextMenu(null); }}
            className="flex items-center gap-2 px-2.5 py-[5px] text-sm text-foreground/80 hover:bg-accent/30 rounded-md transition-colors cursor-pointer w-full text-left">
            <Pin size={12} className={pinnedSet.has(contextMenu.id) ? 'rotate-45' : ''} />
            <span>{pinnedSet.has(contextMenu.id) ? '取消固定' : '固定'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ===========================
// New Session Empty State
// ===========================

function NewSessionEmpty({ onSendMessage, agentName }: { onSendMessage: (text: string) => void; agentName?: string }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Centered empty state */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex flex-col items-center max-w-[360px] w-full">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-accent/60 to-accent/30 border border-border/30 flex items-center justify-center mb-5">
            <Sparkles size={22} strokeWidth={1.3} className="text-muted-foreground/60" />
          </div>
          <h2 className="text-sm text-foreground tracking-[-0.01em]">你好，有什么需要帮助的？</h2>
          <p className="text-xs text-muted-foreground/60 text-center leading-[1.6] mt-1.5">
            向 {agentName || '智能体'} 提问，支持生成文章、代码和可视化内容
          </p>
        </motion.div>
      </div>

      {/* Input bar at bottom */}
      <div className="flex-shrink-0 px-4 pb-3 pt-2">
        <div className="relative rounded-xl border border-border/50 bg-background shadow-sm focus-within:border-border/80 transition-all duration-150">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="在这里输入消息，按 Enter 发送"
            rows={1}
            autoFocus
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none resize-none min-h-[36px] max-h-[140px] leading-[1.6] px-3.5 pt-[10px] pb-[36px]"
          />
          <div className="absolute bottom-[7px] left-2.5 right-2.5 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="p-[5px] w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50">
                    <Plus size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-44">
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Paperclip size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">添加图片或附件</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Code2 size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">代码</span></DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Folder size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">添加文件夹</span></DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Globe size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">网络搜索</span></DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Brain size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">推理</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="default"
              size="icon-sm"
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-lg p-1.5 w-auto h-auto disabled:opacity-30"
            >
              <ArrowUp size={13} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Compact Session Selector (single line)
// ===========================

function CompactSessionSelector({
  activeSession,
}: {
  sessions: AgentSession[];
  activeSession: AgentSession | undefined;
  onSelectSession: (id: string) => void;
  onOpenHistory: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-[4px] text-xs text-foreground max-w-[200px]">
      <Bot size={11} className="text-muted-foreground flex-shrink-0" />
      <span className="truncate">
        {activeSession ? activeSession.title : '新会话'}
      </span>
      {activeSession && (
        <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
          activeSession.status === 'active' ? 'bg-warning animate-pulse' :
          activeSession.status === 'completed' ? 'bg-success' :
          activeSession.status === 'error' ? 'bg-destructive' :
          'bg-muted-foreground/40'
        }`} />
      )}
    </div>
  );
}

// ===========================
// Capability Toggle Switch (mini)
// ===========================


// ===========================
// Add Capability Panel (slide-over inside info panel)
// ===========================

function AddCapabilityPanel({ tab, existingIds, onAdd, onClose, onBrowse }: {
  tab: CapTab;
  existingIds: Set<string>;
  onAdd: (id: string) => void;
  onClose: () => void;
  onBrowse: () => void;
}) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const catalog = useMemo(() => {
    if (tab === 'tools') return BUILTIN_TOOLS_CATALOG.filter(t => !existingIds.has(t.id));
    if (tab === 'mcp') return MCP_CATALOG.filter(m => !existingIds.has(m.id));
    return SKILLS_CATALOG.filter(s => !existingIds.has(s.id));
  }, [tab, existingIds]);

  const filtered = useMemo(() => {
    return catalog.filter((item: any) => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase());
      const matchCat = !activeCat || (item.category && item.category === activeCat);
      return matchSearch && matchCat;
    });
  }, [catalog, search, activeCat]);

  const grouped = useMemo(() => {
    if (tab !== 'tools') return null;
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const cat = (item as any).category || '\u5176\u4ed6';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [tab, filtered]);

  const tabLabel = tab === 'tools' ? '\u5185\u7f6e\u5de5\u5177' : tab === 'mcp' ? 'MCP Server' : 'Skill';

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 z-10 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-[38px] flex-shrink-0 border-b border-border/15">
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-accent/15">
          <ArrowLeft size={12} />
        </Button>
        <span className="text-xs text-foreground">{"\u6dfb\u52a0"}{tabLabel}</span>
        <span className="text-xs text-muted-foreground/40 ml-auto">{catalog.length} {"\u9879\u53ef\u7528"}</span>
      </div>

      {/* Search */}
      <div className="px-3 pt-2.5 pb-1.5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={`\u641c\u7d22${tabLabel}...`}
          iconSize={10}
          autoFocus
          wrapperClassName="px-2.5"
        />
      </div>

      {/* Category pills for tools */}
      {tab === 'tools' && (
        <div className="px-3 pb-1.5 flex items-center gap-1 flex-wrap">
          {BUILTIN_TOOL_CATEGORIES.map(cat => (
            <Button size="inline"
              key={cat}
              variant="ghost"
              onClick={() => setActiveCat(activeCat === cat ? null : cat)}
              className={`px-1.5 py-px rounded-full text-xs border ${
                activeCat === cat
                  ? 'bg-accent/50 text-foreground border-border/40'
                  : 'bg-accent/15 text-muted-foreground/50 border-transparent hover:bg-accent/50'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {/* Item list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState preset="no-result" compact className="py-8" />
        ) : tab === 'tools' && grouped ? (
          Array.from(grouped.entries()).map(([cat, items]) => (
            <div key={cat} className="mb-3">
              <div className="text-xs text-muted-foreground/40 mb-1.5 px-0.5">{cat}</div>
              <div className="space-y-0.5">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg hover:bg-accent/15 transition-colors group">
                    <Wrench size={10} className="text-muted-foreground/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground/40 truncate">{item.desc}</div>
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={() => onAdd(item.id)}
                      className="p-[3px] w-auto h-auto text-muted-foreground/40 hover:text-cherry-primary hover:bg-cherry-active-bg opacity-0 group-hover:opacity-100">
                      <Plus size={11} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-0.5">
            {filtered.map((item: any) => (
              <div key={item.id} className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg hover:bg-accent/15 transition-colors group">
                {tab === 'mcp' ? (
                  <Cable size={10} className="text-info/40 flex-shrink-0" />
                ) : (
                  <Zap size={10} className="text-warning/40 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground/40 truncate">
                    {tab === 'mcp' ? item.author : item.desc}
                  </div>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => onAdd(item.id)}
                  className="p-[3px] w-auto h-auto text-muted-foreground/40 hover:text-cherry-primary hover:bg-cherry-active-bg opacity-0 group-hover:opacity-100">
                  <Plus size={11} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-3 pb-3 pt-1.5 border-t border-border/15 space-y-1.5">
        <Button size="inline"
          variant="ghost"
          onClick={onBrowse}
          className="w-full justify-start gap-2 px-2.5 py-[7px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15"
        >
          <Compass size={11} className="text-muted-foreground/50" />
          <span>{"\u53bb\u63a2\u7d22\u6d4f\u89c8"}</span>
          <ChevronRight size={9} className="ml-auto text-muted-foreground/40" />
        </Button>
        <Button size="inline"
          variant="ghost"
          className="w-full justify-start gap-2 px-2.5 py-[7px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15"
        >
          <PenTool size={10} className="text-muted-foreground/50" />
          <span>{"\u624b\u52a8\u6dfb\u52a0"}</span>
          <ChevronRight size={9} className="ml-auto text-muted-foreground/40" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Agent Info Panel (floating right panel)
// ===========================

function AgentInfoPanel({ agent, onClose, onEdit }: {
  agent: typeof AVAILABLE_AGENTS[0];
  onClose: () => void;
  onEdit: () => void;
}) {
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [capTab, setCapTab] = useState<CapTab>('tools');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const modeInfo = RUN_MODE_LABELS[agent.runMode] || RUN_MODE_LABELS.auto;
  const builtinTools = agent.builtinTools || [];
  const mcpServices = agent.mcpServices || [];
  const skills = agent.skills || [];
  const tags = agent.tags || [];

  const toolsByCategory = useMemo(() => {
    const map = new Map<string, BuiltinTool[]>();
    for (const t of builtinTools) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    return map;
  }, [builtinTools]);

  const enabledToolCount = builtinTools.filter(t => t.enabled).length;
  const connectedMcpCount = mcpServices.filter(m => m.status === 'connected').length;
  const enabledSkillCount = skills.filter(s => s.enabled).length;

  const existingIds = useMemo(() => {
    if (capTab === 'tools') return new Set(builtinTools.map(t => t.id));
    if (capTab === 'mcp') return new Set(mcpServices.map(m => m.id));
    return new Set(skills.map(s => s.id));
  }, [capTab, builtinTools, mcpServices, skills]);

  const handleAddItem = useCallback((_id: string) => {
    // Mock: just close add panel (real app would add to agent)
    setShowAddPanel(false);
  }, []);

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="absolute top-2 right-2 bottom-2 z-[var(--z-sticky)] bg-background rounded-xl border border-border/25 shadow-2xl shadow-black/12 flex flex-col overflow-hidden"
      style={{ width: 340 }}
    >
      {/* Add panel overlay */}
      <AnimatePresence>
        {showAddPanel && (
          <AddCapabilityPanel
            tab={capTab}
            existingIds={existingIds}
            onAdd={handleAddItem}
            onClose={() => setShowAddPanel(false)}
            onBrowse={onEdit}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[38px] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={12} className="text-muted-foreground" />
          <span className="text-xs text-foreground">{"\u667a\u80fd\u4f53\u4fe1\u606f"}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip content={"\u5728\u8d44\u6e90\u5e93\u4e2d\u7f16\u8f91"} side="bottom">
            <Button variant="ghost" size="icon-xs" onClick={onEdit} className="text-muted-foreground hover:text-foreground hover:bg-accent/15">
              <Edit3 size={11} />
            </Button>
          </Tooltip>
          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-accent/15">
            <X size={12} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 space-y-3.5">
          {/* Avatar + Name + Desc */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border border-border/20 flex items-center justify-center text-xl flex-shrink-0">
              {agent.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <Typography variant="subtitle" className="mb-0.5">{agent.name}</Typography>
              <p className="text-xs text-muted-foreground/60 leading-[1.5]">{agent.desc}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/40 mt-1.5">
                <Clock size={9} />
                <span>{"\u6700\u8fd1\u4f7f\u7528"} {agent.updatedAt}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map(t => (
                <span key={t} className="px-1.5 py-[2px] rounded text-xs bg-accent/25 text-foreground">{t}</span>
              ))}
            </div>
          )}

          {/* Info rows */}
          <div className="space-y-[6px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/60">{"\u9ed8\u8ba4\u6a21\u578b"}</span>
              <div className="flex items-center gap-1.5 px-2 py-[3px] rounded-md bg-accent/25">
                <BrandLogo id={agent.provider?.toLowerCase() || ''} fallbackLetter={agent.provider?.[0] || '?'} size={14} className="shrink-0" />
                <span className="text-foreground">{agent.model}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/60">{"\u8fd0\u884c\u6a21\u5f0f"}</span>
              <div className="flex items-center gap-1.5">
                <Workflow size={9} className={modeInfo.color} />
                <span className={modeInfo.color}>{modeInfo.label}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/60">{"\u6700\u5927\u8f6e\u6b21"}</span>
              <span className="text-foreground tabular-nums">{agent.maxRounds}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/60">{"\u5de5\u4f5c\u76ee\u5f55"}</span>
              <span className="text-muted-foreground font-mono text-xs">{agent.workDir}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground/60">{"\u81ea\u52a8\u6279\u51c6"}</span>
              <span className={agent.autoApprove ? 'text-cherry-primary' : 'text-muted-foreground/50'}>
                {agent.autoApprove ? '\u5df2\u5f00\u542f' : '\u5df2\u5173\u95ed'}
              </span>
            </div>
          </div>

          {/* System prompt — collapsible */}
          <div className="rounded-lg bg-muted/15 overflow-hidden">
            <Button variant="ghost" size="inline" onClick={() => setPromptExpanded(!promptExpanded)}
              className="w-full justify-start gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent/15">
              <FileText size={10} className="text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-left">{"\u7cfb\u7edf\u63d0\u793a\u8bcd"}</span>
              <motion.div animate={{ rotate: promptExpanded ? 90 : 0 }} transition={{ duration: 0.1 }}>
                <ChevronRight size={10} className="text-muted-foreground/50" />
              </motion.div>
            </Button>
            <AnimatePresence initial={false}>
              {promptExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                  <div className="px-3 pb-3">
                    <pre className="text-xs text-muted-foreground leading-[1.7] whitespace-pre-wrap mt-1 font-sans">{agent.systemPrompt}</pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===== Capability Extensions — 3 Tabs ===== */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Layers size={10} className="text-muted-foreground" />
                <span className="text-xs text-foreground">{"\u80fd\u529b\u6269\u5c55"}</span>
              </div>
              <Tooltip content={`\u6dfb\u52a0${capTab === 'tools' ? '\u5185\u7f6e\u5de5\u5177' : capTab === 'mcp' ? 'MCP Server' : 'Skill'}`} side="left">
                <Button variant="ghost" size="icon-xs" onClick={() => setShowAddPanel(true)}
                  className="p-[3px] w-auto h-auto text-muted-foreground/40 hover:text-foreground hover:bg-accent/50">
                  <Plus size={11} />
                </Button>
              </Tooltip>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-0 mb-2.5 border-b border-border/15">
              {CAP_TAB_CONFIG.map(t => {
                const count = t.key === 'tools' ? `${enabledToolCount}/${builtinTools.length}`
                  : t.key === 'mcp' ? `${connectedMcpCount}/${mcpServices.length}`
                  : `${enabledSkillCount}/${skills.length}`;
                const active = capTab === t.key;
                return (
                  <Button size="inline"
                    key={t.key}
                    variant="ghost"
                    onClick={() => setCapTab(t.key)}
                    className={`relative px-2.5 pb-[7px] pt-[3px] rounded-none text-xs ${
                      active ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground/60'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={`ml-1 text-xs ${active ? 'text-muted-foreground/60' : 'text-muted-foreground/50'}`}>{count}</span>
                    {active && (
                      <motion.div
                        layoutId="cap-tab-indicator"
                        className="absolute bottom-0 left-1 right-1 h-[1.5px] bg-cherry-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="min-h-[60px]">
              {/* === Built-in Tools Tab === */}
              {capTab === 'tools' && (
                builtinTools.length === 0 ? (
                  <EmptyState
                    icon={Wrench}
                    title="未添加内置工具"
                    actionLabel="+ 添加工具"
                    onAction={() => setShowAddPanel(true)}
                    compact
                    className="py-5"
                  />
                ) : (
                  <div className="space-y-3">
                    {Array.from(toolsByCategory.entries()).map(([cat, items]) => {
                      const catEnabled = items.filter(t => t.enabled).length;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1 px-0.5">
                            <span className="text-xs text-muted-foreground/40">{cat}</span>
                            <span className="text-xs text-muted-foreground/50">{catEnabled}/{items.length}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                            {items.map(tool => (
                              <div key={tool.id} className="flex items-center gap-2 px-2 py-[6px] rounded-md hover:bg-accent/15 transition-colors group">
                                <Wrench size={10} className={`flex-shrink-0 ${tool.enabled ? 'text-muted-foreground/60' : 'text-muted-foreground/50'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm truncate ${tool.enabled ? 'text-foreground' : 'text-muted-foreground/50'}`}>{tool.name}</div>
                                  <div className="text-xs text-muted-foreground/50 truncate">{tool.desc}</div>
                                </div>
                                <Switch size="sm" checked={tool.enabled} onCheckedChange={() => {}} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* === MCP Tab === */}
              {capTab === 'mcp' && (
                mcpServices.length === 0 ? (
                  <EmptyState
                    icon={Cable}
                    title="未添加 MCP Server"
                    actionLabel="+ 添加 MCP"
                    onAction={() => setShowAddPanel(true)}
                    compact
                    className="py-5"
                  />
                ) : (
                  <div className="space-y-0.5">
                    {mcpServices.map(svc => (
                      <div key={svc.id} className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg hover:bg-accent/15 transition-colors group">
                        <div className="w-6 h-6 rounded-md bg-accent/25 flex items-center justify-center flex-shrink-0">
                          <Cable size={11} className="text-info/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{svc.name}</div>
                          <div className="text-xs text-muted-foreground/50 truncate">{svc.desc}</div>
                        </div>
                        <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                          svc.status === 'connected' ? 'bg-cherry-primary' : 'bg-muted-foreground/30'
                        }`} />
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* === Skills Tab === */}
              {capTab === 'skills' && (
                skills.length === 0 ? (
                  <EmptyState
                    icon={Zap}
                    title="未添加 Skill"
                    actionLabel="+ 添加 Skill"
                    onAction={() => setShowAddPanel(true)}
                    compact
                    className="py-5"
                  />
                ) : (
                  <div className="space-y-0.5">
                    {skills.map(skill => (
                      <div key={skill.id} className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg hover:bg-accent/15 transition-colors">
                        <Zap size={10} className={`flex-shrink-0 ${skill.enabled ? 'text-warning/60' : 'text-muted-foreground/50'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${skill.enabled ? 'text-foreground' : 'text-muted-foreground/40'}`}>{skill.name}</div>
                          <div className="text-xs text-muted-foreground/50 truncate">{skill.desc}</div>
                        </div>
                        <Switch size="sm" checked={skill.enabled} onCheckedChange={() => {}} />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground/40 pt-2 border-t border-border/15">
            <span>{"\u521b\u5efa\u4e8e"} {agent.createdAt}</span>
            <span>ID: {agent.id}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===========================
// Agent Run Page
// ===========================

export function AgentRunPage({ onBack }: { onBack?: () => void } = {}) {
  const { navigateToLibrary: _navLib, editAssistantInLibrary, changeTabTitle: onTabTitleChange, openSettings: onOpenSettings } = useGlobalActions();
  const onNavigateToLibrary = () => _navLib('agent');
  const { pinnedIds: pinnedAgentIds, togglePin: togglePinAgent } = usePinnedAgents();
  const [sessions, setSessions] = useState<AgentSession[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>('src/App.tsx');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showExplorer, setShowExplorer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const historySidebar = useHistorySidebar('compact');
  const [historyDisplayMode, setHistoryDisplayMode] = useState<SessionDisplayMode>('floating');
  const [selectedAgent, setSelectedAgent] = useState(AVAILABLE_AGENTS[0]);
  const [previewMaximized, setPreviewMaximized] = useState(false);
  const [showAgentInfo, setShowAgentInfo] = useState(false);

  const sessionData: SessionData = useMemo(() => {
    if (!activeSessionId) return EMPTY_SESSION_DATA;
    return SESSION_DATA_MAP[activeSessionId] || EMPTY_SESSION_DATA;
  }, [activeSessionId]);

  const messages = localMessages[activeSessionId || ''] ?? sessionData.messages;
  const hasMessages = messages.length > 0;
  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Sync session name to tab title
  useEffect(() => {
    if (onTabTitleChange) {
      onTabTitleChange(activeSession ? activeSession.title : '\u5de5\u4f5c');
    }
  }, [activeSession, onTabTitleChange]);

  const fileContent = selectedFile ? (sessionData.fileContents[selectedFile] || null) : null;

  const handleSelectFile = useCallback((path: string) => {
    setSelectedFile(path);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setSessions(prev => prev.map(s => s.id === id && s.unread ? { ...s, unread: false } : s));
    const data = SESSION_DATA_MAP[id];
    if (data) {
      const firstKey = Object.keys(data.fileContents)[0] || null;
      setSelectedFile(firstKey);
    } else {
      setSelectedFile(null);
    }
  }, []);

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setShowPreview(false);
    setShowExplorer(false);
    setSelectedFile(null);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setShowPreview(false);
      setShowExplorer(false);
    }
  }, [activeSessionId]);

  const handleUpdateSession = useCallback((id: string, updates: Partial<AgentSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Auto-create session if none active
    let key = activeSessionId || '';
    if (!activeSessionId) {
      const newId = `new-${Date.now()}`;
      const newSession: AgentSession = {
        id: newId,
        title: text.slice(0, 40),
        agentName: '\u5168\u6808\u5de5\u7a0b\u5e08',
        lastMessage: text,
        timestamp: ts,
        messageCount: 1,
        status: 'active',
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newId);
      key = newId;
    }

    const addMsg = (msg: ChatMessage) => {
      setLocalMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] ?? sessionData.messages), msg],
      }));
    };

    if (!localMessages[key] && !SESSION_DATA_MAP[key]) {
      setLocalMessages(prev => ({ ...prev, [key]: [] }));
    }

    const userMsg: ChatMessage = { id: `m${Date.now()}`, role: 'user', content: text, timestamp: ts };
    setLocalMessages(prev => ({
      ...prev,
      [key]: [...(prev[key] ?? []), userMsg],
    }));

    if (key.startsWith('new-')) {
      setSessions(prev => prev.map(s =>
        s.id === key
          ? { ...s, title: text.slice(0, 40), lastMessage: text, messageCount: (s.messageCount || 0) + 1 }
          : s
      ));
    }

    setTimeout(() => {
      addMsg({ id: `m${Date.now() + 1}`, role: 'agent', thinking: '\u6b63\u5728\u5206\u6790\u9700\u6c42\u5e76\u89c4\u5212\u5b9e\u73b0\u65b9\u6848...', timestamp: ts });
    }, 600);
    setTimeout(() => {
      addMsg({ id: `m${Date.now() + 2}`, role: 'agent', toolCall: { name: '\u5206\u6790\u9879\u76ee\u7ed3\u6784', status: 'running' }, timestamp: ts });
    }, 1200);
    setTimeout(() => {
      addMsg({ id: `m${Date.now() + 3}`, role: 'agent', content: '\u6536\u5230\uff0c\u6b63\u5728\u4e3a\u4f60\u5904\u7406\u4e2d...', timestamp: ts });
    }, 2200);
  }, [activeSessionId, sessionData.messages, localMessages]);

  const handleResolveUI = useCallback((msgId: string, value: string) => {
    const key = activeSessionId || '';
    setLocalMessages(prev => {
      const msgs = prev[key] ?? sessionData.messages;
      return {
        ...prev,
        [key]: msgs.map(m => {
          if (m.id === msgId && m.generativeUI) {
            return { ...m, generativeUI: { ...m.generativeUI, resolved: true, resolvedValue: value } };
          }
          return m;
        }),
      };
    });
  }, [activeSessionId, sessionData.messages]);

  if (MODELS.length === 0) {
    return (
      <div className="flex flex-col h-full bg-background select-none relative">
        <EmptyState
          preset="no-model"
          description={"\u8bf7\u5148\u524d\u5f80\u8bbe\u7f6e\u9875\u9762\u6dfb\u52a0\u6a21\u578b\u670d\u52a1\u5546\u5e76\u542f\u7528\u6a21\u578b\uff0c\u624d\u80fd\u5f00\u59cb\u5de5\u4f5c"}
          actionLabel={"\u524d\u5f80\u8bbe\u7f6e"}
          onAction={onOpenSettings}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background select-none relative">
      {/* ===== Left: History Sidebar (compact) ===== */}
      <AnimatePresence initial={false}>
        {historySidebar.isCompact && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 min-w-0 overflow-hidden h-full"
            style={{ width: 220 }}
          >
            <HistorySidebar
              items={sessions}
              activeItemId={activeSessionId}
              onSelectItem={handleSelectSession}
              onDeleteItem={handleDeleteSession}
              onUpdateItem={handleUpdateSession}
              onNewItem={handleNewSession}
              onExpand={() => historySidebar.expand()}
              onClose={historySidebar.hide}
              entityLabel="会话"
              showStatusDot
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Right: Header + Content ===== */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
        {/* ===== Header ===== */}
        <header className="flex items-center justify-between px-3 border-b border-transparent flex-shrink-0 h-[40px]">
          <div className="flex items-center gap-1.5">
            {onBack && (
              <Button variant="ghost" size="icon-xs" onClick={onBack}
                className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <ArrowLeft size={13} />
              </Button>
            )}

            {/* History sidebar toggle */}
            <Tooltip content={historySidebar.isCompact ? '收起会话列表' : '展开会话列表'} side="bottom">
              <Button variant="ghost" size="icon-xs" onClick={() => historySidebar.toggle()}
                className={`p-1.5 w-auto h-auto mr-0.5 ${historySidebar.isCompact ? 'text-muted-foreground hover:text-foreground hover:bg-accent/15' : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/15'}`}>
                <History size={13} />
              </Button>
            </Tooltip>

            {/* Agent picker — always visible */}
            <AgentPicker
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
              onCreateNew={() => onNavigateToLibrary?.()}
              onAvatarClick={() => setShowAgentInfo(true)}
              onConfigureAgent={(agent) => editAssistantInLibrary(agent.name)}
              pinnedIds={pinnedAgentIds}
              onTogglePin={togglePinAgent}
            />

            {/* Model picker — always visible */}
            <div className="w-px h-3.5 bg-border/30" />
            <Popover open={showModelPicker} onOpenChange={setShowModelPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="inline"
                  className={`gap-1 px-1.5 py-[3px] text-xs ${
                  showModelPicker
                    ? 'bg-accent/25 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
                }`}>
                <BrandLogo id={selectedModel.provider.toLowerCase()} fallbackLetter={selectedModel.provider[0]} size={14} className="shrink-0" />
                <span>{selectedModel.name}</span>
                <ChevronDown size={7} className={`text-muted-foreground/50 transition-transform duration-100 ${showModelPicker ? 'rotate-180' : ''}`} />
              </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0 w-[480px]">
                <ModelPickerPanel
                  models={MODELS}
                  selectedModels={[selectedModel.id]}
                  onSelectModel={(id) => { const m = MODELS.find(m => m.id === id); if (m) setSelectedModel(m); }}
                  multiModel={false}
                  onToggleMultiModel={() => {}}
                  showMultiModelToggle={false}
                  providerColors={AGENT_PROVIDER_COLORS}
                  onClose={() => setShowModelPicker(false)}
                />
              </PopoverContent>
            </Popover>

          {/* WorkDir — always visible */}
          <div className="w-px h-3.5 bg-border/30" />
          <Button variant="ghost" size="xs" className="gap-1.5 px-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/15 font-mono">
            <FolderOpen size={9} />
            {sessionData.workDir || '~/projects'}
          </Button>

          {/* Session-specific controls — only when working */}
          {hasMessages && (
            <div className="flex items-center gap-1.5">
              {sessionData.workDir && (
                <div className="flex items-center gap-1.5">
                  <div className="w-px h-3.5 bg-border/30" />
                  <div className={`flex items-center gap-1 text-xs ${
                    activeSession?.status === 'active' ? 'text-warning' :
                    activeSession?.status === 'error' ? 'text-destructive' :
                    'text-cherry-primary-dark'
                  }`}>
                    <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
                      activeSession?.status === 'active' ? 'bg-warning animate-pulse' :
                      activeSession?.status === 'error' ? 'bg-destructive' :
                      'bg-success'
                    }`} />
                    {activeSession?.status === 'active' ? '运行中' : activeSession?.status === 'error' ? '失败' : '已完成'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {hasMessages && (
            <Tooltip content={"\u65b0\u5efa\u4f1a\u8bdd"} side="bottom"><Button variant="ghost" size="icon-xs" onClick={handleNewSession}
              className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
              <MessageCirclePlus size={13} />
            </Button></Tooltip>
          )}


          {/* Show preview panel — when preview is hidden */}
          {!showPreview && (
            <div className="flex items-center gap-0.5">
              <div className="w-px h-3.5 bg-border/30 mx-0.5" />
              <Tooltip content={"\u663e\u793a\u9884\u89c8\u9762\u677f"} side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => { setShowPreview(true); }}
                className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
                <Columns2 size={12} />
              </Button></Tooltip>
            </div>
          )}

          {hasMessages && (
            <div className="flex items-center gap-0.5">
              <div className="w-px h-3.5 bg-border/30 mx-0.5" />
              <Tooltip content={"\u5bfc\u51fa"} side="bottom"><Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground hover:bg-accent/15">
                <Download size={11} />
              </Button></Tooltip>
            </div>
          )}
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <div className="flex flex-1 min-h-0 pl-2">

        {!previewMaximized && (
          !hasMessages ? (
            <div
              className={`min-h-0 h-full ${showPreview ? 'flex-shrink-0' : 'flex-1'}`}
              style={showPreview ? { width: 330 } : undefined}
            >
              <NewSessionEmpty onSendMessage={handleSendMessage} agentName={selectedAgent.name} />
            </div>
          ) : (
            <div
              className={`min-h-0 h-full ${showPreview ? 'flex-shrink-0' : 'flex-1'}`}
              style={showPreview ? { width: 330 } : undefined}
            >
              <ChatPanel
                messages={messages}
                steps={sessionData.steps}
                onSendMessage={handleSendMessage}
                onResolveUI={handleResolveUI}
                onAvatarClick={() => setShowAgentInfo(true)}
              />
            </div>
          )
        )}

        <AnimatePresence initial={false}>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, marginLeft: -8 }}
              animate={{ opacity: 1, marginLeft: 0 }}
              exit={{ opacity: 0, marginLeft: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-1 min-w-0 my-1.5 mr-1 rounded-2xl border border-border/40 bg-card/50 shadow-sm shadow-black/5 overflow-hidden"
            >
              <AnimatePresence initial={false}>
                {showExplorer && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                    className="border-r border-border/30 flex-shrink-0 overflow-hidden"
                  >
                    <FileExplorer
                      files={sessionData.files.length > 0 ? sessionData.files : DEFAULT_INITIAL_FILES}
                      outputFiles={sessionData.outputFiles}
                      selectedFile={selectedFile}
                      onSelectFile={handleSelectFile}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 min-w-0 overflow-hidden">
                <ArtifactViewer
                  fileContent={fileContent}
                  fileName={selectedFile}
                  previewUrl={null}
                  hasArtifact={!!sessionData.previewHtml || !!fileContent}
                  previewHtml={sessionData.previewHtml}
                  showExplorer={showExplorer}
                  onToggleExplorer={() => setShowExplorer(!showExplorer)}
                  showPreview={showPreview}
                  onTogglePreview={() => setShowPreview(!showPreview)}
                  maximized={previewMaximized}
                  onToggleMaximize={() => setPreviewMaximized(!previewMaximized)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Docked History */}
        <AnimatePresence initial={false}>
          {historySidebar.isExpanded && historyDisplayMode === 'docked' && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 480, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex-shrink-0 min-w-0 border-l border-border/30 overflow-hidden"
            >
              <SessionHistoryPage
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onUpdateSession={handleUpdateSession}
                onClose={() => historySidebar.collapse()}
                displayMode={historyDisplayMode}
                onDisplayModeChange={setHistoryDisplayMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== History Floating Overlay ===== */}
      <AnimatePresence>
        {historySidebar.isExpanded && historyDisplayMode === 'floating' && (
          <SessionHistoryPage
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onUpdateSession={handleUpdateSession}
            onClose={() => historySidebar.collapse()}
            displayMode={historyDisplayMode}
            onDisplayModeChange={setHistoryDisplayMode}
          />
        )}
      </AnimatePresence>

      {/* ===== Agent Info Overlay ===== */}
      <AnimatePresence>
        {showAgentInfo && (
          <AgentInfoPanel
            agent={selectedAgent}
            onClose={() => setShowAgentInfo(false)}
            onEdit={() => onNavigateToLibrary?.()}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
