import React from "react"
import {
  CommentItem, CommentInput, Avatar, AvatarFallback, Button, Separator,
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { ThumbsUp, Reply, Trash2 } from "lucide-react"

interface Comment {
  id: string
  author: string
  time: string
  content: string
  avatar: string
  replies?: Comment[]
}

const sampleComments: Comment[] = [
  {
    id: "1",
    author: "Alice",
    time: "10 分钟前",
    content: "这个组件设计得很棒！@Bob 你觉得呢？",
    avatar: "A",
    replies: [
      { id: "1-1", author: "Bob", time: "8 分钟前", content: "同意，不过颜色可以再调调", avatar: "B" },
      { id: "1-2", author: "Alice", time: "5 分钟前", content: "好的，我来调整一下配色方案", avatar: "A" },
    ],
  },
  {
    id: "2",
    author: "Charlie",
    time: "30 分钟前",
    content: "建议增加深色模式的支持，现在在暗色主题下对比度不太够",
    avatar: "C",
  },
  {
    id: "3",
    author: "Diana",
    time: "1 小时前",
    content: "性能表现很流畅，在低端设备上也没有卡顿 👍",
    avatar: "D",
  },
]

function CommentActions({ commentId, onReply, onDelete }: { commentId: string; onReply?: (id: string) => void; onDelete?: (id: string) => void }) {
  const [liked, setLiked] = React.useState(false)
  return (
    <div className="flex items-center gap-1 mt-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={() => setLiked(!liked)}
      >
        <ThumbsUp className={`h-3 w-3 mr-1 ${liked ? "fill-current text-primary" : ""}`} />
        {liked ? 1 : 0}
      </Button>
      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground" onClick={() => onReply?.(commentId)}>
        <Reply className="h-3 w-3 mr-1" /> 回复
      </Button>
      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive" onClick={() => onDelete?.(commentId)}>
        <Trash2 className="h-3 w-3 mr-1" /> 删除
      </Button>
    </div>
  )
}

function renderHighlighted(text: string) {
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-primary font-medium">{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  )
}

export function CommentDemo() {
  const [comments, setComments] = React.useState(sampleComments)
  const [replyTo, setReplyTo] = React.useState<string | null>(null)

  const handleSubmit = (value: string) => {
    setComments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        author: "You",
        time: "刚刚",
        content: value,
        avatar: "Y",
      },
    ])
  }

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const handleReplySubmit = (parentId: string, value: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), { id: String(Date.now()), author: "You", time: "刚刚", content: value, avatar: "Y" }] }
          : c,
      ),
    )
    setReplyTo(null)
  }

  return (
    <>
      {/* Comment list */}
      <Section
        title="Comment List"
        props={[
          { name: "author", type: "string", description: "Author name" },
          { name: "time", type: "string", default: "undefined", description: "Timestamp text" },
          { name: "content", type: "string", description: "Comment body" },
          { name: "avatar", type: "ReactNode", default: "undefined", description: "Avatar element" },
        ]}
        code={`import { CommentItem, CommentInput, Avatar, AvatarFallback } from "@cherry-studio/ui"

<CommentItem
  avatar={<Avatar><AvatarFallback>A</AvatarFallback></Avatar>}
  author="Alice"
  time="10 分钟前"
  content="这个组件设计得很棒！"
/>`}
      >
        <div className="max-w-md border rounded-[var(--radius-card)] p-4 space-y-0">
          {comments.map((comment) => (
            <React.Fragment key={comment.id}>
              <CommentItem
                avatar={<Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{comment.avatar}</AvatarFallback></Avatar>}
                author={comment.author}
                time={comment.time}
                content={comment.content}
              >
                <CommentActions commentId={comment.id} onReply={setReplyTo} onDelete={handleDelete} />
                {replyTo === comment.id && (
                  <div className="mt-2">
                    <CommentInput placeholder={`回复 ${comment.author}...`} onSubmit={(v) => handleReplySubmit(comment.id, v)} />
                  </div>
                )}
              </CommentItem>
            </React.Fragment>
          ))}
          <Separator className="my-2" />
          <CommentInput
            placeholder="写一条评论..."
            onSubmit={handleSubmit}
          />
        </div>
      </Section>

      {/* Nested replies */}
      <Section title="Nested Replies">
        <div className="max-w-md border rounded-[var(--radius-card)] p-4 space-y-0">
          {sampleComments.filter((c) => c.replies).map((comment) => (
            <React.Fragment key={comment.id}>
              <CommentItem
                avatar={<Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{comment.avatar}</AvatarFallback></Avatar>}
                author={comment.author}
                time={comment.time}
                content={comment.content}
              >
                <CommentActions commentId={comment.id} />
                {comment.replies && (
                  <div className="ml-8 border-l-2 border-border/50 pl-4 mt-2">
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        avatar={<Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{reply.avatar}</AvatarFallback></Avatar>}
                        author={reply.author}
                        time={reply.time}
                        content={reply.content}
                      >
                        <CommentActions commentId={reply.id} />
                      </CommentItem>
                    ))}
                  </div>
                )}
              </CommentItem>
            </React.Fragment>
          ))}
        </div>
      </Section>

      {/* Mention highlighting */}
      <Section title="@Mention Highlighting">
        <div className="max-w-md border rounded-[var(--radius-card)] p-4">
          <CommentItem
            avatar={<Avatar className="h-8 w-8"><AvatarFallback className="text-xs">A</AvatarFallback></Avatar>}
            author="Alice"
            time="刚刚"
            content=""
          >
            <p className="text-sm text-foreground -mt-2 mb-1">
              {renderHighlighted("这个方案 @Bob 和 @Charlie 都看一下，需要你们的反馈")}
            </p>
          </CommentItem>
        </div>
      </Section>

      {/* Comment actions */}
      <Section title="Comment Actions">
        <div className="max-w-md border rounded-[var(--radius-card)] p-4">
          <CommentItem
            avatar={<Avatar className="h-8 w-8"><AvatarFallback className="text-xs">D</AvatarFallback></Avatar>}
            author="Diana"
            time="1 小时前"
            content="性能表现很流畅，在低端设备上也没有卡顿 👍"
          >
            <CommentActions commentId="3" />
          </CommentItem>
        </div>
      </Section>
    </>
  )
}
