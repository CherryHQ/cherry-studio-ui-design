import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Check, Send, X } from 'lucide-react';
import {
  Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@cherry-studio/ui';
import type { ErrorReportPayload } from '@/app/lib/errorReport';
import type { ErrorCategory } from '@/app/lib/errorClassifier';

interface Props {
  payload: ErrorReportPayload | null;
  onClose: () => void;
  /** "继续上报到团队"—— caller 把 payload 重新打开 ErrorReportPreviewDialog */
  onEscalateToReport: (payload: ErrorReportPayload) => void;
}

/**
 * 樱桃小助理（Cherry Assistant）诊断弹窗。
 *
 * 点上报前先经小助理过一遍：用户得到即时分析 + 自助路径建议；
 * 没解决再走"上报到团队"路径，团队收到的就是更高信号噪声比的报告。
 *
 * 原型阶段：mock 流式输出。生产侧会把 payload 灌进一个真实 chat
 * session，让 AI 调 docs/RAG/历史 issue 做诊断。
 */
export function CherryAssistantDiagnosticDialog({ payload, onClose, onEscalateToReport }: Props) {
  return (
    <Dialog
      open={!!payload}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <DialogContent showCloseButton={false} className="!p-0 !gap-0 overflow-hidden sm:!max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>樱桃小助理诊断</DialogTitle>
        </DialogHeader>
        {payload && (
          <DiagnoseBody
            payload={payload}
            onClose={onClose}
            onEscalateToReport={onEscalateToReport}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Body
// ============================================================

function DiagnoseBody({ payload, onClose, onEscalateToReport }: {
  payload: ErrorReportPayload;
  onClose: () => void;
  onEscalateToReport: (payload: ErrorReportPayload) => void;
}) {
  const script = useMemo(() => SCRIPTS[payload.category] ?? SCRIPTS.unknown, [payload.category]);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phaseIdx >= script.length) { setDone(true); return; }
    const t = setTimeout(() => setPhaseIdx(i => i + 1), 700 + Math.random() * 300);
    return () => clearTimeout(t);
  }, [phaseIdx, script.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [phaseIdx]);

  return (
    <>
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3 border-b border-border">
        <div className="size-10 rounded-xl flex items-center justify-center text-xl bg-cherry-active-bg shrink-0">
          🍒
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">樱桃小助理</div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            我先看一下这个错误——大多数情况能直接自助修。
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="关闭"
          className="shrink-0"
        >
          <X />
        </Button>
      </div>

      {/* Body —— mock streaming */}
      <div ref={scrollRef} className="px-5 py-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
        <UserBubble payload={payload} />

        <div className="space-y-3 mt-4">
          {script.slice(0, phaseIdx).map((phase, i) => (
            <AssistantPhase key={i} phase={phase} />
          ))}
          {phaseIdx < script.length && <Typing />}
        </div>

        {done && (
          <div className="mt-4 rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground leading-relaxed">
            如果上面几条都试过没解决，把这次诊断结果连同 payload 一起上报到团队——
            <span className="text-foreground">会附带本次对话上下文</span>，团队能接着排查。
          </div>
        )}
      </div>

      {/* Footer */}
      <DialogFooter className="px-5 py-3 border-t border-border bg-muted">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={!done} className="mr-auto">
          <Check className="text-success" />
          这帮到我了，关掉
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEscalateToReport(payload)}
          disabled={!done}
          className="gap-1.5"
        >
          <Send />
          没解决，继续上报到团队
        </Button>
      </DialogFooter>
    </>
  );
}

// ============================================================
// Bubbles
// ============================================================

function UserBubble({ payload }: { payload: ErrorReportPayload }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3.5 py-2.5 text-sm leading-relaxed">
        <div className="font-medium mb-1">遇到 {payload.category} 错误</div>
        <code className="block text-xs font-mono text-primary-foreground/80 break-all">
          {payload.title}
        </code>
        <div className="text-xs text-primary-foreground/60 mt-1">
          module: {payload.module} · {payload.appVersion}
        </div>
      </div>
    </div>
  );
}

interface Phase { kind: 'text' | 'list'; text?: string; items?: string[] }

function AssistantPhase({ phase }: { phase: Phase }) {
  return (
    <div className="flex gap-2.5">
      <div className="size-7 rounded-lg bg-cherry-active-bg flex items-center justify-center text-base shrink-0">🍒</div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-accent text-foreground px-3.5 py-2.5 text-sm leading-relaxed">
        {phase.kind === 'text' && <div className="whitespace-pre-wrap">{phase.text}</div>}
        {phase.kind === 'list' && (
          <ol className="list-decimal pl-4 space-y-1.5">
            {phase.items?.map((it, i) => <li key={i}>{it}</li>)}
          </ol>
        )}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex gap-2.5">
      <div className="size-7 rounded-lg bg-cherry-active-bg flex items-center justify-center text-base shrink-0">🍒</div>
      <div className="flex items-center gap-1 px-3.5 py-3 rounded-2xl bg-accent">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Mock 诊断脚本 —— 按 ErrorCategory 给一段"小助理思考过程 + 建议"
// ============================================================

const SCRIPTS: Record<ErrorCategory, Phase[]> = {
  auth: [
    { kind: 'text', text: '我看到这是 Anthropic 的 401，结合 module=chat-send，最可能是 API Key 出了问题。' },
    { kind: 'list', items: [
      '打开 设置 → Anthropic，检查 API Key 是不是空的',
      '如果填了，试试在 console.anthropic.com 里重新生成一个',
      '确认账户没被 ban / 没欠费（quota 用尽也可能返回 401）',
    ] },
    { kind: 'text', text: '如果上面三步都试了还不行，再上报，我把这段诊断也一起发给团队。' },
  ],
  quota: [
    { kind: 'text', text: 'OpenAI 返回 rate_limit_exceeded——是配额到顶或被临时限速了。' },
    { kind: 'list', items: [
      '看看 platform.openai.com/usage 当月用量是不是超了',
      '如果是免费 tier，单分钟 RPM 上限很低，等几秒再发即可',
      '想避开 rate limit 可以临时切到本地模型（Ollama）继续聊',
    ] },
  ],
  network: [
    { kind: 'text', text: '本地网络断了 / 目标 API 暂时打不到。' },
    { kind: 'list', items: [
      '看一下 WiFi 是否还在，或切换网络试试',
      '检查代理设置（如果用了代理）',
      'curl 测一下 api.anthropic.com 能不能通',
    ] },
    { kind: 'text', text: '这类问题 95% 都是临时的，retry 就好。' },
  ],
  proxy: [
    { kind: 'text', text: '代理连接被拒——可能是代理客户端没启动 / 端口错了。' },
    { kind: 'list', items: [
      '确认代理客户端（Clash / Surge / ...）是否运行',
      '127.0.0.1:7890 是默认端口，但有的客户端用 7891 或 1087',
      '设置 → 网络 → 代理 里填对应的 host:port',
    ] },
  ],
  context_length: [
    { kind: 'text', text: '对话太长，超过模型上下文窗口了。' },
    { kind: 'list', items: [
      '用 /clear 清掉历史（小助理建议保留最近 3-5 轮）',
      '或者换上下文更大的模型——claude-3-5-sonnet 是 200k',
      '系统提示太长？精简或拆分多个助手会更省 token',
    ] },
  ],
  model: [
    { kind: 'text', text: '这个模型 ID 不存在——通常是被官方下线或者拼错了。' },
    { kind: 'list', items: [
      '到 设置 → 模型 里更新模型列表',
      '换一个同 provider 的相近模型（claude-3-5 → claude-3-7）',
      '如果用的是自部署模型，确认部署还活着',
    ] },
  ],
  mcp: [
    { kind: 'text', text: 'MCP 服务无响应——上游进程可能挂了。' },
    { kind: 'list', items: [
      '到 设置 → MCP 看看这个 server 的健康指示灯',
      '重启 MCP server（点列表上的"重启"按钮）',
      '看 ~/.cherry/logs/mcp-<name>.log 找具体原因',
    ] },
  ],
  deprecated: [
    { kind: 'text', text: '这个模型已经被官方弃用，不会再有更新了。' },
    { kind: 'list', items: [
      '查官方 deprecation 通告，看推荐的替换模型',
      '在 设置 → 模型 里换成新版本',
    ] },
  ],
  payload: [
    { kind: 'text', text: '请求体超过了上游限制（一般是 50MB / 100MB）。' },
    { kind: 'list', items: [
      '附件太大？压缩或拆开发',
      '图片可以降低分辨率（多数模型不需要 4K）',
      '一次消息别贴整本 PDF——用知识库索引',
    ] },
  ],
  parse: [
    { kind: 'text', text: '响应解析失败——上游返回的内容格式不对。' },
    { kind: 'list', items: [
      '这通常是 provider 的临时故障，retry 试试',
      '如果用了 streaming，临时切到非流式可能能绕开',
    ] },
  ],
  content: [
    { kind: 'text', text: '内容被 provider 的安全策略拦截了。' },
    { kind: 'list', items: [
      '看下消息内容是否包含敏感词',
      '换说法，更中性的表达',
      '如果是误判，可以切到 Anthropic / OpenAI 之外的 provider',
    ] },
  ],
  server: [
    { kind: 'text', text: '上游 5xx——provider 自己出问题了，跟你没关系。' },
    { kind: 'list', items: [
      '看一眼 status.anthropic.com / status.openai.com 等 status 页',
      '一般几分钟到半小时会恢复',
      '不想等可以暂时切到本地模型',
    ] },
  ],
  stream: [
    { kind: 'text', text: '流式响应中断——网络抖动或服务器主动断开。' },
    { kind: 'list', items: [
      '直接 retry，大概率能成',
      '老断的话切到非流式模式',
    ] },
  ],
  knowledge: [
    { kind: 'text', text: '知识库读取失败——索引或向量服务暂时不可用。' },
    { kind: 'list', items: [
      '到 设置 → 知识库 看看这个 KB 的索引状态',
      '可以暂时关掉知识库继续对话',
    ] },
  ],
  ocr: [
    { kind: 'text', text: 'OCR 识别失败——图片可能没文字 / 服务挂了。' },
    { kind: 'list', items: [
      '确认图片里有可识别文字（不是手写、不是模糊截图）',
      '换图片格式（PNG / JPG）',
    ] },
  ],
  unknown: [
    { kind: 'text', text: '这条错误暂时归不到已知类别——我先看下 message 和 stack 的关键线索。' },
    { kind: 'list', items: [
      '搜索 Cherry FAQ 看看其他用户有没有类似情况',
      '如果是新版本出现的，回滚到上一版试试',
      '直接上报给团队，我把全部上下文一起发',
    ] },
  ],
};
