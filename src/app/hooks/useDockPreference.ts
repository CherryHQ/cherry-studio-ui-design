import { useCallback, useState } from 'react';

// Remembers whether a side-dock panel (话题 / 会话 list) was left open, keyed
// per page. The list stays docked across visits until the user actively closes
// it; once closed, it stays closed next time the page is opened.

function load(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function save(key: string, open: boolean) {
  try {
    localStorage.setItem(key, open ? '1' : '0');
  } catch {
    // ignore
  }
}

export function useDockPreference(storageKey: string) {
  const [open, setOpenState] = useState<boolean>(() => load(storageKey));

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    save(storageKey, next);
  }, [storageKey]);

  return [open, setOpen] as const;
}
