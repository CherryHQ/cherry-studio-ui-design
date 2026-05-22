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
} from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Badge } from "../ui/badge"
import { useAnnotationContext } from "./annotation-provider"
import { downloadJSON, copyJSON, parseImportJSON } from "./utils"

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
    exportAnnotations,
    importAnnotations,
    removeAnnotation,
    portalContainer,
  } = useAnnotationContext()

  const [copied, setCopied] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
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
        alert("Invalid annotation JSON file.")
      }
    }
    reader.readAsText(file)
    // Reset so same file can be re-imported
    e.target.value = ""
  }

  const handleClearAll = () => {
    if (!confirm("Clear all annotations? This cannot be undone.")) return
    for (const ann of [...allAnnotations]) {
      removeAnnotation(ann.id)
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
              Export JSON
              {totalCount > 0 && (
                <Badge variant="secondary" className="ml-auto mr-1">{totalCount}</Badge>
              )}
              <DropdownMenuShortcut>⌘⇧E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Clipboard />
              {copied ? "Copied!" : "Copy JSON"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyPrompt}>
              <Sparkles />
              {copiedPrompt ? "Copied!" : "Copy AI Prompt"}
              <DropdownMenuShortcut>⌘⇧F</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImport}>
              <Upload />
              Import JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onToggleList && (
              <DropdownMenuItem onClick={onToggleList}>
                <List />
                {listOpen ? "Hide List" : "Show List"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleClearResolved}>
              <CheckCircle2 />
              Clear Resolved
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleClearAll}>
              <Trash2 />
              Clear All
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
          title={enabled ? "Exit annotation mode (⌘⇧X)" : "Enter annotation mode (⌘⇧X)"}
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
