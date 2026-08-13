// ===========================
// Shared Types (cross-module)
// ===========================
// Generic types used across Assistant, Agent, and Library modules.
// Chat-specific types remain in ./chat.ts.

// --- Attachments ---
export type AttachmentFileType =
  | 'pdf' | 'docx' | 'csv' | 'xlsx' | 'txt' | 'zip'
  | 'png' | 'jpg' | 'py' | 'ts' | 'md';

export interface FileAttachment {
  id: string;
  name: string;
  type: AttachmentFileType;
  size: string;
  previewUrl?: string;
}

// --- Artifacts ---
export type ArtifactType = 'document' | 'code' | 'html' | 'svg' | 'mermaid';

export interface ArtifactData {
  type: ArtifactType;
  title: string;
  content: string;
  language?: string;
}

// --- Token Usage ---
export interface TokenUsage {
  input: number;
  output: number;
  thinking?: number;
  cache?: number;
}

// --- Model Capabilities ---
export type ModelCapability = 'chat' | 'vision' | 'reasoning' | 'code' | 'embedding' | 'image-gen' | 'function' | 'audio' | 'web-search' | 'free' | 'tools' | 'web';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: ModelCapability[];
  group?: string;
  /** 当前不可用的能力标识（徽标转灰），例：免费额度用完后的 free */
  mutedCapabilities?: ModelCapability[];
  /** 覆盖品牌图标 id（默认取 provider）—— 托管服务商下挂别家模型时用 */
  logoId?: string;
  /** 整条置灰（图标去色 + 名称转灰），例：免费额度用完 */
  muted?: boolean;
  /** 以下字段用于模型选择器里的 hover 模型卡；缺省则不出卡 */
  /** 服务商侧的模型 ID（展示用，与本地 id 不一定相同） */
  modelId?: string;
  contextWindow?: number;
  maxOutput?: number;
  /** 思维链长度档位，如 "沉思, 极致" */
  thinkingLevels?: string;
  /** 模型卡底部的额外说明，例：限时免费的使用范围 */
  note?: string;
}

// --- Web Search Types ---
export interface ProviderParam {
  id: string;
  label: string;
  type: 'select' | 'toggle' | 'text' | 'number';
  value: string | boolean | number;
  options?: { value: string; label: string }[];
  desc?: string;
  link?: { label: string; url: string };
}

export interface SearchProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
  subtitle: string;
  enabled: boolean;
  configured: boolean;
  apiKey?: string;
  baseUrl?: string;
  params: ProviderParam[];
}

export interface BlacklistSubscription {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}
