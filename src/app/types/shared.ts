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
