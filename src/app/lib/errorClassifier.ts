// ============================================================
// Error Classifier
// ============================================================
// 把任意 Error / 字符串 / object 映射到一个语义类别，并尽力从原始
// 文本里提取出 provider / model / wait_seconds / mcp_name 等可用作
// toast 文案与 inline action 的 metadata。
//
// 16 类与生产代码 errorClassifier.ts 对齐：auth / model / quota /
// context_length / payload / network / proxy / stream / content /
// server / deprecated / knowledge / ocr / mcp / parse / unknown。
//
// 原型阶段：实现为基于关键词的简单匹配。生产侧会替换为更鲁棒的
// pattern matching + provider SDK error code 映射。

export type ErrorCategory =
  | 'auth'
  | 'model'
  | 'quota'
  | 'context_length'
  | 'payload'
  | 'network'
  | 'proxy'
  | 'stream'
  | 'content'
  | 'server'
  | 'deprecated'
  | 'knowledge'
  | 'ocr'
  | 'mcp'
  | 'parse'
  | 'unknown';

export interface ClassifiedError {
  category: ErrorCategory;
  /** 从源 error 里抽出的字段，给 toast 文案与 action handler 用 */
  meta: {
    provider?: string;
    model?: string;
    /** quota 类——服务器返回的"等待秒数" */
    waitSeconds?: number;
    /** mcp 类——出问题的 MCP server 名 */
    mcpName?: string;
    /** context_length 类——模型上下文上限 */
    contextLimit?: number;
    /** 调用方上下文：触发这次错误的动作（chat-send / file-upload / tool-call ...） */
    originAction?: string;
  };
  /** 永远保留的原始 error 信息——toast 里折叠到 tooltip / 展开块。 */
  rawMessage: string;
}

/** Caller 可以传入 hint 强行覆盖分类（"我比 classifier 更了解上下文"）。 */
export interface ClassifyHint {
  category?: ErrorCategory;
  provider?: string;
  model?: string;
  mcpName?: string;
  originAction?: string;
}

const PROVIDER_KEYWORDS: Array<[string, string]> = [
  ['anthropic', 'Anthropic'],
  ['claude', 'Anthropic'],
  ['openai', 'OpenAI'],
  ['gpt', 'OpenAI'],
  ['gemini', 'Google'],
  ['google', 'Google'],
  ['deepseek', 'DeepSeek'],
  ['qwen', '阿里通义'],
  ['zhipu', '智谱'],
  ['glm', '智谱'],
  ['mistral', 'Mistral'],
  ['groq', 'Groq'],
  ['ollama', 'Ollama'],
];

function extractRaw(input: unknown): string {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  if (input instanceof Error) return input.message || input.name || '';
  try { return JSON.stringify(input); } catch { return String(input); }
}

function lower(s: string): string { return s.toLowerCase(); }

function pickProvider(raw: string, hint?: ClassifyHint): string | undefined {
  if (hint?.provider) return hint.provider;
  const lo = lower(raw);
  for (const [kw, label] of PROVIDER_KEYWORDS) {
    if (lo.includes(kw)) return label;
  }
  return undefined;
}

function pickModel(raw: string, hint?: ClassifyHint): string | undefined {
  if (hint?.model) return hint.model;
  // 抓 "model 'xxx'" / "gpt-4o" / "claude-3-5-sonnet" 这类典型形态
  const quoted = raw.match(/model[s]?\s*['"`]([^'"`]+)['"`]/i);
  if (quoted) return quoted[1];
  const bareModel = raw.match(/\b(gpt-[\w.-]+|claude-[\w.-]+|gemini-[\w.-]+|deepseek-[\w.-]+|qwen[\w.-]*|glm-[\w.-]+)\b/i);
  return bareModel?.[1];
}

function pickWaitSeconds(raw: string): number | undefined {
  const m = raw.match(/(?:retry|wait|try again)[^0-9]*(\d+)\s*(s|sec|second)/i)
    || raw.match(/in\s+(\d+)\s*(s|sec|second)/i);
  if (m) return Number(m[1]);
  return undefined;
}

function pickMcpName(raw: string, hint?: ClassifyHint): string | undefined {
  if (hint?.mcpName) return hint.mcpName;
  const m = raw.match(/mcp[^A-Za-z0-9_-]*server[^A-Za-z0-9_-]*['"`]([^'"`]+)['"`]/i)
    || raw.match(/['"`]([\w-]+)['"`]\s*mcp/i);
  return m?.[1];
}

function pickContextLimit(raw: string): number | undefined {
  const m = raw.match(/(\d{4,7})\s*(?:tokens|token)/i);
  return m ? Number(m[1]) : undefined;
}

function autoCategory(raw: string): ErrorCategory {
  const lo = lower(raw);
  // 顺序敏感：auth/quota 在 network 之前测试，否则 "401 unauthorized" 会被通用关键词截胡。
  if (/(401|unauthor|invalid[_ ]api[_ ]?key|missing api key|no api key|forbidden|api key not)/i.test(raw)) return 'auth';
  if (/(429|rate[_ ]?limit|quota|billing|insufficient[_ ]?quota|exceeded your current)/i.test(raw)) return 'quota';
  if (/(context[_ ]length|maximum context|token[s]? limit|too many tokens|reduce the length|max tokens)/i.test(raw)) return 'context_length';
  if (/(deprecat|sunset|no longer (?:available|supported))/i.test(raw)) return 'deprecated';
  if (/(model[_ ]not[_ ]found|model.*does not exist|404.*model|unknown model)/i.test(raw)) return 'model';
  if (/(mcp|tool server|mcp server)/i.test(raw)) return 'mcp';
  if (/(knowledge[_ ]?base|kb (?:not|unavailable)|vector store|retriev)/i.test(raw)) return 'knowledge';
  if (/(ocr|recogniz|image text)/i.test(raw)) return 'ocr';
  if (/(content[_ ]?policy|moderation|safety|disallowed|blocked by)/i.test(raw)) return 'content';
  if (/(proxy|tunnel|ECONNREFUSED.*proxy|7890)/i.test(raw)) return 'proxy';
  if (/(network|fetch failed|ECONN|ENOTFOUND|EAI_AGAIN|offline|disconnected|timeout)/i.test(raw)) return 'network';
  if (/(stream|chunk|incomplete response|aborted)/i.test(raw)) return 'stream';
  if (/(payload|too large|request entity|413)/i.test(raw)) return 'payload';
  if (/(parse|JSON|SyntaxError|malformed)/i.test(raw)) return 'parse';
  if (/(500|502|503|504|internal server|bad gateway|unavailable|upstream)/i.test(raw)) return 'server';
  return 'unknown';
}

export function classifyError(input: unknown, hint?: ClassifyHint): ClassifiedError {
  const raw = extractRaw(input);
  const category = hint?.category ?? autoCategory(raw);
  return {
    category,
    rawMessage: raw,
    meta: {
      provider:     pickProvider(raw, hint),
      model:        pickModel(raw, hint),
      waitSeconds:  pickWaitSeconds(raw),
      mcpName:      pickMcpName(raw, hint),
      contextLimit: pickContextLimit(raw),
      originAction: hint?.originAction,
    },
  };
}

// 给 typedToast 用：哪些类别 *默认* 带 inline action 按钮。
// payload / parse / content / unknown：spec 明确不带按钮。
// stream / server / deprecated / knowledge / ocr：默认无按钮（可由调用方覆盖）。
export const CATEGORIES_WITH_ACTION = new Set<ErrorCategory>([
  'auth', 'quota', 'network', 'proxy', 'context_length', 'model', 'mcp',
]);
