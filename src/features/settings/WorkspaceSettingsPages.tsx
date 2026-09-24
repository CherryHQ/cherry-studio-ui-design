import { useState, type ReactNode } from 'react';
import { Cloud, Monitor, Plus, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimpleTooltip,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@cherry-studio/ui';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { toast } from 'sonner';
import { useSettings } from '@/app/context/SettingsContext';
import { usePiAgentWorkspace } from '@/features/agent/minimal/PiAgentDemoContext';
import { DashboardPage } from './DashboardPage';
import { ScheduledTasksPage } from './ScheduledTasksPage';
import { TaskBoardPage } from '@/features/agent/run/TaskBoardPage';
import { PromptEditPage } from '@/features/library/PromptEditPage';
import { SkillPluginDetail } from '@/features/library/SkillPluginDetail';
import { SkillPluginImportModal } from '@/features/library/SkillPluginImportModal';
import {
  useWorkspaceSettings,
  type AgentProviderSettings,
  type AgentProviderSource,
} from '@/app/context/WorkspaceSettingsContext';
import type { ResourceItem } from '@/app/types';
import type { AgentSession } from '@/app/types/agent';

export { BuiltinToolsSettingsPage } from './BuiltinToolsSettings';

function Page({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      {description && <p className="text-muted-foreground mt-2 mb-6 text-xs leading-6">{description}</p>}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export function ProfileSettingsPage() {
  const {
    profileName: name,
    setProfileName: setName,
    profileEmail: email,
    setProfileEmail: setEmail,
  } = useWorkspaceSettings();
  return (
    <Page title="个人资料" description="管理你的账户与工作空间身份。">
      <div className="flex items-center gap-4">
        <span className="bg-muted flex size-16 items-center justify-center rounded-2xl text-2xl">S</span>
        <div>
          <p>{name}</p>
          <p className="text-muted-foreground mt-1 text-xs">Cherry Studio 个人工作空间</p>
        </div>
      </div>
      <Label className="block space-y-2">
        <span>显示名称</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Label>
      <Label className="block space-y-2">
        <span>邮箱</span>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </Label>
      <Button variant="emphasis" onClick={() => toast.success('个人资料已保存到演示工作空间')}>
        保存资料
      </Button>
    </Page>
  );
}

export function SubscriptionSettingsPage() {
  const [tab, setTab] = useState('subscription');
  const { subscriptionPlan: plan, setSubscriptionPlan: setPlan } = useWorkspaceSettings();
  return (
    <div className="flex h-full flex-col">
      <Tabs value={tab} onValueChange={setTab} className="px-5 pt-4">
        <TabsList variant="line">
          <TabsTrigger
            value="subscription"
            className="rounded-none before:hidden group-data-[orientation=horizontal]/tabs:after:bottom-0"
          >
            订阅
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className="rounded-none before:hidden group-data-[orientation=horizontal]/tabs:after:bottom-0"
          >
            用量
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {tab === 'usage' ? (
        <DashboardPage />
      ) : (
        <Page title="订阅与用量" description="订阅方案与模型调用用量分别管理。以下为演示数据，不产生付费。">
          <div className="border-border rounded-xl border p-5">
            <p className="text-muted-foreground text-xs">当前方案</p>
            <h3 className="my-3 text-2xl font-medium">Cherry {plan}</h3>
            <p className="text-muted-foreground text-sm">本周期已使用 128 / 500 次 Agent 任务</p>
            <div className="bg-muted my-4 h-2 rounded-full">
              <div className="bg-primary h-full w-1/4 rounded-full" />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setPlan(plan === 'Free' ? 'Pro' : 'Free');
                toast.success('已切换演示订阅');
              }}
            >
              切换至 {plan === 'Free' ? 'Pro' : 'Free'} · Demo
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setTab('usage')}>
            查看模型用量
          </Button>
        </Page>
      )}
    </div>
  );
}

const SOURCE_BADGE: Record<AgentProviderSource, string> = {
  builtin: 'Built-in',
  local: 'Local',
  cloud: 'Cloud',
};

const EMPTY_PROVIDER_DRAFT = {
  name: '',
  source: 'cloud' as Exclude<AgentProviderSource, 'builtin'>,
  command: '',
  endpoint: '',
  apiKey: '',
};

function providerMark(provider: AgentProviderSettings) {
  if (provider.id === 'pi-agent') return 'π';
  return provider.name.trim().slice(0, 1).toUpperCase() || 'A';
}

export function AgentProviderSettingsPage({ onClose }: { onClose: () => void }) {
  const demo = usePiAgentWorkspace();
  const { updateSetting } = useSettings();
  const { agentProviders, setAgentProviders } = useWorkspaceSettings();
  const [selectedId, setSelectedId] = useState('pi-agent');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(EMPTY_PROVIDER_DRAFT);
  const [formError, setFormError] = useState('');
  const provider = agentProviders.find((item) => item.id === selectedId) ?? agentProviders[0];
  const added = provider ? demo.agents.some((agent) => agent.providerId === provider.id) : false;
  const patch = (changes: Partial<AgentProviderSettings>) => {
    if (!provider) return;
    setAgentProviders((items) => items.map((item) => (item.id === provider.id ? { ...item, ...changes } : item)));
  };
  const closeAdd = () => {
    setAdding(false);
    setDraft(EMPTY_PROVIDER_DRAFT);
    setFormError('');
  };
  const addToList = () => {
    if (!provider) return;
    demo.addAgent(provider.name, provider.source, 'GPT-5.4', `${provider.name} Provider 接入演示`, provider.id);
    toast.success(`${provider.name} 已添加到智能体列表`);
  };
  if (!provider) return <div className="flex-1" />;
  return (
    <div className="flex min-h-0 flex-1">
      <nav aria-label="Agent 服务商" className="border-border flex w-[160px] shrink-0 flex-col border-r">
        <div className="flex items-center justify-between px-3 pt-4 pb-2">
          <p className="text-muted-foreground text-xs font-medium">服务商</p>
          <SimpleTooltip content="添加 Provider" side="right">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="添加 Provider"
              className="text-muted-foreground shrink-0"
              onClick={() => setAdding(true)}
            >
              <Plus size={14} />
            </Button>
          </SimpleTooltip>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2.5 pb-3">
          {agentProviders.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              aria-pressed={provider.id === item.id}
              className={`h-9 w-full justify-start gap-2 rounded-xl px-2 shadow-none ${provider.id === item.id ? 'bg-accent text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="bg-muted flex size-5 shrink-0 items-center justify-center rounded-md text-[10px]">
                {providerMark(item)}
              </span>
              <span className="truncate">{item.name}</span>
            </Button>
          ))}
        </div>
      </nav>
      <div className="min-w-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl text-sm">
            {providerMark(provider)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-medium">{provider.name}</h2>
              <span className="border-border text-muted-foreground inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]">
                {provider.source === 'local' ? <Monitor size={10} /> : provider.source === 'cloud' ? <Cloud size={10} /> : null}
                {SOURCE_BADGE[provider.source]}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs leading-5">{provider.description}</p>
          </div>
        </div>
        <div className="border-border space-y-4 rounded-xl border p-4">
          <h3 className="text-sm font-medium">{provider.source === 'builtin' ? '运行状态' : '连接设置'}</h3>
          {provider.source === 'builtin' ? (
            <p className="text-muted-foreground text-xs leading-6">
              已作为内置 Pi Agent 接入。此状态只用于演示，不会检查本机安装。
            </p>
          ) : provider.source === 'local' ? (
            <Label className="block space-y-2">
              <span>本地 CLI 命令</span>
              <Input
                className="shadow-none"
                value={provider.command}
                placeholder="例如 claude"
                onChange={(event) => patch({ command: event.target.value })}
              />
              <span className="text-muted-foreground block text-xs">只保存在当前演示中，不会执行命令。</span>
            </Label>
          ) : (
            <>
              <Label className="block space-y-2">
                <span>API 地址</span>
                <Input
                  className="shadow-none"
                  value={provider.endpoint}
                  placeholder="https://agent.example.com/v1"
                  onChange={(event) => patch({ endpoint: event.target.value })}
                />
              </Label>
              <Label className="block space-y-2">
                <span>API Key</span>
                <Input
                  className="shadow-none"
                  type="password"
                  value={provider.apiKey}
                  placeholder="仅保存在当前演示中"
                  onChange={(event) => patch({ apiKey: event.target.value })}
                />
              </Label>
              <p className="text-muted-foreground text-xs">地址和密钥不会被发送到外部服务。</p>
            </>
          )}
        </div>
        <div className="border-border flex items-center gap-3 rounded-xl border p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{provider.name}</p>
            <p className="text-muted-foreground mt-1 text-xs">加入极简工作台的智能体列表。演示操作，不会连接外部服务。</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0" disabled={added} onClick={addToList}>
            {added ? <Check size={13} /> : <Plus size={13} />}
            {added ? '已添加' : '添加到列表'}
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            updateSetting('layoutMode', 'minimal');
            onClose();
          }}
        >
          在极简工作台查看智能体
        </Button>
      </div>
      <Dialog open={adding} onOpenChange={(open) => (open ? setAdding(true) : closeAdd())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加 Provider</DialogTitle>
            <DialogDescription>创建一个演示服务商。它只出现在左侧列表，不会安装软件或请求外部服务。</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              const name = draft.name.trim();
              const endpoint = draft.endpoint.trim();
              if (!name) {
                setFormError('请填写服务商名称');
                return;
              }
              if (draft.source === 'cloud') {
                try {
                  const url = new URL(endpoint);
                  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('protocol');
                } catch {
                  setFormError('请填写以 http:// 或 https:// 开头的 API 地址');
                  return;
                }
              }
              const created: AgentProviderSettings = {
                id: crypto.randomUUID(),
                name,
                source: draft.source,
                description:
                  draft.source === 'local'
                    ? '自定义本地 CLI。命令只保存在这次演示里，不会执行。'
                    : '自定义云端 Agent。地址和密钥只保存在这次演示里，不会发出请求。',
                command: draft.source === 'local' ? draft.command.trim() : '',
                endpoint: draft.source === 'cloud' ? endpoint : '',
                apiKey: draft.source === 'cloud' ? draft.apiKey : '',
              };
              setAgentProviders((items) => [...items, created]);
              setSelectedId(created.id);
              toast.success(`${name} 已添加到服务商列表`);
              closeAdd();
            }}
          >
            <Label className="block space-y-2">
              <span>服务商名称</span>
              <Input
                className="shadow-none"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="例如 OpenAI Agent"
              />
            </Label>
            <Label className="block space-y-2">
              <span>来源</span>
              <Select
                value={draft.source}
                onValueChange={(source) =>
                  setDraft((current) => ({ ...current, source: source === 'local' ? 'local' : 'cloud' }))
                }
              >
                <SelectTrigger className="w-full bg-transparent font-normal shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[var(--z-popover)]" position="popper">
                  <SelectItem value="local">Local · 本地 CLI</SelectItem>
                  <SelectItem value="cloud">Cloud · 云端接口</SelectItem>
                </SelectContent>
              </Select>
            </Label>
            {draft.source === 'local' ? (
              <Label className="block space-y-2">
                <span>本地 CLI 命令</span>
                <Input
                  className="shadow-none"
                  value={draft.command}
                  onChange={(event) => setDraft((current) => ({ ...current, command: event.target.value }))}
                  placeholder="例如 my-agent"
                />
              </Label>
            ) : (
              <>
                <Label className="block space-y-2">
                  <span>API 地址</span>
                  <Input
                    className="shadow-none"
                    value={draft.endpoint}
                    onChange={(event) => setDraft((current) => ({ ...current, endpoint: event.target.value }))}
                    placeholder="https://agent.example.com/v1"
                  />
                </Label>
                <Label className="block space-y-2">
                  <span>API Key</span>
                  <Input
                    className="shadow-none"
                    type="password"
                    value={draft.apiKey}
                    onChange={(event) => setDraft((current) => ({ ...current, apiKey: event.target.value }))}
                    placeholder="仅保存在当前演示中"
                  />
                </Label>
              </>
            )}
            {formError && <p className="text-destructive text-xs">{formError}</p>}
            <DialogFooter>
              <Button variant="outline" type="button" onClick={closeAdd}>
                取消
              </Button>
              <Button variant="emphasis" type="submit" size="sm">
                保存 Provider
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TasksSettingsPage({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState('scheduled');
  const demo = usePiAgentWorkspace();
  const { updateSetting } = useSettings();
  const sessions: AgentSession[] = demo.agents
    .filter((agent) => agent.messages.length)
    .map((agent) => {
      const last = agent.messages.at(-1)!;
      return {
        id: agent.id,
        title: agent.messages.find((message) => message.role === 'user')?.text || `与 ${agent.name} 的对话`,
        agentName: agent.name,
        agentIcon: 'π',
        lastMessage: last.text || '等待智能体执行',
        timestamp: '今天',
        messageCount: agent.messages.length,
        status:
          last.status === 'approval'
            ? 'awaiting'
            : ['running', 'executing'].includes(last.status)
              ? 'active'
              : last.status === 'error'
                ? 'error'
                : 'completed',
      };
    });
  return (
    <div className="flex h-full flex-col">
      <Tabs value={tab} onValueChange={setTab} className="px-5 pt-4">
        <TabsList variant="line">
          <TabsTrigger
            value="scheduled"
            className="rounded-none before:hidden group-data-[orientation=horizontal]/tabs:after:bottom-0"
          >
            定时任务
          </TabsTrigger>
          <TabsTrigger
            value="board"
            className="rounded-none before:hidden group-data-[orientation=horizontal]/tabs:after:bottom-0"
          >
            任务看板
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="min-h-0 flex-1">
        {tab === 'scheduled' ? (
          <ScheduledTasksPage />
        ) : (
          <TaskBoardPage
            sessions={sessions}
            onOpenSession={(session) => {
              demo.selectAgent(session.id);
              updateSetting('layoutMode', 'minimal');
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

export function ResourcesSettingsPage({ kind }: { kind: 'prompt' | 'skill' }) {
  const workspace = useWorkspaceSettings();
  const resources = kind === 'prompt' ? workspace.prompts : workspace.skills;
  const setResources = kind === 'prompt' ? workspace.setPrompts : workspace.setSkills;
  const [selected, setSelected] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const current = resources.find((item) => item.id === selected);
  const patch = (id: string, changes: Partial<ResourceItem>) =>
    setResources((items) => items.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  const addPrompt = () => {
    const resource: ResourceItem = {
      id: crypto.randomUUID(),
      name: '新提示词',
      type: 'prompt',
      description: '',
      avatar: '✍️',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enabled: true,
      content: '',
    };
    setResources((items) => [...items, resource]);
    setSelected(resource.id);
  };
  if (current)
    return kind === 'prompt' ? (
      <PromptEditPage
        key={current.id}
        resource={current}
        onBack={() => setSelected(null)}
        onSave={(changes) => {
          patch(current.id, changes);
          toast.success('提示词已保存');
        }}
      />
    ) : (
      <SkillPluginDetail
        resource={current}
        onBack={() => setSelected(null)}
        onToggle={(id) => patch(id, { enabled: !current.enabled })}
        onDelete={(resource) => {
          setResources((items) => items.filter((item) => item.id !== resource.id));
          setSelected(null);
        }}
      />
    );
  return (
    <Page
      title={kind === 'prompt' ? '提示词' : 'Skills'}
      description={kind === 'prompt' ? '统一管理可绑定到智能体的提示词。' : '安装、查看并启用智能体技能。'}
    >
      <Button size="sm" variant="outline" onClick={kind === 'prompt' ? addPrompt : () => setImporting(true)}>
        <Plus size={14} />
        {kind === 'prompt' ? '新建提示词' : '导入 Skill'}
      </Button>
      {resources.map((resource) => (
        <div key={resource.id} className="border-border flex items-center gap-3 rounded-xl border p-4">
          <Button variant="ghost" className="min-w-0 flex-1 justify-start" onClick={() => setSelected(resource.id)}>
            <span>{resource.avatar}</span>
            <span className="truncate">{resource.name}</span>
          </Button>
          <Switch
            aria-label={`启用 ${resource.name}`}
            checked={resource.enabled}
            onCheckedChange={(enabled) => patch(resource.id, { enabled })}
          />
        </div>
      ))}
      <SkillPluginImportModal
        open={importing}
        importType="skill"
        onClose={() => setImporting(false)}
        onImportComplete={(resource) => {
          setResources((items) => [...items, resource]);
          setImporting(false);
        }}
      />
    </Page>
  );
}
