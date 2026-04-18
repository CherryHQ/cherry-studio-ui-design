import React, { useState, useEffect } from "react"
import { Button, Badge, Input, Textarea, Slider, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  Settings2, Heart, ChevronLeft, ChevronRight, Dices, Sparkles, X,
  Download, Trash2, ZoomIn, RotateCcw, Copy,
} from "lucide-react"

/* ═══════════════════════════════════════════
   Types & Mock Data
   ═══════════════════════════════════════════ */

interface GeneratedImage {
  id: string; emoji: string; prompt: string; model: string; aspect: string; createdAt: string
  status: "done" | "generating" | "failed"
  seed?: number; steps?: number
}

const IMAGES: GeneratedImage[] = [
  { id: "img1", emoji: "🎨", prompt: "A watercolor painting of cherry blossoms in spring breeze", model: "DALL-E 3", aspect: "1:1", createdAt: "2 min ago", status: "done", seed: 42, steps: 30 },
  { id: "img2", emoji: "🌅", prompt: "Sunset over the ocean, cinematic lighting, golden hour", model: "Midjourney", aspect: "16:9", createdAt: "15 min ago", status: "done", seed: 128, steps: 25 },
  { id: "img3", emoji: "🏔️", prompt: "Snow-capped mountains with northern lights, ultra wide", model: "FLUX.1", aspect: "16:9", createdAt: "1 hour ago", status: "done", seed: 7, steps: 40 },
  { id: "img4", emoji: "🌊", prompt: "Giant wave in Japanese ukiyo-e style, Hokusai inspired", model: "Stable Diffusion", aspect: "1:1", createdAt: "2 hours ago", status: "done", seed: 999, steps: 35 },
  { id: "img5", emoji: "🌺", prompt: "Macro photo of tropical flowers with dew drops, soft bokeh", model: "DALL-E 3", aspect: "4:3", createdAt: "3 hours ago", status: "done", seed: 55, steps: 30 },
  { id: "img6", emoji: "🌌", prompt: "Deep space nebula, ultra detailed, 8K, vibrant colors", model: "Midjourney", aspect: "1:1", createdAt: "5 hours ago", status: "done", seed: 314, steps: 50 },
  { id: "img7", emoji: "🏙️", prompt: "Futuristic city at night, cyberpunk style, neon lights", model: "FLUX.1", aspect: "9:16", createdAt: "Yesterday", status: "done", seed: 88, steps: 30 },
  { id: "img8", emoji: "🦋", prompt: "Crystal butterfly on a flower, glass art, iridescent", model: "Stable Diffusion", aspect: "1:1", createdAt: "Yesterday", status: "done", seed: 21, steps: 28 },
]

const MODELS = ["DALL-E 3", "Midjourney", "Stable Diffusion XL", "FLUX.1 Pro"]
const ASPECTS = ["1:1", "16:9", "9:16", "4:3"]
const STYLES = ["Cinematic", "Anime", "Watercolor", "Photographic"]
const SIZE_PRESETS = [
  { label: "Square", desc: "1024×1024", value: "square" },
  { label: "Wide", desc: "1792×1024", value: "wide" },
  { label: "Tall", desc: "1024×1792", value: "tall" },
]

const PANEL_WIDTH = 280
const PANEL_GAP = 14
const PANEL_OFFSET = PANEL_WIDTH + PANEL_GAP       // 294
const PANEL_HALF_OFFSET = PANEL_WIDTH / 2 + 5      // 145

const RANDOM_PROMPTS = [
  "A cozy cabin in the woods during autumn, warm lighting",
  "Abstract geometric art with gold and marble textures",
  "A robot painting a self-portrait in a studio",
  "Underwater coral reef city, bioluminescent, fantasy art",
]

/* ═══════════════════════════════════════════
   Batch generation mock
   ═══════════════════════════════════════════ */

interface BatchItem {
  id: string; prompt: string; status: "pending" | "generating" | "done" | "failed"; progress: number; emoji: string
}

const INITIAL_BATCH: BatchItem[] = [
  { id: "b1", prompt: "Cherry blossoms, watercolor", status: "done", progress: 100, emoji: "🌸" },
  { id: "b2", prompt: "Mountain landscape, oil painting", status: "done", progress: 100, emoji: "⛰️" },
  { id: "b3", prompt: "Abstract geometry, minimalist", status: "generating", progress: 65, emoji: "🔷" },
  { id: "b4", prompt: "Ocean waves, dramatic lighting", status: "pending", progress: 0, emoji: "🌊" },
]

/* ═══════════════════════════════════════════
   PanelSection
   ═══════════════════════════════════════════ */

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════
   History Strip (left sidebar)
   ═══════════════════════════════════════════ */

function HistoryStrip({ images, selectedIdx, onSelect }: {
  images: GeneratedImage[]; selectedIdx: number; onSelect: (i: number) => void
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className="w-[72px] border-r bg-background/50 overflow-y-auto py-2 px-2 space-y-1.5 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      {images.map((img, i) => (
        <div key={img.id} className="relative">
          <Button
            variant="ghost"
            onClick={() => onSelect(i)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`w-full aspect-square rounded-[10px] flex items-center justify-center text-lg h-auto p-0 ${
              i === selectedIdx
                ? "bg-background border border-primary/60 ring-2 ring-primary/15 shadow-sm"
                : "bg-background/70 border border-border/30 hover:border-border/60 hover:scale-105"
            }`}
          >
            {img.emoji}
          </Button>
          {/* Hover preview tooltip */}
          {hoveredIdx === i && (
            <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-30 w-[180px] rounded-[12px] border border-border/40 bg-background/95 backdrop-blur-[6px] shadow-popover p-2.5 pointer-events-none">
              <div className="w-full aspect-square rounded-[8px] bg-accent/30 flex items-center justify-center text-3xl mb-2">
                {img.emoji}
              </div>
              <p className="text-[10px] text-muted-foreground/60 line-clamp-2 mb-1">{img.prompt}</p>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs px-1 py-0">{img.model}</Badge>
                <span className="text-xs text-muted-foreground/60">{img.aspect}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Batch Progress Panel
   ═══════════════════════════════════════════ */

function BatchPanel({ items }: { items: BatchItem[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Batch Progress</span>
        <span className="text-xs text-muted-foreground/30">{items.filter(i => i.status === "done").length}/{items.length}</span>
      </div>
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2 py-1">
          <span className="text-sm">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-foreground/50 truncate">{item.prompt}</p>
            <div className="h-[3px] rounded-full bg-muted/30 overflow-hidden mt-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.status === "failed" ? "bg-error" : item.status === "done" ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
          <span className={`text-xs ${
            item.status === "done" ? "text-success" : item.status === "failed" ? "text-error" : item.status === "generating" ? "text-primary" : "text-muted-foreground/30"
          }`}>
            {item.status === "done" ? "✓" : item.status === "failed" ? "✗" : item.status === "generating" ? `${item.progress}%` : "queue"}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main Demo
   ═══════════════════════════════════════════ */

export function ImageModuleDemo() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showPanel, setShowPanel] = useState(true)
  const [favorited, setFavorited] = useState<Set<string>>(new Set(["img1", "img6"]))
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("DALL-E 3")
  const [aspect, setAspect] = useState("1:1")
  const [generating, setGenerating] = useState(false)

  // Control panel state
  const [steps, setSteps] = useState(30)
  const [style, setStyle] = useState("Cinematic")
  const [sizePreset, setSizePreset] = useState("square")
  const [seed, setSeed] = useState("")
  const [cfgScale, setCfgScale] = useState(7)

  // Batch generation state
  const [batchItems, setBatchItems] = useState<BatchItem[]>(INITIAL_BATCH)

  // Simulate batch progress
  const hasActive = batchItems.some(i => i.status === "generating" || i.status === "pending")
  useEffect(() => {
    if (!hasActive) return

    const timer = setInterval(() => {
      setBatchItems(prev => {
        const next = prev.map(item => {
          if (item.status === "generating" && item.progress < 100) {
            const np = Math.min(item.progress + 5, 100)
            return { ...item, progress: np, status: np >= 100 ? "done" as const : "generating" as const }
          }
          if (item.status === "pending") {
            const allBefore = prev.filter(p => p.id < item.id).every(p => p.status === "done" || p.status === "failed")
            if (allBefore) return { ...item, status: "generating" as const, progress: 5 }
          }
          return item
        })
        if (!next.some(i => i.status === "generating" || i.status === "pending")) {
          clearInterval(timer)
        }
        return next
      })
    }, 800)
    return () => clearInterval(timer)
  }, [hasActive])

  const current = IMAGES[selectedIdx]
  const isFav = favorited.has(current.id)

  const navigate = (dir: -1 | 1) => setSelectedIdx(i => (i + dir + IMAGES.length) % IMAGES.length)
  const toggleFav = () => setFavorited(p => { const n = new Set(p); n.has(current.id) ? n.delete(current.id) : n.add(current.id); return n })
  const handleGenerate = () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setTimeout(() => setGenerating(false), 2000)
  }
  const randomPrompt = () => setPrompt(RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)])

  return (
    <Section title="Image Generation Module" props={[
      { name: "model", type: "string", default: '"DALL-E 3"', description: "Selected generation model" },
      { name: "prompt", type: "string", default: '""', description: "Image generation prompt" },
      { name: "aspect", type: "string", default: '"1:1"', description: "Aspect ratio" },
    ]}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        <div className="flex h-[640px]">
          {/* ─── Left: History Strip ─── */}
          <HistoryStrip images={IMAGES} selectedIdx={selectedIdx} onSelect={setSelectedIdx} />

          {/* ─── Center: Canvas + Prompt ─── */}
          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle,_rgba(0,0,0,0.08)_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:16px_16px]">
            {/* Top Toolbar */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-[6px]">
                {selectedIdx + 1} / {IMAGES.length}
              </Badge>
            </div>
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
              <Button variant="ghost" type="button" onClick={() => navigator.clipboard.writeText(current.prompt)} className="h-auto px-0 py-0 font-normal tracking-normal w-8 h-8 rounded-[12px] flex items-center justify-center bg-background/80 backdrop-blur-[6px] border border-border/30 text-muted-foreground/50 hover:text-foreground transition-colors" title="Copy prompt">
                <Copy size={13} />
              </Button>
              <Button variant="ghost" type="button" onClick={() => alert("Download started")} className="h-auto px-0 py-0 font-normal tracking-normal w-8 h-8 rounded-[12px] flex items-center justify-center bg-background/80 backdrop-blur-[6px] border border-border/30 text-muted-foreground/50 hover:text-foreground transition-colors" title="Download">
                <Download size={13} />
              </Button>
              <Button variant="ghost" type="button" onClick={toggleFav} className={`h-auto px-0 py-0 font-normal tracking-normal w-8 h-8 rounded-[12px] flex items-center justify-center transition-colors ${isFav ? "bg-error/10 text-error" : "bg-background/80 backdrop-blur-[6px] border border-border/30 text-muted-foreground/50 hover:text-foreground"}`}>
                <Heart size={14} fill={isFav ? "currentColor" : "none"} />
              </Button>
              <Button variant="ghost" type="button" onClick={() => setShowPanel(p => !p)} className={`h-auto px-0 py-0 font-normal tracking-normal w-8 h-8 rounded-[12px] flex items-center justify-center transition-colors ${showPanel ? "bg-foreground/10 text-foreground" : "bg-background/80 backdrop-blur-[6px] border border-border/30 text-muted-foreground/50 hover:text-foreground"}`}>
                <Settings2 size={14} />
              </Button>
            </div>

            {/* Canvas Area (centered image with generating animation) */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 110, paddingRight: showPanel ? PANEL_OFFSET - PANEL_GAP : 0 }}>
              <div className="flex flex-col items-center gap-3">
                <div className={`w-[220px] h-[220px] rounded-[24px] bg-background border border-border/30 shadow-popover flex items-center justify-center text-6xl select-none transition-transform ${generating ? "animate-pulse" : ""}`}>
                  {generating ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-xs text-muted-foreground/40">Generating...</span>
                    </div>
                  ) : current.emoji}
                </div>
                <div className="text-center max-w-[300px]">
                  <p className="text-xs text-muted-foreground/50 line-clamp-2 mb-1.5">{current.prompt}</p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="text-xs">{current.model}</Badge>
                    <Badge variant="outline" className="text-xs">{current.aspect}</Badge>
                    {current.seed && <Badge variant="secondary" className="text-xs">Seed: {current.seed}</Badge>}
                    <span className="text-xs text-muted-foreground/30">{current.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Nav arrows */}
              <Button variant="ghost" type="button" onClick={() => navigate(-1)} className="h-auto px-0 py-0 font-normal tracking-normal absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-[6px] border border-border/30 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors">
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate(1)} className="h-auto px-0 py-0 font-normal tracking-normal absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-[6px] border border-border/30 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors" style={{ right: showPanel ? PANEL_OFFSET : 16 }}>
                <ChevronRight size={16} />
              </Button>

              {/* Dot indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5" style={{ marginRight: showPanel ? PANEL_OFFSET - PANEL_GAP : 0 }}>
                {IMAGES.map((img, i) => (
                  <Button key={img.id} variant="ghost" onClick={() => setSelectedIdx(i)} className={`rounded-full p-1 h-auto min-w-0 ${i === selectedIdx ? "w-2 h-2 bg-foreground/60" : "w-2 h-2 bg-foreground/40 hover:bg-foreground/60"}`} />
                ))}
              </div>
            </div>

            {/* Prompt Bar (bottom center) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-[680px] px-4" style={{ marginRight: showPanel ? PANEL_HALF_OFFSET : 0 }}>
              <div className="rounded-[24px] border border-border/40 bg-background/95 backdrop-blur-[6px] shadow-popover p-3 space-y-2">
                {/* Row 1: Model + Inspiration + Aspect */}
                <div className="flex items-center gap-2">
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-7 w-auto px-2 rounded-[10px] border border-border/30 bg-transparent text-xs gap-1" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" type="button" onClick={randomPrompt} className="h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[10px] border border-border/30 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-colors" title="随机灵感">
                    <Dices size={13} />
                  </Button>
                  <Button variant="ghost" type="button" onClick={handleGenerate} className="h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[10px] border border-border/30 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-colors" title="重新生成">
                    <RotateCcw size={13} />
                  </Button>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1">
                    {ASPECTS.map(a => (
                      <Button key={a} variant="ghost" size="sm" onClick={() => setAspect(a)} className={`px-2 py-0.5 h-auto rounded-[6px] text-[10px] ${a === aspect ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground/40 hover:text-foreground hover:bg-accent/30"}`}>
                        {a}
                      </Button>
                    ))}
                  </div>
                </div>
                {/* Row 2: Textarea + Generate */}
                <div className="flex items-end gap-2">
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    rows={2}
                    className="min-h-[unset] flex-1 rounded-none border-0 bg-transparent p-0 text-sm tracking-tight leading-relaxed text-foreground shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0 resize-none"
                  />
                  <Button size="sm" onClick={handleGenerate} disabled={generating || !prompt.trim()} className="h-8 gap-1.5 flex-shrink-0">
                    {generating ? <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Sparkles size={12} />}
                    {generating ? "生成中..." : "生成"}
                  </Button>
                </div>
              </div>
            </div>

            {/* ─── Control Panel (right floating) ─── */}
            {showPanel && (
              <div className="absolute right-3 top-14 bottom-24 w-[280px] z-20 rounded-[24px] border border-border/40 bg-background/95 backdrop-blur-[6px] shadow-popover overflow-y-auto p-4 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-foreground font-medium tracking-tight">生成参数</span>
                  <Button variant="ghost" type="button" onClick={() => setShowPanel(false)} className="h-auto px-0 py-0 font-normal tracking-normal w-5 h-5 rounded-[6px] flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
                    <X size={11} />
                  </Button>
                </div>

                <PanelSection title="Quality">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-foreground/70">Steps</span>
                    <span className="text-xs text-foreground tabular-nums font-medium">{steps}</span>
                  </div>
                  <Slider min={1} max={50} step={1} value={[steps]} onValueChange={v => setSteps(v[0])} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground/60 mt-0.5"><span>1</span><span>50</span></div>
                </PanelSection>

                <PanelSection title="Style">
                  <div className="flex flex-wrap gap-1.5">
                    {STYLES.map(s => (
                      <Button key={s} variant="ghost" size="sm" onClick={() => setStyle(s)} className={`px-2.5 py-1 h-auto rounded-[10px] text-[10px] border ${s === style ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15" : "text-muted-foreground/50 border-border/30 hover:border-border/50 hover:text-foreground"}`}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection title="Size">
                  <div className="flex flex-col gap-1.5">
                    {SIZE_PRESETS.map(sp => (
                      <Button key={sp.value} variant="ghost" onClick={() => setSizePreset(sp.value)} className={`flex items-center justify-between px-3 py-2 h-auto rounded-[12px] text-xs border ${sp.value === sizePreset ? "bg-muted/30 border-border/50 text-foreground" : "border-border/20 text-muted-foreground/50 hover:border-border/40 hover:text-foreground"}`}>
                        <span>{sp.label}</span>
                        <span className="text-xs text-muted-foreground/30">{sp.desc}</span>
                      </Button>
                    ))}
                  </div>
                </PanelSection>

                <PanelSection title="Advanced">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-foreground/70 mb-1.5 block">Seed</span>
                      <Input type="number" value={seed} onChange={e => setSeed(e.target.value)} placeholder="随机" className="w-full rounded-[10px] border border-border/30 bg-transparent px-2.5 py-[5px] text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-foreground/70">CFG Scale</span>
                        <span className="text-xs text-foreground tabular-nums font-medium">{cfgScale}</span>
                      </div>
                      <Slider min={1} max={20} step={1} value={[cfgScale]} onValueChange={v => setCfgScale(v[0])} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground/60 mt-0.5"><span>1</span><span>20</span></div>
                    </div>
                  </div>
                </PanelSection>

                <PanelSection title="Batch">
                  <BatchPanel items={batchItems} />
                </PanelSection>

                {/* Image info */}
                <PanelSection title="Current Image">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground/40">Model</span><span className="text-foreground/60">{current.model}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground/40">Aspect</span><span className="text-foreground/60">{current.aspect}</span></div>
                    {current.seed && <div className="flex justify-between"><span className="text-muted-foreground/40">Seed</span><span className="text-foreground/60 tabular-nums">{current.seed}</span></div>}
                    {current.steps && <div className="flex justify-between"><span className="text-muted-foreground/40">Steps</span><span className="text-foreground/60 tabular-nums">{current.steps}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground/40">Created</span><span className="text-foreground/60">{current.createdAt}</span></div>
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] gap-1" onClick={() => alert("Upscaling...")}>
                      <ZoomIn size={10} /> Upscale
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] gap-1" onClick={handleGenerate}>
                      <RotateCcw size={10} /> Redo
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-error/60 hover:text-error" onClick={() => alert(`Deleted: ${current.id}`)}>
                      <Trash2 size={10} />
                    </Button>
                  </div>
                </PanelSection>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
