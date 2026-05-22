import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, Circle, Copy, Filter, Search, Trash2, X, AlertTriangle } from "lucide-react"
import { Button } from "../button"
import { Badge } from "../badge"
import { useAnnotationContext } from "./annotation-provider"
import { copyJSON, generateSingleAnnotationPrompt } from "./utils"
import type { AnnotationCategory, AnnotationMessages } from "./types"

const FILTER_VALUES: (AnnotationCategory | "all")[] = [
  "all", "bug", "style", "layout", "interaction", "content", "other",
]

function filterLabel(v: AnnotationCategory | "all", m: AnnotationMessages): string {
  switch (v) {
    case "all": return m.categoryAll
    case "bug": return m.categoryBug
    case "style": return m.categoryStyle
    case "layout": return m.categoryLayout
    case "interaction": return m.categoryInteractionShort
    case "content": return m.categoryContent
    case "other": return m.categoryOther
  }
}

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
    portalContainer,
    messages,
  } = useAnnotationContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const [filterCategory, setFilterCategory] = useState<AnnotationCategory | "all">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState("")
  /** Selection set for batch ops; reset whenever the list closes */
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  useEffect(() => { if (!open) setSelected(new Set()) }, [open])

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

  const byCategory = filterCategory === "all"
    ? annotations
    : annotations.filter((a) => a.category === filterCategory)
  const q = search.trim().toLowerCase()
  const filtered = q
    ? byCategory.filter((a) =>
        a.comment.toLowerCase().includes(q) ||
        a.elementLabel.toLowerCase().includes(q) ||
        a.breadcrumb.toLowerCase().includes(q) ||
        (a.className || "").toLowerCase().includes(q) ||
        (a.sourceHint || "").toLowerCase().includes(q),
      )
    : byCategory

  // Show ALL annotations (including orphaned) — the orphaned badge on each
  // item makes the state visible without losing entries from the list.
  const active = filtered.filter((a) => !a.resolved)
  const resolved = filtered.filter((a) => a.resolved)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  // Plain const — `useMemo` here would be called conditionally (after the
  // `if (!open) return null` early-return above), violating React rules of
  // hooks and crashing the panel on toggle.
  const selectedAnnotations = filtered.filter((a) => selected.has(a.id))

  const handleBatchResolve = () => {
    for (const ann of selectedAnnotations) {
      if (!ann.resolved) resolveAnnotation(ann.id)
    }
    setSelected(new Set())
  }
  const handleBatchDelete = () => {
    if (!confirm(messages.confirmBatchDelete(selected.size))) return
    for (const ann of selectedAnnotations) removeAnnotation(ann.id)
    setSelected(new Set())
  }
  const handleBatchCopyPrompt = async () => {
    const text = selectedAnnotations.map(generateSingleAnnotationPrompt).join("\n\n---\n\n")
    await copyJSON(text)
  }

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
          <span className="text-[length:var(--fs-sm)] font-medium">{messages.listTitle}</span>
          <Badge variant="secondary">{page}</Badge>
          <Badge variant="outline" className="text-[length:var(--fs-xs)]">{filtered.length}</Badge>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant={showFilters ? "default" : "ghost"}
            size="icon-xs"
            onClick={() => setShowFilters(!showFilters)}
            title={messages.filterTooltip}
          >
            <Filter className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-border/50 flex items-center gap-2">
        <Search className="size-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={messages.searchPlaceholder}
          className="flex-1 bg-transparent text-[length:var(--fs-sm)] outline-none placeholder:text-muted-foreground"
        />
        {search && (
          <Button variant="ghost" size="icon-xs" onClick={() => setSearch("")}>
            <X className="size-3" />
          </Button>
        )}
      </div>

      {/* Batch actions bar — appears only when at least one annotation is selected */}
      {selected.size > 0 && (
        <div className="px-3 py-2 border-b border-border/50 bg-primary/5 flex items-center justify-between gap-2">
          <span className="text-[length:var(--fs-xs)] font-medium">
            {messages.selectedCount(selected.size)}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="xs" onClick={handleBatchCopyPrompt} title={messages.batchCopyPrompts}>
              <Copy className="size-3" />
            </Button>
            <Button variant="outline" size="xs" onClick={handleBatchResolve} title={messages.batchResolve}>
              <CheckCircle2 className="size-3" />
            </Button>
            <Button variant="outline" size="xs" onClick={handleBatchDelete} title={messages.batchDelete} className="text-destructive">
              <Trash2 className="size-3" />
            </Button>
            <Button variant="ghost" size="xs" onClick={() => setSelected(new Set())}>
              <X className="size-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border/50 bg-muted/30">
          {FILTER_VALUES.map((value) => {
            const count = value === "all"
              ? annotations.length
              : annotations.filter((a) => a.category === value).length
            return (
              <Button
                key={value}
                variant={filterCategory === value ? "default" : "outline"}
                size="inline"
                onClick={() => setFilterCategory(value)}
                className="text-[length:var(--fs-xs)]"
              >
                {filterLabel(value, messages)}
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
              <>{messages.listEmptyFiltered(filterLabel(filterCategory, messages))}</>
            ) : (
              <>
                {messages.listEmpty}
                <br />
                <span className="text-[length:var(--fs-xs)]">{messages.listEmptyHint}</span>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Active annotations */}
            {active.map((ann, i) => (
              <div
                key={ann.id}
                className={`flex items-start gap-2 px-3 py-2 border-b border-border/50 hover:bg-muted/50 cursor-pointer group ${
                  selected.has(ann.id) ? "bg-primary/5" : ""
                }`}
                onClick={() => scrollToElement(ann.selector)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(ann.id)}
                  onChange={() => toggleSelect(ann.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 size-3.5 cursor-pointer accent-primary"
                  aria-label={messages.selectForBatch}
                />
                <div className="flex-shrink-0 mt-0.5">
                  <Badge className="min-w-5 h-5 rounded-full px-1 text-[length:var(--fs-xs)] font-bold justify-center bg-primary text-primary-foreground border-transparent">
                    {i + 1}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {ann.orphaned && (
                      <Badge variant="destructive" className="text-[length:var(--fs-xs)] px-1 py-0">
                        <AlertTriangle className="size-2.5 mr-0.5" />
                        {messages.orphaned}
                      </Badge>
                    )}
                    {ann.category && (
                      <Badge variant="outline" className="text-[length:var(--fs-xs)] px-1 py-0">
                        {filterLabel(ann.category, messages)}
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
                    title={messages.resolve}
                  >
                    <Circle className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id) }}
                    title={messages.delete}
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
                  {messages.resolvedHeader(resolved.length)}
                </div>
                {resolved.map((ann) => (
                  <div
                    key={ann.id}
                    className={`flex items-start gap-2 px-3 py-2 border-b border-border/50 hover:bg-muted/50 cursor-pointer group opacity-60 ${
                      selected.has(ann.id) ? "bg-primary/5 opacity-100" : ""
                    }`}
                    onClick={() => scrollToElement(ann.selector)}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(ann.id)}
                      onChange={() => toggleSelect(ann.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 size-3.5 cursor-pointer accent-primary"
                      aria-label={messages.selectForBatch}
                    />
                    <CheckCircle2 className="size-4 text-success mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[length:var(--fs-sm)] line-through line-clamp-2">{ann.comment}</p>
                    </div>
                    <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); resolveAnnotation(ann.id) }}
                        title={messages.unresolve}
                      >
                        <AlertTriangle className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => { e.stopPropagation(); removeAnnotation(ann.id) }}
                        title={messages.delete}
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
    portalContainer || document.body,
  )
}
