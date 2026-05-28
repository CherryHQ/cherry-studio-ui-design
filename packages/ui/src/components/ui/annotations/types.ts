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
  /** User-attached reference images (data URLs) — uploaded via the bubble */
  referenceImages?: string[]
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

/**
 * UI strings for the annotation components. Pass overrides via
 * `<AnnotationProvider messages={...}>` to localize. Missing keys fall back
 * to {@link DEFAULT_ANNOTATION_MESSAGES} (English).
 */
export interface AnnotationMessages {
  // Bubble — header + actions
  addAnnotation: string
  resolved: string
  annotation: string
  cancel: string
  save: string
  saveHint: string                        // "⌘+Enter to save"
  describePlaceholder: string
  showPresets: string
  customInputTitle: string                // tooltip on the empty preset
  /** Tooltip on the "attach image" button in the bubble editor */
  attachImage: string
  /** A11y label on the per-thumbnail remove (×) button */
  removeImage: string
  hideStyles: string
  showStyleDiff: string
  /** "{n} changed" — n style fields differ from saved */
  changedCount: (n: number) => string
  copyAsPrompt: string
  edit: string
  resolve: string
  unresolve: string
  delete: string

  // Categories (shared by bubble + list filter)
  categoryAll: string
  categoryStyle: string
  categoryLayout: string
  categoryInteraction: string
  /** Short form used in the list filter bar (defaults to "Inter.") */
  categoryInteractionShort: string
  categoryContent: string
  categoryBug: string
  categoryOther: string

  // List
  listTitle: string                       // "Annotations"
  filterTooltip: string
  searchPlaceholder: string               // "Search annotations…"
  selectForBatch: string                  // a11y label on row checkbox
  selectedCount: (n: number) => string    // "{n} selected"
  batchResolve: string
  batchDelete: string
  batchCopyPrompts: string
  /** Confirm before bulk-deleting */
  confirmBatchDelete: (n: number) => string
  /** "No annotations on this page yet." */
  listEmpty: string
  /** Sub-line shown on the empty list */
  listEmptyHint: string
  /** "No {category} annotations on this page." */
  listEmptyFiltered: (category: string) => string
  /** "Resolved (n)" section header */
  resolvedHeader: (n: number) => string
  orphaned: string

  // Toggle / dropdown menu
  exportJson: string
  copyJson: string
  copied: string
  copyAiPrompt: string
  importJson: string
  /** "Extract Design Spec" — scan the page and dump tokens */
  extractDesignSpec: string
  /** "Run A11y Audit" — scan the page for accessibility issues */
  a11yAudit: string
  /** Toast/menu label after audit completes — e.g. "Found 5 issues" */
  a11yAuditDone: (n: number) => string
  showList: string
  hideList: string
  clearResolved: string
  clearAll: string
  enterAnnotationMode: string
  exitAnnotationMode: string
  /** Confirm dialog when wiping everything */
  confirmClearAll: string
  invalidImportFile: string
}

export const DEFAULT_ANNOTATION_MESSAGES: AnnotationMessages = {
  addAnnotation: "Add Annotation",
  resolved: "Resolved",
  annotation: "Annotation",
  cancel: "Cancel",
  save: "Save",
  saveHint: "⌘+Enter to save",
  describePlaceholder: "Describe the issue or change needed…",
  showPresets: "Show preset templates",
  customInputTitle: "Custom input",
  attachImage: "Attach reference image",
  removeImage: "Remove image",
  hideStyles: "Hide styles",
  showStyleDiff: "Show style diff",
  changedCount: (n) => `${n} changed`,
  copyAsPrompt: "Copy as AI Prompt",
  edit: "Edit",
  resolve: "Resolve",
  unresolve: "Unresolve",
  delete: "Delete",

  categoryAll: "All",
  categoryStyle: "Style",
  categoryLayout: "Layout",
  categoryInteraction: "Interaction",
  categoryInteractionShort: "Inter.",
  categoryContent: "Content",
  categoryBug: "Bug",
  categoryOther: "Other",

  listTitle: "Annotations",
  filterTooltip: "Filter",
  searchPlaceholder: "Search annotations…",
  selectForBatch: "Select for batch action",
  selectedCount: (n) => `${n} selected`,
  batchResolve: "Resolve all selected",
  batchDelete: "Delete all selected",
  batchCopyPrompts: "Copy AI prompts for selected",
  confirmBatchDelete: (n) => `Delete ${n} annotation${n === 1 ? "" : "s"}? This cannot be undone.`,
  listEmpty: "No annotations on this page yet.",
  listEmptyHint: "Enable annotation mode (⌘⇧X) and click on elements to add comments.",
  listEmptyFiltered: (category) => `No ${category} annotations on this page.`,
  resolvedHeader: (n) => `Resolved (${n})`,
  orphaned: "orphaned",

  exportJson: "Export JSON",
  copyJson: "Copy JSON",
  copied: "Copied!",
  copyAiPrompt: "Copy AI Prompt",
  importJson: "Import JSON",
  extractDesignSpec: "Extract Design Spec",
  a11yAudit: "Run A11y Audit",
  a11yAuditDone: (n) => (n === 0 ? "No new issues" : `Found ${n} issue${n === 1 ? "" : "s"}`),
  showList: "Show List",
  hideList: "Hide List",
  clearResolved: "Clear Resolved",
  clearAll: "Clear All",
  enterAnnotationMode: "Enter annotation mode (⌘⇧X)",
  exitAnnotationMode: "Exit annotation mode (⌘⇧X)",
  confirmClearAll: "Clear all annotations? This cannot be undone.",
  invalidImportFile: "Invalid annotation JSON file.",
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
  /** Localized UI strings (always merged with defaults; never null). */
  messages: AnnotationMessages
}
