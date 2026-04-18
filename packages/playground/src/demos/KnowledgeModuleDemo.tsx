import React, { useState, useCallback, useEffect, useRef } from "react"
import { Button, Badge, Input, Slider, Separator, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger } from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  BookOpen, Database, Settings2, Zap, FileText, Search, Plus,
  ChevronRight, MoreHorizontal, Trash2, RefreshCw, Check,
  Clock, Upload, AlertCircle, StickyNote, Folder, Link2, Globe,
  Layers, Cpu, Info, RotateCcw, Loader2, Sparkles, Copy,
  ChevronDown, ChevronUp, X,
} from "lucide-react"

/* ═══════════════════════════════════════════
   Types (matching original)
   ═══════════════════════════════════════════ */

interface KnowledgeBase {
  id: string
  name: string
  icon: string
  color: string
  docCount: number
  status: "ready" | "indexing" | "error"
  group: string
  updatedAt: string
}

interface DataSource {
  id: string
  name: string
  type: "file" | "note" | "folder" | "url" | "website"
  format?: string
  size?: string
  status: "preprocessing" | "chunking" | "embedding" | "success" | "error"
  errorMsg?: string
  updatedAt: string
  chunks?: number
  url?: string
}

interface ChunkResult {
  id: string
  content: string
  source: string
  score: number
  chunkIndex: number
}

/* ═══════════════════════════════════════════
   Mock data (reduced but matching field names)
   ═══════════════════════════════════════════ */

const initialKbs: KnowledgeBase[] = [
  { id: "kb1", name: "AI 技术文档", icon: "🤖", color: "#8b5cf6", docCount: 10, status: "ready", group: "工作", updatedAt: "2 小时前" },
  { id: "kb2", name: "产品设计规范", icon: "🎨", color: "#a78bfa", docCount: 5, status: "ready", group: "工作", updatedAt: "昨天" },
  { id: "kb3", name: "API 接口文档", icon: "📡", color: "#3b82f6", docCount: 6, status: "indexing", group: "工作", updatedAt: "30 分钟前" },
  { id: "kb4", name: "阅读笔记", icon: "📚", color: "#06b6d4", docCount: 7, status: "ready", group: "个人", updatedAt: "1 天前" },
  { id: "kb5", name: "Cherry Studio V2", icon: "🍒", color: "#6d28d9", docCount: 8, status: "indexing", group: "项目", updatedAt: "1 小时前" },
]

const initialSources: Record<string, DataSource[]> = {
  kb1: [
    { id: "d1", name: "RAG 技术指南", type: "file", format: "pdf", size: "2.4 MB", status: "success", updatedAt: "2 小时前", chunks: 48 },
    { id: "d2", name: "向量数据库原理", type: "file", format: "md", size: "156 KB", status: "success", updatedAt: "3 小时前", chunks: 12 },
    { id: "d3", name: "检索策略对比分析", type: "file", format: "docx", size: "890 KB", status: "success", updatedAt: "昨天", chunks: 24 },
    { id: "d4", name: "LLM 部署手册", type: "file", format: "pdf", size: "5.1 MB", status: "chunking", updatedAt: "30 分钟前", chunks: 0 },
    { id: "d5", name: "知识库最佳实践", type: "note", size: "45 KB", status: "success", updatedAt: "1 天前", chunks: 8 },
    { id: "d6", name: "https://docs.anthropic.com", type: "url", status: "success", updatedAt: "3 天前", chunks: 34, url: "https://docs.anthropic.com" },
    { id: "d7", name: "多模态 AI 综述", type: "file", format: "pdf", size: "3.8 MB", status: "error", errorMsg: "PDF 解析失败：文件已加密", updatedAt: "1 天前", chunks: 0 },
  ],
  kb2: [
    { id: "d20", name: "设计系统规范 v3", type: "file", format: "pdf", size: "8.2 MB", status: "success", updatedAt: "昨天", chunks: 92 },
    { id: "d21", name: "UI 组件文档", type: "url", status: "success", updatedAt: "2 天前", chunks: 45, url: "https://design.example.com" },
    { id: "d22", name: "品牌指南", type: "file", format: "pdf", size: "4.5 MB", status: "success", updatedAt: "1 周前", chunks: 38 },
  ],
  kb3: [
    { id: "d30", name: "REST API 规范", type: "file", format: "md", size: "245 KB", status: "success", updatedAt: "1 小时前", chunks: 18 },
    { id: "d31", name: "GraphQL Schema", type: "file", format: "json", size: "120 KB", status: "success", updatedAt: "2 小时前", chunks: 8 },
    { id: "d32", name: "Swagger 文档", type: "url", status: "preprocessing", updatedAt: "30 分钟前", chunks: 0, url: "https://api.example.com/docs" },
  ],
  kb4: [
    { id: "d50", name: "深度学习花书笔记", type: "note", size: "128 KB", status: "success", updatedAt: "1 天前", chunks: 22 },
    { id: "d51", name: "Transformer 论文精读", type: "note", size: "85 KB", status: "success", updatedAt: "2 天前", chunks: 14 },
  ],
  kb5: [
    { id: "d80", name: "产品需求文档 PRD", type: "file", format: "docx", size: "2.8 MB", status: "success", updatedAt: "1 小时前", chunks: 32 },
    { id: "d81", name: "技术方案设计", type: "file", format: "md", size: "180 KB", status: "success", updatedAt: "3 小时前", chunks: 16 },
    { id: "d82", name: "架构设计文档", type: "file", format: "pdf", size: "5.6 MB", status: "chunking", updatedAt: "30 分钟前", chunks: 0 },
  ],
}

const mockRetrievalResults: ChunkResult[] = [
  { id: "r1", content: "RAG（检索增强生成）是一种将信息检索与生成式 AI 模型相结合的技术。它通过从外部知识库中检索相关文档，将检索到的内容作为上下文传递给大语言模型。", source: "RAG 技术指南.pdf", score: 0.95, chunkIndex: 3 },
  { id: "r2", content: "向量检索的核心原理是将文本通过 Embedding 模型转换为高维向量，然后计算查询向量与文档向量之间的相似性，返回最相关的文档片段。", source: "向量数据库原理.md", score: 0.89, chunkIndex: 7 },
  { id: "r3", content: "混合检索策略结合了语义检索和关键词检索（BM25）的优势。两者结合可以显著提升检索召回率和准确率。", source: "检索策略对比分析.docx", score: 0.84, chunkIndex: 12 },
  { id: "r4", content: "Rerank 模型在初步检索完成后对结果进行精排，能够更精确地评估查询与文档片段之间的相关性。", source: "RAG 技术指南.pdf", score: 0.78, chunkIndex: 15 },
]

const embeddingModels = [
  { id: "oai-3-s", name: "text-embedding-3-small", provider: "OpenAI", dim: 1536 },
  { id: "oai-3-l", name: "text-embedding-3-large", provider: "OpenAI", dim: 3072 },
  { id: "bge-m3", name: "bge-m3", provider: "HuggingFace", dim: 1024 },
  { id: "ollama-nomic", name: "nomic-embed-text", provider: "Ollama", dim: 768 },
  { id: "jina-v3", name: "jina-embeddings-v3", provider: "Jina", dim: 1024 },
]

const rerankModels = [
  { id: "none", name: "不使用" },
  { id: "bge-reranker", name: "bge-reranker-v2-m3" },
  { id: "cohere-v3", name: "rerank-v3.5" },
  { id: "jina-reranker", name: "jina-reranker-v2" },
]

const separatorOptions = [
  { id: "auto", name: "自动 (推荐)" },
  { id: "newline", name: "换行符 \\n" },
  { id: "recursive", name: "递归字符分割" },
  { id: "markdown", name: "Markdown 标题" },
]

const docProcessors = [
  { id: "unstructured", name: "Unstructured.io" },
  { id: "llamaparse", name: "LlamaParse" },
  { id: "docling", name: "Docling (IBM)" },
]

const defaultGroupIcons: Record<string, React.ElementType> = { "工作": Database, "个人": BookOpen, "项目": Folder }

const detailTabs = [
  { id: "sources" as const, label: "数据源", icon: Database },
  { id: "settings" as const, label: "RAG 配置", icon: Settings2 },
  { id: "test" as const, label: "召回测试", icon: Zap },
]
type DetailTab = (typeof detailTabs)[number]["id"]

/* ═══════════════════════════════════════════
   Sub-components (matching original structure)
   ═══════════════════════════════════════════ */

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  file: { icon: FileText, color: "text-accent-blue/70" },
  note: { icon: StickyNote, color: "text-accent-amber/70" },
  folder: { icon: Folder, color: "text-accent-violet/70" },
  url: { icon: Link2, color: "text-accent-cyan/70" },
  website: { icon: Globe, color: "text-accent-emerald/70" },
}

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  preprocessing: { label: "预处理", color: "text-accent-blue/70", step: 1 },
  chunking: { label: "分块中", color: "text-accent-violet/70", step: 2 },
  embedding: { label: "嵌入中", color: "text-accent-amber/70", step: 3 },
  success: { label: "就绪", color: "text-primary", step: 4 },
  error: { label: "错误", color: "text-error/60", step: 0 },
}

function StatusBadge({ status, errorMsg }: { status: DataSource["status"]; errorMsg?: string }) {
  const cfg = statusConfig[status]
  const isProcessing = status === "preprocessing" || status === "chunking" || status === "embedding"

  if (isProcessing) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`w-1.5 h-1.5 rounded-full transition-colors ${step < cfg.step ? "bg-primary" : step === cfg.step ? "bg-accent-amber animate-pulse" : "bg-border/40"}`} />
          ))}
        </div>
        <span className={`inline-flex items-center gap-0.5 text-xs ${cfg.color}`}>
          <Loader2 size={7} className="animate-spin" />
          <span>{cfg.label}</span>
        </span>
      </div>
    )
  }
  if (status === "error") {
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs ${cfg.color}`} title={errorMsg}>
        <AlertCircle size={8} /> {cfg.label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-primary">
      <Check size={8} /> 就绪
    </span>
  )
}

/* ─── KnowledgeSidebar ─── */

function KnowledgeSidebar({ items, selectedId, onSelect }: {
  items: KnowledgeBase[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [search, setSearch] = useState("")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const filtered = items.filter((kb) => kb.name.toLowerCase().includes(search.toLowerCase()))
  const groups = Array.from(new Set(items.map((kb) => kb.group)))
  const grouped = groups.map((g) => ({ group: g, items: filtered.filter((kb) => kb.group === g) }))

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <BookOpen size={12} className="text-muted-foreground" strokeWidth={1.6} />
          <span className="text-foreground">知识库</span>
          <span className="text-muted-foreground/50 ml-0.5">{items.length}</span>
        </div>
        <Button variant="ghost" type="button" onClick={() => onSelect(`kb${Date.now()}`)} className="h-auto px-0 py-0 font-normal tracking-normal w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Plus size={12} strokeWidth={1.8} />
        </Button>
      </div>

      {/* Search */}
      <div className="px-2 pb-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-[4px] rounded-[12px] bg-muted/50 border border-transparent focus-within:border-border/50 transition-colors">
          <Search size={10} className="text-muted-foreground/50 flex-shrink-0" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索知识库..." className="h-auto flex-1 border-0 bg-transparent p-0 text-xs text-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0" />
          {search && <Button variant="ghost" type="button" onClick={() => setSearch("")} className="h-auto px-0 py-0 font-normal tracking-normal text-muted-foreground/30 hover:text-foreground"><X size={9} /></Button>}
        </div>
      </div>

      {/* Grouped list */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full px-1.5 space-y-px">
        {grouped.map(({ group, items: gItems }) => {
          const isCollapsed = collapsed.has(group)
          const GIcon = defaultGroupIcons[group] || Database
          return (
            <div key={group}>
              <Button variant="ghost" type="button" onClick={() => setCollapsed((prev) => { const n = new Set(prev); n.has(group) ? n.delete(group) : n.add(group); return n })} className="h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center gap-1.5 px-1.5 py-[4px] text-[10px] text-foreground/45 hover:text-foreground/60 transition-colors">
                <ChevronRight size={10} className={`transition-transform duration-150 flex-shrink-0 ${isCollapsed ? "" : "rotate-90"}`} />
                <GIcon size={11} strokeWidth={1.5} className="flex-shrink-0" />
                <span className="uppercase tracking-widest truncate text-[10px]">{group}</span>
                <span className="ml-auto text-[10px] text-muted-foreground/40 flex-shrink-0">{gItems.length}</span>
              </Button>
              {!isCollapsed && (
                <div className="space-y-px ml-0.5">
                  {gItems.map((kb) => {
                    const isSelected = kb.id === selectedId
                    return (
                      <div key={kb.id} onClick={() => onSelect(kb.id)} className={`w-full flex items-center gap-2 px-1.5 py-[5px] rounded-[12px] text-left transition-all duration-150 group/kb cursor-pointer ${isSelected ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}>
                        <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0" style={{ background: `${kb.color}20` }}>
                          {kb.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate">{kb.name}</div>
                          <div className="flex items-center gap-1 mt-px">
                            <span className="text-xs text-muted-foreground/45">{kb.docCount} 文档</span>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${kb.status === "ready" ? "bg-primary" : kb.status === "indexing" ? "bg-accent-amber animate-pulse" : "bg-error"}`} />
                          </div>
                        </div>
                        <Button variant="ghost" type="button" onClick={(e) => { e.stopPropagation(); alert(`Options for: ${kb.name}`) }} className="h-auto px-0 py-0 font-normal tracking-normal w-4 h-4 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground opacity-0 group-hover/kb:opacity-100 transition-all flex-shrink-0">
                          <MoreHorizontal size={9} />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom new button */}
      <div className="px-2 py-1.5 flex-shrink-0 border-t border-border/30">
        <Button variant="ghost" type="button" onClick={() => onSelect(`kb${Date.now()}`)} className="h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center justify-center gap-1 py-[5px] rounded-[12px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors border border-dashed border-border/40 hover:border-border/70">
          <Plus size={11} strokeWidth={1.8} /> 新建知识库
        </Button>
      </div>
    </div>
  )
}

/* ─── DataSourceList ─── */

function DataSourceListPanel({ sources, onDelete, onReindex }: {
  sources: DataSource[]
  onDelete: (id: string) => void
  onReindex: (id: string) => void
}) {
  const [filter, setFilter] = useState("全部")
  const filters = ["全部", "文件", "笔记", "网址"]
  const typeMap: Record<string, string> = { "文件": "file", "笔记": "note", "网址": "url" }
  const filtered = filter === "全部" ? sources : sources.filter((s) => s.type === typeMap[filter])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <Button variant="ghost" type="button" key={f} onClick={() => setFilter(f)} className={`h-auto px-0 py-0 font-normal tracking-normal h-5 px-2 rounded text-[10px] transition-colors ${filter === f ? "bg-accent text-foreground" : "text-muted-foreground/50 hover:text-foreground"}`}>
              {f}
            </Button>
          ))}
        </div>
        <Button variant="ghost" type="button" onClick={() => alert("Add source dialog")} className="h-auto px-0 py-0 font-normal tracking-normal h-6 px-2.5 rounded-[12px] text-[10px] text-foreground bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-1">
          <Upload size={9} /> 添加
        </Button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-px [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
            <Database size={20} strokeWidth={1.2} className="mb-1.5" />
            <p className="text-xs">暂无数据源</p>
          </div>
        )}
        {filtered.map((src) => {
          const cfg = typeConfig[src.type] || typeConfig.file
          const TIcon = cfg.icon
          return (
            <div key={src.id} className="flex items-center gap-2 px-2.5 py-[6px] rounded-[12px] hover:bg-accent/30 transition-colors group/row">
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-accent/50 ${cfg.color}`}>
                <TIcon size={10} strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground truncate">{src.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/35">
                  {src.format && <span className="uppercase">{src.format}</span>}
                  {src.size && <span>{src.size}</span>}
                  {src.url && <span className="truncate max-w-[120px]">{src.url}</span>}
                  {src.chunks !== undefined && src.chunks > 0 && <span>{src.chunks} chunks</span>}
                </div>
              </div>
              <StatusBadge status={src.status} errorMsg={src.errorMsg} />
              <span className="text-xs text-muted-foreground/50 flex-shrink-0 w-14 text-right">{src.updatedAt}</span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-all flex-shrink-0">
                {src.status === "error" && (
                  <Button variant="ghost" type="button" onClick={() => onReindex(src.id)} className="h-auto px-0 py-0 font-normal tracking-normal w-4 h-4 rounded flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-accent">
                    <RefreshCw size={8} />
                  </Button>
                )}
                <Button variant="ghost" type="button" onClick={() => onDelete(src.id)} className="h-auto px-0 py-0 font-normal tracking-normal w-4 h-4 rounded flex items-center justify-center text-muted-foreground/30 hover:text-error hover:bg-error/10">
                  <Trash2 size={8} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── RAGSettings ─── */

function RAGSettingsPanel() {
  const [embModel, setEmbModel] = useState("oai-3-s")
  const [chunkSize, setChunkSize] = useState("512")
  const [chunkOverlap, setChunkOverlap] = useState("50")
  const [separator, setSeparator] = useState("auto")
  const [topK, setTopK] = useState(10)
  const [scoreThreshold, setScoreThreshold] = useState(0.6)
  const [rerankModel, setRerankModel] = useState("none")
  const [docProcessor, setDocProcessor] = useState("unstructured")

  return (
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="max-w-[480px] mx-auto px-5 py-4 space-y-5">
        {/* 文档预处理 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Cpu size={13} strokeWidth={1.8} className="text-cherry-primary/70" /> 文档预处理
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-foreground/75">处理服务商</span></div>
            <Select value={docProcessor} onValueChange={setDocProcessor}>
              <SelectTrigger className="w-full h-auto px-2.5 py-[6px] rounded-[12px] border border-border/40 bg-transparent text-xs text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {docProcessors.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-border/15" />

        {/* 分块规则 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Layers size={13} strokeWidth={1.8} className="text-cherry-primary/70" /> 分块规则 (Chunking)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center gap-1 mb-1"><span className="text-xs text-foreground/75">分段大小</span><Info size={9} className="text-muted-foreground/40" /></div>
              <div className="relative">
                <Input value={chunkSize} onChange={(e) => setChunkSize(e.target.value)} className="w-full rounded-[12px] border border-border/40 bg-transparent px-2.5 py-[6px] text-xs text-foreground focus-visible:ring-0" />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">tokens</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1"><span className="text-xs text-foreground/75">重叠大小</span><Info size={9} className="text-muted-foreground/40" /></div>
              <div className="relative">
                <Input value={chunkOverlap} onChange={(e) => setChunkOverlap(e.target.value)} className="w-full rounded-[12px] border border-border/40 bg-transparent px-2.5 py-[6px] text-xs text-foreground focus-visible:ring-0" />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">tokens</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-foreground/75">分隔符规则</span></div>
            <Select value={separator} onValueChange={setSeparator}>
              <SelectTrigger className="w-full h-auto px-2.5 py-[6px] rounded-[12px] border border-border/40 bg-transparent text-xs text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {separatorOptions.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-border/15" />

        {/* Embedding 模型 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Cpu size={13} strokeWidth={1.8} className="text-cherry-primary/70" /> Embedding 模型
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-foreground/75">模型选择</span></div>
            <Select value={embModel} onValueChange={setEmbModel}>
              <SelectTrigger className="w-full h-auto px-2.5 py-[6px] rounded-[12px] border border-border/40 bg-transparent text-xs text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {embeddingModels.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} ({m.provider}, {m.dim}d)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-border/15" />

        {/* 检索设置 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Search size={13} strokeWidth={1.8} className="text-cherry-primary/70" /> 检索设置
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-foreground/75">请求文档片段数 (Top K)</span>
              <span className="text-xs text-foreground tabular-nums">{topK}</span>
            </div>
            <Slider min={1} max={50} step={1} value={[topK]} onValueChange={([v]) => setTopK(v)} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground/50 mt-px"><span>1</span><span>50</span></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-foreground/75">匹配度阈值</span>
              <span className="text-xs text-foreground tabular-nums">{scoreThreshold.toFixed(2)}</span>
            </div>
            <Slider min={0} max={1} step={0.01} value={[scoreThreshold]} onValueChange={([v]) => setScoreThreshold(v)} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground/50 mt-px"><span>0.00</span><span>1.00</span></div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-foreground/75">重排模型 (Rerank)</span></div>
            <Select value={rerankModel} onValueChange={setRerankModel}>
              <SelectTrigger className="w-full h-auto px-2.5 py-[6px] rounded-[12px] border border-border/40 bg-transparent text-xs text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rerankModels.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/30">
          <Button variant="ghost" type="button" onClick={() => alert("Settings restored to defaults")} className="h-auto px-0 py-0 font-normal tracking-normal h-6 px-2.5 rounded-[12px] text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1">
            <RotateCcw size={9} /> 恢复默认
          </Button>
          <Button variant="ghost" type="button" onClick={() => alert("Settings saved")} className="h-auto px-0 py-0 font-normal tracking-normal h-6 px-3 rounded-[12px] text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            保存
          </Button>
        </div>
        <div className="h-2" />
      </div>
    </div>
  )
}

/* ─── RetrievalTester ─── */

function RetrievalTesterPanel() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ChunkResult[]>([])
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    setLoading(true)
    setResults([])
    setElapsed(null)
    const start = Date.now()
    setTimeout(() => {
      setResults(mockRetrievalResults)
      setElapsed(Date.now() - start)
      setLoading(false)
    }, 600 + Math.random() * 400)
  }, [query])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-[5px] rounded-[12px] border border-border/40 bg-muted/20 focus-within:border-ring/40 focus-within:ring-1 focus-within:ring-ring/15 transition-all">
            <Search size={11} className="text-muted-foreground/35 flex-shrink-0" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="输入测试 Query..." className="h-auto flex-1 border-0 bg-transparent p-0 text-xs text-foreground shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0" />
          </div>
          <Button variant="ghost" type="button" onClick={handleSearch} disabled={loading || !query.trim()} className={`h-auto px-0 py-0 font-normal tracking-normal h-7 px-3 rounded-[12px] text-xs flex items-center gap-1 transition-all flex-shrink-0 ${loading ? "bg-primary/60 text-primary-foreground/60 cursor-wait" : "bg-primary text-primary-foreground hover:bg-primary/90"} disabled:opacity-40`}>
            {loading ? <div className="w-2.5 h-2.5 border-[1.5px] border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Zap size={10} />}
            <span>检索</span>
          </Button>
        </div>
        {elapsed !== null && results.length > 0 && (
          <div className="flex items-center gap-2.5 mt-1.5 text-xs text-muted-foreground/35">
            <span className="flex items-center gap-0.5"><Sparkles size={8} /> {results.length} 个结果</span>
            <span className="flex items-center gap-0.5"><Clock size={8} /> {elapsed}ms</span>
            <span>最高: {(results[0]?.score * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 py-12">
            <Search size={22} strokeWidth={1.2} className="mb-1.5" />
            <p className="text-xs">输入查询语句开始检索测试</p>
            <p className="text-xs mt-0.5">结果将展示匹配的文档片段和分数</p>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
            <p className="text-xs text-muted-foreground/35">正在检索...</p>
          </div>
        )}
        {results.map((chunk, idx) => {
          const isExpanded = expandedId === chunk.id
          const isCopied = copiedId === chunk.id
          const pct = Math.round(chunk.score * 100)
          return (
            <div key={chunk.id} className="rounded-[12px] border border-border/20 hover:border-border/40 bg-muted/[0.03] transition-all group/chunk">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                <span className="w-4 h-4 rounded bg-accent/50 flex items-center justify-center text-xs text-muted-foreground/50 flex-shrink-0">{idx + 1}</span>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <FileText size={9} className="text-muted-foreground/35 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground/50 truncate">{chunk.source}</span>
                  <span className="text-xs text-muted-foreground/50 flex-shrink-0">#{chunk.chunkIndex}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1 rounded-full bg-border/25 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? "bg-accent-blue" : pct >= 75 ? "bg-accent-sky" : "bg-accent-amber"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground/50 tabular-nums w-6">{pct}%</span>
                </div>
                <Button variant="ghost" type="button" onClick={() => handleCopy(chunk.id, chunk.content)} className="h-auto px-0 py-0 font-normal tracking-normal w-4 h-4 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent opacity-0 group-hover/chunk:opacity-100 transition-all flex-shrink-0">
                  {isCopied ? <Check size={8} className="text-primary" /> : <Copy size={8} />}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setExpandedId(isExpanded ? null : chunk.id)} className="h-auto px-0 py-0 font-normal tracking-normal w-4 h-4 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-all flex-shrink-0">
                  {isExpanded ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                </Button>
              </div>
              <div className={`px-2.5 pb-2 ${isExpanded ? "" : "line-clamp-2"}`}>
                <p className="text-xs text-foreground/75 leading-relaxed">{chunk.content}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main Demo
   ═══════════════════════════════════════════ */

export function KnowledgeModuleDemo() {
  const [kbs, setKbs] = useState(initialKbs)
  const [sourcesMap, setSourcesMap] = useState(initialSources)
  const [selectedKbId, setSelectedKbId] = useState("kb1")
  const [activeTab, setActiveTab] = useState<DetailTab>("sources")

  const selectedKb = kbs.find((kb) => kb.id === selectedKbId)
  const sources = sourcesMap[selectedKbId] || []

  const handleDeleteSource = useCallback((id: string) => {
    setSourcesMap((prev) => ({ ...prev, [selectedKbId]: (prev[selectedKbId] || []).filter((s) => s.id !== id) }))
    setKbs((prev) => prev.map((kb) => kb.id === selectedKbId ? { ...kb, docCount: Math.max(0, kb.docCount - 1) } : kb))
  }, [selectedKbId])

  const handleReindexSource = useCallback((id: string) => {
    const kbId = selectedKbId
    setSourcesMap((prev) => ({ ...prev, [kbId]: (prev[kbId] || []).map((s) => s.id === id ? { ...s, status: "preprocessing" as const, errorMsg: undefined } : s) }))
    setTimeout(() => setSourcesMap((prev) => ({ ...prev, [kbId]: (prev[kbId] || []).map((s) => s.id === id ? { ...s, status: "chunking" as const } : s) })), 800)
    setTimeout(() => setSourcesMap((prev) => ({ ...prev, [kbId]: (prev[kbId] || []).map((s) => s.id === id ? { ...s, status: "embedding" as const } : s) })), 1600)
    setTimeout(() => setSourcesMap((prev) => ({ ...prev, [kbId]: (prev[kbId] || []).map((s) => s.id === id ? { ...s, status: "success" as const, chunks: Math.floor(Math.random() * 40 + 5) } : s) })), 2400)
  }, [selectedKbId])

  return (
    <Section title="Knowledge Base Module" props={[
      { name: "knowledgeBases", type: "KnowledgeBase[]", default: "[]", description: "List of available knowledge bases" },
      { name: "selectedKbId", type: "string", description: "Currently selected knowledge base ID" },
      { name: "activeTab", type: "'sources' | 'settings' | 'test'", default: "'sources'", description: "Active detail tab" },
    ]}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        <div className="flex h-[520px]">
          {/* ─── Left: Sidebar ─── */}
          <div className="w-[220px] flex-shrink-0 h-full bg-muted/[0.15] border-r border-border/20">
            <KnowledgeSidebar items={kbs} selectedId={selectedKbId} onSelect={setSelectedKbId} />
          </div>

          {/* ─── Right: Main Content ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedKb ? (
              <>
                {/* Header bar */}
                <div className="h-11 flex items-center justify-between px-3.5 flex-shrink-0 border-b border-border/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0" style={{ background: `${selectedKb.color}20` }}>
                      {selectedKb.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-foreground truncate">{selectedKb.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedKb.status === "ready" ? "bg-primary" : selectedKb.status === "indexing" ? "bg-accent-amber animate-pulse" : "bg-error"}`} />
                        <span className="text-xs text-muted-foreground/60">
                          {selectedKb.status === "ready" ? "就绪" : selectedKb.status === "indexing" ? "索引中" : "错误"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground/60 flex-shrink-0">
                    <span className="flex items-center gap-0.5"><FileText size={9} />{selectedKb.docCount} 文档</span>
                    <span className="flex items-center gap-0.5"><Clock size={9} />{selectedKb.updatedAt}</span>
                    <Button variant="ghost" type="button" onClick={() => alert("KB options: Rename, Export, Delete")} className="h-auto px-0 py-0 font-normal tracking-normal w-5 h-5 rounded flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors">
                      <MoreHorizontal size={11} />
                    </Button>
                  </div>
                </div>

                {/* Tab bar + content */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTab)} className="flex flex-col flex-1 min-h-0">
                  <TabsList className="bg-transparent h-auto p-0 px-2.5 gap-0 border-b border-border/30 rounded-none justify-start">
                    {detailTabs.map((tab) => {
                      const TIcon = tab.icon
                      return (
                        <TabsTrigger key={tab.id} value={tab.id} className="rounded-none border-0 border-b-[1.5px] border-b-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent after:hidden flex items-center gap-1 px-2.5 py-2 text-xs">
                          <TIcon size={10} strokeWidth={1.6} />
                          <span>{tab.label}</span>
                          {tab.id === "sources" && <span className="text-xs text-muted-foreground/60 ml-0.5">{sources.length}</span>}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                  <div className="flex-1 min-h-0 flex flex-col">
                    {activeTab === "sources" && <DataSourceListPanel sources={sources} onDelete={handleDeleteSource} onReindex={handleReindexSource} />}
                    {activeTab === "settings" && <RAGSettingsPanel />}
                    {activeTab === "test" && <RetrievalTesterPanel />}
                  </div>
                </Tabs>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50">
                <BookOpen size={24} strokeWidth={1.2} className="mb-2" />
                <p className="text-xs">选择一个知识库开始</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
