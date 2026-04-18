import React, { useState } from "react"
import { Button, Badge, Switch, Dialog, DialogContent, Input, Tabs, TabsList, TabsTrigger, TabsContent } from "@cherry-studio/ui"
import {
  Search, X, Download, RefreshCw,
  Star, Wrench, Package, Blocks,
  CheckCircle2, AlertTriangle, XCircle, Loader2,
} from "lucide-react"
import { Section, type PropDef } from "../components/Section"

// ===========================
// Types (matching src/features/extensions)
// ===========================
type ExtensionTab = "installed" | "marketplace" | "dependencies"
type ExtensionCategory = "all" | "official" | "community"

interface Extension {
  id: string; name: string; icon: string; description: string; author: string
  version: string; size: string; category: "official" | "community"
  enabled: boolean; status: "installed" | "update-available"
  rating?: number; downloads?: number; mcpTools?: string[]
}

// ===========================
// Dependencies data
// ===========================
type DepStatus = "ready" | "outdated" | "missing" | "installing"
type DepType = "binary" | "npm" | "pip"

interface Dependency {
  id: string; name: string; type: DepType; currentVersion: string; latestVersion: string; status: DepStatus
}

const INITIAL_DEPS: Dependency[] = [
  { id: "nodejs", name: "Node.js", type: "binary", currentVersion: "v22.1.0", latestVersion: "v22.1.0", status: "ready" },
  { id: "python", name: "Python", type: "binary", currentVersion: "3.12", latestVersion: "3.12", status: "ready" },
  { id: "uvx", name: "uvx", type: "binary", currentVersion: "0.7.2", latestVersion: "0.7.2", status: "ready" },
  { id: "anthropic-sdk", name: "@anthropic-ai/sdk", type: "npm", currentVersion: "4.0.2", latestVersion: "4.1.0", status: "outdated" },
  { id: "chromadb", name: "chromadb", type: "pip", currentVersion: "-", latestVersion: "0.5.20", status: "missing" },
  { id: "sentence-transformers", name: "sentence-transformers", type: "pip", currentVersion: "3.4.1", latestVersion: "3.4.1", status: "ready" },
]

// ===========================
// Mock Data (matching ExtensionsData)
// ===========================
const INSTALLED: Extension[] = [
  { id: "web-search", name: "Web Search", icon: "🌐", description: "集成多个搜索引擎，为 AI 提供实时联网搜索能力", author: "Cherry Team", version: "2.3.0", size: "1.2 MB", category: "official", enabled: true, status: "installed", mcpTools: ["web_search", "scrape_url"] },
  { id: "code-runner", name: "Code Runner", icon: "🚀", description: "在安全沙箱中执行 Python/JS/Shell 代码并返回结果", author: "Cherry Team", version: "1.8.2", size: "3.4 MB", category: "official", enabled: true, status: "update-available", mcpTools: ["run_code", "run_shell"] },
  { id: "file-manager", name: "File Manager", icon: "📂", description: "文件系统操作：读取、写入、列目录、搜索文件", author: "Cherry Team", version: "1.5.1", size: "0.8 MB", category: "official", enabled: false, status: "installed", mcpTools: ["read_file", "write_file", "list_dir"] },
  { id: "image-gen", name: "Image Generator", icon: "🎨", description: "集成 DALL·E / Midjourney / Stable Diffusion 图像生成", author: "Community", version: "0.9.4", size: "2.1 MB", category: "community", enabled: true, status: "installed" },
  { id: "db-query", name: "Database Query", icon: "🗄️", description: "连接 MySQL/PostgreSQL/SQLite 执行 SQL 查询", author: "DataLab", version: "1.2.0", size: "1.5 MB", category: "community", enabled: false, status: "installed", mcpTools: ["query_db"] },
  { id: "browser-ctrl", name: "Browser Control", icon: "🖥️", description: "通过 Playwright 控制浏览器，自动化网页操作和截屏", author: "AutoWeb", version: "1.3.0", size: "8.6 MB", category: "community", enabled: true, status: "installed", mcpTools: ["navigate", "click", "fill", "screenshot"] },
  { id: "audio-player", name: "Audio Player", icon: "🎵", description: "TTS 语音播放、音频转写，支持多种语音引擎", author: "Cherry Team", version: "1.0.1", size: "2.8 MB", category: "official", enabled: false, status: "installed", mcpTools: ["play_tts", "transcribe"] },
  { id: "knowledge-base", name: "Knowledge Base", icon: "📚", description: "知识库检索和文档管理，支持向量搜索", author: "Cherry Team", version: "2.0.0", size: "3.2 MB", category: "official", enabled: true, status: "installed", mcpTools: ["search_kb", "add_doc", "list_collections"] },
  { id: "git-helper", name: "Git Helper", icon: "🔀", description: "Git 操作辅助：查看 diff、提交历史、自动生成 commit message", author: "DevTools", version: "0.8.0", size: "1.4 MB", category: "community", enabled: true, status: "update-available", mcpTools: ["git_diff", "git_log", "git_commit"] },
]

const MARKETPLACE: Extension[] = [
  { id: "pdf-reader", name: "PDF Reader Pro", icon: "📄", description: "高质量 PDF 解析，支持表格提取和 OCR 识别", author: "DocAI", version: "2.0.0", size: "4.2 MB", category: "official", enabled: false, status: "installed", rating: 4.8, downloads: 12500 },
  { id: "email-sender", name: "Email Sender", icon: "📧", description: "通过 SMTP/Gmail API 发送邮件", author: "MailKit", version: "1.0.2", size: "0.5 MB", category: "community", enabled: false, status: "installed", rating: 4.2, downloads: 3400 },
  { id: "calendar", name: "Calendar Sync", icon: "📅", description: "同步 Google Calendar / Outlook 日程", author: "Cherry Team", version: "1.1.0", size: "1.8 MB", category: "official", enabled: false, status: "installed", rating: 4.6, downloads: 6100 },
  { id: "notion-sync", name: "Notion Sync", icon: "📝", description: "双向同步 Notion 页面和数据库", author: "Community", version: "0.8.0", size: "2.3 MB", category: "community", enabled: false, status: "installed", rating: 4.3, downloads: 5200 },
  { id: "slack-bridge", name: "Slack Bridge", icon: "💬", description: "在 Slack 频道中直接使用 AI 助手，支持线程对话", author: "SlackDev", version: "1.2.0", size: "1.1 MB", category: "community", enabled: false, status: "installed", rating: 4.4, downloads: 7800, mcpTools: ["send_message", "read_channel"] },
  { id: "jira-connect", name: "Jira Connect", icon: "📋", description: "管理 Jira Issue，自动创建和更新任务状态", author: "AtlassianDev", version: "0.9.1", size: "1.6 MB", category: "community", enabled: false, status: "installed", rating: 4.1, downloads: 4300, mcpTools: ["create_issue", "update_issue", "search_issues"] },
]

function formatDownloads(n: number) { return n >= 10000 ? (n / 10000).toFixed(1) + "w" : n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n) }

const extProps: PropDef[] = [
  { name: "tab", type: '"installed" | "marketplace" | "dependencies"', default: '"installed"', description: "Active tab" },
  { name: "extensions", type: "Extension[]", default: "[]", description: "Extension list" },
  { name: "onInstall", type: "(id: string) => void", default: "-", description: "Install handler" },
  { name: "onToggle", type: "(id: string) => void", default: "-", description: "Enable/disable handler" },
]

// ===========================
// Status helpers
// ===========================
const STATUS_CONFIG: Record<DepStatus, { label: string; icon: React.ReactNode; color: string; badgeClass: string }> = {
  ready: { label: "就绪", icon: <CheckCircle2 size={12} />, color: "text-accent-green", badgeClass: "text-accent-green border-accent-green/20 bg-accent-green-muted" },
  outdated: { label: "可更新", icon: <AlertTriangle size={12} />, color: "text-accent-amber", badgeClass: "text-accent-amber border-accent-amber/20 bg-accent-amber-muted" },
  missing: { label: "未安装", icon: <XCircle size={12} />, color: "text-destructive", badgeClass: "text-destructive border-destructive/20 bg-destructive/10" },
  installing: { label: "安装中", icon: <Loader2 size={12} className="animate-spin" />, color: "text-accent-blue", badgeClass: "text-accent-blue border-accent-blue/20 bg-accent-blue-muted" },
}

const TYPE_BADGE: Record<DepType, string> = {
  binary: "bg-muted/30 text-foreground/60",
  npm: "bg-accent-red-muted text-accent-red",
  pip: "bg-accent-blue-muted text-accent-blue",
}

// ===========================
// Extension card (shared)
// ===========================
function ExtensionCard({ ext, isInstalled, selected, onClick, trailing }: {
  ext: Extension; isInstalled: boolean; selected?: boolean
  onClick: () => void; trailing: React.ReactNode
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`w-full h-auto text-left px-3.5 py-3 rounded-[12px] border transition-all group ${selected ? "bg-accent/20 border-border/40" : "border-transparent hover:bg-accent/20 hover:border-border/30"}`}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="w-10 h-10 rounded-[12px] bg-muted/30 flex items-center justify-center text-[20px] flex-shrink-0">{ext.icon}</div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground truncate font-medium tracking-tight">{ext.name}</span>
            {ext.category === "official" && <Badge variant="outline" className="text-xs py-0 text-accent-blue border-accent-blue/20 bg-accent-blue-muted">官方</Badge>}
            {ext.status === "update-available" && <Badge variant="outline" className="text-xs py-0 text-accent-amber border-accent-amber/20 bg-accent-amber-muted">可更新</Badge>}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1 tracking-tight">{ext.description}</p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground/40 tracking-tight">
            <span>v{ext.version}</span><span className="text-muted-foreground/50">·</span><span>{ext.size}</span>
            {ext.rating && <><span className="text-muted-foreground/50">·</span><span className="text-accent-amber flex items-center gap-0.5"><Star size={9} fill="currentColor" /> {ext.rating}</span></>}
            {ext.downloads && <><span className="text-muted-foreground/50">·</span><span className="flex items-center gap-0.5"><Download size={9} /> {formatDownloads(ext.downloads)}</span></>}
            {ext.mcpTools && ext.mcpTools.length > 0 && <><span className="text-muted-foreground/50">·</span><span className="flex items-center gap-0.5"><Wrench size={9} /> {ext.mcpTools.length} MCP</span></>}
          </div>
        </div>
        <div onClick={e => e.stopPropagation()}>{trailing}</div>
      </div>
    </Button>
  )
}

// ===========================
// Main Demo
// ===========================
export function ExtensionsDemo() {
  const [activeTab, setActiveTab] = useState<ExtensionTab>("installed")
  const [categoryFilter, setCategoryFilter] = useState<ExtensionCategory>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [extensions, setExtensions] = useState(INSTALLED)
  const [installing, setInstalling] = useState<Set<string>>(new Set())
  const [detailExt, setDetailExt] = useState<Extension | null>(null)
  const [selectedInstalled, setSelectedInstalled] = useState<Extension | null>(null)
  const [deps, setDeps] = useState(INITIAL_DEPS)
  const [depLoading, setDepLoading] = useState<Set<string>>(new Set())

  const toggleEnabled = (id: string) => { setExtensions(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e)) }
  const handleInstall = (id: string) => { setInstalling(prev => new Set(prev).add(id)); setTimeout(() => { setInstalling(prev => { const n = new Set(prev); n.delete(id); return n }) }, 1500) }

  const handleDepAction = (id: string) => {
    setDeps(prev => prev.map(d => d.id === id ? { ...d, status: "installing" as DepStatus } : d))
    setDepLoading(prev => new Set(prev).add(id))
    setTimeout(() => {
      setDeps(prev => prev.map(d => d.id === id ? { ...d, status: "ready" as DepStatus, currentVersion: d.latestVersion } : d))
      setDepLoading(prev => { const n = new Set(prev); n.delete(id); return n })
    }, 2000)
  }

  const currentList = activeTab === "installed" ? extensions : MARKETPLACE
  const filtered = currentList.filter(e => {
    const matchSearch = !searchTerm || e.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = categoryFilter === "all" || e.category === categoryFilter
    return matchSearch && matchCategory
  })

  return (
    <Section title="Extensions Module" install="npm install @cherry-studio/ui" props={extProps} code={`// Tabs: Installed (dual-pane) / Marketplace / Dependencies
// Search + Category filter + Extension cards with Switch/Install`}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        <div className="flex items-center justify-between px-4 h-11 border-b border-border/30">
          <div className="flex items-center gap-1.5 text-xs tracking-tight">
            <Blocks size={13} className="text-muted-foreground" />
            <span className="text-foreground">扩展管理</span>
          </div>
          <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as ExtensionTab); setSelectedInstalled(null) }}>
            <TabsList className="bg-muted/40 rounded-[12px] p-0.5 h-auto">
              <TabsTrigger value="installed" className="px-2.5 py-[3px] rounded-[10px] text-xs tracking-tight">已安装 ({extensions.length})</TabsTrigger>
              <TabsTrigger value="marketplace" className="px-2.5 py-[3px] rounded-[10px] text-xs tracking-tight">市场</TabsTrigger>
              <TabsTrigger value="dependencies" className="px-2.5 py-[3px] rounded-[10px] text-xs tracking-tight">依赖管理</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as ExtensionTab)}>
        {/* Dependencies tab */}
        <TabsContent value="dependencies" className="mt-0">
          <div className="px-4 py-4 min-h-[360px] max-h-[480px] overflow-y-auto space-y-1 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
            <p className="text-xs text-muted-foreground/50 mb-3 tracking-tight px-1">运行时依赖 ({deps.length})</p>
            {deps.map(dep => {
              const sc = STATUS_CONFIG[dep.status]
              const loading = depLoading.has(dep.id)
              return (
                <div key={dep.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] hover:bg-accent/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground font-medium tracking-tight">{dep.name}</span>
                      <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${TYPE_BADGE[dep.type]}`}>{dep.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/40 tracking-tight">
                      <span>{dep.currentVersion}</span>
                      {dep.currentVersion !== dep.latestVersion && <span className="text-accent-amber">→ {dep.latestVersion}</span>}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs py-0.5 gap-1 ${sc.badgeClass}`}>
                    {sc.icon} {sc.label}
                  </Badge>
                  {(dep.status === "outdated" || dep.status === "missing") && (
                    <Button variant="secondary" size="xs" onClick={() => handleDepAction(dep.id)} disabled={loading}>
                      {dep.status === "outdated" ? "更新" : "安装"}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="mt-0">
            {/* Search + category */}
            <div className="px-4 py-2 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索扩展…" className="pl-8 pr-7 h-auto py-1.5 text-xs tracking-tight" />
                {searchTerm && <Button variant="ghost" size="icon-xs" onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30"><X size={12} /></Button>}
              </div>
              <div className="flex items-center gap-0.5">
                {([{ id: "all" as ExtensionCategory, label: "全部" }, { id: "official" as ExtensionCategory, label: "官方" }, { id: "community" as ExtensionCategory, label: "社区" }]).map(cat => (
                  <Button key={cat.id} variant="ghost" size="xs" onClick={() => setCategoryFilter(cat.id)} className={`px-2 py-1 rounded-[10px] text-xs tracking-tight ${categoryFilter === cat.id ? "bg-accent text-foreground" : "text-muted-foreground/50 hover:text-foreground"}`}>{cat.label}</Button>
                ))}
              </div>
            </div>
            <div className="flex min-h-[360px] max-h-[480px]">
              <div className="w-[280px] border-r border-border/20 overflow-y-auto px-2 pb-4 space-y-0.5 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/30">
                    <Package size={24} className="mb-2" /><span className="text-sm tracking-tight">暂无扩展</span>
                  </div>
                ) : filtered.map(ext => (
                  <ExtensionCard
                    key={ext.id} ext={ext} isInstalled selected={selectedInstalled?.id === ext.id}
                    onClick={() => setSelectedInstalled(ext)}
                    trailing={<Switch checked={ext.enabled} onCheckedChange={() => toggleEnabled(ext.id)} />}
                  />
                ))}
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
                {selectedInstalled ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-[16px] bg-muted/30 flex items-center justify-center text-[24px]">{selectedInstalled.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold tracking-tight">{selectedInstalled.name}</h3>
                          {selectedInstalled.category === "official" && <Badge variant="outline" className="text-xs py-0 text-accent-blue border-accent-blue/20 bg-accent-blue-muted">官方</Badge>}
                          {selectedInstalled.status === "update-available" && <Badge variant="outline" className="text-xs py-0 text-accent-amber border-accent-amber/20 bg-accent-amber-muted">可更新</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground/50 tracking-tight mt-0.5">{selectedInstalled.author} · v{selectedInstalled.version} · {selectedInstalled.size}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground/60 leading-relaxed tracking-tight">{selectedInstalled.description}</p>
                    {selectedInstalled.mcpTools && selectedInstalled.mcpTools.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground/40 mb-1.5 tracking-tight">MCP 工具</p>
                        <div className="flex flex-wrap gap-1">{selectedInstalled.mcpTools.map(tool => <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>)}</div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant={selectedInstalled.enabled ? "destructive" : "default"} onClick={() => { toggleEnabled(selectedInstalled.id); setSelectedInstalled({ ...selectedInstalled, enabled: !selectedInstalled.enabled }) }}>
                        {selectedInstalled.enabled ? "禁用" : "启用"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 py-20">
                    <Package size={28} className="mb-2" />
                    <span className="text-sm tracking-tight">选择一个扩展查看详情</span>
                  </div>
                )}
              </div>
            </div>
        </TabsContent>

        <TabsContent value="marketplace" className="mt-0">
            {/* Search + category */}
            <div className="px-4 py-2 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索扩展…" className="pl-8 pr-7 h-auto py-1.5 text-xs tracking-tight" />
                {searchTerm && <Button variant="ghost" size="icon-xs" onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30"><X size={12} /></Button>}
              </div>
              <div className="flex items-center gap-0.5">
                {([{ id: "all" as ExtensionCategory, label: "全部" }, { id: "official" as ExtensionCategory, label: "官方" }, { id: "community" as ExtensionCategory, label: "社区" }]).map(cat => (
                  <Button key={cat.id} variant="ghost" size="xs" onClick={() => setCategoryFilter(cat.id)} className={`px-2 py-1 rounded-[10px] text-xs tracking-tight ${categoryFilter === cat.id ? "bg-accent text-foreground" : "text-muted-foreground/50 hover:text-foreground"}`}>{cat.label}</Button>
                ))}
              </div>
            </div>
            <div className="px-4 pb-4 space-y-1 min-h-[360px] max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/30">
                  <Package size={24} className="mb-2" /><span className="text-sm tracking-tight">暂无扩展</span>
                </div>
              ) : filtered.map(ext => (
                <ExtensionCard
                  key={ext.id} ext={ext} isInstalled={false}
                  onClick={() => setDetailExt(ext)}
                  trailing={
                    <Button variant="secondary" size="xs" onClick={() => handleInstall(ext.id)} disabled={installing.has(ext.id)}>
                      {installing.has(ext.id) ? <><RefreshCw size={11} className="animate-spin" /> 安装中</> : "安装"}
                    </Button>
                  }
                />
              ))}
            </div>
        </TabsContent>
        </Tabs>
      </div>

      {/* Marketplace detail dialog */}
      <Dialog open={!!detailExt} onOpenChange={open => { if (!open) setDetailExt(null) }}>
        <DialogContent className="max-w-md">
          {detailExt && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-[24px] bg-muted/30 flex items-center justify-center text-[24px]">{detailExt.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="text-base font-semibold tracking-tight">{detailExt.name}</h3>{detailExt.category === "official" && <Badge variant="outline" className="text-xs py-0">官方</Badge>}</div>
                  <p className="text-xs text-muted-foreground/50 tracking-tight">{detailExt.author} · v{detailExt.version} · {detailExt.size}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground/60 leading-relaxed tracking-tight">{detailExt.description}</p>
              {detailExt.mcpTools && detailExt.mcpTools.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground/40 mb-1.5 tracking-tight">MCP 工具</p>
                  <div className="flex flex-wrap gap-1">{detailExt.mcpTools.map(tool => <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>)}</div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setDetailExt(null)}>关闭</Button>
                <Button size="sm" onClick={() => { handleInstall(detailExt.id); setDetailExt(null) }}>安装</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  )
}
