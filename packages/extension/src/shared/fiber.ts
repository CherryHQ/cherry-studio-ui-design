/**
 * React Fiber walker — extracts the nearest component name from a DOM element.
 *
 * On a third-party site we don't have the source file path, but if the page is
 * built with React, the fiber tree carries enough info to reconstruct a useful
 * component breadcrumb that AI can use to locate the issue.
 */

interface FiberNode {
  type?: { displayName?: string; name?: string } | string | null
  elementType?: { displayName?: string; name?: string } | string | null
  stateNode?: HTMLElement | null
  return?: FiberNode | null
  memoizedProps?: Record<string, unknown> | null
  _debugSource?: { fileName?: string; lineNumber?: number } | null
  _debugOwner?: FiberNode | null
}

/** Find the React fiber attached to a DOM element (works with React 16+) */
function getFiber(el: HTMLElement): FiberNode | null {
  const key = Object.keys(el).find(
    (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"),
  )
  if (!key) return null
  return (el as unknown as Record<string, FiberNode>)[key] || null
}

/** Get a readable name from a fiber's type (component name or HTML tag) */
function getTypeName(fiber: FiberNode): string | null {
  const t = fiber.type ?? fiber.elementType
  if (!t) return null
  if (typeof t === "string") return null // host component (div, span, etc.)
  return t.displayName || t.name || null
}

/**
 * Walk up the fiber tree from a DOM element and collect component ancestors.
 * Returns up to `maxDepth` components closest to the element.
 */
export function getComponentBreadcrumb(el: HTMLElement, maxDepth = 6): string[] {
  const fiber = getFiber(el)
  if (!fiber) return []

  const components: string[] = []
  let current: FiberNode | null = fiber
  while (current && components.length < maxDepth) {
    const name = getTypeName(current)
    if (name && !components.includes(name)) {
      components.push(name)
    }
    current = current.return ?? null
  }
  return components.reverse() // outermost → innermost
}

/** Get the immediate component owning this element, plus key props if any */
export interface ComponentInfo {
  name: string
  /** _debugSource only present in dev builds */
  source?: { fileName: string; lineNumber: number }
  /** Subset of stable, serializable props */
  props?: Record<string, string>
}

export function getOwnerComponent(el: HTMLElement): ComponentInfo | null {
  const fiber = getFiber(el)
  if (!fiber) return null

  let current: FiberNode | null = fiber
  while (current) {
    const name = getTypeName(current)
    if (name) {
      const info: ComponentInfo = { name }
      if (current._debugSource?.fileName) {
        info.source = {
          fileName: current._debugSource.fileName,
          lineNumber: current._debugSource.lineNumber || 0,
        }
      }
      // Extract simple, serializable props (strings, numbers, booleans only)
      const props = current.memoizedProps
      if (props) {
        const safeProps: Record<string, string> = {}
        for (const [k, v] of Object.entries(props)) {
          if (k === "children") continue
          if (typeof v === "string") safeProps[k] = v
          else if (typeof v === "number" || typeof v === "boolean") safeProps[k] = String(v)
          if (Object.keys(safeProps).length >= 5) break
        }
        if (Object.keys(safeProps).length > 0) info.props = safeProps
      }
      return info
    }
    current = current.return ?? null
  }
  return null
}

/** Build a source hint string from React fiber info, suitable for AI prompts */
export function getReactSourceHint(el: HTMLElement): string {
  const owner = getOwnerComponent(el)
  if (!owner) return ""

  const breadcrumb = getComponentBreadcrumb(el, 4)
  let hint = breadcrumb.length > 0 ? breadcrumb.join(" › ") : owner.name

  if (owner.source?.fileName) {
    // Strip protocol and node_modules noise
    const file = owner.source.fileName
      .replace(/^.*?\/(src|app|components|pages)\//, "$1/")
      .replace(/\?.*$/, "")
    hint += `  (${file}:${owner.source.lineNumber})`
  }
  return hint
}
