import { useEffect, useMemo, useRef, useState } from "react"
import {
  AnnotationProvider,
  AnnotationOverlay,
  AnnotationToggle,
  AnnotationList,
  useAnnotations,
  type Annotation,
  type BubbleAction,
} from "./internal/annotations"
import { captureElementScreenshot } from "./screenshot"
import { getReactSourceHint } from "./fiber"
import type { StorageAdapter } from "./storage"

export interface AnnotatorAppProps {
  shadowRoot: ShadowRoot
  storage: StorageAdapter
  /** App identifier shown in exports. Defaults to document title. */
  appName?: string
  /** Page identifier — defaults to pathname. Useful for SPAs to disambiguate. */
  page?: string
  /** Whether to capture screenshots automatically (default: true). */
  captureScreenshots?: boolean
  /** Custom action buttons rendered in the annotation bubble's view mode. */
  bubbleActions?: BubbleAction[]
  /** Override sourceHint generation. Default: tries React Fiber, then pathname. */
  getSourceHint?: (el: HTMLElement) => string
}

export function AnnotatorApp({
  shadowRoot,
  storage,
  appName,
  page,
  captureScreenshots = true,
  bubbleActions,
  getSourceHint,
}: AnnotatorAppProps) {
  const [initial, setInitial] = useState<Annotation[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [listOpen, setListOpen] = useState(false)

  // Load initial state — never block render. UI shows up immediately even if
  // the storage adapter is slow or fails.
  useEffect(() => {
    storage
      .load()
      .then((data) => {
        setInitial(data)
        setHydrated(true)
      })
      .catch((err) => {
        console.warn("[loupe] storage load failed:", err)
        setHydrated(true)
      })
  }, [storage])

  // Stable portal target inside our shadow root.
  const portalRef = useRef<HTMLElement | null>(null)
  if (!portalRef.current) {
    const existing = shadowRoot.getElementById("loupe-portal-target") as HTMLElement | null
    if (existing) {
      portalRef.current = existing
    } else {
      const el = document.createElement("div")
      el.id = "loupe-portal-target"
      shadowRoot.appendChild(el)
      portalRef.current = el
    }
  }

  const memoizedActions = useMemo(() => bubbleActions ?? [], [bubbleActions])

  const sourceHintFn = useMemo(
    () => getSourceHint ?? defaultSourceHint,
    [getSourceHint],
  )

  return (
    <AnnotationProvider
      page={page ?? defaultPageId()}
      boundarySelector="body"
      appName={appName ?? (document.title.slice(0, 40) || "app")}
      portalContainer={portalRef.current}
      disablePersistence
      disablePageFilter
      getSourceHint={sourceHintFn}
      bubbleActions={memoizedActions}
    >
      <Persistence storage={storage} initial={initial} hydrated={hydrated} />
      {captureScreenshots && <ScreenshotCapture />}
      <AnnotationOverlay />
      <AnnotationToggle onToggleList={() => setListOpen((v) => !v)} listOpen={listOpen} />
      <AnnotationList open={listOpen} onClose={() => setListOpen(false)} />
    </AnnotationProvider>
  )
}

/**
 * Bridges AnnotationProvider state ↔ external storage.
 *  - Hydrates from storage once on mount
 *  - Saves on every change
 *  - Optionally listens for cross-window updates
 */
function Persistence({
  storage,
  initial,
  hydrated,
}: {
  storage: StorageAdapter
  initial: Annotation[]
  hydrated: boolean
}) {
  const ctx = useAnnotations()
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current || !hydrated) return
    if (initial.length > 0) ctx.importAnnotations(initial)
    hydratedRef.current = true
  }, [initial, hydrated, ctx])

  useEffect(() => {
    if (!hydratedRef.current) return
    storage.save(ctx.allAnnotations).catch(console.error)
  }, [ctx.allAnnotations, storage])

  useEffect(() => {
    if (!storage.subscribe) return
    return storage.subscribe((incoming) => {
      const have = new Set(ctx.allAnnotations.map((a) => a.id))
      const fresh = incoming.filter((a) => !have.has(a.id))
      if (fresh.length > 0) ctx.importAnnotations(fresh)
    })
  }, [storage, ctx])

  return null
}

function ScreenshotCapture() {
  const { allAnnotations, updateAnnotation } = useAnnotations()
  const processedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      for (const ann of allAnnotations) {
        if (ann.screenshot) continue
        if (processedIds.current.has(ann.id)) continue
        processedIds.current.add(ann.id)
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

// ─── Helpers ──────────────────────────────────────────────────────────────

function defaultPageId(): string {
  return window.location.pathname.replace(/\/$/, "") || "/"
}

function defaultSourceHint(el: HTMLElement): string {
  const fiber = getReactSourceHint(el)
  if (fiber) return fiber
  return window.location.pathname || "/"
}
