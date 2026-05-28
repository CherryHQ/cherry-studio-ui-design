import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  MessageSquare, Settings, Database, Layers, Sparkles,
  FileText, ArrowRight, AlertTriangle, RefreshCw, Bug, SkipForward, Shield,
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
// CherryHQ/cherry-studio#13547 — intro / running / completed / failed
// plus a decline-confirm modal step before the user can permanently
// skip the migration.
type Screen = 'ready' | 'running' | 'completed' | 'failed' | 'decline-confirm';
export type MigrationCloseReason = 'completed' | 'declined' | 'postponed';

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
  const [screen, setScreen] = useState<Screen>('ready');
  const [steps, setSteps] = useState<MigrationStep[]>(MIGRATION_STEPS);
  const [showLog, setShowLog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  // Dev-only toggle (small Bug button in the ready footer) — forces the
  // current run to fail on the conversations step so the design can be
  // viewed end-to-end without waiting for a real error path.
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [failedStepIdx, setFailedStepIdx] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} strokeWidth={1.3} className="text-primary/70" />
          </div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">升级到 Cherry Studio V2</h1>
          <p className="text-sm text-muted-foreground/60 mt-2 leading-relaxed">
            检测到 V1 版本数据，需要迁移到新格式才能继续使用。
          </p>
        </motion.div>

        {/* Ready State */}
        {screen === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Data summary */}
            <div className="rounded-xl border border-border/30 bg-muted/10 divide-y divide-border/15">
              {MIGRATION_STEPS.filter(s => s.count && s.count.total > 0).map(step => (
                <div key={step.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-muted-foreground/40">{step.icon}</span>
                    <span className="text-sm text-muted-foreground/80">{step.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/50 tabular-nums">{step.count!.total} 项</span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="rounded-xl bg-warning/[0.06] border border-warning/15 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={13} className="text-warning/60 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-warning/70 leading-relaxed">
                  迁移过程中请勿关闭应用。原始数据将保留备份，可在设置中恢复。
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="space-y-2 pt-2">
              <Button variant="default" size="sm" onClick={handleStart} className="w-full gap-2">
                <ArrowRight size={14} />
                {simulateFailure ? '开始迁移（将模拟失败）' : '开始迁移'}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onClose('postponed')} className="flex-1 text-muted-foreground/70 hover:text-foreground">
                  稍后再说
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setScreen('decline-confirm')} className="flex-1 text-muted-foreground/70 hover:text-foreground">
                  不迁移
                </Button>
              </div>
            </div>

            {/* Dev failure toggle — a small icon button for testing the
                failed screen end-to-end without waiting for a real error.
                Tucked at the bottom in muted styling so it doesn't compete
                with the real actions. */}
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
              <Button variant="outline" size="sm" onClick={() => setScreen('ready')} className="flex-1">
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

            {/* Completed action */}
            {screen === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <Button variant="default" size="sm" onClick={() => onClose('completed')} className="w-full gap-2">
                  <CheckCircle2 size={14} />
                  进入 Cherry Studio V2
                </Button>
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
      </div>
    </motion.div>
  );
}
