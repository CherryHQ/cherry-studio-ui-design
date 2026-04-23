import React from 'react';
import { AtMentionPicker as BaseAtMentionPicker } from '@cherry-studio/ui';
import { ASSISTANT_MODELS, PROVIDER_COLORS } from '@/app/config/models';
import { MOCK_ASSISTANTS, ASSISTANT_EMOJI_MAP } from '@/app/mock';

interface AtMentionPickerProps {
  selectedAssistants: string[];
  selectedModels: string[];
  onSelectAssistant: (id: string) => void;
  onSelectModel: (id: string) => void;
  multiAssistant: boolean;
  multiModel: boolean;
  onToggleMultiAssistant: () => void;
  onToggleMultiModel: () => void;
  onCreateAssistant?: () => void;
  onClose: () => void;
}

export function AtMentionPicker({
  selectedAssistants,
  selectedModels,
  onSelectAssistant,
  onSelectModel,
  multiAssistant,
  multiModel,
  onToggleMultiAssistant,
  onToggleMultiModel,
  onCreateAssistant,
  onClose,
}: AtMentionPickerProps) {
  return (
    <BaseAtMentionPicker
      assistantPickerProps={{
        assistants: MOCK_ASSISTANTS,
        selectedAssistants,
        onSelectAssistant,
        multiAssistant,
        onToggleMultiAssistant,
        onCreateAssistant,
        emojiMap: ASSISTANT_EMOJI_MAP,
      }}
      modelPickerProps={{
        models: ASSISTANT_MODELS,
        selectedModels,
        onSelectModel,
        multiModel,
        onToggleMultiModel,
        providerColors: PROVIDER_COLORS,
      }}
      onClose={onClose}
    />
  );
}
