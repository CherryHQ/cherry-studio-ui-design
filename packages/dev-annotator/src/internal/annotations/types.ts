export type AnnotationCategory = "style" | "layout" | "interaction" | "content" | "bug" | "other"

/** Key computed styles captured at annotation time */
export interface CapturedStyles {
  fontSize: string
  fontWeight: string
  color: string
  backgroundColor: string
  padding: string
  margin: string
  borderRadius: string
  border: string
  gap: string
  display: string
  width: string
  height: string
  lineHeight: string
  opacity: string
}

export interface Annotation {
  id: string
  selector: string
  elementLabel: string
  /** Human-readable component ancestry: e.g. "ChatPage > MessageList > ChatMessage > div.actions" */
  breadcrumb: string
  comment: string
  /** Annotation category for prioritization */
  category: AnnotationCategory
  timestamp: string
  page: string
  /** Probable source file path based on page mapping */
  sourceHint: string
  /** Percent offset within the element bounds (0–1) */
  position: { x: number; y: number }
  /** Element dimensions at annotation time */
  rect: { width: number; height: number }
  /** Key computed styles at annotation time */
  computedStyles: CapturedStyles
  /** Raw className string — for grep/search in codebase */
  className: string
  resolved?: boolean
  orphaned?: boolean
  /** Optional element screenshot as data URL (PNG) — populated by extension */
  screenshot?: string
  /** Optional origin (set by extension to track source site) */
  origin?: string
}

/** Custom action button rendered in the bubble's view-mode action bar. */
export interface BubbleAction {
  /** Stable id (used as React key) */
  id: string
  /** Component to render — receives the annotation and a close callback */
  component: React.ComponentType<{
    annotation: Annotation
    onClose: () => void
  }>
}

export interface AnnotationContextValue {
  /** All annotations (all pages) */
  allAnnotations: Annotation[]
  /** Annotations filtered by current page */
  annotations: Annotation[]
  /** Whether annotation mode is active */
  enabled: boolean
  setEnabled: (v: boolean) => void
  addAnnotation: (ann: Omit<Annotation, "id" | "timestamp">) => void
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void
  resolveAnnotation: (id: string) => void
  /** Returns full JSON string of all annotations */
  exportAnnotations: () => string
  /** Import annotations (merges, skips duplicates by id) */
  importAnnotations: (annotations: Annotation[]) => void
  /** Current page identifier */
  page: string
  /** CSS selector of the boundary element */
  boundarySelector: string
  /** App name (cherry-studio | playground) */
  appName: string
  /** Container element for createPortal calls (defaults to document.body) */
  portalContainer: Element | null
  /**
   * Optional override for sourceHint generation when creating annotations.
   * Receives the clicked element; should return a string used as `sourceHint`.
   * Falls back to the default page-mapping logic when not provided.
   */
  getSourceHint?: (el: HTMLElement) => string
  /**
   * Custom action buttons to render in the bubble's view-mode action bar.
   * Each one receives the annotation and a close handler.
   */
  bubbleActions?: BubbleAction[]
}
