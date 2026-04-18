import React, { useState, useCallback } from "react"
import { KBManager, Slider, ConfigSection, FormRow } from "@cherry-studio/ui"
import type { KnowledgeBase, KBDocument, KBTestResult } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"

const INITIAL_KBS: KnowledgeBase[] = [
  { id: "kb1", name: "AI 技术文档", icon: "🤖", status: "ready", docCount: 10, updatedAt: "2 小时前", color: "#8B5CF6", group: "工作" },
  { id: "kb2", name: "产品设计规范", icon: "🎨", status: "ready", docCount: 6, updatedAt: "1 天前", color: "#3B82F6", group: "工作" },
  { id: "kb3", name: "API 接口文档", icon: "📡", status: "indexing", docCount: 23, updatedAt: "刚刚", color: "#10B981", group: "工作" },
  { id: "kb4", name: "阅读笔记", icon: "📚", status: "ready", docCount: 15, updatedAt: "3 天前", color: "#F59E0B", group: "个人" },
]

const INITIAL_DOCS: Record<string, KBDocument[]> = {
  kb1: [
    { id: "d1", name: "RAG 技术指南.pdf", type: "pdf", size: "2.4 MB", chunks: 48, status: "ready", updatedAt: "2h ago" },
    { id: "d2", name: "向量数据库原理.md", type: "md", size: "156 KB", chunks: 12, status: "ready", updatedAt: "1d ago" },
    { id: "d3", name: "Embedding 模型对比.docx", type: "docx", size: "890 KB", chunks: 24, status: "ready", updatedAt: "3d ago" },
    { id: "d4", name: "LangChain 最佳实践.txt", type: "txt", size: "45 KB", chunks: 8, status: "indexing", updatedAt: "just now" },
    { id: "d5", name: "https://docs.example.com/rag", type: "url", size: "—", chunks: 15, status: "ready", updatedAt: "1w ago" },
  ],
  kb2: [
    { id: "d6", name: "设计系统规范 v2.pdf", type: "pdf", size: "12 MB", chunks: 96, status: "ready", updatedAt: "1d ago" },
    { id: "d7", name: "组件使用指南.md", type: "md", size: "340 KB", chunks: 28, status: "ready", updatedAt: "2d ago" },
  ],
}

const MOCK_RESULTS: KBTestResult[] = [
  { content: "RAG (Retrieval-Augmented Generation) 是一种通过检索外部知识来增强大语言模型生成能力的技术...", score: 0.92, source: "RAG 技术指南.pdf" },
  { content: "向量数据库是 RAG 系统的核心组件，负责存储和检索文档的向量表示...", score: 0.85, source: "向量数据库原理.md" },
  { content: "Embedding 模型将文本转换为高维向量表示，是 RAG 系统中语义搜索的基础...", score: 0.78, source: "Embedding 模型对比.docx" },
]

const kbProps: PropDef[] = [
  { name: "knowledgeBases", type: "KnowledgeBase[]", description: "知识库列表" },
  { name: "selectedKBId", type: "string", default: "undefined", description: "当前选中的知识库 ID" },
  { name: "documents", type: "KBDocument[]", description: "当前知识库的文档列表" },
  { name: "onCreateKB", type: "() => void", default: "undefined", description: "新建知识库回调" },
  { name: "onAddDocument", type: "() => void", default: "undefined", description: "添加文档回调" },
  { name: "ragSettings", type: "ReactNode", default: "undefined", description: "RAG 配置插槽" },
]

export function KBManagerDemo() {
  const [kbs, setKbs] = useState(INITIAL_KBS)
  const [docs, setDocs] = useState(INITIAL_DOCS)
  const [selectedId, setSelectedId] = useState("kb1")
  const [search, setSearch] = useState("")
  const [testQuery, setTestQuery] = useState("")
  const [testResults, setTestResults] = useState<KBTestResult[]>([])
  const [testLoading, setTestLoading] = useState(false)
  const [chunkSize, setChunkSize] = useState(512)
  const [overlap, setOverlap] = useState(64)
  const [topK, setTopK] = useState(5)

  const currentDocs = docs[selectedId] || []

  const handleCreateKB = useCallback(() => {
    const id = `kb${Date.now()}`
    setKbs(prev => [...prev, { id, name: "新知识库", icon: "📁", status: "ready" as const, docCount: 0, updatedAt: "刚刚", group: "个人" }])
    setSelectedId(id)
    setDocs(prev => ({ ...prev, [id]: [] }))
  }, [])

  const handleAddDoc = useCallback(() => {
    const id = `d${Date.now()}`
    setDocs(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), { id, name: "新文档.md", type: "md" as const, size: "0 KB", chunks: 0, status: "indexing" as const, updatedAt: "刚刚" }],
    }))
    setKbs(prev => prev.map(kb => kb.id === selectedId ? { ...kb, docCount: kb.docCount + 1 } : kb))
  }, [selectedId])

  const handleDeleteDoc = useCallback((docId: string) => {
    setDocs(prev => ({ ...prev, [selectedId]: (prev[selectedId] || []).filter(d => d.id !== docId) }))
    setKbs(prev => prev.map(kb => kb.id === selectedId ? { ...kb, docCount: Math.max(0, kb.docCount - 1) } : kb))
  }, [selectedId])

  const handleReindex = useCallback((docId: string) => {
    setDocs(prev => ({
      ...prev,
      [selectedId]: (prev[selectedId] || []).map(d => d.id === docId ? { ...d, status: "indexing" as const } : d),
    }))
    setTimeout(() => {
      setDocs(prev => ({
        ...prev,
        [selectedId]: (prev[selectedId] || []).map(d => d.id === docId ? { ...d, status: "ready" as const } : d),
      }))
    }, 2000)
  }, [selectedId])

  const handleTest = useCallback(() => {
    setTestLoading(true)
    setTimeout(() => {
      setTestResults(MOCK_RESULTS)
      setTestLoading(false)
    }, 1000)
  }, [])

  return (
    <Section title="KB Manager" props={kbProps} code={`import { KBManager } from "@cherry-studio/ui"

<KBManager
  knowledgeBases={kbs}
  selectedKBId={selectedId}
  onSelectKB={setSelectedId}
  documents={docs}
  onAddDocument={handleAddDoc}
  ragSettings={<RAGSettingsForm />}
/>`}>
      <KBManager
        knowledgeBases={kbs}
        selectedKBId={selectedId}
        onSelectKB={setSelectedId}
        onCreateKB={handleCreateKB}
        documents={currentDocs}
        onAddDocument={handleAddDoc}
        onDeleteDocument={handleDeleteDoc}
        onReindexDocument={handleReindex}
        searchQuery={search}
        onSearchChange={setSearch}
        testQuery={testQuery}
        onTestQueryChange={setTestQuery}
        onTestRetrieval={handleTest}
        testResults={testResults}
        isTestLoading={testLoading}
        className="h-[520px]"
        ragSettings={
          <div className="space-y-4">
            <ConfigSection title="分块设置">
              <FormRow label="分块大小" desc={`${chunkSize} tokens`}>
                <Slider value={[chunkSize]} onValueChange={v => setChunkSize(v[0])} min={128} max={2048} step={128} className="w-36" />
              </FormRow>
              <FormRow label="重叠长度" desc={`${overlap} tokens`}>
                <Slider value={[overlap]} onValueChange={v => setOverlap(v[0])} min={0} max={256} step={32} className="w-36" />
              </FormRow>
            </ConfigSection>
            <ConfigSection title="检索设置">
              <FormRow label="Top K" desc={`返回 ${topK} 条结果`}>
                <Slider value={[topK]} onValueChange={v => setTopK(v[0])} min={1} max={20} step={1} className="w-36" />
              </FormRow>
            </ConfigSection>
          </div>
        }
      />
    </Section>
  )
}
