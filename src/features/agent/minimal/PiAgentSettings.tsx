import { useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Clock3, Code2, FileText, Settings2, ShieldCheck, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@cherry-studio/ui';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { toast } from 'sonner';
import { PI_TOOLS, SOURCE_LABELS, type DemoAgent } from './piAgentDemo';

const sections = [
  { id: 'basic', label: '基本', icon: Settings2 },
  { id: 'prompts', label: '提示词', icon: FileText },
  { id: 'capabilities', label: '能力', icon: Sparkles },
  { id: 'automation', label: '自动化', icon: Clock3 },
  { id: 'advanced', label: '高级', icon: Code2 },
];

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Choice({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[var(--z-popover)]">
          {options.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="border-border flex items-center justify-between gap-5 border-b py-3">
      <div>
        <div className="text-sm">{label}</div>
        {hint && <div className="text-muted-foreground mt-1 text-xs leading-relaxed">{hint}</div>}
      </div>
      <Switch aria-label={label} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function PiAgentSettings({
  agent,
  onChange,
  onClose,
}: {
  agent: DemoAgent;
  onChange: (changes: Partial<DemoAgent>) => void;
  onClose: () => void;
}) {
  const [section, setSection] = useState('basic');
  const toggleCapability = (key: string, checked: boolean) =>
    onChange({ capabilities: { ...agent.capabilities, [key]: checked } });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex h-[590px] max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[790px]">
        <div className="border-border flex items-center gap-3 border-b px-6 py-5">
          <div className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-xl text-[30px] font-medium">
            π
          </div>
          <div>
            <DialogTitle className="text-lg font-medium">{agent.name}</DialogTitle>
            <DialogDescription className="mt-1.5 flex items-center gap-2 text-xs">
              <span className="border-border rounded-md border px-2 py-0.5">{SOURCE_LABELS[agent.source]}</span>
              <span>Pi Agent</span>
            </DialogDescription>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <nav aria-label="智能体设置分组" className="border-border w-36 shrink-0 space-y-1 border-r p-3">
            {sections.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start gap-2 px-3 font-normal ${section === item.id ? 'bg-accent' : 'text-muted-foreground'}`}
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? 'page' : undefined}
              >
                <item.icon size={15} />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="min-w-0 flex-1 overflow-y-auto px-7 py-6">
            {section === 'basic' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-medium">基本</h3>
                  <p className="text-muted-foreground mt-1 text-xs">定义智能体的身份、模型和行为方式。</p>
                </div>
                <Field id="pi-name" label="名称">
                  <Input
                    id="pi-name"
                    value={agent.name}
                    maxLength={40}
                    onChange={(event) => onChange({ name: event.target.value })}
                    onBlur={() => {
                      if (!agent.name.trim()) onChange({ name: 'Pi Agent' });
                    }}
                  />
                </Field>
                <Field id="pi-description" label="描述">
                  <Textarea
                    id="pi-description"
                    value={agent.description}
                    onChange={(event) => onChange({ description: event.target.value })}
                  />
                </Field>
                <Choice
                  id="pi-model"
                  label="模型"
                  value={agent.model}
                  options={['GPT-5.4', 'Gemini 2.5 Pro', 'Qwen3.5'].map((value) => [value, value])}
                  onChange={(model) => onChange({ model })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Choice
                    id="pi-permission"
                    label="权限模式"
                    value={agent.permission}
                    options={[
                      ['default', '默认 · 操作前询问'],
                      ['acceptEdits', '接受文件编辑'],
                      ['auto', '自动判断'],
                      ['bypassPermissions', '跳过审批'],
                    ]}
                    onChange={(permission) => onChange({ permission })}
                  />
                  <Choice
                    id="pi-language"
                    label="回复语言"
                    value={agent.language}
                    options={[
                      ['system', '跟随系统'],
                      ['zh-CN', '中文'],
                      ['en-US', 'English'],
                    ]}
                    onChange={(language) => onChange({ language })}
                  />
                </div>
              </div>
            )}
            {section === 'prompts' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-medium">提示词</h3>
                  <p className="text-muted-foreground mt-1 text-xs">让 Pi 了解你的偏好，以及工作的方式。</p>
                </div>
                <Field id="pi-instructions" label="系统提示词">
                  <Textarea
                    id="pi-instructions"
                    className="min-h-44"
                    value={agent.instructions}
                    onChange={(event) => onChange({ instructions: event.target.value })}
                  />
                </Field>
                <div>
                  <h4 className="text-muted-foreground text-xs">已绑定提示词</h4>
                  <Toggle
                    label="产品研究助手"
                    hint="先澄清目标，给出可执行建议，并保留信息来源。"
                    checked={agent.boundPrompt}
                    onChange={(boundPrompt) => onChange({ boundPrompt })}
                  />
                </div>
              </div>
            )}
            {section === 'capabilities' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-medium">能力</h3>
                  <p className="text-muted-foreground mt-1 text-xs">选择这个智能体可以使用的工具和资源。</p>
                </div>
                <div>
                  <h4 className="text-muted-foreground flex justify-between text-xs">
                    <span>Pi 内置工具</span>
                    <span>{Object.values(agent.tools).filter(Boolean).length} / 8 已启用</span>
                  </h4>
                  <div className="grid gap-x-6 sm:grid-cols-2">
                    {Object.entries(PI_TOOLS).map(([key, label]) => (
                      <Toggle
                        key={key}
                        label={label}
                        hint={key}
                        checked={agent.tools[key]}
                        onChange={(checked) => onChange({ tools: { ...agent.tools, [key]: checked } })}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-muted-foreground text-xs">MCP 服务</h4>
                  <Toggle
                    label="浏览器"
                    checked={agent.capabilities.browser}
                    onChange={(checked) => toggleCapability('browser', checked)}
                  />
                  <Toggle
                    label="笔记"
                    checked={agent.capabilities.notes}
                    onChange={(checked) => toggleCapability('notes', checked)}
                  />
                </div>
                <div>
                  <h4 className="text-muted-foreground text-xs">Skills</h4>
                  <Toggle
                    label="资料研究"
                    checked={agent.capabilities.research}
                    onChange={(checked) => toggleCapability('research', checked)}
                  />
                  <Toggle
                    label="写作与整理"
                    checked={agent.capabilities.writing}
                    onChange={(checked) => toggleCapability('writing', checked)}
                  />
                </div>
                <div>
                  <h4 className="text-muted-foreground text-xs">知识库</h4>
                  <Toggle
                    label="产品资料库"
                    checked={agent.capabilities.knowledge}
                    onChange={(checked) => toggleCapability('knowledge', checked)}
                  />
                </div>
              </div>
            )}
            {section === 'automation' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-medium">自动化</h3>
                  <p className="text-muted-foreground mt-1 text-xs">让 Pi 在合适的时间，主动帮你推进工作。</p>
                </div>
                <Toggle
                  label="Heartbeat"
                  hint="按固定间隔检查任务，并在需要时提醒你。"
                  checked={agent.heartbeat}
                  onChange={(heartbeat) => onChange({ heartbeat })}
                />
                <Field id="pi-interval" label="检查间隔（分钟）">
                  <Input
                    id="pi-interval"
                    type="number"
                    min={1}
                    max={1440}
                    value={agent.interval}
                    onChange={(event) =>
                      onChange({ interval: Math.min(1440, Math.max(1, Number(event.target.value) || 1)) })
                    }
                  />
                </Field>
                <p className="text-muted-foreground text-xs">
                  {agent.heartbeat
                    ? `下一次检查将在 ${agent.interval} 分钟后（演示）`
                    : '启用后将按设置的间隔检查任务。'}
                </p>
                <div className="border-border bg-muted/30 rounded-xl border p-4 text-sm leading-7">
                  <h4 className="font-medium">定时任务</h4>
                  <p className="text-muted-foreground">在对话中告诉 Pi 要做什么、何时执行，就可以创建定时任务。</p>
                  <p className="text-muted-foreground mt-3 text-xs">“每周一上午 9 点，帮我整理本周的产品计划。”</p>
                </div>
              </div>
            )}
            {section === 'advanced' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-medium">高级</h3>
                  <p className="text-muted-foreground mt-1 text-xs">运行环境和 Provider 信息。</p>
                </div>
                <div className="border-border space-y-4 rounded-xl border p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">运行时</span>
                    <span>Pi Agent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agent Provider</span>
                    <span>
                      {agent.source === 'builtin' ? 'Cherry' : agent.source === 'local' ? 'Local' : 'Cloud'} · Pi Agent
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">状态</span>
                    <span>已连接</span>
                  </div>
                </div>
                <Field id="pi-env" label="环境变量">
                  <Textarea
                    id="pi-env"
                    placeholder="KEY=value"
                    value={agent.env}
                    onChange={(event) => onChange({ env: event.target.value })}
                  />
                </Field>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('演示检查完成：Pi Agent、工具配置和模型连接正常。')}
                >
                  <ShieldCheck size={14} />
                  运行诊断
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="border-border flex items-center justify-between border-t px-6 py-3">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Check size={13} />
            本次演示中自动保存
          </span>
          <Button
            variant="emphasis"
            size="sm"
            onClick={() => {
              toast.success('智能体设置已保存');
              onClose();
            }}
          >
            保存并返回
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
