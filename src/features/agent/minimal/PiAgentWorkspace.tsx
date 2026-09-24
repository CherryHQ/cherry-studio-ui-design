import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import {
  ArrowUp,
  ArrowLeft,
  AudioLines,
  Check,
  Cloud,
  Code2,
  Copy,
  FileText,
  FolderOpen,
  Loader2,
  Library,
  Mic,
  Monitor,
  Moon,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Square,
  Sun,
} from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  InlineAttachmentChip,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimpleTooltip,
  Textarea,
} from '@cherry-studio/ui';
import { Button as FlatButton } from '@cherrystudio/ui/components/primitives/button';
import { toast } from 'sonner';
import { useSettings } from '@/app/context/SettingsContext';
import { GlobalActionProvider, useGlobalActions } from '@/app/context/GlobalActionContext';
import { PiAgentSettings } from './PiAgentSettings';
import {
  agentPreview,
  DEMO_RESULT,
  SOURCE_LABELS,
  type AgentSource,
  type DemoAgent,
  type DemoMessage,
} from './piAgentDemo';
import { usePiAgentWorkspace } from './PiAgentDemoContext';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AttachmentList } from '@/app/components/shared/Chat/AttachmentList';
import { ArtifactCard } from '@/features/agent/run/AgentMessageRenderer';
import { ArtifactViewer } from '@/features/agent/run/ArtifactViewer';
import { MarketPage } from '@/features/market/MarketPage';
import { LibraryPage } from '@/features/library/LibraryPage';
import type { DemoAttachment } from './piAgentDemo';

function SourceTag({ source, full = false }: { source: AgentSource; full?: boolean }) {
  const Icon = source === 'local' ? Monitor : source === 'cloud' ? Cloud : Sparkles;
  return (
    <SimpleTooltip content={SOURCE_LABELS[source]} side="top">
      <span
        aria-label={SOURCE_LABELS[source]}
        className="border-border text-muted-foreground inline-flex items-center gap-1 rounded border px-1 py-0.5 text-[10px]"
      >
        <Icon size={11} />
        {full && SOURCE_LABELS[source].split(' · ')[0]}
      </span>
    </SimpleTooltip>
  );
}

function AgentAvatar({ agent, small = false }: { agent: DemoAgent; small?: boolean }) {
  return (
    <span
      className={`bg-muted text-foreground inline-flex shrink-0 items-center justify-center rounded-xl ${small ? 'size-7 text-xl' : 'size-10 text-[28px]'}`}
    >
      {agent.source === 'builtin' ? (
        'π'
      ) : agent.source === 'local' ? (
        <Code2 size={small ? 15 : 21} />
      ) : (
        <Cloud size={small ? 15 : 21} />
      )}
    </span>
  );
}

function IconButton({ label, children, className = '', ...props }: ComponentProps<typeof Button> & { label: string }) {
  return (
    <SimpleTooltip content={label} side="bottom">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        className={`text-muted-foreground rounded-full ${className}`}
        {...props}
      >
        {children}
      </Button>
    </SimpleTooltip>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('已复制');
  } catch {
    toast.error('无法访问剪贴板，请手动选择文本复制。');
  }
}

function Message({
  message,
  agent,
  busy,
  onApprove,
  onRetry,
  onPreview,
  onOpenAttachment,
}: {
  message: DemoMessage;
  agent: DemoAgent;
  busy: boolean;
  onApprove: (id: string, allowed: boolean) => void;
  onRetry: (id: string) => void;
  onPreview: () => void;
  onOpenAttachment: (file: DemoAttachment) => void;
}) {
  const user = message.role === 'user';
  return (
    <article className={`mb-6 flex gap-2.5 ${user ? 'flex-row-reverse' : ''}`}>
      {user ? (
        <span className="bg-accent flex size-7 shrink-0 items-center justify-center rounded-lg text-xs">S</span>
      ) : (
        <AgentAvatar agent={agent} small />
      )}
      <div className={`flex max-w-[86%] min-w-0 flex-col ${user ? 'items-end' : 'items-start'}`}>
        <div className="text-muted-foreground mb-1.5 text-[10px]">{user ? '你' : agent.name}</div>
        {message.text && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${user ? 'bg-accent rounded-tr-md' : 'bg-muted/60 rounded-tl-md'}`}
          >
            {message.text}
          </div>
        )}
        {!!message.attachments?.length && (
          <AttachmentList
            attachments={message.attachments}
            onOpen={(file) => {
              const attachment = message.attachments?.find((item) => item.id === file.id);
              if (attachment) onOpenAttachment(attachment);
            }}
          />
        )}
        {['running', 'executing'].includes(message.status) && (
          <div className="text-muted-foreground flex items-center gap-2 py-3 text-xs" role="status">
            <Loader2 className="animate-spin motion-reduce:animate-none" size={14} />
            {message.status === 'executing' ? '正在整理工作区…' : '正在思考…'}
          </div>
        )}
        {message.status === 'approval' && (
          <div className="border-border bg-card w-full rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck size={16} />
              Pi 希望在工作区中创建文件
            </div>
            <div className="bg-muted text-muted-foreground my-3 rounded-lg px-3 py-2 font-mono text-xs">
              write · product-interactions.md
            </div>
            <p className="text-muted-foreground mb-4 text-xs leading-6">
              将整理产品交互并写入清单。当前页面仅演示流程，不会修改真实文件。
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onApprove(message.id, true)}>
                <Check size={14} />
                允许执行
              </Button>
              <Button variant="outline" size="sm" onClick={() => onApprove(message.id, false)}>
                拒绝
              </Button>
            </div>
          </div>
        )}
        {message.status === 'error' && (
          <div role="status" className="border-border bg-muted/50 rounded-xl border p-4 text-sm">
            <p className="text-destructive">连接暂时中断，这次操作没有完成。</p>
            <p className="text-muted-foreground mt-1 text-xs">你可以重试，已输入的内容会保留。</p>
            <Button size="sm" variant="outline" disabled={busy} className="mt-3" onClick={() => onRetry(message.id)}>
              <RefreshCw size={13} />
              重试
            </Button>
          </div>
        )}
        {message.result && (
          <div className="mt-3 w-full">
            <ArtifactCard filePath="product-interactions.md" onOpen={onPreview} />
          </div>
        )}
        {!user && message.status === 'done' && (
          <div className="mt-1.5 flex gap-0.5">
            <IconButton label="复制回复" size="icon-xs" onClick={() => void copyText(message.text)}>
              <Copy size={12} />
            </IconButton>
            <IconButton label="重新生成" size="icon-xs" disabled={busy} onClick={() => onRetry(message.id)}>
              <RefreshCw size={12} />
            </IconButton>
          </div>
        )}
      </div>
    </article>
  );
}

function CreateAgentDialog({
  source,
  onClose,
  onCreate,
}: {
  source: AgentSource;
  onClose: () => void;
  onCreate: (name: string, source: AgentSource, model: string, description: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('GPT-5.4');
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle>
          {source === 'builtin' ? '创建 Pi Agent' : source === 'local' ? '添加本地 Agent' : '添加云端 Agent'}
        </DialogTitle>
        <DialogDescription>给你的智能体一个名字，稍后可以继续调整能力。</DialogDescription>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) {
              onCreate(name.trim(), source, model, description);
              onClose();
              toast.success('智能体已创建');
            }
          }}
        >
          <div className="flex items-center gap-2">
            <SourceTag source={source} full />
            <span className="text-muted-foreground text-xs">Pi Agent</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pi-name">名称</Label>
            <Input
              id="new-pi-name"
              autoFocus
              required
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：产品研究助手"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pi-description">描述</Label>
            <Textarea
              id="new-pi-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="这个智能体擅长什么？"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pi-model">模型</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="new-pi-model" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[var(--z-popover)]">
                {['GPT-5.4', 'Gemini 2.5 Pro', 'Qwen3.5'].map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              创建智能体
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PiAgentWorkspace({ active }: { active: boolean }) {
  const demo = usePiAgentWorkspace();
  const { agent, agents, busy } = demo;
  const { resolvedTheme, updateSetting } = useSettings();
  const globalActions = useGlobalActions();
  const [resourceView, setResourceView] = useState<'market' | 'library' | 'closed' | null>(null);
  const showingResources = resourceView === 'market' || resourceView === 'library';
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [createSource, setCreateSource] = useState<AgentSource | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [artifact, setArtifact] = useState<{ agentId: string; file?: DemoAttachment } | null>(null);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const visibleAgents = agents.filter((agent) => agent.name.toLowerCase().includes(query.trim().toLowerCase()));
  const resourceActions = useMemo(
    () => ({
      ...globalActions,
      navigateToMarket: () => setResourceView('market'),
      navigateToLibrary: () => setResourceView('library'),
      libraryReturn: () => setResourceView('market'),
      libraryEditResourceId: null,
      libraryCreateType: null,
    }),
    [globalActions],
  );

  useEffect(() => {
    if (active) messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
    else {
      setGlobalSettingsOpen(false);
      setSettingsOpen(false);
      setResourceView(null);
    }
  }, [active, agent.id, agent.messages]);

  const chooseAgent = (id: string) => {
    demo.selectAgent(id);
    setResourceView((view) => (view === null ? null : 'closed'));
    setSearchOpen(false);
    setQuery('');
    setRecording(false);
  };
  const record = () => {
    if (recording) demo.patch({ draft: '帮我梳理一下今天的产品设计重点。' });
    setRecording(!recording);
    inputRef.current?.focus();
  };
  const share = agent.messages
    .filter((message) => message.text)
    .map((message) => `${message.role === 'user' ? '你' : agent.name}\n${message.text}`)
    .join('\n\n');

  return (
    <div
      className={active ? 'bg-muted dark:bg-background flex h-screen w-full items-center justify-center p-6' : 'hidden'}
    >
      <div
        id="pi-agent-minimal-root"
        data-mode="minimal"
        className="border-border bg-sidebar text-foreground relative flex aspect-[1440/900] h-full max-h-[900px] max-w-full overflow-hidden rounded-2xl border shadow-2xl"
      >
        <aside
          className="border-border bg-sidebar flex w-[275px] shrink-0 flex-col border-r max-[850px]:w-[225px]"
          aria-label="智能体列表"
        >
          <div className="flex h-20 shrink-0 items-center justify-between px-4">
            <div className="flex items-center gap-2" aria-label="macOS 窗口控制">
              <span className="border-traffic-red-border bg-traffic-red size-3 rounded-full border" />
              <span className="border-traffic-yellow-border bg-traffic-yellow size-3 rounded-full border" />
              <span className="border-traffic-green-border bg-traffic-green size-3 rounded-full border" />
            </div>
            <div className="flex gap-1.5">
              <Popover
                open={active && searchOpen}
                onOpenChange={(open) => {
                  setSearchOpen(open);
                  if (!open) setQuery('');
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="rounded-full"
                    aria-label="搜索智能体"
                    title="搜索智能体"
                  >
                    <Search size={17} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-3">
                  <Input
                    aria-label="搜索智能体名称"
                    placeholder="搜索智能体名称…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        event.stopPropagation();
                        setSearchOpen(false);
                        setQuery('');
                      }
                    }}
                    autoFocus
                    className="h-9 px-3"
                  />
                  <p className="text-muted-foreground mt-2 flex justify-between text-[10px]">
                    <span>仅搜索智能体</span>
                    <span>esc 关闭</span>
                  </p>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="rounded-full"
                    aria-label="添加智能体"
                    title="添加智能体"
                  >
                    <Plus size={19} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onSelect={() => setCreateSource('builtin')}>
                    <Sparkles size={15} />
                    创建 Pi Agent<span className="text-muted-foreground ml-auto text-xs">Built-in</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setCreateSource('local')}>
                    <Monitor size={15} />
                    添加本地 Agent<span className="text-muted-foreground ml-auto text-xs">Local</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setCreateSource('cloud')}>
                    <Cloud size={15} />
                    添加云端 Agent<span className="text-muted-foreground ml-auto text-xs">Cloud</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2.5">
            {visibleAgents.map((item) => (
              <div
                key={item.id}
                onClick={() => chooseAgent(item.id)}
                className={`hover:bg-sidebar-accent mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3.5 ${agent.id === item.id ? 'bg-sidebar-accent' : ''}`}
              >
                <SimpleTooltip content={`设置 ${item.name}`} side="right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`设置 ${item.name}`}
                    className="relative rounded-xl p-0"
                    onClick={(event) => {
                      event.stopPropagation();
                      chooseAgent(item.id);
                      setSettingsOpen(true);
                    }}
                  >
                    <AgentAvatar agent={item} />
                    {item.unread > 0 && (
                      <span
                        aria-label={`${item.unread} 条未读`}
                        className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-4"
                      >
                        {item.unread}
                      </span>
                    )}
                  </Button>
                </SimpleTooltip>
                <Button
                  variant="ghost"
                  aria-label={item.name}
                  aria-pressed={agent.id === item.id}
                  className="block h-auto min-w-0 flex-1 rounded-none p-0 text-left font-normal hover:bg-transparent dark:hover:bg-transparent"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{item.name}</span>
                    <SourceTag source={item.source} />
                    <time className="text-muted-foreground ml-auto shrink-0 text-[9px]">
                      {new Date(item.updatedAt).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </time>
                  </span>
                  <span className="text-muted-foreground mt-1.5 block truncate text-xs">{agentPreview(item)}</span>
                </Button>
              </div>
            ))}
            {!visibleAgents.length && (
              <p className="text-muted-foreground py-8 text-center text-xs">没有找到相关智能体</p>
            )}
          </div>
          <div className="border-border flex items-center gap-2 border-t p-4">
            <span className="border-border text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full border text-xs">
              S
            </span>
            <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">我的工作空间</span>
            <SimpleTooltip content="资源" side="bottom">
              <FlatButton
                type="button"
                variant="ghost"
                size="icon"
                aria-label="资源"
                className="text-muted-foreground shrink-0 rounded-full"
                onClick={() => setResourceView('market')}
              >
                <Library size={16} />
              </FlatButton>
            </SimpleTooltip>
            <IconButton label="设置" onClick={() => setGlobalSettingsOpen(true)}>
              <Settings2 size={16} />
            </IconButton>
            <IconButton
              label="切换明暗主题"
              onClick={() => updateSetting('theme', resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </IconButton>
          </div>
        </aside>
        <main
          className={`bg-content-bg min-w-0 flex-1 flex-col ${showingResources ? 'hidden' : 'flex'}`}
          aria-label={`${agent.name} 对话`}
        >
          <div className="flex h-12 shrink-0 items-center justify-end px-5">
            <div className="flex items-center gap-1">
              <IconButton label="分享对话" onClick={() => setShareOpen(true)}>
                <Share2 size={16} />
              </IconButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground rounded-full"
                    aria-label="更多操作"
                  >
                    <MoreHorizontal size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={busy}
                    onSelect={() => demo.send('整理工作区文件，并生成一份产品交互清单。', 'tool')}
                  >
                    <FolderOpen size={14} />
                    演示工具审批
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={busy}
                    onSelect={() => demo.send('演示一次连接失败，然后尝试恢复。', 'error')}
                  >
                    <RefreshCw size={14} />
                    演示异常与重试
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto px-8 pb-6 max-[850px]:px-5">
            <div className="mx-auto max-w-[780px]">
              {agent.messages.length > 0 ? (
                <div className="text-muted-foreground py-2 pb-5 text-center text-[10px]">今天</div>
              ) : (
                <div className="mx-auto max-w-lg py-16">
                  <div className="bg-muted mb-6 flex size-14 items-center justify-center rounded-2xl text-[38px]">
                    π
                  </div>
                  <h1 className="mb-3 text-2xl font-medium tracking-tight">让想法，开始发生。</h1>
                  <p className="text-muted-foreground mb-6 text-sm leading-7">
                    我是 {agent.name}。研究一个问题、整理一份文档，或者把一个想法变成下一步，我们从这里开始。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => demo.send('帮我梳理一下今天的产品设计重点。')}>
                      <Sparkles size={14} />
                      梳理产品设计重点
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => demo.send('整理工作区文件，并生成一份产品交互清单。', 'tool')}
                    >
                      <FolderOpen size={14} />
                      整理工作区文件
                    </Button>
                  </div>
                </div>
              )}
              {agent.messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  agent={agent}
                  busy={busy}
                  onApprove={demo.approve}
                  onRetry={demo.retry}
                  onPreview={() => setArtifact({ agentId: agent.id })}
                  onOpenAttachment={(file) => setArtifact({ agentId: agent.id, file })}
                />
              ))}
            </div>
          </div>
          <div className="shrink-0 px-7 pt-3 pb-4 max-[850px]:px-4">
            <div className="mx-auto max-w-[820px]">
              {recording && (
                <p className="text-destructive mb-2 px-3 text-xs">正在聆听，再次点击麦克风结束 · 语音演示</p>
              )}
              {!!agent.attachments.length && (
                <div className="mb-2 flex flex-wrap gap-2 px-2" aria-label="待发送附件">
                  {agent.attachments.map((file) => (
                    <InlineAttachmentChip
                      key={file.id}
                      name={file.name}
                      ext={file.type}
                      size={file.size}
                      previewUrl={file.previewUrl}
                      snippet={file.content?.slice(0, 250)}
                      onRemove={() => demo.removeAttachment(file.id)}
                    />
                  ))}
                </div>
              )}
              <form
                className="border-border bg-muted/60 flex items-end gap-1.5 rounded-[28px] border p-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (agent.draft.trim() || agent.attachments.length) demo.send(agent.draft);
                  else record();
                }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="border-border bg-muted shrink-0 rounded-full border"
                      aria-label="添加附件或工具"
                    >
                      <Plus size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top">
                    <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
                      <FileText size={14} />
                      添加文件
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={busy}
                      onSelect={() => demo.send('整理工作区文件，并生成一份产品交互清单。', 'tool')}
                    >
                      <ShieldCheck size={14} />
                      演示工具审批
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={busy}
                      onSelect={() => demo.send('演示一次连接失败，然后尝试恢复。', 'error')}
                    >
                      <RefreshCw size={14} />
                      演示异常与重试
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Textarea
                  ref={inputRef}
                  aria-label={`给 ${agent.name} 发消息`}
                  placeholder={`给 ${agent.name} 发消息…`}
                  value={agent.draft}
                  onChange={(event) => demo.patch({ draft: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      demo.send(agent.draft);
                    }
                  }}
                  rows={1}
                  className="max-h-32 min-h-9 resize-none rounded-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
                <IconButton label="模拟语音输入" onClick={record} className={recording ? 'text-destructive' : ''}>
                  <Mic size={17} />
                </IconButton>
                {busy ? (
                  <Button
                    type="button"
                    size="icon-sm"
                    className="shrink-0 rounded-full"
                    aria-label="停止生成"
                    onClick={demo.stop}
                  >
                    <Square size={14} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon-sm"
                    className="shrink-0 rounded-full"
                    aria-label={agent.draft.trim() || agent.attachments.length ? '发送消息' : '开始语音演示'}
                  >
                    {agent.draft.trim() || agent.attachments.length ? <ArrowUp size={19} /> : <AudioLines size={18} />}
                  </Button>
                )}
              </form>
              <div className="text-muted-foreground flex items-center justify-center gap-1.5 pt-2 text-[9px]">
                <ShieldCheck size={10} />
                <span>{agent.model} · Pi Agent · 交互演示</span>
              </div>
            </div>
          </div>
        </main>
        {resourceView !== null && (
          <GlobalActionProvider value={resourceActions}>
            <main
              aria-label="资源"
              className={`bg-background min-w-0 flex-1 flex-col ${showingResources ? 'flex' : 'hidden'}`}
            >
              <div className="border-border flex h-12 shrink-0 items-center gap-3 border-b px-5">
                <FlatButton variant="ghost" size="sm" onClick={() => setResourceView('closed')}>
                  <ArrowLeft size={15} />
                  返回对话
                </FlatButton>
                <span className="text-muted-foreground text-xs">
                  {resourceView === 'library' ? '我的资源' : '资源市场'}
                </span>
              </div>
              <div className={resourceView === 'market' ? 'min-h-0 flex-1' : 'hidden'}>
                <MarketPage />
              </div>
              <div className={resourceView === 'library' ? 'min-h-0 flex-1' : 'hidden'}>
                <LibraryPage />
              </div>
            </main>
          </GlobalActionProvider>
        )}
        {artifact?.agentId === agent.id && (
          <aside
            aria-label="Artifact 预览"
            className={`border-border bg-content-bg min-h-0 w-[40%] min-w-[300px] shrink-0 flex-col border-l ${showingResources ? 'hidden' : 'flex'}`}
          >
            <div className="border-border truncate border-b px-4 py-3 text-xs font-medium">
              {artifact.file?.name || 'product-interactions.md'}
            </div>
            <div className="min-h-0 flex-1">
              <ArtifactViewer
                key={artifact.file?.id || 'result'}
                fileName={artifact.file?.name || 'product-interactions.md'}
                fileContent={artifact.file ? (artifact.file.content ?? null) : DEMO_RESULT}
                previewUrl={artifact.file && !artifact.file.content ? artifact.file.fileUrl : null}
                previewHtml={/\.html?$/i.test(artifact.file?.name || '') ? artifact.file?.content : undefined}
                hasArtifact
                showPreview
                onTogglePreview={() => setArtifact(null)}
              />
            </div>
          </aside>
        )}
      </div>
      <input
        type="file"
        ref={fileRef}
        multiple
        hidden
        aria-label="选择附件"
        onChange={(event) => {
          void demo.addAttachments(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <SettingsPage open={active && globalSettingsOpen} onClose={() => setGlobalSettingsOpen(false)} />
      {active && settingsOpen && (
        <PiAgentSettings agent={agent} onChange={demo.patch} onClose={() => setSettingsOpen(false)} />
      )}
      {active && createSource && (
        <CreateAgentDialog source={createSource} onClose={() => setCreateSource(null)} onCreate={demo.addAgent} />
      )}
      <Dialog
        open={active && shareOpen}
        onOpenChange={(open) => {
          if (!open) setShareOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogTitle>分享对话</DialogTitle>
          <DialogDescription>复制当前对话文本，分享本次讨论的结果。</DialogDescription>
          <div className="border-border bg-muted/40 max-h-[45vh] overflow-y-auto rounded-xl border p-5 text-sm leading-7 whitespace-pre-wrap">
            {share || '当前还没有消息。开始对话后，可以在这里复制内容。'}
          </div>
          <Button className="justify-self-end" onClick={() => void copyText(share)}>
            <Copy size={14} />
            复制内容
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
