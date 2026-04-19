import React from 'react';
import { Switch, Input, Button } from '@cherry-studio/ui';

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
    <Input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`h-7 text-xs ${mono ? 'font-mono' : ''}`}
    />
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
  const variantMap = {
    default: 'outline',
    primary: 'default',
    danger: 'destructive',
  } as const;
  return (
    <Button variant={variantMap[variant]} size="xs" onClick={onClick}>
      {children}
    </Button>
  );
}
