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
}

export function AnnotationProvider({
  children,
  page,
  boundarySelector = "#cherry-app-root",
  storageKey = "cherry-annotations",
  appName = "cherry-studio",
}: AnnotationProviderProps) {
  const [allAnnotations, setAllAnnotations] = useState<Annotation[]>(() =>
    loadAnnotations(storageKey),
  )
  const [enabled, setEnabled] = useState(false)
  const storageKeyRef = useRef(storageKey)
  storageKeyRef.current = storageKey

  // Persist to localStorage on change
  useEffect(() => {
    saveAnnotations(storageKeyRef.current, allAnnotations)
  }, [allAnnotations])

  // Filter by page
  const annotations = allAnnotations.filter((a) => a.page === page)

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
  }

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  )
}
