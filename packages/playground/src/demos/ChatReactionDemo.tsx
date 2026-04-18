import React, { useState } from "react"
import {
  ChatReaction,
  ChatReactionBar,
  ChatReactionPicker,
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const reactionProps: PropDef[] = [
  { name: "emoji", type: "string", description: "Emoji character" },
  { name: "count", type: "number", description: "Reaction count" },
  {
    name: "active",
    type: "boolean",
    default: "false",
    description: "Whether the current user reacted",
  },
  { name: "onClick", type: "() => void", description: "Click handler" },
]

const barProps: PropDef[] = [
  {
    name: "reactions",
    type: "ChatReactionProps[]",
    default: "[]",
    description: "Array of reaction data",
  },
  {
    name: "onAdd",
    type: "() => void",
    description: 'Show "+" picker button when provided',
  },
  {
    name: "onReactionToggle",
    type: "(emoji: string) => void",
    description: "Called when a reaction pill is clicked",
  },
]

export function ChatReactionDemo() {
  const [reactions, setReactions] = useState([
    { emoji: "👍", count: 12, active: true },
    { emoji: "❤️", count: 5, active: false },
    { emoji: "😂", count: 3, active: false },
    { emoji: "🎉", count: 1, active: true },
  ])

  const handleToggle = (emoji: string) => {
    setReactions((prev) =>
      prev.map((r) =>
        r.emoji === emoji
          ? {
              ...r,
              active: !r.active,
              count: r.active ? r.count - 1 : r.count + 1,
            }
          : r,
      ),
    )
  }

  return (
    <>
      <Section
        title="Basic Reactions"
        props={reactionProps}
        code={`<ChatReaction emoji="👍" count={12} />
<ChatReaction emoji="❤️" count={5} active />`}
      >
        <div className="flex flex-wrap gap-1.5">
          <ChatReaction emoji="👍" count={12} />
          <ChatReaction emoji="❤️" count={5} active />
          <ChatReaction emoji="😂" count={3} />
          <ChatReaction emoji="🎉" count={1} active />
        </div>
      </Section>

      <Section
        title="Interactive Toggle"
        code={`const [reactions, setReactions] = useState([...])

<ChatReactionBar
  reactions={reactions}
  onReactionToggle={handleToggle}
  onAdd={() => {}}
/>`}
        props={barProps}
      >
        <ChatReactionBar
          reactions={reactions}
          onReactionToggle={handleToggle}
          onAdd={() => {}}
        />
      </Section>

      <Section title="Picker Button Only" code={`<ChatReactionPicker onClick={() => {}} />`}>
        <div className="flex items-center gap-2">
          <ChatReactionPicker onClick={() => {}} />
          <span className="text-xs text-muted-foreground">
            Add a reaction
          </span>
        </div>
      </Section>

      <Section
        title="Empty State"
        code={`<ChatReactionBar reactions={[]} onAdd={() => {}} />`}
      >
        <ChatReactionBar reactions={[]} onAdd={() => {}} />
      </Section>

      <Section
        title="Overflow Wrap"
        code={`<ChatReactionBar reactions={manyReactions} onAdd={() => {}} />`}
      >
        <div className="max-w-xs">
          <ChatReactionBar
            onAdd={() => {}}
            reactions={[
              { emoji: "👍", count: 12, active: true },
              { emoji: "❤️", count: 5, active: false },
              { emoji: "😂", count: 3, active: false },
              { emoji: "🎉", count: 1, active: true },
              { emoji: "🔥", count: 8, active: false },
              { emoji: "👀", count: 2, active: false },
              { emoji: "🚀", count: 4, active: true },
              { emoji: "💯", count: 6, active: false },
            ]}
          />
        </div>
      </Section>
    </>
  )
}
