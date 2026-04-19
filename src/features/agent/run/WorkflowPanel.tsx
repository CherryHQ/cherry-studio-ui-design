import React, { useState } from 'react';
import {
  ChevronDown, Check, X,
  Search, Globe, FileText, Package, Code2, Paintbrush,
  Settings, Rocket, CheckCircle2,
  Circle, ListFilter, Share2,
  Loader2,
} from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import { shakeAnimation } from '@/app/config/animations';
import type { WorkflowStep } from '@/app/types/chat';

// ===========================
// Step Icon resolver
// ===========================

export function StepIcon({ type, status, size = 13 }: { type: WorkflowStep['icon']; status?: WorkflowStep['status']; size?: number }) {
  const cls = status === 'done'
    ? 'text-cherry-primary-dark'
    : status === 'running'
      ? 'text-cherry-primary'
      : 'text-muted-foreground/40';

  const iconNode = (() => {
    switch (type) {
      case 'search': return <Search size={size} className={cls} />;
      case 'review': return <Globe size={size} className={cls} />;
      case 'write': return <FileText size={size} className={cls} />;
      case 'install': return <Package size={size} className={cls} />;
      case 'config': return <Settings size={size} className={cls} />;
      case 'build': return <Rocket size={size} className={cls} />;
      case 'finish': return <CheckCircle2 size={size} className={cls} />;
      case 'code': return <Code2 size={size} className={cls} />;
      case 'paint': return <Paintbrush size={size} className={cls} />;
      default: return <Circle size={size} className={cls} />;
    }
  })();

  if (status === 'running') {
    return (
      <motion.div {...shakeAnimation} className="flex items-center justify-center">
        {iconNode}
      </motion.div>
    );
  }

  return iconNode;
}

// ===========================
// Status Indicator
// ===========================

export function StatusDot({ status, size = 10 }: { status: 'done' | 'running' | 'pending' | 'error'; size?: number }) {
  if (status === 'done') {
    return (
      <div className="w-4 h-4 rounded-[4px] bg-cherry-active-bg flex items-center justify-center flex-shrink-0">
        <Check size={size} className="text-cherry-primary-dark" />
      </div>
    );
  }
  if (status === 'running') {
    return (
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <Loader2 size={size + 1} className="text-cherry-primary animate-spin" />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="w-4 h-4 rounded-[4px] bg-destructive/15 flex items-center justify-center flex-shrink-0">
        <X size={size} className="text-destructive" />
      </div>
    );
  }
  return (
    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
      <Circle size={size} className="text-muted-foreground/30" />
    </div>
  );
}

// ===========================
// Task Item
// ===========================

function TaskItem({ step }: { step: WorkflowStep }) {
  return (
    <div className="flex items-center gap-2 py-[5px] px-1">
      <StatusDot status={step.status} />
      <span className={`text-xs flex-1 truncate ${
        step.status === 'done'
          ? 'text-foreground/80'
          : step.status === 'running'
            ? 'text-foreground'
            : 'text-muted-foreground/50'
      }`}>
        {step.label}
      </span>
    </div>
  );
}

// ===========================
// Process Detail
// ===========================

function ProcessDetail({ step }: { step: WorkflowStep }) {
  const hasContent = step.description || (step.details && step.details.length > 0);
  if (!hasContent) return null;

  return (
    <div className="ml-6 mb-1">
      {step.description && (
        <div className="bg-muted/60 rounded-md px-3 py-2 mb-1">
          <p className="text-xs text-foreground/60 leading-[1.6]">{step.description}</p>
        </div>
      )}
      {step.details && step.details.length > 0 && (
        <div className="bg-muted/60 rounded-md overflow-hidden">
          {step.detailLabel && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{step.detailLabel}</span>
                <span className="text-[9px] text-muted-foreground/60">{step.details.length}</span>
              </div>
              <Share2 size={9} className="text-muted-foreground/50" />
            </div>
          )}
          <div className="py-0.5">
            {step.details.map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-[4px] hover:bg-muted/80 transition-colors">
                {item.icon && (
                  <span className="text-xs w-4 h-4 flex items-center justify-center flex-shrink-0 rounded bg-muted">
                    {item.icon}
                  </span>
                )}
                <span className="text-xs text-foreground/70 flex-1 truncate">{item.label}</span>
                {item.meta && (
                  <span className="text-[9px] text-muted-foreground/60 flex-shrink-0">{item.meta}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================
// Workflow Panel (collapsible)
// ===========================

export function WorkflowPanel({ steps }: { steps: WorkflowStep[] }) {
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [processExpanded, setProcessExpanded] = useState(false);
  const doneCount = steps.filter(s => s.status === 'done').length;
  const hasAnyProcess = steps.some(s => s.description || (s.details && s.details.length > 0));
  const stepsWithProcess = steps.filter(s => s.description || (s.details && s.details.length > 0));
  const currentStep = steps.find(s => s.status === 'running') || steps.filter(s => s.status === 'done').pop();

  return (
    <div className="mx-3 mt-3 mb-1 rounded-xl border border-border/60 shadow-[0_1px_4px_rgba(0,0,0,0.06)] bg-card overflow-hidden flex-shrink-0">
      {/* Collapsible header */}
      <Button
        variant="ghost"
        onClick={() => setPanelExpanded(!panelExpanded)}
        className="w-full justify-start gap-2 px-3.5 py-2.5 h-auto font-normal hover:bg-muted/50 rounded-none"
      >
        <motion.div
          animate={{ rotate: panelExpanded ? 0 : -90 }}
          transition={{ duration: 0.12 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={10} className="text-muted-foreground" />
        </motion.div>
        <span className={`text-xs text-foreground/85 text-left ${panelExpanded ? 'flex-1' : 'flex-shrink-0'}`}>{"任务"}</span>
        {/* Collapsed: show current task inline */}
        {!panelExpanded && currentStep && (
          <span className="flex items-center gap-1.5 flex-1 min-w-0">
            <StatusDot status={currentStep.status} size={8} />
            <span className={`text-xs truncate ${
              currentStep.status === 'running' ? 'text-foreground' : 'text-foreground/70'
            }`}>
              {currentStep.label}
            </span>
          </span>
        )}
        <span className="text-[9px] text-muted-foreground tabular-nums flex-shrink-0">{doneCount}/{steps.length}</span>
      </Button>

      <AnimatePresence initial={false}>
        {panelExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {/* Task list */}
            <div className="px-3 pb-1">
              {steps.map((step) => (
                <TaskItem key={step.id} step={step} />
              ))}
            </div>

            {/* Process section (collapsible) */}
            {hasAnyProcess && (
              <div>
                <Button
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); setProcessExpanded(!processExpanded); }}
                  className="w-full justify-start gap-2 px-4 py-2 h-auto font-normal hover:bg-muted/50 rounded-none border-t border-border/40"
                >
                  <motion.div
                    animate={{ rotate: processExpanded ? 0 : -90 }}
                    transition={{ duration: 0.12 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={9} className="text-muted-foreground/60" />
                  </motion.div>
                  <span className="text-xs text-muted-foreground flex-1 text-left">{"执行过程详情"}</span>
                </Button>
                <AnimatePresence initial={false}>
                  {processExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-2">
                        {stepsWithProcess.map((step) => (
                          <div key={step.id} className="mb-1.5">
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <StepIcon type={step.icon} status={step.status} size={10} />
                              <span className="text-xs text-muted-foreground">{step.label}</span>
                            </div>
                            <ProcessDetail step={step} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Bottom bar */}
            <div className="flex items-center gap-2 px-3.5 py-2 border-t border-border/40">
              <ListFilter size={11} className="text-muted-foreground/60 flex-shrink-0" />
              <span className="text-xs text-muted-foreground flex-1">
                {doneCount}/{steps.length} {"任务已完成"}
              </span>
              <Button variant="ghost" size="icon-xs" className="p-0.5 text-cherry-primary-dark hover:text-cherry-text">
                <X size={10} />
              </Button>
              <Button variant="ghost" size="icon-xs" className="p-0.5 text-cherry-primary-dark hover:text-cherry-text">
                <Check size={11} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
