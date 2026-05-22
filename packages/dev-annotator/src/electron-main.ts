/**
 * Optional Electron main-process helper.
 *
 * Wires up:
 *  - Filesystem-backed annotation storage (IPC handlers `loupe:load` / `loupe:save`)
 *  - `loupe:open-external` for opening URLs in the user's default browser
 *
 * Usage in your Electron `main.ts`:
 *
 * ```ts
 * import { app } from "electron"
 * import { registerLoupeMain } from "@loupe/dev-annotator/electron-main"
 *
 * app.whenReady().then(() => {
 *   registerLoupeMain({ filePath: path.join(app.getPath("userData"), "loupe.json") })
 *   // ... create your window ...
 * })
 * ```
 *
 * In your preload script:
 *
 * ```ts
 * import { contextBridge, ipcRenderer } from "electron"
 *
 * contextBridge.exposeInMainWorld("loupeBridge", {
 *   load: () => ipcRenderer.invoke("loupe:load"),
 *   save: (anns: unknown) => ipcRenderer.invoke("loupe:save", anns),
 *   openExternal: (url: string) => ipcRenderer.invoke("loupe:open-external", url),
 * })
 * ```
 *
 * In your renderer:
 *
 * ```ts
 * import { installAnnotator, createIpcAdapter } from "@loupe/dev-annotator"
 *
 * installAnnotator({
 *   storage: createIpcAdapter(window.loupeBridge),
 * })
 * ```
 */

import type { IpcMain } from "electron"

export interface LoupeMainOptions {
  /** Absolute path to JSON file used for persistence */
  filePath: string
  /** Channel name prefix (default: `loupe`) */
  channelPrefix?: string
}

export function registerLoupeMain(options: LoupeMainOptions): { unregister(): void } {
  // Use a dynamic require so this module stays importable in renderer-side
  // type-check passes (which don't have `electron` available). The actual
  // runtime call only happens in the main process.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const electron = require("electron") as { ipcMain: IpcMain; shell: { openExternal: (u: string) => Promise<void> } }
  const { ipcMain, shell } = electron
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("node:fs/promises") as typeof import("node:fs/promises")

  const prefix = options.channelPrefix ?? "loupe"
  const loadCh = `${prefix}:load`
  const saveCh = `${prefix}:save`
  const openCh = `${prefix}:open-external`

  const loadHandler = async () => {
    try {
      const buf = await fs.readFile(options.filePath, "utf8")
      return JSON.parse(buf)
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return []
      throw err
    }
  }

  const saveHandler = async (_e: unknown, annotations: unknown) => {
    await fs.writeFile(options.filePath, JSON.stringify(annotations, null, 2), "utf8")
  }

  const openHandler = async (_e: unknown, url: unknown) => {
    if (typeof url !== "string") return
    if (!/^https?:\/\//i.test(url)) return // safety: only allow http(s)
    await shell.openExternal(url)
  }

  ipcMain.handle(loadCh, loadHandler)
  ipcMain.handle(saveCh, saveHandler)
  ipcMain.handle(openCh, openHandler)

  return {
    unregister() {
      ipcMain.removeHandler(loadCh)
      ipcMain.removeHandler(saveCh)
      ipcMain.removeHandler(openCh)
    },
  }
}
