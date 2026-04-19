import React, { useState } from "react"
import { EmojiPicker, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Smile } from "lucide-react"

const emojiPickerProps: PropDef[] = [
  { name: "onSelect", type: "(emoji: string) => void", default: "-", description: "表情选择回调" },
  { name: "trigger", type: "ReactNode", default: "<SmileIcon />", description: "触发器元素" },
  { name: "recentEmojis", type: "string[]", default: "[]", description: "最近使用的表情" },
  { name: "categories", type: "EmojiCategory[]", default: "DEFAULT_CATEGORIES", description: "表情分类" },
]

export function EmojiPickerDemo() {
  const [selected, setSelected] = useState<string[]>([])

  return (
    <>
      <Section title="Emoji Picker" props={emojiPickerProps} code={`import { EmojiPicker } from "@cherry-studio/ui"

<EmojiPicker onSelect={(emoji) => console.log(emoji)} />`}>
        <div className="flex items-center gap-4">
          <EmojiPicker onSelect={e => setSelected(prev => [...prev, e])} />
          <div className="flex items-center gap-1 min-h-[32px]">
            {selected.length === 0 ? (
              <span className="text-xs text-muted-foreground/40">点击选择表情</span>
            ) : (
              selected.slice(-10).map((e, i) => <span key={i} className="text-lg">{e}</span>)
            )}
          </div>
          {selected.length > 0 && (
            <Button variant="ghost" size="xs" onClick={() => setSelected([])}>清除</Button>
          )}
        </div>
      </Section>

      <Section title="Custom Trigger">
        <EmojiPicker
          trigger={
            <Button variant="outline" size="sm" className="gap-1.5">
              <Smile size={14} /> 添加表情
            </Button>
          }
          onSelect={e => setSelected(prev => [...prev, e])}
        />
      </Section>

      <Section title="With Recent Emojis">
        <EmojiPicker
          recentEmojis={["🔥", "❤️", "👍", "😂", "🎉", "✅", "🚀", "💯"]}
          onSelect={e => setSelected(prev => [...prev, e])}
        />
      </Section>
    </>
  )
}
