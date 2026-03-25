import React from 'react';
import {
  ServerOff, FileQuestion, BookOpenCheck, NotebookPen,
  FolderOpen, Puzzle, Code2, Search, Library, Languages,
  Sparkles, Package,
} from 'lucide-react';

// ===========================
// Reusable Empty State Component
// ===========================

export type EmptyStatePreset =
  | 'no-model'
  | 'no-assistant'
  | 'no-agent'
  | 'no-knowledge'
  | 'no-file'
  | 'no-note'
  | 'no-miniapp'
  | 'no-code-tool'
  | 'no-resource'
  | 'no-translate'
  | 'no-result'
  | 'no-topic'
  | 'no-session';

interface PresetConfig {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}

const PRESET_MAP: Record<EmptyStatePreset, PresetConfig> = {
  'no-model': {
    icon: ServerOff,
    title: '尚未配置模型服务',
    description: '请先前往设置页面添加模型服务商并启用模型，才能开始使用',
  },
  'no-assistant': {
    icon: Sparkles,
    title: '暂无可用助手',
    description: '前往资源库创建或导入你的第一个助手',
  },
  'no-agent': {
    icon: Package,
    title: '暂无可用智能体',
    description: '前往资源库创建或导入你的第一个智能体',
  },
  'no-knowledge': {
    icon: BookOpenCheck,
    title: '暂无知识库',
    description: '创建你的第一个知识库，导入文档开始语义检索',
  },
  'no-file': {
    icon: FolderOpen,
    title: '暂无文件',
    description: '上传文件或从其他页面保存内容到文件管理器',
  },
  'no-note': {
    icon: NotebookPen,
    title: '暂无笔记',
    description: '创建你的第一篇笔记，随时记录灵感和想法',
  },
  'no-miniapp': {
    icon: Puzzle,
    title: '暂无小程序',
    description: '添加常用的 AI 应用作为小程序快速访问',
  },
  'no-code-tool': {
    icon: Code2,
    title: '暂无代码工具',
    description: '添加 CLI 工具或代码助手开始使用',
  },
  'no-resource': {
    icon: Library,
    title: '暂无资源',
    description: '创建助手、智能体或导入插件来丰富你的工作空间',
  },
  'no-translate': {
    icon: Languages,
    title: '暂无翻译记录',
    description: '输入文本开始你的第一次翻译',
  },
  'no-result': {
    icon: Search,
    title: '未找到匹配结果',
    description: '尝试调整搜索关键词或筛选条件',
  },
  'no-topic': {
    icon: FileQuestion,
    title: '暂无话题',
    description: '发送消息开始你的第一个话题',
  },
  'no-session': {
    icon: FileQuestion,
    title: '暂无会话',
    description: '开始一次新的工作会话',
  },
};

interface EmptyStateProps {
  preset?: EmptyStatePreset;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  compact?: boolean;
}

export function EmptyState({
  preset,
  icon: IconOverride,
  title: titleOverride,
  description: descOverride,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact = false,
}: EmptyStateProps) {
  const config = preset ? PRESET_MAP[preset] : null;
  const Icon = IconOverride || config?.icon || FileQuestion;
  const title = titleOverride || config?.title || '暂无内容';
  const description = descOverride || config?.description || '';

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center mb-3">
          <Icon size={16} className="text-foreground/30" />
        </div>
        <p className="text-[11px] text-foreground/50 mb-1">{title}</p>
        {description && (
          <p className="text-[10px] text-foreground/35 text-center max-w-[200px]">{description}</p>
        )}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-3 px-3 py-1 rounded-lg bg-foreground/[0.06] text-foreground/60 text-[10px] hover:bg-foreground/[0.1] transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-14 h-14 rounded-2xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center mb-5">
        <Icon size={24} className="text-foreground/25" />
      </div>
      <h3 className="text-[13px] text-foreground/70 mb-1.5">{title}</h3>
      {description && (
        <p className="text-[11px] text-foreground/40 text-center max-w-[280px] mb-5 leading-relaxed">{description}</p>
      )}
      <div className="flex items-center gap-2">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-1.5 rounded-lg bg-foreground/[0.06] text-foreground/60 text-[11px] hover:bg-foreground/[0.1] transition-colors"
          >
            {actionLabel}
          </button>
        )}
        {secondaryLabel && onSecondary && (
          <button
            onClick={onSecondary}
            className="px-4 py-1.5 rounded-lg bg-foreground/5 text-foreground/50 text-[11px] hover:bg-foreground/8 transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
