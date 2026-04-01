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
  vision: '\u89c6\u89c9',
  reasoning: '\u63a8\u7406',
  tools: '\u5de5\u5177',
  web: '\u8054\u7f51',
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
  status: 'done' | 'running' | 'pending' | 'error';
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
