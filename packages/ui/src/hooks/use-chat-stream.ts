"use client"

// ===========================
// useChatStream Hook
// ===========================
// Manages a streaming chat response lifecycle:
// connection, incremental updates, error handling, and abort.

import { useState, useRef, useCallback } from "react"

// ---------------------------------------------------------------------------
// Types – defined locally so the hook has no hard dependency on a service layer
// ---------------------------------------------------------------------------

export interface StreamChunk {
  /** Unique message id this chunk belongs to */
  messageId: string
  /** Incremental text content */
  delta: string
  /** Optional thinking/reasoning content */
  thinkingDelta?: string
  /** Whether this is the final chunk */
  done: boolean
  /** Token usage snapshot (only on final chunk) */
  usage?: {
    inputTokens: number
    outputTokens: number
    thinkingTokens?: number
  }
  /** Error info if generation failed */
  error?: {
    code: string
    message: string
  }
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatRequestMessage[]
  stream?: boolean
  temperature?: number
  maxTokens?: number
  topP?: number
  /** Knowledge base id for RAG */
  knowledgeBaseId?: string
  /** Web search enabled */
  webSearch?: boolean
}

export interface ChatRequestMessage {
  role: "user" | "assistant" | "system"
  content: string
  attachments?: ChatRequestAttachment[]
}

export interface ChatRequestAttachment {
  type: "file" | "image"
  name: string
  url: string
  mimeType?: string
}

// ---------------------------------------------------------------------------
// Stream callbacks – mirrors the contract expected by sendMessageStream
// ---------------------------------------------------------------------------

export interface StreamCallbacks {
  onDelta: (delta: string) => void
  onThinkingDelta: (delta: string) => void
  onDone: (usage?: StreamChunk["usage"]) => void
  onError: (error: Error) => void
}

/**
 * A function that starts a message stream and returns a cancel/abort function.
 * This is the abstraction over the actual transport (SSE, WebSocket, fetch, etc.).
 */
export type SendMessageStream = (
  sessionId: string,
  request: ChatCompletionRequest,
  callbacks: StreamCallbacks,
) => () => void

// ---------------------------------------------------------------------------
// Hook types
// ---------------------------------------------------------------------------

export type StreamStatus = "idle" | "streaming" | "done" | "error"

export interface UseChatStreamOptions {
  /** The transport function that opens the stream */
  sendMessage: SendMessageStream
  /** Session / conversation id */
  sessionId: string
  /** Called when streaming finishes successfully */
  onComplete?: (finalContent: string, usage?: StreamChunk["usage"]) => void
  /** Called on error */
  onError?: (error: Error) => void
}

export interface UseChatStreamReturn {
  /** Current accumulated content */
  content: string
  /** Current accumulated thinking/reasoning content */
  thinking: string
  /** Current stream status */
  status: StreamStatus
  /** Token usage (available after completion) */
  usage: StreamChunk["usage"] | null
  /** Error message if status is 'error' */
  error: string | null
  /** Start streaming a new message */
  startStream: (request: ChatCompletionRequest) => void
  /** Abort current stream */
  abort: () => void
  /** Reset state to idle */
  reset: () => void
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

/**
 * Hook to manage streaming chat completions with typewriter-style
 * incremental updates. Handles connection, parsing, error, and abort.
 *
 * @example
 * ```tsx
 * const { content, status, startStream, abort } = useChatStream({
 *   sendMessage: myStreamFn,
 *   sessionId: currentSession.id,
 *   onComplete: (text, usage) => addMessage(text, usage),
 * });
 *
 * // Start generation
 * startStream({ model: 'gpt-4', messages: [...] });
 *
 * // Show typing indicator
 * if (status === 'streaming') return <TypingBubble text={content} />;
 * ```
 */
export function useChatStream(options: UseChatStreamOptions): UseChatStreamReturn {
  const { sendMessage, sessionId, onComplete, onError } = options

  const [content, setContent] = useState("")
  const [thinking, setThinking] = useState("")
  const [status, setStatus] = useState<StreamStatus>("idle")
  const [usage, setUsage] = useState<StreamChunk["usage"] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Abort function ref so we can cancel the current stream
  const abortRef = useRef<(() => void) | null>(null)
  // Accumulated content ref (for the onComplete callback which reads final value)
  const contentRef = useRef("")
  const thinkingRef = useRef("")

  const startStream = useCallback(
    (request: ChatCompletionRequest) => {
      // Reset state
      setContent("")
      setThinking("")
      setStatus("streaming")
      setUsage(null)
      setError(null)
      contentRef.current = ""
      thinkingRef.current = ""

      // Cancel any previous stream
      abortRef.current?.()

      const cancelFn = sendMessage(sessionId, request, {
        onDelta: (delta: string) => {
          contentRef.current += delta
          setContent(contentRef.current)
        },
        onThinkingDelta: (delta: string) => {
          thinkingRef.current += delta
          setThinking(thinkingRef.current)
        },
        onDone: (u) => {
          setStatus("done")
          setUsage(u || null)
          onComplete?.(contentRef.current, u)
        },
        onError: (err: Error) => {
          setStatus("error")
          setError(err.message)
          onError?.(err)
        },
      })

      abortRef.current = cancelFn
    },
    [sendMessage, sessionId, onComplete, onError],
  )

  const abort = useCallback(() => {
    abortRef.current?.()
    abortRef.current = null
    setStatus("idle")
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.()
    abortRef.current = null
    setContent("")
    setThinking("")
    setStatus("idle")
    setUsage(null)
    setError(null)
    contentRef.current = ""
    thinkingRef.current = ""
  }, [])

  return {
    content,
    thinking,
    status,
    usage,
    error,
    startStream,
    abort,
    reset,
  }
}
