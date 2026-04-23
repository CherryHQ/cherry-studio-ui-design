import React, { useCallback } from 'react';
import { ModelPickerPanel as BaseModelPickerPanel } from '@cherry-studio/ui';
import type { ModelPickerPanelProps as BaseModelPickerPanelProps } from '@cherry-studio/ui';
import { ASSISTANT_MODELS, PROVIDER_COLORS } from '@/app/config/models';
import { usePinnedModels } from '@/app/hooks/usePinnedModels';
import { useGlobalActions } from '@/app/context/GlobalActionContext';

export type ModelPickerPanelProps = Omit<BaseModelPickerPanelProps, 'models' | 'providerColors' | 'pinnedModelIds' | 'onTogglePin' | 'onManageProvider'> & {
  models?: BaseModelPickerPanelProps['models'];
  providerColors?: BaseModelPickerPanelProps['providerColors'];
  pinnedModelIds?: BaseModelPickerPanelProps['pinnedModelIds'];
  onTogglePin?: BaseModelPickerPanelProps['onTogglePin'];
  onManageProvider?: BaseModelPickerPanelProps['onManageProvider'];
};

export function ModelPickerPanel({
  models = ASSISTANT_MODELS,
  providerColors = PROVIDER_COLORS,
  pinnedModelIds: pinnedProp,
  onTogglePin: onTogglePinProp,
  onManageProvider: onManageProviderProp,
  ...props
}: ModelPickerPanelProps) {
  const { pinnedModelIds: defaultPinned, togglePin: defaultTogglePin } = usePinnedModels();
  const { openSettings } = useGlobalActions();

  const defaultManageProvider = useCallback(() => {
    openSettings('models');
  }, [openSettings]);

  return (
    <BaseModelPickerPanel
      models={models}
      providerColors={providerColors}
      pinnedModelIds={pinnedProp ?? defaultPinned}
      onTogglePin={onTogglePinProp ?? defaultTogglePin}
      onManageProvider={onManageProviderProp ?? defaultManageProvider}
      {...props}
    />
  );
}
