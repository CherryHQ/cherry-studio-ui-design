import { useEffect, useState } from 'react';

// ============================================================
// Quick Provider Setup store
// ============================================================
// A tiny module-level store so any model picker across the app can open the
// single, app-root-mounted QuickProviderSetupDialog without prop drilling.
// Mirrors the sharedArtifactsStore pattern (module state + listeners + hook).

let open = false;
let onSaved: (() => void) | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

/**
 * Open the global provider-setup dialog. `onSaved` (if given) runs once when
 * the user successfully saves — used by the chat to flip its no-model state.
 */
export function openQuickProviderSetup(opts?: { onSaved?: () => void }): void {
  open = true;
  onSaved = opts?.onSaved ?? null;
  emit();
}

export function closeQuickProviderSetup(): void {
  open = false;
  onSaved = null;
  emit();
}

export function getQuickProviderSetupOnSaved(): (() => void) | null {
  return onSaved;
}

export function useQuickProviderSetupOpen(): boolean {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return open;
}
