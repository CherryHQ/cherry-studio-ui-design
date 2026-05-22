import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  Button, Dialog, DialogContent,
} from '@cherry-studio/ui';

interface RecycleBinConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Retained for API compatibility — no longer rendered. */
  retentionDays?: number;
  onConfirm: () => void;
}

/**
 * iOS-style centered alert for "move to recycle bin" confirmation.
 * Minimal: icon + title + two side-by-side buttons. The educational
 * "{N} 天内可在 设置 → 回收站 恢复" subtext was dropped — users know
 * what 回收站 is, and the generic phrasing keeps the dialog tiny.
 */
export function RecycleBinConfirmDialog({
  open, onOpenChange, onConfirm,
}: RecycleBinConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[260px] p-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center">
          <div className="rounded-[14px] bg-destructive/12 flex items-center justify-center mb-2.5" style={{ width: 44, height: 44 }}>
            <Trash2 size={20} className="text-destructive" />
          </div>
          <h3 className="text-[15px] font-medium text-foreground">
            确认移到回收站？
          </h3>
        </div>
        <div className="grid grid-cols-2 border-t border-border/30">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-none text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground border-r border-border/30"
          >
            取消
          </Button>
          <Button
            variant="ghost"
            onClick={handleConfirm}
            className="h-11 rounded-none text-sm text-destructive hover:bg-destructive/8 hover:text-destructive"
          >
            移到回收站
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
