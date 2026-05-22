import React, { useState } from 'react';
import { Trash2, Settings as SettingsIcon, CalendarClock } from 'lucide-react';
import {
  Button, Dialog, DialogContent, Checkbox,
} from '@cherry-studio/ui';

interface RecycleBinConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemIcon?: string;
  /** Sub-label like "话题" / "自定义助手" */
  itemTypeLabel: string;
  /** Days the item will stay in the bin before auto-purge. */
  retentionDays: number;
  /**
   * If true, shows a "不再提醒" checkbox. Use for low-value high-frequency
   * resources (topics). Omit for high-value ones (custom assistants/Agent/Skill).
   */
  allowSkip?: boolean;
  /**
   * Cascade scope: when deleting a parent (assistant / agent), surface how
   * many child topics / sessions will follow it into the bin. PRD requires
   * the dialog to display this so the user understands the blast radius.
   */
  childCount?: number;
  /** "子话题" for assistant→topic, "子会话" for agent→session, etc. */
  childTypeLabel?: string;
  onConfirm: (skipNextTime: boolean) => void;
}

export function RecycleBinConfirmDialog({
  open, onOpenChange, itemName, itemIcon, itemTypeLabel,
  retentionDays, allowSkip = false,
  childCount = 0, childTypeLabel,
  onConfirm,
}: RecycleBinConfirmDialogProps) {
  const hasChildren = childCount > 0 && !!childTypeLabel;
  const [skip, setSkip] = useState(false);

  const handleConfirm = () => {
    onConfirm(skip);
    setSkip(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSkip(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[380px] p-5" showCloseButton={false}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-destructive" />
          </div>
          <div>
            <h3 className="text-sm text-foreground">移到回收站？</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasChildren
                ? <>{itemTypeLabel}及其 <span className="text-foreground/85 tabular-nums">{childCount}</span> 个{childTypeLabel}将一起移到回收站，可随时恢复</>
                : <>{itemTypeLabel}将被移到回收站，可随时恢复</>
              }
            </p>
          </div>
        </div>

        {/* Target item card */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/40 mb-3">
          {itemIcon && <span className="text-sm flex-shrink-0">{itemIcon}</span>}
          <span className="text-xs text-foreground truncate">{itemName}</span>
          {hasChildren && (
            <span className="ml-auto text-[10px] px-1.5 py-px rounded bg-accent/60 text-foreground/75 flex-shrink-0">
              含 {childCount} 个{childTypeLabel}
            </span>
          )}
        </div>


        {/* Educational info */}
        <div className="space-y-1.5 mb-4 px-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SettingsIcon size={12} className="text-muted-foreground/70 flex-shrink-0" />
            <span>可在 <span className="text-foreground/80">设置 → 回收站</span> 找到并恢复</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock size={12} className="text-muted-foreground/70 flex-shrink-0" />
            <span><span className="text-foreground/80">{retentionDays} 天</span>后将自动永久删除</span>
          </div>
        </div>

        {/* Skip next time */}
        {allowSkip && (
          <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
            <Checkbox checked={skip} onCheckedChange={(v) => setSkip(v === true)} />
            <span className="text-xs text-muted-foreground">不再提醒（之后通过底部撤销提示删除）</span>
          </label>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="px-3 rounded-lg text-xs text-muted-foreground hover:bg-accent">
            取消
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm} className="px-3 rounded-lg text-xs">
            移到回收站
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
