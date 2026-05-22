import React, { useState, useEffect, useRef, useMemo } from "react"
import { Check, CheckCircle2, Clipboard, Pencil, Trash2, X, Zap } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { cn } from "../lib/utils"
import { generateSingleAnnotationPrompt, computeStyleDiff, copyJSON } from "./utils"
import type { Annotation, AnnotationCategory } from "./types"

const CATEGORIES: { value: AnnotationCategory; label: string }[] = [
  { value: "style", label: "Style" },
  { value: "layout", label: "Layout" },
  { value: "interaction", label: "Interaction" },
  { value: "content", label: "Content" },
  { value: "bug", label: "Bug" },
  { value: "other", label: "Other" },
]

const PRESETS: Record<AnnotationCategory, { label: string; prompt: string }[]> = {
  style: [
    { label: "字号不对", prompt: "字号与设计稿不一致，应该改为 {?}px" },
    { label: "颜色不对", prompt: "颜色与设计稿不一致，应该改为 {?}" },
    { label: "间距调整", prompt: "间距需要调整，应该改为 {?}px" },
    { label: "圆角调整", prompt: "圆角需要调整，应该改为 {?}px" },
    { label: "暗色适配", prompt: "暗色模式下样式异常，需要适配" },
    { label: "阴影调整", prompt: "阴影效果与设计稿不一致" },
  ],
  layout: [
    { label: "对齐方式", prompt: "对齐方式错误，应该改为 {居中/左对齐/右对齐}" },
    { label: "宽度不对", prompt: "宽度与设计稿不一致，应该为 {?}px" },
    { label: "高度不对", prompt: "高度与设计稿不一致，应该为 {?}px" },
    { label: "排列方式", prompt: "排列方式需要从 {横向/纵向} 改为 {横向/纵向}" },
    { label: "溢出处理", prompt: "内容溢出时需要 {截断/换行/滚动}" },
    { label: "响应式", prompt: "在窄屏下布局需要调整" },
  ],
  interaction: [
    { label: "缺少 hover", prompt: "缺少 hover 状态效果" },
    { label: "缺少 active", prompt: "缺少 active/pressed 状态反馈" },
    { label: "缺少 loading", prompt: "操作时缺少 loading 状态" },
    { label: "缺少动画", prompt: "需要添加过渡动画效果" },
    { label: "点击无响应", prompt: "点击后无任何响应/反馈" },
    { label: "键盘操作", prompt: "需要支持键盘操作 (Enter/Esc/Tab)" },
  ],
  content: [
    { label: "文案修改", prompt: "文案需要改为「{?}」" },
    { label: "缺少空态", prompt: "数据为空时缺少空状态提示" },
    { label: "图标替换", prompt: "图标需要替换为 {?}" },
    { label: "多语言", prompt: "文案需要支持国际化/多语言" },
    { label: "添加功能", prompt: "需要新增 {?} 功能" },
    { label: "参考实现", prompt: "参考 {Agent/Assistant} 页面的 {?} 实现" },
  ],
  bug: [
    { label: "显示异常", prompt: "显示异常：{?}" },
    { label: "功能失效", prompt: "功能不可用：{?}" },
    { label: "数据错误", prompt: "数据显示不正确：{?}" },
    { label: "控制台报错", prompt: "控制台有报错信息" },
    { label: "闪烁/抖动", prompt: "元素出现闪烁/抖动现象" },
    { label: "性能问题", prompt: "操作卡顿/渲染性能差" },
  ],
  other: [
    { label: "需要讨论", prompt: "这里需要讨论：{?}" },
    { label: "组件替换", prompt: "需要替换为设计系统中的 {?} 组件" },
    { label: "代码重构", prompt: "代码需要重构：{?}" },
    { label: "自定义", prompt: "" },
  ],
}

interface AnnotationBubbleProps {
  annotation?: Annotation
  style?: React.CSSProperties
  onSave: (comment: string, category: AnnotationCategory) => void
  onUpdate?: (id: string, comment: string) => void
  onResolve?: (id: string) => void
  onDelete?: (id: string) => void
  onClose: () => void
  elementLabel?: string
  breadcrumb?: string
  /** Custom action buttons (rendered before built-in Edit/Resolve/Delete) */
  customActions?: import("./types").BubbleAction[]
}

export function AnnotationBubble({
  annotation,
  style: posStyle,
  onSave,
  onUpdate,
  onResolve,
  onDelete,
  onClose,
  elementLabel,
  breadcrumb,
  customActions,
}: AnnotationBubbleProps) {
  const isCreate = !annotation
  const [comment, setComment] = useState(annotation?.comment || "")
  const [category, setCategory] = useState<AnnotationCategory>(annotation?.category || "style")
  const [editing, setEditing] = useState(isCreate)
  const [showStyles, setShowStyles] = useState(false)
  const [showPresets, setShowPresets] = useState(isCreate)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Style diff: compare saved vs current computed styles
  const styleDiff = useMemo(() => {
    if (!annotation?.computedStyles || !showStyles) return null
    try {
      const el = document.querySelector(annotation.selector) as HTMLElement | null
      return computeStyleDiff(annotation.computedStyles, el)
    } catch {
      return null
    }
  }, [annotation, showStyles])

  // Defeat Radix Dialog focus trap when annotation bubble is in edit mode.
  //
  // Radix FocusScope adds two document-level handlers (bubble phase):
  //   - `focusout`: when focus LEAVES the dialog, if relatedTarget (where focus
  //     is going) is outside the scope → immediately redirect focus back.
  //   - `focusin`: when focus ENTERS somewhere, if target is outside the scope
  //     → redirect focus back.
  //
  // The `focusout` fires FIRST (before focusin), so it's the one that actually
  // steals focus. Buttons work because click doesn't need sustained focus, but
  // the textarea needs focus to receive keyboard input.
  //
  // Fix: intercept BOTH events at capture phase (fires before Radix's bubble
  // phase handlers) and stopImmediatePropagation when focus involves annotation UI.
  useEffect(() => {
    if (!editing) return

    const blockRadixFocusTrap = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null
      const related = e.relatedTarget as HTMLElement | null

      if (e.type === "focusin") {
        // Focus arriving at annotation UI — block so Radix doesn't redirect
        if (target?.closest?.("[data-annotation-ui]")) {
          e.stopImmediatePropagation()
        }
      } else if (e.type === "focusout") {
        // Focus leaving dialog toward annotation UI — block so Radix doesn't pull it back
        if (related?.closest?.("[data-annotation-ui]")) {
          e.stopImmediatePropagation()
        }
      }
    }

    document.addEventListener("focusin", blockRadixFocusTrap, true)
    document.addEventListener("focusout", blockRadixFocusTrap, true)

    // Remove inert from ancestors of the textarea
    let node: HTMLElement | null = textareaRef.current
    while (node) {
      if ((node as any).inert) (node as any).inert = false
      node.removeAttribute("inert")
      node = node.parentElement
    }

    // Focus the textarea
    requestAnimationFrame(() => textareaRef.current?.focus())

    return () => {
      document.removeEventListener("focusin", blockRadixFocusTrap, true)
      document.removeEventListener("focusout", blockRadixFocusTrap, true)
    }
  }, [editing])

  const handleSubmit = () => {
    const trimmed = comment.trim()
    if (!trimmed) return
    if (isCreate) {
      onSave(trimmed, category)
    } else {
      onUpdate?.(annotation.id, trimmed)
      setEditing(false)
    }
  }

  const handlePresetClick = (prompt: string) => {
    if (prompt) {
      setComment(prompt)
      setShowPresets(false)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const ph = prompt.indexOf("{?}")
          if (ph !== -1) textareaRef.current.setSelectionRange(ph, ph + 3)
        }
      }, 50)
    } else {
      setShowPresets(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit() }
    if (e.key === "Escape") { e.preventDefault(); onClose() }
  }

  // Ensure focus reaches textarea even when Radix dialog is active
  const handleTextareaPointerDown = () => {
    let node: HTMLElement | null = textareaRef.current
    while (node) {
      if ((node as any).inert) (node as any).inert = false
      node.removeAttribute("inert")
      node = node.parentElement
    }
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const catMeta = CATEGORIES.find((c) => c.value === (annotation?.category || category))
  const presets = PRESETS[category] || []

  return (
    <div
      data-annotation-ui
      className="fixed w-80 rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground shadow-popover animate-in fade-in-0 zoom-in-95 pointer-events-auto"
      style={{ ...posStyle, zIndex: 99999 }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <Badge variant="outline" className="text-[length:var(--fs-xs)] px-1.5 py-0">
          {isCreate ? "Add Annotation" : annotation.resolved ? "Resolved" : catMeta?.label || "Annotation"}
        </Badge>
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Element info */}
      {isCreate && (breadcrumb || elementLabel) && (
        <div className="px-3 pt-2 space-y-1">
          {breadcrumb && <div className="text-[length:var(--fs-xs)] text-muted-foreground truncate" title={breadcrumb}>{breadcrumb}</div>}
          {elementLabel && <code className="text-[length:var(--fs-xs)] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-[var(--radius-dot)] block truncate">{elementLabel}</code>}
        </div>
      )}

      {/* Body */}
      <div className="p-3">
        {editing ? (
          <>
            <div className="flex flex-wrap gap-1 mb-2">
              {CATEGORIES.map((cat) => (
                <Button key={cat.value} variant={category === cat.value ? "default" : "outline"} size="inline"
                  onClick={() => { setCategory(cat.value); if (isCreate && !comment) setShowPresets(true) }}>
                  {cat.label}
                </Button>
              ))}
            </div>

            {showPresets && presets.length > 0 && (
              <div className="mb-2 grid grid-cols-2 gap-1">
                {presets.map((p) => (
                  <Button key={p.label} variant="outline" size="inline" className="justify-start truncate"
                    onClick={() => handlePresetClick(p.prompt)} title={p.prompt || "自定义输入"}>
                    <Zap className="size-2.5" />{p.label}
                  </Button>
                ))}
              </div>
            )}

            {!showPresets && isCreate && (
              <Button variant="ghost" size="inline" className="mb-2 text-muted-foreground" onClick={() => setShowPresets(true)}>
                <Zap className="size-2.5" />Show preset templates
              </Button>
            )}

            <textarea ref={textareaRef} autoFocus value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              onPointerDown={handleTextareaPointerDown}
              placeholder="Describe the issue or change needed…"
              className="w-full min-h-20 resize-none rounded-[var(--radius-button)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[length:var(--fs-xs)] text-muted-foreground">⌘+Enter to save</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="xs" onClick={onClose}>Cancel</Button>
                <Button size="xs" onClick={handleSubmit} disabled={!comment.trim()}>Save</Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className={cn("text-[length:var(--fs-sm)] whitespace-pre-wrap", annotation?.resolved && "line-through text-muted-foreground")}>{annotation?.comment}</p>
            {annotation && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <span className="text-[length:var(--fs-xs)] text-muted-foreground">{new Date(annotation.timestamp).toLocaleString()}</span>
                <div className="flex gap-1 items-center">
                  {customActions?.map(({ id, component: Action }) => (
                    <Action key={id} annotation={annotation} onClose={onClose} />
                  ))}
                  <Button variant="ghost" size="icon-xs" title="Copy as AI Prompt" onClick={async () => {
                    const ok = await copyJSON(generateSingleAnnotationPrompt(annotation))
                    if (ok) { setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 1500) }
                  }}>
                    {copiedPrompt ? <Check className="size-3 text-success" /> : <Clipboard className="size-3" />}
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setEditing(true)} title="Edit"><Pencil className="size-3" /></Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => onResolve?.(annotation.id)} title={annotation.resolved ? "Unresolve" : "Resolve"} className={annotation.resolved ? "text-success" : ""}>
                    {annotation.resolved ? <CheckCircle2 className="size-3" /> : <Check className="size-3" />}
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => onDelete?.(annotation.id)} title="Delete"><Trash2 className="size-3 text-destructive" /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Element details (view mode) */}
      {annotation && !editing && (
        <div className="px-3 pb-2 space-y-1">
          {annotation.breadcrumb && <div className="text-[length:var(--fs-xs)] text-muted-foreground truncate" title={annotation.breadcrumb}>{annotation.breadcrumb}</div>}
          {annotation.sourceHint && <code className="text-[length:var(--fs-xs)] text-accent-blue block truncate" title={annotation.sourceHint}>{annotation.sourceHint}</code>}
          {annotation.rect && <span className="text-[length:var(--fs-xs)] text-muted-foreground">{annotation.rect.width}x{annotation.rect.height}px</span>}
          {annotation.computedStyles && (
            <div>
              <button onClick={() => setShowStyles(!showStyles)} className="text-[length:var(--fs-xs)] text-muted-foreground hover:text-foreground underline">
                {showStyles ? "Hide styles" : "Show style diff"}
              </button>
              {showStyles && styleDiff && (
                <div className="mt-1 p-1.5 bg-muted rounded-[var(--radius-dot)] text-[length:var(--fs-xs)] font-mono space-y-0.5 max-h-40 overflow-y-auto">
                  {styleDiff.map((d) => (
                    <div key={d.key} className={cn("flex justify-between gap-2", d.changed && "bg-warning/15 -mx-1 px-1 rounded")}>
                      <span className="text-muted-foreground shrink-0">{d.key}:</span>
                      {d.changed ? (
                        <span className="truncate text-right">
                          <span className="line-through text-destructive">{d.saved}</span>
                          {" → "}
                          <span className="text-success">{d.current}</span>
                        </span>
                      ) : (
                        <span className="text-foreground truncate text-right">{d.saved}</span>
                      )}
                    </div>
                  ))}
                  {styleDiff.some((d) => d.changed) && (
                    <div className="mt-1 pt-1 border-t border-border/50 text-muted-foreground">
                      {styleDiff.filter((d) => d.changed).length} changed
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
