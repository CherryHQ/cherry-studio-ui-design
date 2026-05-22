import { defineManifest } from "@crxjs/vite-plugin"
import pkg from "../package.json"

export default defineManifest({
  manifest_version: 3,
  name: "Loupe — Inspect, annotate, and fix any web UI with AI",
  description:
    "Click any element on any page → describe the issue → get an AI-ready fix prompt. Designer-grade UI inspection meets AI workflow. Privacy-first, all local.",
  version: pkg.version,
  icons: {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
  action: {
    default_popup: "src/popup/index.html",
    default_icon: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
    },
    default_title: "Loupe — inspect & annotate this page (⌘⇧X)",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/index.tsx"],
      run_at: "document_idle",
      all_frames: false,
    },
  ],
  permissions: ["storage", "activeTab", "scripting"],
  host_permissions: ["<all_urls>"],
  web_accessible_resources: [
    {
      resources: ["assets/*", "icons/*", "src/welcome/*"],
      matches: ["<all_urls>"],
    },
  ],
  commands: {
    "toggle-annotation-mode": {
      suggested_key: {
        default: "Ctrl+Shift+X",
        mac: "Command+Shift+X",
      },
      description: "Toggle annotation mode",
    },
  },
})
