// ===========================
// API Response Types
// ===========================
// Generic types for backend API communication.
// Used by service layer; does not affect current UI.

/**
 * Standard API response wrapper.
 * Backend should return all responses in this shape.
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * Paginated list response.
 */
export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Streaming chunk from SSE endpoint.
 * Each SSE `data:` line should parse into this shape.
 */
export interface StreamChunk {
  /** Unique message id this chunk belongs to */
  messageId: string;
  /** Incremental text content */
  delta: string;
  /** Optional thinking/reasoning content */
  thinkingDelta?: string;
  /** Whether this is the final chunk */
  done: boolean;
  /** Token usage snapshot (only on final chunk) */
  usage?: {
    inputTokens: number;
    outputTokens: number;
    thinkingTokens?: number;
  };
  /** Error info if generation failed */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Chat completion request body.
 */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatRequestMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  /** Knowledge base id for RAG */
  knowledgeBaseId?: string;
  /** Web search enabled */
  webSearch?: boolean;
}

export interface ChatRequestMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: ChatRequestAttachment[];
}

export interface ChatRequestAttachment {
  type: 'file' | 'image';
  name: string;
  url: string;
  mimeType?: string;
}

/**
 * Resource upload response.
 */
export interface UploadResult {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Session / conversation summary.
 */
export interface SessionSummary {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * HTTP error detail returned by backend.
 */
export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================
// Backend Integration Contract Types
// =============================================
// The following types define the API contract for backend integration.
// Backend should implement endpoints matching these shapes.
// See API_CONTRACT.md for the full endpoint list.

import type { ModelInfo } from './shared';

/** Authentication — Login request */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Authentication — Login response */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  /** Token expiry in seconds */
  expiresIn: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

/** Authentication — Token refresh */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** User settings payload (corresponds to PUT /api/v1/settings) */
export interface UserSettingsPayload {
  language: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  zoom: number;
  globalFont: string;
  codeFont: string;
}

/** Model provider (corresponds to GET /api/v1/models/providers) */
export interface ModelProvider {
  id: string;
  name: string;
  models: ModelInfo[];
  isEnabled: boolean;
  apiKeyRequired: boolean;
}

/** MCP server config (corresponds to GET /api/v1/mcp/servers) */
export interface MCPServerConfig {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: string[];
}