"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ServerOff, FileQuestion, BookOpenCheck, NotebookPen,
  FolderOpen, Puzzle, Code2, Search, Library, Languages,
  Sparkles, Package, MessageCircle, BarChart3, Star,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

type IconComponent = LucideIcon | React.ComponentType<{ size?: number; className?: string }>

// ===========================
// Composable Empty primitives
// ===========================

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-[var(--radius-button)] border-dashed p-6 text-center md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-[-0.14px]", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-accent-blue text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
        className
      )}
      {...props}
    />
  )
}

// ===========================
// EmptyState presets (Cherry Studio domain-specific)
// ===========================

type Locale = 'zh' | 'en' | 'ja'

type EmptyStatePreset =
  | "no-model"
  | "no-assistant"
  | "no-agent"
  | "no-knowledge"
  | "no-file"
  | "no-note"
  | "no-miniapp"
  | "no-code-tool"
  | "no-resource"
  | "no-translate"
  | "no-result"
  | "no-topic"
  | "no-session"
  | "no-image"
  | "no-history"
  | "no-chat"
  | "no-stats"
  | "no-folder"
  | "no-tag"
  | "no-api-key"
  | "no-action"
  | "no-phrase"
  | "no-datasource"
  | "no-search-engine"
  | "no-favorite"

/**
 * Map preset → illustration SVG filename (under /images/empty-state/).
 * Each preset uses a UNIQUE illustration matched by visual semantics.
 *
 * Visual reference:
 * - Unbreakable AI Security: lock icon on grid — locked/unconfigured system
 * - GPT-4o Assistants: central orb with radiating nodes — AI assistant
 * - ai-content-mod-container: processor with 3 control spheres — agent/automation
 * - AI in Education: tall learning figure with book — knowledge/learning
 * - AI-Powered Data Transfer: horizontal data flow — file transfer
 * - AI Design Assist: monitor with A/B panels + checkmark — content creation
 * - Smart Home Automation: cross-shaped modular controls — app modules
 * - AI Commands Center: horizontal control panel — terminal/code
 * - AI Content Curator: AI card with checkmark + side cards — content library
 * - AI-Driven Communication: device with signal waves — language/comms
 * - component-ai-powered-search: card with magnifying glass — search
 * - AI Sentiment Analyzer: monitor with dual panels + status — analysis/topics
 * - AI Central Command: hexagonal hub with connectors — command center
 * - AI Upscale Image: 4x zoom tool with arrows — image processing
 * - Financial Analysis: bar chart monitor with cursor — historical data
 * - Automated Customer Support: AI card + chat bubble — conversation
 * - AI-Enhanced Analytics: chart with connected data points — statistics
 * - AI Data Consolidation: spheres converging into network — data aggregation
 * - AI-Integrated Search: search UI with AI label — search/categorization
 * - AI-Driven Security: shield/lock with security lines — security/keys
 * - AI Action Hub: 4 action buttons in 2×2 grid — quick actions
 * - AI Sound Designer: keyboard + waveform — sound/phrases
 * - AI Video Creator: camera/recorder device — media/upload
 * - ai-website-designer: browser with sparkle icon — web/engine
 * - Automated Financial Planning: wallet device with button — saving/bookmarking
 */
const ILLUSTRATION_MAP: Partial<Record<EmptyStatePreset, string>> = {
  "no-model":          "Unbreakable AI Security",       // lock icon — system not configured
  "no-assistant":      "GPT-4o Assistants",              // AI orb — no assistant available
  "no-agent":          "ai-content-mod-container",       // processor + spheres — no agent
  "no-knowledge":      "AI in Education",                // learning figure — no knowledge base
  "no-file":           "AI-Powered Data Transfer",       // data flow — no files
  "no-note":           "AI Design Assist",               // A/B creation — no notes
  "no-miniapp":        "Smart Home Automation",          // modular controls — no mini apps
  "no-code-tool":      "AI Commands Center",             // command panel — no code tools
  "no-resource":       "AI Content Curator",             // content cards — no resources
  "no-translate":      "AI-Driven Communication",        // signal waves — no translations
  "no-result":         "component-ai-powered-search",    // magnifier card — no search results
  "no-topic":          "AI Sentiment Analyzer",          // dual-panel monitor — no topics
  "no-session":        "AI Central Command",             // hex hub — no sessions
  "no-image":          "AI Upscale Image",               // 4x zoom — no images
  "no-history":        "Financial Analysis",             // bar chart — no history
  "no-chat":           "Automated Customer Support",     // AI + chat bubble — no chat
  "no-stats":          "AI-Enhanced Analytics",           // analytics chart — no stats
  "no-folder":         "AI Data Consolidation",          // converging data — no folders
  "no-tag":            "AI-Integrated Search",           // search + label — no tags
  "no-api-key":        "AI-Driven Security",             // shield/lock — no API keys
  "no-action":         "AI Action Hub",                  // 4 buttons grid — no actions
  "no-phrase":         "AI Sound Designer",              // keyboard + waveform — no phrases
  "no-datasource":     "AI Video Creator",               // recorder — no data sources
  "no-search-engine":  "ai-website-designer",            // browser window — no search engines
  "no-favorite":       "Automated Financial Planning",   // wallet/save — no favorites
}

interface PresetConfig {
  icon: IconComponent
  title: Record<Locale, string>
  description: Record<Locale, string>
  actionLabel?: Record<Locale, string>
}

const PRESET_MAP: Record<EmptyStatePreset, PresetConfig> = {
  "no-model": {
    icon: ServerOff,
    title: {
      zh: "尚未配置模型服务",
      en: "No Model Service Configured",
      ja: "モデルサービス未設定",
    },
    description: {
      zh: "请先前往设置页面添加模型服务商并启用模型，才能开始使用",
      en: "Go to Settings to add a model provider and enable models before getting started",
      ja: "設定ページでモデルプロバイダーを追加し、モデルを有効にしてください",
    },
    actionLabel: { zh: "前往设置", en: "Go to Settings", ja: "設定へ" },
  },
  "no-assistant": {
    icon: Sparkles,
    title: {
      zh: "暂无可用助手",
      en: "No Assistants Available",
      ja: "利用可能なアシスタントがありません",
    },
    description: {
      zh: "前往资源库创建或导入你的第一个助手",
      en: "Go to Library to create or import your first assistant",
      ja: "ライブラリでアシスタントを作成またはインポートしてください",
    },
    actionLabel: { zh: "创建助手", en: "Create Assistant", ja: "アシスタントを作成" },
  },
  "no-agent": {
    icon: Package,
    title: {
      zh: "暂无可用智能体",
      en: "No Agents Available",
      ja: "利用可能なエージェントがありません",
    },
    description: {
      zh: "前往资源库创建或导入你的第一个智能体",
      en: "Go to Library to create or import your first agent",
      ja: "ライブラリでエージェントを作成またはインポートしてください",
    },
    actionLabel: { zh: "创建智能体", en: "Create Agent", ja: "エージェントを作成" },
  },
  "no-knowledge": {
    icon: BookOpenCheck,
    title: {
      zh: "暂无知识库",
      en: "No Knowledge Bases",
      ja: "ナレッジベースがありません",
    },
    description: {
      zh: "创建你的第一个知识库，导入文档开始语义检索",
      en: "Create your first knowledge base and import documents for semantic search",
      ja: "最初のナレッジベースを作成し、ドキュメントをインポートしてセマンティック検索を開始しましょう",
    },
    actionLabel: { zh: "创建知识库", en: "Create Knowledge Base", ja: "ナレッジベースを作成" },
  },
  "no-file": {
    icon: FolderOpen,
    title: {
      zh: "暂无文件",
      en: "No Files Yet",
      ja: "ファイルがありません",
    },
    description: {
      zh: "上传文件或从其他页面保存内容到文件管理器",
      en: "Upload files or save content from other pages to the file manager",
      ja: "ファイルをアップロードするか、他のページからコンテンツを保存してください",
    },
    actionLabel: { zh: "上传文件", en: "Upload File", ja: "ファイルをアップロード" },
  },
  "no-note": {
    icon: NotebookPen,
    title: {
      zh: "暂无笔记",
      en: "No Notes Yet",
      ja: "ノートがありません",
    },
    description: {
      zh: "创建你的第一篇笔记，随时记录灵感和想法",
      en: "Create your first note to capture ideas and thoughts anytime",
      ja: "最初のノートを作成して、アイデアや考えをいつでも記録しましょう",
    },
    actionLabel: { zh: "新建笔记", en: "New Note", ja: "ノートを作成" },
  },
  "no-miniapp": {
    icon: Puzzle,
    title: {
      zh: "暂无小程序",
      en: "No Mini Apps",
      ja: "ミニアプリがありません",
    },
    description: {
      zh: "添加常用的 AI 应用作为小程序快速访问",
      en: "Add frequently used AI apps as mini apps for quick access",
      ja: "よく使う AI アプリをミニアプリとして追加してすばやくアクセスしましょう",
    },
    actionLabel: { zh: "添加小程序", en: "Add Mini App", ja: "ミニアプリを追加" },
  },
  "no-code-tool": {
    icon: Code2,
    title: {
      zh: "暂无代码工具",
      en: "No Code Tools",
      ja: "コードツールがありません",
    },
    description: {
      zh: "添加 CLI 工具或代码助手开始使用",
      en: "Add CLI tools or code assistants to get started",
      ja: "CLI ツールまたはコードアシスタントを追加して使用を開始してください",
    },
    actionLabel: { zh: "添加工具", en: "Add Tool", ja: "ツールを追加" },
  },
  "no-resource": {
    icon: Library,
    title: {
      zh: "暂无资源",
      en: "No Resources Yet",
      ja: "リソースがありません",
    },
    description: {
      zh: "创建助手、智能体或导入插件来丰富你的工作空间",
      en: "Create assistants, agents, or import plugins to enrich your workspace",
      ja: "アシスタント、エージェントを作成するか、プラグインをインポートしてワークスペースを充実させましょう",
    },
    actionLabel: { zh: "前往资源库", en: "Go to Library", ja: "ライブラリへ" },
  },
  "no-translate": {
    icon: Languages,
    title: {
      zh: "暂无翻译记录",
      en: "No Translation History",
      ja: "翻訳履歴がありません",
    },
    description: {
      zh: "输入文本开始你的第一次翻译",
      en: "Enter text to start your first translation",
      ja: "テキストを入力して最初の翻訳を始めましょう",
    },
  },
  "no-result": {
    icon: Search,
    title: {
      zh: "未找到匹配结果",
      en: "No Results Found",
      ja: "一致する結果が見つかりません",
    },
    description: {
      zh: "尝试调整搜索关键词或筛选条件",
      en: "Try adjusting your search keywords or filters",
      ja: "検索キーワードやフィルター条件を調整してみてください",
    },
    actionLabel: { zh: "清除筛选", en: "Clear Filters", ja: "フィルターをクリア" },
  },
  "no-topic": {
    icon: FileQuestion,
    title: {
      zh: "暂无话题",
      en: "No Topics Yet",
      ja: "トピックがありません",
    },
    description: {
      zh: "发送消息开始你的第一个话题",
      en: "Send a message to start your first topic",
      ja: "メッセージを送信して最初のトピックを始めましょう",
    },
  },
  "no-session": {
    icon: FileQuestion,
    title: {
      zh: "暂无会话",
      en: "No Sessions Yet",
      ja: "セッションがありません",
    },
    description: {
      zh: "开始一次新的工作会话",
      en: "Start a new working session",
      ja: "新しい作業セッションを開始しましょう",
    },
    actionLabel: { zh: "新建会话", en: "New Session", ja: "新しいセッション" },
  },
  "no-image": {
    icon: ImageIcon,
    title: {
      zh: "开始创作",
      en: "Start Creating",
      ja: "創作を始めましょう",
    },
    description: {
      zh: "选择模型并输入描述，生成你的第一张图片",
      en: "Choose a model and enter a description to generate your first image",
      ja: "モデルを選択して説明を入力し、最初の画像を生成しましょう",
    },
  },
  "no-history": {
    icon: FileQuestion,
    title: {
      zh: "暂无历史记录",
      en: "No History",
      ja: "履歴がありません",
    },
    description: {
      zh: "使用功能后，历史记录会显示在这里",
      en: "History will appear here after you start using this feature",
      ja: "機能を使用すると、履歴がここに表示されます",
    },
  },
  "no-chat": {
    icon: MessageCircle,
    title: {
      zh: "发送消息开始对话",
      en: "Send a Message to Start",
      ja: "メッセージを送信して会話を始めましょう",
    },
    description: {
      zh: "输入你的问题或想法，AI 将为你提供帮助",
      en: "Type your question or idea — AI is here to help",
      ja: "質問やアイデアを入力してください。AI がお手伝いします",
    },
  },
  "no-stats": {
    icon: BarChart3,
    title: {
      zh: "暂无统计数据",
      en: "No Statistics Yet",
      ja: "統計データがありません",
    },
    description: {
      zh: "开始使用后，用量和统计数据将在此显示",
      en: "Usage and statistics will appear here once you get started",
      ja: "使用を開始すると、利用状況と統計がここに表示されます",
    },
  },
  "no-folder": {
    icon: FolderOpen,
    title: {
      zh: "暂无文件夹",
      en: "No Folders",
      ja: "フォルダがありません",
    },
    description: {
      zh: "创建文件夹来分类管理你的资源",
      en: "Create folders to organize your resources",
      ja: "フォルダを作成してリソースを整理しましょう",
    },
    actionLabel: { zh: "新建文件夹", en: "New Folder", ja: "フォルダを作成" },
  },
  "no-tag": {
    icon: Search,
    title: {
      zh: "暂无标签",
      en: "No Tags",
      ja: "タグがありません",
    },
    description: {
      zh: "给资源添加标签以便快速筛选和查找",
      en: "Add tags to resources for quick filtering and discovery",
      ja: "リソースにタグを追加して素早くフィルタリング・検索しましょう",
    },
    actionLabel: { zh: "添加标签", en: "Add Tag", ja: "タグを追加" },
  },
  "no-api-key": {
    icon: ServerOff,
    title: {
      zh: "暂无 API Key",
      en: "No API Keys",
      ja: "API キーがありません",
    },
    description: {
      zh: "点击上方按钮创建你的第一个密钥",
      en: "Click the button above to create your first key",
      ja: "上のボタンをクリックして最初のキーを作成してください",
    },
    actionLabel: { zh: "创建密钥", en: "Create Key", ja: "キーを作成" },
  },
  "no-action": {
    icon: Sparkles,
    title: {
      zh: "暂无快捷功能",
      en: "No Quick Actions",
      ja: "クイックアクションがありません",
    },
    description: {
      zh: "启用或添加快捷功能提升效率",
      en: "Enable or add quick actions to boost your productivity",
      ja: "クイックアクションを有効にするか追加して効率を上げましょう",
    },
    actionLabel: { zh: "添加功能", en: "Add Action", ja: "アクションを追加" },
  },
  "no-phrase": {
    icon: Languages,
    title: {
      zh: "暂无短语",
      en: "No Phrases",
      ja: "フレーズがありません",
    },
    description: {
      zh: "添加常用短语，对话中快速插入",
      en: "Add frequently used phrases for quick insertion during chats",
      ja: "よく使うフレーズを追加して、チャット中にすばやく挿入しましょう",
    },
    actionLabel: { zh: "添加短语", en: "Add Phrase", ja: "フレーズを追加" },
  },
  "no-datasource": {
    icon: FolderOpen,
    title: {
      zh: "暂无数据源",
      en: "No Data Sources",
      ja: "データソースがありません",
    },
    description: {
      zh: "拖拽文件到此处上传，或点击按钮添加",
      en: "Drag and drop files here to upload, or click the button to add",
      ja: "ファイルをここにドラッグ＆ドロップするか、ボタンをクリックして追加してください",
    },
    actionLabel: { zh: "添加数据源", en: "Add Data Source", ja: "データソースを追加" },
  },
  "no-search-engine": {
    icon: Search,
    title: {
      zh: "暂无自定义搜索引擎",
      en: "No Custom Search Engines",
      ja: "カスタム検索エンジンがありません",
    },
    description: {
      zh: "添加自定义搜索引擎扩展搜索能力",
      en: "Add custom search engines to extend search capabilities",
      ja: "カスタム検索エンジンを追加して検索機能を拡張しましょう",
    },
    actionLabel: { zh: "添加搜索引擎", en: "Add Search Engine", ja: "検索エンジンを追加" },
  },
  "no-favorite": {
    icon: Star,
    title: {
      zh: "暂无收藏",
      en: "No Favorites",
      ja: "お気に入りがありません",
    },
    description: {
      zh: "点击资源卡片上的收藏按钮来收藏",
      en: "Click the favorite button on resource cards to save them",
      ja: "リソースカードのお気に入りボタンをクリックして保存しましょう",
    },
  },
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  preset?: EmptyStatePreset
  icon?: IconComponent
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  compact?: boolean
  /** Slot for custom action content (alternative to actionLabel/onAction) */
  action?: React.ReactNode
  locale?: Locale
}

function EmptyState({
  preset,
  icon: IconOverride,
  title: titleOverride,
  description: descOverride,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact = false,
  action,
  locale = 'zh',
  className,
  ...props
}: EmptyStateProps) {
  const config = preset ? PRESET_MAP[preset] : null
  const Icon = IconOverride || config?.icon || FileQuestion
  const title = titleOverride || config?.title[locale] || config?.title.en || "暂无内容"
  const description = descOverride || config?.description[locale] || config?.description.en || ""
  const resolvedActionLabel = actionLabel || (onAction && config?.actionLabel?.[locale]) || (onAction && config?.actionLabel?.en) || undefined

  if (compact) {
    const compactIllustration = preset ? ILLUSTRATION_MAP[preset] : null
    return (
      <div
        data-slot="empty"
        className={cn(
          "flex flex-col items-center justify-center py-8 px-4",
          className
        )}
        {...props}
      >
        {compactIllustration ? (
          <div className="w-[280px] h-[180px] mb-3 flex items-center justify-center overflow-hidden">
            <img
              src={`/images/empty-state/${encodeURIComponent(compactIllustration)}.svg`}
              alt=""
              className="w-full h-full object-contain invert dark:invert-0 opacity-95"
              draggable={false}
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-[var(--radius-button)] bg-muted flex items-center justify-center mb-3">
            <Icon size={16} className="text-muted-foreground" />
          </div>
        )}
        <p className="text-xs text-foreground/80 mb-1">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/60 text-center max-w-[260px]">
            {description}
          </p>
        )}
        {resolvedActionLabel && onAction && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onAction}
            className="mt-3 bg-muted text-muted-foreground text-xs hover:bg-accent"
          >
            {resolvedActionLabel}
          </Button>
        )}
        {action}
      </div>
    )
  }

  return (
    <div
      data-slot="empty"
      className={cn(
        "flex-1 flex flex-col items-center justify-center px-2 pt-2 pb-8 gap-6",
        className
      )}
      {...props}
    >
      {/* Illustration from Figma (Bento Cards v2 AI) */}
      {(() => {
        const illustrationName = preset ? ILLUSTRATION_MAP[preset] : null
        if (!illustrationName) return null
        return (
          <div className="w-full max-w-[350px] h-[200px] overflow-hidden relative flex items-center justify-center">
            <img
              src={`/images/empty-state/${encodeURIComponent(illustrationName)}.svg`}
              alt=""
              className="w-full h-full object-contain invert dark:invert-0 opacity-80"
              draggable={false}
            />
          </div>
        )
      })()}
      {/* Text */}
      <div className="flex flex-col items-center gap-1 text-center w-full">
        <h3 className="text-lg font-semibold text-foreground tracking-[-0.27px]">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground text-center max-w-[300px] leading-[1.4] tracking-[-0.21px]">
            {description}
          </p>
        )}
      </div>
      {/* Actions */}
      {(resolvedActionLabel || secondaryLabel || action) && (
        <div className="flex items-center gap-2">
          {resolvedActionLabel && onAction && (
            <Button
              variant="default"
              size="sm"
              onClick={onAction}
              className="rounded-full px-4 gap-1.5"
            >
              {resolvedActionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondary && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondary}
              className="rounded-full px-4 gap-1.5"
            >
              {secondaryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyState,
  PRESET_MAP as EMPTY_PRESET_MAP,
}

export type { EmptyStatePreset, Locale as EmptyStateLocale }
