import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Pencil, Trash2, Send, Check, X } from 'lucide-react';
import { Textarea } from '@cherry-studio/ui';
import type { Annotation } from '@/app/types/agent';

interface Props {
  annotation: Annotation;
  index: number;
  /** Viewport coords of the anchor pin — popover positions itself relative to this. */
  pinRect: { x: number; y: number; w: number; h: number };
  onEdit: (id: string, comment: string) => void;
  onDelete: (id: string) => void;
  onSendNow: (id: string) => void;
  onClose: () => void;
  /** Mouse-leave the popover should debounce-close; mouse-enter cancels. */
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function AnnotationPinPopover({ annotation, index, pinRect, onEdit, onDelete, onSendNow, onClose, onMouseEnter, onMouseLeave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(annotation.comment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      const v = textareaRef.current.value;
      try { textareaRef.current.setSelectionRange(v.length, v.length); } catch { /* noop */ }
    }
  }, [editing]);

  // Position: prefer below-left of the pin so the popover doesn't overlap
  // the highlighted text. Clamp to viewport.
  const W = 280;
  const pad = 8;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  let left = pinRect.x + pinRect.w + 8;
  if (left + W > vw - pad) left = Math.max(pad, pinRect.x - W - 8);
  let top = pinRect.y;
  // If popover would clip below viewport, anchor above the pin.
  const estimatedH = 168;
  if (top + estimatedH > vh - pad) top = Math.max(pad, vh - estimatedH - pad);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== annotation.comment) onEdit(annotation.id, trimmed);
    setEditing(false);
  };
  const cancelEdit = () => {
    setDraft(annotation.comment);
    setEditing(false);
  };

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.12 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[2000] rounded-xl border border-border/60 bg-popover/95 backdrop-blur-sm shadow-lg overflow-hidden"
      style={{ left, top, width: W }}
    >
      <div className="px-3 py-2 border-b border-border/40 flex items-center gap-1.5">
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-medium leading-none tabular-nums">{index + 1}</span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground/60 hover:text-foreground transition-colors"
          aria-label="关闭"
        >
          <X size={11} />
        </button>
      </div>
      <div className="px-3 py-2">
        <div className="rounded-md border-l-2 border-amber-400/70 bg-amber-500/[0.06] px-2 py-1 mb-2">
          <span className="block text-[11px] text-foreground/80 line-clamp-2 leading-[1.5]">
            “{annotation.anchor.excerpt}”
          </span>
        </div>
        {editing ? (
          <>
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commitEdit(); }
                else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
              }}
              className="w-full bg-background border border-border/40 rounded-md text-[11.5px] px-2 py-1.5 outline-none focus:border-border/60 resize-none leading-[1.5]"
              placeholder="改一下评论…"
            />
            <div className="mt-1.5 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[10px] px-1.5 h-5 rounded text-muted-foreground/70 hover:text-foreground hover:bg-accent/40 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={commitEdit}
                disabled={!draft.trim()}
                className="text-[10px] px-1.5 h-5 rounded text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/40 transition-colors flex items-center gap-0.5"
              >
                <Check size={9} />
                <span>保存</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-[12px] text-foreground leading-[1.5] mb-2 whitespace-pre-wrap break-words">
              {annotation.comment}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(annotation.id)}
                  className="text-[10px] text-muted-foreground/60 hover:text-destructive flex items-center gap-0.5 transition-colors"
                >
                  <Trash2 size={9} />
                  <span>删除</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-[10px] text-muted-foreground/60 hover:text-foreground flex items-center gap-0.5 transition-colors"
                >
                  <Pencil size={9} />
                  <span>编辑</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSendNow(annotation.id)}
                className="text-[10px] text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-0.5 transition-colors"
              >
                <Send size={9} />
                <span>立即发送</span>
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
