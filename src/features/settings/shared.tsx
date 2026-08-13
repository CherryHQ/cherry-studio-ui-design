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
// contentColumn — 右侧内容列的宽度约束
// ===========================
// 对齐现网 DESIGN.md 的「Right-detail content container」强制项：
// 外层负责边距和滚动，内容本身 768px（max-w-3xl）封顶并居中。
// 设置从弹窗改成整页后窗口可以拉得很宽，没有这层约束的话一行设置项
// 会被拉成横跨全屏的长条，label 和右侧控件离得太远。
//
// 用 child selector 而不是再包一层 div：直接加在滚动容器的 className 上，
// 每个直接子块自己居中 + 封顶，行为和现网的两层结构一致。
export const contentColumn = '[&>*]:mx-auto [&>*]:w-full [&>*]:max-w-3xl';

// 容器自己就是 flex 行（比如标题 + 右侧开关的头部）时不能用 contentColumn ——
// 那会把每个 flex 子项各撑到 768。这类地方保留外层 padding，
// 在里面手写一层用这个 token 的 div。
export const contentColumnInner = 'mx-auto w-full max-w-3xl';

// ===========================
// SectionCard — simple container (no title)
// ===========================
// Package has ConfigSection (with title), this is the untitled variant.
export function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'border border-section-border rounded-[var(--radius-button)] px-3.5 py-1 tracking-[-0.14px]',
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

