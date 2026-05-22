import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import type { Annotation, AnnotationContextValue } from "./types"
import {
  loadAnnotations,
  saveAnnotations,
  formatExportJSON,
  generateId,
} from "./utils"

const AnnotationContext = createContext<AnnotationContextValue | null>(null)

export function useAnnotationContext(): AnnotationContextValue {
  const ctx = useContext(AnnotationContext)
  if (!ctx) throw new Error("useAnnotationContext must be used inside AnnotationProvider")
  return ctx
}

interface AnnotationProviderProps {
  children: React.ReactNode
  /** Current page/tab/demo identifier — used to filter visible annotations */
  page: string
  /** CSS selector for the boundary element (overlay scope) */
  boundarySelector?: string
  /** localStorage key */
  storageKey?: string
  /** App name used in export JSON */
  appName?: string
  /**
   * Container for portal-rendered UI (overlay, toggle, list, bubble).
   * Defaults to document.body. In a browser extension or shadow-DOM context,
   * pass a shadow root (or any element inside it) to keep UI scoped.
   */
  portalContainer?: Element | null
  /**
   * If true, the provider does NOT read from / write to localStorage.
   * State lives entirely in memory; the parent app is responsible for
   * persistence via importAnnotations + the allAnnotations field.
   *
   * Use when integrating with chrome.storage, IndexedDB, or a remote backend
   * — avoids polluting host-page localStorage with annotations + screenshots.
   */
  disablePersistence?: boolean
  /**
   * If true, the page filter is treated as a no-op — annotations from any
   * `page` value are visible. Useful when annotations are already segregated
   * by another mechanism (e.g. per-origin in browser extensions).
   */
  disablePageFilter?: boolean
  /** Optional sourceHint override — see context type for details */
  getSourceHint?: (el: HTMLElement) => string
  /** Custom action buttons rendered in bubble view mode */
  bubbleActions?: import("./types").BubbleAction[]
}

export function AnnotationProvider({
  children,
  page,
  boundarySelector = "#cherry-app-root",
  storageKey = "cherry-annotations",
  appName = "cherry-studio",
  portalContainer,
  disablePersistence = false,
  disablePageFilter = false,
  getSourceHint,
  bubbleActions,
}: AnnotationProviderProps) {
  const [allAnnotations, setAllAnnotations] = useState<Annotation[]>(() =>
    disablePersistence ? [] : loadAnnotations(storageKey),
  )
  const [enabled, setEnabled] = useState(false)
  const storageKeyRef = useRef(storageKey)
  storageKeyRef.current = storageKey

  // Persist to localStorage on change (skipped when disablePersistence)
  useEffect(() => {
    if (disablePersistence) return
    saveAnnotations(storageKeyRef.current, allAnnotations)
  }, [allAnnotations, disablePersistence])

  // Filter by page (or show all if filter disabled)
  const annotations = disablePageFilter
    ? allAnnotations
    : allAnnotations.filter((a) => a.page === page)

  const addAnnotation = useCallback(
    (ann: Omit<Annotation, "id" | "timestamp">) => {
      const newAnn: Annotation = {
        ...ann,
        id: generateId(),
        timestamp: new Date().toISOString(),
      }
      setAllAnnotations((prev) => [...prev, newAnn])
    },
    [],
  )

  const updateAnnotation = useCallback(
    (id: string, patch: Partial<Annotation>) => {
      setAllAnnotations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      )
    },
    [],
  )

  const removeAnnotation = useCallback((id: string) => {
    setAllAnnotations((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const resolveAnnotation = useCallback((id: string) => {
    setAllAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: !a.resolved } : a)),
    )
  }, [])

  const exportAnnotations = useCallback(() => {
    return formatExportJSON(allAnnotations, appName)
  }, [allAnnotations, appName])

  const importAnnotations = useCallback((incoming: Annotation[]) => {
    setAllAnnotations((prev) => {
      const existingIds = new Set(prev.map((a) => a.id))
      const newAnns = incoming.filter((a) => !existingIds.has(a.id))
      return [...prev, ...newAnns]
    })
  }, [])

  const value: AnnotationContextValue = {
    allAnnotations,
    annotations,
    enabled,
    setEnabled,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    resolveAnnotation,
    exportAnnotations,
    importAnnotations,
    page,
    boundarySelector,
    appName,
    portalContainer: portalContainer ?? null,
    getSourceHint,
    bubbleActions,
  }

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  )
}
