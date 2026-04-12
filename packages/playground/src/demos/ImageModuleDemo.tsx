import React, { useState } from "react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Button, Badge, Card, Slider,
  ToggleGroup, ToggleGroupItem, Textarea
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Wand2, Download, Trash2, ZoomIn, Sparkles } from "lucide-react"

const mockImages = [
  { id: "1", prompt: "A cyberpunk cityscape at sunset", status: "done" },
  { id: "2", prompt: "Watercolor painting of a cat", status: "done" },
  { id: "3", prompt: "Minimalist logo design", status: "done" },
  { id: "4", prompt: "Abstract fractal art", status: "generating" },
]

export function ImageModuleDemo() {
  const [model, setModel] = useState("dall-e-3")
  const [ratio, setRatio] = useState("1:1")
  const [count, setCount] = useState([1])
  const [prompt, setPrompt] = useState("")

  return (
    <Section title="Image Generation Module" code={`// Compose with: Select, Textarea, ToggleGroup, Slider, Button, Card
<div className="grid grid-cols-[280px_1fr]">
  <aside>Prompt + Controls</aside>
  <main>Image Gallery Grid</main>
</div>`}>
      <div className="max-w-4xl rounded-xl border bg-background overflow-hidden">
        <div className="grid md:grid-cols-[280px_1fr] divide-x divide-border">
          {/* Left: Controls */}
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Model</p>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dall-e-3">DALL·E 3</SelectItem>
                  <SelectItem value="midjourney">Midjourney v6</SelectItem>
                  <SelectItem value="sd-xl">Stable Diffusion XL</SelectItem>
                  <SelectItem value="flux">Flux.1 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium">Aspect Ratio</p>
              <ToggleGroup type="single" value={ratio} onValueChange={(v) => v && setRatio(v)} className="justify-start">
                <ToggleGroupItem value="1:1" className="text-xs h-7 px-2.5">1:1</ToggleGroupItem>
                <ToggleGroupItem value="16:9" className="text-xs h-7 px-2.5">16:9</ToggleGroupItem>
                <ToggleGroupItem value="9:16" className="text-xs h-7 px-2.5">9:16</ToggleGroupItem>
                <ToggleGroupItem value="4:3" className="text-xs h-7 px-2.5">4:3</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Count</p>
                <span className="text-xs text-muted-foreground tabular-nums">{count[0]}</span>
              </div>
              <Slider value={count} onValueChange={setCount} min={1} max={4} step={1} />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium">Prompt</p>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="min-h-24 text-xs resize-none"
              />
            </div>

            <Button className="w-full" size="sm">
              <Wand2 className="size-3.5 mr-1.5" /> Generate
            </Button>
          </div>

          {/* Right: Gallery */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{mockImages.length} images</p>
              <Badge variant="outline" className="text-[10px]">{ratio}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mockImages.map((img) => (
                <Card key={img.id} className="overflow-hidden group">
                  <div className="aspect-square bg-muted/50 flex items-center justify-center relative">
                    {img.status === "generating" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="size-6 text-primary animate-pulse" />
                        <span className="text-[10px] text-muted-foreground">Generating...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-muted-foreground/50 px-3 text-center">{img.prompt}</div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Button variant="secondary" size="icon" className="size-7"><ZoomIn className="size-3.5" /></Button>
                          <Button variant="secondary" size="icon" className="size-7"><Download className="size-3.5" /></Button>
                          <Button variant="secondary" size="icon" className="size-7"><Trash2 className="size-3.5" /></Button>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
