// ===========================
// Unified Model Configuration
// ===========================
// Central model registry used by both Agent and Assistant pages.

import type { ModelInfo, ModelCapability } from '../types/chat';

// Re-export for convenience
export type { ModelInfo, ModelCapability };
export { MODEL_CAPABILITY_LABELS } from '../types/chat';

// ===========================
// Provider Colors
// ===========================

export const PROVIDER_COLORS: Record<string, string> = {
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

export const AGENT_MODELS: ModelInfo[] = [
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', provider: 'Anthropic', capabilities: ['vision', 'reasoning', 'tools'] },
  { id: 'claude-4-opus', name: 'Claude 4 Opus', provider: 'Anthropic', capabilities: ['vision', 'reasoning', 'tools'] },
  { id: 'claude-4-haiku', name: 'Claude 4 Haiku', provider: 'Anthropic', capabilities: ['vision', 'tools'] },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', capabilities: ['vision', 'reasoning', 'tools', 'web'] },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI', capabilities: ['vision', 'tools', 'web'] },
  { id: 'o3', name: 'o3', provider: 'OpenAI', capabilities: ['vision', 'reasoning', 'tools'] },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools'] },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools'] },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', provider: 'Google', capabilities: ['vision', 'reasoning', 'tools', 'web'] },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', capabilities: ['reasoning'] },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', capabilities: ['tools', 'web'] },
  { id: 'qwen3-235b', name: 'Qwen3 235B', provider: 'Alibaba', capabilities: ['vision', 'reasoning', 'tools'] },
  { id: 'qwen3-32b', name: 'Qwen3 32B', provider: 'Alibaba', capabilities: ['reasoning', 'tools'] },
];

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
