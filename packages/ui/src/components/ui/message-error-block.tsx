"use client"

// ===========================
// Message Error Block + Detail Dialog + AI Diagnosis
// ===========================
// Mirrors Cherry Studio source's three-layer error UX:
//   1. ErrorBlock (subtle clickable summary card) — inline in the chat
//   2. ErrorDetailModal (popup) — full structured details
//   3. AIDiagnosisSection (inside the modal) — AI-generated triage with steps
//
// Source references in the upstream repo:
//   src/renderer/src/pages/home/Messages/Blocks/ErrorBlock.tsx
//   src/renderer/src/components/ErrorDetailModal/index.tsx
//   src/renderer/src/components/ErrorDetailModal/AIDiagnosisSection.tsx

import * as React from 'react';
import {
  AlertTriangle, ChevronRight, Copy, Check, Loader2, Stethoscope, CheckCircle,
  Settings, RotateCcw, X as XIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from './dialog';

// ----- Public types (mirror src/app/types/chat.ts ErrorDetail / ErrorDiagnosis) -----

export interface MessageErrorDiagnosis {
  summary: string;
  explanation?: string;
  steps?: { text: string }[];
}

export interface MessageErrorDetail {
  message: string;
  code?: string;
  statusCode?: number;
  stack?: string;
  requestUrl?: string;
  responseBody?: string;
  responseHeaders?: string;
  providerId?: string;
  modelId?: string;
  classification?: string;
  diagnosis?: MessageErrorDiagnosis;
}

const HTTP_ERROR_LABELS: Record<number, string> = {
  400: '请求格式错误',
  401: '身份验证失败',
  403: '没有访问权限',
  404: '资源未找到',
  429: '请求过于频繁',
  500: '服务端错误',
  502: '上游网关错误',
  503: '服务暂不可用',
  504: '上游响应超时',
};

function classifyError(detail: MessageErrorDetail): string {
  if (detail.classification) return detail.classification;
  if (detail.statusCode && HTTP_ERROR_LABELS[detail.statusCode]) return HTTP_ERROR_LABELS[detail.statusCode];
  if (detail.code === 'rate_limit' || detail.code === '429') return HTTP_ERROR_LABELS[429];
  if (detail.code === 'auth_failed' || detail.code === '401') return HTTP_ERROR_LABELS[401];
  return '请求失败';
}

// =============================================================
// 1. MessageErrorBlock — inline summary card (clickable to open detail)
// =============================================================

export interface MessageErrorBlockProps {
  /** Plain-text message — required. Used as description in the card. */
  message: string;
  /** Optional short code (e.g. '429'). */
  code?: string;
  /** Visual density — `compact` is for inline use inside tool-call rows. */
  size?: 'compact' | 'default';
  /** Optional retry handler — surfaces a 重试 link inline. */
  onRetry?: () => void;
  /** Override retry link label. */
  retryLabel?: string;
  /** Rich error payload — when provided, the card opens a detail dialog on click. */
  detail?: MessageErrorDetail;
  /** Optional handler invoked when the user clicks "前往设置". Falls back to console hint. */
  onNavigateToSettings?: (providerId?: string) => void;
  className?: string;
}

export function MessageErrorBlock({
  message,
  code,
  size = 'default',
  onRetry,
  retryLabel = '重试',
  detail,
  onNavigateToSettings,
  className,
}: MessageErrorBlockProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const compact = size === 'compact';

  const effectiveDetail: MessageErrorDetail = React.useMemo(
    () => detail ?? { message, code, statusCode: code && /^\d+$/.test(code) ? parseInt(code, 10) : undefined },
    [detail, message, code],
  );
  const title = classifyError(effectiveDetail);

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToSettings?.(effectiveDetail.providerId);
  };

  // Defensive cleanup — Radix Dialog can leave `pointer-events: none` on
  // <body> if the host component unmounts while the dialog is open (e.g.
  // the chat re-renders / session switches). That would make the rest of
  // the page unclickable until refresh. Reset it whenever this block
  // unmounts or its open state flips back to false.
  React.useEffect(() => {
    if (modalOpen) return;
    const body = typeof document !== 'undefined' ? document.body : null;
    if (body && body.style.pointerEvents === 'none') {
      body.style.pointerEvents = '';
    }
  }, [modalOpen]);
  React.useEffect(() => {
    return () => {
      const body = typeof document !== 'undefined' ? document.body : null;
      if (body && body.style.pointerEvents === 'none') {
        body.style.pointerEvents = '';
      }
    };
  }, []);

  return (
    <>
      <div
        data-slot="message-error-block"
        role="alert"
        onClick={() => setModalOpen(true)}
        className={cn(
          'group relative rounded-[var(--radius-button)] border cursor-pointer transition-colors',
          // Faint destructive chrome — the red AlertTriangle carries the
          // semantic, no left stripe needed.
          'border-destructive/15 bg-destructive/[0.025]',
          'hover:border-destructive/30 hover:bg-destructive/[0.05]',
          compact ? 'px-2.5 py-2' : 'px-3 py-2.5',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-1.5">
          <AlertTriangle
            size={compact ? 12 : 13}
            className="text-destructive flex-shrink-0"
          />
          <span
            className={cn(
              'font-medium text-destructive/85 leading-snug truncate',
              compact ? 'text-[11px]' : 'text-[12px]',
            )}
          >
            {title}
          </span>
          {effectiveDetail.code && (
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-px rounded font-mono leading-none flex-shrink-0',
                'bg-destructive/8 text-destructive/75',
                compact ? 'text-[9px]' : 'text-[10px]',
              )}
            >
              {effectiveDetail.code}
            </span>
          )}
        </div>

        {/* Description */}
        <div
          className={cn(
            'ml-[18px] mt-0.5 line-clamp-3 leading-snug text-foreground/65',
            compact ? 'text-[11px]' : 'text-xs',
          )}
        >
          {effectiveDetail.message || message}
        </div>

        {/* Footer */}
        <div className="ml-[18px] mt-1.5 flex items-center gap-1.5">
          {effectiveDetail.providerId && (
            <Button
              variant="ghost"
              size="inline"
              onClick={handleNavigate}
              className={cn(
                'gap-1 px-1.5 py-0.5 rounded border border-destructive/20',
                'text-destructive/75 hover:text-destructive hover:bg-destructive/8 hover:border-destructive/35',
                compact ? 'text-[10px]' : 'text-[11px]',
              )}
            >
              <Settings size={compact ? 9 : 10} />
              <span>前往设置</span>
            </Button>
          )}
          {onRetry && (
            <Button
              variant="ghost"
              size="inline"
              onClick={(e) => { e.stopPropagation(); onRetry(); }}
              className={cn(
                'gap-1 px-1.5 py-0.5 rounded text-destructive/75 hover:text-destructive hover:bg-destructive/8',
                compact ? 'text-[10px]' : 'text-[11px]',
              )}
            >
              <RotateCcw size={compact ? 9 : 10} />
              <span>{retryLabel}</span>
            </Button>
          )}
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-0.5 text-muted-foreground/50',
              'group-hover:text-destructive/80 transition-colors',
              compact ? 'text-[10px]' : 'text-[11px]',
            )}
          >
            <span>查看详情</span>
            <ChevronRight size={compact ? 10 : 11} />
          </span>
        </div>
      </div>

      <MessageErrorDetailDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        detail={effectiveDetail}
        title={title}
        onRetry={onRetry}
        onNavigateToSettings={onNavigateToSettings}
      />
    </>
  );
}

// =============================================================
// 2. MessageErrorDetailDialog — full structured details + diagnosis
// =============================================================

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: MessageErrorDetail;
  title: string;
  onRetry?: () => void;
  onNavigateToSettings?: (providerId?: string) => void;
}

function MessageErrorDetailDialog({
  open, onOpenChange, detail, title, onRetry, onNavigateToSettings,
}: DetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[680px] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/20">
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle size={16} className="text-destructive" />
            <span className="text-destructive">{title}</span>
            {detail.code && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] bg-destructive/10 text-destructive/80">
                {detail.code}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs">
            错误详情与 AI 诊断
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
          <DetailRow label="错误信息" value={detail.message} mono />
          {detail.statusCode != null && (
            <DetailRow label="HTTP 状态码" value={String(detail.statusCode)} mono />
          )}
          {detail.providerId && (
            <DetailRow label="服务商" value={detail.providerId} mono />
          )}
          {detail.modelId && (
            <DetailRow label="模型" value={detail.modelId} mono />
          )}
          {detail.requestUrl && (
            <DetailRow label="请求 URL" value={detail.requestUrl} mono />
          )}
          {detail.responseHeaders && (
            <DetailRow label="响应头" value={detail.responseHeaders} code language="json" />
          )}
          {detail.responseBody && (
            <DetailRow label="响应内容" value={detail.responseBody} code language="json" />
          )}
          {detail.stack && (
            <DetailRow label="堆栈跟踪" value={detail.stack} code language="text" tone="error" />
          )}

          <AIDiagnosisSection detail={detail} />
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border/20 bg-muted/15">
          <div className="flex items-center gap-2 w-full">
            <CopyButton value={JSON.stringify(detail, null, 2)} label="复制全部" />
            <div className="ml-auto flex items-center gap-2">
              {detail.providerId && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onNavigateToSettings?.(detail.providerId)}
                  className="gap-1.5"
                >
                  <Settings size={11} />
                  前往设置
                </Button>
              )}
              {onRetry && (
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => { onRetry(); onOpenChange(false); }}
                  className="gap-1.5"
                >
                  <RotateCcw size={11} />
                  重试请求
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================
// 3. Reusable sub-components
// =============================================================

function DetailRow({
  label, value, mono, code, language = 'text', tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  code?: boolean;
  language?: string;
  tone?: 'error';
}) {
  // Code-type rows (response body / headers / stack) are heavy payloads —
  // collapse them by default to keep the modal scannable; the user can
  // expand on demand via the header.
  const [expanded, setExpanded] = React.useState(false);
  if (code) {
    const charCount = value?.length ?? 0;
    return (
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-cherry-primary transition-colors"
        >
          <ChevronRight
            size={11}
            className={cn('text-muted-foreground/60 transition-transform', expanded && 'rotate-90')}
          />
          <span>{label}</span>
          {charCount > 0 && (
            <span className="text-[10px] font-normal text-muted-foreground/50 tabular-nums">
              {charCount} 字符
            </span>
          )}
        </button>
        {expanded && (
          <pre
            className={cn(
              'rounded-md border p-3 text-[11px] leading-[1.55] font-mono whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto scrollbar-thin',
              tone === 'error'
                ? 'bg-destructive/[0.04] border-destructive/25 text-destructive/85'
                : 'bg-muted/30 border-border/30 text-muted-foreground',
            )}
            data-language={language}
          >
            {value}
          </pre>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-foreground">{label}</div>
      <div
        className={cn(
          'rounded-md border border-border/30 bg-muted/20 px-2.5 py-1.5 text-xs break-all',
          mono ? 'font-mono text-foreground/85' : 'text-foreground/80',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function CopyButton({ value, label = '复制' }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  const handle = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <Button
      variant="outline"
      size="xs"
      onClick={handle}
      className="gap-1.5"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      <span>{copied ? '已复制' : label}</span>
    </Button>
  );
}

// =============================================================
// AI Diagnosis subpanel
// =============================================================

interface AIDiagnosisProps {
  detail: MessageErrorDetail;
}

function AIDiagnosisSection({ detail }: AIDiagnosisProps) {
  type Status = 'idle' | 'loading' | 'done' | 'error';
  const [status, setStatus] = React.useState<Status>(detail.diagnosis ? 'done' : 'idle');
  const [result, setResult] = React.useState<MessageErrorDiagnosis | null>(detail.diagnosis ?? null);

  const run = React.useCallback(() => {
    setStatus('loading');
    setResult(null);
    // Simulated AI diagnosis — in the real app this calls ErrorDiagnosisService.diagnoseError.
    window.setTimeout(() => {
      setResult(buildMockDiagnosis(detail));
      setStatus('done');
    }, 1200);
  }, [detail]);

  return (
    <div
      className="mt-1 rounded-lg border p-3.5"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-primary, currentColor) 15%, transparent)',
        background: 'color-mix(in srgb, var(--color-primary, currentColor) 3%, transparent)',
      }}
    >
      <div className="flex items-center gap-2">
        <Stethoscope size={14} className="text-primary" />
        <span className="text-sm font-semibold text-primary">AI 诊断</span>
        {status === 'done' && (
          <button
            type="button"
            onClick={run}
            className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground"
          >
            <RotateCcw size={10} />
            重新诊断
          </button>
        )}
      </div>

      {status === 'idle' && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground/70 leading-relaxed mb-2">
            让 AI 阅读这条错误，给出一句话解释和可执行的解决步骤。
          </p>
          <Button variant="default" size="xs" onClick={run} className="gap-1.5">
            <Stethoscope size={11} />
            开始诊断
          </Button>
        </div>
      )}

      {status === 'loading' && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-primary">
          <Loader2 size={13} className="animate-spin" />
          <span>AI 诊断中…</span>
        </div>
      )}

      {status === 'done' && result && (
        <div className="mt-2.5 space-y-2">
          <div className="flex items-start gap-1.5 text-[13px]">
            <CheckCircle size={13} className="text-primary mt-0.5 flex-shrink-0" />
            <span className="font-medium text-foreground">{result.summary}</span>
          </div>
          {result.explanation && (
            <p className="text-xs text-muted-foreground leading-[1.7]">
              {result.explanation}
            </p>
          )}
          {result.steps && result.steps.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {result.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md px-2.5 py-1.5"
                  style={{ background: 'color-mix(in srgb, var(--color-primary, currentColor) 4%, transparent)' }}
                >
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-primary-foreground bg-primary flex-shrink-0 mt-px">
                    {i + 1}
                  </span>
                  <span className="text-[12px] leading-snug text-foreground/85">{step.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hard-coded mock diagnoses keyed by status / code. Mirrors what ErrorDiagnosisService would return.
function buildMockDiagnosis(detail: MessageErrorDetail): MessageErrorDiagnosis {
  const code = detail.statusCode ?? (detail.code && /^\d+$/.test(detail.code) ? parseInt(detail.code, 10) : 0);
  if (code === 429 || detail.code === 'rate_limit') {
    return {
      summary: '触发了服务商的限流策略，短时间内请求过多。',
      explanation: '上游 API 在最近一分钟内已达到调用上限。建议等待限流窗口结束或切换到其他 Key/服务商。',
      steps: [
        { text: '等待 30-60 秒后再次尝试该请求。' },
        { text: '在「设置 → 服务商」检查当前账号的速率限额（RPM/TPM）。' },
        { text: '如经常触发，可考虑申请提高额度或新增备用服务商以负载均衡。' },
      ],
    };
  }
  if (code === 401 || detail.code === 'auth_failed') {
    return {
      summary: 'API Key 无效或已过期，服务商拒绝了请求。',
      explanation: '可能原因：Key 已被撤销、复制时缺字符、绑定的组织/项目错误，或账号余额不足。',
      steps: [
        { text: '在「设置 → 服务商」打开当前服务商，确认 API Key 完整且未过期。' },
        { text: '到服务商控制台查看余额与账号状态。' },
        { text: '重新粘贴 Key 后，使用「测试连接」验证。' },
      ],
    };
  }
  if (code === 404) {
    return {
      summary: '找不到目标模型或端点。',
      explanation: '模型可能已被服务商下线，或当前账号没有该模型的访问权限。',
      steps: [
        { text: '在模型选择器中切换为可用的模型重试。' },
        { text: '到服务商控制台确认账号是否已获得该模型的访问权限。' },
      ],
    };
  }
  if (code >= 500 && code < 600) {
    return {
      summary: '上游服务出现内部错误，与你的配置无关。',
      explanation: '通常等待几分钟后会自动恢复，或切换备用服务商。',
      steps: [
        { text: '稍后再次重试请求。' },
        { text: '查看服务商的状态页或公告，确认是否有正在进行的故障。' },
        { text: '临时切换到备用服务商以恢复使用。' },
      ],
    };
  }
  return {
    summary: '请求未能成功完成。',
    explanation: '请根据下方的请求/响应内容定位问题，或联系服务商支持。',
    steps: [
      { text: '检查网络与代理设置。' },
      { text: '复制错误详情，提交到服务商或工单系统进一步排查。' },
    ],
  };
}
