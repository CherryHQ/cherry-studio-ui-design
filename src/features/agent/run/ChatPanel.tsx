import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus, Paperclip, Code2, FolderOpen, Folder, FolderPlus, FolderX, FileText, AtSign, LayoutGrid, Table2, Presentation, Monitor, Wrench,
  Globe, Hammer, Brain, MoreHorizontal,
  Maximize2, RotateCcw, RefreshCw, ChevronDown, Clock, X, Trash2, Workflow, FolderPen,
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
import { UserMessage, AgentMessageGroup, useGroupedMessages, PermissionApprovalCard } from './AgentMessageRenderer';
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
const PERMISSION_MODES: { id: string; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; color: string }[] = [
  { id: 'normal',    label: '普通模式',     desc: '编辑或执行命令前会询问',           icon: Hand,      color: 'text-emerald-500' },
  { id: 'plan',      label: '计划模式',     desc: '只读规划，不编辑文件、不执行命令', icon: Workflow,  color: 'text-amber-500' },
  { id: 'auto-edit', label: '自动编辑模式', desc: '自动读写文件，执行命令前询问',     icon: FolderPen, color: 'text-emerald-500' },
  { id: 'full-auto', label: '全自动模式',   desc: '可执行任何操作，请谨慎使用',       icon: RefreshCw, color: 'text-violet-500' },
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

// Cascading effort levels for the thinking selector
const THINKING_EFFORTS: { id: string; label: string }[] = [
  { id: 'default', label: '默认' },
  { id: 'low',     label: '浮想' },
  { id: 'mid',     label: '斟酌' },
  { id: 'high',    label: '沉思' },
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
  onOpenArtifact?: (filePath: string) => void;
  /** Slot rendered first inside the composer's left toolbar
   *  (e.g. agent picker + model picker pulled in from the page header). */
  headerControls?: React.ReactNode;
}

export function ChatPanel({
  messages,
  steps,
  onSendMessage,
  onResolveUI,
  onAvatarClick,
  onOpenArtifact,
  headerControls,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [activeMode, setActiveMode] = useState('normal');
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [activeThinking, setActiveThinking] = useState('default');
  const [activeProject, setActiveProject] = useState<string | null>('work');
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [projectQuery, setProjectQuery] = useState('');
  const [queuedMessages, setQueuedMessages] = useState<{ id: string; text: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect whether the agent is currently busy (running tools or thinking)
  const isAgentBusy = useMemo(() => {
    return messages.some(m =>
      m.toolCall?.status === 'running' ||
      (m.thinking && !m.content && m.role === 'agent')
    );
  }, [messages]);

  const currentProject = PROJECTS.find(p => p.id === activeProject) ?? null;
  const filteredProjects = PROJECTS.filter(p => !projectQuery || p.label.toLowerCase().includes(projectQuery.toLowerCase()));

  // Collect ALL unresolved generativeUI messages for pagination
  const pendingUIs = useMemo(() => {
    return messages
      .filter(msg => msg.generativeUI && !msg.generativeUI.resolved)
      .map(msg => ({ msgId: msg.id, data: msg.generativeUI! }));
  }, [messages]);

  // Pending permission request — surfaced as a banner above the input,
  // not inline in the message history. Only the latest pending one is shown.
  const pendingPermission = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.permissionRequest && m.permissionRequest.status === 'pending') {
        return { msgId: m.id, data: m.permissionRequest };
      }
    }
    return null;
  }, [messages]);

  // Messages to render in the message list — exclude pending permission requests
  // (they're shown as a banner above the input).
  const renderableMessages = useMemo(() => {
    return messages.filter(m =>
      !(m.permissionRequest && m.permissionRequest.status === 'pending')
    );
  }, [messages]);

  const grouped = useGroupedMessages(renderableMessages);

  const togglePopup = (id: string) => setActivePopup(prev => prev === id ? null : id);
  const closePopup = () => setActivePopup(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (isAgentBusy) {
      // Queue while agent is busy — will be sent automatically when agent idles
      setQueuedMessages(prev => [...prev, { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: trimmed }]);
    } else {
      onSendMessage(trimmed);
    }
    setInput('');
  };

  // Auto-flush queue when agent becomes idle
  const queueRef = useRef(queuedMessages);
  queueRef.current = queuedMessages;
  useEffect(() => {
    if (!isAgentBusy && queueRef.current.length > 0) {
      const next = queueRef.current[0];
      setQueuedMessages(prev => prev.slice(1));
      onSendMessage(next.text);
    }
  }, [isAgentBusy, onSendMessage]);

  const removeQueueItem = (id: string) => setQueuedMessages(prev => prev.filter(m => m.id !== id));
  const moveQueueItemUp = (id: string) => setQueuedMessages(prev => {
    const idx = prev.findIndex(m => m.id === id);
    if (idx <= 0) return prev;
    const next = [...prev];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    return next;
  });
  // Pull a queued message back into the input box for editing — drops it from the queue
  // so the user can modify it and press Enter to re-queue / send.
  const editQueueItem = (id: string) => {
    const item = queuedMessages.find(m => m.id === id);
    if (!item) return;
    // If the input already has text, prepend it back to the queue to avoid losing work
    const existing = input.trim();
    setQueuedMessages(prev => {
      const filtered = prev.filter(m => m.id !== id);
      if (existing) return [{ id: `q-${Date.now()}`, text: existing }, ...filtered];
      return filtered;
    });
    setInput(item.text);
  };
  const clearQueue = () => setQueuedMessages([]);

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
              onOpenArtifact={onOpenArtifact}
              isRunning={group.msgs.some(m => m.toolCall?.status === 'running' || (m.thinking && !m.content))}
            />
          );
        })}
      </MessageList>

      {/* Queued user messages — sit above the input, sent in order when agent idles */}
      <AnimatePresence initial={false}>
        {queuedMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0 px-4 pt-2 overflow-hidden"
          >
            <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
                <div className="flex items-center gap-1.5">
                  <Clock size={10} className="text-muted-foreground/60" />
                  <span className="text-[11px] text-muted-foreground">待发送队列</span>
                  <span className="text-[11px] text-muted-foreground/60 tabular-nums">{queuedMessages.length}</span>
                </div>
                <button
                  type="button"
                  onClick={clearQueue}
                  className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  清空
                </button>
              </div>
              <div className="max-h-[140px] overflow-y-auto">
                {queuedMessages.map((m, i) => (
                  <div key={m.id} className="group/q flex items-center gap-2 px-3 py-1.5 hover:bg-accent/15 transition-colors border-b border-border/15 last:border-b-0">
                    <span className="w-4 text-[10px] text-muted-foreground/60 tabular-nums flex-shrink-0">{i + 1}</span>
                    <span className="flex-1 min-w-0 text-xs text-foreground truncate">{m.text}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/q:opacity-100 transition-opacity flex-shrink-0">
                      {i > 0 && (
                        <button type="button" onClick={() => moveQueueItemUp(m.id)} title="上移"
                          className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/25 transition-colors">
                          <ArrowUp size={10} />
                        </button>
                      )}
                      <button type="button" onClick={() => editQueueItem(m.id)} title="编辑（取回到输入框）"
                        className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-accent/25 transition-colors">
                        <Pencil size={10} />
                      </button>
                      <button type="button" onClick={() => removeQueueItem(m.id)} title="删除"
                        className="p-1 rounded text-muted-foreground/60 hover:text-destructive hover:bg-destructive/8 transition-colors">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar or Interactive Overlay (permission > gen-ui > input) */}
      <div className="flex-shrink-0 px-4 pb-3 pt-2">
        <AnimatePresence mode="wait">
          {pendingPermission && onResolveUI ? (
            <motion.div
              key="permission"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              <PermissionApprovalCard
                request={pendingPermission.data}
                onResolve={(action) => onResolveUI(pendingPermission.msgId, action)}
                variant="composer"
              />
            </motion.div>
          ) : pendingUIs.length > 0 && onResolveUI ? (
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
            placeholder={
              isAgentBusy
                ? '智能体执行中，发送的消息将加入队列…'
                : '可向智能体询问任何事。输入 / 使用斜杠命令，输入 @ 提及文件'
            }
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
              {headerControls}
              {/* Plus / Insert */}
              <DropdownMenu open={showPlusMenu} onOpenChange={setShowPlusMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className={showPlusMenu ? toolbarBtnActiveClass : toolbarBtnClass}>
                    <Plus size={16} strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-48">
                  {/* Permission modes — cascaded submenu */}
                  {(() => {
                    const active = PERMISSION_MODES.find(m => m.id === activeMode) ?? PERMISSION_MODES[0];
                    const ActiveIcon = active.icon;
                    return (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2 px-2 py-[5px] text-xs">
                          <ActiveIcon size={13} strokeWidth={1.5} className={`flex-shrink-0 ${active.color}`} />
                          <span className="flex-1 text-left">{active.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {PERMISSION_MODES.map(mode => {
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
                  {PLUS_MENU_ITEMS
                    .filter(item => !['code', 'reasoning'].includes(item.id))
                    .map((item, idx, arr) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id}>
                          <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs">
                            <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                            <span className="flex-1 text-left">{item.label}</span>
                          </DropdownMenuItem>
                          {item.separator && idx < arr.length - 1 && <DropdownMenuSeparator />}
                        </div>
                      );
                    })}
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
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs" onClick={() => togglePopup('slash')}>
                    <TerminalSquare size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-left">斜杠命令</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 px-2 py-[5px] text-xs" onClick={() => togglePopup('phrases')}>
                    <Zap size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-left">快捷短语</span>
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
                    <Lightbulb size={13} className="text-muted-foreground/70" strokeWidth={1.5} />
                    <span className="truncate">
                      {THINKING_EFFORTS.find(e => e.id === activeThinking)?.label ?? '默认'}
                    </span>
                    <ChevronDown size={9} className={`transition-transform duration-100 ${showModelMenu ? 'rotate-180' : ''}`} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-[200px] p-1">
                  <div className="px-2 py-1 text-xs text-muted-foreground/60">思维链长度</div>
                  {THINKING_EFFORTS.map(mode => {
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
                        <Lightbulb size={12} strokeWidth={1.5} className={`flex-shrink-0 ${isActive ? 'text-warning' : 'text-muted-foreground/70'}`} />
                        <span className="flex-1">{mode.label}</span>
                        {isActive && <Check size={11} className="text-foreground flex-shrink-0" />}
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
                    <LayoutGrid size={13} className="text-muted-foreground/70" strokeWidth={1.5} />
                    <span className="truncate">技能</span>
                    <ChevronDown size={9} className={`transition-transform duration-100 ${showSkillMenu ? 'rotate-180' : ''}`} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-[220px] p-1">
                  <div className="px-2 py-1 text-xs text-muted-foreground/60">已安装技能</div>
                  {[
                    { id: 'docs',    label: 'Documents',     icon: FileText,     color: 'text-info' },
                    { id: 'sheets',  label: 'Spreadsheets',  icon: Table2,       color: 'text-success' },
                    { id: 'slides',  label: 'Presentations', icon: Presentation, color: 'text-warning' },
                    { id: 'browser', label: '浏览器',         icon: Compass,      color: 'text-info' },
                    { id: 'desktop', label: '电脑',           icon: Monitor,      color: 'text-accent-violet' },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <button key={s.id} type="button"
                        onClick={() => setShowSkillMenu(false)}
                        className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-foreground/80 hover:bg-accent/25 transition-colors"
                      >
                        <Icon size={12} strokeWidth={1.5} className={`flex-shrink-0 ${s.color}`} />
                        <span className="flex-1 truncate">{s.label}</span>
                      </button>
                    );
                  })}
                  <div className="my-1 h-px bg-border/40" />
                  <button type="button"
                    onClick={() => setShowSkillMenu(false)}
                    className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-muted-foreground hover:bg-accent/25 hover:text-foreground transition-colors"
                  >
                    <Wrench size={12} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="flex-1 truncate">管理技能…</span>
                  </button>
                  <button type="button"
                    onClick={() => setShowSkillMenu(false)}
                    className="w-full flex items-center gap-2 px-2 py-[6px] rounded-md text-left text-xs text-muted-foreground hover:bg-accent/25 hover:text-foreground transition-colors"
                  >
                    <Plus size={12} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="flex-1 truncate">添加技能</span>
                  </button>
                </PopoverContent>
              </Popover>
            </div>

            {/* Right: send */}
            <div className="flex items-center gap-1">
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
