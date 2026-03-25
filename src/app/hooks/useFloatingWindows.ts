import { useState, useCallback } from 'react';
import type { Tab, DetachedWindow } from '@/app/types';

// ===========================
// useFloatingWindows Hook
// ===========================
// Manages detached floating windows (tabs dragged out of the tab bar).

export interface UseFloatingWindowsReturn {
  detachedWindows: DetachedWindow[];
  handleDetachTab: (tabId: string, x: number, y: number, tabs: Tab[], onRemoveTab: (remaining: Tab[]) => void) => void;
  handleReattach: (win: DetachedWindow) => Tab;
  handleCloseWindow: (id: string) => void;
}

export function useFloatingWindows(): UseFloatingWindowsReturn {
  const [detachedWindows, setDetachedWindows] = useState<DetachedWindow[]>([]);

  const handleDetachTab = useCallback((
    tabId: string,
    x: number,
    y: number,
    tabs: Tab[],
    onRemoveTab: (remaining: Tab[]) => void,
  ) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !tab.closeable) return;
    setDetachedWindows(prev => [
      ...prev,
      { id: `w-${tabId}`, tab, x, y, width: 480, height: 360 },
    ]);
    const remaining = tabs.filter(t => t.id !== tabId);
    onRemoveTab(remaining);
  }, []);

  const handleReattach = useCallback((win: DetachedWindow): Tab => {
    setDetachedWindows(prev => prev.filter(w => w.id !== win.id));
    return { ...win.tab, id: `t${Date.now()}` };
  }, []);

  const handleCloseWindow = useCallback((id: string) => {
    setDetachedWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  return {
    detachedWindows,
    handleDetachTab,
    handleReattach,
    handleCloseWindow,
  };
}
