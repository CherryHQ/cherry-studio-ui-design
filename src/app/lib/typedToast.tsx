import { toast } from 'sonner';
import { Button } from '@cherry-studio/ui';
import {
  AlertTriangle, KeyRound, CreditCard, Wifi, Network,
  Scissors, BoxSelect, Cog, Wrench, FileWarning, OctagonAlert,
  Server, Ban, Eye, BookOpen, Image as ImageIcon, ScanLine,
  LifeBuoy, X,
  type LucideIcon,
} from 'lucide-react';
import {
  classifyError, type ClassifiedError, type ClassifyHint, type ErrorCategory,
  CATEGORIES_WITH_ACTION,
} from './errorClassifier';
import {
  buildPayload, type ErrorReportPayload,
} from './errorReport';

// ============================================================
// Typed Toast
// ============================================================
// 对应 cherry-studio#15651（分类 + inline action）+ #15668（一键 Report）：
//   - errorFromException(error, hint?) 把任意异常分类后渲染成
//     带主 inline action + Report icon 的双按钮 toast
//   - 现有 toast.error(string) 不动；新 helper 是渐进迁移入口
//
// 原型阶段：action handler 全部 mock（开提示 toast 表示"如果是真的，
// 这里会打开 ProviderQuickConfigPopover / 重发 chat / 跳 billing"等等）。

export interface ErrorToastHandlers {
  /** auth → 打开 provider 配置 popover */
  openProviderConfig?: (provider?: string) => void;
  /** quota → 跳 provider 计费页 */
  openBilling?: (provider?: string) => void;
  /** network / proxy / stream → 重试触发原动作 */
  retry?: () => void | Promise<void>;
  /** context_length → 触发 /clear */
  trimHistory?: () => void;
  /** model → 打开同 provider 的模型选择器 */
  switchModel?: (provider?: string) => void;
  /** mcp → 打开对应 MCP 状态面板 */
  viewMcp?: (mcpName?: string) => void;
  /**
   * #15668 求助路径——入口默认进 Cherry 小助理诊断；用户没解决再升级
   * 到「上报到团队」走 preview-before-send。
   *
   * 入口名义上叫"求助"，因为 spec 上推荐的主路径是自助诊断而不是
   * 直接上报（参考讨论：#15668 + 团队评论里的 Sentry 集成 + 小助理）。
   */
  openHelp?: (payload: ErrorReportPayload) => void;
}

// 模块级 handlers——演示页可以注册 mock 副作用。生产侧会由 App 根
// 用真实路由 / store 注入。
let globalHandlers: ErrorToastHandlers = {};
export function registerToastHandlers(handlers: ErrorToastHandlers) {
  globalHandlers = { ...globalHandlers, ...handlers };
}

// ============================================================
// 每类错误的 humanized 文案 + action 配置
// ============================================================

interface ToastSpec {
  icon: LucideIcon;
  title: (m: ClassifiedError['meta']) => string;
  description?: (m: ClassifiedError['meta']) => string | undefined;
  action?: {
    label: string;
    /** tooltip 文案，解释这个按钮会干嘛 */
    hint?: string;
    run: (m: ClassifiedError['meta'], h: ErrorToastHandlers) => void;
  };
}

const SPECS: Record<ErrorCategory, ToastSpec> = {
  auth: {
    icon: KeyRound,
    title: (m) => m.provider
      ? `配置 ${m.provider}${m.model ? ` 才能使用 ${m.model}` : ''}`
      : '需要配置 API Key',
    description: (m) => m.provider ? `${m.provider} 暂未配置或 Key 已失效` : undefined,
    action: {
      label: '去配置',
      hint: '打开 Provider 内联配置 popover',
      run: (m, h) => h.openProviderConfig?.(m.provider),
    },
  },
  quota: {
    icon: CreditCard,
    title: (m) => {
      const who = m.provider ?? '当前 provider';
      if (m.waitSeconds) return `${who} 已达调用上限——${m.waitSeconds}s 后重试，或升级套餐`;
      return `${who} 已达调用上限——升级套餐或稍后重试`;
    },
    action: {
      label: '去计费页',
      hint: '跳转 provider 的 billing/usage 页面',
      run: (m, h) => h.openBilling?.(m.provider),
    },
  },
  network: {
    icon: Wifi,
    title: () => '网络不可达——是否重试？',
    description: () => '本地网络或目标 API 暂时无法到达',
    action: {
      label: '重试',
      hint: '重新发起触发本次错误的请求',
      run: (_m, h) => h.retry?.(),
    },
  },
  proxy: {
    icon: Network,
    title: () => '代理连接失败——是否重试？',
    description: () => '代理服务器返回错误。先检查代理配置或重试',
    action: {
      label: '重试',
      hint: '不解决代理问题不会成功',
      run: (_m, h) => h.retry?.(),
    },
  },
  context_length: {
    icon: Scissors,
    title: (m) => m.model
      ? `对话太长，${m.model} 装不下——要不要清掉旧消息？`
      : '对话太长——要不要清掉旧消息？',
    description: (m) => m.contextLimit ? `当前模型上下文上限 ${m.contextLimit.toLocaleString()} tokens` : undefined,
    action: {
      label: '清理历史',
      hint: '打开 /clear 流程或自动压缩对话',
      run: (_m, h) => h.trimHistory?.(),
    },
  },
  model: {
    icon: BoxSelect,
    title: (m) => m.model
      ? `模型 ${m.model} 已下线或不可用——换一个？`
      : '该模型不可用——换一个？',
    action: {
      label: '换模型',
      hint: '打开同 provider 的模型选择器',
      run: (m, h) => h.switchModel?.(m.provider),
    },
  },
  mcp: {
    icon: Wrench,
    title: (m) => m.mcpName
      ? `MCP 服务 '${m.mcpName}' 无响应`
      : 'MCP 服务无响应',
    action: {
      label: '查看 MCP',
      hint: '打开对应 MCP 状态面板查问题',
      run: (m, h) => h.viewMcp?.(m.mcpName),
    },
  },
  // 以下：没有按钮 / fallback
  payload: {
    icon: FileWarning,
    title: () => '请求体过大',
    description: () => '请减少附件、图片或一次性发送的内容长度',
  },
  parse: {
    icon: AlertTriangle,
    title: () => '响应解析失败',
    description: () => '返回的内容格式不符合预期——这通常是上游模型或网关问题',
  },
  content: {
    icon: Ban,
    title: () => '内容被拒绝',
    description: () => '请求被 provider 的内容策略拦截',
  },
  server: {
    icon: Server,
    title: (m) => m.provider ? `${m.provider} 服务器错误` : '服务器错误',
    description: () => '上游返回 5xx——通常稍后会自动恢复',
    action: {
      label: '重试',
      hint: '重新发起触发本次错误的请求',
      run: (_m, h) => h.retry?.(),
    },
  },
  stream: {
    icon: OctagonAlert,
    title: () => '流式响应中断',
    action: {
      label: '重试',
      run: (_m, h) => h.retry?.(),
    },
  },
  deprecated: {
    icon: AlertTriangle,
    title: (m) => m.model ? `模型 ${m.model} 已被官方弃用` : '该模型已被官方弃用',
    action: {
      label: '换模型',
      run: (m, h) => h.switchModel?.(m.provider),
    },
  },
  knowledge: {
    icon: BookOpen,
    title: () => '知识库读取失败',
    description: () => '索引或向量服务暂时不可用',
  },
  ocr: {
    icon: ScanLine,
    title: () => 'OCR 识别失败',
    description: () => '图片中可能没有可识别文本，或服务暂时不可用',
  },
  unknown: {
    icon: AlertTriangle,
    title: () => '出错了',
  },
};

// ============================================================
// Helper: errorFromException
// ============================================================

export interface ErrorToastOptions {
  /** 默认 true：把 raw error.message 折叠到 description 末尾 */
  showRaw?: boolean;
  duration?: number;
  /** 覆盖默认的 mock global handlers（演示页用） */
  handlers?: ErrorToastHandlers;
}

export function errorFromException(
  error: unknown,
  hint?: ClassifyHint,
  options?: ErrorToastOptions,
): string | number {
  const classified = classifyError(error, hint);
  const spec = SPECS[classified.category];
  const handlers = { ...globalHandlers, ...(options?.handlers ?? {}) };

  const title = spec.title(classified.meta);
  const description = spec.description?.(classified.meta);

  const showAction = !!spec.action && CATEGORIES_WITH_ACTION.has(classified.category);
  const Icon = spec.icon;

  return toast.custom((toastId) => (
    <TypedErrorToastBody
      toastId={toastId}
      icon={Icon}
      title={title}
      description={description}
      rawMessage={options?.showRaw === false ? undefined : classified.rawMessage}
      actionLabel={showAction ? spec.action!.label : undefined}
      onAction={showAction ? () => spec.action!.run(classified.meta, handlers) : undefined}
      onReport={() => {
        const payload = buildPayload(classified, { module: classified.meta.originAction });
        handlers.openHelp?.(payload);
      }}
    />
  ), {
    duration: options?.duration ?? (showAction ? 8000 : 6000),
  });
}

// ============================================================
// Toast body —— 自定义渲染，挂双按钮（主 action + Report）
// ============================================================

interface TypedErrorToastBodyProps {
  toastId: string | number;
  icon: LucideIcon;
  title: string;
  description?: string;
  /** raw error.message —— 不显示在主体，仅作为 icon 的 hover tooltip */
  rawMessage?: string;
  actionLabel?: string;
  onAction?: () => void;
  onReport: () => void;
}

function TypedErrorToastBody({
  toastId, icon: Icon, title, description, rawMessage, actionLabel, onAction, onReport,
}: TypedErrorToastBodyProps) {
  // sonner 的 portal 把 toast 渲染在 body 上——继承 popover 样式 token
  // 比较合适。宽度上限 420，文字 wrap 不挤压按钮。
  return (
    <div className="pointer-events-auto flex items-start gap-3 w-full max-w-md rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-3.5">
      <div
        title={rawMessage}
        className="size-8 rounded-lg flex items-center justify-center bg-error-muted text-destructive shrink-0 cursor-help"
      >
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground leading-snug">{title}</div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-3">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {actionLabel && onAction && (
            <Button
              size="xs"
              onClick={() => { onAction(); toast.dismiss(toastId); }}
            >
              {actionLabel}
            </Button>
          )}
          <Button
            variant="ghost"
            size="xs"
            onClick={onReport}
            title="让小助理帮你看看，没解决再上报"
            aria-label="求助"
            className="gap-1 text-muted-foreground"
          >
            <LifeBuoy size={11} />
            <span>求助</span>
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => toast.dismiss(toastId)}
        aria-label="关闭"
        className="shrink-0 -mr-1 -mt-1 text-muted-foreground"
      >
        <X size={13} />
      </Button>
    </div>
  );
}

// 给演示页 / 后续单测用：导出每类的 spec 元信息（不含 callback）
export function describeCategory(category: ErrorCategory) {
  const spec = SPECS[category];
  return {
    icon: spec.icon,
    sampleTitle: spec.title({}),
    actionLabel: spec.action?.label,
    actionHint: spec.action?.hint,
    hasAction: CATEGORIES_WITH_ACTION.has(category),
  };
}
