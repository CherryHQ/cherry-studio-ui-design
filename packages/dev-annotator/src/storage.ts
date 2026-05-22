import type { Annotation } from "./internal/annotations"

/**
 * Storage adapter for the dev-annotator.
 *
 * Default implementation uses `localStorage` (works in any renderer — Electron,
 * browser, etc). Apps that want filesystem-backed persistence can pass a
 * custom adapter (e.g. one that talks to Electron main via IPC).
 */
export interface StorageAdapter {
  load(): Promise<Annotation[]>
  save(annotations: Annotation[]): Promise<void>
  /** Optional: subscribe to changes from other windows / processes. */
  subscribe?(callback: (annotations: Annotation[]) => void): () => void
}

export interface CreateStorageOptions {
  /** localStorage key (when using the default adapter) */
  key?: string
}

/** Default adapter — localStorage in current renderer. */
export function createLocalStorageAdapter(opts: CreateStorageOptions = {}): StorageAdapter {
  const key = opts.key ?? "loupe:annotations"

  return {
    async load() {
      try {
        const raw = localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as Annotation[]) : []
      } catch {
        return []
      }
    },
    async save(annotations) {
      try {
        localStorage.setItem(key, JSON.stringify(annotations))
      } catch (err) {
        console.warn("[loupe] localStorage save failed (likely quota):", err)
      }
    },
    subscribe(callback) {
      // Sync between windows of the same renderer via the storage event.
      const handler = (e: StorageEvent) => {
        if (e.key !== key) return
        try {
          callback(e.newValue ? (JSON.parse(e.newValue) as Annotation[]) : [])
        } catch {
          /* malformed payload — ignore */
        }
      }
      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    },
  }
}

/**
 * Adapter that delegates to a user-provided IPC bridge — typical Electron
 * setup where the main process owns a JSON file on disk.
 *
 * The bridge is exposed in renderer via `contextBridge.exposeInMainWorld`
 * (in your preload.ts), e.g.:
 *
 *   contextBridge.exposeInMainWorld('loupeBridge', {
 *     load:  () => ipcRenderer.invoke('loupe:load'),
 *     save:  (anns) => ipcRenderer.invoke('loupe:save', anns),
 *     watch: (cb) => { ipcRenderer.on('loupe:changed', (_, a) => cb(a)); ... },
 *   })
 */
export function createIpcAdapter(bridge: {
  load: () => Promise<Annotation[]>
  save: (annotations: Annotation[]) => Promise<void>
  watch?: (callback: (annotations: Annotation[]) => void) => () => void
}): StorageAdapter {
  return {
    load: bridge.load,
    save: bridge.save,
    subscribe: bridge.watch,
  }
}
