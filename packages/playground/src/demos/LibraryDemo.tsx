import React, { useState, useMemo } from "react"
import {
  Input, Card, CardContent, Badge, Button,
  TreeNav, type TreeNavItem,
  ToggleGroup, ToggleGroupItem,
  Dialog, DialogContent,
  Popover, PopoverTrigger, PopoverContent,
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  Search, X, Grid3X3, List, ArrowUpDown, Plus,
  Bot, MessageCircle, Layers, Puzzle, Zap,
  FileText, Image, Code2, FolderOpen, Import, Rss,
  MoreHorizontal, Pencil, Copy, Trash2, Tag,
  Upload, Link, FolderPlus, Move,
} from "lucide-react"

// ── Types ──
interface ResourceItem {
  id: string; name: string; description: string; type: string
  avatar: string; model: string; tags: string[]
  updatedAt: string; enabled: boolean; folderId?: string
}
type ViewMode = "grid" | "list"
type SortKey = "updatedAt" | "name"
type SidebarFilter = { type: "all" } | { type: "resource"; resourceType: string } | { type: "folder"; folderId: string }

// ── Tags ──
const TAGS = [
  { id: "t1", name: "生产力", color: "#3b82f6" },
  { id: "t2", name: "写作", color: "#8b5cf6" },
  { id: "t3", name: "编程", color: "#06b6d4" },
  { id: "t4", name: "翻译", color: "#0ea5e9" },
  { id: "t5", name: "设计", color: "#a78bfa" },
]

// ── Mock Data ──
const RESOURCE_TYPES = [
  { id: "assistant", label: "助手", icon: MessageCircle },
  { id: "agent", label: "智能体", icon: Bot },
  { id: "skill", label: "技能", icon: Zap },
  { id: "plugin", label: "插件", icon: Puzzle },
]

const INITIAL_FOLDERS: TreeNavItem[] = [
  { id: "work", label: "工作项目", icon: <FolderOpen size={12} />, children: [
    { id: "work-dev", label: "开发" },
    { id: "work-design", label: "设计" },
  ]},
  { id: "personal", label: "个人", icon: <FolderOpen size={12} />, children: [
    { id: "personal-learn", label: "学习" },
  ]},
  { id: "archive", label: "归档", icon: <FolderOpen size={12} /> },
]

const MOCK_RESOURCES: ResourceItem[] = [
  { id: "1", name: "代码审查助手", description: "自动审查 PR 并提供改进建议", type: "assistant", avatar: "💬", model: "GPT-4o", tags: ["编程", "生产力"], updatedAt: "2 小时前", enabled: true, folderId: "work-dev" },
  { id: "2", name: "文档写作 Agent", description: "根据大纲自动生成技术文档", type: "agent", avatar: "🤖", model: "Claude Opus", tags: ["写作"], updatedAt: "1 天前", enabled: true, folderId: "work-dev" },
  { id: "3", name: "翻译专家", description: "多语言高质量翻译", type: "assistant", avatar: "🌐", model: "GPT-4o", tags: ["翻译"], updatedAt: "3 天前", enabled: true },
  { id: "4", name: "数据分析插件", description: "CSV/Excel 数据可视化分析", type: "plugin", avatar: "📊", model: "Claude Sonnet", tags: ["生产力"], updatedAt: "5 天前", enabled: false },
  { id: "5", name: "API 测试技能", description: "自动化 REST API 端点测试", type: "skill", avatar: "⚡", model: "GPT-4o", tags: ["编程"], updatedAt: "1 周前", enabled: true, folderId: "work-dev" },
  { id: "6", name: "学习笔记助手", description: "整理和总结学习笔记", type: "assistant", avatar: "📝", model: "Gemini Pro", tags: ["写作", "生产力"], updatedAt: "2 周前", enabled: true, folderId: "personal-learn" },
  { id: "7", name: "设计评审 Agent", description: "UI/UX 设计稿自动评审", type: "agent", avatar: "🎨", model: "Claude Opus", tags: ["设计"], updatedAt: "3 天前", enabled: true, folderId: "work-design" },
  { id: "8", name: "邮件摘要技能", description: "长邮件自动提取关键信息", type: "skill", avatar: "✉️", model: "GPT-4o", tags: ["生产力"], updatedAt: "4 天前", enabled: true },
  { id: "9", name: "产品文案生成器", description: "根据产品信息生成多风格营销文案", type: "assistant", avatar: "✍️", model: "GPT-4o", tags: ["写作"], updatedAt: "6 小时前", enabled: true },
  { id: "10", name: "智能调试 Agent", description: "分析错误日志并给出修复建议", type: "agent", avatar: "🐛", model: "Claude Opus", tags: ["编程"], updatedAt: "12 小时前", enabled: true, folderId: "work-dev" },
  { id: "11", name: "多语言校对助手", description: "检查译文的语法和流畅度", type: "assistant", avatar: "📖", model: "GPT-4o", tags: ["翻译", "写作"], updatedAt: "2 天前", enabled: true },
  { id: "12", name: "原型图生成插件", description: "从需求描述自动生成低保真原型", type: "plugin", avatar: "🖼️", model: "Claude Sonnet", tags: ["设计"], updatedAt: "1 周前", enabled: true, folderId: "work-design" },
  { id: "13", name: "SQL 查询生成技能", description: "自然语言转 SQL 查询语句", type: "skill", avatar: "🗃️", model: "GPT-4o", tags: ["编程", "生产力"], updatedAt: "4 天前", enabled: true },
  { id: "14", name: "日程管理 Agent", description: "智能安排和优化日程，自动处理冲突", type: "agent", avatar: "📅", model: "Gemini Pro", tags: ["生产力"], updatedAt: "8 小时前", enabled: true, folderId: "personal-learn" },
  { id: "15", name: "配色方案插件", description: "根据品牌色生成完整的设计配色方案", type: "plugin", avatar: "🎭", model: "Claude Sonnet", tags: ["设计"], updatedAt: "5 天前", enabled: false },
]

const SORT_LABELS: Record<SortKey, string> = { updatedAt: "最近更新", name: "名称" }

// ── Component ──
export function LibraryDemo() {
  const [resources, setResources] = useState<ResourceItem[]>(MOCK_RESOURCES)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  const [sort, setSort] = useState<SortKey>("updatedAt")
  const [filter, setFilter] = useState<SidebarFilter>({ type: "all" })
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showSort, setShowSort] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importUrl, setImportUrl] = useState("")
  const [folders, setFolders] = useState<TreeNavItem[]>(INITIAL_FOLDERS)
  const [addingFolder, setAddingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  // Tag counts
  const tagCounts = useMemo(() => {
    const c: Record<string, number> = {}
    TAGS.forEach(t => { c[t.id] = 0 })
    resources.forEach(r => r.tags.forEach(t => {
      const tag = TAGS.find(tg => tg.name === t)
      if (tag) c[tag.id] = (c[tag.id] || 0) + 1
    }))
    return c
  }, [resources])

  // Derived
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {}
    resources.forEach(r => { c[r.type] = (c[r.type] || 0) + 1 })
    return c
  }, [resources])

  const filtered = useMemo(() => {
    let list = resources
    if (filter.type === "resource") list = list.filter(r => r.type === filter.resourceType)
    if (filter.type === "folder") list = list.filter(r => r.folderId === filter.folderId || r.folderId?.startsWith(filter.folderId))
    if (activeTag) list = list.filter(r => r.tags.includes(activeTag))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "zh") : 0)
  }, [resources, filter, activeTag, search, sort])

  const sidebarItemCls = (f: SidebarFilter) => {
    const active = (filter.type === "all" && f.type === "all") ||
      (filter.type === "resource" && f.type === "resource" && filter.resourceType === (f as any).resourceType) ||
      (filter.type === "folder" && f.type === "folder" && filter.folderId === (f as any).folderId)
    return `flex items-center gap-2 w-full px-2.5 py-[6px] rounded-[12px] text-xs tracking-tight transition-all cursor-pointer ${
      active ? "bg-accent/70 text-foreground" : "text-muted-foreground/70 hover:text-foreground hover:bg-accent/35"
    }`
  }

  const handleContextAction = (action: string, resourceId: string) => {
    if (action === "delete") setResources(prev => prev.filter(r => r.id !== resourceId))
    if (action === "copy") {
      const src = resources.find(r => r.id === resourceId)
      if (src) setResources(prev => [{ ...src, id: `r-${Date.now()}`, name: `${src.name} (副本)` }, ...prev])
    }
    if (action === "edit") {
      const newName = prompt("重命名:", resources.find(r => r.id === resourceId)?.name)
      if (newName) setResources(prev => prev.map(r => r.id === resourceId ? { ...r, name: newName } : r))
    }
    if (action === "move") {
      const folder = prompt("移动到文件夹:", "默认")
      if (folder) setResources(prev => prev.map(r => r.id === resourceId ? { ...r, folder } : r))
    }
  }

  const handleImport = () => {
    const newR: ResourceItem = {
      id: `r-${Date.now()}`, name: importUrl.trim() || "导入的资源",
      description: "通过导入添加的新资源", type: "prompt", avatar: "📥",
      model: "GPT-4o", tags: ["生产力"], updatedAt: "刚刚", enabled: true,
    }
    setResources(prev => [newR, ...prev])
    setImportUrl("")
    setShowImport(false)
  }

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      const id = `folder-${Date.now()}`
      setFolders(prev => [...prev, { id, label: newFolderName.trim(), icon: <FolderOpen size={12} /> }])
      setNewFolderName("")
      setAddingFolder(false)
    }
  }

  return (
    <Section title="Resource Library" install="npm install @cherry-studio/ui" props={[
      { name: "resources", type: "ResourceItem[]", default: "[]", description: "资源列表" },
      { name: "view", type: '"grid" | "list"', default: '"grid"', description: "布局模式" },
      { name: "sortBy", type: '"updatedAt" | "name"', default: '"updatedAt"', description: "排序方式" },
    ]}>
      <div className="flex gap-0 min-h-[480px] border rounded-[24px] overflow-hidden bg-background">
        {/* ── Sidebar ── */}
        <div className="w-[200px] shrink-0 border-r border-border/30 flex flex-col bg-background/50">
          <div className="px-4 pt-5 pb-3">
            <h2 className="text-sm text-foreground tracking-tight font-medium">资源库</h2>
            <p className="text-xs text-muted-foreground/50 mt-0.5">管理你的 AI 资源</p>
          </div>

          <div className="flex-1 overflow-y-auto px-2.5 pb-2">
            {/* All */}
            <div className="mb-1">
              <Button variant="ghost" size="sm" onClick={() => setFilter({ type: "all" })} className={sidebarItemCls({ type: "all" })}>
                <Layers size={12} strokeWidth={1.6} />
                <span className="flex-1 text-left">所有资源</span>
                <span className="text-xs text-muted-foreground/35 tabular-nums">{resources.length}</span>
              </Button>
            </div>

            {/* Resource Types */}
            <div className="mb-3">
              {RESOURCE_TYPES.map(rt => (
                <Button key={rt.id} variant="ghost" size="sm" onClick={() => setFilter({ type: "resource", resourceType: rt.id })} className={sidebarItemCls({ type: "resource", resourceType: rt.id })}>
                  <rt.icon size={12} strokeWidth={1.6} />
                  <span className="flex-1 text-left">{rt.label}</span>
                  {typeCounts[rt.id] != null && <span className="text-xs text-muted-foreground/35 tabular-nums">{typeCounts[rt.id]}</span>}
                </Button>
              ))}
            </div>

            <div className="h-px bg-border/10 mx-1 mb-3" />

            {/* Folders */}
            <div className="mb-3">
              <div className="flex items-center px-2 py-1">
                <span className="text-xs text-muted-foreground/50 uppercase tracking-wider flex-1">文件夹</span>
                <Button variant="ghost" size="icon-xs" onClick={() => setAddingFolder(true)} className="w-4 h-4 text-muted-foreground/30 hover:text-foreground">
                  <FolderPlus size={10} />
                </Button>
              </div>
              {addingFolder && (
                <div className="flex items-center gap-1 px-2 mb-1">
                  <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddFolder(); if (e.key === "Escape") { setAddingFolder(false); setNewFolderName("") } }}
                    placeholder="文件夹名称"
                    autoFocus
                    className="flex-1 h-6 px-1.5 py-1 text-[10px] border-border/40 bg-accent/20 shadow-none focus-visible:ring-0" />
                  <Button variant="ghost" size="icon-xs" onClick={handleAddFolder} className="text-foreground/60 hover:text-foreground">
                    <Plus size={10} />
                  </Button>
                </div>
              )}
              <TreeNav
                items={folders}
                activeId={filter.type === "folder" ? filter.folderId : undefined}
                onSelect={(id) => setFilter(filter.type === "folder" && filter.folderId === id ? { type: "all" } : { type: "folder", folderId: id })}
              />
            </div>

            <div className="h-px bg-border/10 mx-1 mb-3" />

            {/* Tags */}
            <div className="mb-3">
              <div className="flex items-center px-2 py-1">
                <span className="text-xs text-muted-foreground/50 uppercase tracking-wider flex-1">标签</span>
              </div>
              {TAGS.map(tag => (
                <Button key={tag.id} variant="ghost" size="sm"
                  onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
                  className={`justify-start gap-2 w-full px-2.5 py-[5px] text-xs tracking-tight ${activeTag === tag.name ? "bg-accent/70 text-foreground" : "text-muted-foreground/70 hover:text-foreground hover:bg-accent/35"}`}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="flex-1 text-left">{tag.name}</span>
                  <span className="text-xs text-muted-foreground/35 tabular-nums">{tagCounts[tag.id] || 0}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="shrink-0 border-t border-border/30 p-2.5 space-y-0.5">
            <Button variant="ghost" size="sm" onClick={() => setShowImport(true)} className="justify-start gap-2 w-full px-2.5 py-[6px] text-xs text-muted-foreground/45 hover:text-foreground hover:bg-accent/35">
              <Import size={12} strokeWidth={1.6} /><span>导入配置</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => alert("已订阅资源库更新")} className="justify-start gap-2 w-full px-2.5 py-[6px] text-xs text-muted-foreground/45 hover:text-foreground hover:bg-accent/35">
              <Rss size={12} strokeWidth={1.6} /><span>订阅资源库</span>
            </Button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col shrink-0 border-b border-border/40">
            <div className="flex items-center gap-2 px-5 py-3">
              {/* Search */}
              <div className="relative flex-1 max-w-[260px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索资源名称、描述..."
                  className="pl-7 pr-7 h-8 text-xs border-border/40 bg-accent/20" />
                {search && (
                  <Button variant="ghost" size="icon-xs" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                    <X size={10} />
                  </Button>
                )}
              </div>

              {/* Sort */}
              <Popover open={showSort} onOpenChange={setShowSort}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="xs"
                    className="gap-1.5 text-[10px] border-border/40 text-muted-foreground/60 hover:text-foreground">
                    <ArrowUpDown size={10} />{SORT_LABELS[sort]}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="rounded-[12px] p-1 min-w-[110px] w-auto" align="start" sideOffset={4}>
                  {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
                    <Button key={k} variant="ghost" size="xs" onClick={() => { setSort(k); setShowSort(false) }}
                      className={`w-full justify-start px-2.5 py-[5px] text-[10px] tracking-tight ${sort === k ? "bg-accent text-foreground" : "text-muted-foreground/70 hover:bg-accent/50 hover:text-foreground"}`}>
                      {SORT_LABELS[k]}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* View toggle */}
              <ToggleGroup type="single" value={view} onValueChange={v => v && setView(v as ViewMode)}>
                <ToggleGroupItem value="grid" className="h-7 w-7 p-0"><Grid3X3 size={13} /></ToggleGroupItem>
                <ToggleGroupItem value="list" className="h-7 w-7 p-0"><List size={13} /></ToggleGroupItem>
              </ToggleGroup>

              <div className="flex-1" />

              {/* Import */}
              <Button variant="outline" size="xs" className="gap-1 text-[10px]" onClick={() => setShowImport(true)}>
                <Import size={11} />导入
              </Button>

              {/* Create */}
              <Button size="xs" className="gap-1"><Plus size={12} />新建</Button>
            </div>

            {/* Active tag indicator */}
            {activeTag && (
              <div className="flex items-center gap-1.5 px-5 pb-2.5">
                <Tag size={10} className="text-muted-foreground/40 shrink-0" />
                <Badge variant="default" className="cursor-pointer text-[10px] px-2 py-0 gap-1" onClick={() => setActiveTag(null)}>
                  {activeTag}<X size={8} />
                </Badge>
              </div>
            )}
          </div>

          {/* Resource Grid/List */}
          <div className="flex-1 overflow-y-auto p-5">
            {filtered.length > 0 ? (
              <div className={view === "grid" ? "grid grid-cols-2 xl:grid-cols-3 gap-3" : "space-y-1.5"}>
                {filtered.map(r => {
                  const typeConfig = RESOURCE_TYPES.find(rt => rt.id === r.type)
                  const TypeIcon = typeConfig?.icon || FileText
                  const menuContent = (
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleContextAction("edit", r.id)}>
                        <Pencil size={12} className="mr-2 text-muted-foreground" />编辑
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextAction("copy", r.id)}>
                        <Copy size={12} className="mr-2 text-muted-foreground" />复制
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextAction("move", r.id)}>
                        <Move size={12} className="mr-2 text-muted-foreground" />移动到...
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => handleContextAction("delete", r.id)} className="text-destructive">
                        <Trash2 size={12} className="mr-2" />删除
                      </ContextMenuItem>
                    </ContextMenuContent>
                  )
                  return view === "grid" ? (
                    <ContextMenu key={r.id}>
                      <ContextMenuTrigger asChild>
                        <div className="group rounded-[12px] border border-border/30 bg-card p-3.5 hover:border-border/60 hover:shadow-sm transition-all cursor-pointer">
                          <div className="flex items-start gap-3 mb-2.5">
                            <div className="w-9 h-9 rounded-[10px] bg-accent/50 flex items-center justify-center text-lg shrink-0">{r.avatar}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium tracking-tight truncate">{r.name}</p>
                              <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                                <TypeIcon size={9} />{typeConfig?.label} · {r.model}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                              <MoreHorizontal size={13} />
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground/50 line-clamp-2 mb-2.5 leading-relaxed">{r.description}</p>
                          <div className="flex items-center gap-1.5">
                            {r.tags.slice(0, 2).map(t => {
                              const tagDef = TAGS.find(tg => tg.name === t)
                              return (
                                <Badge key={t} variant="outline" className="text-xs px-1.5 py-0 gap-1">
                                  {tagDef && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagDef.color }} />}
                                  {t}
                                </Badge>
                              )
                            })}
                            <span className="flex-1" />
                            <span className="text-xs text-muted-foreground/35">{r.updatedAt}</span>
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      {menuContent}
                    </ContextMenu>
                  ) : (
                    <ContextMenu key={r.id}>
                      <ContextMenuTrigger asChild>
                        <div className="group flex items-center gap-3 px-3 py-2 rounded-[12px] hover:bg-accent/30 transition-colors cursor-pointer">
                          <div className="w-8 h-8 rounded-[10px] bg-accent/50 flex items-center justify-center text-base shrink-0">{r.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium tracking-tight truncate">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground/50 truncate">{r.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {r.tags.slice(0, 1).map(t => {
                              const tagDef = TAGS.find(tg => tg.name === t)
                              return (
                                <Badge key={t} variant="outline" className="text-xs px-1.5 py-0 gap-1">
                                  {tagDef && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagDef.color }} />}
                                  {t}
                                </Badge>
                              )
                            })}
                            <span className="text-xs text-muted-foreground/35 w-16 text-right">{r.updatedAt}</span>
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      {menuContent}
                    </ContextMenu>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={24} className="text-muted-foreground/40 mb-3" />
                <p className="text-xs text-muted-foreground/50">未找到资源</p>
                <p className="text-[10px] text-muted-foreground/30 mt-1">尝试调整搜索或筛选条件</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Import Modal ── */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-[420px]">
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium text-foreground mb-1">导入资源</h3>
              <p className="text-xs text-muted-foreground/50">从文件或 URL 导入资源配置</p>
            </div>

            {/* Drop zone */}
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-[12px] border-2 border-dashed border-border/30 bg-accent/10 hover:border-border/50 hover:bg-accent/20 transition-all cursor-pointer">
              <Upload size={24} className="text-muted-foreground/50 mb-2.5" />
              <p className="text-xs text-muted-foreground/50 mb-1">拖拽文件或点击选择</p>
              <p className="text-[10px] text-muted-foreground/30">支持 JSON, YAML, Markdown</p>
            </div>

            {/* URL input */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Link size={10} className="text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/40">或者输入 URL</span>
              </div>
              <Input value={importUrl} onChange={e => setImportUrl(e.target.value)}
                placeholder="https://example.com/resource.json"
                className="h-8 text-xs" />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="xs" onClick={() => { setShowImport(false); setImportUrl("") }}>取消</Button>
              <Button size="xs" className="gap-1" onClick={handleImport}>
                <Import size={10} />导入
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  )
}
