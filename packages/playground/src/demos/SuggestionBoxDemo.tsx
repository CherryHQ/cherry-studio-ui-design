import React from "react"
import { SuggestionBox, SuggestionGrid } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Pencil, Languages, Code, Lightbulb, BookOpen, Sparkles } from "lucide-react"

const defaultSuggestions = [
  { icon: <Pencil className="h-4 w-4" />, title: "写一篇文章", description: "帮我撰写一篇关于 AI 发展趋势的文章", onClick: () => console.log("写一篇文章") },
  { icon: <Languages className="h-4 w-4" />, title: "帮我翻译", description: "将中文内容翻译为英文或其他语言", onClick: () => console.log("帮我翻译") },
  { icon: <Code className="h-4 w-4" />, title: "代码审查", description: "审查代码并给出优化建议", onClick: () => console.log("代码审查") },
  { icon: <Lightbulb className="h-4 w-4" />, title: "头脑风暴", description: "围绕主题发散创意和想法", onClick: () => console.log("头脑风暴") },
]

export function SuggestionBoxDemo() {
  return (
    <>
      <Section
        title="2×2 Grid (Default)"
        props={[
          { name: "icon", type: "ReactNode", default: "undefined", description: "Icon or emoji" },
          { name: "title", type: "string", description: "Suggestion title" },
          { name: "description", type: "string", default: "undefined", description: "Short description" },
          { name: "onClick", type: "() => void", default: "undefined", description: "Click handler" },
        ]}
        code={`import { SuggestionGrid } from "@cherry-studio/ui"

<SuggestionGrid suggestions={[
  { icon: "✏️", title: "写一篇文章", description: "帮我撰写一篇文章" },
  { icon: "🌐", title: "帮我翻译", description: "中译英" },
  { icon: "🔍", title: "代码审查", description: "审查并优化代码" },
  { icon: "💡", title: "头脑风暴", description: "发散创意" },
]} />`}
      >
        <div className="max-w-md">
          <SuggestionGrid suggestions={defaultSuggestions} />
        </div>
      </Section>

      <Section title="3-Column Grid">
        <div className="max-w-lg">
          <SuggestionGrid
            columns={3}
            suggestions={[
              { icon: <Pencil className="h-4 w-4" />, title: "写作", onClick: () => console.log("写作") },
              { icon: <Languages className="h-4 w-4" />, title: "翻译", onClick: () => console.log("翻译") },
              { icon: <Code className="h-4 w-4" />, title: "编码", onClick: () => console.log("编码") },
              { icon: <Lightbulb className="h-4 w-4" />, title: "创意", onClick: () => console.log("创意") },
              { icon: <BookOpen className="h-4 w-4" />, title: "阅读", onClick: () => console.log("阅读") },
              { icon: <Sparkles className="h-4 w-4" />, title: "灵感", onClick: () => console.log("灵感") },
            ]}
          />
        </div>
      </Section>

      <Section title="Text Only (No Icons)">
        <div className="max-w-md">
          <SuggestionGrid
            suggestions={[
              { title: "解释量子计算的基本原理", onClick: () => console.log("量子计算") },
              { title: "推荐适合初学者的编程语言", onClick: () => console.log("编程语言") },
              { title: "总结这篇文章的要点", onClick: () => console.log("总结") },
              { title: "帮我写一封商务邮件", onClick: () => console.log("邮件") },
            ]}
          />
        </div>
      </Section>

      <Section title="Single SuggestionBox">
        <div className="max-w-xs">
          <SuggestionBox
            icon={<Sparkles className="h-4 w-4" />}
            title="让 AI 帮你开始"
            description="点击获取灵感提示，快速开启对话"
            onClick={() => console.log("单个建议")}
          />
        </div>
      </Section>
    </>
  )
}
