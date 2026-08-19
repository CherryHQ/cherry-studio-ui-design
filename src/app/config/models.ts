// ===========================
// Unified Model Configuration
// ===========================
// Central model registry used by both Agent and Assistant pages.

import type { ModelInfo, ModelCapability } from '../types/chat';
import { GO_PROMO_TEXT } from './goPlan';

// Re-export for convenience
export type { ModelInfo, ModelCapability };
export { MODEL_CAPABILITY_LABELS } from '../types/chat';

// ===========================
// Provider Colors
// ===========================

export const PROVIDER_COLORS: Record<string, string> = {
  CherryAI: 'bg-cherry-primary',
  'CherryAI Go': 'bg-cherry-primary',
  Anthropic: 'bg-orange-500',
  Google: 'bg-blue-500',
  OpenAI: 'bg-emerald-600',
  Alibaba: 'bg-violet-500',
  DeepSeek: 'bg-cyan-500',
  Meta: 'bg-blue-600',
  Mistral: 'bg-amber-500',
};

// ===========================
// Agent Models (short display names)
// ===========================

// 每条都带 modelId / 上下文窗口 / 最大输出 / 思维链档位 —— 模型选择器里 hover
// 出的模型卡读这些字段，缺省的模型不出卡。
export const AGENT_MODELS: ModelInfo[] = [
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', provider: 'Anthropic', capabilities: ['vision', 'reasoning', 'tools'], modelId: 'claude-sonnet-4-20250514', contextWindow: 200_000, maxOutput: 64_000, thinkingLevels: '低, 中, 高' },
  { id: 'claude-4-opus', name: 'Claude 4 Opus', provider: 'Anthropic', capabilities: ['vision', 'reasoning', 'tools'], modelId: 'claude-opus-4-20250514', contextWindow: 200_000, maxOutput: 32_000, thinkingLevels: '低, 中, 高' },
  { id: 'claude-4-haiku', name: 'Claude 4 Haiku', provider: 'Anthropic', capabilities: ['vision', 'tools'], modelId: 'claude-haiku-4-20250514', contextWindow: 200_000, maxOutput: 8_192 },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', capabilities: ['vision', 'reasoning', 'tools', 'web'], modelId: 'gpt-4.1', contextWindow: 1_047_576, maxOutput: 32_768, thinkingLevels: '低, 中, 高' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI', capabilities: ['vision', 'tools', 'web'], modelId: 'gpt-4.1-mini', contextWindow: 1_047_576, maxOutput: 32_768 },
  { id: 'o3', name: 'o3', provider: 'OpenAI', capabilities: ['vision', 'reasoning', 'tools'], modelId: 'o3', contextWindow: 200_000, maxOutput: 100_000, thinkingLevels: '低, 中, 高' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools'], modelId: 'gemini-2.5-pro', contextWindow: 1_048_576, maxOutput: 65_536, thinkingLevels: '低, 中, 高' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools'], modelId: 'gemini-2.5-flash', contextWindow: 1_048_576, maxOutput: 65_536, thinkingLevels: '低, 中, 高' },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools', 'web'], modelId: 'gemini-3-pro-preview', contextWindow: 1_048_576, maxOutput: 65_536, thinkingLevels: '低, 中, 高' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', capabilities: ['reasoning'], modelId: 'deepseek-reasoner', contextWindow: 131_072, maxOutput: 32_768, thinkingLevels: '沉思, 极致' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', capabilities: ['tools', 'web'], modelId: 'deepseek-chat', contextWindow: 131_072, maxOutput: 8_192 },
  { id: 'qwen3-235b', name: 'Qwen3 235B', provider: 'Alibaba', capabilities: ['vision', 'reasoning', 'tools'], modelId: 'qwen3-235b-a22b', contextWindow: 131_072, maxOutput: 16_384, thinkingLevels: '低, 中, 高' },
  { id: 'qwen3-32b', name: 'Qwen3 32B', provider: 'Alibaba', capabilities: ['reasoning', 'tools'], modelId: 'qwen3-32b', contextWindow: 131_072, maxOutput: 16_384, thinkingLevels: '低, 中, 高' },
];

// ===========================
// CherryAI 免费模型（内测）
// ===========================
// 首批免费额度是邀请制内测，所以这个模型只对内测白名单账号出现，未登录和普通
// 登录用户在模型选择器里看不到 CherryAI 这一组（见 useAgentModels）。额度用完
// 时礼物标识变灰、选中时提示，模型本身不消失。
//
// CherryAI 不是模型服务商，设置 → 模型服务里**不**登记这一条。

export const CHERRY_AI_FREE_MODEL: ModelInfo = {
  id: 'cherryai-deepseek-v4-flash',
  name: 'DeepSeek V4 Flash',
  provider: 'CherryAI',
  capabilities: ['reasoning', 'tools', 'free'],
  // CherryAI 是托管方，模型本身是 DeepSeek —— 图标跟模型走，用 DeepSeek 蓝鲸。
  logoId: 'deepseek',
  modelId: 'deepseek-v4-flash',
  contextWindow: 1_048_576,
  maxOutput: 393_216,
  thinkingLevels: '沉思, 极致',
  // 免费额度只覆盖工作模块，助手对话里选不到这个模型 —— hover 模型卡上说清楚，
  // 免得用户以为全局免费。
  note: '限时免费，仅限于工作模块内使用',
};

// ===========================
// CherryAI Go（订阅）
// ===========================
// Go 是 $10/月 的订阅：旗舰**开源**模型畅享（Kimi / DeepSeek / Qwen / GLM /
// MiniMax），消耗按积分计。列表分组名固定 "CherryAI Go"，与 CherryAI（免费内测）
// 是两个组，参考 opencode 的做法。
//
// 未订阅时这些模型名**不展示**：组里只有一行「旗舰开源模型 · 订阅」引导
// （见 CHERRY_GO_CTA_MODEL），点击跳网页端订阅。
// 和 CherryAI 一样，Go 不是模型服务商，设置 → 模型服务里不登记。

export const CHERRY_GO_PROVIDER = 'CherryAI Go';

/** Go 模型统一的说明行 —— hover 模型卡里讲清计费口径 */
const GO_MODEL_NOTE = 'Cherry Go 订阅内，消耗按积分计入用量';

export const CHERRY_GO_MODELS: ModelInfo[] = [
  { id: 'cherry-go-kimi-k25', name: 'Kimi K2.5', provider: CHERRY_GO_PROVIDER, capabilities: ['vision', 'reasoning', 'tools'], logoId: 'kimi', modelId: 'kimi-k2.5', contextWindow: 262_144, maxOutput: 32_768, thinkingLevels: '低, 中, 高', note: GO_MODEL_NOTE },
  { id: 'cherry-go-deepseek-v4', name: 'DeepSeek V4', provider: CHERRY_GO_PROVIDER, capabilities: ['reasoning', 'tools'], logoId: 'deepseek', modelId: 'deepseek-v4', contextWindow: 1_048_576, maxOutput: 131_072, thinkingLevels: '沉思, 极致', note: GO_MODEL_NOTE },
  { id: 'cherry-go-qwen3-coder', name: 'Qwen3 Coder Max', provider: CHERRY_GO_PROVIDER, capabilities: ['reasoning', 'tools'], logoId: 'qwen', modelId: 'qwen3-coder-max', contextWindow: 262_144, maxOutput: 65_536, thinkingLevels: '低, 中, 高', note: GO_MODEL_NOTE },
  { id: 'cherry-go-glm-5', name: 'GLM-5', provider: CHERRY_GO_PROVIDER, capabilities: ['vision', 'reasoning', 'tools'], logoId: 'zhipu', modelId: 'glm-5', contextWindow: 204_800, maxOutput: 32_768, thinkingLevels: '低, 中, 高', note: GO_MODEL_NOTE },
  { id: 'cherry-go-minimax-m25', name: 'MiniMax M2.5', provider: CHERRY_GO_PROVIDER, capabilities: ['tools', 'web'], logoId: 'minimax', modelId: 'minimax-m2.5', contextWindow: 204_800, maxOutput: 16_384, note: GO_MODEL_NOTE },
];

/**
 * 未订阅时占据 Go 组的那一行 —— 不是真模型，样式弱化（锁图标 + 右侧「订阅」），
 * 点击行为由 ModelPickerPanel 的 onCtaClick 接管（跳网页端），不会进入选中态。
 */
export const CHERRY_GO_CTA_MODEL: ModelInfo = {
  id: 'cherry-go-subscribe',
  name: GO_PROMO_TEXT,
  provider: CHERRY_GO_PROVIDER,
  capabilities: [],
  // 品牌位用 Cherry Studio 红色 logo —— 这一行是引导用户点的，不做弱化处理
  logoId: 'cherryai',
  cta: { actionLabel: '订阅' },
};

// ===========================
// Assistant Models (vendor/model format)
// ===========================

export const ASSISTANT_MODELS: ModelInfo[] = [
  { id: 'claude-4-opus', name: 'anthropic/claude-4-opus', provider: 'Anthropic', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Closed-source Models' },
  { id: 'claude-4-opus-46', name: 'anthropic/claude-4-opus-4.6', provider: 'Anthropic', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Closed-source Models' },
  { id: 'claude-4-sonnet', name: 'anthropic/claude-4-sonnet-4.5', provider: 'Anthropic', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Closed-source Models' },
  { id: 'gemini-25-flash', name: 'google/gemini-2.5-flash', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Closed-source Models' },
  { id: 'gemini-25-flash-image', name: 'google/gemini-2.5-flash-image', provider: 'Google', capabilities: ['vision', 'web'], group: 'Express Closed-source Models' },
  { id: 'gemini-25-pro', name: 'google/gemini-2.5-pro', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Closed-source Models' },
  { id: 'gemini-3-flash-preview', name: 'google/gemini-3-flash-preview', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools', 'web'], group: 'Express Closed-source Models' },
  { id: 'gemini-3-pro-image', name: 'google/gemini-3-pro-image-preview', provider: 'Google', capabilities: ['vision', 'web', 'tools'], group: 'Express Closed-source Models' },
  { id: 'gemini-3-pro-preview', name: 'google/gemini-3-pro-preview', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools', 'web'], group: 'Express Closed-source Models' },
  { id: 'gemini-31-pro-preview', name: 'google/gemini-3.1-pro-preview', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools', 'web'], group: 'Express Closed-source Models' },
  { id: 'gpt-41', name: 'openai/gpt-4.1', provider: 'OpenAI', capabilities: ['vision', 'reasoning', 'tools', 'web'], group: 'Express Closed-source Models' },
  { id: 'gpt-41-mini', name: 'openai/gpt-4.1-mini', provider: 'OpenAI', capabilities: ['vision', 'tools', 'web'], group: 'Express Closed-source Models' },
  { id: 'gpt-41-nano', name: 'openai/gpt-4.1-nano', provider: 'OpenAI', capabilities: ['tools'], group: 'Express Closed-source Models' },
  { id: 'o3', name: 'openai/o3', provider: 'OpenAI', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Closed-source Models' },
  { id: 'o4-mini', name: 'openai/o4-mini', provider: 'OpenAI', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Closed-source Models' },
  { id: 'qwen3-235b', name: 'alibaba/qwen3-235b', provider: 'Alibaba', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Open-source Models' },
  { id: 'qwen3-32b', name: 'alibaba/qwen3-32b', provider: 'Alibaba', capabilities: ['reasoning', 'tools'], group: 'Express Open-source Models' },
  { id: 'qwen3-8b', name: 'alibaba/qwen3-8b', provider: 'Alibaba', capabilities: ['tools'], group: 'Express Open-source Models' },
  { id: 'deepseek-r1', name: 'deepseek/deepseek-r1', provider: 'DeepSeek', capabilities: ['reasoning'], group: 'Express Open-source Models' },
  { id: 'deepseek-v3', name: 'deepseek/deepseek-v3', provider: 'DeepSeek', capabilities: ['tools', 'web'], group: 'Express Open-source Models' },
  { id: 'deepseek-r1-lite', name: 'deepseek/deepseek-r1-lite', provider: 'DeepSeek', capabilities: ['reasoning'], group: 'Express Open-source Models' },
  { id: 'llama-4-maverick', name: 'meta/llama-4-maverick', provider: 'Meta', capabilities: ['vision', 'tools'], group: 'Express Open-source Models' },
  { id: 'llama-4-scout', name: 'meta/llama-4-scout', provider: 'Meta', capabilities: ['vision'], group: 'Express Open-source Models' },
  { id: 'mistral-large-3', name: 'mistral/mistral-large-3', provider: 'Mistral', capabilities: ['vision', 'reasoning', 'tools'], group: 'Express Open-source Models' },
  { id: 'mistral-medium-3', name: 'mistral/mistral-medium-3', provider: 'Mistral', capabilities: ['tools'], group: 'Express Open-source Models' },
];
