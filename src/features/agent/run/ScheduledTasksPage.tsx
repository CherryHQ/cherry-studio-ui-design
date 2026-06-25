import React, { useMemo, useState } from 'react';
import {
  Clock, Plus, ChevronDown, Sparkles, MoreHorizontal,
  Play, Pencil, Pause, Trash2, Monitor, Cable,
  ArrowLeft, CheckCircle2, AlertCircle, Loader2,
  CirclePause, CirclePlay,
} from 'lucide-react';
import {
  Button, Input, Textarea, Switch, Separator, ScrollArea,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  EmptyState,
} from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { AVAILABLE_AGENTS } from '@/app/config/agentTools';
import {
  MOCK_SCHEDULED_TASKS,
  type ScheduledTask, type ScheduledTaskRunMode, type ScheduledTaskRunStatus,
} from '@/app/mock';

// ===========================
// Schedule cadence presets
// ===========================

const REPEAT_OPTIONS = ['每天', '每个工作日', '每周一', '每 6 小时', '每小时'] as const;
const CHANNEL_OPTIONS = ['飞书', '企业微信', 'QQ', '邮件'] as const;
// "每小时" / "每 6 小时" don't need a clock time; the others do.
const repeatNeedsTime = (repeat: string) => !repeat.includes('小时');
const composeSchedule = (repeat: string, time: string) =>
  repeatNeedsTime(repeat) ? `${repeat} ${time}` : repeat;

// ===========================
// Run-mode badge — 应用内 vs 绑定渠道
// ===========================

function RunModeBadge({ task }: { task: ScheduledTask }) {
  if (task.runMode === 'in-app') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-xs bg-accent/30 text-muted-foreground/70">
        <Monitor size={9} className="text-muted-foreground/50" />
        应用内
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-xs bg-info/10 text-info/80">
      <Cable size={9} className="text-info/60" />
      {task.channel}
    </span>
  );
}

// ===========================
// Task Row
// ===========================

function TaskRow({ task, onClick, onToggle, onRun, onEdit, onDelete }: {
  task: ScheduledTask;
  onClick: () => void;
  onToggle: () => void;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isActive = task.status === 'active';
  // Keep the action cluster visible while the 更多 menu is open, even after
  // the pointer leaves the row.
  const [menuOpen, setMenuOpen] = useState(false);

  const iconBtn = 'p-1 w-auto h-auto text-muted-foreground/50 hover:text-foreground hover:bg-accent/50';

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
    >
      {/* Status dot */}
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        isActive ? 'bg-info' : 'bg-muted-foreground/30'
      }`} />

      {/* Agent avatar */}
      <span className="text-base leading-none flex-shrink-0">{task.agentAvatar}</span>

      {/* Name + agent */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={`text-sm truncate ${isActive ? 'text-foreground' : 'text-muted-foreground/70'}`}>
          {task.name}
        </span>
        <span className="text-xs text-muted-foreground/40 truncate hidden sm:inline">
          {task.agentName}
        </span>
        <RunModeBadge task={task} />
      </div>

      {/* Right: schedule by default, action icons on hover (or while menu open) */}
      <div className="flex items-center flex-shrink-0">
        {/* Schedule — hidden on hover / when menu open */}
        <span className={`text-xs text-muted-foreground/50 tabular-nums ${
          menuOpen ? 'hidden' : 'group-hover:hidden'
        }`}>
          {task.schedule}
        </span>

        {/* Action cluster */}
        <div className={`items-center gap-0.5 ${menuOpen ? 'flex' : 'hidden group-hover:flex'}`}>
          <Button variant="ghost" size="icon-xs" title="立即启动"
            onClick={(e) => { e.stopPropagation(); onRun(); }} className={iconBtn}>
            <Play size={13} />
          </Button>
          <Button variant="ghost" size="icon-xs" title="编辑"
            onClick={(e) => { e.stopPropagation(); onEdit(); }} className={iconBtn}>
            <Pencil size={13} />
          </Button>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" title="更多"
                onClick={(e) => e.stopPropagation()} className={iconBtn}>
                <MoreHorizontal size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem className="gap-2 text-xs" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
                {isActive
                  ? <><Pause size={12} className="text-muted-foreground" /> 暂停</>
                  : <><Play size={12} className="text-muted-foreground" /> 启用</>}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs text-destructive/80" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 size={12} /> 删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Create / Edit dialog
// ===========================

interface TaskFormState {
  name: string;
  agentName: string;
  repeat: string;
  time: string;
  inApp: boolean;
  channel: string;
  prompt: string;
}

function emptyForm(): TaskFormState {
  return {
    name: '',
    agentName: AVAILABLE_AGENTS[0]?.name ?? '',
    repeat: '每天',
    time: '09:00',
    inApp: true,
    channel: CHANNEL_OPTIONS[0],
    prompt: '',
  };
}

function taskToForm(t: ScheduledTask): TaskFormState {
  const needsTime = repeatNeedsTime(t.schedule.split(' ')[0]);
  return {
    name: t.name,
    agentName: t.agentName,
    repeat: needsTime ? t.schedule.replace(/\s\d{1,2}:\d{2}$/, '') : t.schedule,
    time: needsTime ? (t.schedule.match(/\d{1,2}:\d{2}$/)?.[0] ?? '09:00') : '09:00',
    inApp: t.runMode === 'in-app',
    channel: t.channel ?? CHANNEL_OPTIONS[0],
    prompt: t.prompt,
  };
}

function ScheduledTaskDialog({ open, initial, onClose, onSave }: {
  open: boolean;
  initial: ScheduledTask | null;
  onClose: () => void;
  onSave: (form: TaskFormState) => void;
}) {
  const [form, setForm] = useState<TaskFormState>(emptyForm);

  // Re-seed the form whenever the dialog opens.
  React.useEffect(() => {
    if (open) setForm(initial ? taskToForm(initial) : emptyForm());
  }, [open, initial]);

  const set = <K extends keyof TaskFormState>(k: K, v: TaskFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const canSave = form.name.trim().length > 0 && form.prompt.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-base">{initial ? '编辑自动化' : '新建自动化'}</DialogTitle>
          <DialogDescription className="text-xs">
            让智能体按计划自动运行。无需绑定外部渠道，也可在应用内直接得到结果。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* 名称 */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground/70">任务名称</label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="例如：每日金价提醒"
              className="h-9 text-sm"
              autoFocus
            />
          </div>

          {/* 智能体 */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground/70">关联智能体</label>
            <Select value={form.agentName} onValueChange={(v) => set('agentName', v)}>
              <SelectTrigger className="!h-9 w-full px-3 text-sm border border-border/60 bg-accent/15 hover:bg-accent/40 rounded-lg">
                <SelectValue placeholder="选择智能体" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_AGENTS.map(a => (
                  <SelectItem key={a.id} value={a.name}>
                    <span className="inline-flex items-center gap-2">
                      <span className="text-sm">{a.avatar}</span>
                      <span>{a.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 频率 */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground/70">重复频率</label>
            <div className="flex items-center gap-2">
              <Select value={form.repeat} onValueChange={(v) => set('repeat', v)}>
                <SelectTrigger className="!h-9 flex-1 px-3 text-sm border border-border/60 bg-accent/15 hover:bg-accent/40 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPEAT_OPTIONS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {repeatNeedsTime(form.repeat) && (
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                  className="h-9 w-[120px] text-sm tabular-nums"
                />
              )}
            </div>
          </div>

          <Separator opacity={30} />

          {/* 运行方式 — 解绑渠道 是会上明确的优化点 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm text-foreground">在应用内运行</div>
                <div className="text-xs text-muted-foreground/50 leading-snug mt-0.5">
                  无需绑定飞书 / QQ 等渠道，结果直接进入会话
                </div>
              </div>
              <Switch checked={form.inApp} onCheckedChange={(v) => set('inApp', v)} />
            </div>
            <AnimatePresence initial={false}>
              {!form.inApp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="pt-1">
                    <Select value={form.channel} onValueChange={(v) => set('channel', v)}>
                      <SelectTrigger className="!h-9 w-full px-3 text-sm border border-border/60 bg-accent/15 hover:bg-accent/40 rounded-lg">
                        <SelectValue placeholder="选择推送渠道" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNEL_OPTIONS.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 提示词 */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground/70">提示词</label>
            <Textarea
              value={form.prompt}
              onChange={(e) => set('prompt', e.target.value)}
              placeholder="每次运行时发送给智能体的指令…"
              rows={3}
              className="text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" disabled={!canSave} onClick={() => onSave(form)}>
            {initial ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===========================
// Run status indicator (history list)
// ===========================

function RunStatusIcon({ status }: { status: ScheduledTaskRunStatus }) {
  if (status === 'running') return <Loader2 size={13} className="text-info animate-spin flex-shrink-0" />;
  if (status === 'failed') return <AlertCircle size={13} className="text-warning flex-shrink-0" />;
  return <CheckCircle2 size={13} className="text-success/70 flex-shrink-0" />;
}

const RUN_STATUS_LABEL: Record<ScheduledTaskRunStatus, string> = {
  success: '成功',
  running: '运行中',
  failed: '失败',
};

// ===========================
// Task Detail (cowork-style)
// ===========================

function ScheduledTaskDetail({ task, onBack, onRun, onEdit, onToggle, onDelete }: {
  task: ScheduledTask;
  onBack: () => void;
  onRun: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isActive = task.status === 'active';
  const lastStatus = task.runs[0]?.status;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-[38px] flex-shrink-0">
        <Button variant="ghost" size="inline" onClick={onBack}
          className="gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40">
          <ArrowLeft size={13} /> 自动化
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" title={isActive ? '暂停' : '启用'} onClick={onToggle}
            className="p-1 w-auto h-auto text-muted-foreground/60 hover:text-foreground hover:bg-accent/50">
            {isActive ? <CirclePause size={15} /> : <CirclePlay size={15} />}
          </Button>
          <Button variant="ghost" size="icon-xs" title="编辑" onClick={onEdit}
            className="p-1 w-auto h-auto text-muted-foreground/60 hover:text-foreground hover:bg-accent/50">
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="icon-xs" title="删除" onClick={onDelete}
            className="p-1 w-auto h-auto text-muted-foreground/60 hover:text-destructive hover:bg-destructive/8">
            <Trash2 size={14} />
          </Button>
          <Button size="sm" onClick={onRun} className="gap-1.5 h-7 px-2.5 text-xs ml-1">
            <Play size={13} /> 立即启动
          </Button>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-[760px] mx-auto px-6 pb-12 pt-3">
          {/* Title block */}
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{task.name}</h1>
          <p className="text-sm text-muted-foreground/60 mt-1">{task.description}</p>
          <div className="mt-3">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-xs bg-success/10 text-success/80">
                <CheckCircle2 size={11} /> 运行中
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-xs bg-accent/40 text-muted-foreground/70">
                <Pause size={11} /> 已暂停
              </span>
            )}
          </div>

          <Separator opacity={20} className="my-5" />

          {/* Two columns — details on the left, run history on the right */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
            {/* Left — Agent / Instructions / Runs */}
            <div className="space-y-6">
              {/* 关联智能体 */}
              <section>
                <div className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em] mb-2">关联智能体</div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl leading-none">{task.agentAvatar}</span>
                  <span className="text-sm text-foreground">{task.agentName}</span>
                </div>
              </section>

              {/* 提示词 */}
              <section>
                <div className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em] mb-2">提示词</div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{task.prompt}</p>
              </section>

              {/* 运行计划 */}
              <section>
                <div className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em] mb-2">运行计划</div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Clock size={13} className="text-muted-foreground/50" />
                  <span>{task.schedule}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-muted-foreground/60">下次 {task.nextRun}</span>
                </div>
              </section>

              {/* 运行方式 */}
              <section>
                <div className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em] mb-2">运行方式</div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  {task.runMode === 'in-app' ? (
                    <><Monitor size={13} className="text-muted-foreground/50" /> 应用内运行（无需绑定渠道）</>
                  ) : (
                    <><Cable size={13} className="text-info/60" /> 推送到 {task.channel}</>
                  )}
                </div>
              </section>

              {lastStatus === 'failed' && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-warning/8 text-xs text-warning/90">
                  <AlertCircle size={13} className="flex-shrink-0 mt-px" />
                  <span>最近一次运行失败，可点击「立即启动」重试。</span>
                </div>
              )}
            </div>

            {/* Right — History */}
            <div>
              <div className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em] mb-2.5">历史记录</div>
              {task.runs.length === 0 ? (
                <div className="text-xs text-muted-foreground/40 py-2">暂无运行记录</div>
              ) : (
                <div className="space-y-px">
                  {task.runs.map(run => (
                    <div key={run.id}
                      className="group flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-accent/30 transition-colors cursor-pointer">
                      <RunStatusIcon status={run.status} />
                      <span className="text-sm text-foreground/80 flex-1 truncate">{run.time}</span>
                      <span className={`text-xs flex-shrink-0 ${
                        run.status === 'failed' ? 'text-warning/80'
                          : run.status === 'running' ? 'text-info/80'
                          : 'text-muted-foreground/40'
                      }`}>
                        {RUN_STATUS_LABEL[run.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ===========================
// Scheduled Tasks Page (Codex "Automations" style)
// ===========================

export function ScheduledTasksPage({ onRunTask, initialDetailId = null }: {
  /** Fire a task once now. The host creates a session in the list (under the
   *  task's agent / folder) and navigates to it. Falls back to a toast. */
  onRunTask?: (task: ScheduledTask) => void;
  /** When provided, open straight into that task's detail (used by the
   *  "来自定时任务" return bar). Null = land on the list. */
  initialDetailId?: string | null;
} = {}) {
  const [tasks, setTasks] = useState<ScheduledTask[]>(MOCK_SCHEDULED_TASKS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduledTask | null>(null);
  // When set, the detail page for that task takes over the content area.
  const [detailId, setDetailId] = useState<string | null>(initialDetailId);

  const active = useMemo(() => tasks.filter(t => t.status === 'active'), [tasks]);
  const paused = useMemo(() => tasks.filter(t => t.status === 'paused'), [tasks]);
  const detailTask = detailId ? tasks.find(t => t.id === detailId) ?? null : null;

  const runTask = (t: ScheduledTask) => onRunTask
    ? onRunTask(t)
    : toast.success(`已启动「${t.name}」`, { description: '本次运行将在后台执行，结果回到会话' });

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (t: ScheduledTask) => { setEditing(t); setDialogOpen(true); };

  const handleSave = (form: TaskFormState) => {
    const agent = AVAILABLE_AGENTS.find(a => a.name === form.agentName);
    const runMode: ScheduledTaskRunMode = form.inApp ? 'in-app' : 'channel';
    const schedule = composeSchedule(form.repeat, form.time);
    if (editing) {
      setTasks(prev => prev.map(t => t.id === editing.id ? {
        ...t,
        name: form.name.trim(),
        agentName: form.agentName,
        agentAvatar: agent?.avatar ?? t.agentAvatar,
        schedule,
        runMode,
        channel: form.inApp ? undefined : form.channel,
        prompt: form.prompt.trim(),
      } : t));
    } else {
      setTasks(prev => [{
        id: `st-${Date.now()}`,
        name: form.name.trim(),
        description: `${schedule}运行`,
        agentName: form.agentName,
        agentAvatar: agent?.avatar ?? '🤖',
        schedule,
        runMode,
        channel: form.inApp ? undefined : form.channel,
        status: 'active',
        nextRun: repeatNeedsTime(form.repeat) ? `今天 ${form.time}` : '即将运行',
        prompt: form.prompt.trim(),
        runs: [],
      }, ...prev]);
    }
    setDialogOpen(false);
  };

  const toggleStatus = (id: string) =>
    setTasks(prev => prev.map(t => t.id === id
      ? { ...t, status: t.status === 'active' ? 'paused' : 'active', nextRun: t.status === 'active' ? '已暂停' : t.nextRun }
      : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const renderRow = (t: ScheduledTask) => (
    <TaskRow
      key={t.id}
      task={t}
      onClick={() => setDetailId(t.id)}
      onToggle={() => toggleStatus(t.id)}
      onRun={() => runTask(t)}
      onEdit={() => openEdit(t)}
      onDelete={() => deleteTask(t.id)}
    />
  );

  if (detailTask) {
    return (
      <>
        <ScheduledTaskDetail
          task={detailTask}
          onBack={() => setDetailId(null)}
          onRun={() => runTask(detailTask)}
          onEdit={() => openEdit(detailTask)}
          onToggle={() => toggleStatus(detailTask.id)}
          onDelete={() => { deleteTask(detailTask.id); setDetailId(null); }}
        />
        <ScheduledTaskDialog
          open={dialogOpen}
          initial={editing}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 h-[38px] flex-shrink-0">
        <div className="flex items-center gap-1.5 text-muted-foreground/50">
          <Clock size={12} />
          <span className="text-xs">自动化</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 h-7 px-2.5 text-xs">
              <Plus size={13} /> 手动创建
              <ChevronDown size={11} className="opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2 text-xs" onClick={openCreate}>
              <Pencil size={12} className="text-muted-foreground" /> 手动创建
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs" onClick={openCreate}>
              <Sparkles size={12} className="text-cherry-primary" /> 用 AI 创建
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-[720px] mx-auto px-5 pb-10 pt-4">
          <h1 className="text-xl text-foreground tracking-tight mb-0.5">自动化</h1>
          <p className="text-xs text-muted-foreground/40 mb-6">
            让智能体按计划自动运行，结果直接回到会话或推送到你绑定的渠道。
          </p>

          {tasks.length === 0 ? (
            <div className="py-16">
              <EmptyState
                preset="no-session"
                title="还没有自动化任务"
                description="创建一个，让智能体定时为你工作"
              />
            </div>
          ) : (
            <div className="space-y-7">
              {/* 进行中 */}
              <section>
                <div className="flex items-center gap-2 px-1 mb-1.5">
                  <span className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em]">进行中</span>
                  <span className="text-xs text-muted-foreground/30 tabular-nums">{active.length}</span>
                </div>
                <Separator opacity={20} className="mb-1" />
                {active.length > 0
                  ? active.map(renderRow)
                  : <div className="px-3 py-4 text-xs text-muted-foreground/40">暂无进行中的任务</div>}
              </section>

              {/* 已暂停 */}
              {paused.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 px-1 mb-1.5">
                    <span className="text-xs text-muted-foreground/50 uppercase tracking-[0.06em]">已暂停</span>
                    <span className="text-xs text-muted-foreground/30 tabular-nums">{paused.length}</span>
                  </div>
                  <Separator opacity={20} className="mb-1" />
                  {paused.map(renderRow)}
                </section>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <ScheduledTaskDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
