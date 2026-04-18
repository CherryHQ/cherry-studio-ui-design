import React, { useState, useRef, useCallback } from "react"
import { Button, Input, SimpleTooltip, Textarea, Badge, Separator, Popover, PopoverTrigger, PopoverContent, NoteEditor } from "@cherry-studio/ui"
import type { NoteEditorMode } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  NotebookPen, FilePlus, FolderPlus, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, Search, Star, SortAsc, Filter,
  FileText, ChevronRight, FolderOpen, Folder, PenLine,
  Brain, Sparkles, Check, Languages, Maximize2, MessageCircle, Hash,
  List, Send, Trash2, Download, Share2, MoreHorizontal,
  X, ChevronDown, Tag, Eye,
} from "lucide-react"

// ===========================
// Types & Data (matching src/features/note/NotePage)
// ===========================

interface NoteItem {
  id: string
  title: string
  type: "file" | "folder"
  children?: NoteItem[]
  starred?: boolean
  updatedAt?: string
  preview?: string
  tags?: string[]
}

interface AIChatMsg { role: "user" | "assistant"; content: string }

interface NoteQuickAction {
  id: string
  label: string
  icon: typeof Sparkles
  category: "write" | "analyze" | "organize" | "format"
  mockResponse: string
}

const mockNotes: NoteItem[] = [
  {
    id: "f1", title: "工作笔记", type: "folder", children: [
      {
        id: "f1-1", title: "项目管理", type: "folder", children: [
          { id: "n1", title: "项目周报 - Week 12", type: "file", starred: true, updatedAt: "2 小时前", preview: "本周完成了用户认证模块的开发，修复了 3 个关键 Bug...", tags: ["周报", "项目"] },
          { id: "n2", title: "Q4 OKR 复盘", type: "file", updatedAt: "1 天前", preview: "O1: 提升产品核心体验\nKR1: DAU 提升 20%...", tags: ["OKR"] },
        ]
      },
      { id: "n4", title: "团队周会纪要", type: "file", starred: true, updatedAt: "5 小时前", preview: "讨论了下周的冲刺计划和资源分配问题...", tags: ["会议", "团队"] },
      { id: "n5", title: "竞品分析报告", type: "file", updatedAt: "2 天前", preview: "对比了 5 款竞品的功能、定价和用户体验...", tags: ["分析"] },
    ]
  },
  {
    id: "f2", title: "学习笔记", type: "folder", children: [
      { id: "n6", title: "React 性能优化技巧", type: "file", starred: true, updatedAt: "1 天前", preview: "1. 使用 React.memo 避免不必要的重渲染...", tags: ["React", "前端"] },
      { id: "n7", title: "TypeScript 高级类型", type: "file", updatedAt: "4 天前", preview: "条件类型、映射类型、模板字面量类型...", tags: ["TypeScript"] },
    ]
  },
  {
    id: "f3", title: "个人", type: "folder", children: [
      { id: "n9", title: "2026 年度计划", type: "file", starred: true, updatedAt: "3 天前", preview: "1. 完成 3 个开源项目\n2. 阅读 24 本书...", tags: ["计划"] },
    ]
  },
  { id: "n11", title: "快速笔记", type: "file", updatedAt: "30 分钟前", preview: "今天需要处理的事项：\n- 代码评审\n- 更新文档...", tags: ["临时"] },
]

const noteContent = `# 项目周报 - Week 12

## 本周完成

### 1. 用户认证模块
完成了基于 JWT 的用户认证系统开发，包括：
- 用户注册与登录接口
- Token 刷新机制
- 权限中间件

### 2. Bug 修复
修复了以下关键问题：
- **#1234** 用户头像上传后未即时刷新
- **#1256** 暗色模式下表单输入框文字不可见
- **#1278** 分页查询在特定条件下返回空结果

### 3. 性能优化
- 首屏加载时间从 3.2s 优化至 1.8s
- 列表页虚拟滚动实现，支持 10000+ 条数据流畅渲染

## 下周计划

1. 完成文件上传模块
2. 对接第三方支付 SDK
3. 编写单元测试（目标覆盖率 > 80%）

## 风险与阻塞

| 风险项 | 影响 | 应对措施 |
| --- | --- | --- |
| 支付 SDK 文档不完善 | 可能延期 | 已联系技术支持 |
| 测试环境不稳定 | 影响联调 | 运维已在排查 |

## 备注

> 下周需要与设计团队确认新版 UI 规范，建议安排一次 30 分钟的同步会议。

---
*更新时间：2026-02-25*`

const mockAIChat: AIChatMsg[] = [
  { role: "user", content: "帮我总结一下这篇周报的核心要点" },
  { role: "assistant", content: "根据周报内容，以下是核心要点：\n\n**完成事项：**\n1. JWT 用户认证系统上线\n2. 修复 3 个关键 Bug\n3. 首屏加载优化至 1.8s\n\n**下周重点：**\n- 文件上传 & 支付 SDK 对接\n- 单元测试目标覆盖率 80%+\n\n**风险提示：**\n- 支付 SDK 文档问题\n- 测试环境稳定性" },
  { role: "user", content: "有哪些需要跟进的 action items？" },
  { role: "assistant", content: "根据周报，建议跟进以下 Action Items：\n\n1. **联系支付 SDK 技术支持** — 获取完整文档\n2. **协调运维排查测试环境** — 确保联调顺畅\n3. **安排与设计团队的同步会议** — 确认新版 UI 规范\n4. **准备单元测试框架** — 提前搭建以达成覆盖率目标" },
]

const noteQuickActions: NoteQuickAction[] = [
  { id: "summarize", label: "总结要点", icon: Sparkles, category: "analyze", mockResponse: "**核心要点总结：**\n\n1. **用户认证系统** — 基于 JWT 的完整认证方案已上线\n2. **Bug 修复** — 3 个关键问题已解决\n3. **性能优化** — 首屏加载时间优化 44%（3.2s → 1.8s）" },
  { id: "outline", label: "生成大纲", icon: List, category: "organize", mockResponse: "**文档大纲：**\n\n1. 本周完成\n   1.1 用户认证模块\n   1.2 Bug 修复（3 项）\n   1.3 性能优化\n2. 下周计划\n3. 风险与阻塞\n4. 备注" },
  { id: "polish", label: "润色文字", icon: PenLine, category: "write", mockResponse: "**润色建议：**\n\n1. \"完成了基于 JWT 的用户认证系统开发\" → \"成功交付基于 JWT 的企业级用户认证系统\"\n2. \"首屏加载时间从 3.2s 优化至 1.8s\" → \"首屏加载性能提升 44%\"" },
  { id: "todo", label: "生成 TODO", icon: Check, category: "organize", mockResponse: "**TODO 列表：**\n\n- [ ] 完成文件上传模块开发\n- [ ] 对接第三方支付 SDK\n- [ ] 编写单元测试（目标覆盖率 > 80%）\n- [ ] 安排与设计团队的 UI 规范同步会议" },
  { id: "tags", label: "自动打标签", icon: Hash, category: "analyze", mockResponse: "**建议标签：**\n\n`#JWT` `#认证` `#性能优化` `#周报` `#Week12`" },
  { id: "translate", label: "翻译全文", icon: Languages, category: "write", mockResponse: "**英文翻译：**\n\n# Weekly Report - Week 12\n\n## Completed This Week\n### 1. User Authentication Module\nCompleted JWT-based authentication system..." },
  { id: "expand", label: "扩展内容", icon: Maximize2, category: "write", mockResponse: "**内容扩展建议：**\n\n1. **用户认证模块** — Token 过期策略：Access Token 15min，Refresh Token 7d\n2. **性能优化** — LCP: 2.8s → 1.2s, FCP: 1.5s → 0.6s" },
  { id: "mindmap", label: "思维导图", icon: Brain, category: "organize", mockResponse: "**思维导图结构：**\n\n```\n项目周报 Week 12\n├── 本周完成\n│   ├── 认证系统 ✅\n│   ├── Bug 修复 ✅\n│   └── 性能优化 ✅\n├── 下周计划\n└── 风险\n```" },
  { id: "qa", label: "生成问答", icon: MessageCircle, category: "analyze", mockResponse: "**Q1: 本周最大的技术成就？**\nA: JWT 用户认证系统的完整交付。\n\n**Q2: 当前面临的主要风险？**\nA: 支付 SDK 文档不完善 + 测试环境不稳定。" },
  { id: "proofread", label: "校对纠错", icon: Eye, category: "format", mockResponse: "**校对结果：**\n\n共发现 2 处可改进项：\n1. \"支持 10000+ 条数据\" → 建议使用 \"支持万级数据\"\n2. 表格格式建议统一措辞风格" },
]

const actionCategories = [
  { id: "analyze" as const, label: "分析", icon: Search },
  { id: "organize" as const, label: "整理", icon: List },
  { id: "write" as const, label: "写作", icon: PenLine },
  { id: "format" as const, label: "格式", icon: Eye },
]

const MOCK_ASSISTANTS = [
  { id: "a1", name: "写作助手", emoji: "✍️", tags: ["写作", "润色"], systemPrompt: "你是一位专业的写作助手", modelProvider: "OpenAI", model: "gpt-4o" },
  { id: "a2", name: "分析助手", emoji: "🔍", tags: ["分析", "数据"], systemPrompt: "你是一位数据分析专家", modelProvider: "Anthropic", model: "claude-opus-4" },
  { id: "a3", name: "翻译助手", emoji: "🌐", tags: ["翻译"], systemPrompt: "你是一位专业翻译", modelProvider: "Google", model: "gemini-2.5-pro" },
  { id: "a4", name: "代码助手", emoji: "💻", tags: ["代码", "开发"], systemPrompt: "你是一位高级开发工程师", modelProvider: "Anthropic", model: "claude-sonnet-4" },
]

// ===========================
// Helper: flatten tree
// ===========================
function flattenNotes(items: NoteItem[]): NoteItem[] {
  const result: NoteItem[] = []
  for (const item of items) {
    if (item.type === "file") result.push(item)
    if (item.children) result.push(...flattenNotes(item.children))
  }
  return result
}

function collectFolders(items: NoteItem[]): NoteItem[] {
  const result: NoteItem[] = []
  for (const item of items) {
    if (item.type === "folder") { result.push(item); if (item.children) result.push(...collectFolders(item.children)) }
  }
  return result
}

// ===========================
// Helper: NoteTreeItem
// ===========================
function NoteTreeItem({ item, depth = 0, selectedId, onSelect, expandedFolders, onToggleFolder, filterStarred }: {
  item: NoteItem; depth?: number; selectedId: string; onSelect: (id: string) => void
  expandedFolders: Set<string>; onToggleFolder: (id: string) => void; filterStarred: boolean
}) {
  if (item.type === "folder") {
    const isExpanded = expandedFolders.has(item.id)
    const children = item.children || []
    const filteredChildren = filterStarred ? children.filter(c => c.type === "folder" || c.starred) : children
    if (filterStarred && filteredChildren.length === 0) return null
    return (
      <div>
        <Button variant="ghost" type="button"
          onClick={() => onToggleFolder(item.id)}
          className="h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center gap-1.5 py-[5px] px-2 rounded-[12px] text-xs hover:bg-accent/60 transition-colors group/folder"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <ChevronRight size={12} className={`text-muted-foreground/50 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
          {isExpanded ? <FolderOpen size={14} className="text-accent-amber flex-shrink-0" /> : <Folder size={14} className="text-accent-amber/70 flex-shrink-0" />}
          <span className="truncate text-foreground/80 flex-1 text-left">{item.title}</span>
          <span className="text-[10px] text-muted-foreground/40 opacity-0 group-hover/folder:opacity-100">{children.length}</span>
        </Button>
        {isExpanded && filteredChildren.map(child => (
          <NoteTreeItem key={child.id} item={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} expandedFolders={expandedFolders} onToggleFolder={onToggleFolder} filterStarred={filterStarred} />
        ))}
      </div>
    )
  }

  if (filterStarred && !item.starred) return null
  const isSelected = selectedId === item.id
  return (
    <Button variant="ghost" type="button"
      onClick={() => onSelect(item.id)}
      className={`h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center gap-1.5 py-[5px] px-2 rounded-[12px] text-xs transition-colors group/file ${
        isSelected ? "bg-accent text-foreground" : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <FileText size={13} className={`flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground/50"}`} />
      <span className="truncate flex-1 text-left">{item.title}</span>
      {item.starred && <Star size={10} className="text-accent-amber fill-accent-amber flex-shrink-0" />}
    </Button>
  )
}

// ===========================
// Helper: render bold text in chat
// ===========================
function renderBoldText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.+?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

// ===========================
// Props
// ===========================
const noteProps: PropDef[] = [
  { name: "notes", type: "NoteItem[]", default: "[]", description: "Hierarchical note tree with files and folders" },
  { name: "activeNote", type: "string", default: '""', description: "ID of the currently active note" },
  { name: "editorMode", type: '"edit" | "markdown" | "preview"', default: '"edit"', description: "Current editor mode" },
  { name: "aiAssistant", type: "boolean", default: "true", description: "Show the AI assistant side panel" },
]

// ===========================
// Main Demo
// ===========================
export function NoteModuleDemo() {
  const [notes, setNotes] = useState<NoteItem[]>(mockNotes)
  const [selectedNoteId, setSelectedNoteId] = useState("n1")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["f1", "f1-1", "f2", "f3"]))
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStarred, setFilterStarred] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "date">("date")
  const [editorMode, setEditorMode] = useState<NoteEditorMode>("edit")
  const [noteContents, setNoteContents] = useState<Record<string, string>>({ n1: noteContent })
  const [savedIndicator, setSavedIndicator] = useState(false)

  // AI state
  const [aiMessages, setAiMessages] = useState<AIChatMsg[]>(mockAIChat)
  const [aiInput, setAiInput] = useState("")
  const [selectedAssistantId, setSelectedAssistantId] = useState("a1")
  const [showAssistantPicker, setShowAssistantPicker] = useState(false)
  const [astSearch, setAstSearch] = useState("")
  const [astTag, setAstTag] = useState<string | null>(null)
  const [activeActionCategory, setActiveActionCategory] = useState<string>("analyze")
  const [showAllActions, setShowAllActions] = useState(false)
  const aiEndRef = useRef<HTMLDivElement>(null)

  const selectedAssistant = MOCK_ASSISTANTS.find(a => a.id === selectedAssistantId) || MOCK_ASSISTANTS[0]
  const allAstTags = Array.from(new Set(MOCK_ASSISTANTS.flatMap(a => a.tags)))
  const filteredAssistants = MOCK_ASSISTANTS.filter(a => {
    if (astSearch && !a.name.toLowerCase().includes(astSearch.toLowerCase())) return false
    if (astTag && !a.tags.includes(astTag)) return false
    return true
  })

  const allNotes = flattenNotes(notes)
  const selectedNote = allNotes.find(n => n.id === selectedNoteId)

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const getCurrentContent = useCallback(() => {
    if (!selectedNoteId) return ""
    return noteContents[selectedNoteId] || `# ${selectedNote?.title || "新笔记"}\n\n开始编辑...`
  }, [selectedNoteId, noteContents, selectedNote])

  const updateContent = (val: string) => {
    setNoteContents(c => ({ ...c, [selectedNoteId]: val }))
  }

  // AI actions
  const handleAISend = () => {
    if (!aiInput.trim()) return
    setAiMessages(prev => [...prev, { role: "user", content: aiInput }, { role: "assistant", content: `关于"${aiInput.slice(0, 20)}..."的分析：\n\n基于当前笔记内容，这是一个很好的问题。让我为您详细分析...` }])
    setAiInput("")
    setTimeout(() => aiEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  const handleQuickAction = (action: NoteQuickAction) => {
    setAiMessages(prev => [...prev, { role: "user", content: action.label }, { role: "assistant", content: action.mockResponse }])
    setTimeout(() => aiEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  // Filter notes by search
  const filterNotes = (items: NoteItem[]): NoteItem[] => {
    if (!searchTerm) return items
    const q = searchTerm.toLowerCase()
    return items.map(item => {
      if (item.type === "folder") {
        const filtered = filterNotes(item.children || [])
        if (filtered.length > 0 || item.title.toLowerCase().includes(q)) return { ...item, children: filtered }
        return null
      }
      if (item.title.toLowerCase().includes(q)) return item
      return null
    }).filter((n): n is NoteItem => n !== null)
  }

  const filteredNotes = filterNotes(notes)

  return (
    <Section title="Note Editor Module" props={noteProps} code={`// Three-column layout: directory tree + editor + AI assistant
// Matching src/features/note/NotePage.tsx structure
<div className="flex-1 flex min-h-0">
  {/* Left: Note directory tree with search, filters */}
  <div style={{ width: 240 }}>
    <NoteTreeItem ... />
  </div>
  {/* Center: Editor with toolbar + markdown/preview modes */}
  <div className="flex-1 flex flex-col">
    <Toolbar />
    <textarea | PreviewRenderer />
    <StatusBar />
  </div>
  {/* Right: AI Chat with assistant picker + quick actions */}
  <div style={{ width: 320 }}>
    <AssistantPicker />
    <QuickActions />
    <ChatMessages />
    <ChatInput />
  </div>
</div>`}>
      <div className="rounded-[24px] border bg-background overflow-hidden h-[600px]">
        <div className="flex h-full min-h-0">

          {/* ===== Left Panel - Note Directory ===== */}
          {leftPanelOpen && (
            <div className="flex flex-shrink-0 border-r border-border/40" style={{ width: 240 }}>
              <div className="flex flex-col h-full w-full">
                {/* Header */}
                <div className="h-11 flex items-center gap-1.5 px-3 flex-shrink-0">
                  <NotebookPen size={14} className="text-accent-orange flex-shrink-0" />
                  <span className="text-xs text-foreground flex-1 truncate">笔记</span>
                  <SimpleTooltip content="新建笔记"><Button variant="ghost" type="button" onClick={() => { const id = `n${Date.now()}`; setNotes(prev => [...prev, { id, title: "新笔记", type: "file" as const, updatedAt: "刚刚" }]); setSelectedNoteId(id) }} className="h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><FilePlus size={13} /></Button></SimpleTooltip>
                  <SimpleTooltip content="新建文件夹"><Button variant="ghost" type="button" onClick={() => setNotes(prev => [...prev, { id: `f${Date.now()}`, title: "新文件夹", type: "folder" as const, children: [] }])} className="h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><FolderPlus size={13} /></Button></SimpleTooltip>
                  <SimpleTooltip content="收起目录"><Button variant="ghost" type="button" onClick={() => setLeftPanelOpen(false)} className="h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><PanelLeftClose size={13} /></Button></SimpleTooltip>
                </div>
                {/* Search & Filters */}
                <div className="px-2.5 pt-2 pb-1 space-y-1.5">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                    <Input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索笔记..." className="h-7 w-full rounded-[12px] border-0 bg-accent/40 pl-7 pr-2 text-xs text-foreground shadow-none placeholder:text-muted-foreground/40 focus:bg-accent/60 focus-visible:ring-1 focus-visible:ring-border/50" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" type="button" onClick={() => setFilterStarred(!filterStarred)} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-2 py-1 rounded-[12px] text-xs transition-colors ${filterStarred ? "bg-accent-amber-muted text-accent-amber" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}>
                      <Star size={10} className={filterStarred ? "fill-accent-amber" : ""} /> 收藏
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setSortBy(sortBy === "name" ? "date" : "name")} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-2 py-1 rounded-[12px] text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
                      <SortAsc size={10} /> {sortBy === "name" ? "名称" : "日期"}
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setFilterStarred(!filterStarred)} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-2 py-1 rounded-[12px] text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
                      <Filter size={10} /> {filterStarred ? "全部" : "筛选"}
                    </Button>
                  </div>
                </div>
                {/* Tree */}
                <div className="flex-1 overflow-y-auto px-1.5 py-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {filteredNotes.map(item => (
                    <NoteTreeItem key={item.id} item={item} selectedId={selectedNoteId} onSelect={setSelectedNoteId} expandedFolders={expandedFolders} onToggleFolder={toggleFolder} filterStarred={filterStarred} />
                  ))}
                  {filteredNotes.length === 0 && (
                    <div className="py-6 text-center text-xs text-muted-foreground/40">没有找到笔记</div>
                  )}
                </div>
                {/* Footer */}
                <div className="h-8 flex items-center px-3 text-[10px] text-muted-foreground/40 flex-shrink-0">
                  {allNotes.length} 篇笔记 · {collectFolders(notes).length} 个文件夹
                </div>
              </div>
            </div>
          )}

          {/* ===== Center Panel - Editor ===== */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="h-11 flex items-center px-4 flex-shrink-0 gap-2">
              {!leftPanelOpen && (
                <SimpleTooltip content="展开目录"><Button variant="ghost" type="button" onClick={() => setLeftPanelOpen(true)} className="h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mr-1"><PanelLeftOpen size={15} /></Button></SimpleTooltip>
              )}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <FileText size={13} className="text-primary flex-shrink-0" />
                <span className="text-xs text-foreground truncate">{selectedNote?.title || "选择一篇笔记"}</span>
                {selectedNote?.starred && <Star size={10} className="text-accent-amber fill-accent-amber flex-shrink-0" />}
                {selectedNote?.updatedAt && <span className="text-[10px] text-muted-foreground/40 flex-shrink-0 ml-1">&middot; {selectedNote.updatedAt}</span>}
              </div>
              {selectedNote?.tags && selectedNote.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {selectedNote.tags.map(tag => (<Badge key={tag} variant="secondary" className="px-1.5 py-0.5 text-[10px] text-muted-foreground">#{tag}</Badge>))}
                </div>
              )}
              <Separator orientation="vertical" className="h-4 bg-border/30 mx-1" />
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <SimpleTooltip content="导出"><Button variant="ghost" type="button" onClick={() => alert("Exported to Markdown")} className="h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Download size={13} /></Button></SimpleTooltip>
                <SimpleTooltip content="分享"><Button variant="ghost" type="button" onClick={() => alert("Share link copied")} className="h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Share2 size={13} /></Button></SimpleTooltip>
                <SimpleTooltip content="更多"><Button variant="ghost" type="button" onClick={() => alert("More options: Delete, Duplicate, Move to folder")} className="h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><MoreHorizontal size={13} /></Button></SimpleTooltip>
                <Separator orientation="vertical" className="h-4 bg-border/30 mx-1" />
                <SimpleTooltip content={rightPanelOpen ? "关闭 AI 面板" : "打开 AI 面板"}>
                  <Button variant="ghost" type="button" onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[12px] flex items-center justify-center transition-colors ${rightPanelOpen ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}><Sparkles size={13} /></Button>
                </SimpleTooltip>
              </div>
            </div>

            {/* NoteEditor component */}
            {selectedNote ? (
              <NoteEditor
                content={getCurrentContent()}
                onChange={updateContent}
                mode={editorMode}
                onModeChange={setEditorMode}
                onSave={() => { setSavedIndicator(true); setTimeout(() => setSavedIndicator(false), 1500) }}
                lastSaved={savedIndicator ? "已保存" : undefined}
                placeholder="开始编辑..."
                className="flex-1 min-h-0"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40">
                <NotebookPen size={32} className="mb-3" />
                <p className="text-sm">选择一篇笔记开始编辑</p>
              </div>
            )}
          </div>

          {/* ===== Right Panel - AI Chat ===== */}
          {rightPanelOpen && (
            <div className="flex flex-col h-full flex-shrink-0 border-l border-border/40" style={{ width: 320 }}>
              {/* Header: Assistant Picker */}
              <div className="h-11 flex items-center gap-2 px-3 flex-shrink-0">
                <Popover open={showAssistantPicker} onOpenChange={(v) => { setShowAssistantPicker(v); if (v) { setAstSearch(""); setAstTag(null) } }}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" type="button" className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1.5 px-2 py-[4px] rounded-[12px] text-[10px] transition-all duration-100 ${showAssistantPicker ? "bg-accent/25 text-foreground" : "text-foreground/75 hover:text-foreground hover:bg-accent/15"}`}>
                      <span className="text-xs leading-none flex-shrink-0">{selectedAssistant.emoji}</span>
                      <span className="truncate max-w-[100px]">{selectedAssistant.name}</span>
                      <ChevronDown size={8} className={`text-muted-foreground/50 flex-shrink-0 transition-transform duration-100 ${showAssistantPicker ? "rotate-180" : ""}`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="rounded-[12px] p-0 border-border/40 shadow-xl shadow-black/10 min-w-[260px]" align="start" sideOffset={4}>
                    <div className="px-2 pt-2 pb-1">
                      <div className="flex items-center gap-1.5 px-2 py-[5px] rounded-[12px] bg-accent/15 border border-border/20">
                        <Search size={10} className="text-muted-foreground/40 flex-shrink-0" />
                        <Input value={astSearch} onChange={e => setAstSearch(e.target.value)} placeholder="搜索助手..." className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 text-[10px] text-foreground shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0" autoFocus />
                        {astSearch && <Button variant="ghost" type="button" onClick={() => setAstSearch("")} className="h-auto px-0 py-0 font-normal tracking-normal text-muted-foreground/30 hover:text-muted-foreground/60"><X size={8} /></Button>}
                      </div>
                    </div>
                    {allAstTags.length > 0 && (
                      <div className="px-2 pb-1.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Tag size={8} className="text-muted-foreground/30 flex-shrink-0" />
                          {allAstTags.map(tag => (
                            <Button variant="ghost" type="button" key={tag} onClick={() => setAstTag(astTag === tag ? null : tag)} className={`h-auto px-0 py-0 font-normal tracking-normal px-1.5 py-px rounded-full text-xs transition-all ${astTag === tag ? "bg-foreground/10 text-foreground/70 border border-border/40" : "bg-accent/20 text-muted-foreground/50 border border-transparent hover:bg-accent/40 hover:text-muted-foreground/70"}`}>{tag}</Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <Separator className="mx-1 bg-border/20" />
                    <div className="p-1.5 pt-1 max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {filteredAssistants.length === 0 ? (
                        <div className="px-2.5 py-3 text-center text-xs text-muted-foreground/40">无匹配结果</div>
                      ) : (
                        filteredAssistants.map(a => {
                          const isActive = selectedAssistant.id === a.id
                          return (
                            <Button variant="ghost" type="button" key={a.id} onClick={() => { setSelectedAssistantId(a.id); setShowAssistantPicker(false) }} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-2 w-full px-2 py-[5px] rounded-[12px] text-[10px] transition-all duration-75 mb-px ${isActive ? "bg-accent/30 text-foreground ring-1 ring-border/30" : "text-foreground/75 hover:text-foreground hover:bg-accent/15"}`}>
                              <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center flex-shrink-0 ${isActive ? "bg-foreground/10" : "bg-accent/30"}`}>
                                <span className="text-xs leading-none">{a.emoji}</span>
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="text-[10px] text-foreground truncate">{a.name}</div>
                                <div className="text-xs text-muted-foreground/50 truncate">{a.systemPrompt.slice(0, 20)}</div>
                              </div>
                              {isActive && <Check size={10} className="text-primary flex-shrink-0" />}
                            </Button>
                          )
                        })
                      )}
                    </div>
                    <div className="border-t border-border/20 px-3 py-1.5">
                      <p className="text-xs text-muted-foreground/40 leading-relaxed">切换助手将改变 AI 的分析视角和专业能力</p>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex-1" />
                <SimpleTooltip content="清空对话"><Button variant="ghost" type="button" onClick={() => setAiMessages([])} className="h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Trash2 size={12} /></Button></SimpleTooltip>
                <SimpleTooltip content="关闭面板"><Button variant="ghost" type="button" onClick={() => setRightPanelOpen(false)} className="h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[12px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><PanelRightClose size={12} /></Button></SimpleTooltip>
              </div>

              {/* Quick Actions */}
              <div className="flex-shrink-0">
                <div className="flex items-center px-2 pt-1.5 gap-0.5">
                  {actionCategories.map(cat => {
                    const CatIcon = cat.icon
                    return (<Button variant="ghost" type="button" key={cat.id} onClick={() => setActiveActionCategory(cat.id)} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-2 py-1 rounded-[12px] text-[10px] transition-colors ${activeActionCategory === cat.id ? "bg-accent text-foreground" : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/40"}`}><CatIcon size={10} />{cat.label}</Button>)
                  })}
                  <div className="flex-1" />
                  <Button variant="ghost" type="button" onClick={() => setShowAllActions(!showAllActions)} className="h-auto px-0 py-0 font-normal tracking-normal text-[10px] text-muted-foreground/40 hover:text-foreground px-1 transition-colors">{showAllActions ? "收起" : "全部"}</Button>
                </div>
                <div className="px-2 py-1.5 flex flex-wrap gap-1">
                  {(showAllActions ? noteQuickActions : noteQuickActions.filter(a => a.category === activeActionCategory)).map(action => {
                    const AIcon = action.icon
                    return (<Button variant="ghost" type="button" key={action.id} onClick={() => handleQuickAction(action)} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-2 py-1 rounded-[12px] bg-accent/30 text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><AIcon size={10} />{action.label}</Button>)
                  })}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                {/* Current note indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] bg-primary/5 border border-primary/10">
                  <FileText size={11} className="text-primary flex-shrink-0" />
                  <span className="text-[10px] text-primary/70 truncate flex-1">当前笔记: {selectedNote?.title}</span>
                  <span className="text-[10px] leading-none flex-shrink-0">{selectedAssistant.emoji}</span>
                </div>
                {/* Empty state */}
                {aiMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/30">
                    <div className="w-10 h-10 rounded-[12px] bg-accent/40 flex items-center justify-center mb-3 opacity-60"><span className="text-[22px] leading-none">{selectedAssistant.emoji}</span></div>
                    <p className="text-xs text-muted-foreground/50 mb-1">{selectedAssistant.name}</p>
                    <p className="text-[10px] text-muted-foreground/30">{selectedAssistant.modelProvider} &middot; {selectedAssistant.model}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-3">点击上方操作或输入问题开始</p>
                  </div>
                )}
                {/* Messages */}
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-1.5`}>
                    {msg.role === "assistant" && (
                      <div className="w-5 h-5 rounded-[12px] bg-accent/40 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs leading-none">{selectedAssistant.emoji}</span></div>
                    )}
                    <div className={`max-w-[85%] rounded-[12px] px-3 py-2 text-xs leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-accent/60 text-foreground rounded-bl-sm"}`}>
                      {msg.content.split("\n").map((line, li) => {
                        if (line.startsWith("```")) return <div key={li} className="font-mono text-[10px] bg-background/50 rounded px-1.5 py-0.5 my-1 text-muted-foreground">{line.replace(/```/g, "")}</div>
                        if (line.startsWith("**") && line.endsWith("**")) return <p key={li} className="text-foreground mt-1.5 mb-0.5">{line.replace(/\*\*/g, "")}</p>
                        if (line.startsWith("- [ ] ")) return <div key={li} className="flex items-start gap-1.5 py-0.5"><span className="w-3 h-3 rounded border border-muted-foreground/30 flex-shrink-0 mt-[1px]" /><span>{line.slice(6)}</span></div>
                        if (line.startsWith("- ")) return <div key={li} className="flex items-start gap-1.5 py-0.5"><span className="text-primary mt-[2px]">&bull;</span><span>{renderBoldText(line.slice(2))}</span></div>
                        if (/^\d+\. /.test(line)) {
                          const m = line.match(/^(\d+)\. (.+)/)
                          if (m) return <div key={li} className="flex items-start gap-1.5 py-0.5"><span className="text-muted-foreground w-3 text-right flex-shrink-0">{m[1]}.</span><span>{renderBoldText(m[2])}</span></div>
                        }
                        if (/^[│├└]/.test(line)) return <div key={li} className="font-mono text-[10px] text-muted-foreground leading-tight">{line}</div>
                        if (line.trim() === "") return <div key={li} className="h-1.5" />
                        return <p key={li} className="py-0.5">{renderBoldText(line)}</p>
                      })}
                    </div>
                  </div>
                ))}
                <div ref={aiEndRef} />
              </div>

              {/* AI Input */}
              <div className="px-3 pb-3 pt-1 flex-shrink-0">
                <div className="flex items-end gap-1.5 bg-accent/40 rounded-[12px] px-3 py-2 border border-border/30 focus-within:border-primary/30 focus-within:bg-accent/60 transition-all">
                  <Textarea value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAISend() } }} placeholder={`向 ${selectedAssistant.name} 提问...`} rows={1} className="flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0 rounded-none text-xs text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[20px] max-h-[80px] p-0" />
                  <Button variant="ghost" type="button" onClick={handleAISend} disabled={!aiInput.trim()} className={`h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors ${aiInput.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground/30"}`}><Send size={11} /></Button>
                </div>
                <p className="text-xs text-muted-foreground/30 mt-1.5 text-center">{selectedAssistant.name} &middot; 基于笔记上下文 &middot; Enter 发送</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </Section>
  )
}
