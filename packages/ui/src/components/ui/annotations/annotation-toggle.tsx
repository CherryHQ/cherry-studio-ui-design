import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  MessageSquarePlus,
  Download,
  Upload,
  Clipboard,
  List,
  Trash2,
  CheckCircle2,
  Sparkles,
  Palette,
  Accessibility,
} from "lucide-react"
import { Button } from "../button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { Badge } from "../badge"
import { useAnnotationContext } from "./annotation-provider"
import { downloadJSON, copyJSON, parseImportJSON } from "./utils"
import { extractDesignSpec, formatDesignSpecMarkdown } from "./extract-design-spec"
import { runA11yAudit } from "./a11y-audit"
import { generateSelector, generateElementLabel, generateBreadcrumb, captureComputedStyles } from "./utils"

interface AnnotationToggleProps {
  onToggleList?: () => void
  listOpen?: boolean
}

export function AnnotationToggle({ onToggleList, listOpen }: AnnotationToggleProps) {
  const {
    allAnnotations,
    annotations,
    enabled,
    setEnabled,
    addAnnotation,
    exportAnnotations,
    importAnnotations,
    removeAnnotation,
    portalContainer,
    page,
    messages,
  } = useAnnotationContext()

  const [copied, setCopied] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [auditCount, setAuditCount] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Protect from Radix Dialog's inert/aria-hidden
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    Object.defineProperty(el, "inert", { get() { return false }, set() {}, configurable: true })
    const obs = new MutationObserver(() => {
      HTMLElement.prototype.removeAttribute.call(el, "inert")
      HTMLElement.prototype.removeAttribute.call(el, "aria-hidden")
    })
    obs.observe(el, { attributes: true, attributeFilter: ["inert", "aria-hidden"] })
    return () => { obs.disconnect(); delete (el as any).inert }
  }, [])

  // Show all counts (including orphaned). Orphaned annotations are still
  // valid data — they're shown in the list with a badge, included in exports,
  // and surface in AI prompts. Excluding them from counts caused mismatches.
  const count = annotations.length
  const totalCount = allAnnotations.length

  const handleExport = () => {
    const json = exportAnnotations()
    downloadJSON(json, "annotations.json")
  }

  const handleCopy = async () => {
    const json = exportAnnotations()
    const ok = await copyJSON(json)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyPrompt = async () => {
    const json = exportAnnotations()
    const parsed = JSON.parse(json)
    const prompt = parsed.actionPrompt || ""
    const ok = await copyJSON(prompt)
    if (ok) {
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    }
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = parseImportJSON(reader.result as string)
      if (result && result.length > 0) {
        importAnnotations(result)
      } else {
        alert(messages.invalidImportFile)
      }
    }
    reader.readAsText(file)
    // Reset so same file can be re-imported
    e.target.value = ""
  }

  const handleClearAll = () => {
    if (!confirm(messages.confirmClearAll)) return
    for (const ann of [...allAnnotations]) {
      removeAnnotation(ann.id)
    }
  }

  const handleA11yAudit = async () => {
    await new Promise((r) => setTimeout(r, 0))
    const issues = runA11yAudit()

    // Snapshot semantics: each audit run replaces all UNRESOLVED a11y
    // annotations with the current findings. Stable dedup keys based on
    // `selector` are unreliable because `shortSelector()` uses :nth-of-type,
    // which drifts whenever sibling order changes — even a render that
    // re-orders children within a list bumps the index. Just clearing &
    // re-adding gives the user a clean live snapshot every run.
    //
    // Resolved a11y annotations are preserved — user explicitly marked them
    // (whether truly fixed or "won't fix"), so we don't want to keep
    // re-creating them.
    const isA11y = (comment: string) => /^\[a11y\//.test(comment)
    for (const ann of allAnnotations) {
      if (isA11y(ann.comment) && !ann.resolved) removeAnnotation(ann.id)
    }
    // Resolved a11y annotations stay in storage; if they describe an issue
    // that's still present, skip re-adding it so user's "resolved" state isn't
    // overridden by a fresh duplicate. Match by `kind + elementLabel` (more
    // stable than selector across DOM re-renders).
    const resolvedA11yKeys = new Set(
      allAnnotations
        .filter((a) => a.resolved && isA11y(a.comment))
        .map((a) => {
          const kind = a.comment.match(/^\[a11y\/([^\]]+)\]/)?.[1]
          return kind ? `${kind}|${a.elementLabel}` : null
        })
        .filter((k): k is string => k !== null),
    )

    let added = 0
    for (const issue of issues) {
      if (resolvedA11yKeys.has(`${issue.kind}|${issue.elementLabel}`)) continue
      const el = (() => {
        try { return document.querySelector(issue.selector) as HTMLElement | null }
        catch { return null }
      })()
      const rect = el?.getBoundingClientRect()
      addAnnotation({
        selector: issue.selector,
        elementLabel: issue.elementLabel,
        breadcrumb: el ? generateBreadcrumb(el) : issue.elementLabel,
        comment: `[a11y/${issue.kind}] ${issue.message}`,
        category: "bug",
        page,
        sourceHint: el ? generateElementLabel(el) : issue.elementLabel,
        position: { x: 0.5, y: 0.5 },
        rect: { width: rect ? Math.round(rect.width) : 0, height: rect ? Math.round(rect.height) : 0 },
        computedStyles: el
          ? captureComputedStyles(el)
          : ({} as ReturnType<typeof captureComputedStyles>),
        className: el?.getAttribute("class") || "",
      })
      added++
    }

    setAuditCount(added)
    setTimeout(() => setAuditCount(null), 3000)
  }

  // Silence "imported but not used in body" if generateSelector tree-shakes elsewhere
  void generateSelector

  const handleExtractSpec = async () => {
    // Run extraction asynchronously so the dropdown can close cleanly first
    await new Promise((r) => setTimeout(r, 0))
    const spec = extractDesignSpec()
    const md = formatDesignSpecMarkdown(spec)
    // Download the full structured JSON …
    downloadJSON(JSON.stringify(spec, null, 2), `design-spec-${spec.origin.replace(/^https?:\/\//, "").replace(/[^\w.-]/g, "_")}.json`)
    // … and copy the human/AI-friendly markdown to the clipboard
    const ok = await copyJSON(md)
    if (ok) {
      setExtracted(true)
      setTimeout(() => setExtracted(false), 2500)
    }
  }

  const handleClearResolved = () => {
    const resolved = allAnnotations.filter((a) => a.resolved)
    if (resolved.length === 0) return
    for (const ann of resolved) {
      removeAnnotation(ann.id)
    }
  }

  return createPortal(
    <div
      ref={containerRef}
      data-annotation-ui
      className="fixed bottom-6 right-6 pointer-events-auto"
      style={{ zIndex: 99999 }}
    >
      <div className="flex items-center gap-1.5">
        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full shadow-lg">
              <List className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={8}
            className="min-w-[220px]"
            container={portalContainer as HTMLElement | null}
          >
            <DropdownMenuItem onClick={handleExport}>
              <Download />
              {messages.exportJson}
              {totalCount > 0 && (
                <Badge variant="secondary" className="ml-auto mr-1">{totalCount}</Badge>
              )}
              <DropdownMenuShortcut>⌘⇧E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Clipboard />
              {copied ? messages.copied : messages.copyJson}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyPrompt}>
              <Sparkles />
              {copiedPrompt ? messages.copied : messages.copyAiPrompt}
              <DropdownMenuShortcut>⌘⇧F</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImport}>
              <Upload />
              {messages.importJson}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExtractSpec}>
              <Palette />
              {extracted ? messages.copied : messages.extractDesignSpec}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleA11yAudit}>
              <Accessibility />
              {auditCount !== null
                ? messages.a11yAuditDone(auditCount)
                : messages.a11yAudit}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onToggleList && (
              <DropdownMenuItem onClick={onToggleList}>
                <List />
                {listOpen ? messages.hideList : messages.showList}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleClearResolved}>
              <CheckCircle2 />
              {messages.clearResolved}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleClearAll}>
              <Trash2 />
              {messages.clearAll}
              <DropdownMenuShortcut className="text-destructive/70">⌘⇧D</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Toggle annotation mode */}
        <Button
          variant={enabled ? "default" : "outline"}
          size="icon-lg"
          className={`rounded-full shadow-lg relative ${enabled ? "ring-4 ring-primary/20" : ""}`}
          onClick={() => setEnabled(!enabled)}
          title={enabled ? messages.exitAnnotationMode : messages.enterAnnotationMode}
        >
          <MessageSquarePlus className="size-5" />
          {count > 0 && (
            <Badge
              variant={enabled ? "outline" : "default"}
              className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 text-[length:var(--fs-xs)] rounded-full"
            >
              {count}
            </Badge>
          )}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>,
    portalContainer || document.body,
  )
}
