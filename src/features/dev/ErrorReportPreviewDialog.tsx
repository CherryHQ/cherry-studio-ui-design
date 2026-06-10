import { useState } from 'react';
import { Check, ClipboardCopy, Loader2, Send, ShieldOff, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@cherry-studio/ui';
import {
  submitErrorReport, shortRefId, type ErrorReportPayload,
} from '@/app/lib/errorReport';

interface Props {
  payload: ErrorReportPayload | null;
  onClose: () => void;
}

/**
 * Preview-before-send 弹窗，对应 cherry-studio#15668 spec：
 *   - 字段表清晰展示 *会被上报* 的内容
 *   - "excluded" 区显式声明 *不会被上报* 的字段（凭据 / 对话内容）
 *   - 底部「复制 payload」/「取消」/「发送」
 *   - 发送 loading → 成功 ref ID toast / 失败 error toast 含「重试」「复制」
 */
export function ErrorReportPreviewDialog({ payload, onClose }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const handleCopy = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success('已复制 payload 到剪贴板');
    } catch {
      toast.error('复制失败', { description: '请手动选中文本' });
    }
  };

  const handleSubmit = async () => {
    if (!payload) return;
    setSubmitting(true);
    const result = await submitErrorReport(payload);
    setSubmitting(false);
    if (result.ok && result.refId) {
      const refId = result.refId;
      const short = shortRefId(refId);
      toast.success(`已上报 · ${short}`, {
        description: '团队会按这个 ID 定位问题',
        duration: 8000,
        action: {
          label: '复制 ID',
          onClick: () => {
            navigator.clipboard.writeText(refId).catch(() => {});
            toast.success('已复制完整 ID', { description: refId });
          },
        },
      });
      onClose();
    } else {
      toast.error('上报未发送出去', {
        description: result.error ?? '网络异常',
        duration: 8000,
        action: {
          label: '重试',
          onClick: () => handleSubmit(),
        },
      });
    }
  };

  return (
    <Dialog open={!!payload} onOpenChange={(open) => { if (!open && !submitting) onClose(); }}>
      {/* Dialog 默认 sm:max-w-lg 比这里 dense payload 表偏窄；扩大需要
          @cherrystudio/ui Dialog 加 size 属性（spec §4 + §9：跨文件
          清理另开 PR），暂时用 !max-w 局部覆盖。 */}
      <DialogContent showCloseButton={false} className="!p-0 !gap-0 overflow-hidden sm:!max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>预览要上报的错误信息</DialogTitle>
        </DialogHeader>

        {payload && (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-3 border-b border-border">
              <div className="size-10 rounded-xl flex items-center justify-center bg-warning-muted shrink-0">
                <Send size={16} className="text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">上报这次错误？</div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  下面是要发送给 Cherry 团队的全部内容。凭据和对话内容已自动剔除。
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="关闭"
                disabled={submitting}
                className="shrink-0"
              >
                <X />
              </Button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto scrollbar-thin space-y-5">
              {/* 会发送的字段 */}
              <section>
                <div className="flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Check size={11} className="text-success" />
                  会发送
                </div>
                <FieldTable rows={[
                  ['category',   payload.category],
                  ['app_version', payload.appVersion],
                  ['platform',   payload.platform],
                  ['module',     payload.module],
                ]} />
                <div className="mt-3 space-y-2">
                  <FieldBlock label="message" body={payload.message} />
                  <FieldBlock label="stack" body={payload.stack} />
                  <FieldBlock
                    label={`recent_logs (${payload.recentLogs.length})`}
                    body={payload.recentLogs.join('\n')}
                  />
                </div>
              </section>

              {/* 显式排除字段 */}
              <section>
                <div className="flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <ShieldOff size={11} className="text-destructive" />
                  不会发送
                </div>
                <div className="rounded-lg border border-border bg-muted px-3.5 py-2.5 space-y-1">
                  {[
                    ['api_key',              payload.excluded.apiKey],
                    ['bearer_tokens',        payload.excluded.bearerTokens],
                    ['conversation_content', payload.excluded.conversationContent],
                  ].map(([key, val]) => (
                    <div key={key} className="flex items-baseline gap-3 text-xs">
                      <span className="text-muted-foreground font-mono w-44 shrink-0">{key}</span>
                      <code className="text-muted-foreground font-mono">{val}</code>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer —— 这里只在小助理也没解决、用户主动选"上报到团队"时出现，
                所以 send 是 primary，不再和"让小助理"并列。 */}
            <DialogFooter className="px-5 py-3 border-t border-border bg-muted">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={submitting}
                className="gap-1.5 mr-auto"
              >
                <ClipboardCopy size={12} />
                复制
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-1.5"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Send />}
                {submitting ? '发送中…' : '上报'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FieldTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="rounded-lg border border-border bg-muted px-3.5 py-2.5 space-y-1">
      {rows.map(([key, val]) => (
        <div key={key} className="flex items-baseline gap-3 text-xs">
          <span className="text-muted-foreground font-mono w-44 shrink-0">{key}</span>
          <code className="text-foreground font-mono break-all">{val}</code>
        </div>
      ))}
    </div>
  );
}

function FieldBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground font-mono mb-1">{label}</div>
      <pre className="rounded-lg border border-border bg-muted px-3.5 py-2.5 text-xs text-foreground font-mono whitespace-pre-wrap break-words leading-relaxed">
{body}
      </pre>
    </div>
  );
}
