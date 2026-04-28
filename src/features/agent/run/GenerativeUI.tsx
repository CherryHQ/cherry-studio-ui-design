import React, { useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, X, Pencil, ArrowRight, Send } from 'lucide-react';
import { Button } from '@cherry-studio/ui';
import { motion } from 'motion/react';
import type { GenerativeUIData } from '@/app/types/chat';

// ===========================
// Resolved Q&A Card (compact, inline in chat history)
// ===========================

function ResolvedCard({ prompt, answers }: { prompt: string; answers: string[] }) {
  return (
    <div className="rounded-xl border border-border/30 bg-muted/20 px-3 py-2 inline-block">
      <p className="text-xs text-muted-foreground leading-relaxed">Q: {prompt}</p>
      {answers.map((a, i) => (
        <p key={i} className="text-xs text-foreground font-medium leading-relaxed">A: {a}</p>
      ))}
    </div>
  );
}

// ===========================
// Generative UI: Buttons (inline in chat when unresolved, Q&A card when resolved)
// ===========================

export function GenUIButtons({ data, msgId, onResolve }: {
  data: GenerativeUIData; msgId: string; onResolve: (msgId: string, value: string) => void;
}) {
  if (data.resolved && data.resolvedValue) {
    return <ResolvedCard prompt={data.prompt} answers={data.resolvedValue.split('\n')} />;
  }
  // Unresolved state is now handled by GenUIOverlay at input area
  return null;
}

// ===========================
// Generative UI: Selection (inline in chat when unresolved, Q&A card when resolved)
// ===========================

export function GenUISelection({ data, msgId, onResolve }: {
  data: GenerativeUIData; msgId: string; onResolve: (msgId: string, value: string) => void;
}) {
  if (data.resolved && data.resolvedValue) {
    return <ResolvedCard prompt={data.prompt} answers={data.resolvedValue.split('\n')} />;
  }
  return null;
}

// ===========================
// Generative UI: Confirmation (inline in chat when unresolved, Q&A card when resolved)
// ===========================

export function GenUIConfirmation({ data, msgId, onResolve }: {
  data: GenerativeUIData; msgId: string; onResolve: (msgId: string, value: string) => void;
}) {
  if (data.resolved) {
    const label = data.resolvedValue === 'confirm'
      ? (data.confirmLabel || '已确认')
      : '已取消';
    return <ResolvedCard prompt={data.prompt} answers={[label]} />;
  }
  return null;
}

// ===========================
// Input Overlay: Full-width interactive panel that replaces the input area
// ===========================

export function GenUIOverlay({ items, onResolve }: {
  items: { msgId: string; data: GenerativeUIData }[];
  onResolve: (msgId: string, value: string) => void;
}) {
  const [page, setPage] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const total = items.length;
  const current = items[Math.min(page, total - 1)];
  if (!current) return null;

  const { data, msgId } = current;
  const goPrev = () => setPage(p => Math.max(0, p - 1));
  const goNext = () => setPage(p => Math.min(total - 1, p + 1));
  const handleCustomSubmit = () => {
    const v = customInput.trim();
    if (v) { onResolve(msgId, v); setCustomInput(''); }
  };

  // Collect numbered options from either buttons or selection
  const options = data.type === 'buttons'
    ? (data.options?.map(o => ({ label: o.label, desc: undefined as string | undefined, disabled: o.disabled })) || [])
    : data.type === 'selection'
      ? (data.items?.map(item => ({ label: item.label, desc: item.description, disabled: false })) || [])
      : [];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="border border-border/50 rounded-2xl bg-background shadow-lg overflow-hidden"
    >
      {/* Header: question + pagination + close */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 gap-3">
        {data.type === 'confirmation' ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertTriangle size={14} className="text-warning flex-shrink-0" />
            <p className="text-sm text-foreground truncate">{data.prompt}</p>
          </div>
        ) : (
          <p className="text-sm text-foreground flex-1 min-w-0 truncate">{data.prompt}</p>
        )}
        {total > 1 && (
          <div className="flex items-center gap-1 flex-shrink-0 text-muted-foreground/50">
            <button onClick={goPrev} disabled={page === 0} className="hover:text-foreground disabled:opacity-30 transition-colors p-0.5"><ChevronLeft size={11} /></button>
            <span className="text-xs tabular-nums">{page + 1} of {total}</span>
            <button onClick={goNext} disabled={page >= total - 1} className="hover:text-foreground disabled:opacity-30 transition-colors p-0.5"><ChevronRight size={11} /></button>
          </div>
        )}
        <button onClick={() => onResolve(msgId, '__skip__')} className="text-muted-foreground/40 hover:text-foreground transition-colors flex-shrink-0 p-0.5">
          <X size={12} />
        </button>
      </div>

      {/* Body: options or confirmation */}
      {data.type === 'confirmation' ? (
        <div className="px-3 pb-3">
          <button
            onClick={() => onResolve(msgId, 'confirm')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-accent/60 active:scale-[0.99] group border-b border-border/10 ${
              data.confirmVariant === 'danger' ? 'hover:bg-destructive/8' : ''
            }`}
          >
            <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium flex-shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">1</span>
            <span className={`text-sm flex-1 ${data.confirmVariant === 'danger' ? 'text-destructive' : 'text-foreground'}`}>{data.confirmLabel || '确认'}</span>
            <ArrowRight size={12} className="text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
          <button
            onClick={() => onResolve(msgId, 'cancel')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-accent/60 active:scale-[0.99] group"
          >
            <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium flex-shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">2</span>
            <span className="text-sm text-foreground flex-1">{data.cancelLabel || '取消'}</span>
            <ArrowRight size={12} className="text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        </div>
      ) : (
        <>
          {/* Numbered options */}
          <div className="px-3 pb-1">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !opt.disabled && onResolve(msgId, opt.label)}
                disabled={opt.disabled}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-accent/60 active:scale-[0.99] group disabled:opacity-30 border-b border-border/10 last:border-b-0"
              >
                <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium flex-shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground">{opt.label}</span>
                  {opt.desc && <span className="text-xs text-muted-foreground/60 ml-2">{opt.desc}</span>}
                </div>
                <ArrowRight size={12} className="text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Custom input row (always last) */}
          <div className="flex items-center gap-2 px-3 pb-3 pt-1 border-t border-border/20">
            <div className="flex items-center gap-2 flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-muted/30">
              <Pencil size={11} className="text-muted-foreground/40 flex-shrink-0" />
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCustomSubmit(); } }}
                placeholder="输入其他内容..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none min-w-0"
              />
            </div>
            {customInput.trim() ? (
              <Button variant="default" size="icon-xs" onClick={handleCustomSubmit} className="rounded-lg flex-shrink-0">
                <Send size={10} />
              </Button>
            ) : (
              <Button variant="ghost" size="xs" onClick={() => onResolve(msgId, '__skip__')} className="text-muted-foreground/50 hover:text-foreground flex-shrink-0">
                Skip
              </Button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
