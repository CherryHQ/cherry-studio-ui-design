import { createRoot, type Root } from "react-dom/client"
import { AnnotatorApp } from "./App"
import { createLocalStorageAdapter, type StorageAdapter } from "./storage"
import type { BubbleAction } from "./internal/annotations"

export interface InstallAnnotatorOptions {
  /** Identifier for app — shown in export JSON. Defaults to document.title. */
  appName?: string
  /** Page identifier (e.g. SPA route). Default: pathname. */
  page?: string
  /** Storage backend. Defaults to localStorage. */
  storage?: StorageAdapter
  /** localStorage key (when using default storage). */
  storageKey?: string
  /** Whether to auto-capture screenshots (default: true). */
  captureScreenshots?: boolean
  /**
   * Custom action buttons in the annotation bubble's view mode (e.g. "File Issue").
   * Each action receives the annotation and a close callback as props.
   */
  bubbleActions?: BubbleAction[]
  /** Override sourceHint generation. */
  getSourceHint?: (el: HTMLElement) => string
  /** CSS string injected into the shadow root (default: bundled `styles.css`). */
  cssText?: string
  /** Mount point id (default: `loupe-annotator-host`). */
  hostId?: string
}

export interface InstalledAnnotator {
  /** Tear down the annotator: unmounts React, removes the host element. */
  destroy(): void
  /** The mount host element (for advanced use — manual style overrides etc). */
  host: HTMLElement
}

const DEFAULT_HOST_ID = "loupe-annotator-host"

/**
 * Mount the annotation tool into the current renderer.
 *
 * Returns a handle for teardown. Idempotent — calling twice is a no-op.
 *
 * @example
 * ```ts
 * import { installAnnotator } from "@loupe/dev-annotator"
 * import "@loupe/dev-annotator/styles.css?raw"
 *
 * if (process.env.NODE_ENV === "development") {
 *   installAnnotator({ appName: "My App" })
 * }
 * ```
 */
export function installAnnotator(options: InstallAnnotatorOptions = {}): InstalledAnnotator {
  const hostId = options.hostId ?? DEFAULT_HOST_ID
  const existing = document.getElementById(hostId)
  if (existing) {
    return {
      host: existing,
      destroy: () => existing.remove(),
    }
  }

  const host = document.createElement("div")
  host.id = hostId
  host.setAttribute("data-annotation-ui", "")
  host.setAttribute("aria-live", "assertive")
  host.style.cssText =
    "all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;"
  document.documentElement.appendChild(host)

  const shadow = host.attachShadow({ mode: "open" })

  // Inject CSS. Caller can pass `cssText` to override; the package's bundled
  // styles.css works for most setups (just import it as a side-effect or
  // pre-load and pass the text).
  const styleEl = document.createElement("style")
  styleEl.textContent = (options.cssText ?? "").replace(
    /:root(\s*)\{/g,
    ":host, :root$1{",
  )
  shadow.appendChild(styleEl)

  const reactRoot = document.createElement("div")
  reactRoot.id = "loupe-root"
  shadow.appendChild(reactRoot)

  // Color scheme: follow host page <html class="dark"> or system preference.
  const applyColorScheme = () => {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark" ||
      matchMedia("(prefers-color-scheme: dark)").matches
    reactRoot.classList.toggle("dark", isDark)
  }
  applyColorScheme()
  const mq = matchMedia("(prefers-color-scheme: dark)")
  mq.addEventListener("change", applyColorScheme)
  const themeObserver = new MutationObserver(applyColorScheme)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  })

  const storage = options.storage ?? createLocalStorageAdapter({ key: options.storageKey })

  let root: Root | null = createRoot(reactRoot)
  root.render(
    <AnnotatorApp
      shadowRoot={shadow}
      storage={storage}
      appName={options.appName}
      page={options.page}
      captureScreenshots={options.captureScreenshots}
      bubbleActions={options.bubbleActions}
      getSourceHint={options.getSourceHint}
    />,
  )

  return {
    host,
    destroy() {
      mq.removeEventListener("change", applyColorScheme)
      themeObserver.disconnect()
      root?.unmount()
      root = null
      host.remove()
    },
  }
}

// Re-exports — caller can build custom storage adapters / bubble actions.
export { createLocalStorageAdapter, createIpcAdapter } from "./storage"
export type { StorageAdapter } from "./storage"
export type { BubbleAction, Annotation } from "./internal/annotations"
