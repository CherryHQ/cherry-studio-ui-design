"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"
import { ScrollArea, ScrollBar } from "./scroll-area"
import { Slider } from "./slider"
import { Skeleton } from "./skeleton"
import { Progress } from "./progress"
import { Input } from "./input"
import { Textarea } from "./textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./select"
import {
  Download, Copy, Trash2, ZoomIn, Settings2, Sparkles, X, ChevronLeft, ChevronRight,
} from "lucide-react"

/* ---------- Types ---------- */

export interface ImageItem {
  id: string
  url: string
  prompt: string
  model: string
  size: string
  seed?: number
  status: "generating" | "done" | "error"
  progress?: number
  createdAt: string
}

export interface ImageCanvasProps extends Omit<React.ComponentProps<"div">, "onSelect" | "onCopy"> {
  images: ImageItem[]
  selectedId?: string
  onSelect?: (id: string) => void

  prompt: string
  onPromptChange: (prompt: string) => void
  onGenerate: () => void
  isGenerating?: boolean

  model: string
  onModelChange: (model: string) => void
  models: { value: string; label: string }[]

  aspectRatio: string
  onAspectRatioChange: (ratio: string) => void
  aspectRatios?: { value: string; label: string }[]

  steps?: number
  onStepsChange?: (n: number) => void
  seed?: number
  onSeedChange?: (n: number) => void

  onDownload?: (image: ImageItem) => void
  onCopy?: (image: ImageItem) => void
  onDelete?: (id: string) => void
  onUpscale?: (id: string) => void

  showControlPanel?: boolean
  onToggleControlPanel?: () => void
}

/* ---------- Sub-components ---------- */

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5 mb-4">
      <h4 className="text-xs font-medium text-muted-foreground/60 tracking-[-0.12px]">{title}</h4>
      {children}
    </div>
  )
}

/* ---------- ImageCanvas ---------- */

function ImageCanvas({
  images,
  selectedId,
  onSelect,
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating = false,
  model,
  onModelChange,
  models,
  aspectRatio,
  onAspectRatioChange,
  aspectRatios = [
    { value: "1:1", label: "1:1" },
    { value: "4:3", label: "4:3" },
    { value: "3:4", label: "3:4" },
    { value: "16:9", label: "16:9" },
    { value: "9:16", label: "9:16" },
  ],
  steps,
  onStepsChange,
  seed,
  onSeedChange,
  onDownload,
  onCopy,
  onDelete,
  onUpscale,
  showControlPanel = true,
  onToggleControlPanel,
  className,
  ...props
}: ImageCanvasProps) {
  const selected = images.find((img) => img.id === selectedId) ?? images[0]
  const selectedIdx = images.findIndex((img) => img.id === selected?.id)

  const goPrev = () => {
    if (selectedIdx > 0) onSelect?.(images[selectedIdx - 1].id)
  }
  const goNext = () => {
    if (selectedIdx < images.length - 1) onSelect?.(images[selectedIdx + 1].id)
  }

  return (
    <div
      data-slot="image-canvas"
      className={cn("flex flex-col h-full bg-background rounded-[var(--radius-card)] border overflow-hidden", className)}
      {...props}
    >
      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Left: History strip */}
        <div className="w-[72px] border-r flex-shrink-0 bg-muted/20">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1.5">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => onSelect?.(img.id)}
                  className={cn(
                    "w-full aspect-square rounded-[var(--radius-control)] overflow-hidden border transition-all",
                    img.id === selected?.id
                      ? "border-primary/60 ring-2 ring-primary/15 shadow-sm"
                      : "border-border/30 hover:border-border/60",
                  )}
                >
                  {img.status === "generating" ? (
                    <Skeleton className="w-full h-full" />
                  ) : img.status === "error" ? (
                    <div className="w-full h-full bg-destructive/10 flex items-center justify-center text-destructive text-xs">!</div>
                  ) : (
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center: Canvas preview */}
        <div className="flex-1 relative flex items-center justify-center bg-muted/10 min-w-0">
          {selected ? (
            selected.status === "generating" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground/50">生成中...</p>
                {selected.progress !== undefined && (
                  <Progress value={selected.progress} className="w-40" />
                )}
              </div>
            ) : selected.status === "error" ? (
              <div className="flex flex-col items-center gap-2 text-destructive">
                <X size={24} />
                <p className="text-xs">生成失败</p>
              </div>
            ) : (
              <>
                <img
                  src={selected.url}
                  alt={selected.prompt}
                  className="max-w-full max-h-full object-contain rounded-[var(--radius-button)]"
                />
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goPrev}
                      disabled={selectedIdx <= 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm shadow-sm"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goNext}
                      disabled={selectedIdx >= images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm shadow-sm"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </>
                )}
                {/* Action bar */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-[var(--radius-button)] border p-1 shadow-sm">
                  {onDownload && (
                    <Button variant="ghost" size="icon-sm" onClick={() => onDownload(selected)} title="下载">
                      <Download size={14} />
                    </Button>
                  )}
                  {onCopy && (
                    <Button variant="ghost" size="icon-sm" onClick={() => onCopy(selected)} title="复制">
                      <Copy size={14} />
                    </Button>
                  )}
                  {onUpscale && (
                    <Button variant="ghost" size="icon-sm" onClick={() => onUpscale(selected.id)} title="放大">
                      <ZoomIn size={14} />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="icon-sm" onClick={() => onDelete(selected.id)} title="删除" className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  )}
                  <Badge variant="secondary" className="text-xs ml-1">{selected.size}</Badge>
                </div>
              </>
            )
          ) : (
            <p className="text-sm text-muted-foreground/50">输入提示词开始创作</p>
          )}

          {/* Toggle control panel */}
          {onToggleControlPanel && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleControlPanel}
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
              title="参数面板"
            >
              <Settings2 size={14} />
            </Button>
          )}
        </div>

        {/* Right: Control panel */}
        {showControlPanel && (
          <ScrollArea className="w-[240px] border-l flex-shrink-0 bg-muted/10">
          <div className="p-4">
            <PanelSection title="模型">
              <Select value={model} onValueChange={onModelChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PanelSection>

            <PanelSection title="比例">
              <div className="flex flex-wrap gap-1.5">
                {aspectRatios.map((ar) => (
                  <Button
                    key={ar.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => onAspectRatioChange(ar.value)}
                    className={cn(
                      "px-2.5 py-1 h-auto text-xs border",
                      ar.value === aspectRatio
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "text-muted-foreground/60 border-border/30 hover:text-foreground",
                    )}
                  >
                    {ar.label}
                  </Button>
                ))}
              </div>
            </PanelSection>

            {onStepsChange && steps !== undefined && (
              <PanelSection title="Steps">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground/60">质量</span>
                  <span className="text-xs text-foreground tabular-nums font-medium">{steps}</span>
                </div>
                <Slider min={1} max={50} step={1} value={[steps]} onValueChange={(v) => onStepsChange(v[0])} />
              </PanelSection>
            )}

            {onSeedChange && seed !== undefined && (
              <PanelSection title="Seed">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => onSeedChange(Number(e.target.value))}
                    className="flex-1 h-7 text-xs tabular-nums"
                  />
                  <Button variant="ghost" size="sm" onClick={() => onSeedChange(Math.floor(Math.random() * 999999))} className="text-xs h-7">
                    🎲
                  </Button>
                </div>
              </PanelSection>
            )}
          </div>
          </ScrollArea>
        )}
      </div>

      {/* Bottom: Prompt bar */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the image you want to create..."
            rows={2}
            className="flex-1 min-h-[unset] text-sm resize-none"
          />
          <Button onClick={onGenerate} disabled={isGenerating || !prompt.trim()} className="h-9 gap-1.5 flex-shrink-0">
            {isGenerating ? (
              <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {isGenerating ? "生成中" : "生成"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ImageCanvas }
