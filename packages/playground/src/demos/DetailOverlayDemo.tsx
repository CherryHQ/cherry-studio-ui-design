import React, { useState } from "react"
import { DetailOverlay, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Maximize2 } from "lucide-react"

const MOCK_VARIANTS = [
  { id: "v1", image: "https://picsum.photos/seed/v1/400/400", label: "Variant 1" },
  { id: "v2", image: "https://picsum.photos/seed/v2/400/400", label: "Variant 2" },
  { id: "v3", image: "https://picsum.photos/seed/v3/400/400", label: "Variant 3" },
  { id: "v4", image: "https://picsum.photos/seed/v4/400/400", label: "Variant 4" },
]

const MOCK_IMAGES = [
  "https://picsum.photos/seed/main/800/600",
  "https://picsum.photos/seed/alt1/800/600",
  "https://picsum.photos/seed/alt2/800/600",
]

const detailOverlayProps: PropDef[] = [
  { name: "open", type: "boolean", default: "false", description: "是否打开" },
  { name: "onOpenChange", type: "(open: boolean) => void", default: "-", description: "打开状态变化回调" },
  { name: "images", type: "string[]", default: "-", description: "图片画廊 URLs" },
  { name: "title", type: "string", default: "-", description: "标题" },
  { name: "author", type: "string", default: "-", description: "作者" },
  { name: "prompt", type: "string", default: "-", description: "Prompt 文本" },
  { name: "variants", type: "Variant[]", default: "[]", description: "变体缩略图" },
  { name: "onDownload", type: "() => void", default: "-", description: "下载回调" },
  { name: "onRemix", type: "() => void", default: "-", description: "Remix 回调" },
  { name: "onLike", type: "() => void", default: "-", description: "点赞回调" },
  { name: "onShare", type: "() => void", default: "-", description: "分享回调" },
]

export function DetailOverlayDemo() {
  const [open, setOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(42)

  return (
    <Section title="Detail Overlay" props={detailOverlayProps} code={`import { DetailOverlay } from "@cherry-studio/ui"

<DetailOverlay
  open={open}
  onOpenChange={setOpen}
  images={["https://picsum.photos/800/600"]}
  title="Cyberpunk City"
  author="Alice"
  prompt="A futuristic cyberpunk cityscape..."
  variants={variants}
  onDownload={() => {}}
  onRemix={() => {}}
/>`}>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Maximize2 size={14} /> Open Detail Overlay
      </Button>

      <DetailOverlay
        open={open}
        onOpenChange={setOpen}
        images={MOCK_IMAGES}
        title="Cyberpunk Cityscape at Night"
        author="Alice Chen"
        date="2026-04-15"
        prompt="A futuristic cyberpunk cityscape at night, neon lights reflecting on wet streets, towering skyscrapers with holographic advertisements, flying vehicles in the distance, ultra detailed, cinematic lighting, 8K resolution"
        variants={MOCK_VARIANTS}
        onDownload={() => alert("Download started")}
        onRemix={() => alert("Opening remix editor...")}
        onShare={() => navigator.clipboard.writeText(window.location.href).then(() => alert("Link copied!"))}
        onReport={() => alert("Report submitted")}
        onLike={() => { setLiked(!liked); setLikeCount(prev => liked ? prev - 1 : prev + 1) }}
        likeCount={likeCount}
        liked={liked}
      />
    </Section>
  )
}
