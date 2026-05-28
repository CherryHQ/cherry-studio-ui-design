import { Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@cherry-studio/ui';

// Inline affordance that appears below the last agent message when a task
// just finished, suggesting the user wrap the conversation into a reusable
// skill. Per cherry-studio#15029: facilitator-led discovery is removed by
// surfacing this contextually instead of leaving "save as skill" buried
// in chrome.
interface Props {
  /** Short context line for the callout body (e.g. "刚刚完成了一份调研报告"). */
  taskSummary?: string;
  onSave: () => void;
  onDismiss: () => void;
}

export function SaveAsSkillCallout({ taskSummary, onSave, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="flex-shrink-0 px-4 pt-2"
    >
      <div className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-border/40 bg-muted/30">
        <Sparkles size={12} className="text-muted-foreground/70 flex-shrink-0" />
        <p className="flex-1 min-w-0 text-xs text-muted-foreground leading-relaxed pr-4">
          {taskSummary
            ? <>把「<span className="text-foreground">{taskSummary}</span>」沉淀成可复用 Skill？</>
            : '把这次任务沉淀成可复用 Skill？'}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="xs"
            onClick={onSave}
            className="h-7 px-2.5 text-xs text-foreground hover:bg-accent/40"
          >
            保存
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="关闭建议"
            className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent/40 transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
