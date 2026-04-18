import React from "react"
import {
  ThinkingBlock, MessageBubble, Avatar, AvatarFallback
} from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const thinkingProps: PropDef[] = [
  { name: "content", type: "string", description: "Thinking content text" },
  { name: "defaultOpen", type: "boolean", default: "true", description: "Whether expanded by default" },
  { name: "duration", type: "number", default: "undefined", description: "Thinking duration in ms" },
]

export function ThinkingBlockDemo() {
  return (
    <>
      <Section title="Basic Usage" install="npm install @cherry-studio/ui" props={thinkingProps} code={`import { ThinkingBlock } from "@cherry-studio/ui"

<ThinkingBlock
  content="Let me analyze this step by step..."
  duration={1500}
/>`}>
        <div className="max-w-lg">
          <ThinkingBlock
            content={"Let me analyze the user's question carefully.\n\n1. First, I need to understand the requirements\n2. Then I'll consider the best approach\n3. Finally, I'll formulate a clear response\n\nThe key insight here is that we need to balance performance with readability."}
          />
        </div>
      </Section>

      <Section title="Collapsed">
        <div className="max-w-lg">
          <ThinkingBlock
            defaultOpen={false}
            content="This is a short thought process — just verifying the answer is correct."
          />
        </div>
      </Section>

      <Section title="With Duration">
        <div className="max-w-lg">
          <ThinkingBlock
            duration={2300}
            content={"I need to consider multiple factors here:\n- The user wants a performant solution\n- It should be type-safe with TypeScript\n- The API needs to remain backward compatible\n- Edge cases around null values must be handled\n\nAfter weighing these factors, I'll suggest using a discriminated union type with runtime validation."}
          />
        </div>
      </Section>

      <Section title="In Message Flow">
        <div className="max-w-lg space-y-4">
          <MessageBubble
            role="user"
            avatar={<Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">You</AvatarFallback></Avatar>}
          >
            How should I structure a React context for global state?
          </MessageBubble>

          <MessageBubble
            role="assistant"
            avatar={<Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">🍒</AvatarFallback></Avatar>}
          >
            <ThinkingBlock
              duration={4100}
              content={"The user is asking about React context for global state.\n\nI should cover:\n1. When to use Context vs state management libraries\n2. The provider pattern\n3. Performance considerations with re-renders\n4. Splitting contexts for different domains"}
            />
            <div className="space-y-2 mt-1">
              <p>Here's a recommended approach for structuring React context:</p>
              <ol className="list-decimal pl-4 space-y-1 text-xs">
                <li>Create a separate context for each domain (auth, theme, etc.)</li>
                <li>Use a custom hook to consume each context</li>
                <li>Memoize the provider value to prevent unnecessary re-renders</li>
              </ol>
            </div>
          </MessageBubble>

          <MessageBubble
            role="user"
            avatar={<Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">You</AvatarFallback></Avatar>}
          >
            That makes sense, thanks!
          </MessageBubble>
        </div>
      </Section>
    </>
  )
}
