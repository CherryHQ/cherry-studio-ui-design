# @loupe/dev-annotator

Drop-in UI annotation tool for **any Electron renderer or web page**. Same engine as the [Loupe browser extension](../extension), packaged as a one-line install for app developers.

> Click any element → describe the issue → copy an AI-ready fix prompt. No accounts, no servers, all data stays local.

---

## Install

```bash
pnpm add @loupe/dev-annotator
# or: npm i @loupe/dev-annotator
# or: yarn add @loupe/dev-annotator
```

Peer deps (must already be present in your app):
- `react >= 18`
- `react-dom >= 18`

Everything else (Radix primitives, lucide icons, html-to-image, theme CSS) is **bundled into the package** — fully standalone, no other peer deps required.

---

## Quick start

### Vanilla / any renderer

```ts
import { installAnnotator } from "@loupe/dev-annotator"
import "@loupe/dev-annotator/styles.css?inline" // or load styles however your bundler prefers

if (process.env.NODE_ENV === "development") {
  installAnnotator({ appName: "My App" })
}
```

### Electron — renderer side

```ts
// renderer.ts (in your Electron renderer process)
import { installAnnotator, createIpcAdapter } from "@loupe/dev-annotator"
import cssText from "@loupe/dev-annotator/styles.css?raw"

installAnnotator({
  appName: "My Electron App",
  cssText,
  // Persist via main-process JSON file (set up below)
  storage: createIpcAdapter(window.loupeBridge),
})
```

### Electron — main process

```ts
// main.ts
import { app } from "electron"
import path from "node:path"
import { registerLoupeMain } from "@loupe/dev-annotator/electron-main"

app.whenReady().then(() => {
  registerLoupeMain({
    filePath: path.join(app.getPath("userData"), "loupe-annotations.json"),
  })
  // ... create your BrowserWindow ...
})
```

### Electron — preload

```ts
// preload.ts
import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("loupeBridge", {
  load: () => ipcRenderer.invoke("loupe:load"),
  save: (annotations: unknown) => ipcRenderer.invoke("loupe:save", annotations),
  openExternal: (url: string) => ipcRenderer.invoke("loupe:open-external", url),
})
```

That's it. Your annotations now persist to a JSON file in the user's app data folder, and the standard "File Issue" / "Open URL" actions can use the system browser.

---

## What it does

| | |
|---|---|
| 💬 Click → annotate | Hover any element to highlight (scroll wheel to pick parent / child level), click to add a structured comment with category + preset templates |
| 📋 AI Prompt | Each annotation auto-generates a markdown prompt with selector, computed styles, screenshot, breadcrumb — paste into Claude / GPT / Cursor |
| 📸 Auto screenshot | Each annotation captures a PNG of the target element (skipped via `captureScreenshots: false`) |
| ⚖️ Style diff | View an annotation later: it compares saved CSS vs. current CSS, highlights changed values |
| 🌳 React fiber | If your app is React, source hints include component name + file:line (dev builds) |
| 🌐 i18n | English / 简体中文 / 日本語 (toggle via popup or pass `locale` via custom UI) |
| 🌗 Light / dark | Follows host page `<html class="dark">` or system `prefers-color-scheme` |

---

## Keyboard shortcuts

| | |
|---|---|
| `⌘⇧X` / `Ctrl+Shift+X` | Toggle annotation mode |
| `⌘⇧F` | Copy AI Prompt for current page |
| `⌘⇧E` | Export JSON |
| `⌘⇧D` | Clear all annotations |
| `⌘Enter` | Save annotation |
| `Esc` | Close bubble |
| Mouse wheel (in annotation mode) | Up = parent element, Down = child element |

---

## API

### `installAnnotator(options?)`

Mounts the annotator into the current document. Returns a handle:

```ts
const annotator = installAnnotator({ appName: "My App" })
// later …
annotator.destroy()
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `appName` | `string` | `document.title` | Identifier shown in exports |
| `page` | `string` | pathname | SPA route id |
| `storage` | `StorageAdapter` | localStorage | Custom persistence backend |
| `storageKey` | `string` | `"loupe:annotations"` | Key when using default storage |
| `captureScreenshots` | `boolean` | `true` | Auto-capture element screenshots |
| `bubbleActions` | `BubbleAction[]` | `[]` | Extra buttons in bubble view mode |
| `getSourceHint` | `(el) => string` | React fiber → pathname | Override sourceHint generator |
| `cssText` | `string` | bundled CSS | Inject your own styles |
| `hostId` | `string` | `"loupe-annotator-host"` | Host element id (for teardown) |

### `createLocalStorageAdapter({ key? })`

Default storage. Per-key in localStorage. Subscribes to cross-window `storage` events for live sync.

### `createIpcAdapter(bridge)`

Custom storage that delegates load / save / watch to a user-provided bridge — typically exposed by an Electron preload script.

### `BubbleAction`

```ts
interface BubbleAction {
  id: string
  component: React.ComponentType<{
    annotation: Annotation
    onClose: () => void
  }>
}
```

Use to add custom buttons in the bubble's view mode (e.g. "File issue", "Open in Linear", "Run AI fix"). The action receives the annotation and a close callback.

---

## How it isolates

- All UI lives inside a **shadow DOM** mounted at `<html>` level — host page CSS doesn't leak in, our Tailwind doesn't leak out.
- Tailwind v4 `@source` directive picks up annotation component classes at build time (you don't need to scan your own files).
- `position: fixed` host element with `z-index: 2147483647` — wins over almost any host UI.
- Pin handle anchored to `<html>` (not `<body>`) to bypass `transform: ...` ancestors that break fixed positioning on some sites.

---

## Build it yourself

```bash
pnpm install
pnpm --filter @loupe/dev-annotator build
```

Outputs `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/styles.css`, plus `electron-main` variants for the Electron-specific helpers.

---

## License

MIT
