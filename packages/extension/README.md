# Loupe — Inspect, annotate, and fix any web UI with AI

Designer-grade UI inspection meets AI workflow. Click any element on any page → describe the issue → get an AI-ready fix prompt. All local, privacy-first, BYO API key.

## What it does

- Click any element on any web page → add a structured annotation
- Captures CSS selector, computed styles, React component breadcrumb, and a screenshot
- Exports per-annotation or batch AI prompts directly usable with Claude / GPT
- Persists annotations per-origin in `chrome.storage.local`
- Cross-tab sync: open the same site in two tabs, annotations stay in sync
- Cross-site dashboard via the toolbar popup
- Optional: one-click GitHub Issue / Linear ticket creation
- Optional: built-in AI fix suggestions (BYO API key)

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘⇧X` / `Ctrl+Shift+X` | Toggle annotation mode |
| `⌘⇧F` | Copy AI Prompt for all annotations on current page |
| `⌘⇧E` | Export JSON |
| `⌘⇧D` | Clear all annotations on current page |
| `Esc` | Close current bubble |
| `⌘Enter` | Save annotation |
| Mouse wheel | (in annotation mode) Scroll up to select parent element, scroll down for child |

## Development

```bash
# from repo root
pnpm install

# inside packages/extension
pnpm dev
```

This starts the Vite dev server. To load the unpacked extension:

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" → select `packages/extension/dist`
4. Reload after first build

`pnpm build` produces a production bundle in `dist/`. `pnpm package` zips it for Chrome Web Store upload.

## Architecture

```
content script (every https page)
  └── shadow root container
        └── React app
              ├── AnnotationProvider  (state, context)
              ├── StoragePersistence  (chrome.storage bridge)
              ├── ScreenshotCapture   (auto-snapshot new annotations)
              ├── CommandBridge       (handle global hotkey from background)
              ├── AnnotationOverlay   (click capture, marker dots)
              ├── AnnotationToggle    (FAB button)
              └── AnnotationList      (in-page list panel)

popup (toolbar click)
  └── React app
        ├── Sites tab        → cross-origin annotation dashboard
        └── Settings tab     → AI provider, GitHub PAT, capture options

background service worker
  └── chrome.commands → forward to active tab
```

## Privacy

- No remote analytics, no telemetry, no servers
- API keys stored in `chrome.storage.local` (per-browser-profile, not synced)
- AI / Issue tracker calls go directly to your configured provider
- Annotations never leave your browser unless you explicitly export or file an issue
