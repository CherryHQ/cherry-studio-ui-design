import { useState } from 'react';

export type HistorySidebarMode = 'hidden' | 'compact' | 'expanded';

export function useHistorySidebar(defaultMode: HistorySidebarMode = 'compact') {
  const [mode, setMode] = useState<HistorySidebarMode>(defaultMode);

  return {
    mode,
    setMode,
    isVisible: mode !== 'hidden',
    isCompact: mode === 'compact',
    isExpanded: mode === 'expanded',
    toggle: () => setMode(m => m === 'hidden' ? 'compact' : 'hidden'),
    expand: () => setMode('expanded'),
    collapse: () => setMode('compact'),
    hide: () => setMode('hidden'),
  };
}
