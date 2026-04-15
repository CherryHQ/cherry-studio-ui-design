import React, { useState } from "react"
import {
  Button, Switch, ConfigSection, FormRow, InlineSelect, Textarea,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@cherry-studio/ui"
import {
  Languages, Brain, ChevronDown, Check, Sparkles,
  Volume2, Copy, ArrowLeftRight, ArrowRight,
  Star, Clock, History, Settings2,
} from "lucide-react"
import { Section, type PropDef } from "../components/Section"

// ===========================
// Data (matching src/features/translate/TranslatePage)
// ===========================
const EXPERTS = [
  { id: "smart", label: "智能选择 (通用)" },
  { id: "yiyi", label: "意译大师" },
  { id: "summary", label: "段落总结专家" },
  { id: "simplify", label: "英文简化大师" },
  { id: "tech", label: "科技类翻译大师" },
  { id: "academic", label: "学术论文翻译师" },
  { id: "news", label: "新闻媒体译者" },
  { id: "techdoc", label: "技术文档翻译师" },
  { id: "medical", label: "医学专业译者" },
  { id: "business", label: "商务翻译专家" },
  { id: "poetry", label: "诗歌文学译者" },
  { id: "colloquial", label: "口语化翻译" },
  { id: "newsbrief", label: "新闻快讯翻译" },
  { id: "gamelocal", label: "游戏本地化" },
  { id: "web3", label: "Web3 / 区块链" },
]

const MODELS = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", icon: "G" },
  { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", icon: "C" },
  { id: "gpt-5.1", name: "GPT-5.1", icon: "O" },
  { id: "deepseek-v3", name: "DeepSeek V3", icon: "D" },
  { id: "qwen-max", name: "Qwen Max", icon: "Q" },
]

const TRANSLATE_HISTORY = [
  { id: 0, source: "人工智能正在改变我们的生活方式，从智能家居到自动驾驶，技术的进步让我们的日常变得更加便捷和高效。", translated: "Artificial intelligence is transforming the way we live. From smart homes to autonomous driving, technological advances are making our daily lives more convenient and efficient.", srcLang: "中文", tgtLang: "英语", expert: "智能选择 (通用)", model: "gemini-2.5-pro", time: "10:32" },
  { id: 1, source: "The quick brown fox jumps over the lazy dog.", translated: "敏捷的棕色狐狸跳过了懒惰的狗。", srcLang: "英语", tgtLang: "中文", expert: "意译大师", model: "claude-sonnet-4.5", time: "10:15" },
  { id: 2, source: "桜の花が満開になると、日本中が春の訪れを感じます。", translated: "当樱花盛开时，整个日本都能感受到春天的到来。", srcLang: "日语", tgtLang: "中文", expert: "科技类翻译大师", model: "gpt-5.1", time: "09:48" },
  { id: 3, source: "La vie est belle quand on sait apprecier les petites choses.", translated: "当我们懂得欣赏日常中的小事时，生活是美好的。", srcLang: "法语", tgtLang: "中文", expert: "智能选择 (通用)", model: "gemini-2.5-pro", time: "09:20" },
]

const LANG_FLAGS: Record<string, string> = {
  "自动检测": "🌐", "中文": "🇨🇳", "英语": "🇬🇧", "日语": "🇯🇵",
  "韩语": "🇰🇷", "法语": "🇫🇷", "德语": "🇩🇪", "西班牙语": "🇪🇸",
}

const LANGUAGES = ["自动检测", "中文", "英语", "日语", "韩语", "法语", "德语", "西班牙语"]
const TARGET_LANGUAGES = LANGUAGES.filter(l => l !== "自动检测")

// ===========================
// Props
// ===========================
const translateProps: PropDef[] = [
  { name: "sourceLang", type: "string", default: '"自动检测"', description: "Source language" },
  { name: "targetLang", type: "string", default: '"英语"', description: "Target language" },
  { name: "expert", type: "string", default: '"smart"', description: "Translation expert preset" },
  { name: "onTranslate", type: "(text: string) => void", default: "-", description: "Translate handler" },
]

// ===========================
// Language Selector
// ===========================
function LangSelector({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void; options: string[]; label: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button variant="ghost" type="button"
        onClick={() => setOpen(v => !v)}
        className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] hover:bg-accent/50 transition-colors text-[13px] tracking-tight"
      >
        <span>{LANG_FLAGS[value] || "🌐"}</span>
        <span className="text-foreground">{value}</span>
        <ChevronDown size={11} className="text-muted-foreground/40" />
      </Button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-popover border border-border rounded-[24px] shadow-popover z-50 py-1 max-h-[240px] overflow-y-auto">
          <p className="px-3 py-1 text-[11px] text-muted-foreground/50 tracking-tight">{label}</p>
          {options.map(lang => (
            <Button variant="ghost" type="button"
              key={lang}
              onClick={() => { onChange(lang); setOpen(false) }}
              className={`h-auto px-0 py-0 font-normal tracking-normal w-full text-left px-3 py-1.5 text-[13px] tracking-tight flex items-center gap-2 rounded-[12px] mx-1 transition-colors ${
                lang === value ? "bg-accent text-foreground" : "text-foreground/70 hover:bg-accent/50"
              }`}
              style={{ width: "calc(100% - 8px)" }}
            >
              <span>{LANG_FLAGS[lang] || "🌐"}</span>
              <span>{lang}</span>
              {lang === value && <Check size={11} className="text-foreground/60 ml-auto" />}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

// ===========================
// Main Demo
// ===========================
export function TranslateModuleDemo() {
  const [sourceLang, setSourceLang] = useState("自动检测")
  const [targetLang, setTargetLang] = useState("英语")
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedExpert, setSelectedExpert] = useState("smart")
  const [showExpertDropdown, setShowExpertDropdown] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro")
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<"all" | "starred">("all")
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set([0, 2]))
  const [mdPreview, setMdPreview] = useState(false)
  const [autoCopy, setAutoCopy] = useState(false)
  const [scrollSync, setScrollSync] = useState(true)
  const [detectMethod, setDetectMethod] = useState("auto")

  const currentExpert = EXPERTS.find(e => e.id === selectedExpert) || EXPERTS[0]

  const handleTranslate = () => {
    if (!sourceText.trim()) return
    setIsTranslating(true)
    setTimeout(() => {
      setTranslatedText(`Mock translation of "${sourceText.slice(0, 30)}..." using "${currentExpert.label}" into ${targetLang}.`)
      setIsTranslating(false)
    }, 800)
  }

  const handleSwapLangs = () => {
    if (sourceLang === "自动检测") return
    const tmp = sourceLang
    setSourceLang(targetLang)
    setTargetLang(tmp)
    if (translatedText) {
      const tmpText = sourceText
      setSourceText(translatedText)
      setTranslatedText(tmpText)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const toggleStar = (id: number) => {
    setStarredIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <Section title="Translate Module" install="npm install @cherry-studio/ui" props={translateProps} code={`// Toolbar: source lang ↔ target lang | expert | model
// Dual-pane: source textarea | translated output
// Bottom: char count | copy | speak
// History panel (collapsible)`}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        <div className="flex-1 flex min-h-0 relative">
          {/* Main translate area */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">

            {/* Top bar (matching original) */}
            <div className="h-11 flex items-center justify-between px-4 flex-shrink-0 border-b border-border/40">
              <div className="flex items-center gap-2 text-xs min-w-0">
                <Languages size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-foreground text-[13px] tracking-tight flex-shrink-0">翻译</span>
                <span className="text-muted-foreground/30 flex-shrink-0">·</span>
                {/* Expert dropdown */}
                <div className="relative flex-shrink-0">
                  <Button variant="ghost" type="button"
                    onClick={() => setShowExpertDropdown(v => !v)}
                    className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-1.5 py-0.5 rounded-[10px] hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Brain size={11} className="text-foreground/60" />
                    <span className="max-w-[110px] truncate text-[11px] tracking-tight">{currentExpert.label}</span>
                    <ChevronDown size={9} className="text-muted-foreground/40" />
                  </Button>
                  {showExpertDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-[24px] shadow-popover z-50 py-1 max-h-[340px] overflow-y-auto">
                      {EXPERTS.map(e => (
                        <Button variant="ghost" type="button"
                          key={e.id}
                          onClick={() => { setSelectedExpert(e.id); setShowExpertDropdown(false) }}
                          className={`h-auto px-0 py-0 font-normal tracking-normal w-full text-left px-3 py-1.5 text-[11px] tracking-tight flex items-center gap-1.5 rounded-[12px] mx-1 transition-colors ${
                            e.id === selectedExpert ? "bg-accent text-foreground" : "text-foreground/70 hover:bg-accent/50"
                          }`}
                          style={{ width: "calc(100% - 8px)" }}
                        >
                          {e.id === selectedExpert ? <Check size={11} className="text-foreground/60 flex-shrink-0" /> : <span className="w-[11px] flex-shrink-0" />}
                          <span>{e.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Model selector */}
                <div className="relative flex-shrink-0">
                  <Button variant="ghost" type="button"
                    onClick={() => setShowModelDropdown(v => !v)}
                    className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-1.5 py-0.5 rounded-[10px] hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Sparkles size={11} className="text-foreground/60" />
                    <span className="max-w-[100px] truncate text-[11px] tracking-tight">{MODELS.find(m => m.id === selectedModel)?.name}</span>
                    <ChevronDown size={9} className="text-muted-foreground/40" />
                  </Button>
                  {showModelDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-[24px] shadow-popover z-50 py-1 max-h-[280px] overflow-y-auto">
                      {MODELS.map(m => (
                        <Button variant="ghost" type="button"
                          key={m.id}
                          onClick={() => { setSelectedModel(m.id); setShowModelDropdown(false) }}
                          className={`h-auto px-0 py-0 font-normal tracking-normal w-full text-left px-3 py-1.5 text-[11px] tracking-tight flex items-center gap-2 rounded-[12px] mx-1 transition-colors ${
                            m.id === selectedModel ? "bg-accent text-foreground" : "text-foreground/70 hover:bg-accent/50"
                          }`}
                          style={{ width: "calc(100% - 8px)" }}
                        >
                          <span className="w-4 h-4 rounded-full bg-accent-blue-muted text-accent-blue text-[9px] font-bold flex items-center justify-center flex-shrink-0">{m.icon}</span>
                          <span>{m.name}</span>
                          {m.id === selectedModel && <Check size={11} className="text-foreground/60 ml-auto" />}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Settings */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground">
                      <Settings2 size={13} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[380px]">
                    <DialogHeader>
                      <DialogTitle className="text-[14px]">翻译设置</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                      <ConfigSection title="显示">
                        <FormRow label="Markdown 预览" desc="以 Markdown 格式渲染译文">
                          <Switch checked={mdPreview} onCheckedChange={setMdPreview} />
                        </FormRow>
                        <FormRow label="滚动同步" desc="左右面板同步滚动">
                          <Switch checked={scrollSync} onCheckedChange={setScrollSync} />
                        </FormRow>
                      </ConfigSection>
                      <ConfigSection title="行为">
                        <FormRow label="自动复制" desc="翻译完成后自动复制译文">
                          <Switch checked={autoCopy} onCheckedChange={setAutoCopy} />
                        </FormRow>
                        <FormRow label="自动检测语言" desc="自动识别源文本语言">
                          <Switch checked={detectMethod === "auto"} onCheckedChange={v => setDetectMethod(v ? "auto" : "manual")} />
                        </FormRow>
                        <FormRow label="双向翻译" desc="同时生成双向翻译结果">
                          <Switch checked={false} />
                        </FormRow>
                        <FormRow label="流式输出" desc="实时显示翻译进度">
                          <Switch checked={true} />
                        </FormRow>
                      </ConfigSection>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {/* History toggle */}
              <Button variant="ghost" size="icon-xs" onClick={() => setHistoryOpen(v => !v)} className={historyOpen ? "text-foreground bg-accent" : "text-muted-foreground"}>
                <History size={14} />
              </Button>
            </div>

            {/* Language selector bar */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 border-b border-border/30">
              <LangSelector value={sourceLang} onChange={setSourceLang} options={LANGUAGES} label="源语言" />
              <Button variant="ghost" type="button"
                onClick={handleSwapLangs}
                className={`h-auto px-0 py-0 font-normal tracking-normal w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  sourceLang === "自动检测" ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                disabled={sourceLang === "自动检测"}
              >
                <ArrowLeftRight size={14} />
              </Button>
              <LangSelector value={targetLang} onChange={setTargetLang} options={TARGET_LANGUAGES} label="目标语言" />
            </div>

            {/* Dual-pane translate area */}
            <div className="flex-1 flex min-h-0">
              {/* Source */}
              <div className="flex-1 flex flex-col border-r border-border/30">
                <Textarea
                  value={sourceText}
                  onChange={e => setSourceText(e.target.value)}
                  placeholder="输入要翻译的文本..."
                  className="min-h-[180px] flex-1 rounded-none border-0 bg-transparent px-4 py-3 text-[14px] tracking-tight leading-6 text-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 resize-none"
                />
                <div className="flex items-center justify-between px-4 py-2 border-t border-border/20">
                  <span className="text-[11px] text-muted-foreground/40 tracking-tight">
                    {sourceText.length} 字符
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={() => handleCopy(sourceText)}>
                      <Copy size={12} />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                      <Volume2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Target */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 px-4 py-3 text-[14px] tracking-tight leading-6 text-foreground min-h-[180px] overflow-y-auto">
                  {isTranslating ? (
                    <div className="flex items-center gap-2 text-muted-foreground/50">
                      <div className="w-3 h-3 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
                      <span className="text-[13px] tracking-tight">翻译中...</span>
                    </div>
                  ) : translatedText ? (
                    <p className="whitespace-pre-wrap">{translatedText}</p>
                  ) : (
                    <p className="text-muted-foreground/30">译文将显示在这里</p>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-t border-border/20">
                  <span className="text-[11px] text-muted-foreground/40 tracking-tight">
                    {translatedText.length} 字符{translatedText && <span className="ml-1.5 text-muted-foreground/30">· 0.8s</span>}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground" onClick={() => handleCopy(translatedText)}>
                      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                      <Volume2 size={12} />
                    </Button>
                    <Button size="xs" onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating} className="ml-1">
                      <ArrowRight size={12} />
                      <span>翻译</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="absolute bottom-0 left-0 right-0 h-7 flex items-center justify-between px-4 border-t border-border/30 bg-muted/20 text-[10px] text-muted-foreground/40 tracking-tight" style={{ right: historyOpen ? 280 : 0 }}>
            <span>源文本: {sourceText.length} 字符 / {sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0} 词</span>
            <span>译文: {translatedText.length} 字符 / {translatedText.trim() ? translatedText.trim().split(/\s+/).length : 0} 词</span>
          </div>

          {/* History panel (matching original historyOpen toggle) */}
          {historyOpen && (
            <div className="w-[280px] flex-shrink-0 border-l border-border/40 flex flex-col bg-background">
              <div className="h-11 flex items-center justify-between px-3 border-b border-border/40 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="text-[13px] tracking-tight font-medium">翻译历史</span>
                </div>
                <span className="text-[11px] text-muted-foreground/40">{TRANSLATE_HISTORY.length} 条</span>
              </div>
              {/* History filter */}
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/20">
                <Button variant="ghost" type="button"
                  onClick={() => setHistoryFilter("all")}
                  className={`h-auto px-0 py-0 font-normal tracking-normal px-2 py-0.5 rounded-[8px] text-[11px] tracking-tight transition-colors ${historyFilter === "all" ? "bg-accent text-foreground font-medium" : "text-muted-foreground/50 hover:text-foreground/70"}`}
                >全部</Button>
                <Button variant="ghost" type="button"
                  onClick={() => setHistoryFilter("starred")}
                  className={`h-auto px-0 py-0 font-normal tracking-normal px-2 py-0.5 rounded-[8px] text-[11px] tracking-tight transition-colors flex items-center gap-1 ${historyFilter === "starred" ? "bg-accent text-foreground font-medium" : "text-muted-foreground/50 hover:text-foreground/70"}`}
                ><Star size={9} />已收藏</Button>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
                {TRANSLATE_HISTORY.filter(h => historyFilter === "all" || starredIds.has(h.id)).map(h => (
                  <div
                    key={h.id}
                    className="px-3 py-2.5 border-b border-border/20 hover:bg-accent/30 transition-colors cursor-pointer group"
                    onClick={() => { setSourceText(h.source); setTranslatedText(h.translated) }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px]">{LANG_FLAGS[h.srcLang]}</span>
                        <ArrowRight size={9} className="text-muted-foreground/30" />
                        <span className="text-[11px]">{LANG_FLAGS[h.tgtLang]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-muted-foreground/30 tracking-tight">{h.time}</span>
                        <Button variant="ghost" type="button"
                          onClick={e => { e.stopPropagation(); toggleStar(h.id) }}
                          className="h-auto px-0 py-0 font-normal tracking-normal opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star size={11} className={starredIds.has(h.id) ? "text-accent-amber fill-accent-amber" : "text-muted-foreground/30"} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[11px] text-foreground/60 truncate tracking-tight">{h.source}</p>
                    <p className="text-[11px] text-muted-foreground/40 truncate tracking-tight mt-0.5">{h.translated}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
