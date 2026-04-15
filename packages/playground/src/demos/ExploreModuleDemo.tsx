import React, { useState, useMemo, useCallback } from "react"
import {
  Badge, Button, Dialog, DialogContent,
  Sheet, SheetContent, SheetHeader, SheetTitle, Input,
} from "@cherry-studio/ui"
import {
  Search, Bot, MessageCircle, BookOpen, Wrench,
  Zap, Puzzle, Star, Play, Heart, X,
  TrendingUp, Sparkles, ArrowRight, Download,
  FileText, Tag, Calendar, User as UserIcon, Clock,
  BookmarkPlus, Check, Share2, Send,
} from "lucide-react"
import { Section, type PropDef } from "../components/Section"

/* ═══════════════════════════════════════════
   Types (matching src/features/explore/ExploreData)
   ═══════════════════════════════════════════ */

type ResourceCategory = "agents" | "assistants" | "knowledge" | "mcp" | "skills" | "plugins"

interface Agent {
  id: string; name: string; description: string; avatar: string; integrations: string[]
  subcategory: string; stars: number; runs: number; author: string; tags: string[]; createdAt: string
}

interface Assistant {
  id: string; name: string; description: string; avatar: string; persona: string
  subcategory: string; rating: number; conversations: number; author: string; tags: string[]; createdAt: string
}

interface ToolItem {
  id: string; name: string; description: string; icon: string
  subcategory: string; downloads: number; author: string; version?: string; tags: string[]; createdAt: string
}

/* ═══════════════════════════════════════════
   Mock data (reduced, matching field names)
   ═══════════════════════════════════════════ */

const CATEGORIES: { id: ResourceCategory; label: string; icon: React.ElementType; count: number }[] = [
  { id: "agents", label: "智能体", icon: Bot, count: 2847 },
  { id: "assistants", label: "助手", icon: MessageCircle, count: 1523 },
  { id: "knowledge", label: "知识库", icon: BookOpen, count: 468 },
  { id: "mcp", label: "MCP 工具", icon: Wrench, count: 312 },
  { id: "skills", label: "技能", icon: Zap, count: 189 },
  { id: "plugins", label: "插件", icon: Puzzle, count: 96 },
]

const subcategories: Record<ResourceCategory, string[]> = {
  agents: ["全部", "开发", "写作", "设计", "分析", "教育", "营销"],
  assistants: ["全部", "翻译", "办公", "创意", "客服", "法律"],
  knowledge: ["全部", "前端", "后端", "AI/ML", "产品", "设计"],
  mcp: ["全部", "开发", "数据", "通讯", "存储", "AI"],
  skills: ["全部", "文本", "图像", "音频", "代码", "数据"],
  plugins: ["全部", "效率", "开发", "设计", "安全"],
}

const integrationIcons: Record<string, string> = {
  "Web 搜索": "🌐", "代码执行": "🔧", "文件读写": "📝", "数据可视化": "📊",
  Figma: "🎨", "图片生成": "🖼️", "知识库": "📚", "Python": "🐍",
  "语音识别": "🎤", "日历": "📅",
}

const agents: Agent[] = [
  { id: "ag1", name: "代码架构师", avatar: "🏗️", description: "专注于代码架构设计和最佳实践，支持多种编程语言和框架的架构咨询", author: "Cherry Team", subcategory: "开发", stars: 3420, runs: 18500, tags: ["代码", "架构"], integrations: ["Web 搜索", "代码执行", "文件读写"], createdAt: "2025-01-15" },
  { id: "ag2", name: "学术写作助手", avatar: "📚", description: "帮助撰写和润色学术论文，支持 APA/MLA/Chicago 等格式规范", author: "AcademicAI", subcategory: "写作", stars: 2180, runs: 12400, tags: ["学术", "写作"], integrations: ["文件读写", "知识库"], createdAt: "2025-02-08" },
  { id: "ag3", name: "UI 设计顾问", avatar: "🎨", description: "提供 UI/UX 设计建议，支持 Figma 分析和设计系统构建", author: "DesignLab", subcategory: "设计", stars: 1890, runs: 9800, tags: ["UI", "设计"], integrations: ["Figma", "图片生成", "Web 搜索"], createdAt: "2025-01-28" },
  { id: "ag4", name: "数据分析专家", avatar: "📊", description: "处理和分析各类数据，生成可视化报告和洞察，支持 Python 和 SQL", author: "DataPro", subcategory: "分析", stars: 4100, runs: 22000, tags: ["数据", "分析", "可视化"], integrations: ["Python", "数据可视化", "文件读写"], createdAt: "2024-12-20" },
  { id: "ag5", name: "营销文案策划", avatar: "✍️", description: "生成社交媒体、广告、邮件等多渠道营销内容，支持 A/B 测试建议", author: "MarketAI", subcategory: "营销", stars: 1560, runs: 8200, tags: ["营销", "文案"], integrations: ["Web 搜索", "图片生成"], createdAt: "2025-03-01" },
  { id: "ag6", name: "教学辅导员", avatar: "👨‍🏫", description: "个性化学习辅导，支持数学、物理、编程等科目的互动教学", author: "EduBot", subcategory: "教育", stars: 2750, runs: 15000, tags: ["教育", "辅导"], integrations: ["代码执行", "知识库", "数据可视化"], createdAt: "2025-02-14" },
]

const assistants: Assistant[] = [
  { id: "as1", name: "全栈翻译官", avatar: "🌐", description: "支持 50+ 种语言的高质量翻译，保持语境和文化适配", persona: "我是一位精通多国语言的资深翻译，注重语境准确和文化本地化", author: "LingualAI", subcategory: "翻译", rating: 4.9, conversations: 31000, tags: ["翻译", "多语言"], createdAt: "2025-01-10" },
  { id: "as2", name: "会议纪要生成器", avatar: "📋", description: "自动整理会议录音/文字，生成结构化纪要、待办和行动项", persona: "我是高效的会议助理，擅长提炼要点和跟踪行动项", author: "MeetBot", subcategory: "办公", rating: 4.7, conversations: 7800, tags: ["会议", "办公"], createdAt: "2025-02-05" },
  { id: "as3", name: "创意风暴伙伴", avatar: "💡", description: "通过头脑风暴、SCAMPER 等方法激发创意灵感", persona: "我是你的创意搭档，善于用多种创意方法帮你打开思路", author: "IdeaForge", subcategory: "创意", rating: 4.6, conversations: 5200, tags: ["创意", "头脑风暴"], createdAt: "2025-03-12" },
]

const mcpTools: ToolItem[] = [
  { id: "mc1", name: "GitHub 集成", icon: "🐙", description: "直接操作 GitHub 仓库：创建 Issue、PR 审查、代码搜索", author: "DevTools", subcategory: "开发", downloads: 15600, version: "2.1.0", tags: ["GitHub", "开发"], createdAt: "2025-01-20" },
  { id: "mc2", name: "Slack 通知", icon: "💬", description: "向 Slack 频道发送消息、创建提醒、管理工作流", author: "CommTools", subcategory: "通讯", downloads: 9800, version: "1.4.2", tags: ["Slack", "通知"], createdAt: "2025-02-18" },
  { id: "mc3", name: "PostgreSQL 查询", icon: "🐘", description: "安全连接 PostgreSQL 数据库，执行查询和数据分析", author: "DBTools", subcategory: "数据", downloads: 7200, version: "1.2.0", tags: ["数据库", "SQL"], createdAt: "2025-03-05" },
]

const knowledgeItems: ToolItem[] = [
  { id: "kb1", name: "React Docs", icon: "⚛️", description: "React 18 官方文档全集，覆盖 Hooks、Server Components 和最佳实践", author: "React Team", subcategory: "前端", downloads: 24500, version: "18.3", tags: ["React", "前端"], createdAt: "2025-01-08" },
  { id: "kb2", name: "Python API 手册", icon: "🐍", description: "Python 3.12 标准库 API 参考手册，含类型注解示例", author: "PyDocs", subcategory: "后端", downloads: 18200, tags: ["Python", "API"], createdAt: "2025-02-12" },
  { id: "kb3", name: "Node.js Guide", icon: "🟢", description: "Node.js 运行时指南，涵盖 Stream、Worker、Cluster 等核心模块", author: "NodeFoundation", subcategory: "后端", downloads: 12300, version: "22.0", tags: ["Node.js", "后端"], createdAt: "2025-03-01" },
]

const skillItems: ToolItem[] = [
  { id: "sk1", name: "文本摘要", icon: "📄", description: "对长文本进行智能摘要，支持多粒度和多语言提取", author: "NLPLab", subcategory: "文本", downloads: 9600, version: "1.5.0", tags: ["NLP", "摘要"], createdAt: "2025-01-22" },
  { id: "sk2", name: "图像分析", icon: "🖼️", description: "识别图片内容、提取文字(OCR)、检测对象和场景标签", author: "VisionAI", subcategory: "图像", downloads: 7400, version: "2.0.1", tags: ["图像", "OCR"], createdAt: "2025-02-10" },
  { id: "sk3", name: "代码审查", icon: "🔍", description: "自动化代码质量检查，识别 Bug、安全漏洞和性能瓶颈", author: "CodeQA", subcategory: "代码", downloads: 11200, version: "3.1.0", tags: ["代码", "审查"], createdAt: "2025-03-15" },
]

const pluginItems: ToolItem[] = [
  { id: "pl1", name: "Markdown Export", icon: "📝", description: "将对话和文档导出为格式化 Markdown 文件，支持代码高亮", author: "ExportPro", subcategory: "效率", downloads: 6800, version: "1.2.0", tags: ["Markdown", "导出"], createdAt: "2025-01-18" },
  { id: "pl2", name: "Theme Builder", icon: "🎨", description: "可视化主题编辑器，实时预览色彩/字体/间距变更", author: "DesignKit", subcategory: "设计", downloads: 4300, version: "0.9.0", tags: ["主题", "设计"], createdAt: "2025-02-25" },
  { id: "pl3", name: "API Tester", icon: "🧪", description: "内嵌 REST/GraphQL API 测试面板，可保存请求集合和环境变量", author: "DevTools", subcategory: "开发", downloads: 5100, version: "1.0.3", tags: ["API", "测试"], createdAt: "2025-03-08" },
]

function formatNumber(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + "w"
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return String(n)
}

/* ═══════════════════════════════════════════
   Card Components (matching ResourceCards.tsx)
   ═══════════════════════════════════════════ */

function FavBadge() {
  return (
    <div className="absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-full bg-error/10 flex items-center justify-center backdrop-blur-sm border border-error/15 shadow-sm">
      <Heart size={9} className="text-error" fill="currentColor" />
    </div>
  )
}

function CardHoverOverlay({ onExperience, onFavorite, isFavorited }: { onExperience: () => void; onFavorite: () => void; isFavorited: boolean }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
      <div className="bg-gradient-to-t from-card/95 via-card/80 to-transparent pt-6 pb-2.5 px-3 flex items-center gap-1.5 justify-end">
        <Button variant="ghost" type="button" onClick={(e) => { e.stopPropagation(); onFavorite() }}
          className={`h-auto px-0 py-0 font-normal tracking-normal w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isFavorited ? "bg-error/10 text-error" : "bg-accent/60 text-muted-foreground/50 hover:text-error hover:bg-error/10"}`}>
          <Heart size={11} fill={isFavorited ? "currentColor" : "none"} />
        </Button>
        <Button variant="ghost" type="button" onClick={(e) => { e.stopPropagation(); onExperience() }}
          className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-foreground text-background text-[10px] hover:bg-foreground/90 transition-colors">
          <Play size={9} /><span>体验</span>
        </Button>
      </div>
    </div>
  )
}

function AgentCard({ agent, isFavorited, onClick, onExperience, onFavorite }: {
  agent: Agent; isFavorited?: boolean; onClick: () => void; onExperience: () => void; onFavorite: () => void
}) {
  return (
    <div className="group relative rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:shadow-lg hover:shadow-foreground/[0.03] transition-all duration-200 overflow-hidden cursor-pointer" onClick={onClick}>
      {isFavorited && <FavBadge />}
      <CardHoverOverlay onExperience={onExperience} onFavorite={onFavorite} isFavorited={!!isFavorited} />
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-violet/10 to-accent-blue/10 flex items-center justify-center text-lg">{agent.avatar}</div>
            <div>
              <h3 className="text-[12px] text-foreground">{agent.name}</h3>
              <span className="text-[9px] text-muted-foreground/35">{agent.subcategory} · {agent.author}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground/30">
            <Star size={8} className="text-accent-amber/60" /><span>{formatNumber(agent.stars)}</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/50 leading-relaxed line-clamp-2 mb-3">{agent.description}</p>
        <div className="flex items-center gap-1 mb-3">
          {agent.integrations.slice(0, 4).map((intg) => (
            <div key={intg} className="w-6 h-6 rounded-[12px] bg-accent/60 flex items-center justify-center text-[10px]" title={intg}>{integrationIcons[intg] || "🔧"}</div>
          ))}
          <span className="flex-1" />
          <span className="text-[9px] text-muted-foreground/25">{formatNumber(agent.runs)} 次运行</span>
        </div>
        <div className="flex items-center gap-1">
          {agent.tags.map((tag) => <span key={tag} className="text-[9px] px-1.5 py-px rounded-md bg-accent/50 text-muted-foreground/40">{tag}</span>)}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border/10">
        <Button variant="ghost" type="button" onClick={(e) => { e.stopPropagation(); onExperience() }} className="h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[12px] text-[11px] text-foreground/70 hover:text-foreground bg-accent/30 hover:bg-accent/60 transition-colors group/btn">
          <Play size={9} className="group-hover/btn:text-accent-violet transition-colors" /><span>体验智能体</span>
          <ArrowRight size={9} className="opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
        </Button>
      </div>
    </div>
  )
}

function AssistantCard({ assistant, isFavorited, onClick, onFavorite }: {
  assistant: Assistant; isFavorited?: boolean; onClick: () => void; onFavorite: () => void
}) {
  return (
    <div className="group relative rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:shadow-lg hover:shadow-foreground/[0.03] transition-all duration-200 overflow-hidden cursor-pointer" onClick={onClick}>
      {isFavorited && <FavBadge />}
      <CardHoverOverlay onExperience={onClick} onFavorite={onFavorite} isFavorited={!!isFavorited} />
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.06] flex items-center justify-center text-xl flex-shrink-0">{assistant.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[12px] text-foreground truncate">{assistant.name}</h3>
              <div className="flex items-center gap-0.5 text-[9px] text-accent-amber/60 flex-shrink-0"><Star size={7} fill="currentColor" /><span>{assistant.rating}</span></div>
            </div>
            <p className="text-[9px] text-muted-foreground/35 mt-0.5">{assistant.author}</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/50 leading-relaxed line-clamp-2 mb-2">{assistant.description}</p>
        <div className="px-2.5 py-1.5 rounded-[12px] bg-accent/30 border border-border/10 mb-3">
          <p className="text-[10px] text-muted-foreground/40 leading-relaxed line-clamp-2 italic">&quot;{assistant.persona}&quot;</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {assistant.tags.map((tag) => <span key={tag} className="text-[9px] px-1.5 py-px rounded-md bg-accent/50 text-muted-foreground/40">{tag}</span>)}
          </div>
          <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground/25"><MessageCircle size={8} /><span>{formatNumber(assistant.conversations)}</span></div>
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border/10">
        <Button variant="ghost" type="button" onClick={(e) => { e.stopPropagation() }} className="h-auto px-0 py-0 font-normal tracking-normal w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[12px] text-[11px] text-foreground/70 hover:text-foreground bg-accent/30 hover:bg-accent/60 transition-colors group/btn">
          <MessageCircle size={9} /><span>开始对话</span>
          <ArrowRight size={9} className="opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
        </Button>
      </div>
    </div>
  )
}

function ToolCard({ item, metricLabel, metricValue, isFavorited, onClick, onFavorite }: {
  item: ToolItem; metricLabel: string; metricValue: string; isFavorited?: boolean; onClick: () => void; onFavorite: () => void
}) {
  return (
    <div className="group relative rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:shadow-lg hover:shadow-foreground/[0.03] transition-all duration-200 p-4 cursor-pointer overflow-hidden" onClick={onClick}>
      {isFavorited && <FavBadge />}
      <CardHoverOverlay onExperience={onClick} onFavorite={onFavorite} isFavorited={!!isFavorited} />
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent/60 flex items-center justify-center text-lg flex-shrink-0">{item.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[12px] text-foreground truncate">{item.name}</h3>
            {item.version && <span className="text-[8px] text-muted-foreground/25 flex-shrink-0">v{item.version}</span>}
          </div>
          <p className="text-[9px] text-muted-foreground/35 mt-0.5">{item.author}</p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/50 leading-relaxed line-clamp-2 mb-3">{item.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {item.tags.map((tag) => <span key={tag} className="text-[9px] px-1.5 py-px rounded-md bg-accent/50 text-muted-foreground/40">{tag}</span>)}
        </div>
        <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground/25"><Download size={8} /><span>{metricValue} {metricLabel}</span></div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Preview Modal (matching PreviewModal.tsx)
   ═══════════════════════════════════════════ */

function PreviewContent({ resource, category, isFavorited, isSaved, onToggleFavorite, onSave, onClose }: {
  resource: any; category: ResourceCategory; isFavorited: boolean; isSaved: boolean
  onToggleFavorite: () => void; onSave: () => void; onClose: () => void
}) {
  const catLabels: Record<ResourceCategory, string> = { agents: "智能体", assistants: "助手", knowledge: "知识库", mcp: "MCP 工具", skills: "技能", plugins: "插件" }
  const isAgent = category === "agents"
  const isAssistant = category === "assistants"
  const avatar = resource.avatar || resource.icon

  return (
    <div>
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-violet/[0.06] via-accent-blue/[0.03] to-transparent pointer-events-none" />
        <div className="relative px-5 pt-5 pb-4">
          <div className="flex items-center justify-end gap-1 mb-4">
            <Button variant="ghost" type="button" className="h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[12px] flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-colors"><Share2 size={11} /></Button>
            <Button variant="ghost" type="button" onClick={onClose} className="h-auto px-0 py-0 font-normal tracking-normal w-6 h-6 rounded-[12px] flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors"><X size={13} /></Button>
          </div>
          <div className="flex items-start gap-3.5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ring-1 ring-border/10 ${isAgent ? "bg-gradient-to-br from-accent-violet/10 to-accent-blue/10" : isAssistant ? "bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.06]" : "bg-accent/60"}`}>
              {avatar}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-[15px] text-foreground truncate">{resource.name}</h2>
                <span className="text-[8px] px-1.5 py-px rounded-full bg-accent text-muted-foreground/50 uppercase tracking-wider flex-shrink-0">{catLabels[category]}</span>
              </div>
              <div className="flex items-center gap-2.5 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40"><UserIcon size={9} /><span>{resource.author}</span></div>
                {resource.version && <span className="text-[9px] text-muted-foreground/25 px-1.5 py-px rounded bg-accent/50">v{resource.version}</span>}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/30"><Clock size={8} /><span>{resource.createdAt}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        <div>
          <div className="text-[9px] text-muted-foreground/30 uppercase tracking-wider mb-2">简介</div>
          <p className="text-[12px] text-muted-foreground/60 leading-[1.7]">{resource.description}</p>
        </div>

        {isAssistant && resource.persona && (
          <div>
            <div className="text-[9px] text-muted-foreground/30 uppercase tracking-wider mb-2">角色设定</div>
            <div className="px-3.5 py-3 rounded-xl bg-gradient-to-r from-foreground/[0.03] to-foreground/[0.03] border border-border/10">
              <p className="text-[11px] text-muted-foreground/50 leading-relaxed italic">&quot;{resource.persona}&quot;</p>
            </div>
          </div>
        )}

        {isAgent && resource.integrations && (
          <div>
            <div className="text-[9px] text-muted-foreground/30 uppercase tracking-wider mb-2">集成工具</div>
            <div className="flex flex-wrap gap-1.5">
              {resource.integrations.map((intg: string) => (
                <div key={intg} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] bg-accent/40 border border-border/10">
                  <span className="text-[12px]">{integrationIcons[intg] || "🔧"}</span>
                  <span className="text-[10px] text-muted-foreground/50">{intg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div>
          <div className="text-[9px] text-muted-foreground/30 uppercase tracking-wider mb-2">数据概览</div>
          <div className="grid grid-cols-3 gap-2">
            {isAgent && <>
              <StatCard icon={<Star size={12} className="text-accent-amber/60" />} label="收藏" value={formatNumber(resource.stars)} />
              <StatCard icon={<Play size={12} className="text-accent-violet/60" />} label="运行次数" value={formatNumber(resource.runs)} />
              <StatCard icon={<Tag size={12} className="text-accent-blue/50" />} label="分类" value={resource.subcategory} />
            </>}
            {isAssistant && <>
              <StatCard icon={<Star size={12} className="text-accent-amber/60" />} label="评分" value={String(resource.rating)} />
              <StatCard icon={<MessageCircle size={12} className="text-foreground/45" />} label="对话数" value={formatNumber(resource.conversations)} />
              <StatCard icon={<Tag size={12} className="text-accent-blue/50" />} label="分类" value={resource.subcategory} />
            </>}
            {!isAgent && !isAssistant && <>
              <StatCard icon={<Download size={12} className="text-accent-blue/60" />} label="下载量" value={formatNumber(resource.downloads)} />
              <StatCard icon={<Tag size={12} className="text-accent-orange/50" />} label="分类" value={resource.subcategory} />
              <StatCard icon={<Calendar size={12} className="text-muted-foreground/35" />} label="更新时间" value={resource.createdAt?.slice(5)} />
            </>}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="text-[9px] text-muted-foreground/30 uppercase tracking-wider mb-2">标签</div>
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map((tag: string) => (
              <span key={tag} className="text-[10px] px-2.5 py-1 rounded-[12px] bg-accent/40 text-muted-foreground/45 border border-border/8">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-border/15 flex items-center gap-2 bg-accent/[0.03]">
        <Button variant="ghost" type="button" onClick={onToggleFavorite} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-[11px] transition-all active:scale-[0.97] ${isFavorited ? "bg-error/10 text-error border border-error/15" : "bg-accent/40 text-muted-foreground/50 border border-border/15 hover:text-foreground hover:border-border/40"}`}>
          <Heart size={11} fill={isFavorited ? "currentColor" : "none"} /><span>{isFavorited ? "已收藏" : "收藏"}</span>
        </Button>
        <Button variant="ghost" type="button" onClick={onSave} disabled={isSaved} className={`h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-[11px] transition-all active:scale-[0.97] ${isSaved ? "bg-cherry-active-bg text-foreground border border-cherry-ring" : "bg-accent/40 text-muted-foreground/50 border border-border/15 hover:text-foreground hover:border-border/40"}`}>
          {isSaved ? <Check size={11} /> : <BookmarkPlus size={11} />}
          <span>{isSaved ? "已添加" : "添加到资源库"}</span>
        </Button>
        <span className="flex-1" />
        {(isAgent || isAssistant) && (
          <Button variant="ghost" type="button" onClick={onClose} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1.5 px-4 py-1.5 rounded-[12px] bg-foreground text-background text-[11px] hover:bg-foreground/90 transition-colors active:scale-[0.97]">
            {isAgent ? <Play size={10} /> : <MessageCircle size={10} />}
            <span>{isAgent ? "体验智能体" : "开始对话"}</span>
          </Button>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-3 py-2.5 rounded-xl bg-accent/20 border border-border/8">
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[9px] text-muted-foreground/30">{label}</span></div>
      <span className="text-[13px] text-foreground/80">{value}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Experience Modal (mock chat)
   ═══════════════════════════════════════════ */

function ExperienceModal({ resource, category, onSave, onClose }: {
  resource: any; category: ResourceCategory; onSave: () => void; onClose: () => void
}) {
  const avatar = resource.avatar || resource.icon
  const mockMessages = [
    { role: "user" as const, text: "你好，请介绍一下你能做什么？" },
    { role: "assistant" as const, text: `我是${resource.name}。${resource.description}。有什么我可以帮你的吗？` },
    { role: "user" as const, text: "听起来不错，可以给我一个示例吗？" },
  ]

  return (
    <div className="flex h-[420px]">
      {/* Left: resource info */}
      <div className="w-[200px] shrink-0 border-r border-border/15 flex flex-col p-4 bg-accent/[0.03]">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center text-2xl mb-2.5">{avatar}</div>
          <h3 className="text-[13px] text-foreground font-medium mb-0.5">{resource.name}</h3>
          <p className="text-[10px] text-muted-foreground/40 leading-relaxed">{resource.description}</p>
        </div>
        <div className="flex flex-wrap gap-1 justify-center">
          {resource.tags?.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">{tag}</Badge>
          ))}
        </div>
        <div className="flex-1" />
        <div className="space-y-1.5 pt-3 border-t border-border/10">
          <Button size="xs" variant="outline" className="w-full gap-1 text-[10px]" onClick={onSave}>
            <BookmarkPlus size={10} /><span>保存到库</span>
          </Button>
          <Button size="xs" variant="ghost" className="w-full gap-1 text-[10px] text-muted-foreground/50" onClick={onClose}>
            <X size={10} /><span>关闭</span>
          </Button>
        </div>
      </div>

      {/* Right: mock chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mockMessages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${msg.role === "user" ? "bg-foreground/10" : "bg-accent-violet/10"}`}>
                {msg.role === "user" ? "👤" : avatar}
              </div>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${msg.role === "user" ? "bg-foreground text-background rounded-tr-md" : "bg-accent/50 text-foreground/80 rounded-tl-md"}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 bg-accent-violet/10">{avatar}</div>
            <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-accent/50 rounded-tl-md">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-border/15 p-3 flex items-center gap-2">
          <Input placeholder="输入消息体验对话..." className="flex-1 h-8 text-[11px]" readOnly />
          <Button size="xs" className="h-8 w-8 p-0"><Send size={12} /></Button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main Demo
   ═══════════════════════════════════════════ */

export function ExploreModuleDemo() {
  const [category, setCategory] = useState<ResourceCategory>("agents")
  const [sub, setSub] = useState("全部")
  const [search, setSearch] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["ag1", "ag4"]))
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<{ resource: any; category: ResourceCategory } | null>(null)
  const [experienceResource, setExperienceResource] = useState<{ resource: any; category: ResourceCategory } | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)

  const handleCategoryChange = (cat: ResourceCategory) => { setCategory(cat); setSub("全部") }
  const toggleFav = useCallback((id: string) => setFavorites((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n }), [])
  const saveItem = useCallback((id: string) => setSaved((p) => new Set(p).add(id)), [])
  const searchLower = search.toLowerCase()
  const matchSearch = (item: { name: string; description: string; tags: string[] }) =>
    !searchLower || item.name.toLowerCase().includes(searchLower) || item.description.toLowerCase().includes(searchLower) || item.tags.some((t) => t.toLowerCase().includes(searchLower))
  const matchSub = (s: string) => sub === "全部" || s === sub

  const filteredAgents = useMemo(() => agents.filter((a) => matchSearch(a) && matchSub(a.subcategory)), [searchLower, sub])
  const filteredAssistants = useMemo(() => assistants.filter((a) => matchSearch(a) && matchSub(a.subcategory)), [searchLower, sub])
  const filteredMCP = useMemo(() => mcpTools.filter((m) => matchSearch(m) && matchSub(m.subcategory)), [searchLower, sub])
  const filteredKnowledge = useMemo(() => knowledgeItems.filter((k) => matchSearch(k) && matchSub(k.subcategory)), [searchLower, sub])
  const filteredSkills = useMemo(() => skillItems.filter((s) => matchSearch(s) && matchSub(s.subcategory)), [searchLower, sub])
  const filteredPlugins = useMemo(() => pluginItems.filter((p) => matchSearch(p) && matchSub(p.subcategory)), [searchLower, sub])

  // All resources for favorites lookup
  const allResources = useMemo(() => {
    const map = new Map<string, { resource: any; category: ResourceCategory }>()
    agents.forEach(a => map.set(a.id, { resource: a, category: "agents" }))
    assistants.forEach(a => map.set(a.id, { resource: a, category: "assistants" }))
    mcpTools.forEach(t => map.set(t.id, { resource: t, category: "mcp" }))
    knowledgeItems.forEach(k => map.set(k.id, { resource: k, category: "knowledge" }))
    skillItems.forEach(s => map.set(s.id, { resource: s, category: "skills" }))
    pluginItems.forEach(p => map.set(p.id, { resource: p, category: "plugins" }))
    return map
  }, [])

  const favoritedResources = useMemo(() => {
    return Array.from(favorites).map(id => allResources.get(id)).filter(Boolean) as { resource: any; category: ResourceCategory }[]
  }, [favorites, allResources])

  const subs = subcategories[category]

  return (
    <Section title="Explore Module" props={[
      { name: "category", type: "ResourceCategory", default: '"agents"', description: "Active resource category" },
      { name: "subcategory", type: "string", default: '"全部"', description: "Subcategory filter" },
      { name: "searchQuery", type: "string", default: '""', description: "Search filter" },
    ] satisfies PropDef[]}>
      <div className="rounded-xl border bg-background overflow-hidden">
        <div className="px-5 pt-5 pb-0">
          {/* Header */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-[20px] text-foreground tracking-tight mb-0.5">探索</h1>
              <p className="text-[11px] text-muted-foreground/40">发现智能体、助手和工具，提升你的工作效率</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" type="button" onClick={() => setShowFavorites(true)} className="h-auto px-0 py-0 font-normal tracking-normal relative flex items-center gap-1 px-2.5 py-1.5 rounded-[12px] border border-border/25 text-[11px] text-muted-foreground/50 hover:text-foreground hover:border-border/50 hover:bg-accent/30 transition-all">
                <Heart size={11} className={favorites.size > 0 ? "text-error/70" : ""} fill={favorites.size > 0 ? "currentColor" : "none"} />
                <span>收藏夹</span>
                {favorites.size > 0 && <span className="ml-0.5 px-1 py-px rounded-full bg-error/10 text-error text-[9px] tabular-nums">{favorites.size}</span>}
              </Button>
              <div className="relative max-w-xs">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索资源..." className="w-full pl-7 pr-7 py-1.5 rounded-[12px] border border-border/25 bg-accent/15 text-[11px] text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0" />
                {search && <Button variant="ghost" type="button" onClick={() => setSearch("")} className="h-auto px-0 py-0 font-normal tracking-normal absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/25 hover:text-foreground"><X size={10} /></Button>}
              </div>
            </div>
          </div>

          {/* Featured banner (agents only) */}
          {!search && category === "agents" && sub === "全部" && (
            <div className="relative rounded-2xl overflow-hidden mb-5">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-violet/[0.08] via-accent-blue/[0.05] to-foreground/[0.05]" />
              <div className="relative px-6 py-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-[9px] text-accent-violet/70 bg-accent-violet/[0.08] px-2 py-0.5 rounded-full"><TrendingUp size={8} /><span>本周热门</span></div>
                </div>
                <h3 className="text-[15px] text-foreground mb-1">{agents[3].name}</h3>
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed max-w-md mb-3">{agents[3].description}</p>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" type="button" onClick={() => setExperienceResource({ resource: agents[3], category: "agents" })} className="h-auto px-0 py-0 font-normal tracking-normal flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] bg-foreground text-background text-[11px] hover:bg-foreground/90 transition-colors active:scale-[0.97]">
                    <Sparkles size={10} /><span>立即体验</span>
                  </Button>
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground/30">
                    <span>{formatNumber(agents[3].stars)} 收藏</span><span>·</span><span>{formatNumber(agents[3].runs)} 次运行</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category filter tabs */}
          <div className="flex items-center gap-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-border/15 pb-px">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.id
              const Icon = cat.icon
              return (
                <Button variant="ghost" type="button" key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={`h-auto px-0 py-0 font-normal tracking-normal relative flex items-center gap-1.5 px-3 py-2 text-[11px] rounded-[12px] transition-all whitespace-nowrap ${isActive ? "text-foreground bg-accent/60" : "text-muted-foreground/50 hover:text-foreground hover:bg-accent/30"}`}>
                  <Icon size={12} strokeWidth={1.6} /><span>{cat.label}</span>
                  <span className={`text-[9px] tabular-nums ${isActive ? "text-muted-foreground/50" : "text-muted-foreground/25"}`}>{formatNumber(cat.count)}</span>
                </Button>
              )
            })}
          </div>

          {/* Subcategory tags */}
          <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden py-2.5 px-0.5">
            {subs.map((s) => (
              <Button variant="ghost" type="button" key={s} onClick={() => setSub(s)} className={`h-auto px-0 py-0 font-normal tracking-normal px-2.5 py-[3px] rounded-full text-[10px] whitespace-nowrap transition-all border ${s === sub ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground/45 border-border/25 hover:border-border/50 hover:text-foreground"}`}>
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Card grid */}
        <div className="px-5 pb-5">
          {category === "agents" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAgents.map((a) => (
                <AgentCard key={a.id} agent={a} isFavorited={favorites.has(a.id)}
                  onClick={() => setPreview({ resource: a, category: "agents" })}
                  onExperience={() => setExperienceResource({ resource: a, category: "agents" })}
                  onFavorite={() => toggleFav(a.id)} />
              ))}
              {filteredAgents.length === 0 && <EmptySearch query={search} sub={sub} />}
            </div>
          )}
          {category === "assistants" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAssistants.map((a) => (
                <AssistantCard key={a.id} assistant={a} isFavorited={favorites.has(a.id)}
                  onClick={() => setPreview({ resource: a, category: "assistants" })}
                  onFavorite={() => toggleFav(a.id)} />
              ))}
              {filteredAssistants.length === 0 && <EmptySearch query={search} sub={sub} />}
            </div>
          )}
          {category === "mcp" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMCP.map((t) => (
                <ToolCard key={t.id} item={t} metricLabel="下载" metricValue={formatNumber(t.downloads)} isFavorited={favorites.has(t.id)}
                  onClick={() => setPreview({ resource: t, category: "mcp" })} onFavorite={() => toggleFav(t.id)} />
              ))}
              {filteredMCP.length === 0 && <EmptySearch query={search} sub={sub} />}
            </div>
          )}
          {category === "knowledge" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredKnowledge.map((k) => (
                <ToolCard key={k.id} item={k} metricLabel="下载" metricValue={formatNumber(k.downloads)} isFavorited={favorites.has(k.id)}
                  onClick={() => setPreview({ resource: k, category: "knowledge" })} onFavorite={() => toggleFav(k.id)} />
              ))}
              {filteredKnowledge.length === 0 && <EmptySearch query={search} sub={sub} />}
            </div>
          )}
          {category === "skills" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSkills.map((s) => (
                <ToolCard key={s.id} item={s} metricLabel="下载" metricValue={formatNumber(s.downloads)} isFavorited={favorites.has(s.id)}
                  onClick={() => setPreview({ resource: s, category: "skills" })} onFavorite={() => toggleFav(s.id)} />
              ))}
              {filteredSkills.length === 0 && <EmptySearch query={search} sub={sub} />}
            </div>
          )}
          {category === "plugins" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPlugins.map((p) => (
                <ToolCard key={p.id} item={p} metricLabel="下载" metricValue={formatNumber(p.downloads)} isFavorited={favorites.has(p.id)}
                  onClick={() => setPreview({ resource: p, category: "plugins" })} onFavorite={() => toggleFav(p.id)} />
              ))}
              {filteredPlugins.length === 0 && <EmptySearch query={search} sub={sub} />}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={(open) => { if (!open) setPreview(null) }}>
        <DialogContent className="max-w-[540px] p-0 overflow-hidden" showCloseButton={false}>
          {preview && (
            <PreviewContent
              resource={preview.resource}
              category={preview.category}
              isFavorited={favorites.has(preview.resource.id)}
              isSaved={saved.has(preview.resource.id)}
              onToggleFavorite={() => toggleFav(preview.resource.id)}
              onSave={() => saveItem(preview.resource.id)}
              onClose={() => setPreview(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog open={!!experienceResource} onOpenChange={(open) => { if (!open) setExperienceResource(null) }}>
        <DialogContent className="max-w-[640px] p-0 overflow-hidden" showCloseButton={false}>
          {experienceResource && (
            <ExperienceModal
              resource={experienceResource.resource}
              category={experienceResource.category}
              onSave={() => saveItem(experienceResource.resource.id)}
              onClose={() => setExperienceResource(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Favorites Sheet (drawer from bottom) */}
      <Sheet open={showFavorites} onOpenChange={setShowFavorites}>
        <SheetContent side="bottom" className="max-h-[60vh] rounded-t-2xl">
          <SheetHeader className="pb-3">
            <SheetTitle className="text-[14px] flex items-center gap-2">
              <Heart size={14} className="text-error" fill="currentColor" />
              收藏夹
              <span className="text-[10px] text-muted-foreground/40 font-normal">({favoritedResources.length})</span>
            </SheetTitle>
          </SheetHeader>
          {favoritedResources.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 overflow-y-auto pb-4">
              {favoritedResources.map(({ resource, category: cat }) => {
                const avatar = resource.avatar || resource.icon
                return (
                  <div key={resource.id}
                    className="group relative rounded-xl border border-border/20 bg-card p-3 hover:border-border/40 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => { setShowFavorites(false); setPreview({ resource, category: cat }) }}>
                    <Button variant="ghost" type="button" onClick={(e) => { e.stopPropagation(); toggleFav(resource.id) }}
                      className="h-auto px-0 py-0 font-normal tracking-normal absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-error/60 hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all">
                      <X size={10} />
                    </Button>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-[12px] bg-accent/50 flex items-center justify-center text-base">{avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate">{resource.name}</p>
                        <p className="text-[9px] text-muted-foreground/35">{resource.author}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/40 line-clamp-1">{resource.description}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Heart size={20} className="text-muted-foreground/15 mb-2" />
              <p className="text-[11px] text-muted-foreground/35">暂无收藏</p>
              <p className="text-[10px] text-muted-foreground/20 mt-0.5">点击卡片上的心形图标添加收藏</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Section>
  )
}

function EmptySearch({ query, sub }: { query: string; sub: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <Search size={24} strokeWidth={1.2} className="text-muted-foreground/15 mb-2" />
      <p className="text-[12px] text-muted-foreground/35 mb-0.5">
        {query ? `未找到"${query}"相关结果` : sub !== "全部" ? `"${sub}" 分类暂无资源` : "暂无资源"}
      </p>
      <p className="text-[10px] text-muted-foreground/20">请尝试其他搜索词或分类</p>
    </div>
  )
}
