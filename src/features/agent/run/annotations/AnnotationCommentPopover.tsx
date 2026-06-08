import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Button, Textarea } from '@cherry-studio/ui';
import { Send } from 'lucide-react';
import type { AnnotationAnchor } from '@/app/types/agent';

interface Props {
  anchor: AnnotationAnchor;
  /** Position in viewport coords (px) where the popover should anchor. */
  position: { x: number; y: number };
  /** Save into the pending batch — annotations show up as chips on the
   *  composer until the user decides to send. */
  onSave: (comment: string) => void;
  /** Send right now — saves the annotation AND dispatches it as a single-item
   *  batch immediately, no composer roundtrip. */
  onSendNow?: (comment: string) => void;
  onCancel: () => void;
}

export function AnnotationCommentPopover({ anchor: _anchor, position, onSave, onSendNow, onCancel }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Keep popover within viewport so it doesn't clip off the right edge.
  const W = 280;
  const maxLeft = typeof window !== 'undefined' ? window.innerWidth - W - 8 : position.x;
  const left = Math.max(8, Math.min(position.x, maxLeft));
  const top = Math.max(8, position.y);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[2000] rounded-xl border border-border/60 bg-popover shadow-lg overflow-hidden"
      style={{ left, top, width: W }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="px-2 py-1.5">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="想让智能体怎么改？"
          rows={3}
          className="w-full bg-transparent text-xs px-1.5 py-1 outline-none focus-visible:ring-0 border-0 shadow-none resize-none leading-[1.5]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              if (text.trim()) onSave(text.trim());
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              onCancel();
            }
          }}
        />
        <div className="mt-1 flex items-center justify-end gap-1">
          <Button variant="ghost" size="xs" onClick={onCancel} className="h-6 px-2 text-[11px]">
            取消
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => text.trim() && onSave(text.trim())}
            disabled={!text.trim()}
            className="h-6 px-2 text-[11px]"
          >
            保存
          </Button>
          {onSendNow && (
            <Button
              variant="default"
              size="xs"
              onClick={() => text.trim() && onSendNow(text.trim())}
              disabled={!text.trim()}
              className="h-6 px-2.5 text-[11px] gap-1 bg-amber-500 hover:bg-amber-600"
            >
              <Send size={10} />
              <span>直接发送</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
