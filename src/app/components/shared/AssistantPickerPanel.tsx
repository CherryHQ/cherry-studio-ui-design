import React, { useCallback } from 'react';
import { AssistantPickerPanel as BaseAssistantPickerPanel } from '@cherry-studio/ui';
import type { AssistantPickerPanelProps as BaseAssistantPickerPanelProps } from '@cherry-studio/ui';
import { MOCK_ASSISTANTS, ASSISTANT_EMOJI_MAP } from '@/app/mock';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { usePinnedAssistants } from '@/app/hooks/usePinnedAssistants';

export type AssistantPickerPanelProps = Omit<BaseAssistantPickerPanelProps, 'assistants' | 'emojiMap' | 'pinnedIds' | 'onTogglePin'> & {
  assistants?: BaseAssistantPickerPanelProps['assistants'];
  emojiMap?: BaseAssistantPickerPanelProps['emojiMap'];
  pinnedIds?: BaseAssistantPickerPanelProps['pinnedIds'];
  onTogglePin?: BaseAssistantPickerPanelProps['onTogglePin'];
};

export function AssistantPickerPanel({
  assistants = MOCK_ASSISTANTS,
  emojiMap = ASSISTANT_EMOJI_MAP,
  onConfigureAssistant: onConfigureProp,
  pinnedIds: pinnedProp,
  onTogglePin: onTogglePinProp,
  ...props
}: AssistantPickerPanelProps) {
  const { editAssistantInLibrary } = useGlobalActions();
  const { pinnedIds: defaultPinned, togglePin: defaultTogglePin } = usePinnedAssistants();

  const defaultConfigure = useCallback((id: string) => {
    const assistant = assistants.find(a => a.id === id);
    if (assistant) {
      editAssistantInLibrary(assistant.name);
    }
  }, [editAssistantInLibrary, assistants]);

  return (
    <BaseAssistantPickerPanel
      assistants={assistants}
      emojiMap={emojiMap}
      onConfigureAssistant={onConfigureProp ?? defaultConfigure}
      pinnedIds={pinnedProp ?? defaultPinned}
      onTogglePin={onTogglePinProp ?? defaultTogglePin}
      {...props}
    />
  );
}
