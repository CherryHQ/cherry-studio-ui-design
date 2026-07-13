import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2, CheckCircle2, Check, XCircle, ChevronDown, ChevronUp,
  MessageSquare, Settings, Database, Layers, Sparkles,
  FileText, ArrowRight, ArrowLeft, AlertTriangle, RefreshCw, RotateCcw,
  Plug, FolderOpen, Copy, Rocket, Shield,
} from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import cherryLogoImg from '@/assets/cherry-icon.png';

// Cherry Studio brand green (real app's --color-primary = --cs-brand-500).
// Used for primary actions / active step / progress so the wizard reads as
// "Cherry's" and lively, instead of a solemn all-black UI.
const BRAND_BTN = '!bg-[oklch(0.77_0.208_146)] hover:!bg-[oklch(0.71_0.205_146)] !text-white !border-transparent shadow-sm';
const BRAND_BG = 'oklch(0.77 0.208 146)';

// ===========================
// Types
// ===========================
type StepStatus = 'pending' | 'running' | 'completed' | 'error';

interface MigrationStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: StepStatus;
  progress?: number;
  detail?: string;
  count?: { done: number; total: number };
}

// State machine mirrors the REAL Cherry Studio V1→V2 migration window
// (src/renderer/src/windows/migrationV2/MigrationApp.tsx). The real stages
// are: introduction → backup_required → backup_progress → backup_confirmed
// → migration → migration_completed → completed, plus error and the
// boot-time version_incompatible gate. We collapse migration_completed
// into `completed` (one celebration screen) and keep the rest 1:1 so the
// interaction matches actual app capability. Visual polish (step rail,
// progress animation, confetti) is enhancement only — it doesn't invent
// any capability the app lacks (no cancel-mid-migration, no skip/partial,
// no decline inside the normal flow).
type Screen =
  | 'checking'
  | 'intro'
  | 'backup-required' | 'backup-running' | 'backup-confirmed'
  | 'running' | 'completed' | 'error'
  | 'version-incompatible';

export type MigrationCloseReason = 'completed' | 'declined' | 'postponed' | 'no-v1';

// Numeric step indicator (1-4) per screen — drives the left rail. Pre-step
// (checking) and the boot-time version gate hide the rail, matching the
// real window which only hides Steps for version_incompatible.
const STEP_NUMBER: Partial<Record<Screen, 1 | 2 | 3 | 4>> = {
  intro: 1,
  'backup-required': 2,
  'backup-running': 2,
  'backup-confirmed': 2,
  running: 3,
  error: 3,
  completed: 4,
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
  const [screen, setScreen] = useState<Screen>('checking');
  const [steps, setSteps] = useState<MigrationStep[]>(MIGRATION_STEPS);
  const [showLog, setShowLog] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [backupProgress, setBackupProgress] = useState(0);
  // Which of the two real backup choices the user picked: create a fresh
  // backup, or assert one already exists. Drives the footer CTA.
  const [backupChoice, setBackupChoice] = useState<'create' | 'existing'>('create');
  // Dev-only toggles (small affordances in the footer) so the failure +
  // version-incompatible paths can be previewed without a real trigger.
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [failedStepIdx, setFailedStepIdx] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [logCopied, setLogCopied] = useState(false);
  const [batteryWarning, setBatteryWarning] = useState<{ level: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalProgress = (() => {
    const completed = steps.filter((s) => s.status === 'completed').length;
    const running = steps.find((s) => s.status === 'running');
    const runningFrac = running?.progress ? running.progress / 100 : 0;
    return Math.round(((completed + runningFrac) / steps.length) * 100);
  })();

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  // Drives the animated migrator list. `migration` stage in the real app
  // streams per-migrator progress; here it's simulated.
  const advanceStep = useCallback((stepIdx: number, opts: { failNext?: boolean } = {}) => {
    if (stepIdx >= MIGRATION_STEPS.length) {
      setScreen('completed');
      addLog('All migration steps completed successfully.');
      return;
    }

    const step = MIGRATION_STEPS[stepIdx];
    addLog(`Starting: ${step.label}`);

    setSteps((prev) => prev.map((s, i) => (i === stepIdx ? { ...s, status: 'running' as const, progress: 0 } : s)));

    const shouldFail = opts.failNext && stepIdx === 2;
    let progress = 0;
    const totalItems = step.count?.total || 0;
    const failAtFraction = 0.4 + Math.random() * 0.25;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 4;
      if (shouldFail && progress >= failAtFraction * 100) {
        clearInterval(interval);
        const reason = '检测到 3 条会话引用了已删除的助手 ID (assistant_4f7c92)，无法迁移。';
        setSteps((prev) => prev.map((s, i) => (i === stepIdx ? { ...s, status: 'error' as const } : s)));
        setFailedStepIdx(stepIdx);
        setErrorMessage(reason);
        addLog(`ERROR: ${step.label} — ${reason}`);
        setScreen('error');
        return;
      }
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setSteps((prev) => prev.map((s, i) =>
          i === stepIdx
            ? { ...s, status: 'completed' as const, progress: 100, count: totalItems ? { done: totalItems, total: totalItems } : s.count }
            : s,
        ));
        addLog(`Completed: ${step.label}${totalItems ? ` (${totalItems} items)` : ''}`);
        stepTimerRef.current = setTimeout(() => advanceStep(stepIdx + 1, opts), 400);
      } else {
        const done = totalItems ? Math.floor((progress / 100) * totalItems) : undefined;
        setSteps((prev) => prev.map((s, i) =>
          i === stepIdx
            ? { ...s, progress: Math.min(progress, 100), count: done !== undefined ? { done, total: totalItems } : s.count }
            : s,
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

  // [创建备份] — simulate the copy, then auto-start the migration once the
  // backup finishes (no separate 备份完成 → 开始迁移 click).
  const runBackup = useCallback(() => {
    setScreen('backup-running');
    setBackupProgress(0);
    addLog('Backup started (create new).');
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 15 + 6;
      if (p >= 100) {
        clearInterval(tick);
        setBackupProgress(100);
        addLog('Backup completed. Auto-starting migration.');
        // Hold at 100% briefly so the bar reads "done", then migrate.
        setTimeout(() => handleStart(), 700);
      } else {
        setBackupProgress(p);
      }
    }, 220);
    timerRef.current = tick;
  }, [addLog, handleStart]);

  // [我已备份] — user asserts a backup exists; go straight to migration.
  const confirmBackup = useCallback(() => {
    addLog('User confirmed an existing backup. Starting migration.');
    handleStart();
  }, [addLog, handleStart]);

  // error stage — only Retry / Close, matching the real app exactly.
  const handleRetry = useCallback(() => {
    if (failedStepIdx === null) return;
    addLog(`Retrying: ${MIGRATION_STEPS[failedStepIdx].label}`);
    setSteps((prev) => prev.map((s, i) => (i === failedStepIdx ? { ...s, status: 'pending' as const, progress: 0 } : s)));
    const idx = failedStepIdx;
    setFailedStepIdx(null);
    setErrorMessage('');
    setSimulateFailure(false);
    setScreen('running');
    advanceStep(idx, { failNext: false });
  }, [failedStepIdx, addLog, advanceStep]);

  // Elapsed timer runs only while migrating.
  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    if (screen === 'running') {
      t = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [screen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, []);

  // Brief pre-flight probe → intro. (The real window opens already in a
  // stage decided by the boot gate; the probe is a lightweight enhancement.)
  useEffect(() => {
    if (screen !== 'checking') return;
    addLog('Probing for V1 data…');
    const t = setTimeout(() => {
      addLog('V1 data detected. Migration wizard available.');
      setScreen('intro');
    }, 750);
    return () => clearTimeout(t);
  }, [screen, addLog]);

  // Battery probe — surfaces a red "plug in" warning on the intro when on
  // battery under 50%, since a mid-migration power loss risks corruption.
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    type BatteryManager = { charging: boolean; level: number };
    type NavWithBattery = Navigator & { getBattery?: () => Promise<BatteryManager> };
    const getBattery = (navigator as NavWithBattery).getBattery;
    if (typeof getBattery !== 'function') return;
    let cancelled = false;
    getBattery.call(navigator).then((b) => {
      if (cancelled) return;
      if (!b.charging && b.level < 0.5) setBatteryWarning({ level: Math.round(b.level * 100) });
    }).catch(() => { /* unsupported */ });
    return () => { cancelled = true; };
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
      className="fixed inset-0 z-[9999] bg-muted/70 dark:bg-background/70 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        // Fixed window size — bigger / more imposing per review. Height is
        // locked so the dialog doesn't grow/shrink between screens; the right
        // column scrolls internally when a screen is taller than the frame.
        className="w-full max-w-[980px] h-[760px] max-h-[92vh] rounded-xl bg-content-bg border border-content-border shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Title bar — Cherry Studio logo + name stay visible the whole flow
            so it's always clear whose wizard this is. */}
        <div className="h-10 px-3 flex items-center bg-accent/40 border-b border-border/30 flex-shrink-0 relative">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onClose('postponed')}
              title="关闭（稍后再说）"
              className="w-3 h-3 rounded-full bg-traffic-red border border-traffic-red-border hover:opacity-80 transition-opacity"
            />
            <div className="w-3 h-3 rounded-full bg-traffic-yellow border border-traffic-yellow-border" />
            <div className="w-3 h-3 rounded-full bg-traffic-green border border-traffic-green-border" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <img src={cherryLogoImg} alt="Cherry Studio" className="w-[18px] h-[18px] rounded-md object-cover" />
            <span className="text-xs text-foreground/80 font-semibold tracking-tight">Cherry Studio</span>
            <span className="text-muted-foreground/35">·</span>
            <span className="text-[11px] text-muted-foreground/65">数据迁移向导</span>
          </div>
        </div>

        {/* Body — left rail + right content */}
        <div className="flex-1 flex min-h-0">
          {STEP_NUMBER[screen] && (
            <aside className="w-32 flex-shrink-0 bg-muted/25 border-r border-border/30 flex flex-col">
              <ol className="flex-1 py-6 px-4">
                {([
                  { n: 1 as const, label: '介绍' },
                  { n: 2 as const, label: '备份' },
                  { n: 3 as const, label: '迁移' },
                  { n: 4 as const, label: '完成' },
                ]).map((s, i, arr) => {
                  const cur = STEP_NUMBER[screen]!;
                  const isErr = screen === 'error' && s.n === cur;
                  const done = s.n < cur;
                  const active = s.n === cur;
                  const last = i === arr.length - 1;
                  return (
                    <li key={s.n} className="relative flex items-center gap-3 h-11">
                      {!last && (
                        <span
                          className={`absolute left-[12px] top-1/2 h-[44px] w-px -translate-x-1/2 ${done ? '' : 'bg-border/35'}`}
                          style={done ? { background: BRAND_BG, opacity: 0.4 } : undefined}
                        />
                      )}
                      <div
                        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium flex-shrink-0 transition-colors
                          ${isErr ? 'bg-destructive text-white' :
                            active ? 'text-white' :
                            done ? 'text-white' :
                            'bg-background text-muted-foreground/40 border border-border/50'}`}
                        style={(active || done) && !isErr ? { background: BRAND_BG, opacity: done ? 0.88 : 1 } : undefined}
                      >
                        {isErr ? <XCircle size={13} strokeWidth={2.5} /> : done ? <Check size={12} strokeWidth={3} /> : s.n}
                      </div>
                      <span className={`relative z-10 text-xs truncate ${
                        active ? 'text-foreground font-medium' : done ? 'text-foreground/70' : 'text-muted-foreground/40'
                      }`}>{s.label}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="px-4 py-3">
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] text-muted-foreground/70 hover:text-foreground/80 transition-colors"
                  title="语言（占位 UI）"
                >
                  <span>简体中文</span>
                  <ChevronDown size={10} className="text-muted-foreground/50" />
                </button>
              </div>
            </aside>
          )}

          {/* Right column */}
          <div className="flex-1 overflow-y-auto scrollbar-thin min-w-0">
          <div className="min-h-full flex flex-col justify-center px-12 py-6">

            {/* ── Checking ── */}
            {screen === 'checking' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center mx-auto mb-4">
                  <Loader2 size={28} strokeWidth={1.4} className="text-muted-foreground animate-spin" />
                </div>
                <h1 className="text-base font-medium text-foreground">正在检测 V1 数据…</h1>
                <p className="text-xs text-muted-foreground/55 mt-1.5">扫描旧版数据库，决定是否需要迁移</p>
              </motion.div>
            )}

            {/* ── Intro — matches the real app's density: icon + title +
                  three short paragraphs. The highlight table / warning
                  checklist / ack gate were our additions and overloaded it. ── */}
            {screen === 'intro' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.1 }}
                    className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-primary/18 to-primary/[0.03] border border-primary/15 flex items-center justify-center mx-auto mb-4 shadow-sm ring-1 ring-inset ring-white/40"
                  >
                    <Rocket size={30} strokeWidth={1.4} className="text-primary/75" />
                  </motion.div>
                  <h1 className="text-[22px] font-semibold text-foreground tracking-tight">将数据迁移到新的架构中</h1>
                  <p className="text-xs text-muted-foreground/55 mt-2">Cherry Studio V2 · 全新数据架构</p>
                </div>

                {/* The real intro's three points, presented as designed
                    feature rows (icon badge + title + copy) instead of a
                    gray text wall. Content is faithful; the structure is the
                    enhancement. */}
                <div className="space-y-2.5 max-w-[460px] mx-auto">
                  {([
                    { icon: <Sparkles size={16} />, title: '全新数据架构', desc: '存储与使用方式重构，效率与安全性大幅提升。' },
                    { icon: <Database size={16} />, title: '需要迁移数据', desc: '数据必须迁移后，才能在新版本中使用。' },
                    { icon: <Shield size={16} />, title: '安全且可逆', desc: '全程引导，不损坏原始数据，可随时取消。' },
                  ]).map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.08 }}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/15 px-3.5 py-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-foreground/[0.06] border border-border/50 flex items-center justify-center flex-shrink-0 text-foreground/70">
                        {f.icon}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-foreground">{f.title}</p>
                        <p className="text-[11px] text-muted-foreground/65 mt-0.5 leading-relaxed">{f.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {batteryWarning && (
                  <div className="rounded-xl bg-destructive/[0.06] border border-destructive/25 px-4 py-3 flex items-start gap-2.5 max-w-[460px] mx-auto">
                    <Plug size={13} className="text-destructive/85 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-destructive/85">未连接电源 · 当前电量 {batteryWarning.level}%</p>
                      <p className="text-[11px] text-destructive/75 mt-1 leading-relaxed">迁移期间断电可能损坏数据库，建议先连接电源。</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 pt-1 max-w-[460px] mx-auto">
                  <Button variant="default" size="sm" onClick={() => setScreen('backup-required')} className={`w-full gap-2 ${BRAND_BTN}`}>
                    下一步
                    <ArrowRight size={14} />
                  </Button>
                  {/* Single escape hatch — postpone the migration and keep
                      using the current version (the real app's "取消并继续
                      使用旧版本"). The permanent "use V2 with defaults" path
                      lives on the version-incompatible gate, not here. */}
                  <button
                    type="button"
                    onClick={() => onClose('postponed')}
                    className="block mx-auto text-[11px] text-muted-foreground/55 hover:text-foreground transition-colors"
                  >
                    暂不迁移
                  </button>
                </div>

                {/* Dev preview toggles — not part of the shipped UI. */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button type="button" onClick={() => setSimulateFailure(v => !v)}
                    className={`text-[10px] transition-colors ${simulateFailure ? 'text-destructive/70' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}>
                    {simulateFailure ? '调试：本次将模拟失败' : '调试：模拟失败'}
                  </button>
                  <button type="button" onClick={() => setScreen('version-incompatible')}
                    className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    调试：版本不兼容
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Backup required — two real choices, as selectable cards ── */}
            {screen === 'backup-required' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center mx-auto mb-3.5">
                    <Shield size={26} strokeWidth={1.4} className="text-foreground/70" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">创建数据备份</h2>
                  <p className="text-sm text-muted-foreground/60 mt-1.5 leading-relaxed max-w-[440px] mx-auto">迁移前必须创建数据备份以确保数据安全。请选择备份位置，或确认已有最新备份。</p>
                </div>

                <div className="space-y-2">
                  <BackupChoiceRow
                    selected={backupChoice === 'create'}
                    onSelect={() => setBackupChoice('create')}
                    icon={<Database size={16} className={backupChoice === 'create' ? 'text-foreground' : 'text-muted-foreground/60'} />}
                    title="创建新备份"
                    description="估算 247 MB · 写入 ~/Library/Application Support/CherryStudio/backups/"
                    badge="推荐"
                  />
                  <BackupChoiceRow
                    selected={backupChoice === 'existing'}
                    onSelect={() => setBackupChoice('existing')}
                    icon={<Shield size={16} className={backupChoice === 'existing' ? 'text-foreground' : 'text-muted-foreground/60'} />}
                    title="使用已有备份"
                    description="我已在别处备份过 V1 数据，直接继续迁移。"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setScreen('intro')} className="gap-1.5">
                    <ArrowLeft size={13} />
                    返回
                  </Button>
                  <Button variant="default" size="sm" onClick={backupChoice === 'create' ? runBackup : confirmBackup} className={`flex-1 gap-2 ${BRAND_BTN}`}>
                    {backupChoice === 'create' ? <Database size={14} /> : <ArrowRight size={14} />}
                    {backupChoice === 'create' ? '创建备份' : '确认并继续'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Backup in progress — auto-advances into migration at 100% ── */}
            {screen === 'backup-running' && (() => {
              const done = backupProgress >= 100;
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border transition-colors ${done ? 'bg-success/12 border-success/25' : 'bg-muted/40 border-border/40'}`}>
                      {done
                        ? <CheckCircle2 size={26} strokeWidth={1.5} className="text-success" />
                        : <Loader2 size={26} strokeWidth={1.4} className="text-muted-foreground animate-spin" />}
                    </div>
                    <h2 className="text-lg font-medium text-foreground">{done ? '备份完成，正在开始迁移…' : '正在备份 V1 数据…'}</h2>
                    <p className="text-xs text-muted-foreground/55 mt-1.5">不要关闭应用</p>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: BRAND_BG }} animate={{ width: `${backupProgress}%` }} transition={{ duration: 0.2 }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground/50 text-center tabular-nums">{Math.round(backupProgress)}% · 约 30 秒</p>
                </motion.div>
              );
            })()}

            {/* ── Migration in progress / error ── */}
            {(screen === 'running' || screen === 'error') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Title + live status — matches the real app's
                    "正在迁移数据…" + current-message header. */}
                {screen === 'running' && (() => {
                  const runningStep = steps.find((s) => s.status === 'running');
                  return (
                    <div className="text-center pb-1">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border"
                        style={{ background: 'oklch(0.77 0.208 146 / 0.1)', borderColor: 'oklch(0.77 0.208 146 / 0.25)' }}
                      >
                        <Loader2 size={26} strokeWidth={1.4} className="animate-spin" style={{ color: BRAND_BG }} />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground tracking-tight">正在迁移数据…</h2>
                      <p className="text-sm text-muted-foreground/60 mt-1.5">
                        {runningStep
                          ? `正在${runningStep.label}${runningStep.count ? ` · ${runningStep.count.done}/${runningStep.count.total}` : ''}`
                          : '正在准备…'}
                      </p>
                    </div>
                  );
                })()}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground/50 tabular-nums">{screen === 'running' ? `${totalProgress}%` : '迁移出错'}</span>
                    <span className="text-xs text-muted-foreground/40 tabular-nums">{formatTime(elapsed)}</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full transition-colors ${screen === 'error' ? 'bg-destructive' : ''}`}
                      style={screen === 'error' ? undefined : { background: BRAND_BG }}
                      animate={{ width: `${totalProgress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Migrator list */}
                <div className="rounded-xl border border-border/30 overflow-hidden divide-y divide-border/10">
                  {steps.map((step) => (
                    <div key={step.id} className="px-3.5 py-2.5 flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          step.status === 'error' ? 'bg-destructive/10 text-destructive' :
                          step.status === 'pending' ? 'bg-muted/30 text-muted-foreground/40' : ''
                        }`}
                        style={(step.status === 'completed' || step.status === 'running')
                          ? { background: 'oklch(0.77 0.208 146 / 0.12)', color: BRAND_BG }
                          : undefined}
                      >
                        {step.status === 'completed' ? <Check size={12} strokeWidth={3} /> :
                          step.status === 'running' ? <Loader2 size={12} className="animate-spin" /> :
                          step.status === 'error' ? <XCircle size={12} /> : step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs ${step.status === 'pending' ? 'text-muted-foreground/45' : 'text-foreground'}`}>{step.label}</span>
                          {step.count && step.status !== 'pending' && (
                            <span className={`text-[11px] tabular-nums flex-shrink-0 ${step.status === 'completed' ? 'text-success/55' : 'text-muted-foreground/50'}`}>
                              {step.count.done}/{step.count.total}
                            </span>
                          )}
                        </div>
                        {step.status === 'running' && (
                          <div className="h-1 bg-muted/30 rounded-full overflow-hidden mt-1.5">
                            <motion.div className="h-full rounded-full" style={{ background: BRAND_BG }} animate={{ width: `${step.progress ?? 0}%` }} transition={{ duration: 0.2 }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Log */}
                {logs.length > 0 && (
                  <div className="rounded-xl border border-border/20 overflow-hidden">
                    <div className="w-full px-4 py-2 flex items-center justify-between text-xs text-muted-foreground/40 hover:bg-accent/40 transition-colors">
                      <button type="button" onClick={() => setShowLog((v) => !v)} className="flex items-center gap-1.5 flex-1 text-left text-xs">
                        <span>日志 ({logs.length})</span>
                        {showLog ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try { await navigator.clipboard.writeText(logs.join('\n')); setLogCopied(true); setTimeout(() => setLogCopied(false), 1500); } catch { /* ignore */ }
                        }}
                        title="复制日志"
                        className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded hover:bg-accent/60 hover:text-foreground transition-colors"
                      >
                        {logCopied ? <CheckCircle2 size={10} className="text-success" /> : <Copy size={10} />}
                        {logCopied ? '已复制' : '复制'}
                      </button>
                    </div>
                    <AnimatePresence>
                      {showLog && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 py-2 max-h-[120px] overflow-y-auto scrollbar-thin-xs bg-muted/10 border-t border-border/15">
                            {logs.map((log, i) => (
                              <p key={i} className="text-[10px] font-mono text-muted-foreground/55 leading-relaxed">{log}</p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Migrating has NO cancel (matches real app: button disabled). */}
                {screen === 'running' && (
                  <p className="text-center text-[11px] text-muted-foreground/45 pt-0.5">迁移进行中，请勿关闭应用…</p>
                )}

                {/* error: only Retry / Close, matching the real app. */}
                {screen === 'error' && failedStepIdx !== null && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-1">
                    <motion.div
                      initial={{ x: 0 }} animate={{ x: [0, -7, 7, -5, 5, -2, 0] }} transition={{ duration: 0.45, delay: 0.05, ease: 'easeInOut' }}
                      className="rounded-xl border border-destructive/25 bg-destructive/[0.04] px-4 py-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle size={14} className="text-destructive/90 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-destructive/85 font-medium">在「{MIGRATION_STEPS[failedStepIdx].label}」处中断</p>
                          <p className="text-[11px] text-destructive/70 leading-relaxed mt-1 break-words">{errorMessage}</p>
                        </div>
                      </div>
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => onClose('postponed')}>
                        关闭
                      </Button>
                      <Button variant="default" size="sm" onClick={handleRetry} className={`flex-1 gap-2 ${BRAND_BTN}`}>
                        <RefreshCw size={13} />
                        重试
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/45 text-center leading-relaxed">
                      已完成的步骤会保留。V1 原始数据未被改动，关闭后仍可重新发起迁移。
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── Completed — celebration + restart (real: completed → 重启应用) ── */}
            {screen === 'completed' && (() => {
              const completedSteps = steps.filter((s) => s.status === 'completed');
              const itemsMigrated = completedSteps.reduce((sum, s) => sum + (s.count?.done ?? 0), 0);
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative space-y-5">
                  <div className="text-center relative">
                    {/* A big 🎉 pops in dead-center (no frame), confetti
                        bursts out of it. No green checkmark — the emoji is
                        the celebration. */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0, rotate: -25 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 11, delay: 0.15 }}
                      className="relative inline-block mx-auto mb-4 text-[64px] leading-none"
                    >
                      🎉
                      <Confetti />
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} className="text-2xl font-semibold text-foreground tracking-tight">
                      欢迎来到 Cherry Studio V2
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="text-sm text-muted-foreground/65 mt-2.5 leading-relaxed max-w-[400px] mx-auto">
                      迁移完成，你的数据已经全部就位。重启应用即可开始使用 V2。
                    </motion.p>
                  </div>

                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl border border-border/30 bg-muted/10 px-4 py-3.5 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-semibold text-foreground tabular-nums">{completedSteps.length}</p>
                      <p className="text-[10px] text-muted-foreground/65 mt-0.5">步已完成</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-foreground tabular-nums">{itemsMigrated}</p>
                      <p className="text-[10px] text-muted-foreground/65 mt-0.5">条数据已迁移</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold tabular-nums tracking-tight text-muted-foreground/60">{formatTime(elapsed)}</p>
                      <p className="text-[10px] text-muted-foreground/65 mt-0.5">耗时</p>
                    </div>
                  </motion.div>

                  <div className="rounded-xl border border-border/30 bg-muted/10 px-4 py-2.5 flex items-start gap-2.5">
                    <FolderOpen size={12} className="text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/55 font-medium">V1 备份</p>
                      <p className="text-[11px] text-muted-foreground/75 font-mono break-all mt-0.5">~/Library/Application Support/CherryStudio/backups/v1_2026-05-28_232133.zip</p>
                    </div>
                  </div>

                  <Button variant="default" size="sm" onClick={() => onClose('completed')} className={`w-full gap-2 ${BRAND_BTN}`}>
                    <RotateCcw size={14} />
                    重启应用
                  </Button>
                </motion.div>
              );
            })()}

            {/* ── Version incompatible — boot-time gate (real escape hatch) ── */}
            {screen === 'version-incompatible' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[460px] mx-auto w-full space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-warning/12 border border-warning/25 flex items-center justify-center mx-auto mb-3.5">
                    <AlertTriangle size={26} strokeWidth={1.4} className="text-warning" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">版本不兼容</h2>
                  <p className="text-sm text-muted-foreground/65 mt-2 leading-relaxed">
                    当前 V1 数据的版本过旧，或缺少版本记录，无法安全迁移到 V2。
                  </p>
                </div>
                <div className="rounded-xl bg-muted/10 border border-border/30 px-4 py-3">
                  <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                    你可以关闭并保留 V1 数据稍后处理；或忽略迁移、以全新默认配置进入 V2（V1 数据不会被导入，但仍保留在原目录）。
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onClose('postponed')}>
                    关闭
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onClose('declined')}
                    className="flex-1 text-destructive/80 hover:text-destructive hover:bg-destructive/8 border-destructive/30"
                  >
                    忽略并使用默认值
                  </Button>
                </div>
              </motion.div>
            )}

          </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===========================
// Small helpers
// ===========================

// Backup-mode selectable row (RadioGroup-style; click anywhere).
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
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-start gap-3
        ${selected
          ? 'border-foreground/25 bg-foreground/[0.035]'
          : 'border-border/30 bg-muted/10 hover:bg-muted/20 hover:border-border/50'}`}
    >
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-px rounded-full bg-accent-blue/12 text-accent-blue border border-accent-blue/25 font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/65 mt-1 leading-relaxed break-words">{description}</p>
      </div>
      <span
        className={`w-[18px] h-[18px] rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors
          ${selected ? 'bg-foreground text-background' : 'border border-border/50'}`}
      >
        {selected && <Check size={11} strokeWidth={2.75} />}
      </span>
    </button>
  );
}

// ===========================
// Confetti — point-origin burst (shoots out of the 🎉).
// ===========================
const CONFETTI_COLORS = ['var(--success)', 'var(--primary)', 'var(--accent-blue)', 'var(--warning)', '#f472b6', '#60a5fa'];

function Confetti({ count = 60 }: { count?: number }) {
  const pieces = useRef(
    Array.from({ length: count }).map((_, i) => {
      const angle = Math.PI * Math.random();
      const velocity = 50 + Math.random() * 150;
      return {
        id: i,
        dx: Math.cos(angle) * velocity * (Math.random() < 0.5 ? -1 : 1),
        rise: -(30 + Math.random() * 130),
        dy: 220 + Math.random() * 300,
        rotate: (Math.random() - 0.5) * 720,
        size: 5 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() < 0.35,
        delay: Math.random() * 0.1,
        duration: 1.5 + Math.random() * 1.1,
      };
    }),
  ).current;

  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 z-20" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.dx, y: [0, p.rise, p.dy], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.6, 0.4, 1], times: [0, 0.25, 1] }}
          style={{ position: 'absolute', width: p.size, height: p.round ? p.size : p.size * 0.6, background: p.color, borderRadius: p.round ? '9999px' : '1px' }}
        />
      ))}
    </span>
  );
}
