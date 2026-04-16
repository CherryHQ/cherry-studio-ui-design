"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ServerOff, FileQuestion, BookOpenCheck, NotebookPen,
  FolderOpen, Puzzle, Code2, Search, Library, Languages,
  Sparkles, Package,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
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
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-accent-blue text-[13px]/relaxed [&>a]:underline [&>a]:underline-offset-4",
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
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-[13px]",
        className
      )}
      {...props}
    />
  )
}

// ===========================
// EmptyState presets (Cherry Studio domain-specific)
// ===========================

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

interface PresetConfig {
  icon: IconComponent
  title: string
  description: string
}

const PRESET_MAP: Record<EmptyStatePreset, PresetConfig> = {
  "no-model": {
    icon: ServerOff,
    title: "尚未配置模型服务",
    description: "请先前往设置页面添加模型服务商并启用模型，才能开始使用",
  },
  "no-assistant": {
    icon: Sparkles,
    title: "暂无可用助手",
    description: "前往资源库创建或导入你的第一个助手",
  },
  "no-agent": {
    icon: Package,
    title: "暂无可用智能体",
    description: "前往资源库创建或导入你的第一个智能体",
  },
  "no-knowledge": {
    icon: BookOpenCheck,
    title: "暂无知识库",
    description: "创建你的第一个知识库，导入文档开始语义检索",
  },
  "no-file": {
    icon: FolderOpen,
    title: "暂无文件",
    description: "上传文件或从其他页面保存内容到文件管理器",
  },
  "no-note": {
    icon: NotebookPen,
    title: "暂无笔记",
    description: "创建你的第一篇笔记，随时记录灵感和想法",
  },
  "no-miniapp": {
    icon: Puzzle,
    title: "暂无小程序",
    description: "添加常用的 AI 应用作为小程序快速访问",
  },
  "no-code-tool": {
    icon: Code2,
    title: "暂无代码工具",
    description: "添加 CLI 工具或代码助手开始使用",
  },
  "no-resource": {
    icon: Library,
    title: "暂无资源",
    description: "创建助手、智能体或导入插件来丰富你的工作空间",
  },
  "no-translate": {
    icon: Languages,
    title: "暂无翻译记录",
    description: "输入文本开始你的第一次翻译",
  },
  "no-result": {
    icon: Search,
    title: "未找到匹配结果",
    description: "尝试调整搜索关键词或筛选条件",
  },
  "no-topic": {
    icon: FileQuestion,
    title: "暂无话题",
    description: "发送消息开始你的第一个话题",
  },
  "no-session": {
    icon: FileQuestion,
    title: "暂无会话",
    description: "开始一次新的工作会话",
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
  className,
  ...props
}: EmptyStateProps) {
  const config = preset ? PRESET_MAP[preset] : null
  const Icon = IconOverride || config?.icon || FileQuestion
  const title = titleOverride || config?.title || "暂无内容"
  const description = descOverride || config?.description || ""

  if (compact) {
    return (
      <div
        data-slot="empty"
        className={cn(
          "flex flex-col items-center justify-center py-10 px-4",
          className
        )}
        {...props}
      >
        <div className="w-9 h-9 rounded-[var(--radius-button)] bg-muted flex items-center justify-center mb-3">
          <Icon size={16} className="text-muted-foreground" />
        </div>
        <p className="text-[11px] text-muted-foreground mb-1">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/70 text-center max-w-[200px]">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onAction}
            className="mt-3 bg-muted text-muted-foreground text-xs hover:bg-accent"
          >
            {actionLabel}
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
        "flex-1 flex flex-col items-center justify-center px-6 py-16",
        className
      )}
      {...props}
    >
      <div className="w-14 h-14 rounded-[var(--radius-card)] bg-muted/60 border border-border flex items-center justify-center mb-5">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-[13px] text-foreground/70 mb-1.5">{title}</h3>
      {description && (
        <p className="text-[11px] text-muted-foreground text-center max-w-[280px] mb-5 leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex items-center gap-2">
        {actionLabel && onAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="bg-muted text-muted-foreground text-[11px] hover:bg-accent"
          >
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && onSecondary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSecondary}
            className="bg-muted/60 text-muted-foreground text-[11px] hover:bg-accent"
          >
            {secondaryLabel}
          </Button>
        )}
        {action}
      </div>
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

export type { EmptyStatePreset }
