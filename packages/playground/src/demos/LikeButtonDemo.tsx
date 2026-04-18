import React, { useState } from "react"
import { LikeButton } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const likeButtonProps: PropDef[] = [
  { name: "count", type: "number", default: "0", description: "Like count" },
  { name: "liked", type: "boolean", default: "false", description: "Whether the current user liked" },
  { name: "onToggle", type: "() => void", description: "Toggle handler" },
]

export function LikeButtonDemo() {
  const [liked1, setLiked1] = useState(false)
  const [count1, setCount1] = useState(12)
  const [liked2, setLiked2] = useState(true)
  const [count2, setCount2] = useState(48)

  return (
    <>
      <Section
        title="Basic"
        props={likeButtonProps}
        code={`<LikeButton count={12} liked={liked} onToggle={() => setLiked(!liked)} />`}
      >
        <div className="flex items-center gap-3">
          <LikeButton
            count={count1}
            liked={liked1}
            onToggle={() => { setLiked1(l => !l); setCount1(c => liked1 ? c - 1 : c + 1) }}
          />
          <LikeButton
            count={count2}
            liked={liked2}
            onToggle={() => { setLiked2(l => !l); setCount2(c => liked2 ? c - 1 : c + 1) }}
          />
          <LikeButton count={0} />
        </div>
      </Section>

      <Section title="Sizes" code={`<LikeButton count={5} className="text-sm" />`}>
        <div className="flex items-center gap-3">
          <LikeButton count={5} liked className="p-2 gap-1.5" />
          <LikeButton count={24} liked />
          <LikeButton count={128} liked className="p-4 gap-2.5" />
        </div>
      </Section>

      <Section title="Disabled" code={`<LikeButton count={7} disabled />`}>
        <div className="flex items-center gap-3">
          <LikeButton count={7} disabled />
          <LikeButton count={3} liked disabled />
        </div>
      </Section>
    </>
  )
}
