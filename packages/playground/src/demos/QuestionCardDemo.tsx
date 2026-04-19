import React from "react"
import { QuestionCard, QuestionCardGroup } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import { Pencil, Code, Languages, Lightbulb, BookOpen, Search, Sparkles, HelpCircle } from "lucide-react"

const verticalQuestions = [
  { question: "如何开始使用 Cherry Studio？", onClick: () => console.log("q1") },
  { question: "怎样创建一个新的 AI 助手？", onClick: () => console.log("q2") },
  { question: "如何配置 API Key？", onClick: () => console.log("q3") },
  { question: "知识库支持哪些文件格式？", onClick: () => console.log("q4") },
  { question: "如何导出聊天记录？", onClick: () => console.log("q5") },
]

const horizontalQuestions = [
  { question: "帮我写一封工作邮件", onClick: () => console.log("h1") },
  { question: "解释一下量子计算", onClick: () => console.log("h2") },
  { question: "推荐几本 AI 入门书", onClick: () => console.log("h3") },
  { question: "如何提高代码质量？", onClick: () => console.log("h4") },
  { question: "帮我做一个周报总结", onClick: () => console.log("h5") },
  { question: "Python 和 Go 哪个更适合后端？", onClick: () => console.log("h6") },
  { question: "如何学习机器学习？", onClick: () => console.log("h7") },
  { question: "帮我翻译一段技术文档", onClick: () => console.log("h8") },
]

const categorizedQuestions = [
  { question: "帮我写一篇产品发布文案", category: "写作", onClick: () => console.log("c1") },
  { question: "Review this React component", category: "代码", onClick: () => console.log("c2") },
  { question: "将这段话翻译成日语", category: "翻译", onClick: () => console.log("c3") },
  { question: "帮我优化这段 SQL 查询", category: "代码", onClick: () => console.log("c4") },
  { question: "润色我的英文邮件", category: "写作", onClick: () => console.log("c5") },
]

const iconQuestions = [
  { question: "帮我写一篇文章", icon: <Pencil className="h-4 w-4" />, onClick: () => console.log("i1") },
  { question: "审查并优化代码", icon: <Code className="h-4 w-4" />, onClick: () => console.log("i2") },
  { question: "翻译一段文字", icon: <Languages className="h-4 w-4" />, onClick: () => console.log("i3") },
  { question: "头脑风暴创意", icon: <Lightbulb className="h-4 w-4" />, onClick: () => console.log("i4") },
  { question: "搜索学术论文", icon: <Search className="h-4 w-4" />, onClick: () => console.log("i5") },
]

export function QuestionCardDemo() {
  const [clicked, setClicked] = React.useState<string | null>(null)

  return (
    <>
      {/* Vertical list */}
      <Section
        title="Vertical List"
        props={[
          { name: "question", type: "string", description: "Question text" },
          { name: "category", type: "string", default: "undefined", description: "Category badge" },
          { name: "icon", type: "ReactNode", default: "undefined", description: "Leading icon" },
          { name: "onClick", type: "() => void", default: "undefined", description: "Click handler" },
        ]}
        code={`import { QuestionCardGroup } from "@cherry-studio/ui"

<QuestionCardGroup
  questions={[
    { question: "如何开始使用？" },
    { question: "怎样创建助手？" },
  ]}
/>`}
      >
        <div className="max-w-sm">
          <QuestionCardGroup questions={verticalQuestions} />
        </div>
      </Section>

      {/* Horizontal scroll */}
      <Section title="Horizontal Scroll">
        <div className="max-w-xl">
          <QuestionCardGroup questions={horizontalQuestions} layout="horizontal" />
        </div>
      </Section>

      {/* With categories */}
      <Section title="With Category Badges">
        <div className="max-w-sm">
          <QuestionCardGroup questions={categorizedQuestions} />
        </div>
      </Section>

      {/* With icons */}
      <Section title="With Icons">
        <div className="max-w-sm">
          <QuestionCardGroup questions={iconQuestions} />
        </div>
      </Section>

      {/* Click interaction */}
      <Section title="Click Interaction">
        <div className="max-w-sm space-y-3">
          <QuestionCard
            question="点击我试试？"
            icon={<HelpCircle className="h-4 w-4" />}
            category="交互"
            onClick={() => setClicked("你点击了问题卡片！")}
          />
          {clicked && (
            <p className="text-sm text-muted-foreground">{clicked}</p>
          )}
        </div>
      </Section>
    </>
  )
}
