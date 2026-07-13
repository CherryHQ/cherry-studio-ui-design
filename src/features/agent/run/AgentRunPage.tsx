import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  ArrowLeft, ChevronDown, ChevronRight, FolderOpen, Download,
  Bot,
  Sparkles, Plus, ArrowUp,
  FileText, Zap, Search as SearchIcon, BookOpen, History,
  MessageCirclePlus, MessageSquarePlus,
  Code2, Folder, FolderPen, Tag, ListChecks,
  X,
  Check,
  Edit3, Clock,
  Workflow, Cable, Layers,
  Compass, Wrench, PenTool, Bolt, Filter, Pin, ArrowDown,
  Paperclip, Globe, Brain, Pencil, PanelLeftOpen, PanelLeftClose,
  SquarePlus, RefreshCw, TerminalSquare, Lightbulb, Scan, Languages,
  Hand, ShieldAlert, MoreHorizontal, MousePointer2, Mountain, ExternalLink,
  Package, Eye as EyeIcon, FileImage, Table2, LayoutGrid, Presentation, Monitor,
  Users2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '@/app/components/Tooltip';
import { Button, Switch, Textarea, EmptyState, Popover, PopoverTrigger, PopoverContent, SearchInput, Typography, BrandLogo, Separator, ScrollArea, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, Dialog, DialogContent, Input } from '@cherry-studio/ui';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { FileExplorer } from './FileExplorer';
import { ArtifactViewer } from './ArtifactViewer';
import { ChatPanel } from './ChatPanel';
import { SaveAsSkillDialog } from './SaveAsSkillDialog';
import { SaveAsSkillCallout } from './SaveAsSkillCallout';
import { SkillJobStatusChip } from './SkillJobStatusChip';
import { useActiveSkillJob } from '@/app/stores/skillJobStore';
import { WorkflowPanel } from './WorkflowPanel';
import type { AgentChatMessage, AgentSession, AgentSessionData } from '@/app/types/agent';
import { SessionHistoryPage, type SessionDisplayMode } from './SessionHistoryPage';
import { ScheduledTasksPage } from './ScheduledTasksPage';
import { TaskBoardPage } from './TaskBoardPage';
import { HistorySidebar } from '@/app/components/shared/HistorySidebar';
import { EntityRail, type EntityRailItem, type EntityRailTreeGroup, type EntityRailSection } from '@/app/components/shared/EntityNav';
import { HistoryManagePage } from './HistoryManagePage';
import { CreateAgentWizard } from '@/app/components/shared/CreateAgentWizard';
import { GroupChatPane } from './GroupChatPane';
import { MOCK_GROUPS } from '@/features/collaboration/data';
import { WORK_PLUS } from '@/app/config/featureFlags';
import { NewGroupDialog } from '@/features/collaboration/components/NewGroupDialog';
import { RecycleBinConfirmDialog } from '@/app/components/shared/RecycleBinConfirmDialog';
import { ResourceConfigDialog } from '@/app/components/shared/ResourceConfigDialog';
import { useRecycleBin } from '@/app/context/RecycleBinContext';
import { useHistorySidebar } from '@/app/hooks/useHistorySidebar';
import type { ResourceItem } from '@/app/types';

// Convert the AvailableAgent runtime shape into the ResourceItem the
// shared config dialog (and the embedded AgentConfig editor) expects.
function agentToResource(a: typeof AVAILABLE_AGENTS[0]): ResourceItem {
  return {
    id: a.id,
    name: a.name,
    type: 'agent',
    description: a.desc,
    avatar: a.avatar,
    model: a.model,
    tags: a.tags,
    enabled: true,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}
import { toast } from 'sonner';
import {
  MOCK_SESSIONS, MODELS, SESSION_DATA_MAP, EMPTY_SESSION_DATA,
  DEFAULT_INITIAL_FILES,
  DEMO_OUTPUT_FILES, DEMO_FILE_CONTENTS, DEMO_PREVIEWS,
  MOCK_SCHEDULED_TASKS, type ScheduledTask,
} from '@/app/mock';

// Backward-compatible aliases
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
// Compact Input Bar — used when artifact is fullscreen-maximized
// ===========================

function CompactInputBar({ onSendMessage, agentName, headerControls, onNewSession }: { onSendMessage: (text: string) => void; agentName?: string; headerControls?: React.ReactNode; onNewSession?: () => void }) {
  return (
    <div className="flex-shrink-0 px-3 pb-3 pt-1.5">
      <CodexStyleInput onSendMessage={onSendMessage} placeholder={`继续与 ${agentName || '智能体'} 对话...`} headerControls={headerControls} onNewSession={onNewSession} />
    </div>
  );
}

// ===========================
// New Session Empty State
// ===========================

// 圆角矩形 + 靠右短竖线的「侧栏预览」图标（lucide 无现成款）
const PanelRightInsetIcon = ({ size = 15, className }: { size?: number; className?: string }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3.5" width="18" height="17" rx="4.5" />
    <line x1="15.5" y1="8.5" x2="15.5" y2="15.5" />
  </svg>
);

// ===========================
// CodeX-style Input (shared between empty state and maximized)
// ===========================

const NEW_PERMISSION_MODES: { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; color: string }[] = [
  { id: 'normal',    label: '普通模式',     icon: Hand,      color: 'text-emerald-500' },
  { id: 'plan',      label: '计划模式',     icon: Workflow,  color: 'text-amber-500' },
  { id: 'auto-edit', label: '自动编辑模式', icon: FolderPen, color: 'text-emerald-500' },
  { id: 'full-auto', label: '全自动模式',   icon: RefreshCw, color: 'text-violet-500' },
];

// Slash & mention items shared across CodexStyleInput instances
const CSI_SLASH_COMMANDS = [
  { id: 'clear', label: '/clear', desc: '清除会话历史' },
  { id: 'compact', label: '/compact', desc: '压缩会话上下文' },
  { id: 'context', label: '/context', desc: '可视化上下文使用情况' },
  { id: 'cost', label: '/cost', desc: '查看 Token 用量' },
  { id: 'todos', label: '/todos', desc: '列出当前 TODO' },
];
// The @ mention catalog (助手 / 模型 / 文件 / MCP) lives inside the shared
// MentionPickerPanel — the inline groups that used to live here are gone.

function CodexStyleInput({ onSendMessage, autoFocus = false, placeholder, headerControls, onNewSession }: {
  onSendMessage: (text: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  /** Same as ChatPanel.headerControls — agent + model pickers, etc. */
  headerControls?: React.ReactNode;
  /** Starts a new (empty) session — wired to the far-left "新建会话" button. */
  onNewSession?: () => void;
}) {
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState('normal');
  const [showModelMenu, setShowModelMenu] = useState(false);
  // Thinking effort selector — kept in sync with the popover and surfaced
  // inside the composer (chip above the textarea) so the user can see the
  // active level without opening the menu.
  type ThinkingEffort = 'default' | 'low' | 'mid' | 'high';
  const [thinkingEffort, setThinkingEffort] = useState<ThinkingEffort>('default');
  const THINKING_LABELS: Record<ThinkingEffort, string> = { default: '默认', low: '浮想', mid: '斟酌', high: '沉思' };
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSlash, setShowSlash] = useState(false);
  const [showMention, setShowMention] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      <div className="relative rounded-2xl border border-border/40 bg-muted/30 shadow-sm focus-within:border-border/50 transition-all duration-150">
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

        {/* @ mention popup — shared two-page panel with 助手 / 模型 / 文件 /
            MCP categories. Each picks inserts an @<label> token. */}
        {showMention && (
          <div className="absolute bottom-full left-0 right-0 pb-2 z-10">
            <div className="rounded-xl border border-border/40 bg-card shadow-lg overflow-hidden max-h-[360px]">
              <MentionPickerPanel
                disableMulti
                assistantLabel="Agent"
                onPick={(pick) => {
                  const label = pick.type === 'assistant' || pick.type === 'model' ? pick.name : pick.label;
                  const idx = input.lastIndexOf('@');
                  const before = idx >= 0 ? input.slice(0, idx) : input;
                  setInput(`${before}@${label} `);
                  textareaRef.current?.focus();
                }}
                onClose={() => setShowMention(false)}
              />
            </div>
          </div>
        )}

        {/* Thinking effort indicator — visible when a non-default level is chosen */}
        {thinkingEffort !== 'default' && (
          <div className="px-3 pt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-sm border border-success/25 bg-success/10 text-success/90 text-xs leading-none font-medium">
              <Lightbulb size={10} strokeWidth={2} className="text-success" />
              <span>思考</span>
              <span className="opacity-60 tracking-wide">{THINKING_LABELS[thinkingEffort]}</span>
              <button
                type="button"
                onClick={() => setThinkingEffort('default')}
                aria-label="关闭思考"
                className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm text-success/60 hover:text-success hover:bg-success/15 transition-colors"
              >
                <X size={9} />
              </button>
            </span>
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
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none min-h-[64px] max-h-[140px] leading-[1.6] px-3.5 pt-[10px] pb-2 border-transparent focus-visible:border-transparent focus-visible:ring-0 shadow-none"
        />
        <div className="px-2 pb-2 flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-0.5 min-w-0">
            {/* 新建会话 — 最左侧 */}
            {onNewSession && (
              <Button variant="ghost" size="icon-sm" onClick={onNewSession} title="新建会话" className="p-[5px] w-auto h-auto text-muted-foreground/80 hover:text-foreground hover:bg-accent/50">
                <MessageSquarePlus size={16} strokeWidth={1.5} />
              </Button>
            )}

            {headerControls}

            {/* Thinking effort selector */}
            <Popover open={showModelMenu} onOpenChange={setShowModelMenu}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="inline"
                  className={`flex items-center gap-1 px-1.5 py-[4px] rounded-md text-xs transition-colors ${
                    showModelMenu
                      ? 'bg-accent/60 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Lightbulb size={13} className={thinkingEffort === 'default' ? 'text-muted-foreground/80' : 'text-success'} strokeWidth={1.5} />
                  <span className="truncate">{THINKING_LABELS[thinkingEffort]}</span>
                  <ChevronDown size={9} className={`transition-transform duration-100 ${showModelMenu ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-[200px] p-1">
                <div className="px-2 py-1 text-xs text-muted-foreground/60">思维链长度</div>
                {([
                  { id: 'default' as const, label: '默认' },
                  { id: 'low'     as const, label: '浮想' },
                  { id: 'mid'     as const, label: '斟酌' },
                  { id: 'high'    as const, label: '沉思' },
                ]).map(t => {
                  const active = thinkingEffort === t.id;
                  return (
                    <button key={t.id} type="button"
                      onClick={() => { setThinkingEffort(t.id); setShowModelMenu(false); }}
                      className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs transition-colors ${active ? 'bg-accent/40 text-foreground' : 'text-muted-foreground/80 hover:bg-accent/40'}`}
                    >
                      <span className="flex-1">{t.label}</span>
                      {active && <Check size={10} className="text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>

            {/* Skill picker — quick access to installed skills */}
            <Popover open={showSkillMenu} onOpenChange={setShowSkillMenu}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="inline"
                  className={`flex items-center gap-1 px-1.5 py-[4px] rounded-md text-xs transition-colors ${
                    showSkillMenu
                      ? 'bg-accent/60 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <LayoutGrid size={13} className="text-muted-foreground/80" strokeWidth={1.5} />
                  <span className="truncate">技能</span>
                  <ChevronDown size={9} className={`transition-transform duration-100 ${showSkillMenu ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-[240px] p-1">
                <div className="px-1.5 pt-1 pb-1.5">
                  <SearchInput
                    value={skillSearch}
                    onChange={setSkillSearch}
                    placeholder="搜索技能…"
                    clearable
                    wrapperClassName="flex items-center gap-1.5 px-2 h-7 rounded-md bg-muted/30 border border-border/20"
                  />
                </div>
                {(() => {
                  const allSkills = [
                    { id: 'docs',    label: 'Documents',     icon: FileText,     color: 'text-info' },
                    { id: 'sheets',  label: 'Spreadsheets',  icon: Table2,       color: 'text-success' },
                    { id: 'slides',  label: 'Presentations', icon: Presentation, color: 'text-warning' },
                    { id: 'browser', label: '浏览器',         icon: Compass,      color: 'text-info' },
                    { id: 'desktop', label: '电脑',           icon: Monitor,      color: 'text-accent-violet' },
                  ];
                  const q = skillSearch.trim().toLowerCase();
                  const filtered = q ? allSkills.filter(s => s.label.toLowerCase().includes(q)) : allSkills;
                  if (filtered.length === 0) {
                    return (
                      <div className="px-2 py-3 text-center text-xs text-muted-foreground/50">
                        未找到匹配技能
                      </div>
                    );
                  }
                  return (
                    <>
                      {!q && <div className="px-2 py-1 text-xs text-muted-foreground/60">已安装技能</div>}
                      {filtered.map(s => {
                        const Icon = s.icon;
                        return (
                          <button key={s.id} type="button"
                            onClick={() => { setShowSkillMenu(false); setSkillSearch(''); }}
                            className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-muted-foreground/80 hover:bg-accent/40 transition-colors"
                          >
                            <Icon size={12} strokeWidth={1.5} className={`flex-shrink-0 ${s.color}`} />
                            <span className="flex-1 truncate">{s.label}</span>
                          </button>
                        );
                      })}
                    </>
                  );
                })()}
                <Separator opacity={40} className="my-1" />
                <button type="button"
                  onClick={() => setShowSkillMenu(false)}
                  className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
                >
                  <Wrench size={12} strokeWidth={1.5} className="flex-shrink-0" />
                  <span className="flex-1 truncate">管理技能…</span>
                </button>
                <button type="button"
                  onClick={() => setShowSkillMenu(false)}
                  className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
                >
                  <Plus size={12} strokeWidth={1.5} className="flex-shrink-0" />
                  <span className="flex-1 truncate">添加技能</span>
                </button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Right: send */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="p-[5px] w-auto h-auto text-muted-foreground/80 hover:text-foreground hover:bg-accent/50">
                  <Plus size={16} strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-48">
                {/* Permission modes — cascaded submenu */}
                {(() => {
                  const active = NEW_PERMISSION_MODES.find(m => m.id === activeMode) ?? NEW_PERMISSION_MODES[0];
                  const ActiveIcon = active.icon;
                  return (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs">
                        <ActiveIcon size={13} strokeWidth={1.5} className={`flex-shrink-0 ${active.color}`} />
                        <span className="flex-1 text-left">{active.label}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {NEW_PERMISSION_MODES.map(mode => {
                          const Icon = mode.icon;
                          const isActive = activeMode === mode.id;
                          return (
                            <DropdownMenuItem
                              key={mode.id}
                              onClick={() => setActiveMode(mode.id)}
                              className={`gap-2 px-2 py-[5px] text-xs ${isActive ? 'bg-accent/40' : ''}`}
                            >
                              <Icon size={13} strokeWidth={1.5} className={`flex-shrink-0 ${mode.color}`} />
                              <span className="flex-1 text-left">{mode.label}</span>
                              {isActive && <Check size={11} className="text-foreground flex-shrink-0" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  );
                })()}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Paperclip size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">添加图片或附件</span></DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Folder size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">添加文件夹</span></DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Globe size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">网络搜索</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Skills/Plugins — cascaded submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs">
                    <LayoutGrid size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-left">插件</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-[200px]">
                    <div className="px-2 py-1 text-xs text-muted-foreground/60">5 个已安装插件</div>
                    <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                      <FileText size={13} strokeWidth={1.5} className="text-info flex-shrink-0" />
                      <span className="flex-1 text-left">Documents</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                      <Table2 size={13} strokeWidth={1.5} className="text-success flex-shrink-0" />
                      <span className="flex-1 text-left">Spreadsheets</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                      <Presentation size={13} strokeWidth={1.5} className="text-warning flex-shrink-0" />
                      <span className="flex-1 text-left">Presentations</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                      <Compass size={13} strokeWidth={1.5} className="text-info flex-shrink-0" />
                      <span className="flex-1 text-left">浏览器</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                      <Monitor size={13} strokeWidth={1.5} className="text-accent-violet flex-shrink-0" />
                      <span className="flex-1 text-left">电脑</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><TerminalSquare size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">斜杠命令</span></DropdownMenuItem>
                <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs"><Zap size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" /><span className="flex-1 text-left">快捷短语</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    </div>
  );
}

function NewSessionEmpty({ onSendMessage, agentName, headerControls, onNewSession }: { onSendMessage: (text: string) => void; agentName?: string; headerControls?: React.ReactNode; onNewSession?: () => void }) {
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
        <CodexStyleInput onSendMessage={onSendMessage} autoFocus headerControls={headerControls} onNewSession={onNewSession} />
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
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-accent/40">
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
                  <div key={item.id} className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg hover:bg-accent/40 transition-colors group">
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
              <div key={item.id} className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg hover:bg-accent/40 transition-colors group">
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
          className="w-full justify-start gap-2 px-2.5 py-[7px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40"
        >
          <Compass size={11} className="text-muted-foreground/50" />
          <span>{"\u53bb\u63a2\u7d22\u6d4f\u89c8"}</span>
          <ChevronRight size={9} className="ml-auto text-muted-foreground/40" />
        </Button>
        <Button size="inline"
          variant="ghost"
          className="w-full justify-start gap-2 px-2.5 py-[7px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40"
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
      className="absolute top-2 right-2 bottom-2 z-[var(--z-sticky)] bg-background rounded-xl border border-border/20 shadow-2xl shadow-black/12 flex flex-col overflow-hidden"
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
            <Button variant="ghost" size="icon-xs" onClick={onEdit} className="text-muted-foreground hover:text-foreground hover:bg-accent/40">
              <Edit3 size={11} />
            </Button>
          </Tooltip>
          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-accent/40">
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
              className="w-full justify-start gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent/40">
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
                            className="flex items-center justify-between w-full mb-1 px-0.5 py-1 rounded hover:bg-accent/40 transition-colors"
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
                                    <label
                                      key={tool.id}
                                      className="flex items-center gap-2.5 px-2 py-[6px] rounded-md hover:bg-accent/40 transition-colors cursor-pointer"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className={`text-sm truncate leading-tight ${tool.enabled ? 'text-foreground' : 'text-muted-foreground/40'}`}>{tool.name}</div>
                                        <div className="text-xs text-muted-foreground/50 truncate mt-0.5">{tool.desc}</div>
                                      </div>
                                      <Switch size="sm" checked={tool.enabled} onCheckedChange={() => {}} className="flex-shrink-0" />
                                    </label>
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
                      <label
                        key={svc.id}
                        className="flex items-center gap-2.5 px-2 py-[6px] rounded-md hover:bg-accent/40 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate leading-tight">{svc.name}</div>
                          <div className="text-xs text-muted-foreground/50 truncate mt-0.5">{svc.desc}</div>
                        </div>
                        <Switch size="sm" checked={svc.status === 'connected'} onCheckedChange={() => {}} className="flex-shrink-0" />
                      </label>
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
                                : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'
                            }`}
                          >
                            <span>{t.label}</span>
                            <span className={`text-[10px] tabular-nums ${isActive ? 'text-muted-foreground/80' : 'text-muted-foreground/40'}`}>{count}</span>
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
                            builtin: { label: '内置', cls: 'bg-foreground/10 text-muted-foreground' },
                            custom: { label: '自定义', cls: 'bg-accent-blue-muted text-accent-blue' },
                            market: { label: '市场', cls: 'bg-accent-violet-muted text-accent-violet' },
                          }[source];
                          return (
                            <label
                              key={skill.id}
                              className="flex items-center gap-2.5 px-2 py-[6px] rounded-md hover:bg-accent/40 transition-colors cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-sm truncate leading-tight ${skill.enabled ? 'text-foreground' : 'text-muted-foreground/40'}`}>{skill.name}</span>
                                  <span className={`text-[10px] leading-[14px] px-1 rounded ${sourceCfg.cls} flex-shrink-0`}>
                                    {sourceCfg.label}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground/50 truncate mt-0.5">{skill.desc}</div>
                              </div>
                              <Switch size="sm" checked={skill.enabled} onCheckedChange={() => {}} className="flex-shrink-0" />
                            </label>
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
  const { navigateToLibrary: _navLib, editAssistantInLibrary, changeTabTitle: onTabTitleChange, openSettings: onOpenSettings, launchpadOpen } = useGlobalActions();
  const onNavigateToLibrary = () => _navLib('agent');
  const [sessions, setSessions] = useState<AgentSession[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Record<string, AgentChatMessage[]>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>('src/App.tsx');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showExplorer, setShowExplorer] = useState(true);
  // Single source of truth for the shared right dock: 会话 (session list),
  // 文件 (artifact / file browser) or 状态 (run status), switchable by tab —
  // mirrors the real Cherry Studio agent dock (Files / Status). `showPreview`
  // is a derived alias for the 文件 view so the artifact-visibility checks
  // below read naturally.
  const [dockTab, setDockTab] = useState<'sessions' | 'files' | 'status' | null>(null);
  const showPreview = dockTab === 'files';
  const [dockWidth, setDockWidth] = useState(560);
  // The pinned 会话 popover uses a narrower default so it reads as a popover
  // (浮窗), not a flush full-width dock; sessions/artifacts/status each keep
  // their own resize state.
  const [topicDockWidth, setTopicDockWidth] = useState(320);
  const dockResizing = useRef(false);
  const handleDockResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dockResizing.current = true;
    const startX = e.clientX;
    const isTopic = dockTab === 'sessions';
    const startW = isTopic ? topicDockWidth : dockWidth;
    const minW = isTopic ? 260 : 300;
    const maxW = isTopic ? 560 : 900;
    const setW = isTopic ? setTopicDockWidth : setDockWidth;
    const onMove = (ev: MouseEvent) => {
      if (!dockResizing.current) return;
      const next = Math.max(minW, Math.min(maxW, startW - (ev.clientX - startX)));
      setW(next);
    };
    const onUp = () => {
      dockResizing.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [dockTab, dockWidth, topicDockWidth]);
  const historySidebar = useHistorySidebar('compact');
  const [historyDisplayMode, setHistoryDisplayMode] = useState<SessionDisplayMode>('floating');
  const [selectedAgent, setSelectedAgent] = useState(AVAILABLE_AGENTS[0]);
  const [previewMaximized, setPreviewMaximized] = useState(false);
  // Maximize is an artifact-only mode — it must not gate the layout when the
  // dock is showing 会话/状态, otherwise pinning the session panel from a
  // maximized artifact silently fails (the dock stays hidden).
  const isMaximized = previewMaximized && dockTab === 'files';
  const [showAgentInfo, setShowAgentInfo] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showSaveAsSkill, setShowSaveAsSkill] = useState(false);
  // 定时任务 view — reached from the entry pinned under "添加智能体" on the
  // agent rail. When showing, the content column renders ScheduledTasksPage
  // instead of the chat.
  const [showScheduledTasks, setShowScheduledTasks] = useState(false);
  // When set, the 定时任务 view opens straight into that task's detail
  // (used by the "来自定时任务" return bar). null = land on the list.
  const [scheduledDetailId, setScheduledDetailId] = useState<string | null>(null);
  const openScheduledTasks = useCallback((detailId: string | null = null) => {
    setDockTab(null);
    setPreviewMaximized(false);
    setShowExplorer(false);
    setShowTaskBoard(false);
    setShowHistoryManage(false);
    setSelectedGroupId(null);
    setScheduledDetailId(detailId);
    setShowScheduledTasks(true);
  }, []);
  // 历史记录 view — 独立的全量会话管理页（筛选菜单进入），接管内容区。
  const [showHistoryManage, setShowHistoryManage] = useState(false);
  // 任务管理 view — a global, read-only kanban of all sessions by status.
  // Pinned under "添加智能体" alongside 定时任务; takes over the content area.
  const [showTaskBoard, setShowTaskBoard] = useState(false);
  const openTaskBoard = useCallback(() => {
    setDockTab(null);
    setPreviewMaximized(false);
    setShowExplorer(false);
    setShowScheduledTasks(false);
    setShowHistoryManage(false);
    setSelectedGroupId(null);
    setShowTaskBoard(true);
  }, []);
  const openHistoryManage = useCallback(() => {
    setDockTab(null);
    setPreviewMaximized(false);
    setShowExplorer(false);
    setShowScheduledTasks(false);
    setShowTaskBoard(false);
    setSelectedGroupId(null);
    setShowHistoryManage(true);
  }, []);
  // 项目组 (群聊) — folded into the same rail as 私聊 (Agent). When a group is
  // selected the content column renders GroupChatPane (collaboration's topic
  // view) instead of the agent chat. null = a 私聊/Agent is active.
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const openGroup = useCallback((id: string) => {
    setShowScheduledTasks(false);
    setShowTaskBoard(false);
    setShowHistoryManage(false);
    setDockTab(null);
    setPreviewMaximized(false);
    setShowExplorer(false);
    setSelectedGroupId(id);
  }, []);
  const selectedGroup = useMemo(
    () => (selectedGroupId ? MOCK_GROUPS.find(g => g.id === selectedGroupId) ?? null : null),
    [selectedGroupId],
  );
  const activeSkillJob = useActiveSkillJob();
  // Sessions where the user dismissed the inline "Save as Skill?"
  // callout. Per cherry-studio#15029 we surface this contextually after
  // task completion; once dismissed we don't nag again for the session.
  const [skillCalloutDismissed, setSkillCalloutDismissed] = useState<Set<string>>(() => new Set());

  const sessionData: AgentSessionData = useMemo(() => {
    if (!activeSessionId) return EMPTY_SESSION_DATA;
    return SESSION_DATA_MAP[activeSessionId] || EMPTY_SESSION_DATA;
  }, [activeSessionId]);

  const messages = localMessages[activeSessionId || ''] ?? sessionData.messages;
  const hasMessages = messages.length > 0;
  const activeSession = sessions.find(s => s.id === activeSessionId);
  // 群聊 id 集合 — 树形组头点击时区分「专家」与「项目组」。
  const groupIdSet = useMemo(() => new Set(MOCK_GROUPS.map(g => g.id)), []);
  // 「筛选」菜单（创建专家行右侧）的展示/排序状态，选择持久化到 localStorage。
  // 专家 = 专家为组头、其下挂话题的树形（默认，对应真实 V2 形态）；
  // 话题 = 全部 session 平铺；工作目录 = 话题按所属专家的 workDir 分组。
  const [railDisplay, setRailDisplayState] = useState<'topics' | 'experts' | 'workdir'>(() => {
    try {
      const v = localStorage.getItem('cherry-agent-rail-display');
      return v === 'topics' || v === 'workdir' ? v : 'experts';
    } catch { return 'experts'; }
  });
  const setRailDisplay = useCallback((v: 'topics' | 'experts' | 'workdir') => {
    setRailDisplayState(v);
    try { localStorage.setItem('cherry-agent-rail-display', v); } catch { /* 隐私模式下不持久化 */ }
  }, []);
  const [railSort, setRailSortState] = useState<'created' | 'updated' | 'manual'>(() => {
    try {
      const v = localStorage.getItem('cherry-agent-rail-sort');
      return v === 'created' || v === 'updated' ? v : 'manual';
    } catch { return 'manual'; }
  });
  const setRailSort = useCallback((v: 'created' | 'updated' | 'manual') => {
    setRailSortState(v);
    try { localStorage.setItem('cherry-agent-rail-sort', v); } catch { /* 同上 */ }
  }, []);
  // 手动排序的自定义顺序（拖拽产生），同样持久化。
  const [agentOrder, setAgentOrderState] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('cherry-agent-rail-agent-order') || '[]'); } catch { return []; }
  });
  const setAgentOrder = useCallback((ids: string[]) => {
    setAgentOrderState(ids);
    try { localStorage.setItem('cherry-agent-rail-agent-order', JSON.stringify(ids)); } catch { /* 同上 */ }
  }, []);
  const [topicOrder, setTopicOrderState] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('cherry-agent-rail-topic-order') || '[]'); } catch { return []; }
  });
  const setTopicOrder = useCallback((ids: string[]) => {
    setTopicOrderState(ids);
    try { localStorage.setItem('cherry-agent-rail-topic-order', JSON.stringify(ids)); } catch { /* 同上 */ }
  }, []);

  // 按存储的手动顺序重排；未登记的条目保持原相对位置排在其后。
  const applyOrder = useCallback(<T extends { id: string }>(list: T[], order: string[]): T[] => {
    if (order.length === 0) return list;
    const pos = new Map(order.map((id, i) => [id, i]));
    return list
      .map((it, i) => [it, pos.has(it.id) ? (pos.get(it.id) as number) : order.length + i] as const)
      .sort((a, b) => a[1] - b[1])
      .map(([it]) => it);
  }, []);

  // ===== 组头「…」菜单的支撑状态（专家图标模式 / 删除专家 / 目录重命名与删除） =====
  const [expertIconModes, setExpertIconModes] = useState<Record<string, 'emoji' | 'model' | 'none'>>(() => {
    try { return JSON.parse(localStorage.getItem('cherry-agent-rail-icon-modes') || '{}'); } catch { return {}; }
  });
  const setExpertIconMode = useCallback((key: string, mode: 'emoji' | 'model' | 'none') => {
    setExpertIconModes(prev => {
      const next = { ...prev, [key]: mode };
      try { localStorage.setItem('cherry-agent-rail-icon-modes', JSON.stringify(next)); } catch { /* 忽略 */ }
      return next;
    });
  }, []);
  const [hiddenAgents, setHiddenAgents] = useState<Set<string>>(() => new Set());
  const [dirRenames, setDirRenames] = useState<Record<string, string>>({});
  const [deletedDirs, setDeletedDirs] = useState<Set<string>>(() => new Set());
  const [renameDirTarget, setRenameDirTarget] = useState<string | null>(null);
  const [renameDirValue, setRenameDirValue] = useState('');

  // 专家顺序独立于「排序方式」：始终跟随用户拖拽的手动顺序（拖动专家时
  // 其下任务整组随之移动）。「排序方式」只作用于任务列表。
  const orderedAgents = useMemo(
    () => applyOrder(AVAILABLE_AGENTS.filter(a => !hiddenAgents.has(a.id)), agentOrder),
    [agentOrder, applyOrder, hiddenAgents],
  );
  const orderedSessions = useMemo(() => {
    // 归档的任务不进左栏（历史任务页仍可见）。
    const visible = sessions.filter(s => !s.archived);
    const base = railSort === 'manual'
      ? applyOrder(visible, topicOrder)
      : visible; // 创建/更新时间：mock 时间戳为人读文案，保持默认序（已按最近排列）
    // 置顶任务冒泡到最前（树形视图下即各自分组内的最前），相对顺序不变。
    return [...base.filter(s => s.pinned), ...base.filter(s => !s.pinned)];
  }, [sessions, railSort, topicOrder, applyOrder]);

  const unpinnedSessions = useMemo(() => orderedSessions.filter(s => !s.pinned), [orderedSessions]);
  // 任务行一律纯文字（Codex 式）——不带 emoji，归属信息由段/分组表达。
  // 行右缘状态指示：进行中=转圈；待确认=橘点；失败=红点；已完成只在
  // 未查看时亮绿点（看过即消失，避免满屏绿点）。
  const rowStatusOf = (s: AgentSession): EntityRailItem['status'] =>
    s.status === 'active' ? 'running'
    : (s.status === 'awaiting' || s.status === 'paused') ? 'awaiting'
    : s.status === 'error' ? 'error'
    : (s.status === 'completed' && s.unread) ? 'done'
    : undefined;
  const sessionToRow = (s: AgentSession): EntityRailItem => ({ id: s.id, name: s.title, avatar: '', status: rowStatusOf(s) });
  // 段折叠时段头状态点：红（有失败）> 橘（有待确认）> 绿（有已完成未查看）。
  const sectionDotOf = (list: AgentSession[]): EntityRailSection['dot'] =>
    list.some(s => s.status === 'error') ? 'red'
    : list.some(s => s.status === 'awaiting' || s.status === 'paused') ? 'amber'
    : list.some(s => s.status === 'completed' && s.unread) ? 'emerald'
    : undefined;
  // 任务列表视图「任务」段的行（置顶的在置顶段，不重复）。
  const topicRailItems = useMemo<EntityRailItem[]>(
    () => unpinnedSessions.map(sessionToRow),
    [unpinnedSessions],
  );
  const sessionToChildRow = sessionToRow;
  // 「置顶」段：三种视图共用；段内不可拖。
  const pinnedRailItems = useMemo<EntityRailItem[]>(
    () => orderedSessions.filter(s => s.pinned).map(sessionToRow),
    [orderedSessions],
  );
  // 专家树形视图：专家组头 + 其话题子行；WORK_PLUS 下群聊作为无子级的组头
  // 混入（未读的置顶）。
  const expertTreeGroups = useMemo<EntityRailTreeGroup[]>(() => {
    const agentGroups: EntityRailTreeGroup[] = orderedAgents.map(a => ({
      key: a.id, name: a.name, avatar: a.avatar,
      children: unpinnedSessions.filter(s => s.agentName === a.name).map(sessionToChildRow),
    }));
    if (!WORK_PLUS) return agentGroups;
    const groupHeaders: EntityRailTreeGroup[] = MOCK_GROUPS.map(g => ({
      key: g.id, name: g.name, avatar: g.avatarEmoji ?? '💬', unread: g.unread, children: [],
    }));
    const unreadGroups = groupHeaders.filter(g => (g.unread ?? 0) > 0);
    const restGroups = groupHeaders.filter(g => !((g.unread ?? 0) > 0));
    return [...unreadGroups, ...agentGroups, ...restGroups];
  }, [orderedAgents, unpinnedSessions]);
  // 工作目录视图「项目」段：每个 workDir 一个文件夹组（组名只取末级文件夹
  // 名，完整路径进 tooltip）；无工作目录的散任务归入「任务」段。
  // 删除的目录其任务落回「任务」段；重命名只改显示名（完整路径仍在 tooltip）。
  const effectiveDirOf = useCallback((s: AgentSession) => {
    const dir = AVAILABLE_AGENTS.find(a => a.name === s.agentName)?.workDir;
    return dir && !deletedDirs.has(dir) ? dir : undefined;
  }, [deletedDirs]);
  const workdirTreeGroups = useMemo<EntityRailTreeGroup[]>(() => {
    const map = new Map<string, AgentSession[]>();
    unpinnedSessions.forEach(s => {
      const dir = effectiveDirOf(s);
      if (!dir) return;
      map.set(dir, [...(map.get(dir) ?? []), s]);
    });
    return Array.from(map.entries()).map(([dir, list]) => ({
      key: dir,
      name: dirRenames[dir] ?? (dir.split('/').filter(Boolean).pop() ?? dir),
      title: dir,
      selectable: false,
      variant: 'folder' as const,
      children: list.map(sessionToChildRow),
    }));
  }, [unpinnedSessions, effectiveDirOf, dirRenames]);
  const looseTaskItems = useMemo<EntityRailItem[]>(() => unpinnedSessions
    .filter(s => !effectiveDirOf(s))
    .map(sessionToRow), [unpinnedSessions, effectiveDirOf]);

  // ===== Codex 式三段结构：置顶 / 任务 / 专家 | 项目（按视图组合） =====
  const railSections = useMemo<EntityRailSection[]>(() => {
    const pinnedSection: EntityRailSection = {
      key: 'pinned', label: '置顶', items: pinnedRailItems, rowsDraggable: false, limitRows: false,
      dot: sectionDotOf(orderedSessions.filter(s => s.pinned)),
    };
    if (railDisplay === 'topics') {
      return [pinnedSection, {
        key: 'tasks', label: '任务', items: topicRailItems,
        dot: sectionDotOf(unpinnedSessions),
      }];
    }
    if (railDisplay === 'experts') {
      return [pinnedSection, {
        key: 'experts', label: '专家', groups: expertTreeGroups,
        dot: sectionDotOf(unpinnedSessions),
      }];
    }
    const looseIds = new Set(looseTaskItems.map(i => i.id));
    return [pinnedSection, {
      key: 'tasks', label: '任务', items: looseTaskItems,
      dot: sectionDotOf(unpinnedSessions.filter(s => looseIds.has(s.id))),
    }, {
      key: 'projects', label: '项目', groups: workdirTreeGroups,
      dot: sectionDotOf(unpinnedSessions.filter(s => !looseIds.has(s.id))),
    }];
  }, [railDisplay, pinnedRailItems, topicRailItems, expertTreeGroups, workdirTreeGroups, looseTaskItems, orderedSessions, unpinnedSessions]);

  // Sessions belong to the selected agent — switching agents changes the list.
  const agentSessions = useMemo(
    () => sessions.filter(s => s.agentName === selectedAgent.name),
    [sessions, selectedAgent],
  );

  // Sync session name to tab title
  useEffect(() => {
    if (onTabTitleChange) {
      onTabTitleChange(activeSession ? activeSession.title : '\u5de5\u4f5c');
    }
  }, [activeSession, onTabTitleChange]);

  // When the active session has no deliverables of its own, fall back to a
  // demo set so the file panel is never empty and the preview flow stays
  // explorable. Sessions with real outputs are untouched.
  const useDemoFiles = sessionData.outputFiles.length === 0;
  const panelOutputFiles = useDemoFiles ? DEMO_OUTPUT_FILES : sessionData.outputFiles;
  const panelFileContents = useDemoFiles ? DEMO_FILE_CONTENTS : sessionData.fileContents;
  const panelPreviewHtml = useDemoFiles
    ? (selectedFile ? DEMO_PREVIEWS[selectedFile] : undefined)
    : sessionData.previewHtml;

  const fileContent = selectedFile ? (panelFileContents[selectedFile] || null) : null;

  const handleSelectFile = useCallback((path: string) => {
    setSelectedFile(path);
    // Previewing a file fully replaces the folder list (no side-by-side),
    // so the reading area gets the full panel width.
    setShowExplorer(false);
  }, []);

  // Open an artifact in the right-side viewer (called from inline artifact card clicks)
  const handleOpenArtifact = useCallback((filePath: string) => {
    setSelectedFile(filePath);
    setDockTab('files');
    setShowExplorer(false);
  }, []);

  // Auto-open the artifact viewer when the current session has a previewHtml
  // (i.e. produced visible deliverable). Runs only when session changes.
  useEffect(() => {
    if (sessionData.previewHtml && dockTab === null) {
      setDockTab('files');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId]);

  // Maximize is artifact-only: drop it whenever the dock leaves the 文件 view
  // so switching back later doesn't re-enter fullscreen unexpectedly.
  useEffect(() => {
    if (dockTab !== 'files' && previewMaximized) setPreviewMaximized(false);
  }, [dockTab, previewMaximized]);

  const handleSelectSession = useCallback((id: string) => {
    setShowScheduledTasks(false);
    setShowTaskBoard(false);
    setShowHistoryManage(false);
    setSelectedGroupId(null);
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
    setShowScheduledTasks(false);
    setShowTaskBoard(false);
    setShowHistoryManage(false);
    setSelectedGroupId(null);
    setActiveSessionId(null);
    setDockTab(null);
    setPreviewMaximized(false);
    setShowExplorer(false);
    setSelectedFile(null);
  }, []);

  // Open a session from the task board: switch the rail to its owning agent,
  // make it active, and close the board — landing on its chat.
  const handleOpenSessionFromBoard = useCallback((session: AgentSession) => {
    const agent = AVAILABLE_AGENTS.find(a => a.name === session.agentName);
    if (agent) setSelectedAgent(agent);
    handleSelectSession(session.id);
  }, [handleSelectSession]);

  const handleNewSessionForAgent = useCallback((agentName: string) => {
    setShowScheduledTasks(false);
    setShowTaskBoard(false);
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
    setDockTab(null);
    setPreviewMaximized(false);
    setShowExplorer(false);
    setSelectedFile(null);
  }, []);

  // Fire a scheduled task once now: spin up a live session attached to the
  // task's agent (so it groups under that agent in the list), seed it with the
  // task prompt, then jump into it.
  const handleRunScheduledTask = useCallback((task: ScheduledTask) => {
    const agent = AVAILABLE_AGENTS.find(a => a.name === task.agentName);
    if (agent) setSelectedAgent(agent);
    const newId = `task-run-${Date.now()}`;
    const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const newSession: AgentSession = {
      id: newId,
      title: task.name,
      agentName: task.agentName,
      agentIcon: agent?.avatar ?? task.agentAvatar,
      lastMessage: task.prompt,
      timestamp: ts,
      messageCount: 1,
      status: 'active',
      kind: 'task',
      progress: 8,
      unread: true,
      group: task.runMode === 'channel' ? task.channel : undefined,
      scheduledTaskId: task.id,
      scheduledTaskName: task.name,
    };
    setSessions(prev => [newSession, ...prev]);
    setLocalMessages(prev => ({
      ...prev,
      [newId]: [{ id: `${newId}-u`, role: 'user', content: task.prompt, timestamp: ts }],
    }));
    setActiveSessionId(newId);
    setShowScheduledTasks(false);
    setDockTab(null);
    setPreviewMaximized(false);
    setShowExplorer(false);
    setSelectedFile(null);
    toast.success(`已启动「${task.name}」`, { description: `已在「${task.agentName}」下新建运行会话` });
  }, []);

  const { moveToBin: moveToRecycleBin, retentionDays: recycleRetentionDays } = useRecycleBin();
  const [pendingDeleteSession, setPendingDeleteSession] = useState<AgentSession | null>(null);

  const sendSessionToBin = useCallback((session: AgentSession) => {
    setSessions(prev => prev.filter(s => s.id !== session.id));
    if (activeSessionId === session.id) {
      setActiveSessionId(null);
      setDockTab(null);
      setPreviewMaximized(false);
      setShowExplorer(false);
    }
    moveToRecycleBin(
      {
        id: `bin-session-${session.id}-${Date.now()}`,
        type: 'session',
        name: session.title,
        icon: session.agentIcon ?? '▶️',
        meta: session.agentName,
        source: 'manual',
      },
      {
        onUndo: () => setSessions(prev => [session, ...prev]),
      },
    );
  }, [activeSessionId, moveToRecycleBin]);

  const handleDeleteSession = useCallback((id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    setPendingDeleteSession(session);
  }, [sessions]);

  const handleRenameGroup = useCallback((oldName: string, newName: string) => {
    setSessions(prev => prev.map(s =>
      (s.group || '任务') === oldName ? { ...s, group: newName } : s
    ));
  }, []);

  const handleUpdateSession = useCallback((id: string, updates: Partial<AgentSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  // ===== 任务行右键菜单（重命名/置顶/新标签页/新窗口/会话位置/删除） =====
  const [renameTarget, setRenameTarget] = useState<AgentSession | null>(null);
  const [renameValue, setRenameValue] = useState('');
  // 会话位置（左/右）— 仅专家列表视图的右键菜单提供入口，按会话记忆。
  const [sessionPositions, setSessionPositions] = useState<Record<string, 'left' | 'right'>>({});
  const sessionPositionApi = useMemo(() => ({
    get: (id: string): 'left' | 'right' => sessionPositions[id] ?? 'left',
    set: (id: string, pos: 'left' | 'right') => setSessionPositions(prev => ({ ...prev, [id]: pos })),
  }), [sessionPositions]);
  const taskContextMenu = useMemo(() => ({
    onRename: (id: string) => {
      const s = sessions.find(x => x.id === id);
      if (s) { setRenameTarget(s); setRenameValue(s.title); }
    },
    isPinned: (id: string) => !!sessions.find(x => x.id === id)?.pinned,
    onTogglePin: (id: string) => {
      const s = sessions.find(x => x.id === id);
      if (s) handleUpdateSession(id, { pinned: !s.pinned });
    },
    onArchive: (id: string) => handleUpdateSession(id, { archived: true }),
    // 原型行为：新标签页 = 应用内再开一个「工作」tab；新窗口 = 浏览器新窗口。
    onOpenInNewTab: (_id: string) => launchpadOpen('agent'),
    onOpenInNewWindow: (_id: string) => { window.open(window.location.href, '_blank', 'width=1280,height=800'); },
    onDelete: (id: string) => handleDeleteSession(id),
  }), [sessions, handleUpdateSession, handleDeleteSession, launchpadOpen]);

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

    const addMsg = (msg: AgentChatMessage) => {
      setLocalMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] ?? sessionData.messages), msg],
      }));
    };

    if (!localMessages[key] && !SESSION_DATA_MAP[key]) {
      setLocalMessages(prev => ({ ...prev, [key]: [] }));
    }

    const userMsg: AgentChatMessage = { id: `m${Date.now()}`, role: 'user', content: text, timestamp: ts };
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

  // Model picker — moved out of the page header into the composer toolbar.
  // The agent identity is already established by the surrounding Agent run
  // page, so the in-composer AgentPicker is redundant and was removed.
  const composerHeaderControls = (
    <>
      <Popover open={showModelPicker} onOpenChange={setShowModelPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="inline"
            className={`gap-1 px-1.5 py-[3px] text-xs ${
            showModelPicker
              ? 'bg-accent/25 text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
          }`}>
            <span>{selectedModel.name}</span>
            <ChevronDown size={7} className={`text-muted-foreground/50 transition-transform duration-100 ${showModelPicker ? 'rotate-180' : ''}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" side="top" className="p-0 w-[420px]">
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
      <div className="w-px h-3.5 bg-border/30 mx-0.5" />
    </>
  );

  // 会话 / 状态 / 文件 view switcher — Syncless-style icon toggles docked at the
  // panel's TOP-RIGHT. Clicking an icon selects it (highlighted) and shows that
  // view's list/content directly below it in the SAME panel; the others stay in
  // their resting state. This is the single entry point for all three views —
  // there is no separate session-list panel elsewhere.
  const dockTabs = (
    <div className="flex items-center gap-0.5">
      {([
        { id: 'sessions', label: '会话', Icon: History },
        { id: 'status', label: '状态', Icon: ListChecks },
        { id: 'files', label: '文件', Icon: FileText },
      ] as const).map(({ id, label, Icon }) => {
        const active = dockTab === id;
        return (
          <Tooltip key={id} content={label} side="bottom">
            <button
              type="button"
              onClick={() => setDockTab(id)}
              className={`p-1.5 rounded-md transition-colors ${
                active ? 'bg-accent/70 text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <Icon size={13} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );

  // 会话 list — a minimal, narrow dock: just the close button at the top-right;
  // the flat list shows directly below (no group headers, no per-row icon,
  // pinned rows flagged with a pin glyph on the right). Selecting a session
  // keeps the panel open.
  const renderSessionList = () => (
    <HistorySidebar
      items={agentSessions}
      activeItemId={activeSessionId}
      onSelectItem={(id) => handleSelectSession(id)}
      onDeleteItem={handleDeleteSession}
      onUpdateItem={handleUpdateSession}
      onNewItem={() => handleNewSessionForAgent(selectedAgent.name)}
      onExpand={() => { historySidebar.expand(); setDockTab(null); }}
      onClose={() => setDockTab(null)}
      entityLabel="会话"
      showStatusDot
      hideGroupBy
      plainList
      headerActions={
        <Tooltip content="关闭" side="bottom">
          <Button variant="ghost" size="icon-xs" onClick={() => setDockTab(null)}
            className="text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
            <X size={11} />
          </Button>
        </Tooltip>
      }
    />
  );

  // Extract header into reusable JSX so it can render in both normal and maximized layouts
  const headerJSX = (
    <header className="flex items-center justify-between px-3 border-b border-transparent flex-shrink-0 h-[40px]">
      <div className="flex items-center gap-1.5">
        {onBack && (
          <Button variant="ghost" size="icon-xs" onClick={onBack}
            className="p-1.5 w-auto h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50">
            <ArrowLeft className="size-[18px]" strokeWidth={1.6} />
          </Button>
        )}

        {/* Agent list rail toggle */}
        <Tooltip content={historySidebar.isCompact ? '收起 Agent 列表' : '展开 Agent 列表'} side="bottom">
          <Button variant="ghost" size="icon-xs" onClick={() => historySidebar.toggle()}
            className={`p-1.5 w-auto h-auto mr-0.5 ${historySidebar.isCompact ? 'text-muted-foreground hover:text-foreground hover:bg-accent/40' : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/40'}`}>
            {historySidebar.isCompact ? <PanelLeftClose className="size-[18px]" strokeWidth={1.6} /> : <PanelLeftOpen className="size-[18px]" strokeWidth={1.6} />}
          </Button>
        </Tooltip>

      </div>

      <div className="flex items-center gap-0.5">
        {/* Sessions for the selected agent — opens the right dock to the 会话
            view (the dock's own top-right switcher handles 会话/状态/文件). */}
        <Tooltip content="会话" side="bottom">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setDockTab(dockTab === 'sessions' ? null : 'sessions')}
            className={`p-1.5 w-auto h-auto ${
              dockTab === 'sessions' ? 'bg-accent/25 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
          >
            <History className="size-[18px]" strokeWidth={1.6} />
          </Button>
        </Tooltip>
        <div className="w-px h-3.5 bg-border/30 mx-0.5" />

        {/* "保存为 Skill" is no longer a chrome button — the in-chat
            SaveAsSkillCallout (rendered above the composer) drives
            discovery now. This slot only shows the create_skill job
            chip when a background packaging job is in flight, so the
            user can click in to inspect progress. */}
        {activeSkillJob && (
          <>
            <SkillJobStatusChip />
            <Separator orientation="vertical" opacity={30} className="!h-3.5 mx-0.5" />
          </>
        )}

        {/* Plan toggle — only when there are workflow steps. Opens floating card. */}
        {sessionData.steps.length > 0 && (
          <Popover open={showPlan} onOpenChange={setShowPlan}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-xs"
                className={`relative p-1.5 w-auto h-auto ${showPlan ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}>
                <ListChecks className="size-[18px]" strokeWidth={1.6} />
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

        {/* Preview panel toggle — 常驻在内容区头部最右缘（Claude 式）。面板展开时
            按钮留在原位（此时紧贴面板左侧），再点即收起，不会消失或移进面板。 */}
        <div className="flex items-center gap-0.5">
          <div className="w-px h-3.5 bg-border/30 mx-0.5" />
          <Tooltip content={showPreview ? '收起预览面板' : '显示预览面板'} side="bottom"><Button variant="ghost" size="icon-xs"
            onClick={() => {
              if (showPreview) { setDockTab(null); setPreviewMaximized(false); }
              else { setDockTab('files'); setShowExplorer(true); }
            }}
            className={`p-1.5 w-auto h-auto ${showPreview ? 'text-foreground bg-accent/25' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'}`}>
            <PanelRightInsetIcon size={18} className="size-[18px]" />
          </Button></Tooltip>
        </div>
      </div>
    </header>
  );

  // Maximized layout: header on top, artifact full width, compact input at bottom
  if (isMaximized) {
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
          {/* Folder list and preview are mutually exclusive — opening a file
              covers the folder so reading gets the full width. */}
          {showExplorer ? (
            <div className="flex-1 min-w-0 overflow-hidden">
              <FileExplorer
                files={sessionData.files.length > 0 ? sessionData.files : DEFAULT_INITIAL_FILES}
                outputFiles={panelOutputFiles}
                selectedFile={selectedFile}
                onSelectFile={handleSelectFile}
              />
            </div>
          ) : (
            <div className="flex-1 min-w-0 overflow-hidden">
              <ArtifactViewer
                fileContent={fileContent}
                fileName={selectedFile}
                previewUrl={null}
                hasArtifact={!!panelPreviewHtml || !!fileContent}
                previewHtml={panelPreviewHtml}
                showExplorer={showExplorer}
                onToggleExplorer={() => setShowExplorer(!showExplorer)}
                showPreview={showPreview}
                onTogglePreview={() => { setDockTab(null); setPreviewMaximized(false); }}
                maximized={previewMaximized}
                onToggleMaximize={() => setPreviewMaximized(!previewMaximized)}
              />
            </div>
          )}
        </motion.div>

        {/* Compact input bar at the bottom */}
        <CompactInputBar onSendMessage={handleSendMessage} agentName={selectedAgent.name} headerControls={composerHeaderControls} onNewSession={handleNewSession} />

        {/* Agent configuration dialog — same modal used in LibraryPage. */}
        <ResourceConfigDialog
          resource={showAgentInfo ? agentToResource(selectedAgent) : null}
          onOpenChange={(open) => { if (!open) setShowAgentInfo(false); }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background select-none relative">
      {/* ===== Left: History Sidebar (compact) — auto-hides when artifact maximized ===== */}
      <AnimatePresence initial={false}>
        {historySidebar.isCompact && !isMaximized && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 min-w-0 overflow-hidden h-full border-r border-border/40 bg-foreground/[0.015]"
            style={{ width: 220 }}
          >
            <EntityRail
              title="对话"
              searchable={false}
              filterable={false}
              newLabel={railDisplay === 'experts' ? '创建专家' : '新建任务'}
              newAsRow
              newActions={railDisplay === 'experts' ? [
                { id: 'agent', label: '创建专家', icon: Bot, onClick: () => setShowCreateAgent(true) },
                ...(WORK_PLUS ? [{ id: 'group', label: '创建项目组', icon: Users2, onClick: () => setNewGroupOpen(true) }] : []),
              ] : [
                { id: 'topic', label: '新建任务', icon: MessageSquarePlus, onClick: handleNewSession },
              ]}
              railMenu={{
                displayModes: {
                  options: [
                    { id: 'topics', label: '任务列表' },
                    { id: 'experts', label: '专家列表' },
                    { id: 'workdir', label: '工作目录' },
                  ],
                  value: railDisplay,
                  onChange: (id) => setRailDisplay(id as 'topics' | 'experts' | 'workdir'),
                },
                sortModes: {
                  options: [
                    { id: 'created', label: '创建时间' },
                    { id: 'updated', label: '更新时间' },
                    { id: 'manual', label: '手动排序' },
                  ],
                  value: railSort,
                  onChange: (id) => setRailSort(id as 'created' | 'updated' | 'manual'),
                },
                expandCollapse: true,
                actions: [
                  { id: 'history', label: '历史任务', onClick: openHistoryManage },
                ],
              }}
              sections={railSections}
              persistKey="agent-work"
              activeGroupKey={railDisplay === 'experts' && !showScheduledTasks && !showTaskBoard && !showHistoryManage
                ? (selectedGroupId ?? selectedAgent.id)
                : null}
              onGroupSelect={(key) => {
                // 群聊组头 → 打开群聊；专家组头 → 切换当前专家。
                if (groupIdSet.has(key)) { openGroup(key); return; }
                const agent = AVAILABLE_AGENTS.find(a => a.id === key);
                if (agent) {
                  setShowScheduledTasks(false); setShowTaskBoard(false); setShowHistoryManage(false);
                  setSelectedGroupId(null);
                  setSelectedAgent(agent);
                }
              }}
              onReorderGroups={railDisplay === 'experts' ? setAgentOrder : undefined}
              onReorderItems={(ids) => {
                // 任务任何时候都可拖；拖动即隐式切到「手动排序」（Codex 式），
                // 拖出的顺序以当前显示顺序为基准记录。
                setTopicOrder(ids);
                if (railSort !== 'manual') setRailSort('manual');
              }}
              rowContextMenu={{
                ...taskContextMenu,
                // 「会话位置」子菜单只在专家列表视图出现。
                position: railDisplay === 'experts' ? sessionPositionApi : undefined,
              }}
              groupHoverMenu={{
                // 新会话：专家组 = 挂到该专家；文件夹组 = 挂到该目录下的专家。
                onNewSession: (key) => {
                  const agent = railDisplay === 'experts'
                    ? AVAILABLE_AGENTS.find(a => a.id === key)
                    : AVAILABLE_AGENTS.find(a => a.workDir === key);
                  if (agent) handleNewSessionForAgent(agent.name);
                  else handleNewSession();
                },
                expert: {
                  onEdit: (key) => {
                    const a = AVAILABLE_AGENTS.find(x => x.id === key);
                    if (a) { setSelectedAgent(a); setShowAgentInfo(true); }
                  },
                  onPinTop: (key) => setAgentOrder([key, ...orderedAgents.map(a => a.id).filter(id => id !== key)]),
                  iconMode: {
                    get: (key) => expertIconModes[key] ?? 'emoji',
                    set: setExpertIconMode,
                  },
                  onDelete: (key) => setHiddenAgents(prev => new Set(prev).add(key)),
                },
                folder: {
                  // 原型：访达打开是桌面端行为，浏览器内不做实际动作。
                  onOpenInFinder: () => {},
                  onRename: (key) => {
                    setRenameDirTarget(key);
                    setRenameDirValue(dirRenames[key] ?? (key.split('/').filter(Boolean).pop() ?? key));
                  },
                  onDelete: (key) => setDeletedDirs(prev => new Set(prev).add(key)),
                },
              }}
              navEntries={WORK_PLUS ? [{
                id: 'task-board',
                label: '任务管理',
                icon: ListChecks,
                count: sessions.length,
                active: showTaskBoard,
                onClick: openTaskBoard,
              }, {
                id: 'scheduled-tasks',
                label: '自动化',
                icon: Clock,
                count: MOCK_SCHEDULED_TASKS.length,
                active: showScheduledTasks,
                onClick: () => openScheduledTasks(null),
              }] : undefined}
              items={[]}
              activeId={showScheduledTasks || showTaskBoard || showHistoryManage ? null : activeSessionId}
              onSelect={(id) => {
                // 所有行都是话题（session）— 树形子行与平铺行一致，直接打开。
                const session = sessions.find(s => s.id === id);
                if (session) handleOpenSessionFromBoard(session);
              }}
              onEdit={(id) => { const agent = AVAILABLE_AGENTS.find(a => a.id === id); if (agent) { setSelectedAgent(agent); setShowAgentInfo(true); } }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Right: Header + Content ===== */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
        {selectedGroup ? (
          <GroupChatPane key={selectedGroup.id} group={selectedGroup} />
        ) : showHistoryManage ? (
          <HistoryManagePage
            sessions={sessions}
            onBack={() => setShowHistoryManage(false)}
            onOpenSession={handleOpenSessionFromBoard}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
          />
        ) : showTaskBoard ? (
          <TaskBoardPage sessions={sessions} onOpenSession={handleOpenSessionFromBoard} />
        ) : showScheduledTasks ? (
          <ScheduledTasksPage onRunTask={handleRunScheduledTask} initialDetailId={scheduledDetailId} />
        ) : (
        <>
        {headerJSX}

      {/* ===== "来自定时任务" return bar — only on sessions spawned by a run ===== */}
      {activeSession?.scheduledTaskId && (
        <div className="px-3 pt-2 pb-0.5 flex-shrink-0">
          <button
            onClick={() => openScheduledTasks(activeSession.scheduledTaskId ?? null)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-accent/40 transition-colors text-left group"
          >
            <Clock size={14} className="text-muted-foreground/60 flex-shrink-0" />
            <span className="text-sm text-foreground/80 flex-1 truncate">
              来自自动化
              {activeSession.scheduledTaskName ? <span className="text-muted-foreground/50"> · {activeSession.scheduledTaskName}</span> : null}
            </span>
            <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
          </button>
        </div>
      )}

      {/* ===== Main Content (chat panel only — artifact moved out) ===== */}
      <div className="flex flex-1 min-h-0 pl-2 min-w-0">
        <div className="min-h-0 h-full flex-1 min-w-0">
          {!hasMessages ? (
            <NewSessionEmpty onSendMessage={handleSendMessage} agentName={selectedAgent.name} headerControls={composerHeaderControls} onNewSession={handleNewSession} />
          ) : (
            <ChatPanel
              messages={messages}
              steps={sessionData.steps}
              onSendMessage={handleSendMessage}
              onResolveUI={handleResolveUI}
              onAvatarClick={() => setShowAgentInfo(true)}
              onOpenArtifact={handleOpenArtifact}
              headerControls={composerHeaderControls}
              onNewSession={handleNewSession}
              taskCompleteCallout={(() => {
                // Show only after a workflow run actually finished or the
                // user racked up a meaningful conversation, and only
                // once per session (dismissed sticks for the session).
                const sid = activeSessionId || '';
                if (!sid || skillCalloutDismissed.has(sid)) return null;
                if (activeSkillJob) return null;
                const userMsgCount = messages.filter(m => m.role === 'user').length;
                const hasDoneSteps = sessionData.steps.length > 0
                  && sessionData.steps.every(s => s.status === 'done');
                const enoughChat = sessionData.steps.length === 0 && userMsgCount >= 3;
                if (!hasDoneSteps && !enoughChat) return null;
                // Hint summary — first user turn keeps the callout grounded.
                const firstUser = messages.find(m => m.role === 'user');
                const taskSummary = firstUser?.content
                  ? firstUser.content.slice(0, 28).replace(/\s+/g, ' ').trim()
                  : undefined;
                return (
                  <SaveAsSkillCallout
                    taskSummary={taskSummary}
                    onSave={() => {
                      setSkillCalloutDismissed(prev => new Set(prev).add(sid));
                      setShowSaveAsSkill(true);
                    }}
                    onDismiss={() => setSkillCalloutDismissed(prev => new Set(prev).add(sid))}
                  />
                );
              })()}
            />
          )}
        </div>
      </div>
        </>
        )}
      </div>

      {/* ===== Shared right dock — 会话 (session list) / 文件 (artifact browser)
          / 状态 (run status), switchable by tab, docked to the far-right edge
          with a divider. Mirrors the real Cherry Studio agent dock. ===== */}
      <AnimatePresence initial={false}>
        {dockTab !== null && !isMaximized && (() => {
          // The 会话 list and the 文件 folder-list are compact, fixed-width rails;
          // only the 状态 panel and the file *preview* keep the wide, resizable width.
          const isSessions = dockTab === 'sessions';
          const isFolderList = dockTab === 'files' && showExplorer;
          const isNarrowRail = isSessions || isFolderList;
          const effectiveWidth = isNarrowRail ? 260 : dockWidth;
          return (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: effectiveWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 min-w-0 relative flex"
            style={{ width: effectiveWidth }}
          >
            {/* Resize handle — doubles as the persistent divider line. The
                fixed-width rails (会话 / 文件列表) only show the divider (no drag). */}
            <div
              onMouseDown={isNarrowRail ? undefined : handleDockResizeStart}
              className={`w-[7px] flex-shrink-0 group flex items-stretch justify-center relative z-10 ${isNarrowRail ? '' : 'cursor-col-resize'}`}
            >
              <div className="w-px bg-border/40 group-hover:bg-border/70 group-active:bg-foreground/30 transition-colors" />
            </div>
            {/* Panel content — flush, separated only by the divider */}
            <div className="flex-1 min-w-0 bg-background overflow-hidden flex flex-col">
              {dockTab === 'sessions' ? (
                renderSessionList()
              ) : dockTab === 'status' ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-end gap-1 px-2.5 flex-shrink-0 h-[36px] border-b border-border/30">
                    {dockTabs}
                    <div className="w-px h-3.5 bg-border/30 mx-0.5" />
                    <Tooltip content="关闭" side="bottom"><Button variant="ghost" size="icon-xs" onClick={() => setDockTab(null)}
                      className="text-muted-foreground/40 hover:text-foreground hover:bg-accent/40">
                      <X size={11} />
                    </Button></Tooltip>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto py-1">
                    {sessionData.steps.length > 0 ? (
                      <WorkflowPanel steps={sessionData.steps} inline />
                    ) : (
                      <EmptyState icon={ListChecks} title="暂无运行状态" description="智能体开始执行任务后，运行步骤与状态会显示在这里。" compact />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full min-w-0">
                  {/* 面板的开关常驻在左侧内容区头部右缘（Claude 式），面板内不再
                      放关闭钮；头部行只显示「文件」标题。 */}
                  {showExplorer && (
                    <div className="flex items-center px-3.5 flex-shrink-0 h-[36px] border-b border-border/30">
                      <span className="text-xs text-foreground">文件</span>
                    </div>
                  )}
                  <div className="flex flex-1 min-h-0 min-w-0">
                    {/* Folder list and preview are mutually exclusive — opening a
                        file covers the folder so reading gets the full width. */}
                    {showExplorer ? (
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <FileExplorer
                          files={sessionData.files.length > 0 ? sessionData.files : DEFAULT_INITIAL_FILES}
                          outputFiles={panelOutputFiles}
                          selectedFile={selectedFile}
                          onSelectFile={handleSelectFile}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <ArtifactViewer
                          fileContent={fileContent}
                          fileName={selectedFile}
                          previewUrl={null}
                          hasArtifact={!!panelPreviewHtml || !!fileContent}
                          previewHtml={panelPreviewHtml}
                          showExplorer={showExplorer}
                          onToggleExplorer={() => setShowExplorer(!showExplorer)}
                          showPreview={showPreview}
                          // Closing a previewed file returns to the folder list
                          // rather than dismissing the whole dock.
                          onTogglePreview={() => { setShowExplorer(true); setPreviewMaximized(false); }}
                          maximized={previewMaximized}
                          onToggleMaximize={() => setPreviewMaximized(!previewMaximized)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
                </div>
          </motion.div>
          );
        })()}
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

      {/* ===== Agent configuration dialog ===== */}
      <ResourceConfigDialog
        resource={showAgentInfo ? agentToResource(selectedAgent) : null}
        onOpenChange={(open) => { if (!open) setShowAgentInfo(false); }}
      />

      {/* ===== Create Agent Onboarding ===== */}
      <CreateAgentWizard
        open={showCreateAgent}
        onOpenChange={setShowCreateAgent}
      />

      {/* ===== Create 项目组 (群聊) — picks members from teammates + my Agents ===== */}
      <NewGroupDialog
        open={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
        onManageTeammates={() => { setNewGroupOpen(false); onOpenSettings('teammates'); }}
      />

      {/* ===== 任务重命名（右键菜单） ===== */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
        <DialogContent className="w-[360px] p-5">
          <div className="text-sm font-medium mb-3">重命名任务</div>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renameTarget && renameValue.trim()) {
                handleUpdateSession(renameTarget.id, { title: renameValue.trim() });
                setRenameTarget(null);
              }
            }}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setRenameTarget(null)}>取消</Button>
            <Button
              size="sm"
              disabled={!renameValue.trim()}
              onClick={() => {
                if (renameTarget && renameValue.trim()) {
                  handleUpdateSession(renameTarget.id, { title: renameValue.trim() });
                  setRenameTarget(null);
                }
              }}
            >
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== 工作目录重命名（组头 … 菜单） ===== */}
      <Dialog open={!!renameDirTarget} onOpenChange={(open) => { if (!open) setRenameDirTarget(null); }}>
        <DialogContent className="w-[360px] p-5">
          <div className="text-sm font-medium mb-3">重命名工作目录</div>
          <Input
            value={renameDirValue}
            onChange={(e) => setRenameDirValue(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renameDirTarget && renameDirValue.trim()) {
                setDirRenames(prev => ({ ...prev, [renameDirTarget]: renameDirValue.trim() }));
                setRenameDirTarget(null);
              }
            }}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setRenameDirTarget(null)}>取消</Button>
            <Button
              size="sm"
              disabled={!renameDirValue.trim()}
              onClick={() => {
                if (renameDirTarget && renameDirValue.trim()) {
                  setDirRenames(prev => ({ ...prev, [renameDirTarget]: renameDirValue.trim() }));
                  setRenameDirTarget(null);
                }
              }}
            >
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Recycle Bin: delete-session confirmation ===== */}
      <RecycleBinConfirmDialog
        open={!!pendingDeleteSession}
        onOpenChange={(open) => { if (!open) setPendingDeleteSession(null); }}
        retentionDays={recycleRetentionDays}
        onConfirm={() => {
          if (pendingDeleteSession) sendSessionToBin(pendingDeleteSession);
        }}
      />

      {/* ===== Save current conversation as Skill ===== */}
      <SaveAsSkillDialog
        open={showSaveAsSkill}
        onOpenChange={setShowSaveAsSkill}
        agent={selectedAgent}
        messages={messages}
      />
    </div>
  );
}
