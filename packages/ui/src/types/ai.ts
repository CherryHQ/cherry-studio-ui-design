import type { UIMessage } from "ai"

/**
 * Extended message type compatible with AI SDK's useChat
 * while supporting Cherry Studio's additional features
 */
export interface ChatMessage extends UIMessage {
  /** Thinking/reasoning content (for models like Claude) */
  thinking?: string
  /** Whether this message is currently streaming */
  isStreaming?: boolean
  /** Token usage for this message */
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
  /** Tool call results */
  toolResults?: ToolCallResult[]
}

export interface ToolCallResult {
  id: string
  toolName: string
  args: Record<string, unknown>
  result?: unknown
  status: "pending" | "running" | "done" | "error"
  error?: string
}

export interface ChatConfig {
  /** Model ID */
  model: string
  /** System prompt */
  systemPrompt?: string
  /** Temperature (0-2) */
  temperature?: number
  /** Max tokens */
  maxTokens?: number
  /** Whether to stream responses */
  stream?: boolean
}

export type StreamStatus = "idle" | "streaming" | "thinking" | "done" | "error"
