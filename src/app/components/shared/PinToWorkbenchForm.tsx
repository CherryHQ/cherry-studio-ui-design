import { useState } from 'react';
import {
  Button, Input,
  Popover, PopoverContent, PopoverTrigger,
} from '@cherry-studio/ui';
import { ARTIFACT_ICON_MAP, ARTIFACT_ICON_NAMES, resolveArtifactIcon } from '@/app/utils/artifactIcons';

// Compact inline form used by:
//   - ArtifactViewer's "添加至工作台" — first-time pin
//   - LaunchpadPage's "编辑" — change name / icon of an already-pinned tile
//
// Layout: one row of [icon picker trigger] + [name input], with
// 取消 / 确定 buttons below. The icon picker is itself a small nested
// Popover so the host popover stays tight (~300px wide).
//
// Behaviour:
// - Enter on the input confirms.
// - Esc cancels.
// - The icon trigger picker closes itself on selection.
export interface PinToWorkbenchFormProps {
  /** Heading shown above the form (e.g. "添加至工作台" / "编辑名称与图标"). */
  title: string;
  name: string;
  iconName: string;
  onNameChange: (v: string) => void;
  onIconChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  /** Label for the primary action button — defaults to "添加". */
  confirmLabel?: string;
}

export function PinToWorkbenchForm({
  title, name, iconName, onNameChange, onIconChange,
  onConfirm, onCancel, confirmLabel = '添加',
}: PinToWorkbenchFormProps) {
  const SelectedIcon = resolveArtifactIcon(iconName);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  return (
    <div className="space-y-2.5">
      <div className="text-[11px] text-muted-foreground/70">{title}</div>
      <div className="flex items-center gap-2">
        <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="选择图标"
              className="w-9 h-9 rounded-lg bg-accent-violet/15 text-accent-violet flex items-center justify-center hover:bg-accent-violet/20 transition-colors flex-shrink-0"
            >
              <SelectedIcon size={16} strokeWidth={1.6} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" sideOffset={4} className="w-[228px] p-2">
            <div className="grid grid-cols-6 gap-1">
              {ARTIFACT_ICON_NAMES.map((n) => {
                const Icon = ARTIFACT_ICON_MAP[n];
                const isSelected = n === iconName;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { onIconChange(n); setIconPickerOpen(false); }}
                    title={n}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors
                      ${isSelected
                        ? 'bg-accent-violet/15 text-accent-violet ring-1 ring-accent-violet/40'
                        : 'text-muted-foreground/70 hover:text-foreground hover:bg-accent/40'}`}
                  >
                    <Icon size={14} strokeWidth={1.6} />
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="应用名称"
          className="h-9 text-sm flex-1 min-w-0"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onConfirm(); }
            if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
          }}
        />
      </div>
      <div className="flex items-center justify-end gap-1.5">
        <Button variant="ghost" size="xs" onClick={onCancel} className="h-7 px-2.5 text-xs">
          取消
        </Button>
        <Button variant="default" size="xs" onClick={onConfirm} className="h-7 px-3 text-xs">
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
