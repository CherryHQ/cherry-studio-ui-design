import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  RotateCcw, AlertTriangle, Sparkles,
  LifeBuoy, MessageSquareWarning,
} from 'lucide-react';
import {
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Switch,
} from '@cherry-studio/ui';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import {
  errorFromException, registerToastHandlers, describeCategory,
} from '@/app/lib/typedToast';
import type { ErrorCategory } from '@/app/lib/errorClassifier';
import {
  buildPayload, setMockShouldFail, type ErrorReportPayload,
} from '@/app/lib/errorReport';
import { classifyError } from '@/app/lib/errorClassifier';
import { ErrorReportPreviewDialog } from './ErrorReportPreviewDialog';
import { CherryAssistantDiagnosticDialog } from './CherryAssistantDiagnosticDialog';

// ============================================================
// Demo page —— Cherry Studio Issues #15651 + #15668
// ============================================================
// 每行：分类标签 + 原始 error string + 触发新版/对比旧版按钮。
// 新版 toast 自动获得「主 action + 求助」两个按钮。求助直接打开
// Cherry 小助理 → 没解决时升级到 preview dialog → 发送 → ref ID toast。
// 顶部三个开关：retry 成败、上报成败、弹 error dialog（演示 dialog
// 也提供求助入口）。

interface Case {
  category: ErrorCategory;
  raw: string;
  originAction?: string;
  hint?: { provider?: string; model?: string; mcpName?: string };
}

const CASES: Case[] = [
  { category: 'auth',
    raw: 'AnthropicError: 401 invalid_api_key — API key sk-ant-xxxxxxxxxxxxxxxx missing or invalid.',
    originAction: 'chat-send' },
  { category: 'quota',
    raw: 'OpenAIError: 429 rate_limit_exceeded — You exceeded your current quota, please retry after 38 seconds.',
    originAction: 'chat-send' },
  { category: 'network',
    raw: 'TypeError: fetch failed (ECONNRESET) — disconnected from upstream.',
    originAction: 'chat-send' },
  { category: 'proxy',
    raw: 'Error: ECONNREFUSED 127.0.0.1:7890 — proxy unreachable.' },
  { category: 'context_length',
    raw: "BadRequestError: 400 — This model's maximum context length is 128000 tokens. Your messages resulted in too many tokens. Please reduce the length.",
    hint: { model: 'gpt-4o' } },
  { category: 'model',
    raw: 'NotFoundError: 404 — The model `claude-3-opus-old` does not exist.',
    hint: { model: 'claude-3-opus-old', provider: 'Anthropic' } },
  { category: 'mcp',
    raw: "MCPError: tool server 'lark-cli' not responding (timeout after 10s).",
    hint: { mcpName: 'lark-cli' } },
  { category: 'deprecated',
    raw: 'DeprecationWarning: model `gpt-4-vision-preview` has been deprecated and will be sunset on 2025-12-06.',
    hint: { model: 'gpt-4-vision-preview', provider: 'OpenAI' } },
  { category: 'stream',
    raw: 'StreamError: response stream aborted mid-chunk (incomplete response after 1.2s).',
    originAction: 'chat-send' },
  { category: 'server',
    raw: 'OpenAIError: 503 Service Unavailable — upstream timeout. The server is currently overloaded.',
    hint: { provider: 'OpenAI' } },
  { category: 'knowledge',
    raw: 'KnowledgeBaseError: vector store unavailable — retriever returned 0 hits for query.' },
  { category: 'ocr',
    raw: 'OCRError: image text recognition failed — no recognizable characters found in the supplied image.' },
  { category: 'payload',
    raw: 'PayloadTooLargeError: 413 Request entity too large (52 MB).' },
  { category: 'parse',
    raw: 'SyntaxError: Unexpected token < in JSON at position 0 — server returned malformed payload.' },
  { category: 'content',
    raw: "content_policy_violation: 'request was blocked by safety system'." },
  { category: 'unknown',
    raw: 'Error: something went wrong (no recognizable pattern). Authorization: Bearer abcdef1234567890abcdef1234567890' },
];

const CATEGORY_LABEL: Record<ErrorCategory, string> = {
  auth: '鉴权 auth', quota: '配额 quota', network: '网络 network', proxy: '代理 proxy',
  context_length: '上下文超长 context_length', model: '模型不可用 model',
  mcp: 'MCP 故障 mcp', deprecated: '模型弃用 deprecated',
  payload: '请求过大 payload', parse: '解析失败 parse', content: '内容拦截 content',
  server: '服务器错误 server', stream: '流中断 stream',
  knowledge: '知识库 knowledge', ocr: 'OCR ocr', unknown: '未知 unknown',
};

export function ErrorToastsPreview() {
  const { openSettings } = useGlobalActions();
  const [retryNextSucceeds, setRetryNextSucceeds] = useState(true);
  const [reportWillFail, setReportWillFail] = useState(false);
  const [reportPayload, setReportPayload] = useState<ErrorReportPayload | null>(null);
  const [assistantPayload, setAssistantPayload] = useState<ErrorReportPayload | null>(null);
  // dialog-error demo（spec 明确"dialog also offers Report"）
  const [errorDialogCase, setErrorDialogCase] = useState<Case | null>(null);

  // mock 服务端失败开关——挂到全局 errorReport store
  useEffect(() => { setMockShouldFail(reportWillFail); }, [reportWillFail]);

  const fakeAction = useMemo(() => () => {
    if (retryNextSucceeds) {
      toast.success('已重发请求', { description: '原型 mock：服务器这次返回了 200' });
    } else {
      errorFromException(new Error('fetch failed again — still offline'));
    }
  }, [retryNextSucceeds]);

  useEffect(() => {
    registerToastHandlers({
      // 真跳到 settings → 模型服务页。生产侧 #15646 落地后会换成
      // 内联 ProviderQuickConfigPopover，少一次页面跳转。
      openProviderConfig: (provider) => {
        openSettings('models');
        if (provider) {
          toast.info(`在模型服务里找「${provider}」配置 API Key`, { duration: 4000 });
        }
      },
      // billing 是外部 URL，原型不真跳
      openBilling: (provider) => {
        toast.message('（mock）跳转 billing', {
          description: `生产侧会打开 ${provider ?? '当前 provider'} 的 usage/billing 页`,
        });
      },
      retry: fakeAction,
      // 触发 /clear 需要动 chat 模块，spec §6 冻结
      trimHistory: () => {
        toast.message('（mock）打开 /clear 流程', {
          description: '原型阶段：chat 模块冻结，这里会接到 #15323 的 trim/auto-compact 弹窗',
        });
      },
      // 真跳到 settings → 模型服务页
      switchModel: (provider) => {
        openSettings('models');
        if (provider) {
          toast.info(`在「${provider}」下换一个仍在维护的模型`, { duration: 4000 });
        }
      },
      // 真跳到 settings → MCP 设置页
      viewMcp: (name) => {
        openSettings('mcp');
        if (name) {
          toast.info(`MCP 设置里找「${name}」服务`, { duration: 4000 });
        }
      },
      // 求助入口 → 默认进小助理，由小助理决定要不要升级到 preview
      openHelp: (payload) => { setAssistantPayload(payload); },
    });
  }, [fakeAction, openSettings]);

  const trigger = (c: Case) => {
    errorFromException(new Error(c.raw), {
      category: c.category,
      provider: c.hint?.provider,
      model: c.hint?.model,
      mcpName: c.hint?.mcpName,
      originAction: c.originAction,
    });
  };

  const triggerLegacy = (c: Case) => { toast.error(c.raw); };

  // 给"以 dialog 形式弹 error"按钮用：把第 1 个 case（auth）用 dialog 渲染
  const showAsDialog = () => { setErrorDialogCase(CASES[0]); };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <Header />

      {/* mock state toggles */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Switch checked={retryNextSucceeds} onCheckedChange={setRetryNextSucceeds} />
          <span className="text-xs text-foreground">下次「重试」</span>
          <span className={`text-xs ${retryNextSucceeds ? 'text-success' : 'text-destructive'}`}>
            {retryNextSucceeds ? '会成功' : '会再失败'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={reportWillFail} onCheckedChange={setReportWillFail} />
          <span className="text-xs text-foreground">下次「上报」</span>
          <span className={`text-xs ${reportWillFail ? 'text-destructive' : 'text-success'}`}>
            {reportWillFail ? '会失败' : '会成功'}
          </span>
        </div>
        <Button size="xs" variant="outline" onClick={showAsDialog} className="gap-1.5">
          <MessageSquareWarning size={11} />
          以 dialog 形式弹 auth 错误
        </Button>
      </div>

      {/* Case rows */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-2">
          {CASES.map(c => {
            const desc = describeCategory(c.category);
            return (
              <div
                key={c.category}
                className="grid grid-cols-[11.25rem_1fr_13.75rem] gap-3 items-stretch rounded-xl border border-border bg-card hover:bg-accent transition-colors overflow-hidden"
              >
                <div className="flex flex-col gap-1 px-4 py-3 border-r border-border">
                  <div className="flex items-center gap-1.5">
                    <desc.icon size={12} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{CATEGORY_LABEL[c.category]}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {desc.hasAction ? (
                      <div className="inline-flex items-center gap-1">
                        <Sparkles size={9} />
                        action：{desc.actionLabel}
                      </div>
                    ) : (
                      <div>无 action（按 spec）</div>
                    )}
                    <div className="inline-flex items-center gap-1">
                      <LifeBuoy size={9} />
                      求助：所有类目都有
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-4 py-3 min-w-0">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">原始 error.message</div>
                  <code className="text-xs text-foreground font-mono whitespace-pre-wrap break-words leading-relaxed">
                    {c.raw}
                  </code>
                </div>

                <div className="flex flex-col gap-1.5 px-4 py-3 border-l border-border bg-muted">
                  <Button size="xs" onClick={() => trigger(c)} className="gap-1.5 h-8">
                    <AlertTriangle size={11} />
                    触发新版 toast
                  </Button>
                  <Button
                    size="xs" variant="outline" onClick={() => triggerLegacy(c)}
                    className="gap-1.5 h-8 text-muted-foreground"
                  >
                    <RotateCcw size={11} />
                    对比旧版
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dialog-style error demo（spec：dialog 同样要提供求助入口） */}
      <Dialog open={!!errorDialogCase} onOpenChange={(open) => { if (!open) setErrorDialogCase(null); }}>
        <DialogContent showCloseButton={false} className="!p-0 !gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>错误</DialogTitle>
          </DialogHeader>
          {errorDialogCase && (
            <>
              <div className="flex items-start gap-3 px-5 pt-5 pb-3">
                <div className="size-10 rounded-xl bg-error-muted text-destructive flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">鉴权失败</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    无法以当前 Anthropic 凭据完成请求。
                  </p>
                  <pre className="mt-3 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
{errorDialogCase.raw}
                  </pre>
                </div>
              </div>
              <DialogFooter className="px-5 py-3 border-t border-border bg-muted">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const c = errorDialogCase;
                    const classified = classifyError(new Error(c.raw), {
                      category: c.category,
                      provider: c.hint?.provider,
                      originAction: c.originAction,
                    });
                    setAssistantPayload(buildPayload(classified, { module: c.originAction }));
                    setErrorDialogCase(null);
                  }}
                  className="gap-1.5 mr-auto"
                >
                  <LifeBuoy size={11} />
                  求助
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setErrorDialogCase(null)}>关闭</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    openSettings('models');
                    setErrorDialogCase(null);
                    toast.info('在模型服务里找「Anthropic」配置 API Key', { duration: 4000 });
                  }}
                >
                  去配置
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ErrorReportPreviewDialog
        payload={reportPayload}
        onClose={() => setReportPayload(null)}
      />

      <CherryAssistantDiagnosticDialog
        payload={assistantPayload}
        onClose={() => setAssistantPayload(null)}
        onEscalateToReport={(p) => { setAssistantPayload(null); setReportPayload(p); }}
      />
    </div>
  );
}

function Header() {
  return (
    <div className="px-6 pt-6 pb-4 shrink-0">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-warning" />
          <h1 className="text-base font-medium text-foreground">Typed Error Toasts + 一键上报 — 原型预览</h1>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          对应 <code className="font-mono">#15651</code>（分类 + inline action）+ <code className="font-mono">#15668</code>（一键求助）。
          每行触发"新版"会出 toast，含主 action（<span className="inline-flex items-center gap-0.5"><Sparkles size={9} />Sparkles</span> 标记的 8 类有）+ 求助按钮（<span className="inline-flex items-center gap-0.5"><LifeBuoy size={9} />LifeBuoy</span> 所有类目都有）。
          点求助 → 直接进 Cherry 小助理诊断；没解决再升级到 preview → 上报 → ref ID。
        </p>
      </div>
    </div>
  );
}
