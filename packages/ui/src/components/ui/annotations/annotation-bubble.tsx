import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react"
import { Check, CheckCircle2, Clipboard, ImagePlus, Pencil, Trash2, X, Zap } from "lucide-react"
import { Button } from "../button"
import { Badge } from "../badge"
import { cn } from "../../../lib/utils"
import { generateSingleAnnotationPrompt, computeStyleDiff, copyJSON } from "./utils"
import type { Annotation, AnnotationCategory, AnnotationMessages } from "./types"
import { useAnnotationContext } from "./annotation-provider"

const CATEGORY_VALUES: AnnotationCategory[] = [
  "style", "layout", "interaction", "content", "bug", "other",
]

function categoryLabel(value: AnnotationCategory, m: AnnotationMessages): string {
  switch (value) {
    case "style": return m.categoryStyle
    case "layout": return m.categoryLayout
    case "interaction": return m.categoryInteraction
    case "content": return m.categoryContent
    case "bug": return m.categoryBug
    case "other": return m.categoryOther
  }
}

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
    { label: "组件替换", prompt: "需要替换为 @cherry-studio/ui 包的 {?} 组件" },
    { label: "代码重构", prompt: "代码需要重构：{?}" },
    { label: "自定义", prompt: "" },
  ],
}

interface AnnotationBubbleProps {
  annotation?: Annotation
  style?: React.CSSProperties
  onSave: (comment: string, category: AnnotationCategory, referenceImages?: string[]) => void
  onUpdate?: (id: string, comment: string, referenceImages?: string[]) => void
  onResolve?: (id: string) => void
  onDelete?: (id: string) => void
  onClose: () => void
  elementLabel?: string
  breadcrumb?: string
  /** Custom action buttons (rendered before built-in Edit/Resolve/Delete) */
  customActions?: import("./types").BubbleAction[]
}

const MAX_REFERENCE_IMAGES = 6
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB per file (input limit)
const COMPRESS_MAX_DIM = 1280            // resize bound (longest side)
const COMPRESS_QUALITY = 0.82            // tuned for screenshots

/**
 * Compress an image to a downsized JPEG/WebP data URL before persisting.
 *
 * Reference images live in localStorage alongside the annotation, and the
 * quota (5–10 MB on most browsers) is shared across the whole annotation
 * store. A single uncompressed 4K screenshot easily exceeds that on its
 * own, which causes `setItem` to throw `QuotaExceededError`. Resizing to
 * 1280px on the longest side + ~0.82 quality keeps reference shots legible
 * while typically landing under 200 KB each. WebP is preferred when the
 * browser supports it; falls back to JPEG.
 */
async function compressImageFile(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("image decode failed"))
      el.src = url
    })
    let { naturalWidth: w, naturalHeight: h } = img
    if (w > COMPRESS_MAX_DIM || h > COMPRESS_MAX_DIM) {
      const scale = Math.min(COMPRESS_MAX_DIM / w, COMPRESS_MAX_DIM / h)
      w = Math.max(1, Math.round(w * scale))
      h = Math.max(1, Math.round(h * scale))
    }
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("2d context unavailable")
    ctx.drawImage(img, 0, 0, w, h)
    // Try WebP first — typically 25-35% smaller than equivalent JPEG.
    const webp = canvas.toDataURL("image/webp", COMPRESS_QUALITY)
    if (webp.startsWith("data:image/webp")) return webp
    return canvas.toDataURL("image/jpeg", COMPRESS_QUALITY)
  } finally {
    URL.revokeObjectURL(url)
  }
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
  const { messages } = useAnnotationContext()
  const isCreate = !annotation
  const [comment, setComment] = useState(annotation?.comment || "")
  const [category, setCategory] = useState<AnnotationCategory>(annotation?.category || "style")
  const [editing, setEditing] = useState(isCreate)
  const [showStyles, setShowStyles] = useState(false)
  const [showPresets, setShowPresets] = useState(isCreate)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [referenceImages, setReferenceImages] = useState<string[]>(annotation?.referenceImages || [])
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = MAX_REFERENCE_IMAGES - referenceImages.length
    if (remaining <= 0) return
    const accepted: File[] = []
    for (const f of Array.from(files).slice(0, remaining)) {
      if (f.type.startsWith("image/") && f.size <= MAX_IMAGE_BYTES) accepted.push(f)
    }
    if (accepted.length === 0) return
    const urls = await Promise.all(accepted.map(compressImageFile))
    setReferenceImages((prev) => [...prev, ...urls].slice(0, MAX_REFERENCE_IMAGES))
  }

  const removeImageAt = (idx: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== idx))
  }

  // Image-paste handler — extracts image files from a clipboard event and
  // appends them via handleFiles. Returns true if it consumed image data.
  const consumeClipboardImages = (cd: DataTransfer | null): boolean => {
    const items = cd?.items
    if (!items) return false
    const imageFiles: File[] = []
    for (const it of Array.from(items)) {
      if (it.kind === "file" && it.type.startsWith("image/")) {
        const f = it.getAsFile()
        if (f) imageFiles.push(f)
      }
    }
    if (imageFiles.length === 0) return false
    const dt = new DataTransfer()
    imageFiles.forEach((f) => dt.items.add(f))
    void handleFiles(dt.files)
    return true
  }

  // ─── Viewport clamp ───────────────────────────────────────────────────
  // The overlay computes an initial position from the click point. That
  // estimate doesn't know the rendered bubble height (which varies with
  // presets, attached images, and category content), so the bubble can be
  // pushed off-screen — hiding the Save/Cancel buttons. After mount we
  // measure the actual size and shift `posStyle.top/left` upward/leftward
  // just enough to keep the entire bubble inside the viewport, with an 8px
  // safety margin. A ResizeObserver re-runs the clamp when the bubble grows
  // (attaching an image, opening the style diff, etc.) so newly-added
  // content can't push the action row off-screen either.
  const VIEWPORT_MARGIN = 8
  const rootRef = useRef<HTMLDivElement>(null)
  const [clampOffset, setClampOffset] = useState<{ top: number; left: number } | null>(null)
  const recomputeClamp = () => {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - rect.width - VIEWPORT_MARGIN)
    const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - rect.height - VIEWPORT_MARGIN)
    const nextLeft = Math.min(Math.max(VIEWPORT_MARGIN, rect.left), maxLeft)
    const nextTop = Math.min(Math.max(VIEWPORT_MARGIN, rect.top), maxTop)
    if (Math.round(nextLeft) === Math.round(rect.left) && Math.round(nextTop) === Math.round(rect.top)) return
    setClampOffset({ top: nextTop, left: nextLeft })
  }
  useLayoutEffect(() => {
    recomputeClamp()
    const el = rootRef.current
    if (!el) return
    const ro = new ResizeObserver(recomputeClamp)
    ro.observe(el)
    window.addEventListener("resize", recomputeClamp)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", recomputeClamp)
    }
    // posStyle changes whenever the parent re-anchors the bubble — re-clamp.
  }, [posStyle?.top, posStyle?.left])

  // ─── Drag-to-reposition ──────────────────────────────────────────────
  // Header acts as the drag handle. Once the user has dragged, posStyle
  // (the parent-controlled position) is ignored in favor of dragOffset
  // until the bubble is unmounted.
  const [dragOffset, setDragOffset] = useState<{ top: number; left: number } | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; baseTop: number; baseLeft: number } | null>(null)
  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    // Don't drag when clicking the close button (or any nested button)
    if ((e.target as HTMLElement).closest("button")) return
    const el = e.currentTarget.closest("[data-bubble-root]") as HTMLElement | null
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseTop: rect.top,
      baseLeft: rect.left,
    }
    el.setPointerCapture?.(e.pointerId)
    e.preventDefault()
  }
  const handleHeaderPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const { startX, startY, baseTop, baseLeft } = dragRef.current
    const nextLeft = Math.max(0, Math.min(window.innerWidth - 320, baseLeft + (e.clientX - startX)))
    const nextTop = Math.max(0, Math.min(window.innerHeight - 80, baseTop + (e.clientY - startY)))
    setDragOffset({ top: nextTop, left: nextLeft })
  }
  const handleHeaderPointerUp = () => {
    dragRef.current = null
  }

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

  // Global paste — when the bubble is in edit mode, intercept ⌘/Ctrl+V at
  // the document level so users can paste images even when the textarea
  // isn't focused. We register at capture phase to win against textarea
  // handlers, but only consume the event when image data is present (text
  // paste into the textarea still works normally).
  useEffect(() => {
    if (!editing) return
    const onDocPaste = (e: ClipboardEvent) => {
      if (consumeClipboardImages(e.clipboardData)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener("paste", onDocPaste, true)
    return () => document.removeEventListener("paste", onDocPaste, true)
    // consumeClipboardImages closes over referenceImages via handleFiles —
    // re-binding each render is cheap and keeps the cap accurate.
  })

  const handleSubmit = () => {
    const trimmed = comment.trim()
    if (!trimmed && referenceImages.length === 0) return
    if (isCreate) {
      onSave(trimmed, category, referenceImages.length > 0 ? referenceImages : undefined)
    } else {
      onUpdate?.(annotation.id, trimmed, referenceImages.length > 0 ? referenceImages : undefined)
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

  const activeCategory = annotation?.category || category
  const presets = PRESETS[category] || []

  return (
    <div
      ref={rootRef}
      data-annotation-ui
      data-bubble-root
      className="fixed w-80 max-h-[calc(100vh-16px)] overflow-y-auto rounded-[var(--radius-card)] border border-border bg-popover text-popover-foreground shadow-popover animate-in fade-in-0 zoom-in-95 pointer-events-auto"
      style={{ ...posStyle, ...(clampOffset || {}), ...(dragOffset || {}), zIndex: 100000 }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header — also serves as drag handle */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerUp}
        onPointerCancel={handleHeaderPointerUp}
      >
        <Badge variant="outline" className="text-[length:var(--fs-xs)] px-1.5 py-0">
          {isCreate
            ? messages.addAnnotation
            : annotation.resolved
              ? messages.resolved
              : categoryLabel(activeCategory, messages) || messages.annotation}
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
              {CATEGORY_VALUES.map((cat) => (
                <Button key={cat} variant={category === cat ? "default" : "outline"} size="inline"
                  onClick={() => { setCategory(cat); if (isCreate && !comment) setShowPresets(true) }}>
                  {categoryLabel(cat, messages)}
                </Button>
              ))}
            </div>

            {showPresets && presets.length > 0 && (
              <div className="mb-2 grid grid-cols-2 gap-1">
                {presets.map((p) => (
                  <Button key={p.label} variant="outline" size="inline" className="justify-start truncate"
                    onClick={() => handlePresetClick(p.prompt)} title={p.prompt || messages.customInputTitle}>
                    <Zap className="size-2.5" />{p.label}
                  </Button>
                ))}
              </div>
            )}

            {!showPresets && isCreate && (
              <Button variant="ghost" size="inline" className="mb-2 text-muted-foreground" onClick={() => setShowPresets(true)}>
                <Zap className="size-2.5" />{messages.showPresets}
              </Button>
            )}

            <textarea ref={textareaRef} autoFocus value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              onPointerDown={handleTextareaPointerDown}
              onPaste={(e) => { if (consumeClipboardImages(e.clipboardData)) e.preventDefault() }}
              placeholder={messages.describePlaceholder}
              className="w-full min-h-20 resize-none rounded-[var(--radius-button)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />

            {referenceImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {referenceImages.map((src, i) => (
                  <div key={i} className="relative group">
                    <button
                      type="button"
                      onClick={() => setLightboxSrc(src)}
                      className="block w-12 h-12 rounded-[var(--radius-dot)] border border-border overflow-hidden bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                    <button
                      type="button"
                      aria-label={messages.removeImage}
                      onClick={() => removeImageAt(i)}
                      className="absolute -top-1 -right-1 size-4 rounded-full bg-foreground text-background flex items-center justify-center shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                void handleFiles(e.target.files)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            />

            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title={messages.attachImage}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={referenceImages.length >= MAX_REFERENCE_IMAGES}
                >
                  <ImagePlus className="size-3.5" />
                </Button>
                <span className="text-[length:var(--fs-xs)] text-muted-foreground truncate">{messages.saveHint}</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="outline" size="xs" onClick={onClose}>{messages.cancel}</Button>
                <Button size="xs" onClick={handleSubmit} disabled={!comment.trim() && referenceImages.length === 0}>{messages.save}</Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className={cn("text-[length:var(--fs-sm)] whitespace-pre-wrap", annotation?.resolved && "line-through text-muted-foreground")}>{annotation?.comment}</p>
            {annotation?.referenceImages && annotation.referenceImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {annotation.referenceImages.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxSrc(src)}
                    className="block w-12 h-12 rounded-[var(--radius-dot)] border border-border overflow-hidden bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {annotation && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <span className="text-[length:var(--fs-xs)] text-muted-foreground">{new Date(annotation.timestamp).toLocaleString()}</span>
                <div className="flex gap-1 items-center">
                  {customActions?.map(({ id, component: Action }) => (
                    <Action key={id} annotation={annotation} onClose={onClose} />
                  ))}
                  <Button variant="ghost" size="icon-xs" title={messages.copyAsPrompt} onClick={async () => {
                    const ok = await copyJSON(generateSingleAnnotationPrompt(annotation))
                    if (ok) { setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 1500) }
                  }}>
                    {copiedPrompt ? <Check className="size-3 text-success" /> : <Clipboard className="size-3" />}
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setEditing(true)} title={messages.edit}><Pencil className="size-3" /></Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => onResolve?.(annotation.id)} title={annotation.resolved ? messages.unresolve : messages.resolve} className={annotation.resolved ? "text-success" : ""}>
                    {annotation.resolved ? <CheckCircle2 className="size-3" /> : <Check className="size-3" />}
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => onDelete?.(annotation.id)} title={messages.delete}><Trash2 className="size-3 text-destructive" /></Button>
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
                {showStyles ? messages.hideStyles : messages.showStyleDiff}
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
                      {messages.changedCount(styleDiff.filter((d) => d.changed).length)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {lightboxSrc && (
        <div
          data-annotation-ui
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-8 cursor-zoom-out"
          style={{ zIndex: 100001 }}
          onClick={() => setLightboxSrc(null)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <img src={lightboxSrc} alt="" className="max-w-full max-h-full rounded-md shadow-2xl" />
        </div>
      )}
    </div>
  )
}
