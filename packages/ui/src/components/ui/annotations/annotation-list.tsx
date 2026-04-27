import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, Circle, Filter, Trash2, X, AlertTriangle } from "lucide-react"
import { Button } from "../button"
import { Badge } from "../badge"
import { cn } from "../../../lib/utils"
import { useAnnotationContext } from "./annotation-provider"
import type { AnnotationCategory } from "./types"

const FILTER_CATEGORIES: { value: AnnotationCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "bug", label: "Bug" },
  { value: "style", label: "Style" },
  { value: "layout", label: "Layout" },
  { value: "interaction", label: "Inter." },
  { value: "content", label: "Content" },
  { value: "other", label: "Other" },
]

interface AnnotationListProps {
  open: boolean
  onClose: () => void
}

export function AnnotationList({ open, onClose }: AnnotationListProps) {
  const {
    annotations,
    resolveAnnotation,
    removeAnnotation,
    page,
  } = useAnnotationContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const [filterCategory, setFilterCategory] = useState<AnnotationCategory | "all">("all")
  const [showFilters, setShowFilters] = useState(false)

  // Protect from Radix Dialog's inert/aria-hidden
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    Object.defineProperty(el, "inert", { get() { return false }, set() {}, configurable: true })
    const obs = new MutationObserver(() => {
      HTMLElement.prototype.removeAttribute.call(el, "inert")
      HTMLElement.prototype.removeAttribute.call(el, "aria-hidden")
    })
    obs.observe(el, { attributes: true, attributeFilter: ["inert", "aria-hidden"] })
    return () => { obs.disconnect(); delete (el as any).inert }
  }, [open])

  if (!open) return null

  const filtered = filterCategory === "all"
    ? annotations
    : annotations.filter((a) => a.category === filterCategory)
  const active = filtered.filter((a) => !a.resolved)
  const resolved = filtered.filter((a) => a.resolved)

  const scrollToElement = (selector: string) => {
    try {
      const el = document.querySelector(selector) as HTMLElement | null
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        el.style.outline = "3px solid hsl(var(--ring))"
        el.style.outlineOffset = "2px"
        setTimeout(() => {
          el.style.outline = ""
          el.style.outlineOffset = ""
        }, 1500)
      }
    } catch {
      // invalid selector
    }
  }

  return createPortal(
    <div
      ref={containerRef}
      data-annotation-ui
      className="fixed right-20 bottom-24 w-80 max-h-[420px] rounded-[var(--radius-card)] border border-border bg-popover shadow-popover flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 pointer-events-auto"
      style={{ zIndex: 99999 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-[length:var(--fs-sm)] font-medium">Annotations</span>
          <Badge variant="secondary">{page}</Badge>
          <Badge variant="outline" className="text-[length:var(--fs-xs)]">{filtered.length}</Badge>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant={showFilters ? "default" : "ghost"}
            size="icon-xs"
            onClick={() => setShowFilters(!showFilters)}
            title="Filter"
          >
            <Filter className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border/50 bg-muted/30">
          {FILTER_CATEGORIES.map((cat) => {
            const count = cat.value === "all"
              ? annotations.length
              : annotations.filter((a) => a.category === cat.value).length
            return (
              <Button
                key={cat.value}
                variant={filterCategory === cat.value ? "default" : "outline"}
                size="inline"
                onClick={() => setFilterCategory(cat.value)}
                className="text-[length:var(--fs-xs)]"
              >
                {cat.label}
                {count > 0 && <span className="ml-0.5 opacity-60">{count}</span>}
              </Button>
            )
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-[length:var(--fs-sm)] text-muted-foreground">
            {filterCategory !== "all" ? (
              <>No {filterCategory} annotations on this page.</>
            ) : (
              <>
                No annotations on this page yet.
                <br />
                <span className="text-[length:var(--fs-xs)]">Enable annotation mode (⌘⇧X) and click on elements to add comments.</span>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Active annotations */}
            {active.map((ann, i) => (
              <div
                key={ann.id}
                className="flex items-start gap-2 px-3 py-2 border-b border-border/50 hover:bg-muted/50 cursor-pointer group"
                onClick={() => scrollToElement(ann.selector)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Badge className="min-w-5 h-5 rounded-full px-1 text-[length:var(--fs-xs)] font-bold justify-center">
                    {i + 1}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {ann.orphaned && (
                      <Badge variant="destructive" className="text-[length:var(--fs-xs)] px-1 py-0">
                        <AlertTriangle className="size-2.5 mr-0.5" />
                        orphaned
                      </Badge>
                    )}
                    {ann.category && (
                      <Badge variant="outline" className="text-[length:var(--fs-xs)] px-1 py-0">
                        {ann.category}
                      </Badge>
                    )}
                    {ann.sourceHint && (
                      <span className="text-[length:var(--fs-xs)] text-accent-blue truncate">
                        {ann.sourceHint.split("/").pop()}
                      </span>
                    )}
                  </div>
                  <p className="text-[length:var(--fs-sm)] line-clamp-2">{ann.comment}</p>
                  <code className="text-[length:var(--fs-xs)] text-muted-foreground line-clamp-1 mt-0.5 block">
                    {ann.elementLabel}
                  </code>
                </div>
                <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => { e.stopPropagation(); resolveAnnotation(ann.id) }}
                    title="Resolve"
                  >
                    <Circle className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id) }}
                    title="Delete"
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Resolved */}
            {resolved.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[length:var(--fs-xs)] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                  Resolved ({resolved.length})
                </div>
                {resolved.map((ann) => (
                  <div
                    key={ann.id}
                    className="flex items-start gap-2 px-3 py-2 border-b border-border/50 hover:bg-muted/50 cursor-pointer group opacity-60"
                    onClick={() => scrollToElement(ann.selector)}
                  >
                    <CheckCircle2 className="size-4 text-success mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[length:var(--fs-sm)] line-through line-clamp-2">{ann.comment}</p>
                    </div>
                    <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); resolveAnnotation(ann.id) }}
                        title="Unresolve"
                      >
                        <AlertTriangle className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id) }}
                        title="Delete"
                      >
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
