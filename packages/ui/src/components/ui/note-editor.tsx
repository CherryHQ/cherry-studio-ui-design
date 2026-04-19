"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Textarea } from "./textarea"
import { Badge } from "./badge"
import { Separator } from "./separator"
import { ScrollArea } from "./scroll-area"
import { SimpleTooltip } from "./simple-tooltip"
import { MarkdownRenderer } from "./markdown-renderer"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./resizable"
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code,
  Minus, Link, Image as ImageIcon,
  Braces, Table, Check,
  Undo2, Redo2,
  PenLine, Eye, Columns2,
} from "lucide-react"

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

export type NoteEditorMode = "edit" | "preview" | "split"

export interface NoteEditorProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  /** Markdown content */
  content: string
  /** Content change handler */
  onChange: (content: string) => void

  /** Editor mode */
  mode?: NoteEditorMode
  /** Mode change handler */
  onModeChange?: (mode: NoteEditorMode) => void

  /** Show formatting toolbar (default: true) */
  showToolbar?: boolean
  /** Extra toolbar actions rendered after built-in buttons */
  toolbarActions?: React.ReactNode

  /** Show AI panel slot on the right */
  showAIPanel?: boolean
  /** Toggle AI panel handler */
  onToggleAIPanel?: () => void
  /** AI panel content (rendered in the right slot) */
  aiPanelContent?: React.ReactNode

  /** Show word count in status bar (default: true) */
  wordCount?: boolean
  /** Show character count in status bar (default: true) */
  charCount?: boolean
  /** Last-saved timestamp shown in status bar */
  lastSaved?: string

  /** Save handler — also bound to Ctrl/Cmd+S */
  onSave?: () => void
  /** Export handler */
  onExport?: () => void

  /** Read-only mode (default: false) */
  readOnly?: boolean

  /** Placeholder for the editor textarea */
  placeholder?: string

  /** UI text overrides for i18n */
  labels?: NoteEditorLabels
}

export interface NoteEditorLabels {
  edit?: string
  preview?: string
  split?: string
  undo?: string
  redo?: string
  h1?: string
  h2?: string
  h3?: string
  bold?: string
  italic?: string
  underline?: string
  strikethrough?: string
  unorderedList?: string
  orderedList?: string
  quote?: string
  inlineCode?: string
  divider?: string
  insertLink?: string
  insertImage?: string
  codeBlock?: string
  table?: string
  taskList?: string
  modeEdit?: string
  modePreview?: string
  modeSplit?: string
  lines?: string
  chars?: string
  words?: string
  canUndo?: string
}

/* ──────────────────────────────────────────────
   Undo/Redo hook
   ────────────────────────────────────────────── */

function useUndoRedo(content: string, onChange: (v: string) => void) {
  const undoRef = React.useRef<string[]>([])
  const redoRef = React.useRef<string[]>([])
  const [, rerender] = React.useState(0)

  const push = React.useCallback(
    (next: string) => {
      undoRef.current = [...undoRef.current.slice(-49), content]
      redoRef.current = []
      onChange(next)
      rerender((n) => n + 1)
    },
    [content, onChange],
  )

  const undo = React.useCallback(() => {
    if (undoRef.current.length === 0) return
    const prev = undoRef.current[undoRef.current.length - 1]
    redoRef.current = [...redoRef.current, content]
    undoRef.current = undoRef.current.slice(0, -1)
    onChange(prev)
    rerender((n) => n + 1)
  }, [content, onChange])

  const redo = React.useCallback(() => {
    if (redoRef.current.length === 0) return
    const next = redoRef.current[redoRef.current.length - 1]
    undoRef.current = [...undoRef.current, content]
    redoRef.current = redoRef.current.slice(0, -1)
    onChange(next)
    rerender((n) => n + 1)
  }, [content, onChange])

  return {
    push,
    undo,
    redo,
    canUndo: undoRef.current.length > 0,
    canRedo: redoRef.current.length > 0,
    undoCount: undoRef.current.length,
  }
}

/* ──────────────────────────────────────────────
   Toolbar button helper
   ────────────────────────────────────────────── */

const TB_CLS =
  "h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[var(--radius-button)] flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-colors"
const TB_DISABLED =
  "h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[var(--radius-button)] flex items-center justify-center text-muted-foreground/30 cursor-not-allowed"

/* ──────────────────────────────────────────────
   Editor pane (textarea)
   ────────────────────────────────────────────── */

interface EditorPaneProps {
  content: string
  onUpdate: (v: string) => void
  onUndo: () => void
  onRedo: () => void
  onSave?: () => void
  readOnly?: boolean
  placeholder?: string
  editorRef: React.RefObject<HTMLTextAreaElement | null>
}

function EditorPane({ content, onUpdate, onUndo, onRedo, onSave, readOnly, placeholder, editorRef }: EditorPaneProps) {
  return (
    <div className="flex h-full">
      {/* Line-number gutter */}
      <div className="w-10 bg-muted/20 shrink-0" />
      <Textarea
        ref={editorRef}
        value={content}
        onChange={(e) => onUpdate(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "z") {
            e.preventDefault()
            if (e.shiftKey) onRedo()
            else onUndo()
          }
          if ((e.metaKey || e.ctrlKey) && e.key === "s") {
            e.preventDefault()
            onSave?.()
          }
          if (e.key === "Tab") {
            e.preventDefault()
            const ta = e.currentTarget
            const start = ta.selectionStart
            const end = ta.selectionEnd
            const next = content.slice(0, start) + "  " + content.slice(end)
            onUpdate(next)
            setTimeout(() => {
              ta.selectionStart = ta.selectionEnd = start + 2
            }, 0)
          }
        }}
        readOnly={readOnly}
        spellCheck={false}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0 rounded-none text-sm text-foreground font-mono leading-[22px] resize-none py-8 pr-10 placeholder:text-muted-foreground/30 [&::-webkit-scrollbar]:hidden"
        style={{ tabSize: 2 }}
      />
    </div>
  )
}

/* ──────────────────────────────────────────────
   Preview pane
   ────────────────────────────────────────────── */

function PreviewPane({ content }: { content: string }) {
  return (
    <div className="max-w-[780px] mx-auto px-10 py-8">
      <MarkdownRenderer content={content} className="text-sm leading-relaxed" />
    </div>
  )
}

/* ──────────────────────────────────────────────
   NoteEditor
   ────────────────────────────────────────────── */

function NoteEditor({
  content,
  onChange,
  mode: modeProp,
  onModeChange,
  showToolbar = true,
  toolbarActions,
  showAIPanel = false,
  aiPanelContent,
  wordCount: showWordCount = true,
  charCount: showCharCount = true,
  lastSaved,
  onSave,
  readOnly = false,
  placeholder = "开始编辑...",
  labels: labelsProp,
  className,
  ...props
}: NoteEditorProps) {
  const t = {
    edit: "编辑", preview: "预览", split: "分栏",
    undo: "撤销", redo: "重做",
    h1: "标题 1", h2: "标题 2", h3: "标题 3",
    bold: "加粗", italic: "斜体", underline: "下划线", strikethrough: "删除线",
    unorderedList: "无序列表", orderedList: "有序列表", quote: "引用", inlineCode: "行内代码",
    divider: "分割线", insertLink: "插入链接", insertImage: "插入图片",
    codeBlock: "代码块", table: "表格", taskList: "任务列表",
    modeEdit: "Markdown", modePreview: "只读预览", modeSplit: "分栏",
    lines: "行", chars: "字符", words: "词", canUndo: "可撤销",
    ...labelsProp,
  }
  // Controlled / uncontrolled mode
  const [internalMode, setInternalMode] = React.useState<NoteEditorMode>("edit")
  const mode = modeProp ?? internalMode
  const setMode = React.useCallback(
    (m: NoteEditorMode) => {
      if (onModeChange) onModeChange(m)
      else setInternalMode(m)
    },
    [onModeChange],
  )

  const editorRef = React.useRef<HTMLTextAreaElement>(null)
  const { push, undo, redo, canUndo, canRedo, undoCount } = useUndoRedo(content, onChange)

  // ── Markdown insertion helpers ──

  const insertMarkdown = React.useCallback(
    (before: string, after?: string, ph?: string) => {
      if (!editorRef.current) return
      const ta = editorRef.current
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const selected = content.slice(start, end)
      const insert = selected || ph || ""
      const next = content.slice(0, start) + before + insert + (after || "") + content.slice(end)
      push(next)
      setTimeout(() => {
        ta.focus()
        ta.selectionStart = start + before.length
        ta.selectionEnd = start + before.length + insert.length
      }, 0)
    },
    [content, push],
  )

  const insertLinePrefix = React.useCallback(
    (prefix: string) => {
      if (!editorRef.current) return
      const ta = editorRef.current
      const start = ta.selectionStart
      const lineStart = content.lastIndexOf("\n", start - 1) + 1
      const next = content.slice(0, lineStart) + prefix + content.slice(lineStart)
      push(next)
      setTimeout(() => {
        ta.focus()
        ta.selectionStart = ta.selectionEnd = start + prefix.length
      }, 0)
    },
    [content, push],
  )

  // ── Global Ctrl+S ──
  React.useEffect(() => {
    if (!onSave) return
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        onSave()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onSave])

  // ── Stats ──
  const lines = content.split("\n").length
  const chars = content.length
  const words = content.trim() ? content.trim().split(/\s+/).length : 0

  // ── Mode label for status bar ──
  const modeLabel = mode === "edit" ? t.modeEdit : mode === "preview" ? t.modePreview : t.modeSplit

  return (
    <div
      data-slot="note-editor"
      className={cn("flex flex-col min-h-0 bg-background", className)}
      {...props}
    >
      {/* ── Mode switcher + Toolbar row ── */}
      {showToolbar && !readOnly && (
        <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0">
          {/* Mode switcher */}
          <div className="flex items-center bg-accent/40 rounded-[var(--radius-button)] p-0.5 gap-0.5">
            <SimpleTooltip content={t.edit}>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setMode("edit")}
                className={`h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[var(--radius-button)] flex items-center justify-center transition-colors ${
                  mode === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground/60 hover:text-foreground"
                }`}
              >
                <PenLine size={11} />
              </Button>
            </SimpleTooltip>
            <SimpleTooltip content={t.preview}>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setMode("preview")}
                className={`h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[var(--radius-button)] flex items-center justify-center transition-colors ${
                  mode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground/60 hover:text-foreground"
                }`}
              >
                <Eye size={11} />
              </Button>
            </SimpleTooltip>
            <SimpleTooltip content={t.split}>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setMode("split")}
                className={`h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[var(--radius-button)] flex items-center justify-center transition-colors ${
                  mode === "split" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground/60 hover:text-foreground"
                }`}
              >
                <Columns2 size={11} />
              </Button>
            </SimpleTooltip>
          </div>

          {/* Toolbar buttons — hidden in preview-only mode */}
          {mode !== "preview" && (
            <div className="flex items-center gap-0.5 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden bg-muted/20 rounded-[var(--radius-button)] px-1.5 py-1">
              {/* Undo / Redo */}
              <SimpleTooltip content={t.undo}>
                <Button variant="ghost" type="button" onClick={undo} className={canUndo ? TB_CLS : TB_DISABLED}>
                  <Undo2 size={13} />
                </Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.redo}>
                <Button variant="ghost" type="button" onClick={redo} className={canRedo ? TB_CLS : TB_DISABLED}>
                  <Redo2 size={13} />
                </Button>
              </SimpleTooltip>
              <Separator orientation="vertical" className="h-4 bg-border/20 mx-1" />

              {/* Headings */}
              <SimpleTooltip content={t.h1}>
                <Button variant="ghost" type="button" onClick={() => insertLinePrefix("# ")} className={TB_CLS}><Heading1 size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.h2}>
                <Button variant="ghost" type="button" onClick={() => insertLinePrefix("## ")} className={TB_CLS}><Heading2 size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.h3}>
                <Button variant="ghost" type="button" onClick={() => insertLinePrefix("### ")} className={TB_CLS}><Heading3 size={13} /></Button>
              </SimpleTooltip>
              <Separator orientation="vertical" className="h-4 bg-border/20 mx-1" />

              {/* Inline formatting */}
              <SimpleTooltip content={t.bold}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("**", "**", "粗体文字")} className={TB_CLS}><Bold size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.italic}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("*", "*", "斜体文字")} className={TB_CLS}><Italic size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.underline}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("<u>", "</u>", "下划线文字")} className={TB_CLS}><Underline size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.strikethrough}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("~~", "~~", "删除线文字")} className={TB_CLS}><Strikethrough size={13} /></Button>
              </SimpleTooltip>
              <Separator orientation="vertical" className="h-4 bg-border/20 mx-1" />

              {/* Block elements */}
              <SimpleTooltip content={t.unorderedList}>
                <Button variant="ghost" type="button" onClick={() => insertLinePrefix("- ")} className={TB_CLS}><List size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.orderedList}>
                <Button variant="ghost" type="button" onClick={() => insertLinePrefix("1. ")} className={TB_CLS}><ListOrdered size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.quote}>
                <Button variant="ghost" type="button" onClick={() => insertLinePrefix("> ")} className={TB_CLS}><Quote size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.inlineCode}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("`", "`", "code")} className={TB_CLS}><Code size={13} /></Button>
              </SimpleTooltip>
              <Separator orientation="vertical" className="h-4 bg-border/20 mx-1" />

              {/* Insert */}
              <SimpleTooltip content={t.divider}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("\n---\n")} className={TB_CLS}><Minus size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.insertLink}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("[", "](url)", "链接文字")} className={TB_CLS}><Link size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.insertImage}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("![", "](image-url)", "图片描述")} className={TB_CLS}><ImageIcon size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.codeBlock}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("\n```\n", "\n```\n", "// 代码")} className={TB_CLS}><Braces size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.table}>
                <Button variant="ghost" type="button" onClick={() => insertMarkdown("\n| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n")} className={TB_CLS}><Table size={13} /></Button>
              </SimpleTooltip>
              <SimpleTooltip content={t.taskList}>
                <Button variant="ghost" type="button" onClick={() => insertLinePrefix("- [ ] ")} className={TB_CLS}><Check size={13} /></Button>
              </SimpleTooltip>

              {/* Extra actions from consumer */}
              {toolbarActions}
            </div>
          )}
        </div>
      )}

      {/* ── Editor body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          {mode === "edit" && (
            <EditorPane
              content={content}
              onUpdate={push}
              onUndo={undo}
              onRedo={redo}
              onSave={onSave}
              readOnly={readOnly}
              placeholder={placeholder}
              editorRef={editorRef}
            />
          )}
          {mode === "preview" && <PreviewPane content={content} />}
          {mode === "split" && (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full overflow-y-auto">
                  <EditorPane
                    content={content}
                    onUpdate={push}
                    onUndo={undo}
                    onRedo={redo}
                    onSave={onSave}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    editorRef={editorRef}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle className="bg-border/30" />
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full overflow-y-auto">
                  <PreviewPane content={content} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </ScrollArea>

        {/* AI panel slot */}
        {showAIPanel && aiPanelContent && (
          <div className="w-[320px] flex-shrink-0 border-l border-border/40 flex flex-col min-h-0">
            {aiPanelContent}
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="h-7 flex items-center px-4 text-xs text-muted-foreground/40 flex-shrink-0 gap-4">
        <Badge
          variant="secondary"
          className={`px-1.5 py-0.5 text-[10px] ${
            mode !== "preview" ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground/60"
          }`}
        >
          {modeLabel}
        </Badge>
        <span>{lines} {t.lines}</span>
        {showCharCount && <span>{chars} {t.chars}</span>}
        {showWordCount && <span>{words} {t.words}</span>}
        {canUndo && <span className="text-muted-foreground/30">{t.canUndo} {undoCount}</span>}
        <div className="flex-1" />
        {lastSaved && (
          <span className="flex items-center gap-1 text-primary animate-in fade-in duration-200">
            <Check size={12} />
            {lastSaved}
          </span>
        )}
        <span>UTF-8</span>
      </div>
    </div>
  )
}

export { NoteEditor }
