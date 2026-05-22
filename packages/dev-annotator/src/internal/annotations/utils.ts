import type { Annotation, CapturedStyles } from "./types"

// ─── Selector Generation ────────────────────────────────────────────────────

function getNthOfTypeIndex(el: Element): number {
  const parent = el.parentElement
  if (!parent) return 0
  const tag = el.tagName
  let idx = 0
  for (const child of Array.from(parent.children)) {
    if (child.tagName === tag) {
      if (child === el) return idx
      idx++
    }
  }
  return idx
}

/**
 * Pick up to 3 "distinguishing" CSS classes for a selector step.
 * Prefers semantic classes over Tailwind utilities, but includes
 * utilities as fallback since they help locate elements in this codebase.
 */
function pickSelectorClasses(el: Element): string[] {
  const all = Array.from(el.classList).filter(
    (c) => !c.startsWith("_") && !c.startsWith("css-") && c.length < 40,
  )
  if (all.length === 0) return []

  // Semantic classes first (non-Tailwind-looking)
  const semantic = all.filter(
    (c) => !/^(flex|grid|min-|max-|w-|h-|p[xytrbl]?-|m[xytrbl]?-|gap-|text-|bg-|border-|rounded-|overflow-|relative|absolute|fixed|hidden|block|inline|items-|justify-|self-|space-|transition|duration|ease|animate|opacity|z-|cursor-|pointer-|select-|sr-|ring-|shadow-|outline-|truncate|whitespace-|break-|leading-|tracking-|font-)/.test(c),
  )
  if (semantic.length > 0) return semantic.slice(0, 3)

  // Fall back to Tailwind utilities — still useful for locating
  return all.slice(0, 3)
}

function getStepSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`

  const dataId = el.getAttribute("data-annotation-id")
  if (dataId) return `[data-annotation-id="${CSS.escape(dataId)}"]`

  // Try role attribute
  const role = el.getAttribute("role")
  if (role) return `[role="${CSS.escape(role)}"]`

  const tag = el.tagName.toLowerCase()
  const classes = pickSelectorClasses(el)

  if (classes.length > 0) {
    // Use tag + classes as a more stable selector
    const classSelector = `${tag}.${classes.map(CSS.escape).join(".")}`
    // Check if this is unique among siblings
    const parent = el.parentElement
    if (parent) {
      const matches = parent.querySelectorAll(`:scope > ${classSelector}`)
      if (matches.length === 1) return classSelector
      // If not unique, add nth-of-type
      const idx = getNthOfTypeIndex(el)
      return `${classSelector}:nth-of-type(${idx + 1})`
    }
    return classSelector
  }

  const nth = getNthOfTypeIndex(el)
  return `${tag}:nth-of-type(${nth + 1})`
}

/**
 * Generate a CSS selector path from the element up to (but not including) the boundary.
 */
export function generateSelector(
  element: HTMLElement,
  boundary?: HTMLElement | null,
): string {
  const parts: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== boundary && current !== document.body) {
    const step = getStepSelector(current)
    parts.unshift(step)
    if (current.id) break
    current = current.parentElement
  }

  return parts.join(" > ")
}

/**
 * Generate a human-readable label for the element.
 */
export function generateElementLabel(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const classes = Array.from(el.classList)
    .filter((c) => !c.startsWith("_") && c.length < 30)
    .slice(0, 3)
    .join(".")
  const text = (el.textContent || "").trim().slice(0, 40)
  const parts = [tag]
  if (classes) parts[0] += `.${classes}`
  if (text) parts.push(`"${text}${(el.textContent || "").trim().length > 40 ? "…" : ""}"`)
  return parts.join(" ")
}

// ─── Breadcrumb Generation ──────────────────────────────────────────────────

/**
 * Generate a readable component ancestry breadcrumb.
 * Walks up the DOM, collecting every node with an identifying feature.
 * Includes Tailwind classes since they help grep for elements in code.
 */
export function generateBreadcrumb(
  el: HTMLElement,
  boundary?: HTMLElement | null,
): string {
  const crumbs: string[] = []
  let current: HTMLElement | null = el

  while (current && current !== boundary && current !== document.body) {
    const tag = current.tagName.toLowerCase()
    const id = current.id
    const role = current.getAttribute("role")
    const dataComponent = current.getAttribute("data-component")
    const ariaLabel = current.getAttribute("aria-label")
    const classes = Array.from(current.classList)
      .filter((c) => !c.startsWith("_") && !c.startsWith("css-") && c.length < 40)
      .slice(0, 4)

    let label = ""
    if (id) {
      label = `#${id}`
    } else if (dataComponent) {
      label = dataComponent
    } else if (tag !== "div" || classes.length > 0 || role || ariaLabel) {
      label = tag
      if (classes.length > 0) {
        label += `.${classes.join(".")}`
      }
      if (role) label += `[role=${role}]`
      if (ariaLabel) label += `[aria-label="${ariaLabel}"]`
    }

    if (label) {
      crumbs.unshift(label)
    }

    current = current.parentElement
  }

  // Keep last 8 levels for better context
  if (crumbs.length > 8) {
    return "… > " + crumbs.slice(-8).join(" > ")
  }
  return crumbs.join(" > ")
}

// ─── Computed Styles Capture ────────────────────────────────────────────────

const STYLE_KEYS: (keyof CapturedStyles)[] = [
  "fontSize",
  "fontWeight",
  "color",
  "backgroundColor",
  "padding",
  "margin",
  "borderRadius",
  "border",
  "gap",
  "display",
  "width",
  "height",
  "lineHeight",
  "opacity",
]

export function captureComputedStyles(el: HTMLElement): CapturedStyles {
  const cs = window.getComputedStyle(el)
  const result = {} as CapturedStyles
  for (const key of STYLE_KEYS) {
    result[key] = cs.getPropertyValue(
      // Convert camelCase to kebab-case for getPropertyValue
      key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
    )
  }
  return result
}

// ─── Source File Hint ───────────────────────────────────────────────────────

/**
 * Map page identifiers to probable source file paths.
 * This helps Claude locate the right file to edit.
 */
const ROOT_PAGE_MAP: Record<string, string> = {
  chat: "src/features/chat/ChatPage.tsx",
  agent: "src/features/agent/run/AgentRunPage.tsx",
  assistant: "src/app/components/assistant/AssistantRunPage.tsx",
  translate: "src/features/translate/TranslatePage.tsx",
  note: "src/features/note/NotePage.tsx",
  code: "src/features/codetool/CodeToolPage.tsx",
  knowledge: "src/features/knowledge/KnowledgePage.tsx",
  miniapps: "src/features/miniapp/MiniAppsPage.tsx",
  explore: "src/features/explore/ExplorePage.tsx",
  library: "src/features/library/LibraryPage.tsx",
  painting: "src/features/painting/ImagePage.tsx",
  file: "src/features/file/FilePage.tsx",
  extensions: "src/features/extensions/ExtensionsPage.tsx",
  settings: "src/features/settings/SettingsPage.tsx",
}

/**
 * Try to detect sub-component from the element's DOM context.
 * Walks up to find recognizable parent patterns.
 */
/** Word-boundary patterns for sub-component detection */
const SUB_COMPONENT_PATTERNS: [RegExp, string][] = [
  [/\bhistory[-_]?sidebar\b|\bHistorySidebar\b/i, "HistorySidebar"],
  [/\bsidebar\b|\bSidebar\b/, "Sidebar"],
  [/\btopic[-_]?list\b|\bTopicList\b/i, "TopicList"],
  [/\bprompt[-_]?input\b|\bPromptInput\b/i, "PromptInput"],
  [/\bchat[-_]?input\b|\bChatInput\b/i, "ChatInput"],
  [/\bmessage[-_]?list\b|\bMessageList\b/i, "MessageList"],
  [/\bchat[-_]?message\b|\bChatMessage\b/i, "ChatMessage"],
  [/\bcomposer\b|\bComposer\b/, "Composer"],
  [/\btoolbar\b|\bToolbar\b/, "Toolbar"],
  [/\bconfig[-_]?panel\b|\bConfigPanel\b/i, "ConfigPanel"],
  [/\bpicker[-_]?panel\b|\bPickerPanel\b/i, "PickerPanel"],
  [/\bmodal\b|\bModal\b|\bdialog\b|\bDialog\b/, "Modal/Dialog"],
]

function detectSubComponent(el: HTMLElement): string | null {
  let current: HTMLElement | null = el
  const seen: string[] = []

  while (current && seen.length < 15) {
    // Check data-component attribute first (most reliable)
    const dc = current.getAttribute("data-component")
    if (dc) return dc

    // Check role
    const role = current.getAttribute("role")
    if (role === "dialog") return "Dialog"
    if (role === "navigation") return "Navigation"

    // Match against class names with word-boundary patterns
    const classes = current.getAttribute("class") || ""
    if (classes) {
      for (const [pattern, label] of SUB_COMPONENT_PATTERNS) {
        if (pattern.test(classes)) return label
      }
    }

    seen.push(current.tagName)
    current = current.parentElement
  }

  return null
}

export function getSourceHint(page: string, app: string, el?: HTMLElement): string {
  if (app === "playground") {
    return `packages/playground/src/demos/${page}.tsx`
  }
  const base = ROOT_PAGE_MAP[page] || `src/features/${page}/`
  if (!el) return base

  const sub = detectSubComponent(el)
  if (sub) return `${base} → ${sub}`
  return base
}

// ─── localStorage Helpers ───────────────────────────────────────────────────

export function loadAnnotations(storageKey: string): Annotation[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    return JSON.parse(raw) as Annotation[]
  } catch {
    return []
  }
}

export function saveAnnotations(
  storageKey: string,
  annotations: Annotation[],
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(annotations))
  } catch {
    // storage full — silently ignore
  }
}

// ─── Export Helpers ─────────────────────────────────────────────────────────

/**
 * Generate a Claude-ready action prompt from annotations.
 * This can be directly fed to Claude to execute fixes.
 */
function generateActionPrompt(annotations: Annotation[], app: string): string {
  const unresolved = annotations.filter((a) => !a.resolved)
  if (unresolved.length === 0) return "All annotations resolved. No action needed."

  const byPage = new Map<string, Annotation[]>()
  for (const ann of unresolved) {
    const list = byPage.get(ann.page) || []
    list.push(ann)
    byPage.set(ann.page, list)
  }

  const lines: string[] = [
    `Please fix the following ${unresolved.length} UI issues in the ${app} app:`,
    "",
  ]

  for (const [page, anns] of byPage) {
    lines.push(`## Page: ${page}`)
    lines.push("")

    for (let i = 0; i < anns.length; i++) {
      const ann = anns[i]
      lines.push(`### ${i + 1}. [${ann.category}] ${ann.comment}`)
      lines.push(`- **File**: \`${ann.sourceHint}\``)
      lines.push(`- **Element**: \`${ann.elementLabel}\``)
      lines.push(`- **Breadcrumb**: ${ann.breadcrumb}`)
      if (ann.className) {
        lines.push(`- **className**: \`${ann.className}\``)
      }
      lines.push(`- **Size**: ${ann.rect.width}×${ann.rect.height}px`)

      // Include relevant styles based on category
      if (ann.computedStyles) {
        const cs = ann.computedStyles
        if (ann.category === "style") {
          lines.push(`- **Current styles**: fontSize=${cs.fontSize}, color=${cs.color}, bg=${cs.backgroundColor}, padding=${cs.padding}, borderRadius=${cs.borderRadius}`)
        } else if (ann.category === "layout") {
          lines.push(`- **Current layout**: display=${cs.display}, width=${cs.width}, height=${cs.height}, gap=${cs.gap}, margin=${cs.margin}, padding=${cs.padding}`)
        } else {
          lines.push(`- **Key styles**: fontSize=${cs.fontSize}, color=${cs.color}, display=${cs.display}`)
        }
      }
      lines.push("")
    }
  }

  lines.push("---")
  lines.push("For each issue, locate the component by searching for the className, read the source file, and apply the fix. Verify visually after each change.")

  return lines.join("\n")
}

export function formatExportJSON(
  annotations: Annotation[],
  app = "cherry-studio",
): string {
  // Category priority order for sorting
  const categoryOrder: Record<string, number> = { bug: 0, style: 1, layout: 2, interaction: 3, content: 4, other: 5 }

  // Sort: unresolved first, then by category priority, then by page
  const sorted = [...annotations].sort((a, b) => {
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1
    const catA = categoryOrder[a.category] ?? 5
    const catB = categoryOrder[b.category] ?? 5
    if (catA !== catB) return catA - catB
    return a.page.localeCompare(b.page)
  })

  return JSON.stringify(
    {
      version: 3,
      exportedAt: new Date().toISOString(),
      app,
      totalCount: annotations.length,
      unresolvedCount: annotations.filter((a) => !a.resolved).length,
      pages: [...new Set(annotations.map((a) => a.page))],
      categorySummary: Object.fromEntries(
        Object.entries(
          annotations
            .filter((a) => !a.resolved)
            .reduce((acc, a) => {
              acc[a.category] = (acc[a.category] || 0) + 1
              return acc
            }, {} as Record<string, number>),
        ).sort(([, a], [, b]) => b - a),
      ),
      actionPrompt: generateActionPrompt(annotations, app),
      annotations: sorted,
    },
    null,
    2,
  )
}

export function downloadJSON(content: string, filename = "annotations.json"): void {
  const blob = new Blob([content], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function copyJSON(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch {
    return false
  }
}

// ─── Single Annotation Prompt ──────────────────────────────────────────────

export function generateSingleAnnotationPrompt(ann: Annotation): string {
  const lines: string[] = [
    `Please fix this UI issue:`,
    ``,
    `## [${ann.category}] ${ann.comment}`,
    `- **Page**: ${ann.page}`,
    `- **File**: \`${ann.sourceHint}\``,
    `- **Element**: \`${ann.elementLabel}\``,
    `- **Breadcrumb**: ${ann.breadcrumb}`,
  ]
  if (ann.className) lines.push(`- **className**: \`${ann.className}\``)
  lines.push(`- **Size**: ${ann.rect.width}×${ann.rect.height}px`)

  if (ann.computedStyles) {
    const cs = ann.computedStyles
    if (ann.category === "style") {
      lines.push(`- **Current styles**: fontSize=${cs.fontSize}, color=${cs.color}, bg=${cs.backgroundColor}, padding=${cs.padding}, borderRadius=${cs.borderRadius}, fontWeight=${cs.fontWeight}, lineHeight=${cs.lineHeight}`)
    } else if (ann.category === "layout") {
      lines.push(`- **Current layout**: display=${cs.display}, width=${cs.width}, height=${cs.height}, gap=${cs.gap}, margin=${cs.margin}, padding=${cs.padding}`)
    } else {
      lines.push(`- **Key styles**: fontSize=${cs.fontSize}, color=${cs.color}, display=${cs.display}, padding=${cs.padding}`)
    }
  }

  lines.push(``, `Locate the component by searching for the className, read the source file, and apply the fix.`)
  return lines.join("\n")
}

// ─── Style Diff ───────────────────────────────────────────────────────────

export interface StyleDiffEntry {
  key: string
  saved: string
  current: string
  changed: boolean
}

export function computeStyleDiff(
  savedStyles: CapturedStyles,
  currentEl: HTMLElement | null,
): StyleDiffEntry[] {
  const current = currentEl ? captureComputedStyles(currentEl) : null
  return Object.keys(savedStyles).map((key) => {
    const k = key as keyof CapturedStyles
    const savedVal = savedStyles[k]
    const currentVal = current ? current[k] : "—"
    return {
      key,
      saved: savedVal,
      current: currentVal,
      changed: current ? savedVal !== currentVal : false,
    }
  })
}

// ─── Import ───────────────────────────────────────────────────────────────

export function parseImportJSON(json: string): Annotation[] | null {
  try {
    const data = JSON.parse(json)
    // Support both raw array and export format (with .annotations field)
    const arr: unknown[] = Array.isArray(data) ? data : data?.annotations
    if (!Array.isArray(arr)) return null
    // Validate each annotation has required fields
    return arr.filter(
      (a: any) => a && typeof a.id === "string" && typeof a.comment === "string" && typeof a.page === "string",
    ) as Annotation[]
  } catch {
    return null
  }
}

// ─── ID Generation ──────────────────────────────────────────────────────────

let counter = 0
export function generateId(): string {
  counter++
  return `ann_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 6)}`
}
