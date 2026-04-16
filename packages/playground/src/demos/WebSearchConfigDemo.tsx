import React, { useState } from "react"
import {
  ConfigSection, FormRow, Input, Textarea, Badge, Button, Switch,
  InlineSelect, Slider, SectionHeader,
} from "@cherry-studio/ui"
import { Search, Globe, Eye, EyeOff, Trash2, Check } from "lucide-react"
import { Section, type PropDef } from "../components/Section"

// ===========================
// Types (matching src/features/settings/WebSearchPage)
// ===========================
interface SearchProvider {
  id: string; name: string; color: string; initial: string
  subtitle: string; enabled: boolean; configured: boolean
  apiKey?: string; baseUrl?: string
}

// ===========================
// Mock Data (matching original)
// ===========================
const PROVIDERS: SearchProvider[] = [
  { id: "tavily", name: "Tavily", color: "#6366f1", initial: "T", subtitle: "API Key Configured", enabled: true, configured: true, apiKey: "••••••••••••••••••••••••" },
  { id: "google", name: "Google Search", color: "#4285f4", initial: "G", subtitle: "Standard Search API", enabled: false, configured: false, apiKey: "", baseUrl: "https://www.googleapis.com/customsearch/v1" },
  { id: "searxng", name: "SearXNG", color: "#0ea5e9", initial: "S", subtitle: "Self-hosted Instance", enabled: true, configured: true, baseUrl: "https://search.example.com" },
  { id: "bing", name: "Bing Search", color: "#0078d4", initial: "B", subtitle: "Azure Subscription", enabled: false, configured: false, apiKey: "", baseUrl: "https://api.bing.microsoft.com/v7.0/search" },
]

const BLACKLIST_SUBS = [
  { id: "s1", name: "SEO Spam Blocklist", url: "https://raw.githubusercontent.com/.../list.txt", enabled: true },
  { id: "s2", name: "AdGuard URL Filters", url: "https://filters.adguard.com/url-filter.txt", enabled: false },
]

const webSearchProps: PropDef[] = [
  { name: "providers", type: "SearchProvider[]", default: "[]", description: "Search engine providers" },
  { name: "selectedProvider", type: "string", default: '"tavily"', description: "Active provider ID" },
  { name: "topK", type: "number", default: "10", description: "Max search results" },
  { name: "blacklistRules", type: "string", default: '""', description: "Domain blacklist (one per line)" },
]

export function WebSearchConfigDemo() {
  const [providers, setProviders] = useState(PROVIDERS)
  const [selectedId, setSelectedId] = useState("tavily")
  const [showApiKey, setShowApiKey] = useState(false)
  const [topK, setTopK] = useState([10])
  const [includeDates, setIncludeDates] = useState(true)
  const [compression, setCompression] = useState("llm-summary")
  const [maxTokens, setMaxTokens] = useState("4000")
  const [blacklistRules, setBlacklistRules] = useState("csdn.net\nbaidu.com/link?\n*://*.advertisement.*")
  const [subscriptions, setSubscriptions] = useState(BLACKLIST_SUBS)
  const [searchDepth, setSearchDepth] = useState("basic")
  const [includeAnswer, setIncludeAnswer] = useState(true)
  const [safeSearch, setSafeSearch] = useState("moderate")
  const [region, setRegion] = useState("cn")

  const selected = providers.find(p => p.id === selectedId) || providers[0]
  const toggleProvider = (id: string) => { setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)) }
  const toggleSubscription = (id: string) => { setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)) }

  return (
    <Section title="Web Search Config" install="npm install @cherry-studio/ui" props={webSearchProps} code={`// Left: Provider list + Right: Config panel (dual-pane)
<ConfigSection title="认证"><FormRow label="API Key"><Input type="password" /></FormRow></ConfigSection>
<ConfigSection title="全局搜索策略"><FormRow label="Top K"><Slider /></FormRow></ConfigSection>
<ConfigSection title="黑名单"><textarea />{subscriptions}</ConfigSection>`}>
      <div className="rounded-[24px] border bg-background overflow-hidden">
        <div className="flex min-h-[520px]">
          {/* Left: Provider list */}
          <div className="w-[200px] shrink-0 border-r border-border/30 flex flex-col">
            <div className="h-11 flex items-center gap-1.5 px-4 border-b border-border/30">
              <Globe size={13} className="text-muted-foreground" />
              <span className="text-[13px] text-foreground font-medium tracking-tight">网络搜索</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {providers.map(p => (
                <Button variant="ghost" key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] transition-all text-left ${selectedId === p.id ? "bg-foreground/[0.05]" : "hover:bg-foreground/[0.03]"}`}>
                  <div className="w-8 h-8 rounded-[12px] flex items-center justify-center text-primary-foreground text-[11px] font-medium flex-shrink-0" style={{ background: p.color }}>{p.initial}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-foreground truncate font-medium tracking-tight">{p.name}</span>
                      {p.configured && <Check size={9} className="text-success flex-shrink-0" />}
                    </div>
                    <span className="text-[11px] text-muted-foreground/40 tracking-tight">{p.subtitle}</span>
                  </div>
                  <div onClick={e => e.stopPropagation()}><Switch checked={p.enabled} onCheckedChange={() => toggleProvider(p.id)} /></div>
                </Button>
              ))}
            </div>
          </div>

          {/* Right: Config panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-border/20">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-[12px] flex items-center justify-center text-primary-foreground text-[11px] font-medium" style={{ background: selected.color }}>{selected.initial}</div>
              <div><h3 className="text-[13px] text-foreground font-semibold tracking-tight">{selected.name} 配置</h3><p className="text-[11px] text-muted-foreground/40 tracking-tight">{selected.subtitle}</p></div>
            </div>

            <ConfigSection title="认证">
              {selected.apiKey !== undefined && (
                <FormRow label="API Key" desc="在服务商控制台获取">
                  <div className="flex items-center gap-1.5">
                    <Input type={showApiKey ? "text" : "password"} defaultValue={selected.apiKey} className="w-44 h-8 text-xs" placeholder="sk-..." />
                    <Button variant="ghost" size="icon-xs" onClick={() => setShowApiKey(v => !v)}>{showApiKey ? <EyeOff size={12} /> : <Eye size={12} />}</Button>
                  </div>
                </FormRow>
              )}
              {selected.baseUrl !== undefined && <FormRow label="Base URL"><Input defaultValue={selected.baseUrl} className="w-56 h-8 text-xs" /></FormRow>}
            </ConfigSection>

            <ConfigSection title="搜索参数">
              {selectedId === "tavily" && (<>
                <FormRow label="Search Depth"><InlineSelect value={searchDepth} options={[{ value: "basic", label: "Basic (Fast)" }, { value: "advanced", label: "Advanced (Thorough)" }]} onChange={setSearchDepth} /></FormRow>
                <FormRow label="Include Answer" desc="让 Tavily 直接生成简短回答"><Switch checked={includeAnswer} onCheckedChange={setIncludeAnswer} /></FormRow>
              </>)}
              {selectedId === "google" && (<>
                <FormRow label="Search Engine ID (CX)" desc="在 Google Programmable Search Engine 控制台获取"><Input className="w-44 h-8 text-xs" placeholder="0123456789..." /></FormRow>
                <FormRow label="Safe Search"><InlineSelect value={safeSearch} options={[{ value: "off", label: "Off" }, { value: "moderate", label: "Moderate" }, { value: "strict", label: "Strict" }]} onChange={setSafeSearch} /></FormRow>
                <FormRow label="地理位置 (GL)"><InlineSelect value={region} options={[{ value: "cn", label: "中国 (CN)" }, { value: "us", label: "美国 (US)" }, { value: "jp", label: "日本 (JP)" }, { value: "auto", label: "自动检测" }]} onChange={setRegion} /></FormRow>
              </>)}
              {selectedId === "searxng" && (<>
                <FormRow label="搜索引擎" desc="逗号分隔"><Input defaultValue="google,bing,duckduckgo" className="w-48 h-8 text-xs" /></FormRow>
                <FormRow label="搜索语言"><InlineSelect value="auto" options={[{ value: "auto", label: "自动检测" }, { value: "zh-CN", label: "简体中文" }, { value: "en", label: "English" }]} onChange={() => {}} /></FormRow>
                <FormRow label="时间范围"><InlineSelect value="" options={[{ value: "", label: "不限" }, { value: "day", label: "24 小时" }, { value: "week", label: "一周" }, { value: "month", label: "一月" }]} onChange={() => {}} /></FormRow>
              </>)}
              {selectedId === "bing" && (<>
                <FormRow label="市场 (Market)"><InlineSelect value="zh-CN" options={[{ value: "zh-CN", label: "中国 (zh-CN)" }, { value: "en-US", label: "美国 (en-US)" }, { value: "ja-JP", label: "日本 (ja-JP)" }]} onChange={() => {}} /></FormRow>
                <FormRow label="结果类型过滤"><InlineSelect value="webpages" options={[{ value: "webpages", label: "仅网页" }, { value: "webpages,news", label: "网页 + 新闻" }, { value: "all", label: "全部类型" }]} onChange={() => {}} /></FormRow>
              </>)}
            </ConfigSection>

            <ConfigSection title="全局搜索策略" hint="控制所有搜索服务商的通用行为和结果处理规则">
              <FormRow label="搜索结果个数 (Top K)">
                <div className="flex items-center gap-2 w-32"><Slider value={topK} onValueChange={setTopK} min={1} max={50} step={1} /><span className="text-[11px] font-mono text-foreground/60 w-5 text-right">{topK[0]}</span></div>
              </FormRow>
              <FormRow label="搜索包含日期" desc="搜索结果将优先包含发布时间"><Switch checked={includeDates} onCheckedChange={setIncludeDates} /></FormRow>
              <FormRow label="压缩方法"><InlineSelect value={compression} options={[{ value: "llm-summary", label: "LLM 智能摘要 (推荐)" }, { value: "extractive", label: "关键句提取" }, { value: "none", label: "不压缩" }]} onChange={setCompression} /></FormRow>
              <FormRow label="最大上下文长度 (Tokens)"><Input value={maxTokens} onChange={e => setMaxTokens(e.target.value)} className="w-24 h-8 text-xs font-mono" /></FormRow>
            </ConfigSection>

            <ConfigSection title="黑名单 (Blacklist)" hint="屏蔽不需要的搜索结果来源" actions={<Badge variant="outline" className="text-[11px] py-0">{blacklistRules.split("\n").filter(Boolean).length} 条规则</Badge>}>
              <div className="space-y-2">
                <Textarea value={blacklistRules} onChange={e => setBlacklistRules(e.target.value)} className="w-full min-h-[80px] bg-foreground/[0.03] rounded-[12px] border border-border/30 px-3 py-2 text-[11px] font-mono text-foreground/60 resize-none focus-visible:ring-0 focus-visible:border-ring/30 tracking-tight" placeholder="每行一个域名或通配符规则" />
                <div className="space-y-1">
                  {subscriptions.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 px-2 py-1.5 rounded-[12px] hover:bg-foreground/[0.02] transition-colors">
                      <Switch checked={sub.enabled} onCheckedChange={() => toggleSubscription(sub.id)} />
                      <div className="flex-1 min-w-0"><span className="text-[11px] text-foreground/60 truncate block tracking-tight">{sub.name}</span><span className="text-[11px] text-muted-foreground/30 truncate block tracking-tight">{sub.url}</span></div>
                      <Button variant="ghost" size="icon-xs" className="text-muted-foreground/30"><Trash2 size={11} /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </ConfigSection>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" /><Input placeholder="测试搜索..." className="pl-8 h-9 text-xs" /></div>
              <Button size="sm"><Search size={12} /> 搜索</Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
