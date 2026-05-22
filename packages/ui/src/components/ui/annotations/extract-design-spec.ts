/**
 * Page → Design Spec extractor.
 *
 * Walks the live DOM and harvests every CSS value the page actually uses for
 * a small set of "design token" properties (color, typography, spacing,
 * radii, shadows, plus any CSS custom properties defined at the root). The
 * result is grouped + frequency-counted so the dominant palette / type ramp
 * / spacing scale surface naturally — irrelevant one-off values fall to the
 * tail. Output works as input to AI ("rebuild this design system") or as a
 * starting point for a Tailwind / Figma tokens config.
 */

export interface SpecValue<T = string> {
  value: T
  count: number
}

export interface DesignSpec {
  url: string
  origin: string
  title: string
  capturedAt: string
  /** Total elements scanned (we cap to keep big pages snappy) */
  scannedElements: number

  colors: {
    background: SpecValue[]
    text: SpecValue[]
    border: SpecValue[]
  }

  typography: {
    fontFamilies: SpecValue[]
    fontSizes: SpecValue<number>[]   // px
    fontWeights: SpecValue[]
    lineHeights: SpecValue[]
  }

  spacing: {
    paddings: SpecValue<number>[]    // px
    margins: SpecValue<number>[]     // px
    gaps: SpecValue<number>[]        // px
    /** Inferred base unit (commonly 4 or 8) — `null` when no clear pattern */
    inferredBaseUnit: number | null
  }

  borders: {
    widths: SpecValue<number>[]      // px
    radii: SpecValue<number>[]       // px
  }

  shadows: SpecValue[]

  /** All `--*` custom properties defined on `:root` (the document element) */
  cssVariables: Record<string, string>
}

const MAX_ELEMENTS = 5000        // cap to keep extraction under ~200ms
const TOP_N = 30                 // keep top-N values per bucket

const EXCLUDED_BG = new Set(["rgba(0, 0, 0, 0)", "transparent"])
const EXCLUDED_BORDER = new Set([
  "0px",
  "rgba(0, 0, 0, 0)",
  "rgb(0, 0, 0)",  // black often the default unset border-color
])

/**
 * Run the extraction. Synchronous; takes ~50-200ms on typical pages.
 *
 * @param root  Element to scan beneath. Defaults to `document.body`.
 *              Pass a sub-tree to scope to one component.
 */
export function extractDesignSpec(root: Element = document.body): DesignSpec {
  const buckets = createBuckets()
  let scanned = 0

  const all = root.querySelectorAll("*")
  for (let i = 0; i < all.length && scanned < MAX_ELEMENTS; i++) {
    const el = all[i] as HTMLElement
    // Skip our own annotation UI so the spec describes the host, not us
    if (el.closest("[data-annotation-ui]")) continue
    // Skip <script>, <style>, and other non-rendered nodes
    const tag = el.tagName
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "META" || tag === "LINK") continue

    const cs = window.getComputedStyle(el)
    scanned++

    // ─── Colors ────────────────────────────────────────────────────────
    const bg = cs.backgroundColor
    if (bg && !EXCLUDED_BG.has(bg)) inc(buckets.bg, bg)
    if (el.textContent?.trim()) inc(buckets.text, cs.color)
    // Border color only counts if there's a real border to apply it to
    const borderTopWidth = parseFloat(cs.borderTopWidth) || 0
    if (borderTopWidth > 0 && !EXCLUDED_BORDER.has(cs.borderTopColor)) {
      inc(buckets.border, cs.borderTopColor)
    }

    // ─── Typography ────────────────────────────────────────────────────
    if (el.textContent?.trim()) {
      // Take the first family in the stack — that's the primary
      const family = cs.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "")
      if (family) inc(buckets.font, family)
      const sizePx = parseFloat(cs.fontSize)
      if (sizePx > 0) inc(buckets.size, Math.round(sizePx))
      inc(buckets.weight, String(cs.fontWeight))
      const lh = cs.lineHeight
      if (lh && lh !== "normal") inc(buckets.lineHeight, lh)
    }

    // ─── Spacing ───────────────────────────────────────────────────────
    for (const side of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] as const) {
      const v = parseFloat(cs[side])
      if (v > 0) inc(buckets.padding, v)
    }
    for (const side of ["marginTop", "marginRight", "marginBottom", "marginLeft"] as const) {
      const v = parseFloat(cs[side])
      if (v > 0) inc(buckets.margin, v)
    }
    const gap = parseFloat(cs.gap || "0")
    if (gap > 0) inc(buckets.gap, gap)

    // ─── Borders ───────────────────────────────────────────────────────
    if (borderTopWidth > 0) inc(buckets.borderWidth, borderTopWidth)
    for (const corner of [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius",
    ] as const) {
      const v = parseFloat(cs[corner])
      if (v > 0) inc(buckets.radius, Math.round(v))
    }

    // ─── Shadows ───────────────────────────────────────────────────────
    if (cs.boxShadow && cs.boxShadow !== "none") inc(buckets.shadow, cs.boxShadow)
  }

  return {
    url: window.location.href,
    origin: window.location.origin,
    title: document.title,
    capturedAt: new Date().toISOString(),
    scannedElements: scanned,

    colors: {
      background: top(buckets.bg),
      text: top(buckets.text),
      border: top(buckets.border),
    },
    typography: {
      fontFamilies: top(buckets.font),
      fontSizes: topNumeric(buckets.size),
      fontWeights: top(buckets.weight),
      lineHeights: top(buckets.lineHeight),
    },
    spacing: {
      paddings: topNumeric(buckets.padding),
      margins: topNumeric(buckets.margin),
      gaps: topNumeric(buckets.gap),
      inferredBaseUnit: inferBaseUnit([
        ...buckets.padding.entries(),
        ...buckets.margin.entries(),
        ...buckets.gap.entries(),
      ]),
    },
    borders: {
      widths: topNumeric(buckets.borderWidth),
      radii: topNumeric(buckets.radius),
    },
    shadows: top(buckets.shadow),
    cssVariables: extractCssVariables(),
  }
}

// ─── Format helpers ─────────────────────────────────────────────────────

/** Pretty-print a DesignSpec as Markdown — useful as an AI prompt or quick read. */
export function formatDesignSpecMarkdown(spec: DesignSpec): string {
  const lines: string[] = []
  lines.push(`# Design Spec — ${spec.title || spec.origin}`)
  lines.push(``)
  lines.push(`*Captured from \`${spec.url}\` on ${new Date(spec.capturedAt).toLocaleString()} · ${spec.scannedElements} elements scanned*`)
  lines.push(``)

  lines.push(`## Colors`)
  lines.push(``)
  lines.push(`### Backgrounds (top ${Math.min(10, spec.colors.background.length)})`)
  for (const c of spec.colors.background.slice(0, 10)) lines.push(`- \`${c.value}\` × ${c.count}`)
  lines.push(``)
  lines.push(`### Text (top ${Math.min(10, spec.colors.text.length)})`)
  for (const c of spec.colors.text.slice(0, 10)) lines.push(`- \`${c.value}\` × ${c.count}`)
  lines.push(``)
  if (spec.colors.border.length > 0) {
    lines.push(`### Borders (top ${Math.min(10, spec.colors.border.length)})`)
    for (const c of spec.colors.border.slice(0, 10)) lines.push(`- \`${c.value}\` × ${c.count}`)
    lines.push(``)
  }

  lines.push(`## Typography`)
  lines.push(``)
  lines.push(`**Fonts:** ${spec.typography.fontFamilies.slice(0, 5).map((f) => `${f.value} (×${f.count})`).join(", ") || "—"}`)
  lines.push(``)
  lines.push(`**Type ramp:** ${spec.typography.fontSizes.slice(0, 12).map((s) => `${s.value}px (×${s.count})`).join(" · ") || "—"}`)
  lines.push(``)
  lines.push(`**Weights:** ${spec.typography.fontWeights.slice(0, 8).map((w) => `${w.value} (×${w.count})`).join(", ") || "—"}`)
  lines.push(``)

  lines.push(`## Spacing`)
  lines.push(``)
  if (spec.spacing.inferredBaseUnit) {
    lines.push(`**Inferred base unit:** ${spec.spacing.inferredBaseUnit}px`)
    lines.push(``)
  }
  lines.push(`**Paddings:** ${formatPxList(spec.spacing.paddings)}`)
  lines.push(`**Margins:** ${formatPxList(spec.spacing.margins)}`)
  lines.push(`**Gaps:** ${formatPxList(spec.spacing.gaps)}`)
  lines.push(``)

  lines.push(`## Shape`)
  lines.push(``)
  lines.push(`**Border widths:** ${formatPxList(spec.borders.widths)}`)
  lines.push(`**Border radii:** ${formatPxList(spec.borders.radii)}`)
  lines.push(``)

  if (spec.shadows.length > 0) {
    lines.push(`## Shadows`)
    lines.push(``)
    for (const s of spec.shadows.slice(0, 8)) lines.push(`- \`${s.value}\` × ${s.count}`)
    lines.push(``)
  }

  const varKeys = Object.keys(spec.cssVariables)
  if (varKeys.length > 0) {
    lines.push(`## CSS Variables (\`:root\`)`)
    lines.push(``)
    lines.push("```css")
    lines.push(":root {")
    for (const k of varKeys.slice(0, 80)) lines.push(`  ${k}: ${spec.cssVariables[k]};`)
    if (varKeys.length > 80) lines.push(`  /* ... ${varKeys.length - 80} more */`)
    lines.push("}")
    lines.push("```")
    lines.push("")
  }

  lines.push(`---`)
  lines.push(`*Pass this spec to your AI tool to: regenerate the design system as Tailwind/CSS tokens, find inconsistencies, build a Figma library, or audit accessibility (contrast / type size).*`)

  return lines.join("\n")
}

// ─── Internals ──────────────────────────────────────────────────────────

interface Buckets {
  bg: Map<string, number>
  text: Map<string, number>
  border: Map<string, number>
  font: Map<string, number>
  size: Map<number, number>
  weight: Map<string, number>
  lineHeight: Map<string, number>
  padding: Map<number, number>
  margin: Map<number, number>
  gap: Map<number, number>
  borderWidth: Map<number, number>
  radius: Map<number, number>
  shadow: Map<string, number>
}

function createBuckets(): Buckets {
  return {
    bg: new Map(), text: new Map(), border: new Map(),
    font: new Map(), size: new Map(), weight: new Map(), lineHeight: new Map(),
    padding: new Map(), margin: new Map(), gap: new Map(),
    borderWidth: new Map(), radius: new Map(),
    shadow: new Map(),
  }
}

function inc<K>(map: Map<K, number>, key: K): void {
  map.set(key, (map.get(key) || 0) + 1)
}

function top<K>(map: Map<K, number>): SpecValue<K>[] {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N)
    .map(([value, count]) => ({ value, count }))
}

function topNumeric(map: Map<number, number>): SpecValue<number>[] {
  return top(map)
}

function formatPxList(values: SpecValue<number>[]): string {
  if (values.length === 0) return "—"
  return values.slice(0, 12).map((v) => `${v.value}px`).join(" · ")
}

function extractCssVariables(): Record<string, string> {
  const result: Record<string, string> = {}
  // The reliable way to enumerate custom props: iterate the document's
  // stylesheets. Cross-origin sheets throw on rules access — silently skip.
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue
      // Only :root / html — page-level tokens, not per-component overrides
      const sel = rule.selectorText
      if (sel !== ":root" && sel !== "html" && sel !== ":root,html" && sel !== "html,:root") continue
      for (const name of Array.from(rule.style)) {
        if (name.startsWith("--")) {
          result[name] = rule.style.getPropertyValue(name).trim()
        }
      }
    }
  }
  return result
}

/**
 * Look at the most-common spacing values and find the largest integer that
 * divides most of them. Common base units in design systems are 4 or 8 px.
 */
function inferBaseUnit(entries: [number, number][]): number | null {
  const candidates = [4, 8, 6, 5, 10, 12, 16]
  let best: { unit: number; coverage: number } | null = null
  const totalCount = entries.reduce((s, [, c]) => s + c, 0)
  if (totalCount === 0) return null

  for (const unit of candidates) {
    const matched = entries
      .filter(([v]) => v > 0 && v % unit === 0)
      .reduce((s, [, c]) => s + c, 0)
    const coverage = matched / totalCount
    if (!best || coverage > best.coverage) best = { unit, coverage }
  }

  // Require at least 60% of values to be multiples of the base for it to count
  return best && best.coverage >= 0.6 ? best.unit : null
}
