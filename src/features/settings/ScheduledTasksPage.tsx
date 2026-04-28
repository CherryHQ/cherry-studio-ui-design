import React, { useState } from 'react';
import {
  Plus, Play, Trash2, Square, Check,
  Clock, ExternalLink, ChevronDown,
  Calendar,
} from 'lucide-react';
import {
  Button, Input, Textarea, SearchInput, EmptyState,
  Popover, PopoverTrigger, PopoverContent,
} from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Types
// ===========================
type ScheduleType = 'cron' | 'interval' | 'once';

interface ScheduledTask {
  id: string;
  name: string;
  agentName: string;
  prompt: string;
  scheduleType: ScheduleType;
  scheduleValue: string;
  timeoutMinutes: number;
  channelId?: string;
  channelName?: string;
  enabled: boolean;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastRunAt?: string;
  nextRunAt?: string;
  runs: TaskRun[];
}

interface TaskRun {
  id: string;
  runTime: string;
  duration: string;
  status: 'success' | 'error' | 'running' | 'timeout';
  result: string;
}

// ===========================
// Mock Data
// ===========================
const INITIAL_TASKS: ScheduledTask[] = [
  {
    id: 't1', name: '看手机提醒', agentName: 'Cherry Assistant', prompt: '提醒：该看手机了！休息一下眼睛吧～', scheduleType: 'once', scheduleValue: '2026-04-15 08:00:00', timeoutMinutes: 2,
    enabled: true, status: 'completed', lastRunAt: '4/15, 08:00', runs: [
      { id: 'r1', runTime: '4/15, 08:00', duration: '18.5s', status: 'success', result: '好的，收到提醒！已经休息了一下眼睛 👀' },
    ],
  },
  {
    id: 't2', name: '吃饭提醒', agentName: 'Cherry Assistant', prompt: '提醒：该吃饭啦！快去吃饭吧～', scheduleType: 'once', scheduleValue: '2026-04-15 06:33:30', timeoutMinutes: 2,
    channelName: 'WeChat 3', enabled: true, status: 'completed', lastRunAt: '4/15, 06:33', nextRunAt: '4/15, 06:34', runs: [
      { id: 'r2', runTime: '4/15, 06:33', duration: '27.2s', status: 'success', result: '哈哈，收到收到！😄 感谢提醒，快去干饭吧，别饿着肚子～ 有什么事回来再说，我随时都在 🤗' },
    ],
  },
  {
    id: 't3', name: '吃饭提醒', agentName: 'Cherry Assistant', prompt: '', scheduleType: 'once', scheduleValue: '', timeoutMinutes: 2,
    enabled: true, status: 'idle', runs: [],
  },
  {
    id: 't4', name: '喝水提醒', agentName: 'Cherry Assistant', prompt: '🥤 喝水时间到！起来倒杯水喝吧～', scheduleType: 'once', scheduleValue: '2026-04-15 06:20:35', timeoutMinutes: 2,
    enabled: true, status: 'completed', lastRunAt: '4/15, 06:20', nextRunAt: '4/15, 06:21', runs: [
      { id: 'r3', runTime: '4/15, 06:20', duration: '36.8s', status: 'success', result: '💧 好的，收到提醒！起来活动活动，喝杯水吧～ 记得小口慢喝，补充水分 💦' },
    ],
  },
  {
    id: 't5', name: '喝水提醒', agentName: 'Cherry Assistant', prompt: '', scheduleType: 'interval', scheduleValue: '', timeoutMinutes: 2,
    enabled: true, status: 'idle', runs: [],
  },
  {
    id: 't6', name: 'AI 新闻一次性推送', agentName: 'Cherry Assistant', prompt: '', scheduleType: 'once', scheduleValue: '', timeoutMinutes: 2,
    enabled: true, status: 'idle', runs: [],
  },
  {
    id: 't7', name: '每日 AI 要闻', agentName: 'Cherry Assistant', prompt: '搜索今天最新的 AI 领域新闻（包括大模型发布、融资新闻、政策变化、重要论文等），整理成简洁的中文摘要（5-8条），用 mcp_claw__notify 发送给用户。格式要求：每条新闻一行，包含标题和一句话概述，末尾标注日期。', scheduleType: 'cron', scheduleValue: '0 10 * * *', timeoutMinutes: 2,
    enabled: true, status: 'running', lastRunAt: '4/27, 04:42', nextRunAt: '4/27, 10:00', runs: [
      { id: 'r10', runTime: '4/27, 04:42', duration: '-', status: 'running', result: '运行中...' },
      { id: 'r4', runTime: '4/26, 10:00', duration: '47.8s', status: 'success', result: 'WeChat 又发不出去了 😅 不过昨天是成功的，可能是通道不稳定，新闻贴这里：—— 🗞**AI 日报 · 2026年4月26日**🔹 1. **OpenClaw 官宣接入 DeepSeek-V4** — V4 Flash成为默认大模型...' },
      { id: 'r5', runTime: '4/25, 10:00', duration: '56.1s', status: 'success', result: '推送成功了！🎉 今天终于通过 WeChat 发出去了。—— 🗞**AI 日报 · 2026年4月25日**🔹 1. **谷歌计划向Anthropic投资最高400亿美元**...' },
      { id: 'r6', runTime: '4/24, 10:00', duration: '45.8s', status: 'success', result: '今天是AI领域超级重磅的一天！让我整理最重要的新闻并发送。WeChat 推送还是失败，今日新闻直接贴这里...' },
      { id: 'r7', runTime: '4/23, 10:00', duration: '54.7s', status: 'error', result: 'WeChat 通道仍然发送失败，新闻直接贴在下面：—— 🗞**AI 日报 · 2026年4月23日**🔹 1. **Google Cloud Next 发布 Gemini Enterprise Agent Platform**...' },
      { id: 'r8', runTime: '4/22, 10:00', duration: '1.8m', status: 'success', result: '好的，我来搜索今天（4月22日）最新的 AI 要闻。WeChat通道仍然发送失败，新闻摘要已经在上面了...' },
      { id: 'r9', runTime: '4/21, 10:00', duration: '59.7s', status: 'success', result: '好的，我来搜索今天（4月21日）最新的AI要闻。今天的新闻非常重磅，整理并发送。微信推送仍然失败...' },
      { id: 'r11', runTime: '4/17, 10:00', duration: '2.0m', status: 'error', result: 'Task timed out after 2 minutes' },
      { id: 'r12', runTime: '4/16, 10:14', duration: '15.7m', status: 'error', result: 'Task timed out after 2 minutes' },
    ],
  },
];

const SCHEDULE_TYPE_OPTIONS = [
  { value: 'cron', label: 'Cron' },
  { value: 'interval', label: '间隔' },
  { value: 'once', label: '一次性' },
];

const MOCK_AGENTS = ['Cherry Assistant', 'AI 助手', '客服机器人', '新闻推送'];
const MOCK_CHANNELS = ['WeChat 3', 'Telegram', 'Feishu', 'Discord', 'Slack'];

// ===========================
// Dropdown Select (reusable)
// ===========================
function DropdownSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center w-full px-2.5 py-[5px] bg-muted/30 rounded-lg border border-section-border text-left hover:bg-muted/50 transition-colors"
          type="button"
        >
          <span className={`flex-1 text-sm truncate ${selected ? 'text-foreground' : 'text-muted-foreground/50'}`}>
            {selected?.label || placeholder || '请选择'}
          </span>
          <ChevronDown size={12} className={`text-muted-foreground/40 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-1 w-[var(--radix-popover-trigger-width)]">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-left transition-colors ${
              opt.value === value ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }`}
          >
            {opt.value === value && <Check size={10} className="flex-shrink-0" />}
            <span className={opt.value === value ? '' : 'pl-[18px]'}>{opt.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ===========================
// Status Badge
// ===========================
function StatusBadge({ status }: { status: ScheduledTask['status'] }) {
  const map = {
    idle: { label: '空闲', cls: 'bg-muted/50 text-muted-foreground' },
    running: { label: '进行中', cls: 'bg-accent-blue/10 text-accent-blue' },
    completed: { label: '已完成', cls: 'bg-success/10 text-success' },
    error: { label: '错误', cls: 'bg-destructive/10 text-destructive' },
  };
  const s = map[status];
  return <span className={`px-1.5 py-[1px] rounded-md text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function RunStatusBadge({ status }: { status: TaskRun['status'] }) {
  const map = {
    success: { label: '成功', cls: 'bg-primary/10 text-primary' },
    error: { label: '错误', cls: 'bg-destructive/10 text-destructive' },
    running: { label: '运行中...', cls: 'bg-accent-blue/10 text-accent-blue' },
    timeout: { label: '超时', cls: 'bg-warning/10 text-warning' },
  };
  const s = map[status];
  return <span className={`px-1.5 py-[1px] rounded-md text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

// ===========================
// Dot Indicator (for sidebar list)
// ===========================
function DotIndicator({ task }: { task: ScheduledTask }) {
  if (task.status === 'running') return <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse flex-shrink-0" />;
  if (task.status === 'completed') return <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />;
  if (task.status === 'error') return <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />;
  if (task.scheduleType === 'cron') return <div className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />;
  return <div className="w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0" />;
}

// ===========================
// Schedule Type Badge
// ===========================
function ScheduleTypeBadge({ type }: { type: ScheduleType }) {
  const map = {
    cron: { label: 'Cron', cls: 'bg-primary/10 text-primary' },
    interval: { label: '间隔', cls: 'bg-accent-blue/10 text-accent-blue' },
    once: { label: '一次性', cls: 'bg-warning/10 text-warning' },
  };
  const s = map[type];
  return <span className={`px-1.5 py-[1px] rounded-md text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

// ===========================
// Task Detail Panel
// ===========================
function TaskDetail({ task, onDelete, onUpdate }: {
  task: ScheduledTask;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ScheduledTask>) => void;
}) {
  const [runSearch, setRunSearch] = useState('');

  const filteredRuns = task.runs.filter(r =>
    !runSearch || r.result.toLowerCase().includes(runSearch.toLowerCase()) || r.runTime.includes(runSearch)
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-section-border flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            <span className="text-sm text-muted-foreground">{task.agentName}</span>
          </div>
          <div className="flex items-center gap-1">
            {task.status === 'running' ? (
              <Tooltip content="停止" side="bottom">
                <Button variant="ghost" size="icon-xs" onClick={() => onUpdate(task.id, { status: 'idle' })} className="w-6 h-6 text-destructive/60 hover:text-destructive hover:bg-destructive/10">
                  <Square size={11} />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content="运行" side="bottom">
                <Button variant="ghost" size="icon-xs" onClick={() => onUpdate(task.id, { status: 'running' })} className="w-6 h-6 text-success/60 hover:text-success hover:bg-success/10">
                  <Play size={11} />
                </Button>
              </Tooltip>
            )}
            <Tooltip content="删除" side="bottom">
              <Button variant="ghost" size="icon-xs" onClick={() => onDelete(task.id)} className="w-6 h-6 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10">
                <Trash2 size={11} />
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
          <ScheduleTypeBadge type={task.scheduleType} />
          {task.scheduleType === 'cron' && (
            <span className="flex items-center gap-1"><Clock size={9} /> {task.scheduleValue}</span>
          )}
          {task.lastRunAt && (
            <span className="flex items-center gap-1"><Calendar size={9} /> 上次运行: {task.lastRunAt}</span>
          )}
          {task.nextRunAt && (
            <span className="flex items-center gap-1"><Calendar size={9} /> 下次运行: {task.nextRunAt}</span>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-5 py-4 border-b border-section-border">
        <p className="text-sm text-foreground font-semibold mb-3">常规设置</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">名称</label>
            <Input defaultValue={task.name} className="h-8 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">绑定 Agent</label>
            <DropdownSelect
              value={task.agentName}
              onChange={(v) => onUpdate(task.id, { agentName: v })}
              options={MOCK_AGENTS.map(a => ({ value: a, label: a }))}
              placeholder="选择要绑定的 Agent"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">提示词</label>
            <Textarea defaultValue={task.prompt} placeholder="当任务运行时 Agent 应该做什么？" className="min-h-[80px] text-sm resize-y" />
          </div>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">调度类型</label>
              <DropdownSelect
                value={task.scheduleType}
                onChange={(v) => onUpdate(task.id, { scheduleType: v as ScheduleType })}
                options={SCHEDULE_TYPE_OPTIONS}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">调度值</label>
              <Input
                defaultValue={task.scheduleValue}
                placeholder={task.scheduleType === 'cron' ? '0 10 * * *' : task.scheduleType === 'interval' ? '间隔（分钟）' : '2026-04-15 06:33:30'}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">超时时间</label>
              <div className="relative">
                <Input defaultValue={String(task.timeoutMinutes)} className="h-8 text-sm w-full pr-10" />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 pointer-events-none">分钟</span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">发送到频道</label>
            <DropdownSelect
              value={task.channelName || ''}
              onChange={(v) => onUpdate(task.id, { channelName: v || undefined })}
              options={[
                { value: '', label: '不发送' },
                ...MOCK_CHANNELS.map(c => ({ value: c, label: c })),
              ]}
              placeholder="选择接收结果的频道"
            />
          </div>
        </div>
      </div>

      {/* Run History Section */}
      <div className="px-5 py-4">
        <p className="text-sm text-foreground font-semibold mb-3">运行历史</p>
        <div className="mb-3">
          <SearchInput
            value={runSearch}
            onChange={setRunSearch}
            placeholder="搜索运行记录..."
            className="h-7"
          />
        </div>
        {filteredRuns.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground/40">暂无运行记录</div>
        ) : (
          <div className="border border-section-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[100px_60px_60px_1fr_28px] gap-2 px-3 py-2 bg-muted/30 border-b border-section-border text-xs text-muted-foreground/60 font-medium">
              <span>运行时间</span>
              <span>耗时</span>
              <span>状态</span>
              <span>结果</span>
              <span />
            </div>
            {filteredRuns.map(run => (
              <div key={run.id} className="grid grid-cols-[100px_60px_60px_1fr_28px] gap-2 px-3 py-2 border-b border-section-border last:border-b-0 items-start text-xs hover:bg-muted/20 transition-colors">
                <span className="text-muted-foreground">{run.runTime}</span>
                <span className="text-muted-foreground">{run.duration}</span>
                <span><RunStatusBadge status={run.status} /></span>
                <span className="text-muted-foreground/80 truncate" title={run.result}>{run.result}</span>
                <Tooltip content="打开详情" side="left">
                  <Button variant="ghost" size="icon-xs" className="w-5 h-5 text-muted-foreground/30 hover:text-foreground">
                    <ExternalLink size={9} />
                  </Button>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// Add Task Form
// ===========================
function AddTaskForm({ onCancel, onSave }: { onCancel: () => void; onSave: (task: Partial<ScheduledTask>) => void }) {
  const [name, setName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('interval');
  const [scheduleValue, setScheduleValue] = useState('');
  const [timeoutMinutes, setTimeoutMinutes] = useState('');
  const [channelName, setChannelName] = useState('');

  const handleSave = () => {
    onSave({
      name: name || '新任务',
      agentName: agentName || 'Cherry Assistant',
      prompt,
      scheduleType,
      scheduleValue,
      timeoutMinutes: Number(timeoutMinutes) || 2,
      channelName: channelName || undefined,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
      <p className="text-sm text-foreground font-semibold mb-4">添加任务</p>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">绑定 Agent</label>
          <DropdownSelect
            value={agentName}
            onChange={setAgentName}
            options={MOCK_AGENTS.map(a => ({ value: a, label: a }))}
            placeholder="选择要绑定的 Agent"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">名称</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="例如：每日代码审查" className="h-8 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">提示词</label>
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="当任务运行时 Agent 应该做什么？" className="min-h-[80px] text-sm resize-y" />
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">调度类型</label>
            <DropdownSelect
              value={scheduleType}
              onChange={(v) => setScheduleType(v as ScheduleType)}
              options={SCHEDULE_TYPE_OPTIONS}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">调度值</label>
            <Input
              value={scheduleValue}
              onChange={e => setScheduleValue(e.target.value)}
              placeholder={scheduleType === 'cron' ? '0 10 * * *' : scheduleType === 'interval' ? '间隔（分钟）' : '2026-04-15 06:33:30'}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">超时时间</label>
            <div className="relative">
              <Input value={timeoutMinutes} onChange={e => setTimeoutMinutes(e.target.value)} placeholder="无限制" className="h-8 text-sm w-full pr-10" />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 pointer-events-none">分钟</span>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">发送到频道</label>
          <DropdownSelect
            value={channelName}
            onChange={setChannelName}
            options={[
              { value: '', label: '不发送' },
              ...MOCK_CHANNELS.map(c => ({ value: c, label: c })),
            ]}
            placeholder="选择接收结果的频道"
          />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
          <Button variant="default" size="sm" onClick={handleSave}>保存</Button>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Main Page
// ===========================
export function ScheduledTasksPage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('t7');
  const [showAddForm, setShowAddForm] = useState(false);

  const selectedTask = tasks.find((t: ScheduledTask) => t.id === selectedTaskId) ?? null;

  const deleteTask = (id: string) => {
    setTasks((prev: ScheduledTask[]) => prev.filter((t: ScheduledTask) => t.id !== id));
    if (selectedTaskId === id) {
      const remaining = tasks.filter((t: ScheduledTask) => t.id !== id);
      setSelectedTaskId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateTask = (id: string, updates: Partial<ScheduledTask>) => {
    setTasks((prev: ScheduledTask[]) => prev.map((t: ScheduledTask) => t.id === id ? { ...t, ...updates } : t));
  };

  const addTask = (partial: Partial<ScheduledTask>) => {
    const newId = `t${Date.now()}`;
    const newTask: ScheduledTask = {
      id: newId,
      name: partial.name || '新任务',
      agentName: partial.agentName || 'Cherry Assistant',
      prompt: partial.prompt || '',
      scheduleType: partial.scheduleType || 'once',
      scheduleValue: partial.scheduleValue || '',
      timeoutMinutes: partial.timeoutMinutes || 2,
      channelName: partial.channelName,
      enabled: true,
      status: 'idle',
      runs: [],
    };
    setTasks((prev: ScheduledTask[]) => [...prev, newTask]);
    setShowAddForm(false);
    setSelectedTaskId(newId);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar: Task List */}
      <div className="w-[170px] flex-shrink-0 flex flex-col border-r border-section-border min-h-0">
        <div className="px-3.5 pt-4 pb-2 flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">定时任务</p>
          <Tooltip content="添加任务" side="right">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => { setShowAddForm(true); setSelectedTaskId(null); }}
              className="w-5 h-5 text-muted-foreground/60 hover:text-foreground"
            >
              <Plus size={12} />
            </Button>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin-xs">
          <div className="space-y-[2px]">
            {tasks.map((task: ScheduledTask) => {
              const isSelected = selectedTaskId === task.id && !showAddForm;
              return (
                <Button size="inline"
                  key={task.id}
                  variant="ghost"
                  onClick={() => { setSelectedTaskId(task.id); setShowAddForm(false); }}
                  className={`w-full flex items-start gap-2 px-3 py-[7px] text-left relative ${
                    isSelected
                      ? 'bg-cherry-active-bg'
                      : 'border border-transparent hover:bg-accent/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl border border-cherry-active-border pointer-events-none" />
                  )}
                  <DotIndicator task={task} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-foreground'}`}>{task.name}</p>
                    <p className="text-xs text-muted-foreground/50 truncate">{task.agentName} · {SCHEDULE_TYPE_OPTIONS.find(o => o.value === task.scheduleType)?.label}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel: Detail / Add Form */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {showAddForm ? (
          <AddTaskForm
            onCancel={() => { setShowAddForm(false); if (tasks.length > 0) setSelectedTaskId(tasks[0].id); }}
            onSave={addTask}
          />
        ) : selectedTask ? (
          <TaskDetail task={selectedTask} onDelete={deleteTask} onUpdate={updateTask} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={<Clock size={24} />} title="选择一个任务" description="从左侧选择一个定时任务查看详情" />
          </div>
        )}
      </div>
    </div>
  );
}
