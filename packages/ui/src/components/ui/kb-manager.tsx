"use client"

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import { ScrollArea } from "./scroll-area"
import { Separator } from "./separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
import {
  Search, Plus, MoreHorizontal, ChevronDown, ChevronRight,
  FileText, Clock, Upload, RefreshCw, Trash2, X, Send,
} from "lucide-react"

/* ---------- Types ---------- */

export interface KnowledgeBase {
  id: string
  name: string
  icon?: string
  status: "ready" | "indexing" | "error"
  docCount: number
  updatedAt: string
  color?: string
  group?: string
}

export interface KBDocument {
  id: string
  name: string
  type: "pdf" | "md" | "docx" | "txt" | "url"
  size: string
  chunks?: number
  status: "ready" | "indexing" | "error"
  updatedAt: string
}

export interface KBTestResult {
  content: string
  score: number
  source: string
}

export interface KBManagerProps extends React.ComponentProps<"div"> {
  knowledgeBases: KnowledgeBase[]
  selectedKBId?: string
  onSelectKB?: (id: string) => void
  onCreateKB?: () => void
  onDeleteKB?: (id: string) => void
  onRenameKB?: (id: string, name: string) => void

  documents: KBDocument[]
  onAddDocument?: () => void
  onDeleteDocument?: (id: string) => void
  onReindexDocument?: (id: string) => void

  ragSettings?: React.ReactNode

  testQuery?: string
  onTestQueryChange?: (q: string) => void
  onTestRetrieval?: () => void
  testResults?: KBTestResult[]
  isTestLoading?: boolean

  searchQuery?: string
  onSearchChange?: (q: string) => void
}

/* ---------- Status helpers ---------- */

const STATUS_DOT: Record<string, string> = {
  ready: "bg-primary",
  indexing: "bg-accent-amber animate-pulse",
  error: "bg-destructive",
}

const STATUS_LABEL: Record<string, string> = {
  ready: "就绪",
  indexing: "索引中",
  error: "错误",
}

const TYPE_ICON: Record<string, string> = {
  pdf: "📄", md: "📝", docx: "📃", txt: "📋", url: "🔗",
}

/* ---------- Sidebar ---------- */

function KBSidebar({
  items, selectedId, onSelect, onSearch, searchQuery, onCreateKB,
}: {
  items: KnowledgeBase[]; selectedId?: string; onSelect?: (id: string) => void
  onSearch?: (q: string) => void; searchQuery?: string; onCreateKB?: () => void
}) {
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  const groups = React.useMemo(() => {
    const map: Record<string, KnowledgeBase[]> = {}
    items.forEach(kb => {
      const g = kb.group || "默认"
      ;(map[g] ??= []).push(kb)
    })
    return map
  }, [items])

  const toggleGroup = (g: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground">知识库</span>
          <span className="text-xs text-muted-foreground/50">{items.length}</span>
        </div>
        {onCreateKB && (
          <Button variant="ghost" size="icon-xs" onClick={onCreateKB} aria-label="New KB">
            <Plus size={12} />
          </Button>
        )}
      </div>

      {onSearch && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-[var(--radius-control)] border border-border/30">
            <Search size={10} className="text-muted-foreground/50 flex-shrink-0" />
            <Input
              value={searchQuery || ""}
              onChange={e => onSearch(e.target.value)}
              placeholder="搜索..."
              className="flex-1 h-auto border-0 bg-transparent shadow-none px-0 py-0 text-xs focus-visible:ring-0 min-w-0"
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-2 pb-2">
        {Object.entries(groups).map(([group, kbs]) => (
          <div key={group} className="mb-1">
            <Button
              variant="ghost"
              onClick={() => toggleGroup(group)}
              className="h-auto px-1.5 py-1 w-full justify-start gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground font-normal"
            >
              <ChevronDown size={10} className={cn("transition-transform", collapsed.has(group) && "-rotate-90")} />
              <span className="flex-1 text-left">{group}</span>
              <span className="text-xs text-muted-foreground/50 tabular-nums">{kbs.length}</span>
            </Button>
            {!collapsed.has(group) && kbs.map(kb => {
              const isSelected = selectedId === kb.id
              return (
                <div
                  key={kb.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect?.(kb.id)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(kb.id) } }}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-button)] cursor-pointer transition-all text-left group/kb",
                    isSelected ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <span className="text-xs flex-shrink-0">{kb.icon || "📚"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs truncate block">{kb.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-muted-foreground/50">{kb.docCount} 文档</span>
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", STATUS_DOT[kb.status])} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </ScrollArea>

      {onCreateKB && (
        <div className="px-2 py-1.5 flex-shrink-0 border-t border-border/30">
          <Button variant="ghost" onClick={onCreateKB} className="h-auto w-full py-1 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/40 hover:border-border/70 gap-1 font-normal">
            <Plus size={11} /> 新建知识库
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---------- Document List ---------- */

function DocumentList({
  documents, onAdd, onDelete, onReindex,
}: {
  documents: KBDocument[]; onAdd?: () => void; onDelete?: (id: string) => void; onReindex?: (id: string) => void
}) {
  const [filter, setFilter] = React.useState("全部")
  const filters = ["全部", "文件", "笔记", "网址"]
  const typeMap: Record<string, string> = { "文件": "pdf,md,docx,txt", "网址": "url" }

  const filtered = filter === "全部"
    ? documents
    : documents.filter(d => (typeMap[filter] || "").includes(d.type))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          {filters.map(f => (
            <Button
              key={f}
              variant="ghost"
              size="xs"
              onClick={() => setFilter(f)}
              className={cn("px-2 py-0.5 text-xs font-normal", filter === f ? "bg-accent text-foreground" : "text-muted-foreground/50 hover:text-foreground")}
            >
              {f}
            </Button>
          ))}
        </div>
        {onAdd && (
          <Button variant="ghost" size="xs" onClick={onAdd} className="gap-1 text-xs text-primary bg-primary/10 hover:bg-primary/20 font-normal">
            <Upload size={10} /> 添加
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-0.5 pb-4">
          {filtered.map(doc => (
            <div key={doc.id} className="flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-button)] hover:bg-accent/30 transition-colors group/doc">
              <span className="text-sm flex-shrink-0">{TYPE_ICON[doc.type] || "📄"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-foreground truncate">{doc.name}</span>
                  <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0">{doc.type.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground/50">
                  <span>{doc.size}</span>
                  {doc.chunks != null && <><span>·</span><span>{doc.chunks} chunks</span></>}
                  <span>·</span>
                  <span className={cn("flex items-center gap-0.5", doc.status === "error" && "text-destructive/60")}>
                    <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[doc.status])} />
                    {STATUS_LABEL[doc.status]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover/doc:opacity-100 transition-opacity flex-shrink-0">
                {onReindex && (
                  <Button variant="ghost" size="icon-xs" onClick={() => onReindex(doc.id)} aria-label="Reindex" className="text-muted-foreground/50 hover:text-foreground">
                    <RefreshCw size={11} />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon-xs" onClick={() => onDelete(doc.id)} aria-label="Delete" className="text-muted-foreground/50 hover:text-destructive">
                    <Trash2 size={11} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText size={20} className="text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground/50">暂无文档</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

/* ---------- Retrieval Test ---------- */

function RetrievalTest({
  query, onQueryChange, onTest, results, isLoading,
}: {
  query?: string; onQueryChange?: (q: string) => void; onTest?: () => void
  results?: KBTestResult[]; isLoading?: boolean
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={query || ""}
          onChange={e => onQueryChange?.(e.target.value)}
          placeholder="输入测试查询..."
          className="flex-1 text-xs"
        />
        <Button size="sm" onClick={onTest} disabled={isLoading || !query?.trim()} className="gap-1">
          {isLoading ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
          <span>检索</span>
        </Button>
      </div>

      {results && results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="rounded-[var(--radius-button)] border border-border/30 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/50">{r.source}</span>
                <Badge variant="outline" className="text-xs tabular-nums">
                  {(r.score * 100).toFixed(1)}%
                </Badge>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && query && (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground/50">未找到匹配结果</p>
        </div>
      )}
    </div>
  )
}

/* ---------- KBManager ---------- */

function KBManager({
  knowledgeBases, selectedKBId, onSelectKB, onCreateKB, onDeleteKB, onRenameKB,
  documents, onAddDocument, onDeleteDocument, onReindexDocument,
  ragSettings,
  testQuery, onTestQueryChange, onTestRetrieval, testResults, isTestLoading,
  searchQuery, onSearchChange,
  className, ...props
}: KBManagerProps) {
  const selectedKB = knowledgeBases.find(kb => kb.id === selectedKBId)

  return (
    <div
      data-slot="kb-manager"
      className={cn("flex border rounded-[var(--radius-card)] bg-background overflow-hidden", className)}
      {...props}
    >
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 h-full bg-muted/[0.08] border-r border-border/30">
        <KBSidebar
          items={knowledgeBases}
          selectedId={selectedKBId}
          onSelect={onSelectKB}
          onSearch={onSearchChange}
          searchQuery={searchQuery}
          onCreateKB={onCreateKB}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedKB ? (
          <>
            {/* Header */}
            <div className="h-11 flex items-center justify-between px-3.5 flex-shrink-0 border-b border-border/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm flex-shrink-0">{selectedKB.icon || "📚"}</span>
                <span className="text-xs text-foreground truncate">{selectedKB.name}</span>
                <span className={cn("w-2 h-2 rounded-full flex-shrink-0", STATUS_DOT[selectedKB.status])} />
                <span className="text-xs text-muted-foreground/50">{STATUS_LABEL[selectedKB.status]}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/50 flex-shrink-0">
                <span className="flex items-center gap-0.5"><FileText size={10} />{selectedKB.docCount} 文档</span>
                <span className="flex items-center gap-0.5"><Clock size={10} />{selectedKB.updatedAt}</span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="sources" className="flex flex-col flex-1 min-h-0">
              <TabsList className="bg-transparent h-auto p-0 px-3 gap-0 border-b border-border/30 rounded-none justify-start">
                <TabsTrigger value="sources" className="rounded-none border-b-[1.5px] border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent text-xs px-3 py-2">
                  数据源
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-none border-b-[1.5px] border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent text-xs px-3 py-2">
                  RAG 配置
                </TabsTrigger>
                <TabsTrigger value="test" className="rounded-none border-b-[1.5px] border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent text-xs px-3 py-2">
                  召回测试
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="flex-1 mt-0 min-h-0">
                <DocumentList
                  documents={documents}
                  onAdd={onAddDocument}
                  onDelete={onDeleteDocument}
                  onReindex={onReindexDocument}
                />
              </TabsContent>

              <TabsContent value="settings" className="flex-1 mt-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {ragSettings || <p className="text-xs text-muted-foreground/50 text-center py-8">RAG 配置区域</p>}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="test" className="flex-1 mt-0">
                <ScrollArea className="h-full">
                  <RetrievalTest
                    query={testQuery}
                    onQueryChange={onTestQueryChange}
                    onTest={onTestRetrieval}
                    results={testResults}
                    isLoading={isTestLoading}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
            <FileText size={32} className="mb-3" />
            <p className="text-sm">选择一个知识库</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { KBManager }
