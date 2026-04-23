// ===========================
// Unified Chat Types
// ===========================
// Shared types used by both Assistant and Agent chat interfaces.
// Generic types (FileAttachment, TokenUsage, etc.) live in ./shared.ts.

// Re-export shared types for convenience
export type {
  AttachmentFileType, FileAttachment,
  ArtifactType, ArtifactData,
  TokenUsage,
  ModelCapability, ModelInfo,
} from './shared';

// --- Prompt Section Types ---
export type BadgeKind = 'system' | 'custom' | 'kb' | 'mcp';
export type SlashTab = 'var' | 'kb' | 'mcp';

export interface KBItem {
  id: string;
  name: string;
  description: string;
  docCount: number;
}

export interface FewShotExample {
  id: string;
  user: string;
  assistant: string;
}

// --- Roles ---
export type MessageRole = 'user' | 'assistant' | 'agent' | 'system';

// --- Tool Calls (Agent) ---
export interface ToolCallData {
  name: string;
  status: 'running' | 'done' | 'error';
  duration?: string;
}

// --- Generative UI (Agent) ---
export interface ButtonOption {
  label: string;
  variant?: 'default' | 'primary' | 'danger';
  selected?: boolean;
  disabled?: boolean;
}

export interface SelectionItem {
  label: string;
  description?: string;
  selected?: boolean;
}

export interface GenerativeUIData {
  type: 'buttons' | 'selection' | 'confirmation';
  prompt: string;
  options?: ButtonOption[];
  items?: SelectionItem[];
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  resolved?: boolean;
  resolvedValue?: string;
}

// --- Search & RAG (Assistant) ---
export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  favicon?: string;
}

export interface RAGChunk {
  score: number;
  content: string;
  source: string;
  fileIcon?: string;
}

export interface RAGInfo {
  knowledgeBaseName: string;
  topK: number;
  scoreThreshold: number;
  rerankModel?: string;
  rewriteModel?: string;
  retrievalMethod: string;
  chunks: RAGChunk[];
  processLog: string[];
}

// --- Message Metadata (Assistant) ---
export interface MessageMetadata {
  sessionId: string;
  model: string;
  status: 'success' | 'error';
  startTime: string;
  duration: string;
  tokens: import('./shared').TokenUsage;
  requestJson: string;
  responseJson: string;
  processJson?: string;
}

// --- Parallel Responses (Assistant) ---
export interface ParallelResponse {
  id: string;
  assistantName?: string;
  modelName: string;
  modelProvider: string;
  content: string;
  thinking?: string;
  timestamp: string;
  duration: string;
  tokens: import('./shared').TokenUsage;
  images?: string[];
}

// --- Model Capability Labels ---
export const MODEL_CAPABILITY_LABELS: Record<import('./shared').ModelCapability, string> = {
  chat: '对话',
  vision: '视觉',
  reasoning: '推理',
  code: '代码',
  embedding: '嵌入',
  'image-gen': '图像生成',
  function: '函数',
  audio: '音频',
  'web-search': '联网搜索',
  free: '免费',
  tools: '工具',
  web: '联网',
};

// --- Workflow Steps (Agent) ---
export type WorkflowStepIcon =
  | 'search' | 'review' | 'write' | 'install'
  | 'config' | 'build' | 'finish' | 'code' | 'paint';

export interface StepDetailItem {
  icon?: string;
  label: string;
  meta?: string;
}

export interface WorkflowStep {
  id: string;
  icon: WorkflowStepIcon;
  label: string;
  status: 'done' | 'running' | 'pending';
  description?: string;
  detailLabel?: string;
  details?: StepDetailItem[];
}

// --- Unified Message Interface ---
// Covers both Assistant and Agent message shapes.
// Fields are optional so each consumer uses only what it needs.
export interface Message {
  id: string;
  role: MessageRole;
  content?: string;
  timestamp: string;
  // Shared
  thinking?: string;
  attachments?: import('./shared').FileAttachment[];
  // Assistant-specific
  artifact?: import('./shared').ArtifactData;
  metadata?: MessageMetadata;
  searchResults?: SearchResultItem[];
  ragInfo?: RAGInfo;
  images?: string[];
  codeBlock?: { language: string; code: string };
  mermaidCode?: string;
  parallelResponses?: ParallelResponse[];
  assistantLabel?: string;
  // Agent-specific
  toolCall?: ToolCallData;
  generativeUI?: GenerativeUIData;
  steps?: WorkflowStep[];
}
