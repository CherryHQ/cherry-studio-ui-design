import React from 'react';
import { Switch } from '@cherry-studio/ui';

// ===========================
// Re-export from component library
// ===========================
export {
  FormRow,
  SectionHeader,
  ConfigSection,
  PanelHeader,
  InlineSelect,
} from '@cherry-studio/ui';

// ===========================
// Toggle — now wraps Shadcn Switch
// ===========================
// Preserves Cherry's onChange(boolean) API for backward compatibility.
// All 14 consumer files work without changes.
export function Toggle({ checked, onChange, disabled }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
}

// ===========================
// Text Input (local shim)
// ===========================
// TODO: Replace with <Input className="font-mono text-xs"> from @cherry-studio/ui
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
// Action Button (local shim)
// ===========================
// TODO: Replace with <Button variant="..." size="sm"> from @cherry-studio/ui
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
