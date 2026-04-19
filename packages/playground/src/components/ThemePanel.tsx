import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react"
import { HexColorPicker } from "react-colorful"
import { Sun, Moon, Copy, Check, RotateCcw, ChevronDown, Bot } from "lucide-react"

/* ═══════════════════════════════════════════
   Presets — Light & Dark variable sets
   ═══════════════════════════════════════════ */

interface ThemeVars {
  "--primary": string; "--primary-foreground": string
  "--background": string; "--foreground": string
  "--card": string; "--card-foreground": string
  "--popover": string; "--popover-foreground": string
  "--secondary": string; "--secondary-foreground": string
  "--muted": string; "--muted-foreground": string
  "--accent": string; "--accent-foreground": string
  "--destructive": string; "--destructive-foreground": string
  "--border": string; "--input": string; "--ring": string
  "--radius": string
  [key: string]: string
}

interface Preset { name: string; light: ThemeVars; dark: ThemeVars }

const CHERRY_LIGHT: ThemeVars = {
  "--primary": "#323232", "--primary-foreground": "#fcfcfc",
  "--background": "#f4f4f4", "--foreground": "#121212",
  "--card": "#fcfcfc", "--card-foreground": "#121212",
  "--popover": "#fcfcfc", "--popover-foreground": "#121212",
  "--secondary": "#f1f1f1", "--secondary-foreground": "#121212",
  "--muted": "#f1f1f1", "--muted-foreground": "#7b7b7b",
  "--accent": "#f1f1f1", "--accent-foreground": "#121212",
  "--destructive": "#dc2626", "--destructive-foreground": "#ffffff",
  "--border": "#ececec", "--input": "#ececec", "--ring": "#323232",
  "--radius": "0.75rem",
  "--input-background": "#fcfcfc", "--switch-background": "#ececec",
  "--sidebar": "oklch(0.985 0 0)", "--sidebar-foreground": "oklch(0.145 0 0)",
  "--sidebar-primary": "#323232", "--sidebar-primary-foreground": "#fcfcfc",
  "--sidebar-accent": "oklch(0.97 0 0)", "--sidebar-accent-foreground": "oklch(0.205 0 0)",
  "--sidebar-border": "oklch(0.922 0 0)", "--sidebar-ring": "oklch(0.708 0 0)",
  "--chart-1": "oklch(0.646 0.222 41.116)", "--chart-2": "oklch(0.6 0.118 184.704)",
  "--chart-3": "oklch(0.398 0.07 227.392)", "--chart-4": "oklch(0.828 0.189 84.429)",
  "--chart-5": "oklch(0.769 0.188 70.08)",
}

const CHERRY_DARK: ThemeVars = {
  "--primary": "#e5e5e5", "--primary-foreground": "#121212",
  "--background": "oklch(0.145 0 0)", "--foreground": "oklch(0.985 0 0)",
  "--card": "oklch(0.145 0 0)", "--card-foreground": "oklch(0.985 0 0)",
  "--popover": "oklch(0.145 0 0)", "--popover-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.269 0 0)", "--secondary-foreground": "oklch(0.985 0 0)",
  "--muted": "oklch(0.269 0 0)", "--muted-foreground": "oklch(0.708 0 0)",
  "--accent": "oklch(0.269 0 0)", "--accent-foreground": "oklch(0.985 0 0)",
  "--destructive": "#ef4444", "--destructive-foreground": "#ffffff",
  "--border": "oklch(0.269 0 0)", "--input": "oklch(0.269 0 0)", "--ring": "#e5e5e5",
  "--radius": "0.75rem",
  "--input-background": "oklch(0.205 0 0)", "--switch-background": "oklch(0.355 0 0)",
  "--sidebar": "oklch(0.205 0 0)", "--sidebar-foreground": "oklch(0.985 0 0)",
  "--sidebar-primary": "#e5e5e5", "--sidebar-primary-foreground": "#121212",
  "--sidebar-accent": "oklch(0.269 0 0)", "--sidebar-accent-foreground": "oklch(0.985 0 0)",
  "--sidebar-border": "oklch(0.269 0 0)", "--sidebar-ring": "oklch(0.439 0 0)",
  "--chart-1": "oklch(0.488 0.243 264.376)", "--chart-2": "oklch(0.696 0.17 162.48)",
  "--chart-3": "oklch(0.769 0.188 70.08)", "--chart-4": "oklch(0.627 0.265 303.9)",
  "--chart-5": "oklch(0.645 0.246 16.439)",
}

const SHADCN_LIGHT: ThemeVars = {
  "--primary": "oklch(0.205 0 0)", "--primary-foreground": "oklch(0.985 0 0)",
  "--background": "oklch(1 0 0)", "--foreground": "oklch(0.145 0 0)",
  "--card": "oklch(1 0 0)", "--card-foreground": "oklch(0.145 0 0)",
  "--popover": "oklch(1 0 0)", "--popover-foreground": "oklch(0.145 0 0)",
  "--secondary": "oklch(0.97 0 0)", "--secondary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.97 0 0)", "--muted-foreground": "oklch(0.556 0 0)",
  "--accent": "oklch(0.97 0 0)", "--accent-foreground": "oklch(0.205 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)", "--destructive-foreground": "#ffffff",
  "--border": "oklch(0.922 0 0)", "--input": "oklch(0.922 0 0)", "--ring": "oklch(0.708 0 0)",
  "--radius": "0.5rem",
  "--sidebar": "oklch(0.985 0 0)", "--sidebar-foreground": "oklch(0.145 0 0)",
  "--sidebar-primary": "oklch(0.205 0 0)", "--sidebar-primary-foreground": "oklch(0.985 0 0)",
  "--sidebar-accent": "oklch(0.97 0 0)", "--sidebar-accent-foreground": "oklch(0.205 0 0)",
  "--sidebar-border": "oklch(0.922 0 0)", "--sidebar-ring": "oklch(0.708 0 0)",
  "--chart-1": "oklch(0.646 0.222 41.116)", "--chart-2": "oklch(0.6 0.118 184.704)",
  "--chart-3": "oklch(0.398 0.07 227.392)", "--chart-4": "oklch(0.828 0.189 84.429)",
  "--chart-5": "oklch(0.769 0.188 70.08)",
}

const SHADCN_DARK: ThemeVars = {
  "--primary": "oklch(0.922 0 0)", "--primary-foreground": "oklch(0.205 0 0)",
  "--background": "oklch(0.145 0 0)", "--foreground": "oklch(0.985 0 0)",
  "--card": "oklch(0.145 0 0)", "--card-foreground": "oklch(0.985 0 0)",
  "--popover": "oklch(0.145 0 0)", "--popover-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.269 0 0)", "--secondary-foreground": "oklch(0.985 0 0)",
  "--muted": "oklch(0.269 0 0)", "--muted-foreground": "oklch(0.708 0 0)",
  "--accent": "oklch(0.269 0 0)", "--accent-foreground": "oklch(0.985 0 0)",
  "--destructive": "oklch(0.396 0.141 25.723)", "--destructive-foreground": "#ffffff",
  "--border": "oklch(0.269 0 0)", "--input": "oklch(0.269 0 0)", "--ring": "oklch(0.439 0 0)",
  "--radius": "0.5rem",
  "--sidebar": "oklch(0.205 0 0)", "--sidebar-foreground": "oklch(0.985 0 0)",
  "--sidebar-primary": "oklch(0.922 0 0)", "--sidebar-primary-foreground": "oklch(0.205 0 0)",
  "--sidebar-accent": "oklch(0.269 0 0)", "--sidebar-accent-foreground": "oklch(0.985 0 0)",
  "--sidebar-border": "oklch(0.269 0 0)", "--sidebar-ring": "oklch(0.439 0 0)",
  "--chart-1": "oklch(0.488 0.243 264.376)", "--chart-2": "oklch(0.696 0.17 162.48)",
  "--chart-3": "oklch(0.769 0.188 70.08)", "--chart-4": "oklch(0.627 0.265 303.9)",
  "--chart-5": "oklch(0.645 0.246 16.439)",
}

function makeColorPreset(name: string, primary: string, radius = "0.5rem"): Preset {
  return {
    name,
    light: { ...SHADCN_LIGHT, "--primary": primary, "--radius": radius },
    dark: { ...SHADCN_DARK, "--primary": primary, "--radius": radius },
  }
}

const PRESETS: Preset[] = [
  { name: "Cherry", light: CHERRY_LIGHT, dark: CHERRY_DARK },
  { name: "Shadcn Default", light: SHADCN_LIGHT, dark: SHADCN_DARK },
  makeColorPreset("Rose", "oklch(0.585 0.22 17.46)"),
  makeColorPreset("Blue", "oklch(0.546 0.245 262.88)"),
  makeColorPreset("Violet", "oklch(0.541 0.281 293.01)", "0.75rem"),
  makeColorPreset("Orange", "oklch(0.637 0.237 25.33)"),
  makeColorPreset("Green", "oklch(0.596 0.183 163.25)"),
  makeColorPreset("Zinc", "oklch(0.244 0.006 285.82)"),
]

const DEFAULT_SHADOWS = {
  "--shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "--shadow": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  "--shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  "--shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  "--shadow-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
}

const DEFAULTS = {
  fontSize: 16, lineHeight: 1.5, letterSpacing: 0,
  fontWeightNormal: 400, fontWeightHeading: 600, borderWidth: 1,
  transitionDuration: 150, transitionEasing: "ease",
  overlayOpacity: 0.8, backdropBlur: 0,
  focusRingWidth: 2, focusRingOffset: 2,
  spacingXs: 4, spacingSm: 8, spacingMd: 16, spacingLg: 24, spacingXl: 32,
}

const FONTS = [
  { label: "System", value: "system-ui, -apple-system, sans-serif" },
  { label: "Inter", value: "'Inter', system-ui, sans-serif" },
  { label: "Geist", value: "'Geist', system-ui, sans-serif" },
  { label: "Mono", value: "'SF Mono', 'Fira Code', monospace" },
]

const COLOR_GROUPS = [
  { title: "Core", vars: [["--primary", "Primary"], ["--primary-foreground", "Primary FG"], ["--background", "Background"], ["--foreground", "Foreground"], ["--destructive", "Destructive"], ["--destructive-foreground", "Destructive FG"]] },
  { title: "Surfaces", vars: [["--card", "Card"], ["--card-foreground", "Card FG"], ["--popover", "Popover"], ["--popover-foreground", "Popover FG"], ["--secondary", "Secondary"], ["--secondary-foreground", "Secondary FG"], ["--muted", "Muted"], ["--muted-foreground", "Muted FG"], ["--accent", "Accent"], ["--accent-foreground", "Accent FG"]] },
  { title: "Border & Input", vars: [["--border", "Border"], ["--input", "Input"], ["--ring", "Ring"]] },
  { title: "Sidebar", vars: [["--sidebar", "Sidebar BG"], ["--sidebar-foreground", "Sidebar FG"], ["--sidebar-primary", "Sidebar Primary"], ["--sidebar-primary-foreground", "Sidebar Primary FG"], ["--sidebar-accent", "Sidebar Accent"], ["--sidebar-accent-foreground", "Sidebar Accent FG"], ["--sidebar-border", "Sidebar Border"], ["--sidebar-ring", "Sidebar Ring"]] },
  { title: "Chart", vars: [["--chart-1", "Chart 1"], ["--chart-2", "Chart 2"], ["--chart-3", "Chart 3"], ["--chart-4", "Chart 4"], ["--chart-5", "Chart 5"]] },
]

/* ═══════════════════════════════════════════
   Shadow Editor — visual sliders
   ═══════════════════════════════════════════ */

const SHADOW_LEVELS = [
  { key: "--shadow-sm", label: "SM", defaultBlur: 2, defaultSpread: 0, defaultY: 1, defaultOpacity: 5 },
  { key: "--shadow", label: "Default", defaultBlur: 3, defaultSpread: 0, defaultY: 1, defaultOpacity: 10 },
  { key: "--shadow-md", label: "MD", defaultBlur: 6, defaultSpread: -1, defaultY: 4, defaultOpacity: 10 },
  { key: "--shadow-lg", label: "LG", defaultBlur: 15, defaultSpread: -3, defaultY: 10, defaultOpacity: 10 },
  { key: "--shadow-xl", label: "XL", defaultBlur: 25, defaultSpread: -5, defaultY: 20, defaultOpacity: 10 },
] as const

function ShadowEditor({ shadows, onChange }: {
  shadows: Record<string, string>
  onChange: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  const [activeLevel, setActiveLevel] = useState("--shadow-md")
  const [blur, setBlur] = useState(6)
  const [spread, setSpread] = useState(-1)
  const [offsetY, setOffsetY] = useState(4)
  const [opacity, setOpacity] = useState(10)

  const selectLevel = (key: string) => {
    setActiveLevel(key)
    const currentShadow = shadows[key]
    // Parse first segment: "0 Ypx Bpx Spx rgb(0 0 0 / O)"
    const match = currentShadow.match(/0\s+(\d+)px\s+(\d+)px\s+(-?\d+)px\s+rgb\(0 0 0 \/ ([\d.]+)\)/)
    if (match) {
      setOffsetY(parseInt(match[1]))
      setBlur(parseInt(match[2]))
      setSpread(parseInt(match[3]))
      setOpacity(Math.round(parseFloat(match[4]) * 100))
    } else {
      const level = SHADOW_LEVELS.find((l) => l.key === key)!
      setBlur(level.defaultBlur)
      setSpread(level.defaultSpread)
      setOffsetY(level.defaultY)
      setOpacity(level.defaultOpacity)
    }
  }

  const buildShadow = (b: number, s: number, y: number, o: number) =>
    `0 ${y}px ${b}px ${s}px rgb(0 0 0 / ${o / 100})`

  const applyShadow = (b: number, s: number, y: number, o: number) => {
    const current = shadows[activeLevel]
    const segments = current.split(",")
    const newFirst = buildShadow(b, s, y, o)
    const val = segments.length > 1
      ? `${newFirst},${segments.slice(1).join(",")}`
      : newFirst
    onChange((prev) => ({ ...prev, [activeLevel]: val }))
  }

  return (
    <div className="space-y-3">
      {/* Level selector */}
      <div className="flex gap-1">
        {SHADOW_LEVELS.map((l) => (
          <button
            key={l.key}
            onClick={() => selectLevel(l.key)}
            className={`flex-1 py-1 rounded text-[9px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
              activeLevel === l.key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="flex justify-center py-2">
        <div className="w-16 h-16 rounded-lg bg-card border border-border" style={{ boxShadow: shadows[activeLevel] }} />
      </div>

      {/* Sliders */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between mb-0.5">
            <span className="text-[9px] text-muted-foreground">Blur</span>
            <span className="text-[9px] font-mono text-foreground/60">{blur}px</span>
          </div>
          <input type="range" min="0" max="40" value={blur} onChange={(e) => { const v = +e.target.value; setBlur(v); applyShadow(v, spread, offsetY, opacity) }} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
        </div>
        <div>
          <div className="flex justify-between mb-0.5">
            <span className="text-[9px] text-muted-foreground">Offset Y</span>
            <span className="text-[9px] font-mono text-foreground/60">{offsetY}px</span>
          </div>
          <input type="range" min="0" max="30" value={offsetY} onChange={(e) => { const v = +e.target.value; setOffsetY(v); applyShadow(blur, spread, v, opacity) }} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
        </div>
        <div>
          <div className="flex justify-between mb-0.5">
            <span className="text-[9px] text-muted-foreground">Spread</span>
            <span className="text-[9px] font-mono text-foreground/60">{spread}px</span>
          </div>
          <input type="range" min="-10" max="10" value={spread} onChange={(e) => { const v = +e.target.value; setSpread(v); applyShadow(blur, v, offsetY, opacity) }} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
        </div>
        <div>
          <div className="flex justify-between mb-0.5">
            <span className="text-[9px] text-muted-foreground">Opacity</span>
            <span className="text-[9px] font-mono text-foreground/60">{opacity}%</span>
          </div>
          <input type="range" min="0" max="50" value={opacity} onChange={(e) => { const v = +e.target.value; setOpacity(v); applyShadow(blur, spread, offsetY, v) }} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Collapsible Group
   ═══════════════════════════════════════════ */

function PanelGroup({ title, defaultOpen = false, badge, children }: { title: string; defaultOpen?: boolean; badge?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/50">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] font-medium text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <span className="flex items-center gap-1.5">
          {title}
          {badge && <span className="text-[8px] text-muted-foreground/50 bg-muted/50 px-1 py-0.5 rounded font-normal">{badge}</span>}
        </span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-3">{children}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Color Row — editable
   ═══════════════════════════════════════════ */

function cssColorToHex(cssColor: string): string {
  if (cssColor.startsWith("#")) return cssColor
  try {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = cssColor
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  } catch {
    return "#888888"
  }
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Convert any CSS color (including oklch) to hex for the picker
  const hexValue = cssColorToHex(value)

  return (
    <div className="relative flex items-center justify-between gap-2 py-0.5" ref={ref}>
      <span className="text-[10px] text-muted-foreground truncate flex-1">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen(!open)}
          className="w-5 h-5 rounded border border-border/50 shrink-0 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-[90px] bg-muted/30 rounded px-1.5 py-0.5 text-[9px] font-mono text-foreground/60 border-0 outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>
      {open && (
        <div className="absolute right-0 top-7 z-50 rounded-lg border border-border bg-popover p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <HexColorPicker
            color={hexValue}
            onChange={(hex) => onChange(hex)}
            style={{ width: 180, height: 140 }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full mt-2 bg-muted/30 rounded px-2 py-1 text-[10px] font-mono text-foreground/70 border border-border/50 outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="#hex or oklch(...)"
          />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main ThemePanel
   ═══════════════════════════════════════════ */

export function ThemePanel({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const [activePreset, setActivePreset] = useState("Cherry")
  const [lightVars, setLightVars] = useState<ThemeVars>({ ...CHERRY_LIGHT })
  const [darkVars, setDarkVars] = useState<ThemeVars>({ ...CHERRY_DARK })
  const [font, setFont] = useState(FONTS[0].value)
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.5)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [fontWeightNormal, setFontWeightNormal] = useState(400)
  const [fontWeightHeading, setFontWeightHeading] = useState(600)
  const [borderWidth, setBorderWidth] = useState(1)
  const [shadows, setShadows] = useState<Record<string, string>>({ ...DEFAULT_SHADOWS })
  const [spacingXs, setSpacingXs] = useState(4)
  const [spacingSm, setSpacingSm] = useState(8)
  const [spacingMd, setSpacingMd] = useState(16)
  const [spacingLg, setSpacingLg] = useState(24)
  const [spacingXl, setSpacingXl] = useState(32)
  const [transitionDuration, setTransitionDuration] = useState(150)
  const [transitionEasing, setTransitionEasing] = useState("ease")
  const [overlayOpacity, setOverlayOpacity] = useState(0.8)
  const [backdropBlur, setBackdropBlur] = useState(0)
  const [focusRingWidth, setFocusRingWidth] = useState(2)
  const [focusRingOffset, setFocusRingOffset] = useState(2)
  const [copied, setCopied] = useState("")
  const initialLight = useRef<ThemeVars>({ ...CHERRY_LIGHT })
  const initialDark = useRef<ThemeVars>({ ...CHERRY_DARK })

  const currentVars = dark ? darkVars : lightVars
  const setCurrentVars = dark ? setDarkVars : setLightVars

  // Apply vars to DOM — synchronously to avoid flash
  useLayoutEffect(() => {
    const root = document.documentElement
    // Clear ALL theme inline styles first to avoid stale dark/light values persisting
    const allKeys = new Set([...Object.keys(lightVars), ...Object.keys(darkVars)])
    allKeys.forEach((k) => root.style.removeProperty(k))
    // Then apply the current mode's vars
    const vars = dark ? darkVars : lightVars
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  }, [dark, lightVars, darkVars])

  const updateVar = (key: string, val: string) => {
    setCurrentVars((prev) => {
      const next = { ...prev, [key]: val }
      // When primary changes, derive border/input/ring
      if (key === "--primary") {
        const bg = next["--background"] || "#f4f4f4"
        next["--border"] = `color-mix(in srgb, ${val} 12%, ${bg})`
        next["--input"] = `color-mix(in srgb, ${val} 12%, ${bg})`
        next["--switch-background"] = `color-mix(in srgb, ${val} 15%, ${bg})`
        next["--ring"] = val
      }
      return next
    })
  }

  const applyPreset = (preset: Preset) => {
    // Derive border/input/switch from primary using color-mix
    const deriveVars = (vars: ThemeVars): ThemeVars => {
      const bg = vars["--background"] || "#f4f4f4"
      const primary = vars["--primary"] || "#323232"
      return {
        ...vars,
        "--border": `color-mix(in srgb, ${primary} 12%, ${bg})`,
        "--input": `color-mix(in srgb, ${primary} 12%, ${bg})`,
        "--switch-background": `color-mix(in srgb, ${primary} 15%, ${bg})`,
        "--ring": primary,
      }
    }
    const light = deriveVars(preset.light)
    const darkVarsComputed = deriveVars(preset.dark)
    setLightVars(light)
    setDarkVars(darkVarsComputed)
    initialLight.current = light
    initialDark.current = darkVarsComputed
    setActivePreset(preset.name)
  }

  const reset = () => {
    const preset = PRESETS.find((p) => p.name === "Cherry")!
    applyPreset(preset)
    document.documentElement.style.fontFamily = ""
    setFont(FONTS[0].value)
    setFontSize(DEFAULTS.fontSize)
    setLineHeight(DEFAULTS.lineHeight)
    setLetterSpacing(DEFAULTS.letterSpacing)
    setFontWeightNormal(DEFAULTS.fontWeightNormal)
    setFontWeightHeading(DEFAULTS.fontWeightHeading)
    setBorderWidth(DEFAULTS.borderWidth)
    setShadows({ ...DEFAULT_SHADOWS })
    setSpacingXs(DEFAULTS.spacingXs)
    setSpacingSm(DEFAULTS.spacingSm)
    setSpacingMd(DEFAULTS.spacingMd)
    setSpacingLg(DEFAULTS.spacingLg)
    setSpacingXl(DEFAULTS.spacingXl)
    setTransitionDuration(DEFAULTS.transitionDuration)
    setTransitionEasing(DEFAULTS.transitionEasing)
    setOverlayOpacity(DEFAULTS.overlayOpacity)
    setBackdropBlur(DEFAULTS.backdropBlur)
    setFocusRingWidth(DEFAULTS.focusRingWidth)
    setFocusRingOffset(DEFAULTS.focusRingOffset)
  }

  const radius = parseFloat(currentVars["--radius"]) || 0.5
  const updateRadius = (v: number) => {
    const val = `${v}rem`
    setLightVars((prev) => ({ ...prev, "--radius": val }))
    setDarkVars((prev) => ({ ...prev, "--radius": val }))
  }

  const updateFont = (v: string) => {
    setFont(v)
    document.documentElement.style.fontFamily = v
  }

  // Apply non-color global vars
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty("--font-size", `${fontSize}px`)
    root.style.setProperty("--line-height", `${lineHeight}`)
    root.style.setProperty("--letter-spacing", `${letterSpacing}em`)
    root.style.setProperty("--font-weight-normal", `${fontWeightNormal}`)
    root.style.setProperty("--font-weight-medium", `${fontWeightHeading}`)
    root.style.setProperty("--border-width", `${borderWidth}px`)
    root.style.setProperty("--duration-normal", `${transitionDuration}ms`)
    root.style.setProperty("--transition-easing", transitionEasing)
    root.style.setProperty("--overlay-opacity", `${overlayOpacity}`)
    root.style.setProperty("--backdrop-blur", `${backdropBlur}px`)
    root.style.setProperty("--ring-width", `${focusRingWidth}px`)
    root.style.setProperty("--ring-offset", `${focusRingOffset}px`)
    // Spacing
    root.style.setProperty("--spacing-xs", `${spacingXs}px`)
    root.style.setProperty("--spacing-sm", `${spacingSm}px`)
    root.style.setProperty("--spacing-md", `${spacingMd}px`)
    root.style.setProperty("--spacing-lg", `${spacingLg}px`)
    root.style.setProperty("--spacing-xl", `${spacingXl}px`)
    // Shadows
    Object.entries(shadows).forEach(([k, v]) => root.style.setProperty(k, v))
  }, [fontSize, lineHeight, letterSpacing, fontWeightNormal, fontWeightHeading, borderWidth, spacingXs, spacingSm, spacingMd, spacingLg, spacingXl, transitionDuration, transitionEasing, overlayOpacity, backdropBlur, focusRingWidth, focusRingOffset, shadows])

  // Export CSS
  const exportCSS = () => {
    const globalLines = [
      `  --font-size: ${fontSize}px;`,
      `  --line-height: ${lineHeight};`,
      `  --letter-spacing: ${letterSpacing}em;`,
      `  --font-weight-normal: ${fontWeightNormal};`,
      `  --font-weight-medium: ${fontWeightHeading};`,
      `  --border-width: ${borderWidth}px;`,
      `  --duration-normal: ${transitionDuration}ms;`,
      `  --transition-easing: ${transitionEasing};`,
      `  --overlay-opacity: ${overlayOpacity};`,
      `  --backdrop-blur: ${backdropBlur}px;`,
      `  --ring-width: ${focusRingWidth}px;`,
      `  --ring-offset: ${focusRingOffset}px;`,
      `  --spacing-xs: ${spacingXs}px;`,
      `  --spacing-sm: ${spacingSm}px;`,
      `  --spacing-md: ${spacingMd}px;`,
      `  --spacing-lg: ${spacingLg}px;`,
      `  --spacing-xl: ${spacingXl}px;`,
      ...Object.entries(shadows).map(([k, v]) => `  ${k}: ${v};`),
    ].join("\n")
    const lLines = Object.entries(lightVars).map(([k, v]) => `  ${k}: ${v};`).join("\n")
    const dLines = Object.entries(darkVars).map(([k, v]) => `  ${k}: ${v};`).join("\n")
    const css = `:root {\n${lLines}\n\n  /* Global tokens */\n${globalLines}\n}\n\n.dark {\n${dLines}\n}`
    navigator.clipboard.writeText(css).catch(() => {})
    setCopied("css")
    setTimeout(() => setCopied(""), 2000)
  }

  // Export diff (only modified vars)
  const getDiff = () => {
    const lightDiff: string[] = []
    const darkDiff: string[] = []
    Object.entries(lightVars).forEach(([k, v]) => {
      if (v !== initialLight.current[k]) lightDiff.push(`  ${k}: ${v};`)
    })
    Object.entries(darkVars).forEach(([k, v]) => {
      if (v !== initialDark.current[k]) darkDiff.push(`  ${k}: ${v};`)
    })
    const globalDiff: string[] = []
    if (fontSize !== DEFAULTS.fontSize) globalDiff.push(`  --font-size: ${fontSize}px;`)
    if (lineHeight !== DEFAULTS.lineHeight) globalDiff.push(`  --line-height: ${lineHeight};`)
    if (letterSpacing !== DEFAULTS.letterSpacing) globalDiff.push(`  --letter-spacing: ${letterSpacing}em;`)
    if (fontWeightNormal !== DEFAULTS.fontWeightNormal) globalDiff.push(`  --font-weight-normal: ${fontWeightNormal};`)
    if (fontWeightHeading !== DEFAULTS.fontWeightHeading) globalDiff.push(`  --font-weight-medium: ${fontWeightHeading};`)
    if (borderWidth !== DEFAULTS.borderWidth) globalDiff.push(`  --border-width: ${borderWidth}px;`)
    if (transitionDuration !== DEFAULTS.transitionDuration) globalDiff.push(`  --duration-normal: ${transitionDuration}ms;`)
    if (transitionEasing !== DEFAULTS.transitionEasing) globalDiff.push(`  --transition-easing: ${transitionEasing};`)
    if (overlayOpacity !== DEFAULTS.overlayOpacity) globalDiff.push(`  --overlay-opacity: ${overlayOpacity};`)
    if (backdropBlur !== DEFAULTS.backdropBlur) globalDiff.push(`  --backdrop-blur: ${backdropBlur}px;`)
    if (focusRingWidth !== DEFAULTS.focusRingWidth) globalDiff.push(`  --ring-width: ${focusRingWidth}px;`)
    if (focusRingOffset !== DEFAULTS.focusRingOffset) globalDiff.push(`  --ring-offset: ${focusRingOffset}px;`)
    if (spacingXs !== DEFAULTS.spacingXs) globalDiff.push(`  --spacing-xs: ${spacingXs}px;`)
    if (spacingSm !== DEFAULTS.spacingSm) globalDiff.push(`  --spacing-sm: ${spacingSm}px;`)
    if (spacingMd !== DEFAULTS.spacingMd) globalDiff.push(`  --spacing-md: ${spacingMd}px;`)
    if (spacingLg !== DEFAULTS.spacingLg) globalDiff.push(`  --spacing-lg: ${spacingLg}px;`)
    if (spacingXl !== DEFAULTS.spacingXl) globalDiff.push(`  --spacing-xl: ${spacingXl}px;`)
    Object.entries(shadows).forEach(([k, v]) => {
      if (v !== DEFAULT_SHADOWS[k as keyof typeof DEFAULT_SHADOWS]) globalDiff.push(`  ${k}: ${v};`)
    })
    return { lightDiff, darkDiff, globalDiff }
  }

  // Export AI Prompt
  const exportAIPrompt = () => {
    const { lightDiff, darkDiff, globalDiff } = getDiff()
    if (lightDiff.length === 0 && darkDiff.length === 0 && globalDiff.length === 0) {
      navigator.clipboard.writeText("No changes — current theme matches the preset.").catch(() => {})
      setCopied("ai")
      setTimeout(() => setCopied(""), 2000)
      return
    }
    let prompt = `请将 packages/ui/src/styles/theme.css 中的以下 design tokens 修改为：\n`
    if (lightDiff.length > 0) prompt += `\nLight 模式 (:root):\n${lightDiff.join("\n")}\n`
    if (darkDiff.length > 0) prompt += `\nDark 模式 (.dark):\n${darkDiff.join("\n")}\n`
    if (globalDiff.length > 0) prompt += `\n全局变量 (:root):\n${globalDiff.join("\n")}\n`
    prompt += `\n请确保修改后所有组件样式一致，并同步更新 src/styles/theme.css。`
    navigator.clipboard.writeText(prompt).catch(() => {})
    setCopied("ai")
    setTimeout(() => setCopied(""), 2000)
  }

  return (
    <aside className="w-[270px] flex-shrink-0 border-l border-border bg-muted/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold">Theme</span>
        <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30">
        {/* Mode Toggle */}
        <div className="px-5 py-3 border-b border-border/50">
          <div className="flex rounded-lg bg-muted/50 p-0.5">
            <button onClick={() => dark && onToggleDark()} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${!dark ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <Sun size={11} /> Light
            </button>
            <button onClick={() => !dark && onToggleDark()} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${dark ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <Moon size={11} /> Dark
            </button>
          </div>
          <p className="text-[9px] text-muted-foreground/50 mt-1.5 text-center">
            Editing {dark ? "Dark" : "Light"} mode variables
          </p>
        </div>

        {/* Presets */}
        <PanelGroup title="Presets" defaultOpen>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => applyPreset(p)} className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${activePreset === p.name ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50"}`}>
                <div className="w-6 h-6 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: dark ? p.dark["--primary"] : p.light["--primary"] }} />
                <span className="text-[8px] text-muted-foreground leading-none">{p.name}</span>
              </button>
            ))}
          </div>
        </PanelGroup>

        {/* Radius */}
        <PanelGroup title="📐 Radius & Border" defaultOpen>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Border Radius</span>
              <span className="text-[10px] font-mono text-foreground/60">{radius}rem</span>
            </div>
            <input type="range" min="0" max="1.5" step="0.05" value={radius} onChange={(e) => updateRadius(parseFloat(e.target.value))} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            <div className="flex gap-2 pt-1">
              {[0, 0.25, 0.5, 0.625, 0.75, 1.0].map((r) => (
                <button key={r} onClick={() => updateRadius(r)} className={`w-7 h-7 border-2 transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${Math.abs(radius - r) < 0.01 ? "border-primary bg-primary/10" : "border-border bg-muted/30"}`} style={{ borderRadius: `${r}rem` }} />
              ))}
            </div>
          </div>
        </PanelGroup>

        {/* Font */}
        <PanelGroup title="🔤 Font">
          <div className="space-y-1">
            {FONTS.map((f) => (
              <button key={f.label} onClick={() => updateFont(f.value)} className={`w-full text-left px-2.5 py-1.5 rounded-md text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${font === f.value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"}`} style={{ fontFamily: f.value }}>
                {f.label}
                <span className="block text-[9px] opacity-60 mt-0.5" style={{ fontFamily: f.value }}>The quick brown fox</span>
              </button>
            ))}
          </div>
        </PanelGroup>

        {/* Typography */}
        <PanelGroup title="🔤 Typography" badge="export only">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Font Size</span>
                <span className="text-[10px] font-mono text-foreground/60">{fontSize}px</span>
              </div>
              <input type="range" min="12" max="18" step="1" value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Line Height</span>
                <span className="text-[10px] font-mono text-foreground/60">{lineHeight}</span>
              </div>
              <input type="range" min="1.2" max="2.0" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Letter Spacing</span>
                <span className="text-[10px] font-mono text-foreground/60">{letterSpacing}em</span>
              </div>
              <input type="range" min="-0.05" max="0.1" step="0.01" value={letterSpacing} onChange={(e) => setLetterSpacing(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <span className="text-[9px] text-muted-foreground">Body Weight</span>
                <select value={fontWeightNormal} onChange={(e) => setFontWeightNormal(+e.target.value)} className="w-full mt-0.5 bg-muted/30 rounded px-1.5 py-1 text-[10px] border-0 outline-none">
                  <option value={300}>300 Light</option>
                  <option value={400}>400 Regular</option>
                  <option value={500}>500 Medium</option>
                </select>
              </div>
              <div className="flex-1">
                <span className="text-[9px] text-muted-foreground">Heading Weight</span>
                <select value={fontWeightHeading} onChange={(e) => setFontWeightHeading(+e.target.value)} className="w-full mt-0.5 bg-muted/30 rounded px-1.5 py-1 text-[10px] border-0 outline-none">
                  <option value={500}>500 Medium</option>
                  <option value={600}>600 Semibold</option>
                  <option value={700}>700 Bold</option>
                </select>
              </div>
            </div>
          </div>
        </PanelGroup>

        {/* Border */}
        <PanelGroup title="📐 Border" badge="export only">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Border Width</span>
              <span className="text-[10px] font-mono text-foreground/60">{borderWidth}px</span>
            </div>
            <input type="range" min="0" max="3" step="0.5" value={borderWidth} onChange={(e) => setBorderWidth(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          </div>
        </PanelGroup>

        {/* Shadows */}
        <PanelGroup title="🌑 Shadows" badge="export only">
          <ShadowEditor shadows={shadows} onChange={setShadows} />
        </PanelGroup>

        {/* Spacing */}
        <PanelGroup title="📏 Spacing" badge="export only">
          <div className="space-y-3">
            {([
              ["--spacing-xs", "XS", spacingXs, setSpacingXs, 2, 8] as const,
              ["--spacing-sm", "SM", spacingSm, setSpacingSm, 4, 12] as const,
              ["--spacing-md", "MD", spacingMd, setSpacingMd, 8, 20] as const,
              ["--spacing-lg", "LG", spacingLg, setSpacingLg, 16, 32] as const,
              ["--spacing-xl", "XL", spacingXl, setSpacingXl, 24, 48] as const,
            ]).map(([, label, val, setter, min, max]) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                  <span className="text-[10px] font-mono text-foreground/60">{val}px</span>
                </div>
                <input type="range" min={min} max={max} step="1" value={val} onChange={(e) => (setter as (v: number) => void)(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
              </div>
            ))}
          </div>
        </PanelGroup>

        {/* Animation */}
        <PanelGroup title="✨ Animation" badge="export only">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Duration</span>
                <span className="text-[10px] font-mono text-foreground/60">{transitionDuration}ms</span>
              </div>
              <input type="range" min="0" max="500" step="50" value={transitionDuration} onChange={(e) => setTransitionDuration(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Easing</span>
              <select value={transitionEasing} onChange={(e) => setTransitionEasing(e.target.value)} className="w-full mt-0.5 bg-muted/30 rounded px-1.5 py-1 text-[10px] border-0 outline-none">
                <option value="ease">ease</option>
                <option value="ease-in-out">ease-in-out</option>
                <option value="ease-out">ease-out</option>
                <option value="linear">linear</option>
                <option value="cubic-bezier(0.4, 0, 0.2, 1)">cubic-bezier (default)</option>
              </select>
            </div>
          </div>
        </PanelGroup>

        {/* Advanced */}
        <PanelGroup title="⚙️ Advanced" badge="export only">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Overlay Opacity</span>
                <span className="text-[10px] font-mono text-foreground/60">{overlayOpacity}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={overlayOpacity} onChange={(e) => setOverlayOpacity(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Backdrop Blur</span>
                <span className="text-[10px] font-mono text-foreground/60">{backdropBlur}px</span>
              </div>
              <input type="range" min="0" max="24" step="2" value={backdropBlur} onChange={(e) => setBackdropBlur(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Focus Ring Width</span>
                <span className="text-[10px] font-mono text-foreground/60">{focusRingWidth}px</span>
              </div>
              <input type="range" min="0" max="4" step="0.5" value={focusRingWidth} onChange={(e) => setFocusRingWidth(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Focus Ring Offset</span>
                <span className="text-[10px] font-mono text-foreground/60">{focusRingOffset}px</span>
              </div>
              <input type="range" min="0" max="4" step="0.5" value={focusRingOffset} onChange={(e) => setFocusRingOffset(+e.target.value)} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
          </div>
        </PanelGroup>

        {/* Color Groups */}
        {COLOR_GROUPS.map((group) => (
          <PanelGroup key={group.title} title={`🎨 Colors — ${group.title}`} defaultOpen={group.title === "Core"}>
            <div className="space-y-0.5">
              {group.vars.map(([cssVar, label]) => (
                <ColorRow key={cssVar} label={label} value={currentVars[cssVar] || ""} onChange={(v) => updateVar(cssVar, v)} />
              ))}
            </div>
          </PanelGroup>
        ))}
      </div>

      {/* Export Footer */}
      <div className="px-5 py-3 border-t border-border space-y-1.5">
        <button onClick={exportCSS} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          {copied === "css" ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Export CSS</>}
        </button>
        <button onClick={exportAIPrompt} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-muted/50 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          {copied === "ai" ? <><Check size={12} className="text-success" /> Copied!</> : <><Bot size={12} /> Copy AI Prompt (diff only)</>}
        </button>
      </div>
    </aside>
  )
}
