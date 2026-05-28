import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Wrench, ArrowRight, X } from 'lucide-react';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Popover, PopoverTrigger, PopoverContent } from '@cherrystudio/ui/components/primitives/popover';
import {
  CREATE_SKILL_STEPS,
  dismissActiveSkillJob,
  useActiveSkillJob,
} from '@/app/stores/skillJobStore';
import { useGlobalActions } from '@/app/context/GlobalActionContext';

// ============================================================
// SkillJobStatusChip
// ============================================================
// Sits in the agent chat header. While a create_skill job is running
// it shows a click-to-inspect chip. On done it surfaces a "查看 Skill"
// shortcut to the library and auto-dismisses after a few seconds.

export function SkillJobStatusChip() {
  const job = useActiveSkillJob();
  const { navigateToLibrary } = useGlobalActions();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!job) {
      setOpen(false);
      return;
    }
    // Pop the popover briefly when the job transitions to done so the
    // user notices it without having to click. Stays open until they
    // dismiss or auto-collapse fires.
    if (job.status === 'done') {
      setOpen(true);
      const t = setTimeout(() => {
        // Hold the chip ~5s after success, then quietly retire it so
        // the toolbar reverts to the regular "保存为 Skill" button.
        dismissActiveSkillJob();
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [job?.id, job?.status]);

  if (!job) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="xs"
          className={`gap-1.5 px-2 py-[3px] text-xs ${
            job.status === 'done'
              ? 'text-success hover:text-success hover:bg-success/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
          }`}
          title={job.status === 'running' ? '查看 create_skill 状态' : '查看新创建的 Skill'}
        >
          {job.status === 'running' ? (
            <>
              <Loader2 size={11} className="text-accent-violet animate-spin flex-shrink-0" />
              <span className="truncate max-w-[200px]">
                创建 <span className="font-mono">{job.name}</span>
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={11} className="text-success flex-shrink-0" />
              <span className="truncate max-w-[200px]">
                <span className="font-mono">{job.name}</span> 已加入资源库
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-[320px] p-0">
        {/* Tool header — mimics the agent message tool-call style */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/15">
          <div className="flex items-center gap-2 min-w-0">
            <Wrench size={11} className="text-accent-violet flex-shrink-0" />
            <span className="text-xs font-mono text-foreground">create_skill</span>
          </div>
          {job.status === 'running' ? (
            <Loader2 size={11} className="text-muted-foreground/60 animate-spin" />
          ) : (
            <CheckCircle2 size={11} className="text-success" />
          )}
        </div>

        {/* Meta */}
        <div className="px-3 py-2.5 space-y-1.5 border-b border-border/15">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/40 w-10 flex-shrink-0">工具名</span>
            <span className="text-xs text-foreground truncate font-mono">{job.name}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/40 w-10 flex-shrink-0">来源</span>
            <span className="text-xs text-muted-foreground/80 truncate">{job.agentAvatar} {job.agentName}</span>
          </div>
        </div>

        {/* Step timeline */}
        <div className="px-3 py-2.5 space-y-1.5">
          {CREATE_SKILL_STEPS.map((step, i) => {
            const isDone = job.status === 'done' || i < job.currentStep;
            const isRunning = job.status === 'running' && i === job.currentStep;
            return (
              <div key={step.id} className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  {isDone && <CheckCircle2 size={11} className="text-success" />}
                  {isRunning && <Loader2 size={11} className="text-muted-foreground/80 animate-spin" />}
                  {!isDone && !isRunning && <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />}
                </span>
                <span className={isDone ? 'text-foreground' : isRunning ? 'text-muted-foreground/80' : 'text-muted-foreground/40'}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border/15">
          {job.status === 'done' ? (
            <>
              <button
                type="button"
                onClick={dismissActiveSkillJob}
                aria-label="关闭"
                className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent/40"
              >
                <X size={11} />
              </button>
              <Button
                size="xs"
                variant="default"
                onClick={() => { dismissActiveSkillJob(); setOpen(false); navigateToLibrary(); }}
                className="gap-1.5"
              >
                查看 Skill
                <ArrowRight size={10} />
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
              <Loader2 size={10} className="animate-spin" />
              后台执行中，可继续对话
            </span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
