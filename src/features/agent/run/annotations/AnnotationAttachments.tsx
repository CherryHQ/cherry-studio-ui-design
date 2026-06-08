import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquarePlus } from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';
import type { Annotation } from '@/app/types/agent';

interface Props {
  annotations: Annotation[];
  onRemove: (id: string) => void;
}

/**
 * Compact attachments strip above the chat composer — one small chip per
 * pending artifact annotation. Hover a chip to preview the comment; click ×
 * to remove. Deliberately minimal: the full text already lives on the pin
 * popovers inside the artifact viewer, so this strip is just a count + quick
 * remove affordance.
 */
export function AnnotationAttachments({ annotations, onRemove }: Props) {
  const count = annotations.length;
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 2 }}
      transition={{ duration: 0.16 }}
      className="flex items-center gap-1.5 flex-wrap px-1"
    >
      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300/90">
        <MessageSquarePlus size={11} />
        <span>随消息发送</span>
      </span>
      <AnimatePresence initial={false}>
        {annotations.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
          >
            <Tooltip
              content={a.comment.length > 60 ? `${a.comment.slice(0, 60)}…` : a.comment}
              side="top"
            >
              <span className="group inline-flex items-center gap-1 h-5 pl-1 pr-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-200 text-[10px]">
                <span className="tabular-nums leading-none">批注 {i + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemove(a.id)}
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-amber-700/70 hover:text-white hover:bg-amber-500 transition-colors"
                  aria-label="移除这条批注"
                >
                  <X size={9} strokeWidth={2.4} />
                </button>
              </span>
            </Tooltip>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
