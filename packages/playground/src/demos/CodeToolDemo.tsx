import React, { useState, useCallback } from "react"
import { SimpleTooltip, Button, Badge, Input, Textarea, Label, Popover, PopoverTrigger, PopoverContent } from "@cherry-studio/ui"
import { Section, type PropDef } from "../components/Section"
import {
  ChevronDown, Sparkles, X, Check, Code2,
  FolderOpen, Terminal, Cpu,
  Play, Info, Search,
} from "lucide-react"

// ===========================
// Types & Data (matching src/features/codetool/CodeToolPage)
// ===========================

interface CLITool {
  id: string; name: string; desc: string; color: string
  initial: string; version: string; category: "official" | "community"
}

const cliTools: CLITool[] = [
  { id: "claude", name: "Claude Code", desc: "Anthropic 官方 CLI", color: "#8755E9", initial: "C", version: "v1.0.28", category: "official" },
  { id: "qwen", name: "Qwen Code", desc: "通义千问代码助手", color: "#7c3aed", initial: "Q", version: "v2.3.1", category: "official" },
  { id: "gemini", name: "Gemini CLI", desc: "Google 代码工具", color: "#2563eb", initial: "G", version: "v0.8.5", category: "official" },
  { id: "openai", name: "OpenAI Codex", desc: "OpenAI 编码引擎", color: "#06b6d4", initial: "O", version: "v4.1.0", category: "official" },
  { id: "iflow", name: "iFlow CLI", desc: "智能工作流 CLI", color: "#0ea5e9", initial: "⚡", version: "v1.5.2", category: "official" },
  { id: "copilot", name: "GitHub Copilot CLI", desc: "GitHub 编码助手", color: "#1a1a2e", initial: "GH", version: "v2.1.0", category: "official" },
  { id: "kimi", name: "Kimi CLI", desc: "Moonshot 代码工具", color: "#1a1a2e", initial: "K", version: "v0.9.3", category: "official" },
]

const codeModels = [
  { id: "cm1", name: "anthropic/claude-sonnet-4", provider: "CherryIN", color: "#8755E9" },
  { id: "cm2", name: "anthropic/claude-opus-4", provider: "CherryIN", color: "#8755E9" },
  { id: "cm3", name: "deepseek/deepseek-r1(free)", provider: "CherryIN", color: "#3b82f6" },
  { id: "cm4", name: "deepseek/deepseek-v3(free)", provider: "CherryIN", color: "#3b82f6" },
  { id: "cm5", name: "google/gemini-2.5-flash-image", provider: "CherryIN", color: "#6366f1" },
  { id: "cm7", name: "google/gemini-2.5-pro", provider: "CherryIN", color: "#6366f1" },
  { id: "cm9", name: "google/gemini-3-pro-preview", provider: "CherryIN", color: "#6366f1" },
  { id: "cm10", name: "moonshotai/kimi-k2-0905", provider: "CherryIN", color: "#111" },
  { id: "cm11", name: "openai/gpt-5.1", provider: "CherryIN", color: "#a78bfa" },
  { id: "cm12", name: "qwen/qwen3-235b-a22b-instruct-2507(free)", provider: "CherryIN", color: "#8b5cf6" },
]

const terminalOptions = [
  { id: "terminal", name: "Terminal", icon: "🖥️" },
  { id: "iterm2", name: "iTerm2", icon: "🟩" },
  { id: "warp", name: "Warp", icon: "🚀" },
  { id: "hyper", name: "Hyper", icon: "⚡" },
  { id: "alacritty", name: "Alacritty", icon: "🔲" },
  { id: "kitty", name: "Kitty", icon: "🐱" },
]

const cliDefaultModels: Record<string, string> = {
  claude: "cm1", qwen: "cm12", gemini: "cm7", openai: "cm11",
  iflow: "cm12", copilot: "cm11", kimi: "cm10",
}

// ===========================
// Reusable Select Dropdown
// ===========================

function SelectDropdown<T extends { id: string }>({
  items, selectedId, onSelect, renderSelected, renderItem, placeholder, maxHeight = 240,
}: {
  items: T[]; selectedId: string; onSelect: (id: string) => void
  renderSelected: (item: T | undefined) => React.ReactNode
  renderItem: (item: T, isSelected: boolean) => React.ReactNode
  placeholder?: string; maxHeight?: number
}) {
  const [open, setOpen] = useState(false)
  const selected = items.find(i => i.id === selectedId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full flex items-center justify-between px-2.5 py-1.5 h-auto rounded-[12px] text-xs font-normal bg-transparent hover:bg-muted/30 ${open ? "border-primary/40 ring-1 ring-primary/15" : "border-border/40"}`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
            {selected ? renderSelected(selected) : <span className="text-muted-foreground/50">{placeholder || "请选择..."}</span>}
          </div>
          <ChevronDown size={12} className={`text-muted-foreground/50 transition-transform flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="rounded-[12px] p-1 border-border/40 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full"
        align="start"
        sideOffset={4}
        style={{ maxHeight }}
      >
        {items.map(item => (
          <Button
            variant="ghost"
            key={item.id}
            onClick={() => { onSelect(item.id); setOpen(false) }}
            className={`w-full justify-start h-auto px-2.5 py-1.5 text-xs font-normal rounded-[12px] ${selectedId === item.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent/60"}`}
          >
            {renderItem(item, selectedId === item.id)}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ===========================
// Field Label
// ===========================

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[10px] text-muted-foreground/50">{children}</span>
      {hint && (
        <SimpleTooltip content={hint} side="top">
          <Info size={9} className="text-muted-foreground/50 cursor-help" />
        </SimpleTooltip>
      )}
    </div>
  )
}

// ===========================
// CLI Icon (simplified without BrandLogo)
// ===========================

function CLIIcon({ tool, size = "md" }: { tool: CLITool; size?: "sm" | "md" }) {
  const px = size === "sm" ? 28 : 44
  return (
    <div
      className="rounded-[12px] flex items-center justify-center text-primary-foreground flex-shrink-0"
      style={{ width: px, height: px, background: tool.color, fontSize: size === "sm" ? 12 : 16, fontWeight: 600 }}
    >
      {tool.initial}
    </div>
  )
}

// ===========================
// Props
// ===========================

const codeToolProps: PropDef[] = [
  { name: "cliTools", type: "CLITool[]", default: "[]", description: "List of available CLI tools" },
  { name: "selectedCli", type: "string | null", default: "null", description: "Currently selected CLI tool ID" },
  { name: "onLaunch", type: "(cliId: string, config: Config) => void", default: "-", description: "Launch CLI tool handler" },
  { name: "onConfigChange", type: "(cliId: string, config: Config) => void", default: "-", description: "Config change handler" },
]

// ===========================
// Main Demo
// ===========================

export function CodeToolDemo() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCli, setSelectedCli] = useState<string | null>(null)
  const [configState, setConfigState] = useState<Record<string, {
    model: string; workDir: string; envVars: string; terminal: string; checkUpdates: boolean
  }>>({})
  const [launching, setLaunching] = useState(false)
  const [launchSuccess, setLaunchSuccess] = useState(false)

  const getConfig = (cliId: string) => {
    if (configState[cliId]) return configState[cliId]
    return { model: cliDefaultModels[cliId] || "cm1", workDir: "/Users/siin/Desktop", envVars: "", terminal: "terminal", checkUpdates: false }
  }

  const updateConfig = (cliId: string, patch: Partial<ReturnType<typeof getConfig>>) => {
    setConfigState(prev => ({ ...prev, [cliId]: { ...getConfig(cliId), ...patch } }))
  }

  const selectedTool = selectedCli ? cliTools.find(t => t.id === selectedCli) : null
  const config = selectedCli ? getConfig(selectedCli) : null

  const displayedTools = cliTools.filter(
    t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.desc.includes(searchTerm)
  )

  const officialTools = displayedTools.filter(t => t.category === "official")
  const communityTools = displayedTools.filter(t => t.category === "community")

  const handleLaunch = useCallback(() => {
    setLaunching(true)
    setLaunchSuccess(false)
    setTimeout(() => {
      setLaunching(false)
      setLaunchSuccess(true)
      setTimeout(() => setLaunchSuccess(false), 2500)
    }, 2000)
  }, [])

  return (
    <Section title="Code Tool Configuration" props={codeToolProps} code={`// Code tool page: CLI icon grid + search + slide-in config drawer
// Matching src/features/codetool/CodeToolPage.tsx structure
<div className="flex-1 flex flex-col relative">
  {/* Header + Search */}
  {/* CLI tool icon grid (official / community sections) */}
  {/* Config drawer: model selector, working dir, terminal, env vars, launch */}
</div>`}>
      <div className="rounded-[24px] border bg-background overflow-hidden relative" style={{ height: 520 }}>
        <div className="flex flex-col h-full min-h-0">
          {/* Page header */}
          <div className="h-11 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs">
              <Code2 size={13} className="text-muted-foreground" strokeWidth={1.6} />
              <span className="text-foreground">代码工具</span>
              <span className="text-[10px] text-muted-foreground/40 ml-1">{cliTools.length} 个</span>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-2">
            <div className="relative max-w-md mx-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
              <Input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索 CLI 工具…"
                className="w-full pl-8 pr-7 py-1.5 h-auto rounded-[12px] border border-border/50 bg-muted/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus-visible:border-primary/30 transition-colors"
              />
              {searchTerm && (
                <Button variant="ghost" size="icon-xs" onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                  <X size={12} />
                </Button>
              )}
            </div>
          </div>

          {/* Grid content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:hidden">
            <div className="max-w-3xl mx-auto space-y-5">
              {displayedTools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/30">
                  <Code2 size={32} className="mb-3" />
                  <p className="text-xs">{searchTerm ? "没有找到匹配的工具" : "暂无代码工具"}</p>
                </div>
              ) : (
                <div>
                  {/* Official */}
                  {officialTools.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[10px] text-muted-foreground/35 mb-3 px-1">官方工具</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-4">
                        {officialTools.map(tool => (
                          <Button
                            variant="ghost"
                            key={tool.id}
                            onClick={() => setSelectedCli(tool.id)}
                            className="flex flex-col items-center gap-1.5 h-auto p-1.5 font-normal tracking-normal group relative"
                          >
                            <div className={`transition-transform group-hover:scale-110 shadow-sm ${selectedCli === tool.id ? "ring-2 ring-primary rounded-[12px]" : ""}`}>
                              <CLIIcon tool={tool} />
                            </div>
                            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[68px]">
                              {tool.name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Community */}
                  {communityTools.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground/35 mb-3 px-1">社区工具</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-4">
                        {communityTools.map(tool => (
                          <Button
                            variant="ghost"
                            key={tool.id}
                            onClick={() => setSelectedCli(tool.id)}
                            className="flex flex-col items-center gap-1.5 h-auto p-1.5 font-normal tracking-normal group relative"
                          >
                            <div className={`transition-transform group-hover:scale-110 shadow-sm ${selectedCli === tool.id ? "ring-2 ring-primary rounded-[12px]" : ""}`}>
                              <CLIIcon tool={tool} />
                            </div>
                            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[68px]">
                              {tool.name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Backdrop */}
        {selectedCli && (
          <div
            className="absolute inset-0 z-40 bg-foreground/20"
            onClick={() => setSelectedCli(null)}
          />
        )}

        {/* Config Drawer */}
        {selectedCli && selectedTool && config && (
          <div className="absolute top-2 right-2 bottom-2 z-50 w-[400px] bg-card rounded-[24px] border border-border/30 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-11 flex-shrink-0 border-b border-border/30">
              <div className="flex items-center gap-2">
                <CLIIcon tool={selectedTool} size="sm" />
                <div>
                  <span className="text-xs text-foreground">{selectedTool.name}</span>
                  <span className="text-xs text-muted-foreground/35 ml-1.5">{selectedTool.version}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={() => setSelectedCli(null)}>
                <X size={13} />
              </Button>
            </div>

            {/* Scrollable config */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:hidden">
              {/* Tool info card */}
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-accent/5 border border-border/30">
                <CLIIcon tool={selectedTool} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground">{selectedTool.name}</div>
                  <div className="text-[10px] text-muted-foreground/40">{selectedTool.desc}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs py-0">{selectedTool.version}</Badge>
                    <Badge variant="outline" className="text-xs py-0">
                      {selectedTool.category === "official" ? "官方" : "社区"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Model */}
              <div>
                <FieldLabel hint="为 CLI 工具选择要使用的 AI 模型">模型</FieldLabel>
                <SelectDropdown
                  items={codeModels}
                  selectedId={config.model}
                  onSelect={(id) => updateConfig(selectedCli, { model: id })}
                  renderSelected={(item) => item && (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                        <Sparkles size={6} className="text-primary-foreground" />
                      </div>
                      <span className="text-foreground truncate">{item.name}</span>
                    </div>
                  )}
                  renderItem={(item, isSelected) => (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                        <Sparkles size={6} className="text-primary-foreground" />
                      </div>
                      <span className="truncate flex-1">{item.name}</span>
                      <span className="text-muted-foreground/30 flex-shrink-0 text-xs">{item.provider}</span>
                      {isSelected && <Check size={11} className="text-primary flex-shrink-0 ml-0.5" />}
                    </div>
                  )}
                />
              </div>

              {/* Working directory */}
              <div>
                <FieldLabel hint="CLI 工具启动时的工作目录">工作目录</FieldLabel>
                <div className="flex items-center gap-0 rounded-[var(--radius-button)] border-[1.5px] border-input overflow-hidden">
                  <div className="flex items-center px-2.5 text-muted-foreground/30">
                    <FolderOpen size={11} />
                  </div>
                  <Input
                    value={config.workDir}
                    onChange={e => updateConfig(selectedCli, { workDir: e.target.value })}
                    className="flex-1 border-0 shadow-none focus-visible:ring-0 rounded-none p-0 py-1.5 pr-1 text-xs font-mono h-auto"
                    placeholder="选择工作目录..."
                  />
                  {config.workDir && (
                    <Button variant="ghost" size="icon-xs" onClick={() => updateConfig(selectedCli, { workDir: "" })} className="text-muted-foreground/50">
                      <X size={10} />
                    </Button>
                  )}
                  <div className="w-px h-4 bg-border/20" />
                  <Button variant="ghost" size="xs" onClick={() => updateConfig(selectedCli, { workDir: "/Users/demo/projects" })} className="text-[10px] text-muted-foreground/40 rounded-none h-auto py-1.5">
                    选择
                  </Button>
                </div>
              </div>

              {/* Terminal */}
              <div>
                <FieldLabel hint="选择命令执行的终端应用">终端</FieldLabel>
                <SelectDropdown
                  items={terminalOptions}
                  selectedId={config.terminal}
                  onSelect={(id) => updateConfig(selectedCli, { terminal: id })}
                  renderSelected={(item) => item && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs leading-none">{item.icon}</span>
                      <span className="text-foreground">{item.name}</span>
                    </div>
                  )}
                  renderItem={(item, isSelected) => (
                    <div className="flex items-center gap-2">
                      <span className="text-xs leading-none">{item.icon}</span>
                      <span className="flex-1">{item.name}</span>
                      {isSelected && <Check size={11} className="text-primary flex-shrink-0" />}
                    </div>
                  )}
                />
              </div>

              {/* Environment variables */}
              <div>
                <FieldLabel hint="每行一个，格式：KEY=value">环境变量</FieldLabel>
                <Textarea
                  value={config.envVars}
                  onChange={e => updateConfig(selectedCli, { envVars: e.target.value })}
                  rows={2}
                  className="w-full min-h-[unset] bg-transparent border border-border/30 rounded-[12px] px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus-visible:border-border/50 focus-visible:ring-0 transition-colors resize-none font-mono [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30"
                  placeholder={"KEY1=value1\nKEY2=value2"}
                />
              </div>

              {/* Check updates */}
              <Label className="flex items-center gap-2 cursor-pointer group">
                <Button
                  variant="ghost"
                  onClick={() => updateConfig(selectedCli, { checkUpdates: !config.checkUpdates })}
                  className={`w-3.5 h-3.5 p-0 h-auto rounded border flex items-center justify-center flex-shrink-0 transition-colors ${config.checkUpdates ? "bg-primary border-primary" : "border-border/40 hover:border-muted-foreground/35"}`}
                >
                  {config.checkUpdates && <Check size={8} className="text-primary-foreground" />}
                </Button>
                <span className="text-[10px] text-muted-foreground/40 group-hover:text-foreground/50 transition-colors">检查更新并安装最新版本</span>
              </Label>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-border/30 px-4 py-3 space-y-2.5">
              {/* Summary */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/30">
                <div className="flex items-center gap-1">
                  <Cpu size={9} />
                  <span>{selectedTool.name}</span>
                </div>
                <span className="text-border/30">&middot;</span>
                <div className="flex items-center gap-1 truncate">
                  <Sparkles size={8} />
                  <span className="truncate">{codeModels.find(m => m.id === config.model)?.name?.split("/").pop()}</span>
                </div>
                <span className="text-border/30">&middot;</span>
                <div className="flex items-center gap-1">
                  <Terminal size={9} />
                  <span>{terminalOptions.find(t => t.id === config.terminal)?.name}</span>
                </div>
              </div>

              {/* Launch button */}
              <Button
                onClick={handleLaunch}
                disabled={launching}
                className={`w-full gap-2 text-xs ${
                  launchSuccess ? "bg-success text-success-foreground" : ""
                }`}
              >
                {launchSuccess ? (
                  <div className="flex items-center gap-1.5">
                    <Check size={12} />
                    <span>已启动</span>
                  </div>
                ) : launching ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    <span>正在启动...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Play size={11} />
                    <span>启动</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}
