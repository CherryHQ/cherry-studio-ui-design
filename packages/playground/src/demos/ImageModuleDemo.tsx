import React, { useState } from "react"
import { Button, Badge, Input, Textarea, Slider, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  Settings2, Heart, ChevronLeft, ChevronRight, Dices, Sparkles, X,
} from "lucide-react"

/* ═══════════════════════════════════════════
   Types & Mock Data
   ═══════════════════════════════════════════ */

interface GeneratedImage {
  id: string; emoji: string; prompt: string; model: string; aspect: string; createdAt: string
}

const IMAGES: GeneratedImage[] = [
  { id: "img1", emoji: "🎨", prompt: "A watercolor painting of cherry blossoms in spring breeze", model: "DALL-E 3", aspect: "1:1", createdAt: "2 min ago" },
  { id: "img2", emoji: "🌅", prompt: "Sunset over the ocean, cinematic lighting, golden hour", model: "Midjourney", aspect: "16:9", createdAt: "15 min ago" },
  { id: "img3", emoji: "🏔️", prompt: "Snow-capped mountains with northern lights, ultra wide", model: "FLUX.1", aspect: "16:9", createdAt: "1 hour ago" },
  { id: "img4", emoji: "🌊", prompt: "Giant wave in Japanese ukiyo-e style, Hokusai inspired", model: "Stable Diffusion", aspect: "1:1", createdAt: "2 hours ago" },
  { id: "img5", emoji: "🌺", prompt: "Macro photo of tropical flowers with dew drops, soft bokeh", model: "DALL-E 3", aspect: "4:3", createdAt: "3 hours ago" },
  { id: "img6", emoji: "🌌", prompt: "Deep space nebula, ultra detailed, 8K, vibrant colors", model: "Midjourney", aspect: "1:1", createdAt: "5 hours ago" },
  { id: "img7", emoji: "🏙️", prompt: "Futuristic city at night, cyberpunk style, neon lights", model: "FLUX.1", aspect: "9:16", createdAt: "Yesterday" },
  { id: "img8", emoji: "🦋", prompt: "Crystal butterfly on a flower, glass art, iridescent", model: "Stable Diffusion", aspect: "1:1", createdAt: "Yesterday" },
]

const MODELS = ["DALL-E 3", "Midjourney", "Stable Diffusion XL", "FLUX.1 Pro"]
const ASPECTS = ["1:1", "16:9", "9:16", "4:3"]
const STYLES = ["Cinematic", "Anime", "Watercolor", "Photographic"]
const SIZE_PRESETS = [
  { label: "Square", desc: "1024×1024", value: "square" },
  { label: "Wide", desc: "1792×1024", value: "wide" },
  { label: "Tall", desc: "1024×1792", value: "tall" },
]

const RANDOM_PROMPTS = [
  "A cozy cabin in the woods during autumn, warm lighting",
  "Abstract geometric art with gold and marble textures",
  "A robot painting a self-portrait in a studio",
  "Underwater coral reef city, bioluminescent, fantasy art",
]

/* ═══════════════════════════════════════════
   PanelSection (custom, NOT ConfigSection)
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
        {/* Main container — relative for floating panels */}
        <div
          className="relative h-[560px] overflow-hidden"
          style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        >
          {/* ─── Top Toolbar ─── */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <Button variant="ghost" type="button" onClick={toggleFav} className={`h-auto px-0 py-0 font-normal tracking-normal w-8 h-8 rounded-[12px] flex items-center justify-center transition-colors ${isFav ? "bg-error/10 text-error" : "bg-background/80 backdrop-blur-[6px] border border-border/30 text-muted-foreground/50 hover:text-foreground"}`}>
              <Heart size={14} fill={isFav ? "currentColor" : "none"} />
            </Button>
            <Button variant="ghost" type="button" onClick={() => setShowPanel(p => !p)} className={`h-auto px-0 py-0 font-normal tracking-normal w-8 h-8 rounded-[12px] flex items-center justify-center transition-colors ${showPanel ? "bg-foreground/10 text-foreground" : "bg-background/80 backdrop-blur-[6px] border border-border/30 text-muted-foreground/50 hover:text-foreground"}`}>
              <Settings2 size={14} />
            </Button>
          </div>

          {/* ─── Canvas Area (centered image) ─── */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 100, paddingRight: showPanel ? 290 : 0 }}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-[220px] h-[220px] rounded-[24px] bg-background border border-border/30 shadow-popover flex items-center justify-center text-6xl select-none">
                {current.emoji}
              </div>
              <div className="text-center max-w-[300px]">
                <p className="text-[11px] text-muted-foreground/50 line-clamp-2 mb-1.5">{current.prompt}</p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{current.model}</Badge>
                  <Badge variant="outline" className="text-[9px]">{current.aspect}</Badge>
                  <span className="text-[9px] text-muted-foreground/30">{current.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Nav arrows */}
            <Button variant="ghost" type="button" onClick={() => navigate(-1)} className="h-auto px-0 py-0 font-normal tracking-normal absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-[6px] border border-border/30 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors">
              <ChevronLeft size={16} />
            </Button>
            <Button variant="ghost" type="button" onClick={() => navigate(1)} className="h-auto px-0 py-0 font-normal tracking-normal absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-[6px] border border-border/30 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors" style={{ right: showPanel ? 294 : 16 }}>
              <ChevronRight size={16} />
            </Button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5" style={{ marginRight: showPanel ? 290 : 0 }}>
              {IMAGES.map((img, i) => (
                <Button variant="ghost" type="button" key={img.id} onClick={() => setSelectedIdx(i)} className={`h-auto px-0 py-0 font-normal tracking-normal rounded-full transition-all ${i === selectedIdx ? "w-2 h-2 bg-foreground/60" : "w-1.5 h-1.5 bg-foreground/15 hover:bg-foreground/30"}`} />
              ))}
            </div>
          </div>

          {/* ─── History Strip ─── */}
          <div className="absolute bottom-[90px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-2" style={{ marginRight: showPanel ? 290 : 0 }}>
            {IMAGES.map((img, i) => (
              <Button variant="ghost" type="button" key={img.id} onClick={() => setSelectedIdx(i)} className={`h-auto px-0 py-0 font-normal tracking-normal w-12 h-12 rounded-[12px] flex items-center justify-center text-lg flex-shrink-0 transition-all ${i === selectedIdx ? "bg-background border-2 border-primary shadow-sm scale-110" : "bg-background/70 backdrop-blur-[6px] border border-border/30 hover:scale-105"}`}>
                {img.emoji}
              </Button>
            ))}
          </div>

          {/* ─── Prompt Bar (bottom center) ─── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-[680px] px-4" style={{ marginRight: showPanel ? 145 : 0 }}>
            <div className="rounded-[24px] border border-border/40 bg-background/95 backdrop-blur-[6px] shadow-popover p-3 space-y-2">
              {/* Row 1: Model + Inspiration + Aspect */}
              <div className="flex items-center gap-2">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-7 w-auto px-2 rounded-[10px] border border-border/30 bg-transparent text-[11px] gap-1" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" type="button" onClick={randomPrompt} className="h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[10px] border border-border/30 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-colors" title="随机灵感">
                  <Dices size={13} />
                </Button>
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  {ASPECTS.map(a => (
                    <Button variant="ghost" type="button" key={a} onClick={() => setAspect(a)} className={`h-auto px-0 py-0 font-normal tracking-normal px-2 py-0.5 rounded-[6px] text-[10px] transition-all ${a === aspect ? "bg-foreground text-background" : "text-muted-foreground/40 hover:text-foreground hover:bg-accent/30"}`}>
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
                  className="min-h-[unset] flex-1 rounded-none border-0 bg-transparent p-0 text-[13px] tracking-tight leading-relaxed text-foreground shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0 resize-none"
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
                <span className="text-[13px] text-foreground font-medium tracking-tight">生成参数</span>
                <Button variant="ghost" type="button" onClick={() => setShowPanel(false)} className="h-auto px-0 py-0 font-normal tracking-normal w-5 h-5 rounded-[6px] flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
                  <X size={11} />
                </Button>
              </div>

              <PanelSection title="Quality">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-foreground/70">Steps</span>
                  <span className="text-[11px] text-foreground tabular-nums font-medium">{steps}</span>
                </div>
                <Slider min={1} max={50} step={1} value={[steps]} onValueChange={v => setSteps(v[0])} className="w-full" />
                <div className="flex justify-between text-[8px] text-muted-foreground/25 mt-0.5"><span>1</span><span>50</span></div>
              </PanelSection>

              <PanelSection title="Style">
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map(s => (
                    <Button variant="ghost" type="button" key={s} onClick={() => setStyle(s)} className={`h-auto px-0 py-0 font-normal tracking-normal px-2.5 py-1 rounded-[10px] text-[10px] transition-all border ${s === style ? "bg-foreground text-background border-foreground" : "text-muted-foreground/50 border-border/30 hover:border-border/50 hover:text-foreground"}`}>
                      {s}
                    </Button>
                  ))}
                </div>
              </PanelSection>

              <PanelSection title="Size">
                <div className="flex flex-col gap-1.5">
                  {SIZE_PRESETS.map(sp => (
                    <Button variant="ghost" type="button" key={sp.value} onClick={() => setSizePreset(sp.value)} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center justify-between px-3 py-2 rounded-[12px] text-[11px] transition-all border ${sp.value === sizePreset ? "bg-foreground/[0.05] border-foreground/[0.1] text-foreground" : "border-border/20 text-muted-foreground/50 hover:border-border/40 hover:text-foreground"}`}>
                      <span>{sp.label}</span>
                      <span className="text-[9px] text-muted-foreground/30">{sp.desc}</span>
                    </Button>
                  ))}
                </div>
              </PanelSection>

              <PanelSection title="Advanced">
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-foreground/70 mb-1.5 block">Seed</span>
                    <Input type="number" value={seed} onChange={e => setSeed(e.target.value)} placeholder="随机" className="w-full rounded-[10px] border border-border/30 bg-transparent px-2.5 py-[5px] text-[11px] text-foreground placeholder:text-muted-foreground/25 focus-visible:ring-0" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-foreground/70">CFG Scale</span>
                      <span className="text-[11px] text-foreground tabular-nums font-medium">{cfgScale}</span>
                    </div>
                    <Slider min={1} max={20} step={1} value={[cfgScale]} onValueChange={v => setCfgScale(v[0])} className="w-full" />
                    <div className="flex justify-between text-[8px] text-muted-foreground/25 mt-0.5"><span>1</span><span>20</span></div>
                  </div>
                </div>
              </PanelSection>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
