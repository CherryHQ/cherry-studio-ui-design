import React from 'react';
import { Input, Button, cn } from '@cherry-studio/ui';

// ===========================
// Re-export from component library
// ===========================
export {
  FormRow,
  SectionHeader,
  ConfigSection,
  PanelHeader,
  InlineSelect,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@cherry-studio/ui';

// ===========================
// SectionCard — simple container (no title)
// ===========================
// Package has ConfigSection (with title), this is the untitled variant.
export function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'bg-muted/50 border border-border rounded-[var(--radius-button)] px-3.5 py-1 tracking-[-0.14px]',
      className
    )}>
      {children}
    </div>
  );
}

// ===========================
// TextInput — wraps Input with mono font support
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
    <Input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={cn('h-7 text-xs', mono && 'font-mono')}
    />
  );
}

// ===========================
// ActionButton — wraps Button with variant mapping
// ===========================
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

