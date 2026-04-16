import React, { useState } from "react"
import {
  Button, Input, Dialog, DialogContent,
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@cherry-studio/ui"
import {
  Puzzle, Plus, SlidersHorizontal, Search, X,
  Globe, EyeOff, Eye, Copy, PenLine, Link, Trash2, RotateCcw,
} from "lucide-react"
import { Section, type PropDef } from "../components/Section"

// ===========================
// Categories
// ===========================
type AppCategory = "all" | "chat" | "tool" | "search" | "creative"

const CATEGORY_TABS: { id: AppCategory; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "chat", label: "对话" },
  { id: "tool", label: "工具" },
  { id: "search", label: "搜索" },
  { id: "creative", label: "创作" },
]

// ===========================
// Data (matching src/features/miniapp/MiniAppsPage)
// ===========================
const MINI_APPS = [
  { id: "chatgpt", name: "ChatGPT", color: "#10a37f", initial: "G", category: "chat" as const },
  { id: "gemini", name: "Gemini", color: "#4285f4", initial: "✦", category: "chat" as const },
  { id: "claude", name: "Claude", color: "#d97706", initial: "C", category: "chat" as const },
  { id: "deepseek", name: "DeepSeek", color: "#4f6ef7", initial: "DS", category: "chat" as const },
  { id: "kimi", name: "Kimi", color: "#1a1a2e", initial: "K", category: "chat" as const },
  { id: "doubao", name: "豆包", color: "#4fc3f7", initial: "豆", category: "chat" as const },
  { id: "tongyi", name: "通义千问", color: "#6d28d9", initial: "通", category: "chat" as const },
  { id: "zhipu", name: "智谱清言", color: "#3b5998", initial: "智", category: "chat" as const },
  { id: "perplexity", name: "Perplexity", color: "#1e40af", initial: "P", category: "search" as const },
  { id: "poe", name: "Poe", color: "#7c3aed", initial: "P", category: "chat" as const },
  { id: "groq", name: "Groq", color: "#f97316", initial: "G", category: "tool" as const },
  { id: "siliconflow", name: "SiliconFlow", color: "#3b82f6", initial: "SF", category: "tool" as const },
  { id: "hailuoai", name: "海螺", color: "#ff6b35", initial: "螺", category: "creative" as const },
  { id: "coze", name: "Coze", color: "#6366f1", initial: "C", category: "tool" as const },
  { id: "dify", name: "Dify", color: "#2563eb", initial: "D", category: "tool" as const },
  { id: "bolt", name: "bolt", color: "#1a1a2e", initial: "b", category: "tool" as const },
  { id: "n8n", name: "n8n", color: "#ea580c", initial: "n8n", category: "tool" as const },
  { id: "notebooklm", name: "NotebookLM", color: "#f59e0b", initial: "NL", category: "tool" as const },
  { id: "grok", name: "Grok", color: "#1a1a2e", initial: "X", category: "chat" as const },
  { id: "wps", name: "WPS灵犀", color: "#ef4444", initial: "W", category: "creative" as const },
  { id: "baichuan", name: "百小应", color: "#f59e0b", initial: "百", category: "chat" as const },
  { id: "wenxin", name: "文心一言", color: "#2563eb", initial: "文", category: "chat" as const },
  { id: "mita", name: "秘塔AI搜索", color: "#8b5cf6", initial: "秘", category: "search" as const },
  { id: "qwenchat", name: "QwenChat", color: "#6d28d9", initial: "Q", category: "chat" as const },
  { id: "tiangong", name: "天工AI", color: "#0ea5e9", initial: "天", category: "search" as const },
  { id: "yiyan", name: "通义万相", color: "#a855f7", initial: "万", category: "creative" as const },
  { id: "minimax", name: "MiniMax", color: "#14b8a6", initial: "M", category: "chat" as const },
  { id: "zhihu", name: "知乎直答", color: "#0066ff", initial: "知", category: "search" as const },
  { id: "copilot", name: "Copilot", color: "#2563eb", initial: "Co", category: "tool" as const },
  { id: "cursor", name: "Cursor", color: "#6366f1", initial: "Cu", category: "tool" as const },
  { id: "midjourney", name: "Midjourney", color: "#1a1a2e", initial: "MJ", category: "creative" as const },
  { id: "suno", name: "Suno", color: "#ec4899", initial: "S", category: "creative" as const },
  { id: "runway", name: "Runway", color: "#06b6d4", initial: "R", category: "creative" as const },
  { id: "gamma", name: "Gamma", color: "#8b5cf6", initial: "Γ", category: "creative" as const },
  { id: "you", name: "You.com", color: "#6d28d9", initial: "Y", category: "search" as const },
  { id: "tavily", name: "Tavily", color: "#059669", initial: "T", category: "search" as const },
  { id: "phind", name: "Phind", color: "#3b82f6", initial: "Ph", category: "search" as const },
  { id: "v0", name: "v0.dev", color: "#1a1a2e", initial: "v0", category: "tool" as const },
  { id: "lobe", name: "LobeChat", color: "#0ea5e9", initial: "L", category: "chat" as const },
  { id: "character", name: "Character.AI", color: "#7c3aed", initial: "CA", category: "chat" as const },
]

interface CustomApp {
  id: string; name: string; color: string; initial: string
  isCustom?: boolean; category: "chat" | "tool" | "search" | "creative"
}

// ===========================
// Props
// ===========================
const miniAppsProps: PropDef[] = [
  { name: "apps", type: "MiniApp[]", default: "[]", description: "List of mini applications" },
  { name: "onOpenApp", type: "(appId: string) => void", default: "-", description: "Open app handler" },
  { name: "searchTerm", type: "string", default: '""', description: "Search filter" },
  { name: "category", type: '"all"|"chat"|"tool"|"search"|"creative"', default: '"all"', description: "Category filter" },
]

// ===========================
// Main Demo
// ===========================
export function MiniAppsDemo() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<AppCategory>("all")
  const [customApps, setCustomApps] = useState<CustomApp[]>([])
  const [hiddenApps, setHiddenApps] = useState<Set<string>>(new Set())
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [formName, setFormName] = useState("")
  const [formUrl, setFormUrl] = useState("")
  const [editingApp, setEditingApp] = useState<CustomApp | null>(null)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; appId: string } | null>(null)

  const allApps: CustomApp[] = [...MINI_APPS, ...customApps]
  const displayedApps = allApps.filter(a => {
    if (hiddenApps.has(a.id)) return false
    if (activeCategory !== "all" && a.category !== activeCategory) return false
    if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const visibleApps = allApps.filter(a => !hiddenApps.has(a.id))
  const hiddenAppList = allApps.filter(a => hiddenApps.has(a.id))

  const saveApp = () => {
    if (!formName.trim() || !formUrl.trim()) return
    const colorPool = ["#10a37f", "#6366f1", "#f97316", "#8b5cf6", "#ef4444", "#2563eb", "#ec4899", "#059669"]
    if (editingApp) {
      setCustomApps(prev => prev.map(a => a.id === editingApp.id ? { ...a, name: formName.trim(), initial: formName.trim().charAt(0).toUpperCase() } : a))
    } else {
      const newApp: CustomApp = {
        id: `custom-${Date.now()}`, name: formName.trim(),
        color: colorPool[Math.floor(Math.random() * colorPool.length)],
        initial: formName.trim().charAt(0).toUpperCase(), isCustom: true, category: "tool",
      }
      setCustomApps(prev => [...prev, newApp])
    }
    setFormName(""); setFormUrl(""); setEditingApp(null); setShowAddDialog(false)
  }

  const deleteApp = (id: string) => {
    setCustomApps(prev => prev.filter(a => a.id !== id))
    setCtxMenu(null)
  }

  const openEditDialog = (app: CustomApp) => {
    setEditingApp(app)
    setFormName(app.name)
    setFormUrl("https://example.com")
    setShowAddDialog(true)
    setCtxMenu(null)
  }

  const isCustomApp = (id: string) => customApps.some(a => a.id === id)

  return (
    <Section title="Mini Apps Module" install="npm install @cherry-studio/ui" props={miniAppsProps} code={`// Header + Category tabs + Search + App Grid (8 cols) + Settings Sheet
<div className="grid grid-cols-8 gap-x-2 gap-y-4">
  {apps.map(app => (
    <button key={app.id} className="flex flex-col items-center gap-1.5 group">
      <AppIcon app={app} />
      <span>{app.name}</span>
    </button>
  ))}
  <button className="border-dashed"><Plus /> 自定义</button>
</div>`}>
      <div className="rounded-[24px] border bg-background overflow-hidden" onClick={() => setCtxMenu(null)}>
        {/* Header */}
        <div className="h-11 flex items-center justify-between px-4 flex-shrink-0 border-b border-border/30">
          <div className="flex items-center gap-1.5 text-xs tracking-tight">
            <Puzzle size={13} className="text-muted-foreground" />
            <span className="text-foreground">小程序</span>
            <span className="text-[11px] text-muted-foreground/40 ml-1">{displayedApps.length} 个</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={() => setShowAddDialog(true)}><Plus size={14} /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => setShowSettings(true)}><SlidersHorizontal size={14} /></Button>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="px-6 pt-2 pb-0.5 flex items-center gap-0.5">
          {CATEGORY_TABS.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveCategory(tab.id)}
              className={`h-auto px-2.5 py-1 rounded-[10px] text-[11px] tracking-tight font-normal ${activeCategory === tab.id ? "bg-accent text-foreground font-medium" : "text-muted-foreground/50 hover:text-foreground"}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 py-2">
          <div className="relative max-w-md mx-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索小程序…"
              className="w-full pl-8 pr-7 py-1.5 h-auto rounded-[12px] border-[1.5px] border-input bg-input-background text-xs text-foreground placeholder:text-muted-foreground/30 focus-visible:border-ring/30 transition-colors tracking-tight"
            />
            {searchTerm && (
              <Button variant="ghost" onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 h-auto p-0 text-muted-foreground/30 hover:text-muted-foreground">
                <X size={12} />
              </Button>
            )}
          </div>
        </div>

        {/* App grid (8 cols matching original) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[320px]">
          <div className="max-w-3xl mx-auto">
            {displayedApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/30">
                <Search size={24} className="mb-2" />
                <span className="text-[13px] tracking-tight">{searchTerm ? "没有找到匹配的小程序" : "暂无小程序"}</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-4">
                {displayedApps.map(app => (
                  <Button
                    key={app.id}
                    variant="ghost"
                    onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, appId: app.id }) }}
                    className="flex flex-col items-center gap-1.5 h-auto p-1.5 font-normal tracking-normal group relative"
                  >
                    <div className="transition-transform group-hover:scale-110 shadow-sm">
                      <div
                        className="w-11 h-11 rounded-[12px] flex items-center justify-center text-primary-foreground text-[11px] font-medium"
                        style={{ background: app.color }}
                      >
                        {app.initial}
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[60px] tracking-tight">
                      {app.name}
                    </span>
                    {app.isCustom && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-foreground/80 flex items-center justify-center">
                        <PenLine size={7} className="text-primary-foreground" />
                      </div>
                    )}
                  </Button>
                ))}
                {/* Add custom button */}
                <Button variant="ghost" onClick={() => setShowAddDialog(true)} className="flex flex-col items-center gap-1.5 h-auto p-1.5 font-normal tracking-normal group">
                  <div className="w-11 h-11 rounded-[12px] flex items-center justify-center border border-dashed border-border/60 text-muted-foreground/40 group-hover:border-foreground/30 group-hover:text-foreground/60 transition-colors">
                    <Plus size={16} />
                  </div>
                  <span className="text-[11px] text-muted-foreground/40 group-hover:text-muted-foreground transition-colors tracking-tight">自定义</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Context menu */}
        {ctxMenu && (
          <div
            className="fixed z-[60] bg-card rounded-[16px] border border-border/30 shadow-popover py-1 min-w-[140px]"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
            onClick={e => e.stopPropagation()}
          >
            <Button variant="ghost" onClick={() => setCtxMenu(null)} className="w-full justify-start gap-2.5 h-auto px-3 py-1.5 text-[11px] font-normal text-foreground tracking-tight">
              <Globe size={12} className="text-muted-foreground" /> 打开
            </Button>
            <Button variant="ghost" onClick={() => { setHiddenApps(prev => new Set(prev).add(ctxMenu.appId)); setCtxMenu(null) }} className="w-full justify-start gap-2.5 h-auto px-3 py-1.5 text-[11px] font-normal text-foreground tracking-tight">
              <EyeOff size={12} className="text-muted-foreground" /> 隐藏
            </Button>
            <Button variant="ghost" onClick={() => setCtxMenu(null)} className="w-full justify-start gap-2.5 h-auto px-3 py-1.5 text-[11px] font-normal text-foreground tracking-tight">
              <Copy size={12} className="text-muted-foreground" /> 复制链接
            </Button>
            {isCustomApp(ctxMenu.appId) && (
              <>
                <div className="my-1 h-px bg-border/30 mx-2" />
                <Button variant="ghost" onClick={() => { const app = customApps.find(a => a.id === ctxMenu.appId); if (app) openEditDialog(app) }} className="w-full justify-start gap-2.5 h-auto px-3 py-1.5 text-[11px] font-normal text-foreground tracking-tight">
                  <PenLine size={12} className="text-muted-foreground" /> 编辑
                </Button>
                <Button variant="ghost" onClick={() => deleteApp(ctxMenu.appId)} className="w-full justify-start gap-2.5 h-auto px-3 py-1.5 text-[11px] font-normal text-destructive tracking-tight">
                  <Trash2 size={12} /> 删除
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-[320px] p-0">
          <SheetHeader className="px-4 py-3 border-b border-border/30">
            <SheetTitle className="text-[14px] tracking-tight">管理小程序</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* Visible apps */}
            <div>
              <p className="text-[11px] text-muted-foreground/50 mb-2 tracking-tight">已显示 ({visibleApps.length})</p>
              <div className="space-y-0.5">
                {visibleApps.map(app => (
                  <div key={app.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-[10px] hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-primary-foreground text-[9px] font-medium" style={{ background: app.color }}>{app.initial}</div>
                      <span className="text-[12px] text-foreground tracking-tight">{app.name}</span>
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={() => setHiddenApps(prev => new Set(prev).add(app.id))}>
                      <EyeOff size={12} className="text-muted-foreground/40" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            {/* Hidden apps */}
            {hiddenAppList.length > 0 && (
              <div>
                <p className="text-[11px] text-muted-foreground/50 mb-2 tracking-tight">已隐藏 ({hiddenAppList.length})</p>
                <div className="space-y-0.5">
                  {hiddenAppList.map(app => (
                    <div key={app.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-[10px] hover:bg-accent/50 transition-colors opacity-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-primary-foreground text-[9px] font-medium" style={{ background: app.color }}>{app.initial}</div>
                        <span className="text-[12px] text-foreground tracking-tight">{app.name}</span>
                      </div>
                      <Button variant="ghost" size="icon-xs" onClick={() => setHiddenApps(prev => { const n = new Set(prev); n.delete(app.id); return n })}>
                        <Eye size={12} className="text-muted-foreground/40" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Reset button */}
            <Button variant="outline" size="sm" className="w-full" onClick={() => setHiddenApps(new Set())}>
              <RotateCcw size={12} className="mr-1.5" /> 恢复默认
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add / Edit custom app dialog */}
      <Dialog open={showAddDialog} onOpenChange={open => { if (!open) { setShowAddDialog(false); setEditingApp(null); setFormName(""); setFormUrl("") } }}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <h3 className="text-[15px] font-medium tracking-tight">{editingApp ? "编辑小程序" : "添加自定义小程序"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block tracking-tight">名称</label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="小程序名称" className="h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block tracking-tight">URL</label>
                <div className="relative">
                  <Link size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <Input value={formUrl} onChange={e => setFormUrl(e.target.value)} placeholder="https://example.com" className="h-9 pl-8" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => { setShowAddDialog(false); setEditingApp(null); setFormName(""); setFormUrl("") }}>取消</Button>
              <Button size="sm" onClick={saveApp} disabled={!formName.trim() || !formUrl.trim()}>{editingApp ? "保存" : "添加"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  )
}
