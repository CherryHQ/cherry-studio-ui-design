import React, { useCallback } from 'react';
import { Plus } from 'lucide-react';
import { ModelPickerPanel as BaseModelPickerPanel } from '@cherry-studio/ui';
import type { ModelPickerPanelProps as BaseModelPickerPanelProps } from '@cherry-studio/ui';
import { ASSISTANT_MODELS, PROVIDER_COLORS } from '@/app/config/models';
import { usePinnedModels } from '@/app/hooks/usePinnedModels';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { openQuickProviderSetup } from '@/features/chat/QuickProviderSetup/quickProviderSetupStore';

export type ModelPickerPanelProps = Omit<BaseModelPickerPanelProps, 'models' | 'providerColors' | 'pinnedModelIds' | 'onTogglePin' | 'onManageProvider'> & {
  models?: BaseModelPickerPanelProps['models'];
  providerColors?: BaseModelPickerPanelProps['providerColors'];
  pinnedModelIds?: BaseModelPickerPanelProps['pinnedModelIds'];
  onTogglePin?: BaseModelPickerPanelProps['onTogglePin'];
  onManageProvider?: BaseModelPickerPanelProps['onManageProvider'];
  /**
   * Footer action to connect a new provider. Defaults to opening the global
   * QuickProviderSetupDialog (closing the surrounding popover first). Pass
   * `null` to hide the footer entirely.
   */
  onConnectProvider?: (() => void) | null;
};

export function ModelPickerPanel({
  models = ASSISTANT_MODELS,
  providerColors = PROVIDER_COLORS,
  pinnedModelIds: pinnedProp,
  onTogglePin: onTogglePinProp,
  onManageProvider: onManageProviderProp,
  onConnectProvider,
  onClose,
  ...props
}: ModelPickerPanelProps) {
  const { pinnedModelIds: defaultPinned, togglePin: defaultTogglePin } = usePinnedModels();
  const { openSettings } = useGlobalActions();

  const defaultManageProvider = useCallback(() => {
    openSettings('models');
  }, [openSettings]);

  // Default: close the surrounding popover, then open the global dialog.
  const handleConnect =
    onConnectProvider === undefined
      ? () => {
          onClose?.();
          openQuickProviderSetup();
        }
      : onConnectProvider;

  const panel = (
    <BaseModelPickerPanel
      models={models}
      providerColors={providerColors}
      pinnedModelIds={pinnedProp ?? defaultPinned}
      onTogglePin={onTogglePinProp ?? defaultTogglePin}
      onManageProvider={onManageProviderProp ?? defaultManageProvider}
      onClose={onClose}
      {...props}
    />
  );

  if (!handleConnect) return panel;

  return (
    <div className="flex flex-col">
      {panel}
      <div className="border-t border-border/30 p-1.5">
        <button
          type="button"
          onClick={handleConnect}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-foreground/80 hover:bg-accent/30 transition-colors"
        >
          <span className="w-5 h-5 rounded-md bg-accent/40 flex items-center justify-center flex-shrink-0">
            <Plus size={13} className="text-primary/70" />
          </span>
          <span>连接服务商 / 添加模型</span>
        </button>
      </div>
    </div>
  );
}
