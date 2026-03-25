import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Info } from 'lucide-react';
import { Tooltip } from '@/app/components/Tooltip';

// ===========================
// Toggle Switch
// ===========================
export function Toggle({ checked, onChange, disabled, size = 'md' }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const w = size === 'sm' ? 'w-7' : 'w-8';
  const h = size === 'sm' ? 'h-[16px]' : 'h-[18px]';
  const dot = size === 'sm' ? 'w-[12px] h-[12px]' : 'w-[14px] h-[14px]';
  const translate = size === 'sm' ? 'translate-x-[13px]' : 'translate-x-[14px]';
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`${w} ${h} rounded-full relative transition-colors duration-200 flex-shrink-0 text-[11px] ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${
        checked ? 'bg-primary' : 'bg-input'
      }`}
    >
      <div className={`${dot} rounded-full bg-white absolute top-[2px] left-[2px] transition-transform duration-200 shadow-sm ${
        checked ? translate : 'translate-x-0'
      }`} />
    </button>
  );
}

// ===========================
// Form Row
// ===========================
export function FormRow({ label, desc, children, noBorder, disabled }: {
  label: string;
  desc?: string;
  children: React.ReactNode;
  noBorder?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-6 py-[5px] ${disabled ? 'opacity-40' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] text-foreground/60" style={{ fontWeight: 400 }}>{label}</p>
          {desc && (
            <Tooltip content={desc} side="top">
              <span className="text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors cursor-help flex-shrink-0">
                <Info size={11} />
              </span>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ===========================
// Section Header
// ===========================
export function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[12px] text-foreground/70 mb-0 mt-2" style={{ fontWeight: 500 }}>{title}</p>
  );
}

// ===========================
// Inline Select
// ===========================
export function InlineSelect({ value, options, onChange, className, fullWidth, disabled, size = 'sm', showDesc, dropUp }: {
  value: string;
  options: { value: string; label: string; desc?: string }[];
  onChange: (v: string) => void;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  /** 'sm' = default compact style; 'md' = larger style (used in QuickAssistantPage) */
  size?: 'sm' | 'md';
  /** When true, renders option.desc as a visual prefix in both the trigger and dropdown items */
  showDesc?: boolean;
  /** When true, dropdown opens upward */
  dropUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (ref.current) setRect(ref.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && ref.current.contains(e.target as Node)) return;
      if (portalRef.current && portalRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => {
    if (open) updateRect();
  }, [open, updateRect]);

  const selected = options.find(o => o.value === value);

  const isMd = size === 'md';
  const btnPx = isMd ? 'px-3.5' : 'px-3';
  const btnPy = isMd ? 'py-[7px]' : 'py-[5px]';
  const btnText = isMd ? 'text-[11px]' : 'text-[10px]';
  const chevronSize = isMd ? 10 : 9;
  const checkSize = isMd ? 12 : 10;
  const descFontSize = isMd ? 'text-[12px]' : 'text-[10px]';
  const dropMinW = isMd ? 180 : 150;

  return (
    <div ref={ref} className={`relative ${className || ''}`}>
      <button
        onClick={() => !disabled && setOpen(v => !v)}
        className={`flex items-center gap-1.5 ${btnPx} ${btnPy} rounded-full bg-foreground/[0.06] ${btnText} transition-colors justify-between ${
          fullWidth ? 'w-full' : (isMd ? 'min-w-[160px]' : 'min-w-[150px]')
        } ${
          disabled ? 'opacity-40 cursor-not-allowed text-foreground/30' :
          open ? 'bg-foreground/[0.09] text-foreground/70' : 'text-foreground/55 hover:bg-foreground/[0.08]'
        }`}
      >
        {showDesc && selected?.desc ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className={descFontSize}>{selected.desc}</span>
            <span className="truncate">{selected?.label || value}</span>
          </div>
        ) : (
          <span className="truncate">{selected?.label || value}</span>
        )}
        <ChevronDown size={chevronSize} className={`flex-shrink-0 text-foreground/25 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && !disabled && rect && createPortal(
        <div
          ref={portalRef}
          className={`fixed bg-popover border border-border/50 rounded-2xl shadow-2xl p-1.5 z-[9999] animate-in fade-in ${dropUp ? 'slide-in-from-bottom-1' : 'slide-in-from-top-1'} duration-100`}
          style={dropUp ? {
            bottom: window.innerHeight - rect.top + 4,
            left: rect.left,
            minWidth: Math.max(rect.width, dropMinW),
          } : {
            top: rect.bottom + 4,
            left: rect.left,
            minWidth: Math.max(rect.width, dropMinW),
          }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-[6px] rounded-xl ${btnText} transition-colors flex items-center justify-between gap-3 ${
                value === opt.value
                  ? 'bg-foreground/[0.06] text-foreground/75'
                  : 'text-foreground/55 hover:bg-foreground/[0.04]'
              }`}
            >
              {showDesc && opt.desc ? (
                <div className="flex items-center gap-2">
                  <span className={descFontSize}>{opt.desc}</span>
                  <span>{opt.label}</span>
                </div>
              ) : (
                <span>{opt.label}</span>
              )}
              {value === opt.value && <Check size={checkSize} className="text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ===========================
// Config Section
// ===========================
export function ConfigSection({ title, hint, children, actions, disabled }: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={`bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-3.5 py-3 space-y-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-foreground/70" style={{ fontWeight: 500 }}>{title}</p>
          {hint && <p className="text-[10px] text-foreground/30 mt-0.5">{hint}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

// ===========================
// Text Input
// ===========================
export function TextInput({ value, onChange, placeholder, type = 'text', mono, readOnly }: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center px-2.5 py-[5px] bg-foreground/[0.03] rounded-lg border border-border/30">
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`flex-1 bg-transparent text-[10px] text-foreground/60 outline-none placeholder:text-foreground/20 min-w-0 ${
          mono ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}

// ===========================
// Action Button
// ===========================
export function ActionButton({ children, variant = 'default', onClick }: {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  onClick?: () => void;
}) {
  const cls = {
    default: 'border border-border/30 text-foreground/50 hover:text-foreground/70 hover:bg-accent',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    danger: 'border border-red-500/20 text-red-500/60 hover:text-red-500/80 hover:bg-red-500/5',
  };
  return (
    <button onClick={onClick} className={`px-3 py-[5px] rounded-lg text-[10px] transition-colors ${cls[variant]}`}>
      {children}
    </button>
  );
}

// ===========================
// Panel Header
// ===========================
export function PanelHeader({ icon, title, desc, actions }: {
  icon: string;
  title: string;
  desc?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="text-[14px]">{icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] text-foreground/90" style={{ fontWeight: 500 }}>{title}</h3>
        {desc && <p className="text-[10px] text-foreground/35 mt-0.5">{desc}</p>}
      </div>
      {actions}
    </div>
  );
}
