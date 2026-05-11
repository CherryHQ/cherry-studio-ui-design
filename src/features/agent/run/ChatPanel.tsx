import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, Paperclip, Code2, FolderOpen, Folder, FolderPlus, FolderX, FileText, AtSign,
  Globe, Hammer, Brain, MoreHorizontal,
  Maximize2, RotateCcw, RefreshCw, ChevronDown,
  TerminalSquare, Zap, Lightbulb,
  ArrowUp, Languages, Check, Hand, ShieldAlert, Pencil, Compass,
} from 'lucide-react';
import {
  Button, Textarea,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
  Popover, PopoverTrigger, PopoverContent, BrandLogo, SearchInput,
} from '@cherry-studio/ui';
import { MessageList } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import { UserMessage, AgentMessageGroup, useGroupedMessages } from './AgentMessageRenderer';
import { WorkflowPanel } from './WorkflowPanel';
import { GenUIOverlay } from './GenerativeUI';
import { AnimatePresence, motion } from 'motion/react';
import type { AgentChatMessage } from '@/app/types/agent';
import type { WorkflowStep } from '@/app/types/chat';

// ===========================
// Plus menu items
// ===========================
const PLUS_MENU_ITEMS = [
  { id: 'attach', label: '添加图片或附件', icon: Paperclip, separator: true },
  { id: 'code', label: '代码', icon: Code2 },
  { id: 'folder', label: '添加文件夹', icon: FolderOpen },
  { id: 'websearch', label: '网络搜索', icon: Globe },
  { id: 'mcp', label: 'MCP', icon: Hammer },
  { id: 'reasoning', label: '推理', icon: Brain },
];

const PLUS_MENU_SECONDARY = [
  { id: 'expand', label: '展开输入框', icon: Maximize2, shortcut: '⌘⇧E' },
  { id: 'clearctx', label: '清除上下文', icon: RotateCcw, shortcut: '⌘K' },
];

// ===========================
// Permission Mode Config — Cherry Studio Agent (4 modes)
// ===========================
const PERMISSION_MODES: { id: string; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> }[] = [
  { id: 'default', label: '默认权限', desc: '编辑或执行命令前会询问', icon: Hand },
  { id: 'plan', label: '计划模式', desc: '只读规划，不编辑文件、不执行命令', icon: Compass },
  { id: 'auto-edit', label: '自动编辑', desc: '自动读写文件，执行命令前询问', icon: Pencil },
  { id: 'bypass', label: '完全访问', desc: '可执行任何操作，请谨慎使用', icon: RefreshCw },
];

// ===========================
// Project / WorkDir Config
// ===========================
const PROJECTS: { id: string; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'new', label: 'New project' },
];

// ===========================
// Slash Commands
// ===========================
const SLASH_COMMANDS = [
  { id: 'clear', label: '/clear', desc: 'Clear conversation history' },
  { id: 'compact', label: '/compact', desc: 'Compact conversation with optional focus instructions' },
  { id: 'context', label: '/context', desc: 'Visualize current context usage as a colored grid' },
  { id: 'cost', label: '/cost', desc: 'Show token usage statistics (see cost tracking guide for subscription-specific details)' },
  { id: 'todos', label: '/todos', desc: 'List current todo items' },
];

// ===========================
// Quick Phrases
// ===========================
const QUICK_PHRASES = [
  { id: 'init', label: 'initial instructions', desc: '不要使用任何工具，输出你的内部信息${name}' },
];

// ===========================
// @ Mentions — files, agents, MCP tools
// ===========================
const MENTION_ITEMS: { id: string; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'file-app', label: 'src/App.tsx', desc: '文件', icon: FileText },
  { id: 'file-readme', label: 'README.md', desc: '文件', icon: FileText },
  { id: 'folder-comp', label: 'src/components/', desc: '文件夹', icon: Folder },
  { id: 'mcp-fs', label: 'filesystem', desc: 'MCP', icon: Hammer },
  { id: 'mcp-search', label: 'web-search', desc: 'MCP', icon: Globe },
];

// ===========================
// Thinking Chain Modes
// ===========================
const THINKING_MODES: { id: string; label: string; desc: string; icon: typeof Lightbulb }[] = [
  { id: 'default', label: '默认', desc: '依赖模型默认行为，不作任何配置', icon: Lightbulb },
  { id: 'off', label: '关闭', desc: '禁用推理', icon: Lightbulb },
  { id: 'auto', label: '自动', desc: '灵活决定推理力度', icon: Lightbulb },
];

// ===========================
// Popup Card (shared component for all toolbar popovers)
// ===========================
function PopupCard({
  open,
  title,
  children,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 pb-2 z-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className="rounded-2xl border border-border/40 bg-background shadow-lg overflow-hidden"
      >
        <div className="p-1.5">
          {children}
        </div>
        <div className="flex items-center justify-between px-3.5 py-2 border-t border-border/15">
          <span className="text-xs text-muted-foreground/40">{title}</span>
          <div className="flex items-center gap-5 text-[11px] text-muted-foreground/35">
            <span>ESC 关闭</span>
            <span>▲▼ 选择</span>
            <span><span className="text-purple-400">⌘</span> + ▲▼ 翻页</span>
            <span>↵ 确认</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===========================
// Agent Chat Panel
// ===========================
// Composes MessageList + AgentMessageRenderer + input bar.
// Used inside AgentRunPage for the main conversation view.

export interface ChatPanelProps {
  messages: AgentChatMessage[];
  steps: WorkflowStep[];
  onSendMessage: (text: string) => void;
  onResolveUI?: (msgId: string, value: string) => void;
  onAvatarClick?: () => void;
}

export function ChatPanel({
  messages,
  steps,
  onSendMessage,
  onResolveUI,
  onAvatarClick,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [activeMode, setActiveMode] = useState('default');
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [activeThinking, setActiveThinking] = useState('default');
  const [activeProject, setActiveProject] = useState<string | null>('work');
  const [showPermissionMenu, setShowPermissionMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [projectQuery, setProjectQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPermission = PERMISSION_MODES.find(m => m.id === activeMode) ?? PERMISSION_MODES[0];
  const currentProject = PROJECTS.find(p => p.id === activeProject) ?? null;
  const filteredProjects = PROJECTS.filter(p => !projectQuery || p.label.toLowerCase().includes(projectQuery.toLowerCase()));
  const grouped = useGroupedMessages(messages);

  const togglePopup = (id: string) => setActivePopup(prev => prev === id ? null : id);
  const closePopup = () => setActivePopup(null);

  // Collect ALL unresolved generativeUI messages for pagination
  const pendingUIs = useMemo(() => {
    return messages
      .filter(msg => msg.generativeUI && !msg.generativeUI.resolved)
      .map(msg => ({ msgId: msg.id, data: msg.generativeUI! }));
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      closePopup();
    }
  };

  const toolbarBtnClass = 'p-[5px] w-auto h-auto text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 transition-colors';
  const toolbarBtnActiveClass = 'p-[5px] w-auto h-auto bg-accent/60 text-foreground transition-colors';

  return (
    <div className="flex flex-col h-full min-h-0">
      <MessageList
        scrollDeps={[messages.length]}
        header={undefined}
      >
        {grouped.map((group, i) => {
          if (group.type === 'user') {
            return <UserMessage key={group.msg.id} msg={group.msg} />;
          }
          return (
            <AgentMessageGroup
              key={group.msgs[0].id}
              msgs={group.msgs}
              onResolve={onResolveUI ?? (() => {})}
              onAvatarClick={onAvatarClick}
              isRunning={group.msgs.some(m => m.toolCall?.status === 'running' || (m.thinking && !m.content))}
            />
          );
        })}
      </MessageList>

      {/* Input Bar or Interactive Overlay */}
      <div className="flex-shrink-0 px-4 pb-3 pt-2">
        <AnimatePresence mode="wait">
          {pendingUIs.length > 0 && onResolveUI ? (
            <div key="overlay">
              <GenUIOverlay
                items={pendingUIs}
                onResolve={onResolveUI}
              />
            </div>
          ) : (
        <div key="input" className="flex flex-col gap-1.5">
        <div ref={containerRef} className="relative rounded-2xl border border-border/40 bg-muted/30 shadow-sm focus-within:border-border/60 transition-all duration-150">
          {/* Popup Cards */}
          <AnimatePresence>
            {/* Slash Commands */}
            <PopupCard open={activePopup === 'slash'} title="斜杠命令">
              {SLASH_COMMANDS.map(cmd => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => { setInput(cmd.label + ' '); closePopup(); }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2.5">
                    <TerminalSquare size={14} strokeWidth={1.5} className="text-muted-foreground/40 flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{cmd.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/40 text-right truncate max-w-[55%]">{cmd.desc}</span>
                </button>
              ))}
            </PopupCard>

            {/* Quick Phrases */}
            <PopupCard open={activePopup === 'phrases'} title="快捷短语">
              {QUICK_PHRASES.map(phrase => (
                <button
                  key={phrase.id}
                  type="button"
                  onClick={() => { setInput(phrase.desc); closePopup(); }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap size={14} strokeWidth={1.5} className="text-muted-foreground/40 flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{phrase.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/40 text-right truncate max-w-[55%]">{phrase.desc}</span>
                </button>
              ))}
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-accent/50"
              >
                <Plus size={14} strokeWidth={1.5} className="text-muted-foreground/40 flex-shrink-0" />
                <span className="text-sm text-muted-foreground/60">添加短语...</span>
              </button>
            </PopupCard>

            {/* @ Mentions */}
            <PopupCard open={activePopup === 'mention'} title="提及">
              {MENTION_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const idx = input.lastIndexOf('@');
                      const before = idx >= 0 ? input.slice(0, idx) : input;
                      setInput(`${before}@${item.label} `);
                      closePopup();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className="text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/40">{item.desc}</span>
                  </button>
                );
              })}
            </PopupCard>

            {/* Thinking Chain */}
            <PopupCard open={activePopup === 'thinking'} title="思维链长度">
              {THINKING_MODES.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => { setActiveThinking(mode.id); closePopup(); }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      activeThinking === mode.id ? 'bg-success/8' : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} strokeWidth={1.5} className={`flex-shrink-0 ${activeThinking === mode.id ? 'text-success' : 'text-muted-foreground/40'}`} />
                      <span className="text-sm font-medium text-foreground">{mode.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${activeThinking === mode.id ? 'text-success' : 'text-muted-foreground/50'}`}>{mode.desc}</span>
                      {activeThinking === mode.id && <Check size={14} className="text-success flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </PopupCard>
          </AnimatePresence>

          <Textarea
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none min-h-[36px] max-h-[140px] leading-[1.6] px-3.5 pt-[10px] pb-2 border-transparent focus-visible:border-transparent focus-visible:ring-0 shadow-none"
            placeholder="可向智能体询问任何事。输入 / 使用斜杠命令，输入 @ 提及文件"
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              // Open slash popup when input starts with `/`
              if (val === '/') {
                setActivePopup('slash');
              } else if (activePopup === 'slash' && !val.startsWith('/')) {
                setActivePopup(null);
              }
              // Open mention popup when last char is `@`
              if (val.endsWith('@')) {
                setActivePopup('mention');
              } else if (activePopup === 'mention' && !val.includes('@')) {
                setActivePopup(null);
              }
            }}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="px-2 pb-2 flex items-center justify-between gap-2">
            {/* Left: + menu and permission selector */}
            <div className="flex items-center gap-0.5 min-w-0">
              {/* Plus / Insert */}
              <DropdownMenu open={showPlusMenu} onOpenChange={setShowPlusMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className={showPlusMenu ? toolbarBtnActiveClass : toolbarBtnClass}>
                    <Plus size={16} strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-44">
                  {PLUS_MENU_ITEMS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id}>
                        <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                          <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                        </DropdownMenuItem>
                        {item.separator && idx < PLUS_MENU_ITEMS.length - 1 && <DropdownMenuSeparator />}
                      </div>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs" onClick={() => togglePopup('slash')}>
                    <TerminalSquare size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-left">斜杠命令</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs" onClick={() => togglePopup('phrases')}>
                    <Zap size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-left">快捷短语</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs" onClick={() => togglePopup('thinking')}>
                    <Lightbulb size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-left">思维链长度</span>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs text-muted-foreground">
                      <MoreHorizontal size={13} strokeWidth={1.5} className="flex-shrink-0" />
                      <span className="flex-1 text-left">更多</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {PLUS_MENU_SECONDARY.map(item => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.id} className="gap-2 px-2 py-[5px] text-xs">
                            <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.shortcut && <span className="text-xs text-muted-foreground/60 tracking-wider">{item.shortcut}</span>}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Permission Selector */}
              {(() => {
                const PermIcon = currentPermission.icon;
                return (
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
                  {PERMISSION_MODES.map(mode => {
                    const Icon = mode.icon;
                    const isActive = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
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
              );
              })()}
            </div>

            {/* Right: provider, model, translate, send */}
            <div className="flex items-center gap-1">
              {/* Provider/Model badge + thinking strength */}
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
                  {THINKING_MODES.map(mode => {
                    const Icon = mode.icon;
                    const isActive = activeThinking === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => { setActiveThinking(mode.id); setShowModelMenu(false); }}
                        className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs transition-colors ${
                          isActive ? 'bg-accent/40 text-foreground' : 'text-foreground/80 hover:bg-accent/25'
                        }`}
                      >
                        <Icon size={12} strokeWidth={1.5} className={`flex-shrink-0 ${isActive ? 'text-success' : 'text-muted-foreground/70'}`} />
                        <span className="flex-1">{mode.label}</span>
                        {isActive && <Check size={11} className="text-success flex-shrink-0" />}
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>

              {/* Translate */}
              <Tooltip content="翻译" side="top">
                <Button variant="ghost" size="icon-sm" className={toolbarBtnClass}>
                  <Languages size={16} strokeWidth={1.5} />
                </Button>
              </Tooltip>

              {/* Send */}
              <Button
                variant="default"
                size="icon-sm"
                className="rounded-full w-7 h-7 p-0 disabled:opacity-30"
                onClick={handleSend}
                disabled={!input.trim()}
                title="发送"
              >
                <ArrowUp size={14} strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>

        {/* Project / WorkDir selector — below input */}
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
              {/* Search */}
              <div className="px-1 py-1">
                <SearchInput
                  value={projectQuery}
                  onChange={setProjectQuery}
                  placeholder="搜索项目"
                  iconSize={11}
                  wrapperClassName="px-2 py-[4px] rounded-md bg-accent/15 border border-border/25"
                />
              </div>
              {/* Project list */}
              <div className="py-0.5">
                {filteredProjects.length === 0 && (
                  <div className="px-2 py-2 text-xs text-muted-foreground/50 text-center">无匹配项目</div>
                )}
                {filteredProjects.map(p => {
                  const isActive = activeProject === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
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
              {/* Add new project */}
              <button
                type="button"
                className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-foreground/80 hover:bg-accent/25 transition-colors"
              >
                <FolderPlus size={12} className="text-muted-foreground/70 flex-shrink-0" strokeWidth={1.5} />
                <span>添加新项目</span>
              </button>
              {/* No project */}
              <button
                type="button"
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
