import React, { useEffect, useRef, useState } from 'react';
import { Button, Textarea } from '@cherry-studio/ui';
import { Tooltip } from '@/app/components/Tooltip';
import { Send, Trash2, MessageSquarePlus, MousePointer2, TextCursor, ChevronRight, Lock, X, Pencil, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Annotation } from '@/app/types/agent';

interface Props {
  annotations: Annotation[];
  enabled: boolean;
  readOnly: boolean;
  /** Toggle the annotation mode on/off. */
  onToggleEnabled: () => void;
  onSendOne: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, comment: string) => void;
  onSendAll: () => void;
  onFocus: (id: string) => void;
  artifactKind: 'html' | 'markdown';
}

export function AnnotationSidePanel({ annotations, enabled, readOnly, onToggleEnabled, onSendOne, onDelete, onEdit, onSendAll, onFocus, artifactKind }: Props) {
  const count = annotations.length;
  const hasAny = count > 0;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      const v = editRef.current.value;
      try { editRef.current.setSelectionRange(v.length, v.length); } catch { /* noop */ }
    }
  }, [editingId]);

  const startEdit = (a: Annotation) => {
    setEditingId(a.id);
    setEditingText(a.comment);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };
  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = editingText.trim();
    if (trimmed) onEdit(editingId, trimmed);
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="h-full w-full flex flex-col bg-background/95">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquarePlus size={12} className="text-amber-500" />
          <span className="text-xs text-foreground font-medium">批注</span>
          {count > 0 && (
            <span className="text-[10px] text-muted-foreground/70 tabular-nums">{count}</span>
          )}
        </div>
        {!readOnly && (
          <Tooltip content="收起（保留待发送批注）" side="bottom">
            <button
              type="button"
              onClick={onToggleEnabled}
              aria-label="收起批注侧栏"
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            >
              <X size={12} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Mode hint */}
      {!readOnly && enabled && (
        <div className="px-3 py-2 border-b border-border/30 bg-amber-500/[0.04] text-[11px] text-amber-700 dark:text-amber-300 leading-[1.5]">
          {artifactKind === 'markdown' ? (
            <>选中文字 → 弹出批注框；写完点保存加入下方列表。</>
          ) : (
            <>选中文字加文本批注；按住 <kbd className="px-1 py-px rounded bg-amber-500/15 text-[10px]">Option</kbd> + 点击元素加元素批注。</>
          )}
        </div>
      )}

      {/* Read-only banner */}
      {readOnly && (
        <div className="px-3 py-2 border-b border-border/30 bg-muted/40 text-[11px] text-muted-foreground leading-[1.5] flex items-center gap-1.5">
          <Lock size={11} className="flex-shrink-0" />
          <span>此版本已被新回复替代，仅可查看，不能再添加批注。</span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {!hasAny ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <MessageSquarePlus size={16} className="text-amber-500/80" />
            </div>
            <div className="text-xs text-foreground">还没有批注</div>
            <div className="text-[11px] text-muted-foreground/70 leading-[1.6]">
              {readOnly
                ? '这个版本是旧版，已经发出过修改。'
                : artifactKind === 'markdown'
                  ? '划选一段你想改的文字试试。'
                  : '划词或 Option+ 点元素，给智能体精确的修改指令。'}
            </div>
          </div>
        ) : (
          <ul className="px-2 py-2 space-y-2">
            <AnimatePresence initial={false}>
              {annotations.map((a, i) => {
                const isEditing = editingId === a.id;
                return (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.16 }}
                    className={`rounded-lg border px-2.5 py-2 transition-colors ${
                      isEditing
                        ? 'border-amber-400/60 bg-amber-500/[0.04]'
                        : 'border-border/40 bg-background/80 hover:border-border/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-medium leading-none tabular-nums">{i + 1}</span>
                      {a.anchor.kind === 'text' ? (
                        <TextCursor size={10} className="text-muted-foreground/70" />
                      ) : (
                        <MousePointer2 size={10} className="text-muted-foreground/70" />
                      )}
                      <button
                        type="button"
                        onClick={() => onFocus(a.id)}
                        className="text-[10px] text-muted-foreground/70 truncate flex-1 text-left hover:text-foreground"
                      >
                        {a.anchor.label}
                      </button>
                    </div>
                    <div className="rounded-md border-l-2 border-amber-400/60 bg-amber-500/[0.05] px-1.5 py-1 mb-1.5">
                      <span className="block text-[11px] text-foreground/85 line-clamp-2 leading-[1.5]">
                        "{a.anchor.excerpt}"
                      </span>
                    </div>
                    {isEditing ? (
                      <>
                        <Textarea
                          ref={editRef}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault();
                              commitEdit();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                          rows={3}
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
                            disabled={!editingText.trim()}
                            className="text-[10px] px-1.5 h-5 rounded text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/40 transition-colors flex items-center gap-0.5"
                          >
                            <Check size={9} />
                            <span>保存</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(a)}
                          className="w-full text-[11.5px] text-foreground leading-[1.5] text-left hover:bg-accent/30 rounded px-0.5 -mx-0.5 transition-colors line-clamp-3"
                          title="点击编辑"
                        >
                          {a.comment}
                        </button>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onDelete(a.id)}
                              className="text-[10px] text-muted-foreground/60 hover:text-destructive flex items-center gap-0.5 transition-colors"
                            >
                              <Trash2 size={9} />
                              <span>删除</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(a)}
                              className="text-[10px] text-muted-foreground/60 hover:text-foreground flex items-center gap-0.5 transition-colors"
                            >
                              <Pencil size={9} />
                              <span>编辑</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSendOne(a.id)}
                            className="text-[10px] text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 flex items-center gap-0.5 transition-colors"
                          >
                            <span>立即发送</span>
                            <ChevronRight size={9} />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Footer: send batch */}
      <div className="px-3 py-2.5 border-t border-border/40">
        {hasAny ? (
          <Button
            variant="default"
            size="sm"
            onClick={onSendAll}
            className="w-full h-8 gap-1.5 text-xs"
          >
            <Send size={12} />
            <span>发送给智能体 （{count}）</span>
          </Button>
        ) : (
          <Tooltip content="还没有待发送的批注" side="top">
            <Button
              variant="default"
              size="sm"
              disabled
              className="w-full h-8 gap-1.5 text-xs"
            >
              <Send size={12} />
              <span>发送给智能体</span>
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
