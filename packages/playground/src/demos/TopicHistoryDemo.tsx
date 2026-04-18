import React, { useState, useMemo } from "react"
import { Button, Input, Badge, Separator, Popover, PopoverTrigger, PopoverContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  Search, X, Tag, Pin, Trash2, Check, ChevronDown, History,
  List, LayoutGrid, ArrowUpDown, MoreHorizontal,
  MessageCircle, FolderOpen,
} from "lucide-react"

/* ═══════════════════════════════════════════
   Types (matching src/app/types/assistant)
   ═══════════════════════════════════════════ */

interface AssistantTopic {
  id: string
  title: string
  assistantName: string
  lastMessage: string
  timestamp: string
  messageCount: number
  status: "active" | "completed"
  pinned?: boolean
  tags?: string[]
}

type SortKey = "time" | "name" | "messages"
type GroupMode = "none" | "assistant" | "tag"
type ViewMode = "card" | "list"

/* ═══════════════════════════════════════════
   Mock data (matching original field names)
   ═══════════════════════════════════════════ */

const ASSISTANT_ICONS: Record<string, string> = {
  "默认助手": "🤖", "写作助手": "✍️", "代码专家": "💻", "翻译官": "🌐",
  "数据分析师": "📊", "学术论文助手": "📝", "产品经理": "📋", "UI 设计师": "🎨", "英语教师": "📚",
}

const TAG_COLORS: Record<string, string> = {
  React: "bg-accent-cyan-muted text-accent-cyan border-accent-cyan/20",
  "Next.js": "bg-muted/40 text-foreground/80 border-border/50",
  "前端": "bg-accent-blue-muted text-accent-blue border-accent-blue/20",
  "后端": "bg-accent-violet-muted text-accent-violet border-accent-violet/20",
  "写作": "bg-accent-amber-muted text-accent-amber border-accent-amber/20",
  "报告": "bg-accent-orange-muted text-accent-orange border-accent-orange/20",
  TypeScript: "bg-accent-sky-muted text-accent-sky border-accent-sky/20",
  CSS: "bg-accent-pink-muted text-accent-pink border-accent-pink/20",
  "产品": "bg-muted/40 text-foreground/80 border-border/50",
  "数据库": "bg-accent-indigo-muted text-accent-indigo border-accent-indigo/20",
  AI: "bg-accent-purple-muted text-accent-purple border-accent-purple/20",
  "架构": "bg-error/10 text-error border-error/20",
  MCP: "bg-accent-rose-muted text-accent-rose border-accent-rose/20",
}

const initialTopics: AssistantTopic[] = [
  { id: "t1", title: "React 19 新特性深度解析", assistantName: "代码专家", lastMessage: "React 19 引入了 use() hook...", timestamp: "10:32", messageCount: 24, status: "active", pinned: true, tags: ["React", "前端"] },
  { id: "t2", title: "Next.js App Router 路由架构", assistantName: "代码专家", lastMessage: "App Router 使用文件系统...", timestamp: "09:15", messageCount: 18, status: "completed", tags: ["Next.js", "前端"] },
  { id: "t3", title: "TypeScript 高级类型编程", assistantName: "代码专家", lastMessage: "条件类型和映射类型...", timestamp: "昨天", messageCount: 42, status: "completed", tags: ["TypeScript", "前端"] },
  { id: "t4", title: "年终总结报告撰写", assistantName: "写作助手", lastMessage: "建议从三个维度展开...", timestamp: "昨天", messageCount: 15, status: "completed", pinned: true, tags: ["写作", "报告"] },
  { id: "t5", title: "CSS Container Queries 实践", assistantName: "代码专家", lastMessage: "容器查询相比媒体查询...", timestamp: "前天", messageCount: 12, status: "completed", tags: ["CSS", "前端"] },
  { id: "t6", title: "PostgreSQL 查询优化", assistantName: "数据分析师", lastMessage: "索引策略对查询性能...", timestamp: "前天", messageCount: 31, status: "completed", tags: ["数据库", "后端"] },
  { id: "t7", title: "产品 PRD 文档评审", assistantName: "产品经理", lastMessage: "需求优先级建议调整为...", timestamp: "3天前", messageCount: 8, status: "completed", tags: ["产品"] },
  { id: "t8", title: "AI Agent 架构设计", assistantName: "代码专家", lastMessage: "推荐使用 ReAct 框架...", timestamp: "3天前", messageCount: 36, status: "completed", tags: ["AI", "架构"] },
  { id: "t9", title: "MCP 协议集成方案", assistantName: "代码专家", lastMessage: "MCP Server 需要实现...", timestamp: "4天前", messageCount: 22, status: "completed", tags: ["MCP", "架构"] },
  { id: "t10", title: "UI 组件库设计规范", assistantName: "UI 设计师", lastMessage: "建议采用 Atomic Design...", timestamp: "5天前", messageCount: 19, status: "completed", tags: ["前端", "CSS"] },
  { id: "t11", title: "论文翻译 - Attention Is All You Need", assistantName: "翻译官", lastMessage: "注意力机制的核心思想...", timestamp: "1周前", messageCount: 14, status: "completed", tags: ["AI", "写作"] },
  { id: "t12", title: "数据可视化方案对比", assistantName: "数据分析师", lastMessage: "ECharts vs D3.js...", timestamp: "1周前", messageCount: 26, status: "completed", tags: ["前端", "数据库"] },
]

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function TagBadge({ tag, selected, onClick, onRemove, size = "sm" }: {
  tag: string; selected?: boolean; onClick?: () => void; onRemove?: () => void; size?: "sm" | "xs"
}) {
  const color = TAG_COLORS[tag] || "bg-muted text-muted-foreground border-border/20"
  const cls = size === "sm" ? "px-2 py-[2px] text-[10px]" : "px-1.5 py-[1px] text-xs"
  return (
    <span onClick={onClick} className={`inline-flex items-center gap-0.5 rounded-[12px] border transition-all duration-100 ${cls} ${color} ${selected ? "ring-1 ring-foreground/20 shadow-sm" : ""} ${onClick ? "cursor-pointer hover:shadow-sm active:scale-[0.96]" : "cursor-default"}`}>
      {tag}
      {onRemove && <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onRemove() }} className="h-auto px-0 py-0 ml-0.5 text-current opacity-50 hover:opacity-100 transition-opacity"><X size={8} /></Button>}
    </span>
  )
}

/* ─── Topic Card (card view) ─── */

function TopicCard({ topic, isActive, onSelect, onTogglePin, onDelete }: {
  topic: AssistantTopic; isActive: boolean; onSelect: () => void; onTogglePin?: (id: string) => void; onDelete?: (id: string) => void
}) {
  return (
    <div onClick={onSelect} className={`flex items-center gap-2.5 px-3 py-2 rounded-[12px] cursor-pointer transition-all duration-100 group/tc ${isActive ? "bg-cherry-active-bg border border-cherry-ring" : "border border-transparent hover:bg-accent/10 hover:border-border/30"}`}>
      <span className="text-sm flex-shrink-0">{ASSISTANT_ICONS[topic.assistantName] || "🤖"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {topic.status === "active" && <span className="w-[5px] h-[5px] rounded-full bg-primary animate-pulse flex-shrink-0" />}
          {topic.pinned && <Pin size={8} className="text-muted-foreground/50 -rotate-45 flex-shrink-0" />}
          <span className="text-xs text-foreground truncate">{topic.title}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-[2px]">
          <span className="text-[9.5px] text-muted-foreground/60 flex-shrink-0">{topic.assistantName}</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-[9.5px] text-muted-foreground/50 tabular-nums flex-shrink-0">{topic.messageCount} 条</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-[9.5px] text-muted-foreground/50 flex-shrink-0">{topic.timestamp}</span>
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex items-center gap-0.5 overflow-hidden ml-0.5">
              {topic.tags.slice(0, 2).map((t) => <TagBadge key={t} tag={t} size="xs" />)}
              {topic.tags.length > 2 && <span className="text-xs text-muted-foreground/40">+{topic.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="w-[20px] flex-shrink-0 flex justify-center" onClick={e => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" className="size-5 opacity-0 group-hover/tc:opacity-100 text-muted-foreground/40">
              <MoreHorizontal size={11} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[100px]">
            <DropdownMenuItem onClick={() => onTogglePin?.(topic.id)}>
              {topic.pinned ? "取消置顶" : "置顶"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(topic.id)} className="text-destructive">
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/* ─── Topic List Row (list view) ─── */

function TopicListRow({ topic, isActive, onSelect, onTogglePin, onDelete }: {
  topic: AssistantTopic; isActive: boolean; onSelect: () => void; onTogglePin?: (id: string) => void; onDelete?: (id: string) => void
}) {
  return (
    <div onClick={onSelect} className={`flex items-center gap-2.5 px-3 py-[7px] rounded-[12px] cursor-pointer transition-all duration-75 group/lr ${isActive ? "bg-cherry-active-bg" : "hover:bg-accent/10"}`}>
      <span className="text-xs flex-shrink-0 w-5 text-center">{ASSISTANT_ICONS[topic.assistantName] || "🤖"}</span>
      {topic.status === "active" && <span className="w-[5px] h-[5px] rounded-full bg-primary animate-pulse flex-shrink-0" />}
      {topic.pinned && <Pin size={8} className="text-muted-foreground/50 -rotate-45 flex-shrink-0" />}
      <span className={`text-xs flex-1 truncate ${isActive ? "text-foreground" : "text-foreground/85"}`}>{topic.title}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {topic.tags?.slice(0, 2).map((t) => <TagBadge key={t} tag={t} size="xs" />)}
      </div>
      <span className="text-[10px] text-muted-foreground truncate flex-shrink-0 w-[70px] text-right">{topic.assistantName}</span>
      <div className="flex items-center gap-0.5 flex-shrink-0 w-[36px] justify-end">
        <MessageCircle size={8} className="text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground tabular-nums">{topic.messageCount}</span>
      </div>
      <span className="text-[10px] text-muted-foreground flex-shrink-0 w-[40px] text-right tabular-nums">{topic.timestamp}</span>
      <div className="w-[24px] flex-shrink-0 flex justify-center" onClick={e => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" className="size-5 opacity-0 group-hover/lr:opacity-100 text-muted-foreground/40">
              <MoreHorizontal size={11} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[100px]">
            <DropdownMenuItem onClick={() => onTogglePin?.(topic.id)}>
              {topic.pinned ? "取消置顶" : "置顶"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(topic.id)} className="text-destructive">
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/* ─── Grouped Section ─── */

function GroupSection({ title, count, children, icon }: {
  title: string; count: number; children: React.ReactNode; icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mb-2">
      <Button variant="ghost" onClick={() => setOpen(!open)} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-2 w-full px-2 py-1.5 rounded-[12px] hover:bg-accent/15 transition-colors">
        <ChevronDown size={11} className={`text-muted-foreground transition-transform duration-100 ${open ? "" : "-rotate-90"}`} />
        {icon || <FolderOpen size={11} className="text-muted-foreground" />}
        <span className="text-xs text-foreground/90 flex-1 text-left">{title}</span>
        <span className="text-[10px] text-muted-foreground bg-accent/30 px-1.5 py-[1px] rounded-[12px] tabular-nums">{count}</span>
      </Button>
      {open && <div className="pt-0.5">{children}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main Demo
   ═══════════════════════════════════════════ */

export function TopicHistoryDemo() {
  const [topics, setTopics] = useState(initialTopics)
  const [activeId, setActiveId] = useState<string | null>("t1")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("time")
  const [groupMode, setGroupMode] = useState<GroupMode>("none")
  const [viewMode, setViewMode] = useState<ViewMode>("card")
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    topics.forEach((t) => t.tags?.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [topics])

  const allAssistants = useMemo(() => Array.from(new Set(topics.map((t) => t.assistantName))), [topics])

  const toggleTag = (tag: string) => setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])

  const filteredTopics = useMemo(() => {
    let list = [...topics]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.assistantName.toLowerCase().includes(q) || t.tags?.some((tag) => tag.toLowerCase().includes(q)))
    }
    if (selectedTags.length > 0) list = list.filter((t) => selectedTags.some((tag) => t.tags?.includes(tag)))
    if (selectedAssistant) list = list.filter((t) => t.assistantName === selectedAssistant)
    if (sortKey === "name") list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sortKey === "messages") list.sort((a, b) => b.messageCount - a.messageCount)
    return list
  }, [topics, searchQuery, selectedTags, selectedAssistant, sortKey])

  const groupedTopics = useMemo(() => {
    if (groupMode === "none") return null
    const groups: Record<string, AssistantTopic[]> = {}
    filteredTopics.forEach((t) => {
      if (groupMode === "assistant") {
        const k = t.assistantName; (groups[k] ??= []).push(t)
      } else {
        if (t.tags && t.tags.length > 0) t.tags.forEach((tag) => { (groups[tag] ??= []).push(t) })
        else (groups["未标记"] ??= []).push(t)
      }
    })
    return groups
  }, [filteredTopics, groupMode])

  const hasFilters = selectedTags.length > 0 || !!selectedAssistant
  const clearFilters = () => { setSelectedTags([]); setSelectedAssistant(null); setSearchQuery("") }
  const handleDelete = (id: string) => setTopics((p) => p.filter((t) => t.id !== id))
  const handleTogglePin = (id: string) => setTopics((p) => p.map((t) => t.id === id ? { ...t, pinned: !t.pinned } : t))

  const renderTopic = (topic: AssistantTopic) => {
    const props = { topic, isActive: activeId === topic.id, onSelect: () => setActiveId(topic.id), onTogglePin: handleTogglePin, onDelete: handleDelete }
    return viewMode === "card" ? <TopicCard key={topic.id} {...props} /> : <TopicListRow key={topic.id} {...props} />
  }
  const listGap = viewMode === "card" ? "gap-1.5" : "gap-0"

  return (
    <Section title="Topic History" props={[
      { name: "topics", type: "AssistantTopic[]", default: "[]", description: "List of conversation topics" },
      { name: "viewMode", type: '"card" | "list"', default: '"card"', description: "Display layout mode" },
      { name: "sortKey", type: '"time" | "name" | "messages"', default: '"time"', description: "Sort order" },
      { name: "groupMode", type: '"none" | "assistant" | "tag"', default: '"none"', description: "Group mode" },
    ] satisfies PropDef[]}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        <div className="flex h-[520px]">

          {/* ─── Left Filter Sidebar ─── */}
          <div className="w-[200px] border-r border-border/30 flex flex-col flex-shrink-0 overflow-y-auto py-3 px-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-[12px] bg-accent/40 flex items-center justify-center"><History size={14} className="text-foreground/70" /></div>
              <div>
                <h2 className="text-sm text-foreground">话题历史</h2>
                <p className="text-[10px] text-muted-foreground">{topics.length} 个话题</p>
              </div>
            </div>

            {/* Assistants */}
            <div className="mb-2">
              <div className="text-[9.5px] text-muted-foreground uppercase tracking-[0.08em] px-1 mb-2">助手</div>
              <div className="flex flex-col gap-[2px]">
                <Button variant="ghost" onClick={() => setSelectedAssistant(null)} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-2 px-2.5 py-[5px] rounded-[12px] text-[10.5px] transition-all duration-75 ${!selectedAssistant ? "bg-muted/30 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/15"}`}>
                  <span className="flex-1 text-left">全部</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{topics.length}</span>
                </Button>
                {allAssistants.map((ast) => {
                  const count = topics.filter((t) => t.assistantName === ast).length
                  return (
                    <Button variant="ghost" key={ast} onClick={() => setSelectedAssistant(selectedAssistant === ast ? null : ast)} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-2 px-2.5 py-[5px] rounded-[12px] text-[10.5px] transition-all duration-75 ${selectedAssistant === ast ? "bg-muted/30 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/15"}`}>
                      <span className="text-[10px] flex-shrink-0">{ASSISTANT_ICONS[ast] || "🤖"}</span>
                      <span className="flex-1 text-left truncate">{ast}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {hasFilters && (
              <Button variant="outline" size="xs" onClick={clearFilters} className="gap-1 mt-auto border-dashed text-muted-foreground">
                <X size={9} /> 清除所有筛选
              </Button>
            )}
          </div>

          {/* ─── Right Content ─── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/25 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] text-foreground/70">{filteredTopics.length} 条结果</span>
                {/* Tag filter dropdown */}
                <Popover open={tagDropdownOpen} onOpenChange={setTagDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-2 py-[3px] rounded-[12px] text-[10px] transition-all duration-100 ${tagDropdownOpen || selectedTags.length > 0 ? "bg-muted/30 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/15"}`}>
                      <Tag size={9} />
                      <span>{selectedTags.length > 0 ? `${selectedTags.length} 个标签` : "标签"}</span>
                      <ChevronDown size={8} className={`transition-transform duration-100 ${tagDropdownOpen ? "rotate-180" : ""}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] rounded-[12px] p-0 py-1 border-border/40 shadow-xl max-h-[280px] overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/30" align="start" sideOffset={4}>
                    {allTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag)
                      const count = topics.filter((t) => t.tags?.includes(tag)).length
                      return (
                        <Button variant="ghost" key={tag} onClick={() => toggleTag(tag)} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-2 w-full px-2.5 py-[5px] text-[10.5px] transition-colors rounded-none ${isSelected ? "bg-foreground/6 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/15"}`}>
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "border-primary bg-primary" : "border-border/50"}`}>
                            {isSelected && <Check size={8} className="text-primary-foreground" />}
                          </div>
                          <TagBadge tag={tag} size="xs" />
                          <span className="flex-1" />
                          <span className="text-xs text-muted-foreground/50 tabular-nums">{count}</span>
                        </Button>
                      )
                    })}
                    {selectedTags.length > 0 && (
                      <>
                        <div className="h-px bg-border/20 my-0.5" />
                        <Button variant="ghost" onClick={() => setSelectedTags([])} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-2 w-full px-2.5 py-[5px] text-[10.5px] text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors rounded-none">
                          <X size={9} className="flex-shrink-0" /> 清除选择
                        </Button>
                      </>
                    )}
                  </PopoverContent>
                </Popover>
                {/* Selected tags inline */}
                {selectedTags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {selectedTags.map((tag) => <TagBadge key={tag} tag={tag} size="xs" onClick={() => toggleTag(tag)} onRemove={() => toggleTag(tag)} />)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Search */}
                <div className="relative w-[160px]">
                  <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索话题..." className="h-7 pl-6 pr-6 text-[10px]" />
                  {searchQuery && <Button variant="ghost" size="icon-xs" onClick={() => setSearchQuery("")} className="absolute right-1 top-1/2 -translate-y-1/2 size-4"><X size={9} /></Button>}
                </div>
                <Separator orientation="vertical" className="h-4" />
                {/* View mode */}
                <div className="flex items-center gap-[1px] bg-accent/15 rounded-[12px] p-[2px]">
                  <Button variant="ghost" onClick={() => setViewMode("list")} className={`h-auto px-0 py-0 font-normal tracking-normal p-[4px] rounded-[6px] transition-all duration-100 ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><List size={12} /></Button>
                  <Button variant="ghost" onClick={() => setViewMode("card")} className={`h-auto px-0 py-0 font-normal tracking-normal p-[4px] rounded-[6px] transition-all duration-100 ${viewMode === "card" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid size={12} /></Button>
                </div>
                <Separator orientation="vertical" className="h-4" />
                {/* Group mode */}
                <div className="flex items-center gap-[2px] bg-accent/15 rounded-[12px] p-[2px]">
                  {(["none", "assistant", "tag"] as const).map((g) => (
                    <Button variant="ghost" key={g} onClick={() => setGroupMode(g)} className={`h-auto px-0 py-0 font-normal tracking-normal px-2 py-[3px] rounded-[6px] text-[10px] transition-all duration-100 ${groupMode === g ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      {g === "none" ? "平铺" : g === "assistant" ? "按助手" : "按标签"}
                    </Button>
                  ))}
                </div>
                <Separator orientation="vertical" className="h-4" />
                {/* Sort */}
                <Button variant="ghost" onClick={() => setSortKey(sortKey === "time" ? "name" : sortKey === "name" ? "messages" : "time")} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-2 py-[3px] rounded-[12px] text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/15 transition-colors">
                  <ArrowUpDown size={10} />
                  {sortKey === "time" ? "按时间" : sortKey === "name" ? "按名称" : "按消息数"}
                </Button>
              </div>
            </div>

            {/* List header (list view only) */}
            {viewMode === "list" && filteredTopics.length > 0 && (
              <div className="flex items-center gap-2.5 px-3 py-[5px] border-b border-border/30 text-xs text-muted-foreground uppercase tracking-[0.06em] flex-shrink-0">
                <span className="w-5 flex-shrink-0 text-center">助手</span>
                <span className="flex-1">标题</span>
                <span className="w-[70px] text-right flex-shrink-0">类型</span>
                <span className="w-[36px] text-right flex-shrink-0">消息</span>
                <span className="w-[40px] text-right flex-shrink-0">时间</span>
                <span className="w-[24px] flex-shrink-0" />
              </div>
            )}

            {/* Topic list */}
            <div className="flex-1 overflow-y-auto px-2 py-1.5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
              {groupedTopics ? (
                Object.entries(groupedTopics).map(([name, items]) => (
                  <GroupSection key={name} title={name} count={items.length} icon={groupMode === "tag" ? <TagBadge tag={name} size="xs" /> : groupMode === "assistant" ? <span className="text-xs">{ASSISTANT_ICONS[name] || "🤖"}</span> : undefined}>
                    <div className={`flex flex-col ${listGap} pl-2`}>{items.map(renderTopic)}</div>
                  </GroupSection>
                ))
              ) : (
                <div className={`flex flex-col ${listGap}`}>{filteredTopics.map(renderTopic)}</div>
              )}
              {filteredTopics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 rounded-[12px] bg-accent/25 flex items-center justify-center mb-3"><Search size={18} className="text-muted-foreground/40" /></div>
                  <p className="text-xs text-foreground/70 mb-1">没有找到匹配的话题</p>
                  <p className="text-[10px] text-muted-foreground mb-3">尝试修改搜索条件或筛选标签</p>
                  {hasFilters && <Button variant="secondary" size="xs" onClick={clearFilters}>清除筛选条件</Button>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
