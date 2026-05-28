import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useAnnotationContext } from "./annotation-provider"
import { AnnotationBubble } from "./annotation-bubble"
import { Badge } from "../badge"
import { cn } from "../../../lib/utils"
import { generateSelector, generateElementLabel, generateBreadcrumb, captureComputedStyles, getSourceHint, copyJSON, downloadJSON } from "./utils"
import type { Annotation, CapturedStyles } from "./types"

interface MarkerPosition {
  top: number
  left: number
  visible: boolean
}

interface HighlightRect {
  top: number
  left: number
  width: number
  height: number
}

interface PendingAnnotation {
  element: HTMLElement
  selector: string
  elementLabel: string
  breadcrumb: string
  computedStyles: CapturedStyles
  rect: { width: number; height: number }
  sourceHint: string
  className: string
  bubbleX: number
  bubbleY: number
  position: { x: number; y: number }
}

/** Check if an element is a valid annotation target */
function isValidTarget(el: HTMLElement | null): el is HTMLElement {
  if (!el) return false
  if (el === document.body || el === document.documentElement) return false
  if (el.closest("[data-annotation-ui]")) return false
  return true
}

export function AnnotationOverlay() {
  const {
    allAnnotations,
    annotations,
    enabled,
    setEnabled,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    resolveAnnotation,
    exportAnnotations,
    boundarySelector,
    page,
    appName,
    portalContainer,
    getSourceHint: getSourceHintOverride,
    bubbleActions,
  } = useAnnotationContext()

  const [highlight, setHighlight] = useState<HighlightRect | null>(null)
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null)
  const hoveredElRef = useRef<HTMLElement | null>(null)
  // Track the original mouseover target and the path of ancestors for wheel navigation
  const mouseTargetRef = useRef<HTMLElement | null>(null)
  const ancestorPathRef = useRef<HTMLElement[]>([])
  const depthIndexRef = useRef(0)
  const [pending, setPending] = useState<PendingAnnotation | null>(null)
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null)
  const [markerPositions, setMarkerPositions] = useState<Map<string, MarkerPosition>>(new Map())
  const prevPageRef = useRef(page)
  const portalContainerRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  // ─── Measurement mode (Shift held in annotation mode) ──────────────────
  // First Shift+hover anchors element A; subsequent hovers compute distance
  // and alignment between A and the currently hovered element B and draw
  // dashed guides + a px label.
  const [shiftHeld, setShiftHeld] = useState(false)
  const [measureAnchor, setMeasureAnchor] = useState<DOMRect | null>(null)
  const [measureCurrent, setMeasureCurrent] = useState<DOMRect | null>(null)

  const getBoundary = useCallback((): HTMLElement | null => {
    return document.querySelector(boundarySelector)
  }, [boundarySelector])

  // ─── Clear pending/active state on page change ────────────────────────

  useEffect(() => {
    if (prevPageRef.current !== page) {
      setPending(null)
      setActiveBubbleId(null)
      prevPageRef.current = page
    }
  }, [page])

  // Exiting annotation mode hides the markers — also dismiss any open bubble
  // so we don't leave a floating popover anchored to an invisible marker.
  useEffect(() => {
    if (!enabled) {
      setPending(null)
      setActiveBubbleId(null)
    }
  }, [enabled])

  // ─── Keyboard shortcuts ────────────────────────────────────────────────
  //   ⌘+Shift+X  → toggle annotation mode
  //   ⌘+Shift+F  → copy AI prompt
  //   ⌘+Shift+E  → export JSON (download)
  //   ⌘+Shift+D  → clear all annotations

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey || e.altKey) return
      // Match against `code` (KeyX/KeyF/...) — independent of layout/shift case
      // Fall back to `key` for older browsers
      const code = (e.code || '').toLowerCase()
      const key = (e.key || '').toLowerCase()
      const matches = (k: string) => code === `key${k}` || key === k

      if (matches("x")) {
        e.preventDefault()
        e.stopPropagation()
        const next = !enabled
        setEnabled(next)
        showToast(next ? "Annotation mode ON" : "Annotation mode OFF")
      } else if (matches("f")) {
        e.preventDefault()
        e.stopPropagation()
        if (allAnnotations.length === 0) {
          showToast("No annotations to copy")
          return
        }
        const json = exportAnnotations()
        const parsed = JSON.parse(json)
        copyJSON(parsed.actionPrompt || "").then((ok) => {
          showToast(ok ? "AI prompt copied" : "Copy failed")
        })
      } else if (matches("e")) {
        e.preventDefault()
        e.stopPropagation()
        if (allAnnotations.length === 0) {
          showToast("No annotations to export")
          return
        }
        const json = exportAnnotations()
        downloadJSON(json, "annotations.json")
        showToast("Exported annotations.json")
      } else if (matches("d")) {
        e.preventDefault()
        e.stopPropagation()
        if (allAnnotations.length === 0) return
        if (confirm("Clear all annotations? This cannot be undone.")) {
          for (const ann of [...allAnnotations]) removeAnnotation(ann.id)
          showToast("All annotations cleared")
        }
      }
    }
    // Use capture phase so we fire before any input-level handlers that may
    // stopPropagation (common in textareas and rich editors).
    document.addEventListener("keydown", handleShortcut, true)
    return () => document.removeEventListener("keydown", handleShortcut, true)
  }, [enabled, setEnabled, allAnnotations, removeAnnotation, exportAnnotations, showToast])

  // ─── Crosshair cursor on body ─────────────────────────────────────────

  useEffect(() => {
    if (!enabled) return
    // Save and restore the host page's original cursor — overwriting with ""
    // would clobber any inline cursor style the host had set (rare but real:
    // some apps set a custom cursor during drag-and-drop or canvas editors).
    const original = document.body.style.cursor
    document.body.style.cursor = "crosshair"
    return () => { document.body.style.cursor = original }
  }, [enabled])

  // ─── Protect annotation portal container from Radix Dialog `inert` ────
  //
  // Radix Dialog uses `aria-hidden` package which sets `inert` + `aria-hidden`
  // on all sibling elements of the dialog portal. Our portal container is a
  // sibling, so it gets marked inert — blocking all pointer/focus events.
  //
  // We defend against this at the property level: override `inert` setter on
  // the container element so it silently ignores attempts to set it, and use a
  // MutationObserver as backup for setAttribute-based changes.

  useEffect(() => {
    const el = portalContainerRef.current
    if (!el) return

    // Override the `inert` property so it always returns false
    Object.defineProperty(el, "inert", {
      get() { return false },
      set() { /* silently ignore */ },
      configurable: true,
    })

    // Backup: MutationObserver for setAttribute('inert', ...) / setAttribute('aria-hidden', ...)
    const observer = new MutationObserver(() => {
      // Use the native removeAttribute to bypass any framework
      HTMLElement.prototype.removeAttribute.call(el, "inert")
      HTMLElement.prototype.removeAttribute.call(el, "aria-hidden")
    })
    observer.observe(el, { attributes: true, attributeFilter: ["inert", "aria-hidden"] })

    return () => {
      observer.disconnect()
      // Restore native property
      delete (el as any).inert
    }
  }, [])

  // ─── Update marker positions ──────────────────────────────────────────

  // Refs let updateMarkerPositions stay stable across re-renders.
  const annotationsRef = useRef(annotations)
  annotationsRef.current = annotations
  const updateAnnotationRef = useRef(updateAnnotation)
  updateAnnotationRef.current = updateAnnotation

  // Track consecutive miss count per annotation. We only mark `orphaned` after
  // it fails to resolve N times in a row — avoids false positives from React
  // re-renders, transient unmounts, and conditional rendering.
  const ORPHAN_MISS_THRESHOLD = 3
  const missCountRef = useRef<Map<string, number>>(new Map())

  const updateMarkerPositions = useCallback(() => {
    const anns = annotationsRef.current
    const newPositions = new Map<string, MarkerPosition>()
    const orphanUpdates: { id: string; orphaned: boolean }[] = []
    const misses = missCountRef.current

    for (const ann of anns) {
      let el: HTMLElement | null = null
      try {
        el = document.querySelector(ann.selector) as HTMLElement | null
      } catch {
        el = null
      }

      if (el) {
        const rect = el.getBoundingClientRect()
        newPositions.set(ann.id, {
          top: rect.top + rect.height * ann.position.y,
          left: rect.left + rect.width * ann.position.x,
          visible: true,
        })
        misses.delete(ann.id)
        if (ann.orphaned) orphanUpdates.push({ id: ann.id, orphaned: false })
      } else {
        newPositions.set(ann.id, { top: 0, left: 0, visible: false })
        const n = (misses.get(ann.id) || 0) + 1
        misses.set(ann.id, n)
        // Only escalate to orphaned after sustained failure
        if (n >= ORPHAN_MISS_THRESHOLD && !ann.orphaned) {
          orphanUpdates.push({ id: ann.id, orphaned: true })
        }
      }
    }

    setMarkerPositions(newPositions)

    if (orphanUpdates.length > 0) {
      requestAnimationFrame(() => {
        for (const u of orphanUpdates) {
          updateAnnotationRef.current(u.id, { orphaned: u.orphaned })
        }
      })
    }
  }, [])

  // Run the position pass on mount, on every annotation count change, and on
  // viewport / DOM mutation. Annotation count change is critical so newly
  // created annotations get a marker without waiting for scroll.
  useEffect(() => {
    updateMarkerPositions()
  }, [annotations.length, updateMarkerPositions])

  useEffect(() => {
    const mo = new MutationObserver(updateMarkerPositions)
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] })
    window.addEventListener("scroll", updateMarkerPositions, true)
    window.addEventListener("resize", updateMarkerPositions)
    return () => {
      mo.disconnect()
      window.removeEventListener("scroll", updateMarkerPositions, true)
      window.removeEventListener("resize", updateMarkerPositions)
    }
  }, [updateMarkerPositions])

  // ─── Hover highlight ──────────────────────────────────────────────────

  /** Build the ancestor path from element up to boundary (or body) */
  const buildAncestorPath = useCallback((el: HTMLElement) => {
    const boundary = getBoundary()
    const path: HTMLElement[] = [el]
    let cur = el.parentElement
    while (cur && cur !== boundary && cur !== document.body && cur !== document.documentElement) {
      if (!cur.closest("[data-annotation-ui]")) path.push(cur)
      cur = cur.parentElement
    }
    ancestorPathRef.current = path
    depthIndexRef.current = 0
  }, [getBoundary])

  /** Apply highlight to a specific element */
  const applyHighlight = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    setHighlight({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
    setHoveredEl(el)
    hoveredElRef.current = el
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!enabled || pending || activeBubbleId) return

      const target = e.target as HTMLElement
      if (!isValidTarget(target)) {
        setHighlight(null)
        setHoveredEl(null)
        hoveredElRef.current = null
        return
      }

      // Only rebuild path if the actual mouse target changed
      if (target !== mouseTargetRef.current) {
        mouseTargetRef.current = target
        buildAncestorPath(target)
      }

      const el = ancestorPathRef.current[depthIndexRef.current] || target
      applyHighlight(el)

      // Measurement mode: when Shift is held, lock anchor on first hover (or
      // refresh if user moves to a different element after releasing Shift),
      // and update `current` to whatever they're hovering now.
      if (shiftHeld) {
        const rect = el.getBoundingClientRect()
        setMeasureCurrent(rect)
        if (!measureAnchor) setMeasureAnchor(rect)
      }
    },
    [enabled, pending, activeBubbleId, buildAncestorPath, applyHighlight, shiftHeld, measureAnchor],
  )

  // Listen for Shift to enter / exit measurement mode
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftHeld(false)
        setMeasureAnchor(null)
        setMeasureCurrent(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [enabled])

  // ─── Scroll wheel to navigate parent/child elements ───────────────────

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!enabled || pending || activeBubbleId) return
      if (!mouseTargetRef.current) return

      e.preventDefault()

      const path = ancestorPathRef.current
      if (path.length <= 1) return

      if (e.deltaY < 0) {
        // Scroll up → select parent
        depthIndexRef.current = Math.min(depthIndexRef.current + 1, path.length - 1)
      } else {
        // Scroll down → select child
        depthIndexRef.current = Math.max(depthIndexRef.current - 1, 0)
      }

      const el = path[depthIndexRef.current]
      if (el) applyHighlight(el)
    },
    [enabled, pending, activeBubbleId, applyHighlight],
  )

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return
      if (pending || activeBubbleId) return

      const target = e.target as HTMLElement
      if (!isValidTarget(target)) return

      // Use ref for latest hovered element to avoid stale closure
      const el = hoveredElRef.current || target

      e.preventDefault()
      e.stopPropagation()

      const boundary = getBoundary()
      const rect = el.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width
      const relY = (e.clientY - rect.top) / rect.height

      setPending({
        element: el,
        selector: generateSelector(el, boundary),
        elementLabel: generateElementLabel(el),
        breadcrumb: generateBreadcrumb(el, boundary),
        computedStyles: captureComputedStyles(el),
        rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
        sourceHint: getSourceHintOverride
          ? getSourceHintOverride(el)
          : getSourceHint(page, appName, el),
        className: el.getAttribute("class") || "",
        bubbleX: Math.min(e.clientX, window.innerWidth - 340),
        bubbleY: Math.min(e.clientY + 10, window.innerHeight - 300),
        position: { x: Math.max(0, Math.min(1, relX)), y: Math.max(0, Math.min(1, relY)) },
      })
      setHighlight(null)
    },
    [enabled, pending, activeBubbleId, getBoundary, page, appName],
  )

  useEffect(() => {
    if (!enabled) {
      setHighlight(null)
      setHoveredEl(null)
      mouseTargetRef.current = null
      ancestorPathRef.current = []
      depthIndexRef.current = 0
      return
    }

    document.addEventListener("mousemove", handleMouseMove, true)
    document.addEventListener("click", handleClick, true)
    document.addEventListener("wheel", handleWheel, { capture: true, passive: false })
    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true)
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("wheel", handleWheel, true)
    }
  }, [enabled, handleMouseMove, handleClick, handleWheel])

  // ─── Close bubble on Escape ───────────────────────────────────────────

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      // Only handle Escape when annotation bubble is open, and no other dialog is active
      if (!pending && !activeBubbleId) return
      if (document.querySelector("dialog[open]:not([data-annotation-ui]),[role=dialog]:not([data-annotation-ui])")) return
      e.stopPropagation()
      setPending(null)
      setActiveBubbleId(null)
    }
    document.addEventListener("keydown", handleEsc, true)
    return () => document.removeEventListener("keydown", handleEsc, true)
  }, [pending, activeBubbleId])

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleCreateSave = (comment: string, category: Annotation["category"], referenceImages?: string[]) => {
    if (!pending) return
    addAnnotation({
      selector: pending.selector,
      elementLabel: pending.elementLabel,
      breadcrumb: pending.breadcrumb,
      comment,
      category,
      page,
      sourceHint: pending.sourceHint,
      position: pending.position,
      rect: pending.rect,
      computedStyles: pending.computedStyles,
      className: pending.className,
      ...(referenceImages && referenceImages.length > 0 ? { referenceImages } : {}),
    })
    setPending(null)
  }

  const getActiveBubbleAnnotation = (): Annotation | undefined =>
    activeBubbleId ? annotations.find((a) => a.id === activeBubbleId) : undefined

  const getActiveBubblePosition = (): { x: number; y: number } | null => {
    if (!activeBubbleId) return null
    const pos = markerPositions.get(activeBubbleId)
    if (!pos || !pos.visible) return null
    return {
      x: Math.min(pos.left, window.innerWidth - 340),
      y: Math.min(pos.top + 16, window.innerHeight - 300),
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────

  const overlayPortal = createPortal(
    <div ref={portalContainerRef} data-annotation-ui style={{ display: "contents" }}>
      {/* Toast — visual feedback for keyboard shortcuts */}
      {toast && (
        <div
          data-annotation-ui
          className="fixed left-1/2 -translate-x-1/2 top-6 px-4 py-2 rounded-[var(--radius-button)] bg-foreground text-background text-sm font-medium shadow-lg pointer-events-none animate-in fade-in slide-in-from-top-2"
          style={{ zIndex: 99999 }}
        >
          {toast}
        </div>
      )}

      {/* Hover highlight — purely visual, no event interception */}
      {enabled && highlight && (
        <div
          data-annotation-ui
          className="fixed pointer-events-none border-2 border-ring bg-ring/8 rounded-[var(--radius-dot)] transition-all duration-50 ease-out"
          style={{
            zIndex: 9998,
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
          }}
        >
          {hoveredEl && (
            <div className="absolute bottom-full left-0 mb-1 flex items-center gap-1">
            {ancestorPathRef.current.length > 1 && (
              <span className="px-1 py-0.5 text-[length:var(--fs-xs)] leading-tight text-primary-foreground/70 bg-primary/80 rounded-[var(--radius-dot)] whitespace-nowrap">
                ↕ {depthIndexRef.current}/{ancestorPathRef.current.length - 1}
              </span>
            )}
            <span className="px-1.5 py-0.5 text-[length:var(--fs-xs)] leading-tight text-primary-foreground bg-primary rounded-[var(--radius-dot)] whitespace-nowrap max-w-[250px] overflow-hidden text-ellipsis">
              {generateElementLabel(hoveredEl)}
            </span>
            </div>
          )}
        </div>
      )}

      {/* Measurement guides + distance label (Shift held during annotation) */}
      {enabled && shiftHeld && measureAnchor && measureCurrent && (() => {
        const a = measureAnchor
        const b = measureCurrent
        // Pick the closest pair of edges to display the gap between
        let dx = 0
        let dy = 0
        let labelX = 0
        let labelY = 0
        if (b.left >= a.right) {
          dx = b.left - a.right
          labelX = (a.right + b.left) / 2
          labelY = (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2
        } else if (a.left >= b.right) {
          dx = a.left - b.right
          labelX = (b.right + a.left) / 2
          labelY = (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2
        }
        if (b.top >= a.bottom) {
          dy = b.top - a.bottom
          labelX ||= (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2
          labelY = (a.bottom + b.top) / 2
        } else if (a.top >= b.bottom) {
          dy = a.top - b.bottom
          labelX ||= (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2
          labelY = (b.bottom + a.top) / 2
        }
        const totalGap = Math.round(Math.sqrt(dx * dx + dy * dy))
        const widthDelta = Math.round(b.width - a.width)
        const heightDelta = Math.round(b.height - a.height)
        return (
          <>
            {/* Anchor box outline (dashed blue) */}
            <div
              data-annotation-ui
              className="fixed pointer-events-none border-2 border-dashed border-accent-blue/70"
              style={{ zIndex: 9997, top: a.top, left: a.left, width: a.width, height: a.height }}
            />
            {/* Distance label */}
            <div
              data-annotation-ui
              className="fixed pointer-events-none px-1.5 py-0.5 rounded-[var(--radius-dot)] bg-accent-blue text-white text-[length:var(--fs-xs)] font-mono font-semibold shadow-md"
              style={{ zIndex: 9999, top: labelY - 10, left: labelX, transform: "translate(-50%, -50%)" }}
            >
              {totalGap > 0 ? `${totalGap}px` : "overlap"}
              {(widthDelta !== 0 || heightDelta !== 0) && (
                <span className="ml-1 opacity-70">
                  · Δw {widthDelta > 0 ? "+" : ""}{widthDelta} · Δh {heightDelta > 0 ? "+" : ""}{heightDelta}
                </span>
              )}
            </div>
          </>
        )
      })()}

      {/* Annotation markers — only visible while annotation mode is on (Figma-style).
          When mode is off, markers are hidden so they don't obscure the live UI. */}
      {enabled && (() => {
        let visibleIndex = 0
        return annotations.map((ann) => {
          const pos = markerPositions.get(ann.id)
          if (!pos?.visible) return null
          visibleIndex++
          const displayNum = visibleIndex
          return (
            <div
              key={ann.id}
            data-annotation-ui
            className="fixed cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setActiveBubbleId(activeBubbleId === ann.id ? null : ann.id)
            }}
            style={{
              zIndex: 9999,
              top: pos.top - 10,
              left: pos.left - 10,
              pointerEvents: "auto",
            }}
          >
            <Badge
              className={cn(
                "min-w-5 h-5 rounded-full px-1 text-[length:var(--fs-xs)] font-bold justify-center shadow-md border-2 border-background transition-transform hover:scale-125",
                ann.resolved
                  ? "bg-success text-success-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {displayNum}
            </Badge>
          </div>
          )
        })
      })()}

      {/* Create bubble */}
      {pending && (
        <AnnotationBubble
          style={{
            top: pending.bubbleY,
            left: pending.bubbleX,
          }}
          onSave={handleCreateSave}
          onClose={() => setPending(null)}
          elementLabel={pending.elementLabel}
          breadcrumb={pending.breadcrumb}
        />
      )}

      {/* View/edit bubble */}
      {activeBubbleId && (() => {
        const ann = getActiveBubbleAnnotation()
        const pos = getActiveBubblePosition()
        if (!ann || !pos) return null
        return (
          <AnnotationBubble
            annotation={ann}
            style={{ top: pos.y, left: pos.x }}
            customActions={bubbleActions}
            onSave={() => { /* view mode only */ }}
            onUpdate={(id, comment, referenceImages) => updateAnnotation(id, { comment, referenceImages })}
            onResolve={resolveAnnotation}
            onDelete={(id) => {
              removeAnnotation(id)
              setActiveBubbleId(null)
            }}
            onClose={() => setActiveBubbleId(null)}
          />
        )
      })()}
    </div>,
    portalContainer || document.body,
  )

  return overlayPortal
}
