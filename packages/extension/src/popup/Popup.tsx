import { useEffect, useRef, useState } from "react"
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  type Annotation,
  generateSingleAnnotationPrompt,
} from "@cherry-studio/ui"
import {
  Download,
  Copy,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Keyboard,
  MousePointerClick,
  Sparkles,
  GitPullRequest,
  Camera,
  ScrollText,
} from "lucide-react"
import {
  loadAllAnnotations,
  loadSettings,
  saveSettings,
  type ExtensionSettings,
} from "../shared/storage"
import { useT, SUPPORTED_LOCALES, type Locale } from "../shared/i18n"

interface OriginGroup {
  origin: string
  annotations: Annotation[]
}

/** The Loupe brand mark — classic mouse cursor pointer. */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} fill="currentColor" strokeLinejoin="round">
      <path d="M 35 35 L 35 102 L 59 82 L 70 107 L 81 102 L 70 76 L 96 76 Z" />
    </svg>
  )
}

type PopupTab = "sites" | "guide" | "settings"

function readInitialTab(): PopupTab {
  try {
    const param = new URLSearchParams(window.location.search).get("tab")
    if (param === "sites" || param === "guide" || param === "settings") return param
  } catch {
    // location.search may not parse in some embedded contexts; ignore
  }
  return "sites"
}

export function Popup() {
  const { t } = useT()
  const [groups, setGroups] = useState<OriginGroup[]>([])
  const [tab, setTab] = useState<PopupTab>(readInitialTab)

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      const map = await loadAllAnnotations()
      if (cancelled) return
      const list: OriginGroup[] = []
      for (const [origin, annotations] of map) {
        if (annotations.length === 0) continue
        list.push({ origin, annotations })
      }
      list.sort((a, b) => b.annotations.length - a.annotations.length)
      setGroups(list)
    }
    refresh()
    // Live-refresh on any storage change while popup is open
    const handler = () => { void refresh() }
    chrome.storage.onChanged.addListener(handler)
    return () => {
      cancelled = true
      chrome.storage.onChanged.removeListener(handler)
    }
  }, [])

  // Show total counts (including orphaned). Matches in-page list semantics.
  const all = groups.flatMap((g) => g.annotations)
  const totalCount = all.length
  const unresolvedCount = all.filter((a) => !a.resolved).length

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandMark className="size-5 text-foreground" />
          <span className="font-semibold">Loupe</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{t("popup.totalCount", { count: totalCount })}</Badge>
          {unresolvedCount > 0 && (
            <Badge variant="secondary">{t("popup.openCount", { count: unresolvedCount })}</Badge>
          )}
        </div>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1 flex flex-col">
        <TabsList variant="line" className="mx-4 mt-2 px-1 gap-3 border-b border-border rounded-none">
          <TabsTrigger value="sites" className="text-xs px-1 h-8">{t("tabs.sites")}</TabsTrigger>
          <TabsTrigger value="guide" className="text-xs px-1 h-8">{t("tabs.guide")}</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs px-1 h-8">{t("tabs.settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" className="flex-1 overflow-y-auto p-4 space-y-3">
          {groups.length === 0 ? (
            <EmptyState />
          ) : (
            groups.map((g) => <OriginCard key={g.origin} group={g} />)
          )}
        </TabsContent>

        <TabsContent value="guide" className="flex-1 overflow-y-auto p-4">
          <GuidePanel />
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-y-auto p-4">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState() {
  const { t } = useT()
  return (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 gap-3">
      <BrandMark className="size-10 opacity-30" />
      <div>
        <p className="text-sm">{t("empty.title")}</p>
        <p className="text-xs mt-1">
          {t("empty.hint", { kbd: "⌘⇧X" }).split("⌘⇧X").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && <kbd className="px-1 bg-muted rounded">⌘⇧X</kbd>}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}

function OriginCard({ group }: { group: OriginGroup }) {
  const { t } = useT()
  const { origin, annotations } = group
  const [copied, setCopied] = useState(false)
  // Show total counts; orphaned has its own badge for visibility.
  const orphaned = annotations.filter((a) => a.orphaned).length
  const open = annotations.filter((a) => !a.resolved).length
  const resolved = annotations.filter((a) => a.resolved).length

  const handleOpen = () => {
    chrome.tabs.create({ url: origin })
  }

  const handleCopyAllPrompts = async () => {
    const prompts = annotations
      .filter((a) => !a.resolved)
      .map(generateSingleAnnotationPrompt)
      .join("\n\n---\n\n")
    await navigator.clipboard.writeText(prompts)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  // Two-step delete inside the popup. Calling `confirm()` here would steal
  // focus, close the popup, and the await/reload would run in a destroyed
  // context — silently dropping the delete. Inline confirm avoids that.
  const [confirming, setConfirming] = useState(false)
  const confirmTimerRef = useRef<number | null>(null)
  const handleClear = async () => {
    if (!confirming) {
      setConfirming(true)
      if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = window.setTimeout(() => setConfirming(false), 3000)
      return
    }
    if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current)
    setConfirming(false)
    const { saveAnnotationsFor } = await import("../shared/storage")
    await saveAnnotationsFor(origin, [])
    // Storage change event will refresh the popup automatically — no reload needed
  }
  useEffect(() => () => {
    if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current)
  }, [])

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="size-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate" title={origin}>
            {prettyOrigin(origin)}
          </span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={handleOpen} title={t("card.openIssue")}>
          <ExternalLink className="size-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="default">{t("card.openCount", { n: open })}</Badge>
        {resolved > 0 && (
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="size-3" />
            {resolved}
          </Badge>
        )}
        {orphaned > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="size-3" />
            {t("card.orphanedCount", { n: orphaned })}
          </Badge>
        )}
      </div>

      <div className="flex gap-1.5 pt-1">
        <Button variant="outline" size="xs" onClick={handleCopyAllPrompts} disabled={open === 0}>
          {copied ? <CheckCircle2 className="size-3 text-success" /> : <Copy className="size-3" />}
          {copied ? t("card.copied") : t("card.copyPrompts")}
        </Button>
        <Button
          variant={confirming ? "destructive" : "outline"}
          size="xs"
          onClick={handleClear}
          className={confirming ? "" : "text-destructive hover:text-destructive"}
          title={confirming ? t("card.confirmClearShort") : t("card.delete")}
        >
          <Trash2 className="size-3" />
          {confirming && <span className="text-[length:var(--fs-xs)] ml-1">{t("card.confirmClearShort")}</span>}
        </Button>
      </div>
    </div>
  )
}

function GuidePanel() {
  const { t } = useT()

  // Renders a label string that contains `{kbd}` placeholders by replacing
  // each placeholder with a styled <Kbd>. Multiple placeholders supported.
  const renderWithKbd = (template: string, ...keys: string[]) => {
    const parts = template.split(/\{kbd\}/g)
    const out: React.ReactNode[] = []
    parts.forEach((part, i) => {
      out.push(<span key={`p-${i}`}>{part}</span>)
      if (i < parts.length - 1) out.push(<Kbd key={`k-${i}`}>{keys[i] ?? "⌘"}</Kbd>)
    })
    return out
  }

  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <MousePointerClick className="size-3.5" />
          {t("guide.howItWorks")}
        </h3>
        <ol className="space-y-1.5 text-sm pl-4 list-decimal marker:text-muted-foreground">
          <li>{renderWithKbd(t("guide.step1"), "⌘⇧X")}</li>
          <li>{t("guide.step2")}</li>
          <li>{renderWithKbd(t("guide.step3"), "⌘Enter")}</li>
          <li>{t("guide.step4")}</li>
        </ol>
      </section>

      <hr className="border-border" />

      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Keyboard className="size-3.5" />
          {t("guide.shortcuts")}
        </h3>
        <div className="space-y-1 text-sm">
          <ShortcutLine keys="⌘⇧X" label={t("guide.shortcut.toggle")} />
          <ShortcutLine keys="⌘⇧F" label={t("guide.shortcut.copy")} />
          <ShortcutLine keys="⌘⇧E" label={t("guide.shortcut.export")} />
          <ShortcutLine keys="⌘⇧D" label={t("guide.shortcut.clear")} />
          <ShortcutLine keys="⌘Enter" label={t("guide.shortcut.save")} />
          <ShortcutLine keys="Esc" label={t("guide.shortcut.close")} />
        </div>
      </section>

      <hr className="border-border" />

      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Sparkles className="size-3.5" />
          {t("guide.features")}
        </h3>
        <ul className="space-y-1.5 text-sm">
          <Feature icon={<Camera className="size-3.5" />}>{t("guide.feature.screenshot")}</Feature>
          <Feature icon={<ScrollText className="size-3.5" />}>{t("guide.feature.diff")}</Feature>
          <Feature icon={<Copy className="size-3.5" />}>{t("guide.feature.prompt")}</Feature>
          <Feature icon={<GitPullRequest className="size-3.5" />}>{t("guide.feature.issue")}</Feature>
          <Feature icon={<Globe className="size-3.5" />}>{t("guide.feature.sync")}</Feature>
        </ul>
      </section>

      <hr className="border-border" />

      <p className="text-[length:var(--fs-xs)] text-muted-foreground leading-relaxed">
        {t("guide.privacy")}
      </p>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1 py-0.5 rounded-[var(--radius-dot)] bg-muted text-foreground text-[length:var(--fs-xs)] font-mono">
      {children}
    </kbd>
  )
}

function ShortcutLine({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-[var(--radius-dot)] hover:bg-muted/50">
      <span className="text-foreground">{label}</span>
      <Kbd>{keys}</Kbd>
    </div>
  )
}

function Feature({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex gap-2 items-start">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <span>{children}</span>
    </li>
  )
}

function SettingsPanel() {
  const { t, locale, setLocale } = useT()
  const [settings, setSettings] = useState<ExtensionSettings>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s)
      setLoaded(true)
    })
  }, [])

  const update = async (patch: Partial<ExtensionSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    await saveSettings(patch)
  }

  if (!loaded) return null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">{t("settings.language")}</h3>
        <select
          className="w-full rounded-[var(--radius-button)] border border-input bg-background px-2 py-1.5 text-sm"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
        >
          {SUPPORTED_LOCALES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-medium mb-2">{t("settings.captureOptions")}</h3>
        <label className="flex items-center justify-between text-sm">
          <span>{t("settings.captureScreenshots")}</span>
          <Switch
            checked={settings.captureScreenshots ?? true}
            onCheckedChange={(v) => update({ captureScreenshots: v })}
          />
        </label>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-medium mb-2">{t("settings.issueTracker")}</h3>
        <select
          className="w-full rounded-[var(--radius-button)] border border-input bg-background px-2 py-1.5 text-sm"
          value={settings.issueTracker || "none"}
          onChange={(e) => update({ issueTracker: e.target.value as ExtensionSettings["issueTracker"] })}
        >
          <option value="none">{t("settings.issueTracker.none")}</option>
          <option value="github">{t("settings.issueTracker.github")}</option>
          <option value="linear">{t("settings.issueTracker.linear")}</option>
        </select>

        {settings.issueTracker === "github" && (
          <div className="mt-2 space-y-2">
            <label className="block text-xs text-muted-foreground">{t("settings.githubToken")}</label>
            <input
              type="password"
              className="w-full rounded-[var(--radius-button)] border border-input bg-background px-2 py-1.5 text-sm font-mono"
              placeholder="ghp_..."
              value={settings.githubToken || ""}
              onChange={(e) => update({ githubToken: e.target.value })}
            />
            <label className="block text-xs text-muted-foreground">{t("settings.defaultRepo")}</label>
            <input
              type="text"
              className="w-full rounded-[var(--radius-button)] border border-input bg-background px-2 py-1.5 text-sm"
              placeholder="acme/website"
              value={settings.defaultRepo || ""}
              onChange={(e) => update({ defaultRepo: e.target.value })}
            />
          </div>
        )}

        {settings.issueTracker === "linear" && (
          <div className="mt-2 space-y-2">
            <label className="block text-xs text-muted-foreground">{t("settings.linearToken")}</label>
            <input
              type="password"
              className="w-full rounded-[var(--radius-button)] border border-input bg-background px-2 py-1.5 text-sm font-mono"
              placeholder="lin_api_..."
              value={settings.githubToken || ""}
              onChange={(e) => update({ githubToken: e.target.value })}
            />
            <label className="block text-xs text-muted-foreground">{t("settings.defaultTeam")}</label>
            <input
              type="text"
              className="w-full rounded-[var(--radius-button)] border border-input bg-background px-2 py-1.5 text-sm font-mono"
              placeholder="TEAM_xxxxxxxx"
              value={settings.defaultRepo || ""}
              onChange={(e) => update({ defaultRepo: e.target.value })}
            />
          </div>
        )}
      </div>

      <hr className="border-border" />

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={async () => {
          const map = await loadAllAnnotations()
          const flat = Array.from(map.entries()).flatMap(([origin, anns]) =>
            anns.map((a) => ({ ...a, origin })),
          )
          const blob = new Blob([JSON.stringify(flat, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `loupe-export-${new Date().toISOString().slice(0, 10)}.json`
          a.click()
          URL.revokeObjectURL(url)
        }}
      >
        <Download className="size-3.5" />
        {t("settings.exportAll")}
      </Button>
    </div>
  )
}

function prettyOrigin(origin: string): string {
  try {
    return new URL(origin).hostname.replace(/^www\./, "")
  } catch {
    return origin
  }
}
