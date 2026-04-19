import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { motion } from 'motion/react';
import type { GenerativeUIData } from '@/app/types/chat';

// ===========================
// Generative UI: Buttons
// ===========================

export function GenUIButtons({ data, msgId, onResolve }: {
  data: GenerativeUIData; msgId: string; onResolve: (msgId: string, value: string) => void;
}) {
  const resolved = data.resolved;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border/30 overflow-hidden"
    >
      <div className="px-3 pt-2.5 pb-2">
        <p className="text-xs text-foreground/90 leading-[1.6]">{data.prompt}</p>
      </div>
      <div className="flex flex-wrap gap-[5px] px-3 pb-3">
        {data.options?.map((opt, i) => {
          const isSelected = resolved && data.resolvedValue === opt.label;
          const isOther = resolved && !isSelected;
          return (
            <Button
              variant="outline"
              size="xs"
              key={i}
              onClick={() => !resolved && onResolve(msgId, opt.label)}
              disabled={!!resolved || opt.disabled}
              className={`active:scale-[0.97] ${
                isSelected
                  ? 'border-cherry-ring bg-cherry-active-bg text-cherry-text'
                  : isOther
                    ? 'border-border/15 text-muted-foreground/40 cursor-default'
                    : opt.variant === 'danger'
                      ? 'border-border/30 text-destructive hover:bg-destructive/8'
                      : 'border-border/30 text-foreground/80 hover:bg-accent/25 hover:text-foreground'
              }`}
            >
              {isSelected && <Check size={9} className="inline mr-1 -mt-px text-cherry-primary-dark" />}
              {opt.label}
            </Button>
          );
        })}
      </div>
      {resolved && data.resolvedValue && (
        <div className="px-3 pb-2.5 border-t border-border/20 pt-2">
          <p className="text-xs text-foreground/65 leading-[1.6]">
            {"已选择 "}<span className="text-cherry-primary-dark">{data.resolvedValue}</span>{"，正在执行..."}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ===========================
// Generative UI: Selection
// ===========================

export function GenUISelection({ data, msgId, onResolve }: {
  data: GenerativeUIData; msgId: string; onResolve: (msgId: string, value: string) => void;
}) {
  const resolved = data.resolved;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border/30 overflow-hidden"
    >
      <div className="px-3 pt-2.5 pb-2">
        <p className="text-xs text-foreground/90 leading-[1.6]">{data.prompt}</p>
      </div>
      <div className="flex flex-col gap-[2px] px-2 pb-2">
        {data.items?.map((item, i) => {
          const isSelected = resolved && data.resolvedValue === item.label;
          const isOther = resolved && !isSelected;
          return (
            <Button
              variant="ghost"
              size="xs"
              key={i}
              onClick={() => !resolved && onResolve(msgId, item.label)}
              disabled={!!resolved}
              className={`w-full justify-start gap-2.5 ${
                isSelected
                  ? 'bg-cherry-active-bg text-cherry-text'
                  : isOther
                    ? 'text-muted-foreground/40 cursor-default'
                    : 'text-foreground/80 hover:bg-accent/25 hover:text-foreground'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected ? 'border-cherry-primary-dark bg-cherry-primary-dark' : isOther ? 'border-border/25' : 'border-border/40'
              }`}>
                {isSelected && <Check size={7} className="text-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px]">{item.label}</span>
                {item.description && (
                  <span className="text-[9px] text-muted-foreground/60 ml-2">{item.description}</span>
                )}
              </div>
            </Button>
          );
        })}
      </div>
      {resolved && data.resolvedValue && (
        <div className="px-3 pb-2.5 border-t border-border/20 pt-2">
          <p className="text-xs text-foreground/65 leading-[1.6]">
            {"已选择 "}<span className="text-cherry-primary-dark">{data.resolvedValue}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ===========================
// Generative UI: Confirmation
// ===========================

export function GenUIConfirmation({ data, msgId, onResolve }: {
  data: GenerativeUIData; msgId: string; onResolve: (msgId: string, value: string) => void;
}) {
  const resolved = data.resolved;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border/30 overflow-hidden"
    >
      <div className="flex items-start gap-2 px-3 pt-2.5 pb-2">
        <AlertTriangle size={12} className="text-warning flex-shrink-0 mt-[1px]" />
        <p className="text-xs text-foreground/90 leading-[1.6] flex-1">{data.prompt}</p>
      </div>
      <div className="flex items-center gap-2 px-3 pb-3">
        <Button
          variant="outline"
          size="xs"
          onClick={() => !resolved && onResolve(msgId, 'confirm')}
          disabled={!!resolved}
          className={`active:scale-[0.97] ${
            resolved && data.resolvedValue === 'confirm'
              ? (data.confirmVariant === 'danger'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-cherry-ring bg-cherry-active-bg text-cherry-text')
              : resolved
                ? 'border-border/15 text-muted-foreground/30 cursor-default'
                : data.confirmVariant === 'danger'
                  ? 'border-border/30 text-destructive hover:bg-destructive/8'
                  : 'border-border/30 text-foreground/70 hover:bg-accent/20'
          }`}
        >
          {resolved && data.resolvedValue === 'confirm' && <Check size={9} className="inline mr-1 -mt-px text-cherry-primary-dark" />}
          {data.confirmLabel || '确认'}
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => !resolved && onResolve(msgId, 'cancel')}
          disabled={!!resolved}
          className={`active:scale-[0.97] ${
            resolved && data.resolvedValue === 'cancel'
              ? 'border-foreground/25 bg-foreground/8 text-foreground/70'
              : resolved
                ? 'border-border/15 text-muted-foreground/30 cursor-default'
                : 'border-border/30 text-muted-foreground/75 hover:text-foreground/85 hover:bg-accent/20'
          }`}
        >
          {data.cancelLabel || '取消'}
        </Button>
      </div>
      {resolved && (
        <div className="px-3 pb-2.5 border-t border-border/20 pt-2">
          <p className="text-xs text-foreground/65 leading-[1.6]">
            {data.resolvedValue === 'confirm'
              ? <span>{"已确认 "}<span className="text-cherry-primary-dark">{data.confirmLabel || '确认'}</span></span>
              : <span>{"已取消"}</span>
            }
          </p>
        </div>
      )}
    </motion.div>
  );
}
