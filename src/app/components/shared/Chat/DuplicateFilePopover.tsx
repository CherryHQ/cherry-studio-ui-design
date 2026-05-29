import * as React from 'react';
import { cn } from '@cherry-studio/ui';
import { Check } from 'lucide-react';

// ===========================
// Duplicate File Popover
// ===========================
// Shown when the user uploads a file and main detects a byte-identical copy
// already in its store. Floats above the input bar (never overlapping it) and
// offers three ways to handle the duplicate. Fully keyboard-driven:
//   1 / 2 / 3  → pick that option directly
//   ↑ / ↓      → move the highlight, Enter confirms it
//   Esc / 点外部 → cancel the upload
// On confirm the chosen option's badge plays a success ✓ before the popover
// closes (the parent resolves its loading chip once onResolve fires).
//
// Implementation note: this is a plain absolutely-positioned panel (the same
// idiom as the slash / @ menus in the composer), NOT a Radix Popover. Keyboard
// is handled by a window-level capture listener so the shortcuts work no matter
// what holds DOM focus — Radix's focus model fought programmatic opening here.

export type DuplicateChoice = 'reuse' | 'overwrite' | 'keep-both';

const OPTIONS: { choice: DuplicateChoice; label: string }[] = [
  { choice: 'reuse', label: '复用已有的文件' },
  { choice: 'overwrite', label: '覆盖已有的文件' },
  { choice: 'keep-both', label: '二者都保留' },
];

/** How long the success ✓ animation shows before the popover closes. */
const CONFIRM_DELAY = 600;

export interface DuplicateFilePopoverProps {
  /** Non-null opens the popover; carries the just-"uploaded" file name. */
  state: { fileName: string } | null;
  /** User confirmed one of the options (fires after the success animation). */
  onResolve: (choice: DuplicateChoice) => void;
  /** Esc / outside-click / close = cancel the upload (no chip kept). */
  onCancel: () => void;
  /** Anchor: the input-bar container. Rendered inside a relative wrapper so the
   *  panel can position itself above it. */
  children: React.ReactNode;
}

export function DuplicateFilePopover({ state, onResolve, onCancel, children }: DuplicateFilePopoverProps) {
  const [highlight, setHighlight] = React.useState(0);
  // Index of the option being confirmed (success animation in flight), or null.
  const [confirmed, setConfirmed] = React.useState<number | null>(null);
  const timerRef = React.useRef<number | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Reset whenever the popover (re)opens; clear any pending timer on close.
  React.useEffect(() => {
    if (state) {
      setHighlight(0);
      setConfirmed(null);
    }
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state]);

  const confirm = React.useCallback((index: number) => {
    if (confirmed !== null) return; // animation already running — ignore
    setConfirmed(index);
    timerRef.current = window.setTimeout(() => onResolve(OPTIONS[index].choice), CONFIRM_DELAY);
  }, [confirmed, onResolve]);

  // Global keyboard + outside-click while open. We listen on window in the
  // CAPTURE phase rather than relying on the panel holding focus: the shortcuts
  // then fire regardless of what's focused (composer, "+" button, …), and
  // stopPropagation keeps the keystrokes out of the chat input.
  React.useEffect(() => {
    if (!state) return;

    const onKey = (e: KeyboardEvent) => {
      // While the success animation plays, swallow everything.
      if (confirmed !== null) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      switch (e.key) {
        case '1':
        case '2':
        case '3':
          e.preventDefault();
          e.stopPropagation();
          confirm(Number(e.key) - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setHighlight(h => (h + 1) % OPTIONS.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setHighlight(h => (h + OPTIONS.length - 1) % OPTIONS.length);
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          confirm(highlight);
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          onCancel();
          break;
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      if (confirmed !== null) return; // mid success-animation: ignore outside clicks
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onCancel();
    };

    window.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onPointerDown, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('mousedown', onPointerDown, true);
    };
  }, [state, highlight, confirmed, confirm, onCancel]);

  return (
    <div className="relative">
      {children}
      {state && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="重复文件处理"
          className="absolute bottom-full left-0 z-[var(--z-popover)] mb-2.5 w-80 origin-bottom rounded-[var(--radius-card)] border bg-popover text-popover-foreground shadow-popover backdrop-blur-[6px] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150"
        >
          {/* Title */}
          <div className="px-3.5 pt-3 pb-2">
            <div className="text-[13px] leading-snug">
              发现内容相同的文件 <span className="font-medium break-all">{state.fileName}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">请决定如何处理</div>
          </div>

          {/* Options */}
          <div className="px-1.5 pb-1 flex flex-col gap-0.5">
            {OPTIONS.map((opt, i) => {
              const isConfirmed = confirmed === i;
              const isActive = confirmed === null && highlight === i;
              return (
                <button
                  key={opt.choice}
                  type="button"
                  onClick={() => confirm(i)}
                  onMouseEnter={() => { if (confirmed === null) setHighlight(i); }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors',
                    isActive ? 'bg-accent' : 'hover:bg-accent/50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[11px] font-medium tabular-nums transition-colors',
                      isConfirmed ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isConfirmed
                      ? <Check size={13} strokeWidth={2.5} className="animate-in zoom-in-50 duration-200" />
                      : i + 1}
                  </span>
                  <span className="flex-1 text-[13px]">{opt.label}</span>
                  {isActive && <span className="text-xs text-muted-foreground/70 leading-none">⏎</span>}
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="border-t border-border/40 px-3.5 py-1.5 text-[11px] text-muted-foreground">
            1 / 2 / 3 快捷选择 · ↑↓ 移动 · Enter 确认 · Esc 取消
          </div>
        </div>
      )}
    </div>
  );
}
