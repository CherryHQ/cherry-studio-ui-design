import React, { useState } from "react"
import { FloatingChatButton, Button } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const floatingChatProps: PropDef[] = [
  { name: "onClick", type: "() => void", default: "-", description: "点击回调" },
  { name: "unreadCount", type: "number", default: "-", description: "未读消息数" },
  { name: "position", type: '"bottom-right" | "bottom-left"', default: '"bottom-right"', description: "位置" },
]

export function FloatingChatButtonDemo() {
  const [count, setCount] = useState(3)

  return (
    <>
      <Section title="Floating Chat Button" props={floatingChatProps} code={`import { FloatingChatButton } from "@cherry-studio/ui"

<FloatingChatButton unreadCount={3} onClick={() => {}} />`}>
        <div className="relative h-[200px] border rounded-[var(--radius-card)] bg-muted/20 overflow-hidden">
          <p className="absolute top-4 left-4 text-xs text-muted-foreground/40">页面内容区域</p>
          {/* Use absolute instead of fixed for demo containment */}
          <FloatingChatButton
            unreadCount={count}
            onClick={() => setCount(0)}
            className="!fixed !bottom-auto !right-auto absolute bottom-4 right-4"
            style={{ position: "absolute", bottom: 16, right: 16 }}
          />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="xs" onClick={() => setCount(prev => prev + 1)}>+1 未读</Button>
          <Button variant="outline" size="xs" onClick={() => setCount(0)}>清除</Button>
          <span className="text-xs text-muted-foreground/40">当前: {count}</span>
        </div>
      </Section>

      <Section title="Variants">
        <div className="relative h-[160px] border rounded-[var(--radius-card)] bg-muted/20 overflow-hidden">
          <div className="absolute bottom-4 left-4">
            <FloatingChatButton
              position="bottom-left"
              className="!fixed !bottom-auto !left-auto !right-auto"
              style={{ position: "relative" }}
            />
          </div>
          <div className="absolute bottom-4 right-4">
            <FloatingChatButton
              unreadCount={99}
              className="!fixed !bottom-auto !right-auto"
              style={{ position: "relative" }}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <FloatingChatButton
              unreadCount={128}
              className="!fixed !bottom-auto !right-auto"
              style={{ position: "relative" }}
            />
          </div>
        </div>
      </Section>
    </>
  )
}
