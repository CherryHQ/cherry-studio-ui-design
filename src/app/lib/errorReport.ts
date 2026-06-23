// ============================================================
// Error Reporting
// ============================================================
// 对应 cherry-studio#15668：用户一键上报错误诊断 payload 到 Cherry
// 服务器，换一个 reference ID 用来贴 GitHub issue / 找运维。
//
// 原型阶段：mock 服务端，按开关决定 success/fail；redactor 是简单
// 的关键字替换示意；真正生产侧会用更严格的 payload schema +
// PII/credential scrubber。

import type { ClassifiedError } from './errorClassifier';

// ============================================================
// Payload schema
// ============================================================

export interface ErrorReportPayload {
  /** 内部用，归类 toast 类别 */
  category: ClassifiedError['category'];
  /** "auth" / "Network unreachable" 等 humanized title */
  title: string;
  /** redacted 后的 raw error.message */
  message: string;
  /** redacted 后的 stack（mock） */
  stack: string;
  /** Cherry app 版本 */
  appVersion: string;
  /** OS + arch */
  platform: string;
  /** 触发错误的模块 / 动作 */
  module: string;
  /** 最近的几条相关日志（redacted） */
  recentLogs: string[];
  /** spec 严格要求不含的字段，这里显式列出来空值——给 preview UI 展示
   *  "这些不会被发送" 用 */
  excluded: {
    apiKey: '<redacted: api_key>';
    bearerTokens: '<redacted: bearer_token>';
    conversationContent: '<redacted: message_content>';
  };
}

// ============================================================
// Redactor —— 简单关键字替换
// ============================================================

const REDACT_PATTERNS: Array<[RegExp, string]> = [
  // OpenAI / Anthropic / generic prefix-based keys
  [/sk-[A-Za-z0-9_-]{8,}/g, '<redacted: api_key>'],
  [/sk-ant-[A-Za-z0-9_-]{8,}/g, '<redacted: api_key>'],
  // Authorization: Bearer xxxxx
  [/Bearer\s+[A-Za-z0-9._-]{8,}/gi, 'Bearer <redacted: bearer_token>'],
  // Long base64-ish blobs (>= 24 chars)
  [/[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{8,}/g, '<redacted: token>'],
  // x-api-key: xxx
  [/(api[-_]?key["'\s:=]+)[A-Za-z0-9._-]{6,}/gi, '$1<redacted: api_key>'],
];

export function redact(input: string): string {
  if (!input) return input;
  let out = input;
  for (const [re, repl] of REDACT_PATTERNS) {
    out = out.replace(re, repl);
  }
  return out;
}

// ============================================================
// Payload builder
// ============================================================

const MOCK_RECENT_LOGS = [
  '[2026-06-10 12:34:21] INFO  chat-send: dispatching to provider=anthropic model=claude-3-5-sonnet',
  '[2026-06-10 12:34:21] DEBUG http-client: POST https://api.anthropic.com/v1/messages',
  '[2026-06-10 12:34:22] WARN  http-client: response status=401',
  '[2026-06-10 12:34:22] ERROR chat-send: provider returned auth error',
];

export function buildPayload(classified: ClassifiedError, ctx?: {
  module?: string;
  // 调用方如果有额外信息可以传——但凡涉及凭据的字段在 redact 阶段
  // 会被 scrub。
}): ErrorReportPayload {
  return {
    category: classified.category,
    title: classified.rawMessage.slice(0, 64),
    message: redact(classified.rawMessage),
    // 真实环境会从 Error.stack 取；mock 一段类似形态
    stack: redact(MOCK_STACK),
    appVersion: '2.2.0-beta.3',
    platform: 'macOS 15.5 (arm64)',
    module: ctx?.module
      ?? classified.meta.originAction
      ?? 'unknown',
    recentLogs: MOCK_RECENT_LOGS.map(redact),
    excluded: {
      apiKey: '<redacted: api_key>',
      bearerTokens: '<redacted: bearer_token>',
      conversationContent: '<redacted: message_content>',
    },
  };
}

const MOCK_STACK = `Error: 401 invalid_api_key — API key missing or invalid.
    at AnthropicClient.send (anthropic-client.ts:142:11)
    at ChatRouter.dispatch (chat-router.ts:88:23)
    at async ChatStore.sendMessage (chat-store.ts:301:15)
    at async ChatPage.onSubmit (ChatPage.tsx:412:7)`;

// ============================================================
// Mock submission
// ============================================================

export interface SubmitResult {
  ok: boolean;
  /** 成功时存在——Sentry event_id（32-char lowercase hex） */
  refId?: string;
  /** 失败时存在 */
  error?: string;
}

// Caller registers a mock failure switch (演示页用)
let mockShouldFail = false;
export function setMockShouldFail(v: boolean) { mockShouldFail = v; }

const HEX = '0123456789abcdef';
/**
 * 模拟 Sentry event_id：32-char lowercase hex。
 * 生产侧由 `Sentry.captureException()` 返回，前端拿到原样展示——
 * 主仓代码里 `{ code, stack }` 的日志写法就是为了让 Sentry 按 signature
 * 聚合，event_id 就是单次 capture 的标识。
 */
function makeRefId(): string {
  return Array.from({ length: 32 }, () =>
    HEX[Math.floor(Math.random() * 16)],
  ).join('');
}

/** 显示用——event_id 太长，约定取前 8 位短显示。完整在 copy 时给。 */
export function shortRefId(refId: string): string {
  return refId.slice(0, 8);
}

export function submitErrorReport(_payload: ErrorReportPayload): Promise<SubmitResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mockShouldFail) {
        resolve({ ok: false, error: 'POST /sentry/envelope → 503 Service Unavailable' });
      } else {
        resolve({ ok: true, refId: makeRefId() });
      }
    }, 380);
  });
}
