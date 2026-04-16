import React, { useState } from "react"
import {
  Button, Input, Badge, Switch, Textarea,
  ConfigSection, FormRow, PanelHeader,
  Slider, Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@cherry-studio/ui"
import { Section } from "../components/Section"
import {
  ArrowLeft, Save, Settings, FileText, Wrench, SlidersHorizontal, BookOpen,
  ChevronRight, Plus, Check, Search,
  Terminal, Code2, Globe, Database, FolderSearch, FileEdit,
  Network, GitBranch, Bug, Zap, Eye, Cpu, Lock,
} from "lucide-react"

// ── Types ──
type SectionId = "basic" | "prompt" | "knowledge" | "tools" | "advanced"
interface ToolItem { id: string; name: string; desc: string; icon: React.ElementType; enabled: boolean; category: string }

const SECTIONS: { id: SectionId; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "basic", label: "基础设置", desc: "名称、头像、模型参数", icon: Settings },
  { id: "prompt", label: "提示词", desc: "系统提示词、变量", icon: FileText },
  { id: "knowledge", label: "知识库", desc: "关联知识库、检索策略", icon: BookOpen },
  { id: "tools", label: "工具", desc: "MCP 服务与工具配置", icon: Wrench },
  { id: "advanced", label: "高级设置", desc: "执行限制、运行参数", icon: SlidersHorizontal },
]

const AVATARS = ["🤖", "🧠", "⚡", "🎯", "🔬", "🛠️", "📊", "🌐"]
const MODELS = ["Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash", "Claude Opus", "GPT-4o Mini"]

const TOOLS: ToolItem[] = [
  { id: "bash", name: "Shell 终端", desc: "执行 Bash/Zsh 命令", icon: Terminal, enabled: true, category: "执行环境" },
  { id: "code-exec", name: "代码执行", desc: "Python/Node.js 沙箱", icon: Code2, enabled: true, category: "执行环境" },
  { id: "sandbox", name: "隔离沙箱", desc: "安全隔离执行环境", icon: Lock, enabled: false, category: "执行环境" },
  { id: "file-edit", name: "文件编辑", desc: "读写文件内容", icon: FileEdit, enabled: true, category: "文件操作" },
  { id: "file-search", name: "文件检索", desc: "全局搜索文件", icon: FolderSearch, enabled: true, category: "文件操作" },
  { id: "browser", name: "浏览器", desc: "访问网页和截图", icon: Globe, enabled: false, category: "网络与数据" },
  { id: "http-req", name: "HTTP 请求", desc: "REST API 调用", icon: Network, enabled: true, category: "网络与数据" },
  { id: "database", name: "数据库", desc: "SQL/NoSQL 查询", icon: Database, enabled: false, category: "网络与数据" },
  { id: "web-search", name: "联网搜索", desc: "实时搜索引擎", icon: Search, enabled: true, category: "网络与数据" },
  { id: "git-ops", name: "Git 操作", desc: "版本控制和提交", icon: GitBranch, enabled: true, category: "开发工具" },
  { id: "debugger", name: "调试器", desc: "断点和变量检查", icon: Bug, enabled: false, category: "开发工具" },
  { id: "test-runner", name: "测试运行", desc: "自动化测试执行", icon: Zap, enabled: false, category: "开发工具" },
  { id: "linter", name: "代码检查", desc: "Lint 和格式化", icon: Eye, enabled: true, category: "开发工具" },
  { id: "cpu-compute", name: "计算资源", desc: "GPU/CPU 调度", icon: Cpu, enabled: false, category: "计算资源" },
]

const KNOWLEDGE_BASES = [
  { id: "kb-1", name: "项目文档", docs: 128, size: "24 MB", active: true },
  { id: "kb-2", name: "API 参考", docs: 56, size: "8 MB", active: true },
  { id: "kb-3", name: "内部 Wiki", docs: 342, size: "67 MB", active: false },
]

const TAG_PRESETS = ["编程", "数据分析", "写作", "工具", "自动化", "研究"]

// ── Component ──
export function AgentConfigDemo() {
  const [active, setActive] = useState<SectionId>("basic")
  const [name, setName] = useState("代码审查 Agent")
  const [desc, setDesc] = useState("自动审查 PR 并提供改进建议")
  const [avatar, setAvatar] = useState("🤖")
  const [tags, setTags] = useState(["编程", "工具"])
  const [planModel, setPlanModel] = useState("Claude 3.5 Sonnet")
  const [execModel, setExecModel] = useState("GPT-4o")
  const [temp, setTemp] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [tools, setTools] = useState(TOOLS)
  const [toolSearch, setToolSearch] = useState("")
  const [kbs, setKbs] = useState(KNOWLEDGE_BASES)
  const [systemPrompt, setSystemPrompt] = useState("你是一个专业的代码审查助手。你的任务是审查代码变更，找出潜在问题，并提供改进建议。\n\n审查时请关注：\n1. 代码质量和可维护性\n2. 潜在的 bug 和安全漏洞\n3. 性能优化机会\n4. 最佳实践和设计模式")
  const [maxSteps, setMaxSteps] = useState(10)
  const [timeout_, setTimeout_] = useState(300)
  const [saved, setSaved] = useState(false)

  const toggleTool = (id: string) => setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
  const toggleKb = (id: string) => setKbs(prev => prev.map(k => k.id === id ? { ...k, active: !k.active } : k))
  const toggleTag = (tag: string) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  const handleSave = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) }

  const filteredTools = tools.filter(t =>
    !toolSearch || t.name.toLowerCase().includes(toolSearch.toLowerCase()) || t.category.toLowerCase().includes(toolSearch.toLowerCase())
  )
  const grouped = filteredTools.reduce<Record<string, ToolItem[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  return (
    <Section title="Agent Configuration" props={[
      { name: "resource", type: "ResourceItem", description: "Agent 资源对象" },
      { name: "onBack", type: "() => void", description: "返回回调" },
    ]}>
      <div className="border rounded-[24px] overflow-hidden bg-background min-h-[560px] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border/15 shrink-0">
          <Button variant="ghost" size="icon-xs"><ArrowLeft size={14} /></Button>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/50 tracking-tight">
            <span className="hover:text-foreground cursor-pointer">资源库</span>
            <ChevronRight size={9} />
            <span className="text-foreground">{name}</span>
            <span className="text-muted-foreground/35 ml-1">(智能体)</span>
          </div>
          <div className="flex-1" />
          {saved && <span className="text-[11px] text-success tracking-tight">已保存</span>}
          <Button variant="secondary" size="xs">取消</Button>
          <Button size="xs" className="gap-1" onClick={handleSave}><Save size={10} />保存</Button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar Nav */}
          <div className="w-[180px] shrink-0 border-r border-border/10 p-3 overflow-y-auto">
            {SECTIONS.map(s => {
              const isActive = active === s.id
              return (
                <Button variant="ghost" key={s.id} onClick={() => setActive(s.id)}
                  className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[12px] text-left transition-all mb-0.5 ${
                    isActive ? "bg-accent/50 text-foreground" : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/20"
                  }`}>
                  <s.icon size={14} strokeWidth={1.5} className={isActive ? "text-foreground/60" : "text-muted-foreground/35"} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] tracking-tight">{s.label}</div>
                    <div className={`text-[9px] truncate ${isActive ? "text-muted-foreground/50" : "text-muted-foreground/25"}`}>{s.desc}</div>
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* ── Basic ── */}
            {active === "basic" && (
              <div className="max-w-lg space-y-5">
                <div>
                  <h3 className="text-[14px] text-foreground mb-1 tracking-tight">基础设置</h3>
                  <p className="text-[11px] text-muted-foreground/55 tracking-tight">配置智能体的身份信息和模型</p>
                </div>

                <ConfigSection title="头像">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-[12px] bg-accent/50 flex items-center justify-center text-xl">{avatar}</div>
                    <div className="flex flex-wrap gap-1">
                      {AVATARS.map(a => (
                        <Button variant="ghost" key={a} onClick={() => setAvatar(a)}
                          className={`h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-[10px] flex items-center justify-center text-sm transition-all ${avatar === a ? "bg-accent ring-1 ring-primary/20" : "hover:bg-accent/40"}`}>{a}</Button>
                      ))}
                    </div>
                  </div>
                </ConfigSection>

                <ConfigSection title="名称">
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </ConfigSection>

                <ConfigSection title="简介">
                  <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                    className="w-full rounded-[12px] text-[13px] tracking-tight resize-none" />
                </ConfigSection>

                <ConfigSection title="标签">
                  <div className="flex flex-wrap gap-1">
                    {TAG_PRESETS.map(t => (
                      <Badge key={t} variant={tags.includes(t) ? "default" : "outline"}
                        className="cursor-pointer text-[10px]" onClick={() => toggleTag(t)}>
                        {tags.includes(t) && <Check size={8} />}{t}
                      </Badge>
                    ))}
                  </div>
                </ConfigSection>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground/60 tracking-tight">模型配置</span>
                    <div className="flex-1 h-px bg-border/10" />
                  </div>
                  <FormRow label="规划模型" desc="负责任务拆解和决策">
                    <Select value={planModel} onValueChange={setPlanModel}>
                      <SelectTrigger className="w-48 h-auto px-3 py-1.5 rounded-[10px] text-[11px] tracking-tight">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormRow>
                  <FormRow label="执行模型" desc="负责主要推理和执行">
                    <Select value={execModel} onValueChange={setExecModel}>
                      <SelectTrigger className="w-48 h-auto px-3 py-1.5 rounded-[10px] text-[11px] tracking-tight">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormRow>
                  <FormRow label="Temperature" desc={`${temp}`}>
                    <Slider value={[temp]} onValueChange={v => setTemp(v[0])} min={0} max={2} step={0.1} className="w-48" />
                  </FormRow>
                  <FormRow label="Max Tokens" desc={`${maxTokens}`}>
                    <Slider value={[maxTokens]} onValueChange={v => setMaxTokens(v[0])} min={256} max={16384} step={256} className="w-48" />
                  </FormRow>
                </div>
              </div>
            )}

            {/* ── Prompt ── */}
            {active === "prompt" && (
              <div className="max-w-lg space-y-5">
                <div>
                  <h3 className="text-[14px] text-foreground mb-1 tracking-tight">提示词</h3>
                  <p className="text-[11px] text-muted-foreground/55 tracking-tight">配置智能体的系统提示词和行为指令</p>
                </div>
                <ConfigSection title="系统提示词">
                  <Textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={8}
                    className="w-full rounded-[12px] text-[13px] tracking-tight leading-relaxed resize-none font-mono" />
                  <p className="text-[10px] text-muted-foreground/40 mt-1.5 tracking-tight">{systemPrompt.length} 字符</p>
                </ConfigSection>
              </div>
            )}

            {/* ── Knowledge ── */}
            {active === "knowledge" && (
              <div className="max-w-lg space-y-5">
                <div>
                  <h3 className="text-[14px] text-foreground mb-1 tracking-tight">知识库</h3>
                  <p className="text-[11px] text-muted-foreground/55 tracking-tight">关联知识库以增强检索能力</p>
                </div>
                <div className="space-y-2">
                  {kbs.map(kb => (
                    <div key={kb.id} className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] border border-border/20 hover:border-border/40 transition-all">
                      <div className="w-8 h-8 rounded-[10px] bg-accent-blue-muted flex items-center justify-center">
                        <BookOpen size={14} className="text-accent-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium tracking-tight">{kb.name}</p>
                        <p className="text-[10px] text-muted-foreground/50 tracking-tight">{kb.docs} 文档 · {kb.size}</p>
                      </div>
                      <Switch checked={kb.active} onCheckedChange={() => toggleKb(kb.id)} />
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="xs" className="gap-1"><Plus size={10} />添加知识库</Button>
              </div>
            )}

            {/* ── Tools ── */}
            {active === "tools" && (
              <div className="max-w-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] text-foreground mb-1 tracking-tight">工具配置</h3>
                    <p className="text-[11px] text-muted-foreground/55 tracking-tight">选择智能体可使用的工具</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {tools.filter(t => t.enabled).length}/{tools.length} 已启用
                  </Badge>
                </div>

                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input value={toolSearch} onChange={e => setToolSearch(e.target.value)}
                    placeholder="搜索工具..." className="pl-7 h-8 text-[11px]" />
                </div>

                <Accordion type="multiple" defaultValue={Object.keys(grouped)}>
                  {Object.entries(grouped).map(([category, items]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="text-[11px] py-2">
                        <span className="flex items-center gap-2">
                          {category}
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">{items.filter(t => t.enabled).length}/{items.length}</Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pb-2">
                          {items.map(tool => {
                            const Icon = tool.icon
                            return (
                              <div key={tool.id} className="flex items-center gap-3 px-3 py-2 rounded-[10px] hover:bg-accent/30 transition-colors">
                                <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 ${tool.enabled ? "bg-accent-blue-muted" : "bg-muted"}`}>
                                  <Icon size={13} className={tool.enabled ? "text-accent-blue" : "text-muted-foreground/40"} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] tracking-tight">{tool.name}</p>
                                  <p className="text-[9px] text-muted-foreground/45 tracking-tight">{tool.desc}</p>
                                </div>
                                <Switch checked={tool.enabled} onCheckedChange={() => toggleTool(tool.id)} />
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* ── Advanced ── */}
            {active === "advanced" && (
              <div className="max-w-lg space-y-5">
                <div>
                  <h3 className="text-[14px] text-foreground mb-1 tracking-tight">高级设置</h3>
                  <p className="text-[11px] text-muted-foreground/55 tracking-tight">执行限制和运行参数</p>
                </div>
                <FormRow label="最大步骤" desc={`最多执行 ${maxSteps} 步`}>
                  <Slider value={[maxSteps]} onValueChange={v => setMaxSteps(v[0])} min={1} max={50} step={1} className="w-48" />
                </FormRow>
                <FormRow label="超时时间" desc={`${timeout_} 秒`}>
                  <Slider value={[timeout_]} onValueChange={v => setTimeout_(v[0])} min={30} max={1800} step={30} className="w-48" />
                </FormRow>
                <FormRow label="错误重试">
                  <Switch defaultChecked />
                </FormRow>
                <FormRow label="并行执行">
                  <Switch />
                </FormRow>
                <FormRow label="详细日志">
                  <Switch defaultChecked />
                </FormRow>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
