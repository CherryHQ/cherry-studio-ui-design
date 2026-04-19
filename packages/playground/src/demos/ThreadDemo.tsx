import React from "react"
import {
  ConversationThread, ChatMessage, Composer, Avatar, AvatarFallback,
  Button, ScrollArea, Separator, Badge,
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { MessageSquare, X } from "lucide-react"
import type { ChatMessageData } from "@cherry-studio/ui"

const parentMessage: ChatMessageData = {
  id: "parent-1",
  role: "user",
  parts: [{ type: "text", text: "如何在 React 中实现一个自定义 Hook 来管理表单状态？" }],
}

const threadReplies: ChatMessageData[] = [
  {
    id: "reply-1",
    role: "assistant",
    parts: [{ type: "text", text: "你可以创建一个 `useForm` Hook，利用 `useState` 管理表单字段，`useCallback` 处理变更事件。以下是基本实现思路：\n\n1. 定义初始状态对象\n2. 创建 `handleChange` 函数\n3. 创建 `handleSubmit` 函数\n4. 返回 `{ values, handleChange, handleSubmit, reset }`" }],
  },
  {
    id: "reply-2",
    role: "user",
    parts: [{ type: "text", text: "能支持表单验证吗？比如必填和格式校验" }],
  },
  {
    id: "reply-3",
    role: "assistant",
    parts: [{ type: "text", text: "当然可以！你可以扩展 Hook 加入 `errors` 状态和 `validate` 函数。推荐使用 schema 验证库如 Zod 或 Yup：\n\n```typescript\nconst useForm = <T>(initial: T, schema: ZodSchema<T>) => {\n  const [values, setValues] = useState(initial)\n  const [errors, setErrors] = useState<Record<string, string>>({})\n  // ...\n}\n```" }],
  },
]

const nestedMessages: ChatMessageData[] = [
  { id: "n1", role: "user", parts: [{ type: "text", text: "这个方案可行吗？" }] },
  { id: "n2", role: "assistant", parts: [{ type: "text", text: "完全可行，我建议分两步实现。" }] },
  { id: "n3", role: "user", parts: [{ type: "text", text: "第一步是什么？" }] },
  { id: "n4", role: "assistant", parts: [{ type: "text", text: "先定义数据结构和接口类型。" }] },
]

export function ThreadDemo() {
  const [threadOpen, setThreadOpen] = React.useState(false)
  const [replies, setReplies] = React.useState<ChatMessageData[]>(threadReplies)
  const replyCount = replies.length

  const handleReply = (text: string) => {
    setReplies(prev => [...prev, {
      id: `reply-${Date.now()}`,
      role: "user",
      parts: [{ type: "text", text }],
    }])
  }

  return (
    <>
      {/* Parent message with thread */}
      <Section
        title="Conversation Thread"
        props={[
          { name: "children", type: "ReactNode", description: "Thread content (messages)" },
          { name: "depth", type: "number", default: "0", description: "Nesting depth" },
        ]}
        code={`import { ConversationThread, ChatMessage } from "@cherry-studio/ui"

<ConversationThread>
  <ChatMessage message={parentMsg} />
  <ConversationThread depth={1}>
    <ChatMessage message={reply} />
  </ConversationThread>
</ConversationThread>`}
      >
        <div className="max-w-2xl border rounded-[var(--radius-card)] overflow-hidden">
          <div className="p-4">
            <ChatMessage message={parentMessage} showActions={false} />
          </div>
          <Separator />
          <div className="p-4 bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{replyCount} 条回复</span>
            </div>
            <ConversationThread>
              {replies.map((msg) => (
                <ChatMessage key={msg.id} message={msg} showActions={false} />
              ))}
            </ConversationThread>
          </div>
          <Separator />
          <div className="p-3">
            <Composer
              variant="rounded"
              placeholder="回复此线程..."
              onSendMessage={handleReply}
            />
          </div>
        </div>
      </Section>

      {/* Nested threads */}
      <Section title="Nested Threads (depth)">
        <div className="max-w-2xl border rounded-[var(--radius-card)] p-4">
          <ConversationThread>
            <ChatMessage message={nestedMessages[0]} showActions={false} />
            <ChatMessage message={nestedMessages[1]} showActions={false} />
            <ConversationThread depth={1}>
              <ChatMessage message={nestedMessages[2]} showActions={false} />
              <ChatMessage message={nestedMessages[3]} showActions={false} />
            </ConversationThread>
          </ConversationThread>
        </div>
      </Section>

      {/* Thread entry button */}
      <Section title="Thread Entry Button">
        <div className="max-w-2xl space-y-3">
          <div className="border rounded-[var(--radius-card)] p-4">
            <ChatMessage message={parentMessage} showActions={false} />
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-muted-foreground gap-1.5"
              onClick={() => setThreadOpen(true)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {replyCount} 条回复
              <span className="text-muted-foreground/60">· 最近 5 分钟前</span>
            </Button>
          </div>

          {threadOpen && (
            <div className="border rounded-[var(--radius-card)] overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">线程</span>
                  <Badge variant="secondary" className="text-[10px]">{replyCount}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setThreadOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="max-h-[300px]">
                <div className="p-4">
                  <ConversationThread>
                    {replies.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} showActions={false} />
                    ))}
                  </ConversationThread>
                </div>
              </ScrollArea>
              <Separator />
              <div className="p-3">
                <Composer
                  variant="rounded"
                  placeholder="回复..."
                  onSendMessage={handleReply}
                />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Close thread */}
      <Section title="Thread Panel (closable)">
        <div className="max-w-2xl border rounded-[var(--radius-card)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm font-medium">线程详情</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setThreadOpen(false)}>关闭线程</Button>
          </div>
          <div className="p-4">
            <ChatMessage message={parentMessage} showActions={false} />
            <Separator className="my-3" />
            <ConversationThread>
              <ChatMessage message={threadReplies[0]} showActions={false} />
            </ConversationThread>
          </div>
        </div>
      </Section>
    </>
  )
}
