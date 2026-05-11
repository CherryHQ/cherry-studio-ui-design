import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  ArrowLeft, ChevronDown, ChevronRight, FolderOpen, Download,
  Bot, Columns2,
  Sparkles, Plus, ArrowUp,
  FileText, Zap, Search as SearchIcon, BookOpen, History,
  MessageCirclePlus,
  Code2, Folder, FolderPlus, FolderX, Tag, ListChecks,
  X,
  Check,
  Edit3, Clock,
  Workflow, Cable, Layers,
  Compass, Wrench, PenTool, Bolt, Filter, Pin, ArrowDown,
  Paperclip, Globe, Brain, Pencil, PanelLeftOpen, PanelLeftClose,
  SquarePlus, RefreshCw, TerminalSquare, Lightbulb, Scan, Languages,
  Hand, ShieldAlert, MoreHorizontal, MousePointer2, Mountain, ExternalLink,
  Package, Eye as EyeIcon, FileImage, Table2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Switch, Textarea, EmptyState, Popover, PopoverTrigger, PopoverContent, SearchInput, Typography, BrandLogo, Separator, ScrollArea, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { usePinnedAgents } from '@/app/hooks/usePinnedAgents';
import { FileExplorer } from './FileExplorer';
import { ArtifactViewer } from './ArtifactViewer';
import { ChatPanel } from './ChatPanel';
import { WorkflowPanel } from './WorkflowPanel';
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
    if (!onTogglePin && !onConfigureAgent) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
  }, [onTogglePin, onConfigureAgent]);

  const renderAgentRow = (a: typeof AVAILABLE_AGENTS[0]) => {
    const isSelected = selectedAgent.id === a.id;
    const isPinned = pinnedSet.has(a.id);
    return (
      <button
        key={a.id}
        onClick={() => { onSelectAgent(a); if (!isSelected) setOpen(false); }}
        onContextMenu={(e) => handleContextMenu(e, a.id)}
        className={`group w-full flex items-center gap-2.5 px-3 py-[5px] mb-0.5 text-left transition-all duration-[var(--duration-fast)] rounded-lg cursor-pointer ${
          isSelected ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/20'
        }`}
      >
        <span className="w-4 flex items-center justify-center flex-shrink-0">
          {isSelected ? (
            <Check size={12} className="text-foreground/50" />
          ) : isPinned ? (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin?.(a.id); }}
              className="text-muted-foreground/40 hover:text-destructive/60 transition-colors"
              title="取消固定"
            >
              <Pin size={10} />
            </button>
          ) : null}
        </span>
        <span className="text-base leading-none flex-shrink-0">{a.avatar}</span>
        <div className="flex items-center min-w-0 flex-1">
          <span className={`text-sm truncate ${isSelected ? 'font-medium' : ''}`}>{a.name}</span>
        </div>
        {onConfigureAgent && (
          <button
            onClick={(e) => { e.stopPropagation(); onConfigureAgent(a); setOpen(false); }}
            className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-muted-foreground/15 opacity-0 group-hover:opacity-100 hover:text-muted-foreground/40 transition-all"
          >
            <Bolt size={13} />
          </button>
        )}
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
        <PopoverContent align="start" className="p-0 w-[380px]" onPointerDownOutside={(e) => { if ((e.target as HTMLElement)?.closest('[data-context-menu]')) e.preventDefault(); }}>
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
      {/* Context menu — rendered outside Popover to avoid focus issues */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[9998]" data-context-menu onMouseDown={() => setContextMenu(null)} />
          <div
            className="fixed z-[9999] bg-popover border border-border rounded-lg shadow-popover p-0.5 min-w-0 animate-in fade-in zoom-in-95 duration-100"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            data-context-menu
          >
            <button onMouseDown={(e) => {
              e.stopPropagation();
              const agent = AVAILABLE_AGENTS.find(a => a.id === contextMenu.id);
              if (agent && onConfigureAgent) { onConfigureAgent(agent); setOpen(false); }
              setContextMenu(null);
            }}
              className="flex items-center gap-1.5 px-2 py-[3px] text-xs text-foreground hover:bg-accent/15 rounded-md transition-colors cursor-pointer w-full text-left">
              <Pencil size={10} />
              <span>编辑</span>
            </button>
            <button onMouseDown={(e) => {
              e.stopPropagation();
              onTogglePin?.(contextMenu.id);
              setContextMenu(null);
            }}
              className="flex items-center gap-1.5 px-2 py-[3px] text-xs text-foreground hover:bg-accent/15 rounded-md transition-colors cursor-pointer w-full text-left">
              <Pin size={10} className={pinnedSet.has(contextMenu.id) ? 'rotate-45' : ''} />
              <span>{pinnedSet.has(contextMenu.id) ? '取消固定' : '固定'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ===========================
// Compact Input Bar — used when artifact is fullscreen-maximized
// ===========================

function CompactInputBar({ onSendMessage, agentName }: { onSendMessage: (text: string) => void; agentName?: string }) {
  return (
    <div className="flex-shrink-0 px-3 pb-3 pt-1.5">
      <CodexStyleInput onSendMessage={onSendMessage} placeholder={`继续与 ${agentName || '智能体'} 对话...`} />
    </div>
  );
}

// ===========================
// New Session Empty State
// ===========================

// ===========================
// CodeX-style Input (shared between empty state and maximized)
// ===========================

const NEW_PERMISSION_MODES: { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }[] = [
  { id: 'default', label: '默认权限', icon: Hand },
  { id: 'plan', label: '计划模式', icon: Compass },
  { id: 'auto-edit', label: '自动编辑', icon: Pencil },
  { id: 'bypass', label: '完全访问', icon: RefreshCw },
];

const NEW_PROJECTS: { id: string; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'new', label: 'New project' },
];

// Slash & mention items shared across CodexStyleInput instances
const CSI_SLASH_COMMANDS = [
  { id: 'clear', label: '/clear', desc: '清除会话历史' },
  { id: 'compact', label: '/compact', desc: '压缩会话上下文' },
  { id: 'context', label: '/context', desc: '可视化上下文使用情况' },
  { id: 'cost', label: '/cost', desc: '查看 Token 用量' },
  { id: 'todos', label: '/todos', desc: '列出当前 TODO' },
];
const CSI_MENTIONS: { id: string; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'file-app', label: 'src/App.tsx', desc: '文件', icon: FileText },
  { id: 'file-readme', label: 'README.md', desc: '文件', icon: FileText },
  { id: 'folder-comp', label: 'src/components/', desc: '文件夹', icon: Folder },
  { id: 'mcp-fs', label: 'filesystem', desc: 'MCP', icon: Wrench },
  { id: 'mcp-search', label: 'web-search', desc: 'MCP', icon: Globe },
];

function CodexStyleInput({ onSendMessage, autoFocus = false, placeholder }: {
  onSendMessage: (text: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState('default');
  const [activeProject, setActiveProject] = useState<string | null>('work');
  const [showPermissionMenu, setShowPermissionMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [showMention, setShowMention] = useState(false);
  const [projectQuery, setProjectQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentPermission = NEW_PERMISSION_MODES.find(m => m.id === activeMode) ?? NEW_PERMISSION_MODES[0];
  const currentProject = NEW_PROJECTS.find(p => p.id === activeProject) ?? null;
  const filteredProjects = NEW_PROJECTS.filter(p => !projectQuery || p.label.toLowerCase().includes(projectQuery.toLowerCase()));
  const PermIcon = currentPermission.icon;

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    // Slash commands: input starts with `/`
    if (val === '/') setShowSlash(true);
    else if (showSlash && !val.startsWith('/')) setShowSlash(false);
    // @ mentions: ends with `@` (latest typed char is @)
    if (val.endsWith('@')) setShowMention(true);
    else if (showMention && !val.includes('@')) setShowMention(false);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative rounded-2xl border border-border/40 bg-muted/30 shadow-sm focus-within:border-border/60 transition-all duration-150">
        {/* Slash command popup */}
        {showSlash && (
          <div className="absolute bottom-full left-0 right-0 pb-2 z-10">
            <div className="rounded-xl border border-border/40 bg-card shadow-lg overflow-hidden p-1">
              <div className="px-2 py-1 text-xs text-muted-foreground/60">斜杠命令</div>
              {CSI_SLASH_COMMANDS.map(cmd => (
                <button key={cmd.id} type="button"
                  onClick={() => { setInput(cmd.label + ' '); setShowSlash(false); textareaRef.current?.focus(); }}
                  className="w-full flex items-center justify-between gap-3 px-2 py-[5px] rounded-md text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2">
                    <TerminalSquare size={12} strokeWidth={1.5} className="text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-xs text-foreground">{cmd.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/50 truncate max-w-[55%]">{cmd.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* @ mention popup */}
        {showMention && (
          <div className="absolute bottom-full left-0 right-0 pb-2 z-10">
            <div className="rounded-xl border border-border/40 bg-card shadow-lg overflow-hidden p-1">
              <div className="px-2 py-1 text-xs text-muted-foreground/60">提及</div>
              {CSI_MENTIONS.map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button"
                    onClick={() => {
                      const idx = input.lastIndexOf('@');
                      const before = idx >= 0 ? input.slice(0, idx) : input;
                      setInput(`${before}@${item.label} `);
                      setShowMention(false);
                      textareaRef.current?.focus();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-2 py-[5px] rounded-md text-left transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={12} className="text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-xs text-foreground">{item.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/50">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || '可向智能体询问任何事。输入 / 使用斜杠命令，输入 @ 提及文件'}
          rows={1}
          autoFocus={autoFocus}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none min-h-[36px] max-h-[140px] leading-[1.6] px-3.5 pt-[10px] pb-2 border-transparent focus-visible:border-transparent focus-visible:ring-0 shadow-none"
        />
        <div className="px-2 pb-2 flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-0.5 min-w-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="p-[5px] w-auto h-auto text-muted-foreground/70 hover:text-foreground hover:bg-accent/50">
                  <Plus size={16} strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-44">
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Paperclip size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">添加图片或附件</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Code2 size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">代码</span></DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Folder size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">添加文件夹</span></DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Globe size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">网络搜索</span></DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Brain size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">推理</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><TerminalSquare size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">斜杠命令</span></DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Zap size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">快捷短语</span></DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Lightbulb size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">思维链长度</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Permission selector */}
            <Popover open={showPermissionMenu} onOpenChange={setShowPermissionMenu}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="inline"
                  className={`flex items-center gap-1 px-1.5 py-[4px] rounded-md text-xs transition-colors ${
                    showPermissionMenu
                      ? 'bg-accent/60 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <PermIcon size={13} className="text-muted-foreground/70" strokeWidth={1.5} />
                  <span className="truncate">{currentPermission.label}</span>
                  <ChevronDown size={9} className={`transition-transform duration-100 ${showPermissionMenu ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-[180px] p-1">
                {NEW_PERMISSION_MODES.map(mode => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;
                  return (
                    <button key={mode.id} type="button"
                      onClick={() => { setActiveMode(mode.id); setShowPermissionMenu(false); }}
                      className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs transition-colors ${
                        isActive ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/25'
                      }`}
                    >
                      <Icon size={12} className="text-muted-foreground/70 flex-shrink-0" strokeWidth={1.5} />
                      <span className="flex-1">{mode.label}</span>
                      {isActive && <Check size={11} className="text-foreground flex-shrink-0" />}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <Popover open={showModelMenu} onOpenChange={setShowModelMenu}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="inline"
                  className={`flex items-center gap-1.5 px-2 py-[3px] rounded-md text-xs transition-colors ${
                    showModelMenu
                      ? 'bg-accent/60 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                  }`}
                >
                  <BrandLogo id="cherry" size={12} className="shrink-0" fallbackLetter="C" />
                  <Lightbulb size={11} className="text-warning" strokeWidth={1.5} />
                  <span className="text-foreground/80">5.5</span>
                  <span className="text-muted-foreground/60">中</span>
                  <ChevronDown size={9} className={`transition-transform duration-100 ${showModelMenu ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-[200px] p-1">
                <div className="px-2 py-1 text-xs text-muted-foreground/60">思维链长度</div>
                {[
                  { id: 'low', label: '简略' },
                  { id: 'default', label: '中等' },
                  { id: 'high', label: '深度' },
                ].map(t => (
                  <button key={t.id} type="button"
                    onClick={() => setShowModelMenu(false)}
                    className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-foreground/80 hover:bg-accent/25 transition-colors"
                  >
                    <span className="flex-1">{t.label}</span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <Tooltip content="翻译" side="top">
              <Button variant="ghost" size="icon-sm" className="p-[5px] w-auto h-auto text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors">
                <Languages size={16} strokeWidth={1.5} />
              </Button>
            </Tooltip>

            <Button
              variant="default"
              size="icon-sm"
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-full w-7 h-7 p-0 disabled:opacity-30"
            >
              <ArrowUp size={14} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>

      {/* Project / WorkDir selector */}
      <div className="flex items-center px-1">
        <Popover open={showProjectMenu} onOpenChange={(open) => { setShowProjectMenu(open); if (!open) setProjectQuery(''); }}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="inline"
              className={`flex items-center gap-1.5 px-2 py-[3px] rounded-md text-xs transition-colors ${
                showProjectMenu
                  ? 'bg-accent/60 text-foreground'
                  : 'text-muted-foreground/80 hover:text-foreground hover:bg-accent/40'
              }`}
            >
              {currentProject ? (
                <Folder size={12} className="text-muted-foreground/70" strokeWidth={1.5} />
              ) : (
                <FolderX size={12} className="text-muted-foreground/70" strokeWidth={1.5} />
              )}
              <span>{currentProject ? currentProject.label : '不使用项目'}</span>
              <ChevronDown size={9} className={`transition-transform duration-100 ${showProjectMenu ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-[240px] p-1">
            <div className="px-1 py-1">
              <SearchInput
                value={projectQuery}
                onChange={setProjectQuery}
                placeholder="搜索项目"
                iconSize={11}
                wrapperClassName="px-2 py-[4px] rounded-md bg-accent/15 border border-border/25"
              />
            </div>
            <div className="py-0.5">
              {filteredProjects.length === 0 && (
                <div className="px-2 py-2 text-xs text-muted-foreground/50 text-center">无匹配项目</div>
              )}
              {filteredProjects.map(p => {
                const isActive = activeProject === p.id;
                return (
                  <button key={p.id} type="button"
                    onClick={() => { setActiveProject(p.id); setShowProjectMenu(false); }}
                    className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs transition-colors ${
                      isActive ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/25'
                    }`}
                  >
                    <Folder size={12} className="text-muted-foreground/70 flex-shrink-0" strokeWidth={1.5} />
                    <span className="flex-1 truncate">{p.label}</span>
                    {isActive && <Check size={11} className="text-foreground flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="h-px bg-border/30 my-0.5" />
            <button type="button"
              className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-foreground/80 hover:bg-accent/25 transition-colors"
            >
              <FolderPlus size={12} className="text-muted-foreground/70 flex-shrink-0" strokeWidth={1.5} />
              <span>添加新项目</span>
            </button>
            <button type="button"
              onClick={() => { setActiveProject(null); setShowProjectMenu(false); }}
              className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs transition-colors ${
                activeProject === null ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/25'
              }`}
            >
              <FolderX size={12} className="text-muted-foreground/70 flex-shrink-0" strokeWidth={1.5} />
              <span className="flex-1">不使用项目</span>
              {activeProject === null && <Check size={11} className="text-foreground flex-shrink-0" />}
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function NewSessionEmpty({ onSendMessage, agentName }: { onSendMessage: (text: string) => void; agentName?: string }) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Centered empty state */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex flex-col items-center max-w-[360px] w-full">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-accent/60 to-accent/30 border border-border/30 flex items-center justify-center mb-5">
            <Sparkles size={22} strokeWidth={1.3} className="text-muted-foreground/60" />
          </div>
          <h2 className="text-sm text-foreground tracking-[-0.01em]">我们该在 {agentName || 'Work'} 中做什么？</h2>
          <p className="text-xs text-muted-foreground/60 text-center leading-[1.6] mt-1.5">
            向 {agentName || '智能体'} 提问，支持生成文章、代码和可视化内容
          </p>
        </motion.div>
      </div>

      {/* Input bar at bottom */}
      <div className="flex-shrink-0 px-4 pb-3 pt-2">
        <CodexStyleInput onSendMessage={onSendMessage} autoFocus />
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
  const [collapsedToolCats, setCollapsedToolCats] = useState<Set<string>>(new Set());
  const [skillSourceFilter, setSkillSourceFilter] = useState<'all' | 'builtin' | 'custom' | 'market'>('all');
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
                  <div className="space-y-1">
                    {Array.from(toolsByCategory.entries()).map(([cat, items]) => {
                      const catEnabled = items.filter(t => t.enabled).length;
                      const isCollapsed = collapsedToolCats.has(cat);
                      return (
                        <div key={cat}>
                          <button
                            type="button"
                            onClick={() => setCollapsedToolCats(prev => {
                              const next = new Set(prev);
                              if (next.has(cat)) next.delete(cat); else next.add(cat);
                              return next;
                            })}
                            className="flex items-center justify-between w-full mb-1 px-0.5 py-1 rounded hover:bg-accent/15 transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <ChevronRight size={9} className={`text-muted-foreground/50 transition-transform duration-100 ${isCollapsed ? '' : 'rotate-90'}`} />
                              <span className="text-xs text-muted-foreground/60">{cat}</span>
                            </div>
                            <span className="text-xs text-muted-foreground/50 tabular-nums">{catEnabled}/{items.length}</span>
                          </button>
                          <AnimatePresence initial={false}>
                            {!isCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.12 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-0.5">
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
                              </motion.div>
                            )}
                          </AnimatePresence>
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
                          <div className="flex items-center gap-1.5">
                            <div className="text-sm text-foreground truncate">{svc.name}</div>
                            <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
                              svc.status === 'connected' ? 'bg-success' : 'bg-muted-foreground/30'
                            }`} />
                          </div>
                          <div className="text-xs text-muted-foreground/50 truncate">{svc.desc}</div>
                        </div>
                        <Switch size="sm" checked={svc.status === 'connected'} onCheckedChange={() => {}} />
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
                  <div className="space-y-1.5">
                    {/* Source filter tabs */}
                    <div className="flex items-center gap-0.5 px-0.5">
                      {([
                        { id: 'all', label: '全部' },
                        { id: 'builtin', label: '内置' },
                        { id: 'custom', label: '自定义' },
                        { id: 'market', label: '市场' },
                      ] as const).map(t => {
                        const count = t.id === 'all'
                          ? skills.length
                          : skills.filter(s => (s.source ?? 'builtin') === t.id).length;
                        const isActive = skillSourceFilter === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSkillSourceFilter(t.id)}
                            className={`flex items-center gap-1 px-2 py-[3px] rounded-md text-xs transition-colors ${
                              isActive
                                ? 'bg-accent/40 text-foreground'
                                : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/15'
                            }`}
                          >
                            <span>{t.label}</span>
                            <span className={`text-[10px] tabular-nums ${isActive ? 'text-muted-foreground/70' : 'text-muted-foreground/40'}`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-0.5">
                      {skills
                        .filter(s => skillSourceFilter === 'all' || (s.source ?? 'builtin') === skillSourceFilter)
                        .map(skill => {
                          const source = skill.source ?? 'builtin';
                          const sourceCfg = {
                            builtin: { label: '内置', cls: 'bg-foreground/8 text-muted-foreground' },
                            custom: { label: '自定义', cls: 'bg-accent-blue-muted text-accent-blue' },
                            market: { label: '市场', cls: 'bg-accent-violet-muted text-accent-violet' },
                          }[source];
                          return (
                            <div key={skill.id} className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg hover:bg-accent/15 transition-colors">
                              <Zap size={10} className={`flex-shrink-0 ${skill.enabled ? 'text-warning/60' : 'text-muted-foreground/50'}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <div className={`text-sm truncate ${skill.enabled ? 'text-foreground' : 'text-muted-foreground/40'}`}>{skill.name}</div>
                                  <span className={`text-[10px] leading-[14px] px-1 rounded ${sourceCfg.cls} flex-shrink-0`}>
                                    {sourceCfg.label}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground/50 truncate">{skill.desc}</div>
                              </div>
                              <Switch size="sm" checked={skill.enabled} onCheckedChange={() => {}} />
                            </div>
                          );
                        })}
                    </div>
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
  const [showPlan, setShowPlan] = useState(false);
  const [showOpenWith, setShowOpenWith] = useState(false);
  const [showOutputs, setShowOutputs] = useState(false);

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
    setPreviewMaximized(false);
    setShowExplorer(false);
    setSelectedFile(null);
  }, []);

  const handleNewSessionForAgent = useCallback((agentName: string) => {
    const agent = AVAILABLE_AGENTS.find(a => a.name === agentName);
    if (agent) setSelectedAgent(agent);
    const newId = `new-${Date.now()}`;
    const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const newSession: AgentSession = {
      id: newId,
      title: '新会话',
      agentName: agentName,
      agentIcon: agent?.avatar,
      lastMessage: '',
      timestamp: ts,
      messageCount: 0,
      status: 'active',
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowPreview(false);
    setPreviewMaximized(false);
    setShowExplorer(false);
    setSelectedFile(null);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setShowPreview(false);
      setPreviewMaximized(false);
      setShowExplorer(false);
    }
  }, [activeSessionId]);

  const handleRenameGroup = useCallback((oldName: string, newName: string) => {
    setSessions(prev => prev.map(s =>
      (s.group || '任务') === oldName ? { ...s, group: newName } : s
    ));
  }, []);

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
          if (m.id !== msgId) return m;
          if (m.generativeUI) {
            return { ...m, generativeUI: { ...m.generativeUI, resolved: true, resolvedValue: value } };
          }
          if (m.permissionRequest) {
            const status = value === 'deny' ? 'denied' : 'approved';
            return { ...m, permissionRequest: { ...m.permissionRequest, status } };
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

  // Extract header into reusable JSX so it can render in both normal and maximized layouts
  const headerJSX = (
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
            {historySidebar.isCompact ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
          </Button>
        </Tooltip>

        {/* Agent picker */}
        <AgentPicker
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
          onCreateNew={() => onNavigateToLibrary?.()}
          onAvatarClick={() => setShowAgentInfo(true)}
          onConfigureAgent={(agent) => editAssistantInLibrary(agent.name)}
          pinnedIds={pinnedAgentIds}
          onTogglePin={togglePinAgent}
        />

        {/* Model picker */}
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

        {/* Session-specific status — only when working */}
        {hasMessages && sessionData.workDir && (
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

      <div className="flex items-center gap-0.5">
        {hasMessages && (
          <Tooltip content={"新建会话"} side="bottom"><Button variant="ghost" size="icon-xs" onClick={handleNewSession}
            className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
            <MessageCirclePlus size={13} />
          </Button></Tooltip>
        )}

        {/* Open with — choose external tool to open the project */}
        <Popover open={showOpenWith} onOpenChange={setShowOpenWith}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="inline"
              className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs transition-colors ${
                showOpenWith
                  ? 'bg-accent/25 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'
              }`}
              title="用工具打开"
            >
              <FolderOpen size={13} className="text-blue-500" />
              <ChevronDown size={9} className={`transition-transform duration-100 ${showOpenWith ? 'rotate-180' : ''}`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" side="bottom" sideOffset={6} className="w-[180px] p-1">
            <div className="px-2 py-1 text-xs text-muted-foreground/60">用工具打开</div>
            {[
              { id: 'cursor', label: 'Cursor', Icon: MousePointer2, color: 'text-foreground' },
              { id: 'antigravity', label: 'Antigravity', Icon: Mountain, color: 'text-orange-500' },
              { id: 'finder', label: 'Finder', Icon: FolderOpen, color: 'text-blue-500' },
              { id: 'terminal', label: 'Terminal', Icon: TerminalSquare, color: 'text-foreground' },
              { id: 'warp', label: 'Warp', Icon: Zap, color: 'text-cyan-500' },
            ].map(item => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setShowOpenWith(false)}
                  className="w-full flex items-center gap-2.5 px-2 py-[6px] rounded-md text-left text-xs text-foreground/80 hover:bg-accent/25 transition-colors"
                >
                  <div className="w-5 h-5 rounded-md bg-foreground/5 border border-border/30 flex items-center justify-center flex-shrink-0">
                    <Icon size={11} strokeWidth={1.5} className={item.color} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {/* 成果展示 — only when session has output files */}
        {sessionData.outputFiles.length > 0 && (
          <Popover open={showOutputs} onOpenChange={setShowOutputs}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-xs"
                className={`relative p-1.5 w-auto h-auto ${showOutputs ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'}`}
                title="成果展示"
              >
                <Package size={13} />
                {sessionData.outputFiles.some(f => f.status === 'generating') && (
                  <span className="absolute top-[2px] right-[2px] w-[5px] h-[5px] rounded-full bg-warning animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" sideOffset={8} className="p-0 w-[380px] max-h-[480px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Package size={12} className="text-muted-foreground" />
                  <span className="text-xs text-foreground">成果展示</span>
                  <span className="text-xs text-muted-foreground/60 tabular-nums">
                    {sessionData.outputFiles.filter(f => f.status === 'completed').length}/{sessionData.outputFiles.length}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground/50">{sessionData.workDir}</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-1.5 space-y-0.5">
                {sessionData.outputFiles.map(file => {
                  const fmt = (file.format || '').toLowerCase();
                  // Icon and color by format
                  const formatConfig: Record<string, { Icon: React.ComponentType<{ size?: number; className?: string }>; cls: string }> = {
                    pdf:   { Icon: FileText, cls: 'text-destructive' },
                    md:    { Icon: FileText, cls: 'text-info' },
                    html:  { Icon: Globe, cls: 'text-accent-violet' },
                    docx:  { Icon: FileText, cls: 'text-info' },
                    xlsx:  { Icon: Table2, cls: 'text-success' },
                    csv:   { Icon: Table2, cls: 'text-success' },
                    pptx:  { Icon: FileImage, cls: 'text-warning' },
                    zip:   { Icon: Package, cls: 'text-muted-foreground' },
                    png:   { Icon: FileImage, cls: 'text-accent-pink' },
                    jpg:   { Icon: FileImage, cls: 'text-accent-pink' },
                  };
                  const cfg = formatConfig[fmt] || { Icon: FileText, cls: 'text-muted-foreground' };
                  const Icon = cfg.Icon;
                  const isGenerating = file.status === 'generating';

                  // Tools available for this format
                  const previewable = ['pdf', 'md', 'html', 'docx', 'png', 'jpg', 'pptx'].includes(fmt);
                  const browserable = ['html', 'pdf', 'png', 'jpg', 'md'].includes(fmt);
                  const editable = ['md', 'csv', 'html', 'json'].includes(fmt);

                  return (
                    <div key={file.id} className="group/f flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-accent/15 transition-colors">
                      <div className={`w-7 h-7 rounded-md bg-foreground/5 border border-border/30 flex items-center justify-center flex-shrink-0 ${cfg.cls}`}>
                        <Icon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-foreground truncate">{file.name}</span>
                          {isGenerating && (
                            <span className="text-[10px] px-1 rounded bg-warning/15 text-warning flex-shrink-0 flex items-center gap-0.5">
                              <span className="w-[5px] h-[5px] rounded-full bg-warning animate-pulse" />
                              生成中
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mt-[1px]">
                          <span className="uppercase tracking-wide">{fmt}</span>
                          <span className="text-muted-foreground/30">·</span>
                          <span>{file.size}</span>
                          {file.timestamp && (
                            <>
                              <span className="text-muted-foreground/30">·</span>
                              <span>{file.timestamp}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Open with dropdown */}
                      {!isGenerating && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="inline"
                              className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] text-muted-foreground/70 hover:text-foreground hover:bg-accent/30 opacity-0 group-hover/f:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <ExternalLink size={10} />
                              <span>打开</span>
                              <ChevronDown size={9} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="bottom" className="w-[160px]">
                            {previewable && (
                              <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                                <EyeIcon size={12} className="text-muted-foreground/70 flex-shrink-0" />
                                <span className="flex-1">预览</span>
                              </DropdownMenuItem>
                            )}
                            {browserable && (
                              <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                                <Globe size={12} className="text-accent-violet flex-shrink-0" />
                                <span className="flex-1">浏览器</span>
                              </DropdownMenuItem>
                            )}
                            {editable && (
                              <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                                <MousePointer2 size={12} className="text-foreground flex-shrink-0" />
                                <span className="flex-1">Cursor</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                              <FolderOpen size={12} className="text-blue-500 flex-shrink-0" />
                              <span className="flex-1">Finder</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                              <TerminalSquare size={12} className="text-muted-foreground/70 flex-shrink-0" />
                              <span className="flex-1">Terminal</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Plan toggle — only when there are workflow steps. Opens floating card. */}
        {sessionData.steps.length > 0 && (
          <Popover open={showPlan} onOpenChange={setShowPlan}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-xs"
                className={`relative p-1.5 w-auto h-auto ${showPlan ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/15'}`}>
                <ListChecks size={13} />
                {sessionData.steps.some(s => s.status === 'running') && (
                  <span className="absolute top-[2px] right-[2px] w-[5px] h-[5px] rounded-full bg-warning animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" sideOffset={8} className="p-0 w-[340px] max-h-[460px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <ListChecks size={12} className="text-muted-foreground" />
                  <span className="text-xs text-foreground">计划</span>
                  <span className="text-xs text-muted-foreground/60 tabular-nums">
                    {sessionData.steps.filter(s => s.status === 'done').length}/{sessionData.steps.length}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto py-1">
                <WorkflowPanel steps={sessionData.steps} inline />
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Show preview toggle — only when artifact is closed, to bring it back */}
        {!showPreview && (
          <div className="flex items-center gap-0.5">
            <div className="w-px h-3.5 bg-border/30 mx-0.5" />
            <Tooltip content={"显示预览面板"} side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setShowPreview(true)}
              className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/15">
              <Columns2 size={12} />
            </Button></Tooltip>
          </div>
        )}
      </div>
    </header>
  );

  // Maximized layout: header on top, artifact full width, compact input at bottom
  if (previewMaximized && showPreview) {
    return (
      <div className="flex flex-col h-full bg-background select-none relative">
        {headerJSX}

        {/* Artifact panel — full width */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="flex flex-1 min-h-0 min-w-0 mx-2 mb-1 rounded-2xl border border-border/40 bg-card/50 shadow-sm shadow-black/5 overflow-hidden"
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
              onTogglePreview={() => { setShowPreview(false); setPreviewMaximized(false); }}
              maximized={previewMaximized}
              onToggleMaximize={() => setPreviewMaximized(!previewMaximized)}
            />
          </div>
        </motion.div>

        {/* Compact input bar at the bottom */}
        <CompactInputBar onSendMessage={handleSendMessage} agentName={selectedAgent.name} />

        {/* Agent Info Overlay */}
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
    );
  }

  return (
    <div className="flex h-full bg-background select-none relative">
      {/* ===== Left: History Sidebar (compact) — auto-hides when artifact maximized ===== */}
      <AnimatePresence initial={false}>
        {historySidebar.isCompact && !previewMaximized && (
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
              customGroupBy={{
                label: '智能体',
                getGroupKey: (item) => item.agentName,
              }}
              onNewItemForGroup={handleNewSessionForAgent}
              onRenameGroup={handleRenameGroup}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Right: Header + Content ===== */}
      <div
        className="flex flex-col min-w-0 min-h-0 relative flex-shrink-0"
        style={
          showPreview
            ? { width: 480, flex: '0 0 auto' }
            : { flex: '1 1 0%' }
        }
      >
        {headerJSX}

      {/* ===== Main Content (chat panel only — artifact moved out) ===== */}
      <div className="flex flex-1 min-h-0 pl-2 min-w-0">
        <div className="min-h-0 h-full flex-1 min-w-0">
          {!hasMessages ? (
            <NewSessionEmpty onSendMessage={handleSendMessage} agentName={selectedAgent.name} />
          ) : (
            <ChatPanel
              messages={messages}
              steps={sessionData.steps}
              onSendMessage={handleSendMessage}
              onResolveUI={handleResolveUI}
              onAvatarClick={() => setShowAgentInfo(true)}
            />
          )}
        </div>
      </div>
      </div>

      {/* ===== Artifact Panel — moved to outer level, side-by-side with title section ===== */}
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
                onTogglePreview={() => { setShowPreview(false); setPreviewMaximized(false); }}
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
  );
}
