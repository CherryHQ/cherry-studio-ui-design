import React, { useState } from "react"
import {
  ConfigSection, FormRow, SectionHeader,
  InlineSelect, Switch, Input, Badge, Slider, Button,
} from "@cherry-studio/ui"
import {
  Settings2, Cloud, Sparkles, Server, Plug, Globe2, FileScan,
  BrainCircuit, Database, MousePointer, Command, MessageSquareText,
  BarChart3, Info, Home, ChevronRight,
} from "lucide-react"
import { Section, type PropDef } from "../components/Section"

// ===========================
// Types (matching src/features/settings)
// ===========================
type SettingsSection =
  | "home" | "general" | "models" | "default-model" | "api-gateway"
  | "mcp" | "search" | "documents" | "memories"
  | "data-settings" | "selection-assistant" | "shortcuts"
  | "quick-assistant" | "quick-phrases" | "dashboard" | "about"

interface NavGroup {
  label: string
  items: { id: SettingsSection; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[]
}

// ===========================
// Navigation Config (matching original)
// ===========================
const NAV_GROUPS: NavGroup[] = [
  { label: "", items: [{ id: "home", label: "首页", icon: Home }] },
  {
    label: "集成",
    items: [
      { id: "models", label: "模型服务", icon: Cloud },
      { id: "default-model", label: "默认模型", icon: Sparkles },
      { id: "api-gateway", label: "API 网关", icon: Server },
    ],
  },
  {
    label: "服务",
    items: [
      { id: "mcp", label: "MCP 服务", icon: Plug },
      { id: "search", label: "网络搜索", icon: Globe2 },
      { id: "documents", label: "文档解析", icon: FileScan },
      { id: "memories", label: "记忆功能", icon: BrainCircuit },
    ],
  },
  {
    label: "应用设置",
    items: [
      { id: "general", label: "通用设置", icon: Settings2 },
      { id: "data-settings", label: "数据设置", icon: Database },
    ],
  },
  {
    label: "效率工具",
    items: [
      { id: "selection-assistant", label: "划词助手", icon: MousePointer },
      { id: "shortcuts", label: "快捷键", icon: Command },
      { id: "quick-assistant", label: "快捷助手", icon: Sparkles },
      { id: "quick-phrases", label: "快捷短语", icon: MessageSquareText },
    ],
  },
  {
    label: "系统",
    items: [
      { id: "dashboard", label: "数据统计", icon: BarChart3 },
      { id: "about", label: "关于我们", icon: Info },
    ],
  },
]

// ===========================
// Sidebar (matching original SettingsSidebar)
// ===========================
function SettingsSidebar({ active, onSelect }: { active: SettingsSection; onSelect: (s: SettingsSection) => void }) {
  return (
    <div className="w-[180px] flex-shrink-0 flex flex-col overflow-y-auto select-none [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
      <div className="h-10 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--traffic-red)] border border-[var(--traffic-red-border)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--traffic-yellow)] border border-[var(--traffic-yellow-border)]" />
          <div className="w-3 h-3 rounded-full bg-[var(--traffic-green)] border border-[var(--traffic-green-border)]" />
        </div>
      </div>
      <div className="flex-1 px-2 pb-4 space-y-1">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 pb-1 pt-2 text-[11px] text-foreground/40 leading-[12px] tracking-tight">{group.label}</p>
            )}
            <div className="space-y-[1px]">
              {group.items.map(item => {
                const isActive = active === item.id
                const Icon = item.icon
                return (
                  <Button variant="ghost" type="button"
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center gap-2.5 px-3 py-[5px] rounded-[12px] transition-all duration-150 text-[11px] tracking-tight relative ${
                      isActive
                        ? "bg-cherry-active-bg text-foreground/90"
                        : "text-foreground/70 hover:text-foreground/90 hover:bg-foreground/[0.04]"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-[12px] border border-cherry-active-border pointer-events-none" />
                    )}
                    <Icon size={13} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===========================
// Sub-pages
// ===========================

/** General Settings (matching GeneralSettingsPage structure) */
function GeneralContent() {
  const [language, setLanguage] = useState("zh-CN")
  const [theme, setTheme] = useState("system")
  const [sendKey, setSendKey] = useState("enter")
  const [launchAtLogin, setLaunchAtLogin] = useState(true)
  const [autoTitle, setAutoTitle] = useState(true)
  const [tray, setTray] = useState(true)
  const [fontSize, setFontSize] = useState([14])

  return (
    <div className="space-y-4">
      <SectionHeader title="通用设置" />
      <ConfigSection title="显示与语言">
        <FormRow label="语言" desc="界面语言">
          <InlineSelect value={language} options={[
            { value: "zh-CN", label: "简体中文" },
            { value: "zh-TW", label: "繁體中文" },
            { value: "en", label: "English" },
            { value: "ja", label: "日本語" },
          ]} onChange={setLanguage} />
        </FormRow>
        <FormRow label="主题" desc="外观主题">
          <InlineSelect value={theme} options={[
            { value: "system", label: "跟随系统" },
            { value: "light", label: "浅色" },
            { value: "dark", label: "深色" },
          ]} onChange={setTheme} />
        </FormRow>
        <FormRow label="字体大小" desc="聊天内容字号">
          <div className="flex items-center gap-2 w-32">
            <Slider value={fontSize} onValueChange={setFontSize} min={12} max={20} step={1} />
            <span className="text-[11px] font-mono text-muted-foreground w-6 text-right">{fontSize[0]}</span>
          </div>
        </FormRow>
      </ConfigSection>

      <ConfigSection title="系统">
        <FormRow label="开机启动" desc="登录时自动启动">
          <Switch checked={launchAtLogin} onCheckedChange={setLaunchAtLogin} />
        </FormRow>
        <FormRow label="托盘模式" desc="关闭窗口时最小化到托盘">
          <Switch checked={tray} onCheckedChange={setTray} />
        </FormRow>
      </ConfigSection>

      <ConfigSection title="对话">
        <FormRow label="发送快捷键">
          <InlineSelect value={sendKey} options={[
            { value: "enter", label: "Enter" },
            { value: "shift-enter", label: "Shift+Enter" },
            { value: "ctrl-enter", label: "Ctrl+Enter" },
          ]} onChange={setSendKey} />
        </FormRow>
        <FormRow label="自动生成标题" desc="根据对话内容自动生成标题">
          <Switch checked={autoTitle} onCheckedChange={setAutoTitle} />
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/** Model Service (matching ModelServicePage structure) */
function ModelServiceContent() {
  const [selectedProvider, setSelectedProvider] = useState("openai")

  const providers = [
    { id: "openai", name: "OpenAI", color: "#10a37f", models: 4, total: 8, status: "connected" as const, latency: 120 },
    { id: "anthropic", name: "Anthropic", color: "#d97706", models: 3, total: 5, status: "connected" as const, latency: 85 },
    { id: "google", name: "Google", color: "#4285f4", models: 2, total: 4, status: "connected" as const, latency: 145 },
    { id: "ollama", name: "Ollama", color: "#1a1a1a", models: 2, total: 3, status: "connected" as const, latency: 30 },
    { id: "deepseek", name: "DeepSeek", color: "#4f6ef7", models: 1, total: 3, status: "disconnected" as const },
  ]

  const current = providers.find(p => p.id === selectedProvider)!

  return (
    <div className="space-y-4">
      <SectionHeader title="模型服务" />

      {/* Provider list */}
      <div className="space-y-1">
        {providers.map(p => (
          <Button variant="ghost" type="button"
            key={p.id}
            onClick={() => setSelectedProvider(p.id)}
            className={`h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-[13px] tracking-tight transition-colors ${
              selectedProvider === p.id ? "bg-accent" : "hover:bg-accent/50"
            }`}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground text-[11px] font-medium" style={{ background: p.color }}>
              {p.name.charAt(0)}
            </div>
            <span className="flex-1 text-left font-medium">{p.name}</span>
            <span className="text-[11px] text-muted-foreground">{p.models}/{p.total}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${p.status === "connected" ? "bg-success" : "bg-muted-foreground/30"}`} />
          </Button>
        ))}
      </div>

      {/* Selected provider detail */}
      <ConfigSection title={`${current.name} 配置`}>
        <FormRow label="API Key">
          <Input type="password" defaultValue="sk-••••••••••••3kFj" className="w-48 h-8 text-xs" />
        </FormRow>
        <FormRow label="Base URL">
          <Input defaultValue={`https://api.${current.id}.com/v1`} className="w-48 h-8 text-xs" />
        </FormRow>
        <FormRow label="状态">
          <Badge variant={current.status === "connected" ? "default" : "outline"} className="text-[11px]">
            {current.status === "connected" ? `已连接 · ${current.latency}ms` : "未连接"}
          </Badge>
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/** Data Settings (matching DataSettingsPage) */
function DataContent() {
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupInterval, setBackupInterval] = useState("daily")

  return (
    <div className="space-y-4">
      <SectionHeader title="数据设置" />
      <ConfigSection title="备份">
        <FormRow label="自动备份" desc="定期备份对话数据">
          <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
        </FormRow>
        <FormRow label="备份频率">
          <InlineSelect value={backupInterval} options={[
            { value: "hourly", label: "每小时" },
            { value: "daily", label: "每天" },
            { value: "weekly", label: "每周" },
          ]} onChange={setBackupInterval} />
        </FormRow>
      </ConfigSection>
      <ConfigSection title="存储">
        <FormRow label="对话数据">
          <span className="text-[13px] text-muted-foreground">128.4 MB</span>
        </FormRow>
        <FormRow label="缓存">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">45.2 MB</span>
            <Button variant="outline" size="xs">清除</Button>
          </div>
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/** MCP Service (matching MCPServicePage) */
function MCPContent() {
  const [tools, setTools] = useState([
    { id: "filesystem", name: "File System", desc: "Read/write local files", enabled: true, status: "connected" as const },
    { id: "browser", name: "Browser", desc: "Web browsing and scraping", enabled: true, status: "connected" as const },
    { id: "database", name: "Database", desc: "SQL query execution", enabled: false, status: "disconnected" as const },
    { id: "terminal", name: "Terminal", desc: "Shell command execution", enabled: true, status: "connected" as const },
    { id: "github", name: "GitHub", desc: "Repository & PR management", enabled: true, status: "connected" as const },
    { id: "notion", name: "Notion", desc: "Knowledge base access", enabled: false, status: "error" as const },
  ])
  const toggle = (id: string) => setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))

  return (
    <div className="space-y-4">
      <SectionHeader title="MCP 服务" />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/60 tracking-tight">{tools.filter(t => t.enabled).length} 个已启用</p>
        <Button variant="secondary" size="xs" className="gap-1"><Plug size={10} />添加服务</Button>
      </div>
      <div className="space-y-1">
        {tools.map(t => (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-accent/30 transition-colors">
            <div className={`w-7 h-7 rounded-[10px] flex items-center justify-center text-[11px] font-medium ${t.enabled ? "bg-accent-blue-muted text-accent-blue" : "bg-muted text-muted-foreground/40"}`}>
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium tracking-tight">{t.name}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${t.status === "connected" ? "bg-success" : t.status === "error" ? "bg-error" : "bg-muted-foreground/30"}`} />
              </div>
              <p className="text-[10px] text-muted-foreground/50 tracking-tight">{t.desc}</p>
            </div>
            <Switch checked={t.enabled} onCheckedChange={() => toggle(t.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Web Search (matching WebSearchPage) */
function SearchContent() {
  const [provider, setProvider] = useState("tavily")
  const providers = [
    { id: "tavily", name: "Tavily", desc: "AI-optimized search" },
    { id: "google", name: "Google CSE", desc: "Custom Search Engine" },
    { id: "bing", name: "Bing", desc: "Microsoft Bing Search" },
    { id: "searxng", name: "SearXNG", desc: "Self-hosted meta search" },
  ]
  return (
    <div className="space-y-4">
      <SectionHeader title="网络搜索" />
      <ConfigSection title="搜索引擎">
        <div className="space-y-1">
          {providers.map(p => (
            <Button variant="ghost" type="button" key={p.id} onClick={() => setProvider(p.id)}
              className={`h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-left transition-colors ${provider === p.id ? "bg-accent" : "hover:bg-accent/50"}`}>
              <div className="w-6 h-6 rounded-full bg-accent-blue-muted flex items-center justify-center text-accent-blue text-[10px] font-medium">{p.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-medium tracking-tight">{p.name}</span>
                <p className="text-[10px] text-muted-foreground/50">{p.desc}</p>
              </div>
              {provider === p.id && <Badge variant="default" className="text-[9px]">Active</Badge>}
            </Button>
          ))}
        </div>
      </ConfigSection>
      <ConfigSection title="API 配置">
        <FormRow label="API Key">
          <Input type="password" defaultValue="tvly-••••••••••3kFj" className="w-48 h-8 text-xs" />
        </FormRow>
        <FormRow label="最大结果数">
          <Slider defaultValue={[5]} min={1} max={20} step={1} className="w-36" />
        </FormRow>
        <FormRow label="包含内容摘要">
          <Switch defaultChecked />
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/** Default Model (matching DefaultModelSettingsPage) */
function DefaultModelContent() {
  return (
    <div className="space-y-4">
      <SectionHeader title="默认模型" />
      <ConfigSection title="对话默认模型">
        <FormRow label="主模型" desc="新对话默认使用的模型">
          <InlineSelect value="claude-sonnet" options={[
            { value: "claude-sonnet", label: "Claude Sonnet" },
            { value: "gpt-4o", label: "GPT-4o" },
            { value: "gemini-pro", label: "Gemini Pro" },
          ]} onChange={() => {}} />
        </FormRow>
        <FormRow label="备用模型" desc="主模型不可用时自动切换">
          <InlineSelect value="gpt-4o" options={[
            { value: "gpt-4o", label: "GPT-4o" },
            { value: "claude-sonnet", label: "Claude Sonnet" },
          ]} onChange={() => {}} />
        </FormRow>
      </ConfigSection>
      <ConfigSection title="翻译默认模型">
        <FormRow label="翻译模型">
          <InlineSelect value="gpt-4o-mini" options={[
            { value: "gpt-4o-mini", label: "GPT-4o Mini" },
            { value: "claude-haiku", label: "Claude Haiku" },
          ]} onChange={() => {}} />
        </FormRow>
      </ConfigSection>
      <ConfigSection title="代码默认模型">
        <FormRow label="代码模型">
          <InlineSelect value="claude-sonnet" options={[
            { value: "claude-sonnet", label: "Claude Sonnet" },
            { value: "gpt-4o", label: "GPT-4o" },
            { value: "deepseek-coder", label: "DeepSeek Coder" },
          ]} onChange={() => {}} />
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/** Document Service (matching DocumentServicePage) */
function DocumentContent() {
  return (
    <div className="space-y-4">
      <SectionHeader title="文档解析" />
      <ConfigSection title="文档引擎">
        <FormRow label="PDF 解析">
          <InlineSelect value="builtin" options={[
            { value: "builtin", label: "内置解析器" },
            { value: "tesseract", label: "Tesseract OCR" },
            { value: "paddle", label: "PaddleOCR" },
          ]} onChange={() => {}} />
        </FormRow>
        <FormRow label="Word/Excel">
          <InlineSelect value="builtin" options={[
            { value: "builtin", label: "内置解析器" },
            { value: "libreoffice", label: "LibreOffice" },
          ]} onChange={() => {}} />
        </FormRow>
        <FormRow label="最大文件大小">
          <Slider defaultValue={[50]} min={1} max={200} step={1} className="w-36" />
        </FormRow>
      </ConfigSection>
      <ConfigSection title="RAG 设置">
        <FormRow label="分块大小">
          <Slider defaultValue={[512]} min={128} max={2048} step={128} className="w-36" />
        </FormRow>
        <FormRow label="重叠长度">
          <Slider defaultValue={[64]} min={0} max={256} step={32} className="w-36" />
        </FormRow>
        <FormRow label="嵌入模型">
          <InlineSelect value="text-embedding-3-small" options={[
            { value: "text-embedding-3-small", label: "text-embedding-3-small" },
            { value: "text-embedding-3-large", label: "text-embedding-3-large" },
          ]} onChange={() => {}} />
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/** Home (quick config overview) */
function HomeContent() {
  const [model, setModel] = useState("claude-sonnet")
  const [language, setLanguage] = useState("zh-CN")
  const [theme, setTheme] = useState("system")
  const [sendKey, setSendKey] = useState("enter")

  return (
    <div className="space-y-4">
      <SectionHeader title="首页" />
      <p className="text-[12px] text-muted-foreground/60 tracking-tight">快速配置常用选项</p>
      <ConfigSection title="快捷设置">
        <FormRow label="默认模型" desc="新对话使用的模型">
          <InlineSelect value={model} options={[
            { value: "claude-sonnet", label: "Claude Sonnet" },
            { value: "gpt-4o", label: "GPT-4o" },
            { value: "gemini-pro", label: "Gemini Pro" },
            { value: "deepseek-v3", label: "DeepSeek V3" },
          ]} onChange={setModel} />
        </FormRow>
        <FormRow label="语言">
          <InlineSelect value={language} options={[
            { value: "zh-CN", label: "简体中文" },
            { value: "en", label: "English" },
            { value: "ja", label: "日本語" },
          ]} onChange={setLanguage} />
        </FormRow>
        <FormRow label="主题">
          <InlineSelect value={theme} options={[
            { value: "system", label: "跟随系统" },
            { value: "light", label: "浅色" },
            { value: "dark", label: "深色" },
          ]} onChange={setTheme} />
        </FormRow>
        <FormRow label="发送快捷键">
          <InlineSelect value={sendKey} options={[
            { value: "enter", label: "Enter" },
            { value: "shift-enter", label: "Shift+Enter" },
          ]} onChange={setSendKey} />
        </FormRow>
      </ConfigSection>
      <ConfigSection title="快速入口">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Cloud, label: "模型服务", desc: "管理 API 和模型" },
            { icon: Plug, label: "MCP 服务", desc: "管理 MCP 工具" },
            { icon: Database, label: "数据设置", desc: "备份与存储" },
            { icon: Command, label: "快捷键", desc: "自定义快捷键" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] border border-border/30 hover:bg-accent/30 transition-colors cursor-pointer">
              <item.icon size={14} className="text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-tight">{item.label}</p>
                <p className="text-[10px] text-muted-foreground/50 tracking-tight">{item.desc}</p>
              </div>
              <ChevronRight size={10} className="text-muted-foreground/30 ml-auto flex-shrink-0" />
            </div>
          ))}
        </div>
      </ConfigSection>
    </div>
  )
}

/** About (version + changelog) */
function AboutContent() {
  const changelog = [
    { version: "2.6.0", type: "feature" as const, text: "新增 MCP 服务管理，支持文件系统、浏览器等工具" },
    { version: "2.6.0", type: "improve" as const, text: "优化翻译模块，支持更多语言和专家模式" },
    { version: "2.6.0", type: "fix" as const, text: "修复深色模式下部分组件显示异常" },
    { version: "2.5.9", type: "feature" as const, text: "新增知识库 RAG 功能，支持文档嵌入检索" },
  ]
  const badgeColor = { feature: "bg-accent-blue-muted text-accent-blue", improve: "bg-accent-amber/15 text-accent-amber", fix: "bg-success/15 text-success" }
  const badgeLabel = { feature: "Feature", improve: "Improve", fix: "Fix" }

  return (
    <div className="space-y-4">
      <SectionHeader title="关于我们" />
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-error/80 to-accent-orange flex items-center justify-center text-primary-foreground text-[16px] font-bold shadow-sm">C</div>
        <div>
          <p className="text-[14px] font-semibold tracking-tight">Cherry Studio</p>
          <p className="text-[11px] text-muted-foreground/50 tracking-tight">v2.6.0 · Build 2026.04.12</p>
        </div>
      </div>
      <ConfigSection title="更新日志">
        <div className="space-y-2">
          {changelog.map((item, i) => (
            <div key={i} className="flex items-start gap-2 px-1 py-1">
              <Badge className={`text-[9px] px-1.5 py-0 rounded-[6px] font-medium flex-shrink-0 ${badgeColor[item.type]}`}>{badgeLabel[item.type]}</Badge>
              <span className="text-[11px] text-foreground/70 tracking-tight leading-[16px]">{item.text}</span>
            </div>
          ))}
        </div>
      </ConfigSection>
      <ConfigSection title="链接">
        <FormRow label="GitHub">
          <a href="#" className="text-[11px] text-accent-blue hover:underline tracking-tight">github.com/cherry-studio</a>
        </FormRow>
        <FormRow label="文档">
          <a href="#" className="text-[11px] text-accent-blue hover:underline tracking-tight">docs.cherry-ai.com</a>
        </FormRow>
        <FormRow label="反馈">
          <a href="#" className="text-[11px] text-accent-blue hover:underline tracking-tight">提交 Issue</a>
        </FormRow>
      </ConfigSection>
    </div>
  )
}

/** Shortcuts (simplified, matching ShortcutsPage) */
function ShortcutsContent() {
  const shortcuts = [
    { label: "显示/隐藏应用", keys: ["⌥", "Space"] },
    { label: "打开设置", keys: ["⌘", ","] },
    { label: "新建对话", keys: ["⌘", "N"] },
    { label: "搜索对话", keys: ["⌘", "K"] },
    { label: "切换侧边栏", keys: ["⌘", "\\"] },
    { label: "切换深色/浅色", keys: ["⇧", "⌘", "L"] },
    { label: "复制最后回复", keys: ["⌘", "⇧", "C"] },
    { label: "唤起快捷助手", keys: ["⌘", "E"] },
  ]
  return (
    <div className="space-y-4">
      <SectionHeader title="快捷键" />
      <div className="divide-y divide-border/5">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 px-1">
            <span className="text-[12px] text-foreground/70 tracking-tight">{s.label}</span>
            <div className="flex items-center gap-[2px]">
              {s.keys.map((k, j) => (
                <kbd key={j} className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-[5px] rounded-[4px] text-[10px] border bg-muted/30 border-border/20 text-foreground/50 shadow-[0_1px_0_0] shadow-border/10" style={{ fontFamily: "system-ui", fontWeight: 500 }}>
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/40 tracking-tight">点击快捷键可以录制新的组合键</p>
    </div>
  )
}

// ===========================
// Page content mapping
// ===========================
const PAGE_CONTENT: Record<string, React.FC> = {
  home: HomeContent,
  general: GeneralContent,
  models: ModelServiceContent,
  "default-model": DefaultModelContent,
  mcp: MCPContent,
  search: SearchContent,
  documents: DocumentContent,
  shortcuts: ShortcutsContent,
  "data-settings": DataContent,
  about: AboutContent,
}

function PlaceholderContent({ section }: { section: string }) {
  const item = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === section)
  const Icon = item?.icon ?? Settings2
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/40">
      <Icon size={32} />
      <p className="text-[13px] tracking-tight">{item?.label ?? section}</p>
      <p className="text-[11px]">此页面内容在 Demo 中省略</p>
    </div>
  )
}

// ===========================
// Props
// ===========================
const settingsModuleProps: PropDef[] = [
  { name: "section", type: "SettingsSection", default: '"general"', description: "Current active settings section" },
  { name: "onSectionChange", type: "(section: SettingsSection) => void", default: "-", description: "Section change handler" },
  { name: "onClose", type: "() => void", default: "-", description: "Close settings panel" },
]

// ===========================
// Main Demo
// ===========================
export function SettingsModuleDemo() {
  const [active, setActive] = useState<SettingsSection>("general")

  const ContentComponent = PAGE_CONTENT[active]

  return (
    <Section title="Settings Module" install="npm install @cherry-studio/ui" props={settingsModuleProps} code={`import { ConfigSection, FormRow, Switch, InlineSelect } from "@cherry-studio/ui"

// Dual-pane layout: sidebar nav + content panel
<div className="flex h-[600px] border rounded-[24px] overflow-hidden">
  <SettingsSidebar active={section} onSelect={setSection} />
  <div className="flex-1 overflow-y-auto p-6">
    <ConfigSection title="显示与语言">
      <FormRow label="语言"><InlineSelect ... /></FormRow>
      <FormRow label="主题"><InlineSelect ... /></FormRow>
    </ConfigSection>
  </div>
</div>`}>
      <div className="flex h-[560px] border rounded-[24px] overflow-hidden bg-background">
        {/* Left: sidebar nav */}
        <SettingsSidebar active={active} onSelect={setActive} />

        {/* Divider */}
        <div className="w-px bg-border" />

        {/* Right: content panel */}
        <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30">
          {ContentComponent ? <ContentComponent /> : <PlaceholderContent section={active} />}
        </div>
      </div>
    </Section>
  )
}
