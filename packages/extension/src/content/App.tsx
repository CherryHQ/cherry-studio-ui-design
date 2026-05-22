import { Component, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  AnnotationProvider,
  AnnotationOverlay,
  AnnotationToggle,
  AnnotationList,
  useAnnotations,
  type Annotation,
  type AnnotationMessages,
  type BubbleAction,
} from "@cherry-studio/ui"
import { loadAnnotationsFor, saveAnnotationsFor, onAnnotationsChanged, loadSettings } from "../shared/storage"
import { captureElementScreenshot } from "../shared/screenshot"
import { getReactSourceHint } from "../shared/fiber"
import { useT } from "../shared/i18n"
import { FileIssueAction } from "./BubbleActions"

interface ContentAppProps {
  shadowRoot: ShadowRoot
}

/**
 * Root of the content-script React app.
 *
 * The AnnotationProvider from @cherry-studio/ui still uses its localStorage
 * key internally — we use a unique bootstrap key per origin so each site has
 * an independent state. The StoragePersistence bridge then syncs to
 * chrome.storage.local for cross-tab sync and popup access.
 */
export function ContentApp({ shadowRoot }: ContentAppProps) {
  // Start with empty array — UI renders immediately. Storage hydration
  // happens async via StoragePersistence; if storage is slow/blocked, the
  // FAB still appears so the user can use the extension.
  const [initialAnnotations, setInitialAnnotations] = useState<Annotation[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const origin = window.location.origin
  const { t, locale } = useT()

  // Build a stable AnnotationMessages object from the extension's i18n.
  // Re-derived only when locale changes — bubble/list/toggle re-render then.
  const messages = useMemo<Partial<AnnotationMessages>>(() => ({
    addAnnotation: t("ann.addAnnotation"),
    resolved: t("ann.resolved"),
    annotation: t("ann.annotation"),
    cancel: t("ann.cancel"),
    save: t("ann.save"),
    saveHint: t("ann.saveHint"),
    describePlaceholder: t("ann.describePlaceholder"),
    showPresets: t("ann.showPresets"),
    customInputTitle: t("ann.customInputTitle"),
    hideStyles: t("ann.hideStyles"),
    showStyleDiff: t("ann.showStyleDiff"),
    changedCount: (n: number) => t("ann.changedCount", { n }),
    copyAsPrompt: t("ann.copyAsPrompt"),
    edit: t("ann.edit"),
    resolve: t("ann.resolve"),
    unresolve: t("ann.unresolve"),
    delete: t("ann.delete"),
    categoryAll: t("ann.cat.all"),
    categoryStyle: t("ann.cat.style"),
    categoryLayout: t("ann.cat.layout"),
    categoryInteraction: t("ann.cat.interaction"),
    categoryInteractionShort: t("ann.cat.interactionShort"),
    categoryContent: t("ann.cat.content"),
    categoryBug: t("ann.cat.bug"),
    categoryOther: t("ann.cat.other"),
    listTitle: t("ann.list.title"),
    filterTooltip: t("ann.list.filter"),
    listEmpty: t("ann.list.empty"),
    listEmptyHint: t("ann.list.emptyHint"),
    listEmptyFiltered: (category: string) => t("ann.list.emptyFiltered", { category }),
    resolvedHeader: (n: number) => t("ann.list.resolvedHeader", { n }),
    orphaned: t("ann.list.orphaned"),
    exportJson: t("ann.menu.exportJson"),
    copyJson: t("ann.menu.copyJson"),
    copied: t("ann.menu.copied"),
    copyAiPrompt: t("ann.menu.copyAiPrompt"),
    importJson: t("ann.menu.importJson"),
    showList: t("ann.menu.showList"),
    hideList: t("ann.menu.hideList"),
    clearResolved: t("ann.menu.clearResolved"),
    clearAll: t("ann.menu.clearAll"),
    enterAnnotationMode: t("ann.menu.enter"),
    exitAnnotationMode: t("ann.menu.exit"),
    confirmClearAll: t("ann.menu.confirmClearAll"),
    invalidImportFile: t("ann.menu.invalidImport"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [locale])

  useEffect(() => {
    loadAnnotationsFor(origin)
      .then((data) => {
        setInitialAnnotations(data)
        setHydrated(true)
      })
      .catch((err) => {
        // Don't block render on storage failure — log and continue with empty
        console.warn("[loupe] storage read failed:", err)
        setHydrated(true)
      })
  }, [origin])

  // Stable bubble action list — only File Issue. AI suggestions removed
  // (Copy AI Prompt covers it without needing user-managed API keys).
  const bubbleActions = useMemo<BubbleAction[]>(
    () => [{ id: "file-issue", component: FileIssueAction }],
    [],
  )

  // Portal target inside our shadow root. Attach via useLayoutEffect so DOM
  // mutation happens outside React's render phase (no StrictMode surprises),
  // but lands before paint so the first AnnotationProvider render sees it.
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    let el = shadowRoot.getElementById("marker-portal-target") as HTMLElement | null
    if (!el) {
      el = document.createElement("div")
      el.id = "marker-portal-target"
      shadowRoot.appendChild(el)
    }
    setPortalContainer(el)
  }, [shadowRoot])

  // Defer rendering the provider tree until the portal target is attached.
  // Without this, AnnotationToggle would briefly portal into document.body
  // (the shadow-stylesheet doesn't reach there → unstyled FAB on the host
  // page, which the user reports as "buttons don't appear").
  if (!portalContainer) return null

  return (
    <RenderErrorBoundary>
    <AnnotationProvider
      page={getPageId()}
      boundarySelector="body"
      appName={extractAppName(origin)}
      portalContainer={portalContainer}
      disablePersistence
      disablePageFilter
      getSourceHint={fiberSourceHint}
      bubbleActions={bubbleActions}
      messages={messages}
    >
      <StoragePersistence origin={origin} initial={initialAnnotations} hydrated={hydrated} />
      <CommandBridge />
      <ScreenshotCapture />
      <AnnotationOverlay />
      <AnnotationToggle onToggleList={() => setListOpen((v) => !v)} listOpen={listOpen} />
      <AnnotationList open={listOpen} onClose={() => setListOpen(false)} />
      <MountAcknowledger />
    </AnnotationProvider>
    </RenderErrorBoundary>
  )
}

/**
 * Logs once after the React tree commits — proves the FAB markup actually
 * rendered, not just that the content script ran. Pairs with the script-load
 * log in `index.tsx` to disambiguate "script ran" vs "tree mounted".
 */
function MountAcknowledger() {
  useEffect(() => {
    console.info(
      "%c[Loupe]%c React tree mounted",
      "background:#000;color:#fff;padding:1px 5px;border-radius:3px;font-weight:600;",
      "color:#999;",
    )
  }, [])
  return null
}

/**
 * Surfaces render-time errors that React would otherwise log only via the
 * default error overlay (which doesn't exist in extension content scripts).
 * Without this, a throw inside any annotation component leaves the shadow
 * root mounted but visually empty — exactly the "buttons don't appear"
 * symptom the user reported.
 */
class RenderErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error(
      "%c[Loupe]%c render error — UI is hidden until reload",
      "background:#c00;color:#fff;padding:1px 5px;border-radius:3px;font-weight:600;",
      "color:#c00;",
      error,
      info.componentStack,
    )
  }
  render() {
    if (this.state.error) return null
    return this.props.children
  }
}

/**
 * Bridges AnnotationProvider's in-memory state to chrome.storage.local.
 *  - Hydrates from chrome.storage on mount
 *  - Saves on every change
 *  - Listens to remote changes (other tabs) and merges them in
 */
function StoragePersistence({
  origin,
  initial,
  hydrated,
}: {
  origin: string
  initial: Annotation[]
  hydrated: boolean
}) {
  const ctx = useAnnotations()
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current) return
    if (!hydrated) return
    if (initial.length > 0) ctx.importAnnotations(initial)
    hydratedRef.current = true
  }, [initial, ctx, hydrated])

  useEffect(() => {
    if (!hydratedRef.current) return
    saveAnnotationsFor(origin, ctx.allAnnotations).catch(console.error)
  }, [ctx.allAnnotations, origin])

  useEffect(() => {
    return onAnnotationsChanged(origin, (incoming) => {
      const existingIds = new Set(ctx.allAnnotations.map((a) => a.id))
      const fresh = incoming.filter((a) => !existingIds.has(a.id))
      if (fresh.length > 0) ctx.importAnnotations(fresh)
    })
  }, [origin, ctx])

  return null
}

/**
 * Auto-captures a PNG screenshot of the annotated element shortly after a new
 * annotation is created. Skipped if disabled in settings or if the element
 * already has a screenshot.
 */
function ScreenshotCapture() {
  const { allAnnotations, updateAnnotation } = useAnnotations()
  const processedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const settings = await loadSettings()
      if (settings.captureScreenshots === false) return

      for (const ann of allAnnotations) {
        if (ann.screenshot) continue
        if (processedIds.current.has(ann.id)) continue
        processedIds.current.add(ann.id)

        // Defer to next frame so DOM is stable
        const dataUrl = await captureElementScreenshot(ann.selector)
        if (cancelled) return
        if (dataUrl) updateAnnotation(ann.id, { screenshot: dataUrl })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [allAnnotations, updateAnnotation])

  return null
}

/**
 * Bridges chrome.runtime messages (from background's command handler) to the
 * AnnotationProvider's setEnabled. Allows the manifest-declared global
 * keyboard shortcut to work even when the page itself doesn't have focus.
 */
function CommandBridge() {
  const { enabled, setEnabled } = useAnnotations()

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.runtime?.onMessage) return
    const handler = (msg: { type?: string }) => {
      if (msg?.type === "toggle-annotation-mode") {
        setEnabled(!enabled)
      }
    }
    chrome.runtime.onMessage.addListener(handler)
    return () => chrome.runtime.onMessage.removeListener(handler)
  }, [enabled, setEnabled])

  return null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generates an extension-flavored sourceHint:
 *  - If React fiber is reachable, return the component breadcrumb (and source
 *    file from _debugSource if dev build) — most useful for AI prompts.
 *  - Otherwise fall back to the current pathname for context.
 */
function fiberSourceHint(el: HTMLElement): string {
  const fiber = getReactSourceHint(el)
  if (fiber) return fiber
  return window.location.pathname || "/"
}

function getPageId(): string {
  // Annotations carry this as a `page` field (still useful for filtering in
  // popup / exports), but the in-page list/toggle ignore page filtering
  // (disablePageFilter) so all annotations on the origin are visible.
  return window.location.pathname.replace(/\/$/, "") || "/"
}

function extractAppName(origin: string): string {
  try {
    return new URL(origin).hostname.replace(/^www\./, "")
  } catch {
    return origin
  }
}
