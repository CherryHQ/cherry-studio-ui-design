import React from "react"
import { Button, Badge } from "@cherry-studio/ui"
import {
  Pin,
  Keyboard,
  MousePointerClick,
  Settings,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { useT } from "../shared/i18n"

export function Welcome() {
  const { t } = useT()

  const openSettings = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("src/popup/index.html") + "?tab=settings",
    })
  }

  /** Replace `{kbd}` placeholders with styled <Kbd> components */
  const withKbd = (template: string, ...keys: string[]) => {
    const parts = template.split(/\{kbd\}/g)
    const out: React.ReactNode[] = []
    parts.forEach((part, i) => {
      out.push(<span key={`p${i}`}>{part}</span>)
      if (i < parts.length - 1) out.push(<Kbd key={`k${i}`}>{keys[i] ?? "⌘"}</Kbd>)
    })
    return out
  }

  /** Replace `{strong}`, `{puzzle}`, `{pin}` placeholders */
  const withMarks = (template: string) => {
    const re = /\{(strong|puzzle|pin)\}/g
    const out: React.ReactNode[] = []
    let lastIdx = 0
    let m: RegExpExecArray | null
    let i = 0
    while ((m = re.exec(template)) !== null) {
      out.push(template.slice(lastIdx, m.index))
      const tag = m[1]
      if (tag === "strong") out.push(<strong key={i++}>Loupe</strong>)
      if (tag === "puzzle") out.push(<Badge key={i++} variant="outline" className="font-mono">🧩</Badge>)
      if (tag === "pin") out.push(<Pin key={i++} className="size-3 inline align-middle" />)
      lastIdx = m.index + m[0].length
    }
    out.push(template.slice(lastIdx))
    return out
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex size-16 rounded-[var(--radius-window)] items-center justify-center bg-black shadow-lg dark:ring-1 dark:ring-white/15">
            {/* Inline SVG mirror of the extension icon — classic cursor pointer */}
            <svg viewBox="0 0 128 128" className="size-10" fill="#fff" strokeLinejoin="round">
              <path d="M 35 35 L 35 102 L 59 82 L 70 107 L 81 102 L 70 76 L 96 76 Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to Loupe</h1>
          <p className="text-muted-foreground">{t("welcome.heroSubtitle")}</p>
        </div>

        {/* Step 1: Pin */}
        <Step number={1} icon={<Pin className="size-5" />} title={t("welcome.step.pin.title")}>
          <p>{withMarks(t("welcome.step.pin.body"))}</p>
          <p className="text-muted-foreground text-sm">{t("welcome.step.pin.subtitle")}</p>
        </Step>

        {/* Step 2: Try */}
        <Step
          number={2}
          icon={<MousePointerClick className="size-5" />}
          title={t("welcome.step.try.title")}
        >
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2 items-start">
              <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
              <span>{withKbd(t("welcome.step.try.b1"), "⌘⇧X")}</span>
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
              <span>{t("welcome.step.try.b2")}</span>
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
              <span>{withKbd(t("welcome.step.try.b3"), "⌘Enter")}</span>
            </li>
          </ul>
        </Step>

        {/* Step 3: Shortcuts */}
        <Step number={3} icon={<Keyboard className="size-5" />} title={t("welcome.step.shortcuts.title")}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <ShortcutRow keys="⌘⇧X" label={t("guide.shortcut.toggle")} />
            <ShortcutRow keys="⌘⇧F" label={t("guide.shortcut.copy")} />
            <ShortcutRow keys="⌘⇧E" label={t("guide.shortcut.export")} />
            <ShortcutRow keys="⌘⇧D" label={t("guide.shortcut.clear")} />
            <ShortcutRow keys="⌘Enter" label={t("guide.shortcut.save")} />
            <ShortcutRow keys="Esc" label={t("guide.shortcut.close")} />
          </div>
        </Step>

        {/* Step 4: AI handoff */}
        <Step number={4} icon={<Settings className="size-5" />} title={t("welcome.step.handoff.title")}>
          <p className="text-sm">{withKbd(t("welcome.step.handoff.body"), "⌘⇧F")}</p>
          <p className="text-sm text-muted-foreground mt-2">{t("welcome.step.handoff.note")}</p>
          <p className="text-sm text-muted-foreground mt-2">{t("welcome.step.handoff.optional")}</p>
          <Button variant="outline" onClick={openSettings} className="mt-3">
            {t("welcome.openSettings")}
            <ArrowRight className="size-3.5" />
          </Button>
        </Step>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
          <p>{t("welcome.privacyLine1")}</p>
          <p>{t("welcome.privacyLine2")}</p>
        </div>
      </div>
    </div>
  )
}

function Step({
  number,
  icon,
  title,
  children,
}: {
  number: number
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-card p-5 space-y-3">
      <header className="flex items-center gap-3">
        <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
          {number}
        </div>
        <div className="size-9 rounded-[var(--radius-button)] bg-muted text-foreground flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h2 className="text-base font-medium">{title}</h2>
      </header>
      <div className="pl-10 space-y-2 text-foreground">{children}</div>
    </section>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 mx-0.5 rounded-[var(--radius-dot)] bg-muted text-foreground text-xs font-mono">
      {children}
    </kbd>
  )
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-[var(--radius-dot)] bg-muted/50">
      <span className="text-foreground">{label}</span>
      <Kbd>{keys}</Kbd>
    </div>
  )
}
