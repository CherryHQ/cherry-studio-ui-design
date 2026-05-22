import type { Annotation } from "@cherry-studio/ui"

/**
 * Storage layout in chrome.storage.local:
 *   marker:annotations:<origin>  → Annotation[]   per-site
 *   marker:settings              → ExtensionSettings (apiKey, etc.)
 *   marker:origins               → string[]        (index of all origins with annotations)
 */

const KEY_PREFIX = "marker:annotations:"
const SETTINGS_KEY = "marker:settings"
const ORIGINS_KEY = "marker:origins"

export interface ExtensionSettings {
  /** GitHub PAT for direct issue creation (or Linear API key when issueTracker = linear) */
  githubToken?: string
  /** Default repo for issue creation: "owner/repo" (GitHub) or teamId (Linear) */
  defaultRepo?: string
  /** Whether to capture screenshots automatically */
  captureScreenshots?: boolean
  /** Default issue tracker: github | linear | none */
  issueTracker?: "github" | "linear" | "none"
  /**
   * Color scheme for the in-page UI.
   *  - "auto"  follow host page (`<html class="dark">` etc) → fall back to OS
   *  - "light" / "dark" force regardless of host
   */
  theme?: "auto" | "light" | "dark"
}

const isExtensionContext = typeof chrome !== "undefined" && chrome.storage?.local

// ─── Per-origin annotation storage ──────────────────────────────────────────

export async function loadAnnotationsFor(origin: string): Promise<Annotation[]> {
  if (!isExtensionContext) {
    const raw = localStorage.getItem(KEY_PREFIX + origin)
    return raw ? safeParse(raw) : []
  }
  const key = KEY_PREFIX + origin
  const result = await chrome.storage.local.get(key)
  return (result[key] as Annotation[]) || []
}

export async function saveAnnotationsFor(origin: string, annotations: Annotation[]): Promise<void> {
  if (!isExtensionContext) {
    localStorage.setItem(KEY_PREFIX + origin, JSON.stringify(annotations))
    return
  }
  const key = KEY_PREFIX + origin
  await chrome.storage.local.set({ [key]: annotations })
  if (annotations.length > 0) await indexOrigin(origin)
  else await unindexOrigin(origin)
}

// ─── Origin index (for popup to enumerate sites with annotations) ──────────

async function indexOrigin(origin: string): Promise<void> {
  const all = await listOrigins()
  if (!all.includes(origin)) {
    await chrome.storage.local.set({ [ORIGINS_KEY]: [...all, origin] })
  }
}

async function unindexOrigin(origin: string): Promise<void> {
  const all = await listOrigins()
  const next = all.filter((o) => o !== origin)
  await chrome.storage.local.set({ [ORIGINS_KEY]: next })
}

export async function listOrigins(): Promise<string[]> {
  if (!isExtensionContext) return []
  const result = await chrome.storage.local.get(ORIGINS_KEY)
  return (result[ORIGINS_KEY] as string[]) || []
}

export async function loadAllAnnotations(): Promise<Map<string, Annotation[]>> {
  const origins = await listOrigins()
  const map = new Map<string, Annotation[]>()
  for (const origin of origins) {
    map.set(origin, await loadAnnotationsFor(origin))
  }
  return map
}

// ─── Settings ─────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<ExtensionSettings> {
  if (!isExtensionContext) return {}
  const result = await chrome.storage.local.get(SETTINGS_KEY)
  return (result[SETTINGS_KEY] as ExtensionSettings) || {}
}

export async function saveSettings(patch: Partial<ExtensionSettings>): Promise<void> {
  if (!isExtensionContext) return
  const current = await loadSettings()
  await chrome.storage.local.set({ [SETTINGS_KEY]: { ...current, ...patch } })
}

// ─── Cross-tab sync ────────────────────────────────────────────────────────

export function onAnnotationsChanged(
  origin: string,
  callback: (annotations: Annotation[]) => void,
): () => void {
  if (!isExtensionContext) return () => {}
  const key = KEY_PREFIX + origin
  const handler = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    if (areaName !== "local") return
    if (changes[key]) callback((changes[key].newValue as Annotation[]) || [])
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function safeParse(raw: string): Annotation[] {
  try {
    return JSON.parse(raw) as Annotation[]
  } catch {
    return []
  }
}
