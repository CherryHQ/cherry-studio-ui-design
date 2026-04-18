import React, { useState, useCallback } from "react"
import { ThreadView, type ThreadMessage } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const PARENT: ThreadMessage = {
  id: "m1",
  role: "assistant",
  content: "RAG（检索增强生成）是一种将信息检索与生成式 AI 相结合的技术。它通过从外部知识库中检索相关文档片段，将其作为上下文传递给大语言模型，从而提升回答的准确性和时效性。",
  timestamp: "14:32",
}

const INITIAL_REPLIES: ThreadMessage[] = [
  { id: "r1", role: "user", content: "具体的实现步骤是什么？", timestamp: "14:33" },
  { id: "r2", role: "assistant", content: "RAG 实现通常包括以下步骤：\n1. 文档分块（Chunking）\n2. 向量嵌入（Embedding）\n3. 索引存储\n4. 查询检索\n5. 上下文注入\n6. 生成回答", timestamp: "14:33" },
  { id: "r3", role: "user", content: "推荐用什么向量数据库？", timestamp: "14:35" },
]

const threadViewProps: PropDef[] = [
  { name: "parentMessage", type: "ThreadMessage", default: "-", description: "父消息" },
  { name: "replies", type: "ThreadMessage[]", default: "[]", description: "回复消息列表" },
  { name: "onReply", type: "(content: string) => void", default: "-", description: "发送回复回调" },
  { name: "onClose", type: "() => void", default: "-", description: "关闭回调" },
]

export function ThreadViewDemo() {
  const [replies, setReplies] = useState(INITIAL_REPLIES)

  const handleReply = useCallback((content: string) => {
    const userMsg: ThreadMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    }
    setReplies(prev => [...prev, userMsg])

    setTimeout(() => {
      const aiMsg: ThreadMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "这是一个模拟的 AI 回复。在实际场景中，这里会调用 LLM 生成上下文相关的回答。",
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      }
      setReplies(prev => [...prev, aiMsg])
    }, 1000)
  }, [])

  return (
    <Section title="Thread View" props={threadViewProps} code={`import { ThreadView } from "@cherry-studio/ui"

<ThreadView
  parentMessage={parentMsg}
  replies={replies}
  onReply={(content) => handleReply(content)}
  onClose={() => setOpen(false)}
/>`}>
      <div className="max-w-md h-[480px]">
        <ThreadView
          parentMessage={PARENT}
          replies={replies}
          onReply={handleReply}
          onClose={() => {}}
        />
      </div>
    </Section>
  )
}
