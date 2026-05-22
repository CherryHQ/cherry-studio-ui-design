/**
 * React Fiber walker — extract the nearest component name from a DOM element.
 * Same algorithm as the browser-extension version. Useful when the host app
 * is a React-based Electron renderer; degrades gracefully for non-React apps.
 */

interface FiberNode {
  type?: { displayName?: string; name?: string } | string | null
  elementType?: { displayName?: string; name?: string } | string | null
  stateNode?: HTMLElement | null
  return?: FiberNode | null
  memoizedProps?: Record<string, unknown> | null
  _debugSource?: { fileName?: string; lineNumber?: number } | null
}

function getFiber(el: HTMLElement): FiberNode | null {
  const key = Object.keys(el).find(
    (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"),
  )
  if (!key) return null
  return (el as unknown as Record<string, FiberNode>)[key] || null
}

function getTypeName(fiber: FiberNode): string | null {
  const t = fiber.type ?? fiber.elementType
  if (!t || typeof t === "string") return null
  return t.displayName || t.name || null
}

export function getReactSourceHint(el: HTMLElement): string {
  const fiber = getFiber(el)
  if (!fiber) return ""
  const components: string[] = []
  let current: FiberNode | null = fiber
  let source: { fileName: string; lineNumber: number } | undefined

  while (current && components.length < 6) {
    const name = getTypeName(current)
    if (name && !components.includes(name)) components.push(name)
    if (!source && current._debugSource?.fileName) {
      source = {
        fileName: current._debugSource.fileName,
        lineNumber: current._debugSource.lineNumber || 0,
      }
    }
    current = current.return ?? null
  }

  let hint = components.reverse().join(" › ")
  if (source) {
    const file = source.fileName.replace(/^.*?\/(src|app|components|pages)\//, "$1/")
    hint += `  (${file}:${source.lineNumber})`
  }
  return hint
}
