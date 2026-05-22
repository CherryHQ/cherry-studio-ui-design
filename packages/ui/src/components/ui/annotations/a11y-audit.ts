/**
 * Lightweight accessibility audit.
 *
 * Walks the live DOM and surfaces the four highest-leverage issues that an
 * everyday designer / engineer can act on without specialized tooling:
 *
 *   1. Color contrast below WCAG AA  (4.5:1 normal text, 3:1 large text)
 *   2. <img> with no alt text
 *   3. Buttons / links with no accessible name
 *   4. Form fields with no associated label
 *
 * Returns a plain `A11yIssue[]` — the caller decides whether to render them
 * as a panel, auto-create annotations, or pipe into an export. We deliberately
 * avoid pulling axe-core (~500 KB) so this stays embeddable.
 */

export type A11yIssueKind =
  | "contrast"
  | "missing-alt"
  | "no-accessible-name"
  | "no-form-label"

export interface A11yIssue {
  kind: A11yIssueKind
  /** A CSS selector pointing at the offending element */
  selector: string
  /** A human label like `button.btn.primary "Save"` */
  elementLabel: string
  /** One-line plain-language description of the problem */
  message: string
  /** Severity hint — surfaces in the UI as a colored badge */
  severity: "error" | "warning"
  /** For contrast issues: the actual measured ratio (e.g. 2.84) */
  contrast?: number
  /** For contrast issues: the colors involved */
  colors?: { foreground: string; background: string }
}

const MAX_ELEMENTS = 5000

export function runA11yAudit(root: Element = document.body): A11yIssue[] {
  const issues: A11yIssue[] = []
  let scanned = 0

  const all = root.querySelectorAll("*")
  for (let i = 0; i < all.length && scanned < MAX_ELEMENTS; i++) {
    const el = all[i] as HTMLElement
    if (el.closest("[data-annotation-ui]")) continue
    const tag = el.tagName
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "META" || tag === "LINK" || tag === "HEAD") continue
    scanned++

    checkAlt(el, issues)
    checkAccessibleName(el, issues)
    checkFormLabel(el, issues)
    checkContrast(el, issues)
  }

  return issues
}

// ─── 1. <img> alt ──────────────────────────────────────────────────────────

function checkAlt(el: HTMLElement, issues: A11yIssue[]): void {
  if (el.tagName !== "IMG") return
  const alt = el.getAttribute("alt")
  if (alt !== null) return // empty alt="" is legal (decorative)
  const ariaLabel = el.getAttribute("aria-label")
  const ariaLabelledBy = el.getAttribute("aria-labelledby")
  if (ariaLabel || ariaLabelledBy) return
  if (el.getAttribute("role") === "presentation") return

  issues.push({
    kind: "missing-alt",
    selector: shortSelector(el),
    elementLabel: labelOf(el),
    message: "Image has no alt text. Provide alt='' for decorative images, or describe the image for screen readers.",
    severity: "error",
  })
}

// ─── 2. Buttons / links with no accessible name ────────────────────────────

function checkAccessibleName(el: HTMLElement, issues: A11yIssue[]): void {
  const tag = el.tagName
  const role = el.getAttribute("role")
  const isInteractive =
    tag === "BUTTON" ||
    tag === "A" ||
    role === "button" ||
    role === "link"
  if (!isInteractive) return

  const text = el.textContent?.trim()
  if (text) return
  if (el.getAttribute("aria-label")) return
  if (el.getAttribute("aria-labelledby")) return
  if (el.getAttribute("title")) return
  // <a> with image child that has alt = name
  const hasNamedImg = Array.from(el.querySelectorAll("img")).some((img) => img.getAttribute("alt"))
  if (hasNamedImg) return

  issues.push({
    kind: "no-accessible-name",
    selector: shortSelector(el),
    elementLabel: labelOf(el),
    message: `${tag === "A" ? "Link" : "Button"} has no accessible name. Add visible text, aria-label, or a labelled child element.`,
    severity: "error",
  })
}

// ─── 3. Form labels ────────────────────────────────────────────────────────

function checkFormLabel(el: HTMLElement, issues: A11yIssue[]): void {
  const tag = el.tagName
  if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") return
  const type = (el as HTMLInputElement).type
  if (type === "hidden" || type === "submit" || type === "button" || type === "image") return

  if (el.getAttribute("aria-label")) return
  if (el.getAttribute("aria-labelledby")) return
  if (el.getAttribute("title")) return
  if (el.getAttribute("placeholder") && type !== "text") {
    // placeholder isn't a label, but for non-text inputs it's at least *something*
  }
  const id = el.id
  if (id && document.querySelector(`label[for="${cssEscape(id)}"]`)) return
  if (el.closest("label")) return

  issues.push({
    kind: "no-form-label",
    selector: shortSelector(el),
    elementLabel: labelOf(el),
    message: `Form field has no associated <label>. Wrap in <label> or use aria-label / aria-labelledby.`,
    severity: "error",
  })
}

// ─── 4. Color contrast ─────────────────────────────────────────────────────

function checkContrast(el: HTMLElement, issues: A11yIssue[]): void {
  const text = el.textContent?.trim()
  if (!text) return
  // Only check leaf-ish elements (avoid double-counting parents whose textContent
  // is just descendants' text)
  const hasElementChildren = Array.from(el.children).some(
    (c) => c.tagName !== "BR" && c.tagName !== "WBR" && (c as HTMLElement).textContent?.trim(),
  )
  if (hasElementChildren) return

  const cs = window.getComputedStyle(el)
  const fg = parseColor(cs.color)
  if (!fg || fg.a === 0) return
  const bg = effectiveBackground(el)
  if (!bg) return

  const ratio = contrastRatio(fg, bg)
  if (ratio == null) return

  const sizePx = parseFloat(cs.fontSize) || 16
  const weight = parseInt(cs.fontWeight, 10) || 400
  const isLarge = sizePx >= 24 || (sizePx >= 18.66 && weight >= 700)
  const required = isLarge ? 3 : 4.5

  if (ratio < required) {
    issues.push({
      kind: "contrast",
      selector: shortSelector(el),
      elementLabel: labelOf(el),
      message: `Text contrast ${ratio.toFixed(2)}:1 is below WCAG AA ${required}:1 (${
        isLarge ? "large text" : "normal text"
      }). Foreground ${rgbStr(fg)} on background ${rgbStr(bg)}.`,
      severity: "warning",
      contrast: Math.round(ratio * 100) / 100,
      colors: { foreground: rgbStr(fg), background: rgbStr(bg) },
    })
  }
}

// ─── color math ────────────────────────────────────────────────────────────

interface RGBA { r: number; g: number; b: number; a: number }

function parseColor(input: string): RGBA | null {
  // matches rgb() / rgba() — getComputedStyle normalizes everything to this
  const m = input.match(/^rgba?\(([^)]+)\)$/)
  if (!m) return null
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()))
  if (parts.length < 3) return null
  return {
    r: Math.max(0, Math.min(255, parts[0])),
    g: Math.max(0, Math.min(255, parts[1])),
    b: Math.max(0, Math.min(255, parts[2])),
    a: parts.length >= 4 ? parts[3] : 1,
  }
}

function rgbStr(c: RGBA): string {
  return c.a === 1 ? `rgb(${c.r}, ${c.g}, ${c.b})` : `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`
}

/** Walk up from element to find the first non-transparent background color. */
function effectiveBackground(el: HTMLElement): RGBA | null {
  let current: HTMLElement | null = el
  while (current) {
    const cs = window.getComputedStyle(current)
    const c = parseColor(cs.backgroundColor)
    if (c && c.a > 0) {
      // If partially transparent, blend with parent recursively (best-effort)
      if (c.a < 1 && current.parentElement) {
        const parent = effectiveBackground(current.parentElement) || { r: 255, g: 255, b: 255, a: 1 }
        return blendOver(c, parent)
      }
      return c
    }
    current = current.parentElement
  }
  // Default browser background
  return { r: 255, g: 255, b: 255, a: 1 }
}

function blendOver(top: RGBA, bottom: RGBA): RGBA {
  const a = top.a + bottom.a * (1 - top.a)
  const r = (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a
  const g = (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a
  const b = (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a }
}

function relativeLuminance(c: RGBA): number {
  const lin = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
}

function contrastRatio(a: RGBA, b: RGBA): number | null {
  if (a.a === 0 || b.a === 0) return null
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// ─── label / selector helpers ──────────────────────────────────────────────

function labelOf(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const text = (el.textContent || "").trim().slice(0, 40)
  const cls = Array.from(el.classList)
    .filter((c) => !c.startsWith("_") && c.length < 30)
    .slice(0, 2)
    .join(".")
  let label = tag
  if (cls) label += "." + cls
  if (text) label += ` "${text}${(el.textContent || "").trim().length > 40 ? "…" : ""}"`
  return label
}

function shortSelector(el: HTMLElement): string {
  if (el.id) return `#${cssEscape(el.id)}`
  const tag = el.tagName.toLowerCase()
  const classes = Array.from(el.classList)
    .filter((c) => !c.startsWith("_") && c.length < 30)
    .slice(0, 2)
    .map(cssEscape)
    .join(".")
  if (!classes) return tag
  const sel = `${tag}.${classes}`
  // If unique within doc, return as-is; else fall back to nth-of-type
  if (document.querySelectorAll(sel).length === 1) return sel
  const parent = el.parentElement
  if (parent) {
    const sameTag = Array.from(parent.children).filter((c) => c.tagName === el.tagName)
    const idx = sameTag.indexOf(el) + 1
    return `${sel}:nth-of-type(${idx})`
  }
  return sel
}

function cssEscape(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)
}
