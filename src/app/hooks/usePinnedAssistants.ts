import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cherry-pinned-assistants';

function loadPinned(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePinned(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function usePinnedAssistants() {
  const [pinnedIds, setPinnedIds] = useState<string[]>(loadPinned);

  const togglePin = useCallback((id: string) => {
    setPinnedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      savePinned(next);
      return next;
    });
  }, []);

  return { pinnedIds, togglePin };
}
