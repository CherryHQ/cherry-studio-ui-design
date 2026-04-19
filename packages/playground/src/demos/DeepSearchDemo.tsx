import React, { useState, useCallback } from "react"
import { DeepSearch, Button, type DeepSearchStep } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import { Play, RotateCcw } from "lucide-react"

const INITIAL_STEPS: DeepSearchStep[] = [
  { label: "分析查询意图", status: "done", result: "用户想了解 RAG 技术在知识库中的最佳实践和实现方案。" },
  { label: "搜索相关文档", status: "searching" },
  { label: "检索学术论文", status: "pending" },
  { label: "对比技术方案", status: "pending" },
  { label: "生成综合摘要", status: "pending" },
]

const COMPLETED_STEPS: DeepSearchStep[] = [
  { label: "分析查询意图", status: "done", result: "用户想了解 RAG 技术在知识库中的最佳实践和实现方案。" },
  { label: "搜索相关文档", status: "done", result: "找到 12 篇相关文档，包括 Anthropic、LangChain 和 LlamaIndex 的技术指南。" },
  { label: "检索学术论文", status: "done", result: "检索到 5 篇顶会论文，涵盖 Dense Retrieval、Hybrid Search 和 Reranking 方案。" },
  { label: "对比技术方案", status: "done", result: "从延迟、准确率、成本三个维度对比了 4 种主流方案。" },
  { label: "生成综合摘要", status: "done", result: "综合以上结果，推荐使用混合检索 + Rerank 的方案，可将召回率提升 18%。" },
]

const ERROR_STEPS: DeepSearchStep[] = [
  { label: "分析查询意图", status: "done", result: "用户询问实时股票行情数据。" },
  { label: "搜索实时数据源", status: "error", result: "无法连接到外部数据源，请检查网络设置。" },
  { label: "备用数据获取", status: "pending" },
]

const deepSearchProps: PropDef[] = [
  { name: "query", type: "string", default: '""', description: "搜索查询文本" },
  { name: "steps", type: "DeepSearchStep[]", default: "[]", description: "搜索步骤列表" },
  { name: "isSearching", type: "boolean", default: "false", description: "是否正在搜索" },
]

export function DeepSearchDemo() {
  const [steps, setSteps] = useState(INITIAL_STEPS)
  const [isSearching, setIsSearching] = useState(true)

  const simulate = useCallback(() => {
    setSteps(INITIAL_STEPS)
    setIsSearching(true)
    const delays = [800, 1600, 2400, 3200]
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setSteps(prev => prev.map((s, j) =>
          j === i + 1 ? { ...COMPLETED_STEPS[j] } :
          j === i + 2 ? { ...s, status: "searching" as const } : s
        ))
        if (i === delays.length - 1) {
          setTimeout(() => {
            setSteps(COMPLETED_STEPS)
            setIsSearching(false)
          }, 800)
        }
      }, delay)
    })
  }, [])

  return (
    <>
      <Section title="Deep Search" props={deepSearchProps} code={`import { DeepSearch } from "@cherry-studio/ui"

<DeepSearch
  query="RAG 技术最佳实践"
  steps={steps}
  isSearching={true}
/>`}>
        <div className="space-y-3 max-w-lg">
          <DeepSearch
            query="RAG 技术在知识库场景中的最佳实践和实现方案是什么？"
            steps={steps}
            isSearching={isSearching}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="xs" className="gap-1" onClick={simulate}>
              <Play size={10} /> 模拟搜索
            </Button>
            <Button variant="outline" size="xs" className="gap-1" onClick={() => { setSteps(INITIAL_STEPS); setIsSearching(true) }}>
              <RotateCcw size={10} /> 重置
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Completed State">
        <DeepSearch
          query="向量数据库选型对比"
          steps={COMPLETED_STEPS}
          isSearching={false}
          className="max-w-lg"
        />
      </Section>

      <Section title="Error State">
        <DeepSearch
          query="获取实时股票行情"
          steps={ERROR_STEPS}
          isSearching={false}
          className="max-w-lg"
        />
      </Section>
    </>
  )
}
