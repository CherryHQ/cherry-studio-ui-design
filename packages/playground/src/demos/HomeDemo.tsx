import React, { useState } from "react"
import { SimpleTooltip, Button, Input, Textarea, Switch, Checkbox, Label, Popover, PopoverTrigger, PopoverContent } from "@cherry-studio/ui"
import {
  Search, Plus, X, ChevronRight, ChevronDown, ChevronUp,
  Paperclip, Sparkles, ArrowRight,
  AtSign, SlidersHorizontal, FlaskConical, Cat, Brush,
  Brain, Link, Zap, Maximize2, MoreHorizontal,
  Hammer, Share2, Globe, RotateCcw,
  Image as ImageIcon, Bot, BookOpen, LayoutGrid, Languages,
} from "lucide-react"
import { Section, type PropDef } from "../components/Section"

// ===========================
// Data (matching src/features/chat/HomePage)
// ===========================

const AT_MODES = [
  { id: "regular", label: "常规", icon: SlidersHorizontal },
  { id: "webpage", label: "网页", icon: Globe },
  { id: "image", label: "图片", icon: ImageIcon },
  { id: "video", label: "视频", icon: Cat },
  { id: "enhance", label: "提示词增强", icon: Zap },
  { id: "agent", label: "智能体模式", icon: Bot },
]

const ALL_MODELS = [
  { id: "m1", name: "Gemini 3 Pro Preview", provider: "Google" },
  { id: "m2", name: "Gemini 3.1 Pro Preview", provider: "Google" },
  { id: "m3", name: "Gemini 3 Flash Preview", provider: "Google" },
  { id: "m4", name: "Gemini 2.5 Pro", provider: "Google" },
  { id: "m5", name: "Gemini 2.5 Flash", provider: "Google" },
  { id: "m6", name: "GPT 5.2", provider: "OpenAI" },
  { id: "m7", name: "GPT 5.2 Pro", provider: "OpenAI" },
  { id: "m8", name: "Claude Opus 4.6", provider: "Anthropic" },
  { id: "m9", name: "DeepSeek V3", provider: "DeepSeek" },
]

const MODES = [
  { id: "fast", label: "快速", icon: SlidersHorizontal },
  { id: "pro", label: "专业", icon: FlaskConical },
  { id: "agent", label: "智能体", icon: Cat },
  { id: "draw", label: "绘图", icon: Brush },
]

const PLUS_MENU_ITEMS: { id: string; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; shortcut: string | null; separator?: boolean }[] = [
  { id: "attach", label: "添加图片或附件", icon: Paperclip, shortcut: null, separator: true },
  { id: "genimg", label: "生成图片", icon: ImageIcon, shortcut: null },
  { id: "reasoning", label: "推理", icon: Brain, shortcut: null },
  { id: "websearch", label: "网络搜索", icon: Globe, shortcut: null },
  { id: "knowledge", label: "知识库", icon: BookOpen, shortcut: null },
  { id: "mcp", label: "MCP", icon: Hammer, shortcut: null },
  { id: "webcontext", label: "网页上下文", icon: Link, shortcut: null },
]

const PLUS_MENU_SECONDARY = [
  { id: "quickphrase", label: "快捷短语", icon: Zap, shortcut: null as string | null },
  { id: "expand", label: "展开输入框", icon: Maximize2, shortcut: "⌘⇧E" },
  { id: "clearctx", label: "清除上下文", icon: RotateCcw, shortcut: "⌘K" },
]

// ===========================
// Props
// ===========================
const homeProps: PropDef[] = [
  { name: "onSend", type: "(text: string) => void", default: "-", description: "Send message handler" },
  { name: "activeMode", type: '"fast" | "pro" | "agent" | "draw"', default: '"fast"', description: "Active input mode" },
  { name: "onModeChange", type: "(mode: string) => void", default: "-", description: "Mode change handler" },
]

// ===========================
// Main Demo
// ===========================
export function HomeDemo() {
  const [inputText, setInputText] = useState("")
  const [activeMode, setActiveMode] = useState("fast")
  const [showPlusMenu, setShowPlusMenu] = useState(false)

  const [isExpanded, setIsExpanded] = useState(false)
  const [showAtMenu, setShowAtMenu] = useState(false)
  const [showPlusMore, setShowPlusMore] = useState(false)
  const [selectedModels, setSelectedModels] = useState<string[]>(["m1", "m2", "m3", "m5"])
  const [atSearchText, setAtSearchText] = useState("")
  const [atMode, setAtMode] = useState("regular")
  const [atMultiSelect, setAtMultiSelect] = useState(false)

  const filteredAtModels = ALL_MODELS.filter(m =>
    !atSearchText || m.name.toLowerCase().includes(atSearchText.toLowerCase())
  )

  const toggleModel = (id: string) => {
    if (atMultiSelect) {
      setSelectedModels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
      setSelectedModels(prev => prev.includes(id) ? [] : [id])
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
    e.currentTarget.style.height = "auto"
    e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 160) + "px"
  }

  return (
    <Section title="Home Page" install="npm install @cherry-studio/ui" props={homeProps} code={`// Centered prompt input card with mode pills, @ model picker, + menu
<div className="flex-1 flex flex-col items-center justify-center">
  <div className="w-full max-w-[640px] flex flex-col items-center gap-4">
    <div className="w-full rounded-[24px] border bg-background shadow-sm relative">
      <Textarea placeholder="请输入你想要了解的问题" />
      <div className="flex items-center justify-between px-3 pb-2.5">
        <div className="flex gap-0.5">{/* +, @ */}</div>
        <div className="flex gap-1">{/* stats, translate, layout, send */}</div>
      </div>
    </div>
    <div className="flex gap-2">{/* mode pills */}</div>
  </div>
</div>`}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-[420px] overflow-y-auto">
          <div className="w-full max-w-[640px] flex flex-col items-center gap-4">

            {/* Input Card */}
            <div className="w-full rounded-[24px] border border-border/60 bg-background shadow-sm relative">

              {/* Textarea */}
              <div className="px-4 pt-3.5 pb-1">
                <Textarea
                  value={inputText}
                  onChange={handleInput}
                  placeholder="请输入你想要了解的问题"
                  rows={2}
                  className="w-full min-h-0 resize-none border-0 bg-transparent p-0 text-sm text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 [&::-webkit-scrollbar]:hidden transition-[min-height] duration-200"
                  style={{ minHeight: isExpanded ? "180px" : "52px" }}
                />
              </div>

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
                <div className="flex items-center gap-0.5">
                  {/* Plus button */}
                  <Popover open={showPlusMenu} onOpenChange={v => { setShowPlusMenu(v); if (!v) setShowPlusMore(false) }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className={`w-7 h-7 ${
                          showPlusMenu
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <Plus size={16} strokeWidth={1.6} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-0 py-1" side="top" align="start">
                      <div className="px-1 flex flex-col">
                        {PLUS_MENU_ITEMS.map((item, idx) => {
                          const Icon = item.icon
                          return (
                            <div key={item.id}>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setShowPlusMenu(false)}
                                className="w-full justify-start gap-2 px-2 py-[5px] text-xs"
                              >
                                <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.shortcut && (
                                  <span className="text-xs text-muted-foreground/60 tracking-wider">{item.shortcut}</span>
                                )}
                              </Button>
                              {item.separator && idx < PLUS_MENU_ITEMS.length - 1 && (
                                <div className="my-0.5 mx-1.5 border-t border-border/60" />
                              )}
                            </div>
                          )
                        })}
                        <div className="my-0.5 mx-1.5 border-t border-border/60" />
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="xs"
                            onMouseEnter={() => setShowPlusMore(true)}
                            onMouseLeave={() => setShowPlusMore(false)}
                            className="w-full justify-start gap-2 px-2 py-[5px] text-xs"
                          >
                            <MoreHorizontal size={13} strokeWidth={1.5} className="flex-shrink-0" />
                            <span className="flex-1 text-left">更多</span>
                            <ChevronRight size={12} />
                          </Button>
                          {showPlusMore && (
                            <div
                              onMouseEnter={() => setShowPlusMore(true)}
                              onMouseLeave={() => setShowPlusMore(false)}
                              className="absolute left-full bottom-0 ml-1.5 w-40 bg-popover border border-border rounded-[12px] shadow-lg py-1 z-50 animate-in fade-in slide-in-from-left-1 duration-100"
                            >
                              <div className="px-1 flex flex-col">
                                {PLUS_MENU_SECONDARY.map(item => {
                                  const Icon = item.icon
                                  return (
                                    <Button
                                      key={item.id}
                                      variant="ghost"
                                      size="xs"
                                      onClick={() => {
                                        if (item.id === "expand") { setIsExpanded(v => !v) }
                                        setShowPlusMenu(false)
                                        setShowPlusMore(false)
                                      }}
                                      className="w-full justify-start gap-2 px-2 py-[5px] text-xs"
                                    >
                                      <Icon size={13} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                                      <span className="flex-1 text-left">{item.label}</span>
                                      {item.shortcut && (
                                        <span className="text-xs text-muted-foreground/60 tracking-wider">{item.shortcut}</span>
                                      )}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {/* @ button + model picker */}
                  <Popover open={showAtMenu} onOpenChange={v => { setShowAtMenu(v); if (!v) { setAtSearchText(""); setAtMode("regular"); setAtMultiSelect(false) } }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className={`w-7 h-7 ${
                          showAtMenu ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <AtSign size={16} strokeWidth={1.6} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[380px] p-0 overflow-hidden flex flex-col" side="top" align="start">
                      {/* Title bar */}
                      <div className="px-4 pt-3 pb-1.5">
                        <h3 className="text-xs text-foreground" style={{ fontWeight: 600 }}>模式与模型</h3>
                      </div>
                      {/* Two-panel body */}
                      <div className="flex flex-1 min-h-0">
                        {/* Left: Mode navigation */}
                        <div className="w-[120px] flex flex-col pl-1.5 pr-1 pb-1.5">
                          {AT_MODES.map(mode => {
                            const MIcon = mode.icon
                            const isActive = atMode === mode.id
                            return (
                              <Button key={mode.id} variant="ghost" size="sm" onClick={() => setAtMode(mode.id)}
                                className={`w-full justify-start gap-2 px-2.5 rounded-[12px] text-xs font-normal ${
                                  isActive
                                    ? "bg-accent text-foreground"
                                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                                }`}>
                                <MIcon size={13} strokeWidth={1.5} className="flex-shrink-0" />
                                <span className="truncate">{mode.label}</span>
                              </Button>
                            )
                          })}
                        </div>
                        {/* Right: Search + Model list */}
                        <div className="flex-1 flex flex-col min-w-0 pr-2.5 pb-1.5">
                          <div className="pb-1.5">
                            <div className="flex items-center gap-1.5 px-2.5 h-[28px] bg-muted/30 rounded-[12px] border border-border/40">
                              <Search size={12} className="text-muted-foreground/40 flex-shrink-0" />
                              <Input type="text" value={atSearchText} onChange={e => setAtSearchText(e.target.value)}
                                placeholder="搜索" className="flex-1 border-0 bg-transparent h-auto px-0 py-0 text-xs text-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0" autoFocus />
                              {atSearchText && <Button variant="ghost" size="icon-xs" onClick={() => setAtSearchText("")} className="size-5 text-muted-foreground hover:text-foreground"><X size={10} /></Button>}
                            </div>
                          </div>
                          <div className="flex items-center justify-between px-0.5 pb-1">
                            <Label className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                              <span>多选</span>
                              <Switch checked={atMultiSelect} onCheckedChange={() => setAtMultiSelect(v => !v)} className="scale-75" />
                            </Label>
                            {selectedModels.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">已选 {selectedModels.length} 个</span>
                            )}
                          </div>
                          <div className="flex-1 max-h-[200px] overflow-y-auto space-y-[1px] px-0.5 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
                            {filteredAtModels.length === 0 ? (
                              <div className="py-6 text-center text-xs text-muted-foreground/50">无结果</div>
                            ) : filteredAtModels.map(item => {
                              const sel = selectedModels.includes(item.id)
                              return (
                                <Button key={item.id} variant="ghost" size="sm" onClick={() => toggleModel(item.id)}
                                  className={`w-full justify-start gap-2 px-2.5 rounded-[12px] text-xs font-normal transition-all group ${
                                    sel ? "bg-primary/10" : "hover:bg-accent/40"
                                  }`}>
                                  <Sparkles size={12} strokeWidth={1.8} className={`flex-shrink-0 ${sel ? "text-primary" : "text-muted-foreground/30"}`} />
                                  <span className={`flex-1 text-xs truncate ${sel ? "text-foreground" : "text-muted-foreground"}`}>{item.name}</span>
                                  <Globe size={10} className="text-muted-foreground/50 flex-shrink-0" />
                                  <Checkbox checked={sel} className="size-4" />
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      {/* Bottom status bar */}
                      <div className="border-t border-border/40 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-[12px]">
                            {(() => { const am = AT_MODES.find(m => m.id === atMode); const Icon = am?.icon || SlidersHorizontal; return <Icon size={11} strokeWidth={1.5} className="text-muted-foreground" /> })()}
                            <span className="text-[10px] text-foreground">{AT_MODES.find(m => m.id === atMode)?.label}</span>
                          </div>
                          {selectedModels.length > 0 && (
                            <div className="flex items-center gap-0.5">
                              {selectedModels.slice(0, 5).map(id => (
                                <Sparkles key={id} size={9} className="text-primary/70" />
                              ))}
                              {selectedModels.length > 5 && <span className="text-xs text-muted-foreground ml-0.5">+{selectedModels.length - 5}</span>}
                            </div>
                          )}
                          <ChevronUp size={11} className="text-muted-foreground/50" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            <span className="text-[10px] text-muted-foreground">x{Math.max(selectedModels.length, 1)}</span>
                            <ChevronDown size={10} className="text-muted-foreground/50" />
                          </div>
                          <Button variant="ghost" size="icon-xs" className="w-6 h-6 rounded-[12px] text-muted-foreground/50 hover:text-foreground hover:bg-accent/50">
                            <Share2 size={12} strokeWidth={1.5} />
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-1">
                  {/* Stats with tooltip */}
                  <SimpleTooltip content="上下文 2/5 · 预估 Token 78" side="top">
                    <Button
                      variant="ghost"
                      size="xs"
                      className="h-7 gap-1.5 px-1.5 text-xs font-normal text-muted-foreground/70 hover:text-muted-foreground select-none"
                    >
                      <span className="flex items-center gap-0.5">{"\u2261"} 2/5</span>
                      <span className="flex items-center gap-0.5">{"\u2191"} 78/78</span>
                    </Button>
                  </SimpleTooltip>
                  {/* Translate */}
                  <SimpleTooltip content="翻译" side="bottom">
                    <Button variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => setActiveMode("translate")}>
                      <Languages size={14} strokeWidth={1.6} />
                    </Button>
                  </SimpleTooltip>
                  {/* Layout grid */}
                  <SimpleTooltip content="布局" side="bottom">
                    <Button variant="ghost" size="icon-xs" className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => setActiveMode("draw")}>
                      <LayoutGrid size={14} strokeWidth={1.6} />
                    </Button>
                  </SimpleTooltip>
                  {/* Send */}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={!inputText.trim()}
                    onClick={() => { if (inputText.trim()) { setInputText("") } }}
                    className={`w-7 h-7 rounded-full ml-0.5 ${
                      inputText.trim()
                        ? "bg-primary text-primary-foreground hover:opacity-80"
                        : "bg-muted text-muted-foreground/50"
                    }`}
                  >
                    <ArrowRight size={14} strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mode pills */}
            <div className="flex items-center gap-2">
              {MODES.map(mode => {
                const Icon = mode.icon
                const isActive = activeMode === mode.id
                return (
                  <Button
                    key={mode.id}
                    variant={isActive ? "default" : "ghost"}
                    size="xs"
                    onClick={() => setActiveMode(mode.id)}
                    className={`rounded-full px-3 text-xs ${
                      isActive
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <Icon size={11} strokeWidth={1.8} />
                    <span>{mode.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
