import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
  Button, Input,
} from '@cherry-studio/ui';

/**
 * 桌面端工具型单输入弹窗（重命名 / 新建），Codex / macOS sheet 的紧凑密度。
 *
 * 组件库 Dialog 的默认件（24px DialogTitle、p-6、h-10 按钮、右上角 X）是
 * 展示级 modal 的尺度，用在这种"打个名字"的工具弹窗上会显得粗大——这里
 * 统一压到桌面规范：320px 宽 / 16px 内边距 / 标题 14px medium / 描述 12px /
 * 输入 32px / 按钮 28px；不放 X（有取消 + Esc，X 是长内容 modal 的习惯）。
 *
 * 所有「标题 + 一个输入框 + 取消/确认」的弹窗都应该用它，不要手写。
 */
export function InputDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  initialValue = '',
  confirmLabel = '保存',
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { if (open) setValue(initialValue); }, [open, initialValue]);

  const commit = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[320px] gap-0 rounded-2xl p-4">
        <DialogTitle className="text-sm font-medium">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="mt-1 text-xs text-muted-foreground/70">{description}</DialogDescription>
        ) : (
          // 无描述时也给标题一个可访问性描述占位，避免 Radix 告警。
          <DialogDescription className="sr-only">{title}</DialogDescription>
        )}
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          onFocus={(e) => e.target.select()}
          className="mt-3 h-8 rounded-[8px] border px-2.5 text-[13px]"
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="xs" className="h-7 px-3 text-xs" onClick={() => onOpenChange(false)}>取消</Button>
          <Button size="xs" className="h-7 px-3 text-xs" onClick={commit} disabled={!value.trim()}>{confirmLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
