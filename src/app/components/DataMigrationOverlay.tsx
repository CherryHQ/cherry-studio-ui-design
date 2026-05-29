import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  MessageSquare, Settings, Database, Layers, Sparkles,
  FileText, ArrowRight, ArrowLeft, AlertTriangle, RefreshCw, Bug, SkipForward, Shield,
  Clock, HardDrive, Power, Plug, FolderOpen, ShieldCheck,
} from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';

// ===========================
// Types
// ===========================
type StepStatus = 'pending' | 'running' | 'completed' | 'error' | 'skipped';

interface MigrationStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: StepStatus;
  progress?: number;
  detail?: string;
  count?: { done: number; total: number };
}

// Multi-screen flow mirroring the structure proposed in
// CherryHQ/cherry-studio#13547. Four wizard steps with a step indicator
// at the top, plus a decline-confirm modal that gates a permanent skip.
//   0. checking          — pre-step probe for V1 data (per PR #13764)
//      no-v1             — fresh install detected, auto-closes
//   1. intro             — overview + safety highlights
//   2. backup-choose     — pick backup mode (create / use existing)
//      backup-running    — backup in progress
//      backup-ready      — backup done, ready to start migration
//   3. running           — actual data migration
//   4. completed / failed
type Screen =
  | 'checking' | 'no-v1' | 'concurrent'
  | 'intro' | 'backup-choose' | 'backup-running' | 'backup-ready'
  | 'running' | 'completed' | 'failed' | 'decline-confirm'
  | 'cancel-confirm' | 'cancelled';
export type MigrationCloseReason = 'completed' | 'declined' | 'postponed' | 'no-v1';
type BackupChoice = 'create' | 'existing';
// Numeric step indicator (1-4) per current screen — drives the dot rail
// at the top of the wizard. Pre-step screens (checking / no-v1) and
// the decline-confirm modal hide the rail.
const STEP_NUMBER: Partial<Record<Screen, 1 | 2 | 3 | 4>> = {
  intro: 1,
  'backup-choose': 2,
  'backup-running': 2,
  'backup-ready': 2,
  running: 3,
  completed: 4,
  failed: 4,
};

const MIGRATION_STEPS: MigrationStep[] = [
  { id: 'validate', label: '检测旧版数据', icon: <FileText size={14} />, status: 'pending', detail: '扫描 V1 数据库结构' },
  { id: 'settings', label: '迁移系统设置', icon: <Settings size={14} />, status: 'pending', detail: '模型配置、主题、快捷键', count: { done: 0, total: 24 } },
  { id: 'conversations', label: '迁移对话记录', icon: <MessageSquare size={14} />, status: 'pending', detail: '聊天记录、上下文、附件', count: { done: 0, total: 358 } },
  { id: 'assistants', label: '迁移助手 & 智能体', icon: <Sparkles size={14} />, status: 'pending', detail: '自定义助手、Agent 配置', count: { done: 0, total: 12 } },
  { id: 'knowledge', label: '迁移知识库', icon: <Database size={14} />, status: 'pending', detail: '文档、嵌入向量', count: { done: 0, total: 67 } },
  { id: 'assets', label: '迁移附件资源', icon: <Layers size={14} />, status: 'pending', detail: '图片、文件、音频', count: { done: 0, total: 143 } },
];

// ===========================
// Data Migration Overlay
// ===========================
export function DataMigrationOverlay({ onClose }: { onClose: (reason: MigrationCloseReason) => void }) {
  // Per PR #13764 — probe for V1 data before showing the wizard. Default
  // start is 'checking'; the effect below decides intro vs no-v1. To
  // demo the fresh-install path, append `?nov1=1` to the URL (the
  // overlay reads the param at mount).
  const [screen, setScreen] = useState<Screen>('checking');
  const [previousScreen, setPreviousScreen] = useState<Screen>('intro');
  const [steps, setSteps] = useState<MigrationStep[]>(MIGRATION_STEPS);
  const [showLog, setShowLog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  // Backup-screen state — choice persists across the three backup
  // sub-stages; backupProgress drives the loading bar.
  const [backupChoice, setBackupChoice] = useState<BackupChoice>('create');
  const [backupProgress, setBackupProgress] = useState(0);
  // Intro-screen acknowledgement — user must tick the confirmation
  // before "下一步" enables.
  const [acknowledged, setAcknowledged] = useState(false);
  // Dev-only toggle (small Bug button in the ready footer) — forces the
  // current run to fail on the conversations step so the design can be
  // viewed end-to-end without waiting for a real error path.
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [failedStepIdx, setFailedStepIdx] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set to true once the user clicks "重新检查" on the concurrent screen
  // — for the design demo this fakes the other window finishing so the
  // re-probe lands on intro instead of looping back to concurrent.
  const concurrentClearedRef = useRef(false);

  const totalProgress = (() => {
    const completed = steps.filter((s: MigrationStep) => s.status === 'completed' || s.status === 'skipped').length;
    const running = steps.find((s: MigrationStep) => s.status === 'running');
    const runningFrac = running?.progress ? running.progress / 100 : 0;
    return Math.round(((completed + runningFrac) / steps.length) * 100);
  })();

  const addLog = useCallback((msg: string) => {
    setLogs((prev: string[]) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const advanceStep = useCallback((stepIdx: number, opts: { failNext?: boolean } = {}) => {
    if (stepIdx >= MIGRATION_STEPS.length) {
      setScreen('completed');
      addLog('All migration steps completed successfully.');
      return;
    }

    const step = MIGRATION_STEPS[stepIdx];
    addLog(`Starting: ${step.label}`);

    setSteps((prev: MigrationStep[]) => prev.map((s: MigrationStep, i: number) =>
      i === stepIdx ? { ...s, status: 'running' as const, progress: 0 } : s
    ));

    // Inject failure mid-step when the dev flag is on (or honored once
    // via opts.failNext during retry-then-fail flows). Picked the
    // conversations step (idx 2) because it has the highest item count
    // and reads as a believable failure spot.
    const shouldFail = opts.failNext && stepIdx === 2;

    let progress = 0;
    const totalItems = step.count?.total || 0;
    const failAtFraction = 0.4 + Math.random() * 0.25; // 40-65% through
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 4;
      if (shouldFail && progress >= failAtFraction * 100) {
        clearInterval(interval);
        const reason = '校验失败：检测到 3 条会话引用了已删除的助手 ID (assistant_4f7c92)，无法迁移。';
        setSteps((prev: MigrationStep[]) => prev.map((s: MigrationStep, i: number) =>
          i === stepIdx ? { ...s, status: 'error' as const } : s
        ));
        setFailedStepIdx(stepIdx);
        setErrorMessage(reason);
        addLog(`ERROR: ${step.label} — ${reason}`);
        setScreen('failed');
        return;
      }
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setSteps((prev: MigrationStep[]) => prev.map((s: MigrationStep, i: number) =>
          i === stepIdx
            ? { ...s, status: 'completed' as const, progress: 100, count: totalItems ? { done: totalItems, total: totalItems } : s.count }
            : s
        ));
        addLog(`Completed: ${step.label}${totalItems ? ` (${totalItems} items)` : ''}`);
        stepTimerRef.current = setTimeout(() => advanceStep(stepIdx + 1, opts), 400);
      } else {
        const done = totalItems ? Math.floor((progress / 100) * totalItems) : undefined;
        setSteps((prev: MigrationStep[]) => prev.map((s: MigrationStep, i: number) =>
          i === stepIdx
            ? { ...s, progress: Math.min(progress, 100), count: done !== undefined ? { done, total: totalItems } : s.count }
            : s
        ));
      }
    }, 180 + Math.random() * 250);

    timerRef.current = interval;
  }, [addLog]);

  const handleStart = useCallback(() => {
    setScreen('running');
    setSteps(MIGRATION_STEPS);
    setLogs([]);
    setElapsed(0);
    setFailedStepIdx(null);
    setErrorMessage('');
    addLog('Data migration from V1 to V2 started...');
    advanceStep(0, { failNext: simulateFailure });
  }, [addLog, advanceStep, simulateFailure]);

  // Backup step — simulate file copy with a fake progress bar. On
  // success, screen advances to 'backup-ready'; user can then start
  // the actual migration.
  const runBackup = useCallback(() => {
    setScreen('backup-running');
    setBackupProgress(0);
    addLog(`Backup started (${backupChoice === 'create' ? 'create new' : 'use existing'}).`);
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 15 + 6;
      if (p >= 100) {
        clearInterval(tick);
        setBackupProgress(100);
        addLog('Backup completed.');
        // Briefly hold at 100% so the user sees the bar full before the
        // page swaps — feels more deliberate than a snap-transition.
        setTimeout(() => setScreen('backup-ready'), 350);
      } else {
        setBackupProgress(p);
      }
    }, 220);
    timerRef.current = tick;
  }, [backupChoice, addLog]);

  // Open the decline-confirm modal but remember which screen we came
  // from so the 返回 button restores it (intro, backup-choose, …).
  const openDecline = useCallback(() => {
    setPreviousScreen(screen);
    setScreen('decline-confirm');
  }, [screen]);

  // Cancel during running — confirm first because a half-done migration
  // can't be silently undone. On confirm: stop all timers, mark the
  // in-flight step as skipped, and land on the cancelled summary so the
  // user can choose to restart or exit.
  const requestCancel = useCallback(() => {
    setPreviousScreen('running');
    setScreen('cancel-confirm');
  }, []);

  const confirmCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    setSteps((prev: MigrationStep[]) => prev.map((s) =>
      s.status === 'running' ? { ...s, status: 'skipped' as const } : s
    ));
    addLog('Migration cancelled by user.');
    setScreen('cancelled');
  }, [addLog]);

  const restartFromCancelled = useCallback(() => {
    setSteps(MIGRATION_STEPS);
    setBackupProgress(0);
    setAcknowledged(false);
    setFailedStepIdx(null);
    setErrorMessage('');
    setSimulateFailure(false);
    setScreen('intro');
  }, []);

  const handleRetry = useCallback(() => {
    if (failedStepIdx === null) return;
    addLog(`Retrying: ${MIGRATION_STEPS[failedStepIdx].label}`);
    // Mark the failed step back to pending and resume — disable the
    // simulate flag on retry so the same step actually completes.
    setSteps((prev: MigrationStep[]) => prev.map((s: MigrationStep, i: number) =>
      i === failedStepIdx ? { ...s, status: 'pending' as const, progress: 0 } : s
    ));
    setFailedStepIdx(null);
    setErrorMessage('');
    setSimulateFailure(false);
    setScreen('running');
    advanceStep(failedStepIdx, { failNext: false });
  }, [failedStepIdx, addLog, advanceStep]);

  const handleSkipFailedStep = useCallback(() => {
    if (failedStepIdx === null) return;
    addLog(`Skipped: ${MIGRATION_STEPS[failedStepIdx].label}`);
    setSteps((prev: MigrationStep[]) => prev.map((s: MigrationStep, i: number) =>
      i === failedStepIdx ? { ...s, status: 'skipped' as const } : s
    ));
    const nextIdx = failedStepIdx + 1;
    setFailedStepIdx(null);
    setErrorMessage('');
    setSimulateFailure(false);
    setScreen('running');
    advanceStep(nextIdx, { failNext: false });
  }, [failedStepIdx, addLog, advanceStep]);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    if (screen === 'running') {
      t = setInterval(() => setElapsed((e: number) => e + 1), 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [screen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, []);

  // Pre-step probe. In production this would touch the file system /
  // Dexie AND check an inter-process lock; here it's a 750ms artificial
  // check. Demo flags:
  //   ?nov1=1        → fresh-install path
  //   ?concurrent=1  → another window is already migrating (PR #13900)
  useEffect(() => {
    if (screen !== 'checking') return;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const simulateFresh = params?.get('nov1') === '1';
    const simulateConcurrent = params?.get('concurrent') === '1' && !concurrentClearedRef.current;
    addLog('Probing for V1 data…');
    const t = setTimeout(() => {
      if (simulateConcurrent) {
        addLog('Another migration is already running. Waiting.');
        setScreen('concurrent');
      } else if (simulateFresh) {
        addLog('No V1 data found. Skipping migration.');
        setScreen('no-v1');
      } else {
        addLog('V1 data detected. Migration wizard available.');
        setScreen('intro');
      }
    }, 750);
    return () => clearTimeout(t);
  }, [screen, addLog]);

  // When the no-v1 screen renders, hold ~1.6s so the user sees the
  // confirmation, then auto-close. The onClose call uses the new
  // 'no-v1' reason so the parent can persist + suppress next launch.
  useEffect(() => {
    if (screen !== 'no-v1') return;
    const t = setTimeout(() => onClose('no-v1'), 1600);
    return () => clearTimeout(t);
  }, [screen, onClose]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
    >
      <div className="w-full max-w-[480px] px-6">
        {/* Step rail — shows the 4-step wizard position (intro / backup /
            running / done). Hidden on pre-step probes (checking / no-v1)
            and on the decline-confirm modal. */}
        {STEP_NUMBER[screen] && (
          <div className="flex items-center justify-center gap-2 mb-7">
            {[1, 2, 3, 4].map((n) => {
              const cur = STEP_NUMBER[screen]!;
              const done = n < cur;
              const active = n === cur;
              return (
                <React.Fragment key={n}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-medium transition-colors
                    ${done ? 'bg-primary/15 text-primary border border-primary/30' :
                      active ? 'bg-primary text-primary-foreground' :
                      'bg-muted/40 text-muted-foreground/40 border border-border/20'}`}
                  >
                    {done ? <CheckCircle2 size={11} strokeWidth={2.5} /> : n}
                  </div>
                  {n < 4 && <div className={`h-px w-6 ${n < cur ? 'bg-primary/30' : 'bg-border/30'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Pre-step probe — show while we ask the data layer whether V1
            data even exists. Brief so the user perceives it as the app's
            startup splash, not an extra step. */}
        {screen === 'checking' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-info/10 border border-info/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} strokeWidth={1.4} className="text-info animate-spin" />
              </div>
              <h1 className="text-base font-medium text-foreground">正在检测 V1 数据…</h1>
              <p className="text-xs text-muted-foreground/55 mt-1.5">扫描旧版数据库，决定是否需要迁移</p>
            </div>
          </motion.div>
        )}

        {/* Concurrent — another window is already running the migration
            (PR #13900). Hold this window in a friendly wait state instead
            of letting it kick off a second concurrent run. */}
        {screen === 'concurrent' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-info/12 border border-info/25 flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} strokeWidth={1.4} className="text-info animate-spin" />
              </div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">另一个窗口正在迁移</h1>
              <p className="text-sm text-muted-foreground/65 mt-2 leading-relaxed">
                V1 → V2 数据迁移需要独占进程。请等待对方完成，或切换过去查看进度。
              </p>
            </div>

            <div className="rounded-xl border border-border/30 bg-muted/10 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground/70">对方进度</span>
                <span className="text-muted-foreground/55 tabular-nums">约 68%</span>
              </div>
              <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-info/70 rounded-full" style={{ width: '68%' }} />
              </div>
              <p className="text-[10px] text-muted-foreground/55">最后心跳：12 秒前</p>
            </div>

            <div className="space-y-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => { concurrentClearedRef.current = true; setScreen('checking'); }}
                className="w-full gap-2"
              >
                <RefreshCw size={13} />
                重新检查
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onClose('postponed')} className="w-full text-muted-foreground/70 hover:text-foreground">
                先退出
              </Button>
            </div>
          </motion.div>
        )}

        {/* No-V1 — fresh install path. Show a quick confirmation then
            auto-close via the effect above. Keeps new users from being
            dragged through 4 steps for nothing. */}
        {screen === 'no-v1' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-success/12 border border-success/25 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} strokeWidth={1.4} className="text-success" />
              </div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">未检测到 V1 数据</h1>
              <p className="text-sm text-muted-foreground/65 mt-2 leading-relaxed">
                这是一次全新安装，无需迁移。马上进入 Cherry Studio V2。
              </p>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/45">
                <Loader2 size={10} className="animate-spin" />
                正在进入…
              </span>
            </div>
          </motion.div>
        )}

        {/* Intro */}
        {screen === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} strokeWidth={1.3} className="text-primary/70" />
              </div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">欢迎升级到 Cherry Studio V2</h1>
              <p className="text-sm text-muted-foreground/60 mt-2 leading-relaxed">
                检测到 V1 版本数据。我们将引导你完成 <span className="text-foreground/70">4 步</span> 安全迁移。
              </p>
            </div>

            {/* Highlights — what's migrated + safety + ETA + requirements */}
            <div className="rounded-xl border border-border/30 divide-y divide-border/15">
              <HighlightRow
                icon={<Database size={14} className="text-info" />}
                title="迁移范围"
                description="会话 358 · 助手 12 · 知识库 67 · 附件 143 · 系统设置 24"
              />
              <HighlightRow
                icon={<ShieldCheck size={14} className="text-success" />}
                title="自动备份"
                description="V1 数据会先打包到独立目录，迁移失败可以一键还原。"
              />
              <HighlightRow
                icon={<Clock size={14} className="text-accent-violet" />}
                title="预计耗时"
                description="约 2–5 分钟，取决于知识库与附件大小（~247 MB）。"
              />
              <HighlightRow
                icon={<HardDrive size={14} className="text-warning" />}
                title="空间要求"
                description="可用磁盘至少 1.2 GB（备份 + 新格式写入）。"
              />
            </div>

            {/* Warnings checklist + ack */}
            <div className="rounded-xl bg-warning/[0.05] border border-warning/15 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-warning/70" />
                <span className="text-xs font-medium text-warning/85">开始前请注意</span>
              </div>
              <ul className="text-[11px] text-warning/75 space-y-1.5 pl-5">
                <li className="flex items-start gap-1.5">
                  <Plug size={10} className="text-warning/60 flex-shrink-0 mt-0.5" />
                  <span>保持电源连接，不要在迁移过程中关闭应用。</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Power size={10} className="text-warning/60 flex-shrink-0 mt-0.5" />
                  <span>迁移期间所有功能不可用，结束后自动进入 V2。</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <FolderOpen size={10} className="text-warning/60 flex-shrink-0 mt-0.5" />
                  <span>原始数据会保留在备份目录，可在「设置 → 数据」还原。</span>
                </li>
              </ul>
              <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary"
                />
                <span className="text-[11px] text-foreground/80">我已了解上述事项</span>
              </label>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setScreen('backup-choose')}
                disabled={!acknowledged}
                className="w-full gap-2"
              >
                下一步：选择备份方式
                <ArrowRight size={14} />
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onClose('postponed')} className="flex-1 text-muted-foreground/70 hover:text-foreground">
                  稍后再说
                </Button>
                <Button variant="ghost" size="sm" onClick={openDecline} className="flex-1 text-muted-foreground/70 hover:text-foreground">
                  不迁移
                </Button>
              </div>
            </div>

            {/* Dev failure toggle */}
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setSimulateFailure(v => !v)}
                title={simulateFailure ? '点击关闭：模拟迁移失败' : '点击开启：模拟迁移失败（用于查看失败界面）'}
                className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full transition-colors
                  ${simulateFailure
                    ? 'text-destructive bg-destructive/8 border border-destructive/20'
                    : 'text-muted-foreground/40 hover:text-muted-foreground/60 hover:bg-accent/30'}`}
              >
                <Bug size={10} strokeWidth={1.8} />
                {simulateFailure ? '调试：本次将模拟失败' : '调试：模拟失败开关'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Backup — choose mode */}
        {screen === 'backup-choose' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-info/15 border border-info/25 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} strokeWidth={1.3} className="text-info" />
              </div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight">选择备份方式</h2>
              <p className="text-sm text-muted-foreground/60 mt-2 leading-relaxed">
                迁移前会先把 V1 数据打包保存。一旦迁移失败，你可以从备份还原。
              </p>
            </div>

            <div className="space-y-2">
              <BackupChoiceRow
                selected={backupChoice === 'create'}
                onSelect={() => setBackupChoice('create')}
                icon={<Database size={16} className={backupChoice === 'create' ? 'text-primary' : 'text-muted-foreground/60'} />}
                title="自动创建新备份"
                description="估算 247 MB · 写入 ~/Library/Application Support/CherryStudio/backups/"
                badge="推荐"
              />
              <BackupChoiceRow
                selected={backupChoice === 'existing'}
                onSelect={() => setBackupChoice('existing')}
                icon={<Shield size={16} className={backupChoice === 'existing' ? 'text-primary' : 'text-muted-foreground/60'} />}
                title="使用已有备份"
                description="上次备份：2026-04-12 21:33 · 235 MB"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setScreen('intro')} className="gap-1.5">
                <ArrowLeft size={13} />
                返回
              </Button>
              <Button variant="default" size="sm" onClick={runBackup} className="flex-1 gap-1.5">
                {backupChoice === 'create' ? '创建备份' : '校验已有备份'}
                <ArrowRight size={14} />
              </Button>
            </div>
            <button
              type="button"
              onClick={openDecline}
              className="block mx-auto text-[11px] text-muted-foreground/55 hover:text-muted-foreground transition-colors"
            >
              不迁移，直接使用 V2
            </button>
          </motion.div>
        )}

        {/* Backup — in progress */}
        {screen === 'backup-running' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-info/12 border border-info/25 flex items-center justify-center mx-auto mb-4">
                <Loader2 size={28} strokeWidth={1.4} className="text-info animate-spin" />
              </div>
              <h2 className="text-lg font-medium text-foreground">{backupChoice === 'create' ? '正在备份 V1 数据…' : '正在校验已有备份…'}</h2>
              <p className="text-xs text-muted-foreground/55 mt-1.5">不要关闭应用</p>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-info rounded-full"
                animate={{ width: `${backupProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground/50 text-center tabular-nums">{Math.round(backupProgress)}% · 约 30 秒</p>
          </motion.div>
        )}

        {/* Backup — done, ready to migrate */}
        {screen === 'backup-ready' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-success/12 border border-success/25 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} strokeWidth={1.4} className="text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight">备份完成</h2>
              <p className="text-sm text-muted-foreground/60 mt-2 leading-relaxed">
                V1 数据已安全保存。下一步将开始数据迁移。
              </p>
            </div>

            <div className="rounded-xl border border-border/30 bg-muted/10 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <FolderOpen size={12} className="text-muted-foreground/60 flex-shrink-0" />
                <span className="text-[11px] text-muted-foreground/80 font-mono break-all">
                  ~/Library/Application Support/CherryStudio/backups/v1_2026-05-28_232133.zip
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database size={12} className="text-muted-foreground/60 flex-shrink-0" />
                <span className="text-[11px] text-muted-foreground/80">247 MB · 完整可还原</span>
              </div>
            </div>

            <div className="rounded-xl bg-warning/[0.06] border border-warning/15 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={13} className="text-warning/60 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-warning/75 leading-relaxed">
                  即将开始正式迁移。过程中无法使用应用，预计 2–5 分钟。失败可在失败页面选择重试或跳过。
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setScreen('backup-choose')} className="gap-1.5">
                <ArrowLeft size={13} />
                返回
              </Button>
              <Button variant="default" size="sm" onClick={handleStart} className="flex-1 gap-2">
                <ArrowRight size={14} />
                {simulateFailure ? '开始迁移（将模拟失败）' : '开始迁移'}
              </Button>
            </div>
          </motion.div>
        )}
        )}

        {/* Decline-Confirm State */}
        {screen === 'decline-confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.04] px-5 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/12 border border-destructive/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} strokeWidth={1.8} className="text-destructive/85" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-medium text-foreground">不迁移 V1 数据？</h2>
                  <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                    所有功能都将以空状态启动：你看不到 V1 的会话历史、自定义助手、知识库等数据。
                  </p>
                </div>
              </div>
              <ul className="text-xs text-muted-foreground/70 space-y-1.5 pl-12">
                <li className="flex items-start gap-2">
                  <Shield size={11} strokeWidth={1.8} className="text-success/80 flex-shrink-0 mt-0.5" />
                  <span>V1 数据会留在备份文件夹，不会被删除。</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw size={11} strokeWidth={1.8} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                  <span>稍后可以在「设置 → 数据」里重新触发迁移。</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setScreen(previousScreen)} className="flex-1">
                返回
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onClose('declined')}
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                继续不迁移
              </Button>
            </div>
          </motion.div>
        )}

        {/* Running State */}
        {(screen === 'running' || screen === 'completed' || screen === 'failed') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Overall progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground/50">
                  {screen === 'running' ? `迁移中 ${totalProgress}%` : screen === 'completed' ? '迁移完成' : '迁移出错'}
                </span>
                <span className="text-xs text-muted-foreground/40 tabular-nums">{formatTime(elapsed)}</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors ${
                    screen === 'completed' ? 'bg-success' :
                    screen === 'failed' ? 'bg-destructive' :
                    'bg-primary'
                  }`}
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="rounded-xl border border-border/30 overflow-hidden divide-y divide-border/10">
              {steps.map((step: MigrationStep) => (
                <div key={step.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    step.status === 'completed' ? 'bg-success/10 text-success' :
                    step.status === 'running' ? 'bg-primary/10 text-primary' :
                    step.status === 'error' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted/20 text-muted-foreground/30'
                  }`}>
                    {step.status === 'running' ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : step.status === 'completed' ? (
                      <CheckCircle2 size={13} />
                    ) : step.status === 'error' ? (
                      <XCircle size={13} />
                    ) : (
                      step.icon
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${
                      step.status === 'completed' || step.status === 'running' ? 'text-foreground' : 'text-muted-foreground/40'
                    }`}>{step.label}</span>
                    {step.status === 'running' && step.detail && (
                      <p className="text-xs text-muted-foreground/40 mt-0.5">{step.detail}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {step.count && step.count.total > 0 && (
                      <span className={`text-xs tabular-nums ${
                        step.status === 'completed' ? 'text-success/50' :
                        step.status === 'running' ? 'text-muted-foreground/50' :
                        'text-muted-foreground/30'
                      }`}>
                        {step.status === 'pending' ? step.count.total : `${step.count.done}/${step.count.total}`}
                      </span>
                    )}
                    {step.status === 'running' && step.progress !== undefined && (
                      <div className="w-14">
                        <div className="h-1 bg-muted/25 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            animate={{ width: `${step.progress}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Log toggle */}
            {logs.length > 0 && (
              <div className="rounded-xl border border-border/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowLog((v: boolean) => !v)}
                  className="w-full px-4 py-2 flex items-center justify-between text-xs text-muted-foreground/40 hover:bg-accent/40 transition-colors"
                >
                  <span>日志 ({logs.length})</span>
                  {showLog ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
                <AnimatePresence>
                  {showLog && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 max-h-[120px] overflow-y-auto scrollbar-thin-xs">
                        <div className="font-mono text-[10px] text-muted-foreground/40 space-y-0.5">
                          {logs.map((log: string, i: number) => (
                            <p key={i}>{log}</p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Cancel button — appears only while actually running. Ghost
                muted styling so it doesn't compete with content; the
                destructive intent surfaces in the confirm modal. */}
            {screen === 'running' && (
              <button
                type="button"
                onClick={requestCancel}
                className="block mx-auto text-[11px] text-muted-foreground/55 hover:text-destructive transition-colors pt-1"
              >
                取消迁移
              </button>
            )}

            {/* Completed — summary + actions. Real migrations almost
                always have a partial success story: N steps done, M items
                migrated, possibly some skipped. Surface the count up
                front so users trust what landed, and call out skipped
                steps with a settings entry to retry later. */}
            {screen === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-3"
              >
                {(() => {
                  const completedSteps = steps.filter(s => s.status === 'completed');
                  const skippedSteps = steps.filter(s => s.status === 'skipped');
                  const itemsMigrated = completedSteps.reduce((sum, s) => sum + (s.count?.done ?? 0), 0);
                  const itemsSkipped = skippedSteps.reduce((sum, s) => sum + (s.count?.total ?? 0), 0);
                  const hasSkips = skippedSteps.length > 0;
                  return (
                    <>
                      {/* Hero stats */}
                      <div className="rounded-xl border border-success/25 bg-success/[0.05] px-4 py-3 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xl font-semibold text-success tabular-nums">{completedSteps.length}</p>
                          <p className="text-[10px] text-muted-foreground/65 mt-0.5">步已完成</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-foreground tabular-nums">{itemsMigrated}</p>
                          <p className="text-[10px] text-muted-foreground/65 mt-0.5">条数据已迁移</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold tabular-nums tracking-tight">
                            <span className="text-muted-foreground/60">{formatTime(elapsed)}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground/65 mt-0.5">耗时</p>
                        </div>
                      </div>

                      {/* Skip warning — only when applicable */}
                      {hasSkips && (
                        <div className="rounded-xl bg-warning/[0.06] border border-warning/20 px-4 py-3 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle size={13} className="text-warning/70 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-warning/85">
                                有 {skippedSteps.length} 步被跳过（共 {itemsSkipped} 项数据）
                              </p>
                              <ul className="text-[11px] text-warning/75 mt-1.5 space-y-0.5">
                                {skippedSteps.map(s => (
                                  <li key={s.id}>· {s.label}{s.count ? ` · ${s.count.total} 项` : ''}</li>
                                ))}
                              </ul>
                              <p className="text-[11px] text-warning/70 mt-2 leading-relaxed">
                                可前往 <span className="text-foreground/80">「设置 → 数据 → 重建」</span> 单独重试这些步骤。
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Backup location */}
                      <div className="rounded-xl border border-border/30 bg-muted/10 px-4 py-2.5 flex items-start gap-2.5">
                        <FolderOpen size={12} className="text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground/55 font-medium">V1 备份</p>
                          <p className="text-[11px] text-muted-foreground/75 font-mono break-all mt-0.5">
                            ~/Library/Application Support/CherryStudio/backups/v1_2026-05-28_232133.zip
                          </p>
                        </div>
                      </div>

                      <Button variant="default" size="sm" onClick={() => onClose('completed')} className="w-full gap-2">
                        <CheckCircle2 size={14} />
                        进入 Cherry Studio V2
                      </Button>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* Failed actions — appears when a step errors out. Retry
                resumes from the failed step (with the simulate flag
                cleared); skip marks it as skipped and continues; exit
                closes the overlay as "declined" so the launchpad opens. */}
            {screen === 'failed' && failedStepIdx !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-2"
              >
                <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle size={14} className="text-destructive/85 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-destructive/85 font-medium">
                        在「{MIGRATION_STEPS[failedStepIdx].label}」处中断
                      </p>
                      <p className="text-[11px] text-destructive/70 leading-relaxed mt-1 font-mono break-words">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="default" size="sm" onClick={handleRetry} className="flex-1 gap-2">
                    <RefreshCw size={13} />
                    重试本步
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSkipFailedStep} className="flex-1 gap-2">
                    <SkipForward size={13} />
                    跳过并继续
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClose('declined')}
                  className="w-full text-muted-foreground/70 hover:text-foreground"
                >
                  退出，不再迁移
                </Button>
                <p className="text-[10px] text-muted-foreground/45 text-center leading-relaxed">
                  已完成的步骤会保留。跳过的步骤可以稍后在「设置 → 数据」单独重试。
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Cancel-Confirm — modal-style card, same pattern as
            decline-confirm. Stops short of doing anything destructive
            until the user explicitly confirms. */}
        {screen === 'cancel-confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-warning/25 bg-warning/[0.06] px-5 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-warning/15 border border-warning/25 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} strokeWidth={1.8} className="text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-medium text-foreground">取消正在进行的迁移？</h2>
                  <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                    已完成的步骤不会回滚，正在进行的步骤会标记为已跳过。可以稍后从设置里重新继续。
                  </p>
                </div>
              </div>
              <ul className="text-[11px] text-muted-foreground/70 space-y-1.5 pl-12">
                <li className="flex items-start gap-2">
                  <ShieldCheck size={11} className="text-success/80 flex-shrink-0 mt-0.5" />
                  <span>V1 备份仍在 ~/Library/.../backups/，可以还原。</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw size={11} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                  <span>下次启动会自动检测进度，可以选择继续或重来。</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setScreen(previousScreen)} className="flex-1">
                继续迁移
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={confirmCancel}
                className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
              >
                确认取消
              </Button>
            </div>
          </motion.div>
        )}

        {/* Cancelled — terminal summary. Show how many steps got done
            before the cancel, where the backup lives, and offer both
            restart and exit. */}
        {screen === 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-warning/12 border border-warning/25 flex items-center justify-center mx-auto mb-4">
                <XCircle size={28} strokeWidth={1.4} className="text-warning" />
              </div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight">迁移已取消</h2>
              <p className="text-sm text-muted-foreground/65 mt-2 leading-relaxed">
                {steps.filter(s => s.status === 'completed').length} 步已完成，
                {steps.filter(s => s.status === 'skipped' || s.status === 'pending').length} 步未执行。
              </p>
            </div>

            {/* Mini step summary — green dots for done, muted for skipped */}
            <div className="rounded-xl border border-border/30 bg-muted/10 px-4 py-3 space-y-1.5">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  {s.status === 'completed' ? (
                    <CheckCircle2 size={11} className="text-success flex-shrink-0" />
                  ) : (
                    <XCircle size={11} className="text-muted-foreground/35 flex-shrink-0" />
                  )}
                  <span className={s.status === 'completed' ? 'text-foreground/85' : 'text-muted-foreground/55'}>
                    {s.label}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground/45">
                    {s.status === 'completed' ? '已完成' : '已取消'}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-info/[0.06] border border-info/20 px-4 py-3 flex items-start gap-2.5">
              <FolderOpen size={13} className="text-info/70 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-info/85 leading-relaxed">
                V1 备份保留在 <span className="font-mono">~/Library/.../v1_2026-05-28.zip</span>，需要时可一键还原。
              </p>
            </div>

            <div className="space-y-2">
              <Button variant="default" size="sm" onClick={restartFromCancelled} className="w-full gap-2">
                <RefreshCw size={13} />
                重新开始迁移
              </Button>
              <Button variant="outline" size="sm" onClick={() => onClose('postponed')} className="w-full text-muted-foreground/70 hover:text-foreground">
                稍后再说，先进入 V2（无 V1 数据）
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ===========================
// Small helpers
// ===========================

// A row in the intro "highlights" list — icon + bold title + muted description.
function HighlightRow({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="px-4 py-2.5 flex items-start gap-2.5">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground/65 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Backup-mode radio-style row (visually like RadioGroup; click anywhere).
function BackupChoiceRow({ selected, onSelect, icon, title, description, badge }: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-start gap-3
        ${selected
          ? 'border-primary/40 bg-primary/[0.06]'
          : 'border-border/30 bg-muted/10 hover:bg-muted/20 hover:border-border/50'}`}
    >
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-px rounded bg-primary/15 text-primary border border-primary/25">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/65 mt-1 leading-relaxed break-words">{description}</p>
      </div>
      <span
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors
          ${selected ? 'border-primary' : 'border-border/40'}`}
      >
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </span>
    </button>
  );
}
