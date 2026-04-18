import React, { useState } from "react"
import { ImageCanvas } from "@cherry-studio/ui"
import type { ImageItem } from "@cherry-studio/ui"
import { Section } from "../components/Section"

const MODELS = [
  { value: "dall-e-3", label: "DALL·E 3" },
  { value: "midjourney", label: "Midjourney v6" },
  { value: "stable-diffusion", label: "Stable Diffusion XL" },
  { value: "flux", label: "Flux Pro" },
]

const INITIAL_IMAGES: ImageItem[] = [
  { id: "1", url: "https://picsum.photos/seed/ic1/512/512", prompt: "A serene mountain lake at sunset", model: "dall-e-3", size: "1024×1024", seed: 42, status: "done", createdAt: "2026-04-18 10:00" },
  { id: "2", url: "https://picsum.photos/seed/ic2/512/768", prompt: "Cyberpunk city street with neon signs", model: "midjourney", size: "512×768", seed: 123, status: "done", createdAt: "2026-04-18 10:05" },
  { id: "3", url: "https://picsum.photos/seed/ic3/768/512", prompt: "Watercolor painting of a Japanese garden", model: "stable-diffusion", size: "768×512", seed: 456, status: "done", createdAt: "2026-04-18 10:10" },
  { id: "4", url: "", prompt: "A cat wearing a space suit", model: "flux", size: "1024×1024", status: "generating", progress: 65, createdAt: "2026-04-18 10:15" },
]

export function ImageCanvasDemo() {
  const [images, setImages] = useState<ImageItem[]>(INITIAL_IMAGES)
  const [selectedId, setSelectedId] = useState("1")
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("dall-e-3")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [steps, setSteps] = useState(30)
  const [seed, setSeed] = useState(42)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPanel, setShowPanel] = useState(true)

  const handleGenerate = () => {
    setIsGenerating(true)
    const newId = String(Date.now())
    setImages((prev) => [
      ...prev,
      { id: newId, url: "", prompt, model, size: "1024×1024", seed, status: "generating", progress: 0, createdAt: new Date().toLocaleString() },
    ])
    setSelectedId(newId)

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      setImages((prev) => prev.map((img) => img.id === newId ? { ...img, progress } : img))
      if (progress >= 100) {
        clearInterval(interval)
        setImages((prev) =>
          prev.map((img) =>
            img.id === newId
              ? { ...img, status: "done", url: `https://picsum.photos/seed/${newId}/512/512`, progress: 100 }
              : img,
          ),
        )
        setIsGenerating(false)
      }
    }, 500)
  }

  return (
    <Section
      title="ImageCanvas"
      description="可复用的图片生成画布组件（历史条 + 画布 + 控制面板 + 提示词输入）"
      props={[
        { name: "images", type: "ImageItem[]", description: "图片列表" },
        { name: "prompt", type: "string", description: "当前提示词" },
        { name: "onGenerate", type: "() => void", description: "生成回调" },
        { name: "model", type: "string", description: "当前模型" },
        { name: "models", type: "{ value, label }[]", description: "可选模型列表" },
        { name: "showControlPanel", type: "boolean", default: "true", description: "显示控制面板" },
        { name: "virtualize", type: "boolean", default: "false", description: "虚拟滚动(大量图片)" },
      ]}
      code={`import { ImageCanvas } from "@cherry-studio/ui"

<ImageCanvas
  images={images}
  selectedId={selectedId}
  onSelect={setSelectedId}
  prompt={prompt}
  onPromptChange={setPrompt}
  onGenerate={handleGenerate}
  model={model}
  onModelChange={setModel}
  models={models}
  aspectRatio="1:1"
  onAspectRatioChange={setAspectRatio}
/>`}
    >
      <ImageCanvas
        images={images}
        selectedId={selectedId}
        onSelect={setSelectedId}
        prompt={prompt}
        onPromptChange={setPrompt}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        model={model}
        onModelChange={setModel}
        models={MODELS}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        steps={steps}
        onStepsChange={setSteps}
        seed={seed}
        onSeedChange={setSeed}
        showControlPanel={showPanel}
        onToggleControlPanel={() => setShowPanel(!showPanel)}
        onDownload={(img) => alert(`Downloading ${img.id}`)}
        onCopy={(img) => navigator.clipboard.writeText(img.url)}
        onDelete={(id) => setImages((prev) => prev.filter((img) => img.id !== id))}
        onUpscale={(id) => alert(`Upscaling ${id}`)}
        className="h-[560px]"
      />
    </Section>
  )
}
