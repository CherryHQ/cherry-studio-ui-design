// ===========================
// Chat Service
// ===========================
// API methods for chat / conversation management.
// When USE_MOCK is true, returns mock data without hitting the network.

import { USE_MOCK } from '@/app/config/env';
import { get, post, del, streamRequest } from './apiClient';
import type {
  ChatCompletionRequest,
  SessionSummary,
  StreamChunk,
  PaginatedResponse,
} from '@/app/types/api';
import type { Message } from '@/app/types/chat';

// ---------------------
// Mock helpers
// ---------------------

function mockDelay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------
// Sessions
// ---------------------

/** Fetch conversation list (paginated). */
export async function getSessions(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<SessionSummary>> {
  if (USE_MOCK) {
    await mockDelay();
    return {
      items: [],
      total: 0,
      page,
      pageSize,
      hasMore: false,
    };
  }
  return get<PaginatedResponse<SessionSummary>>(
    `/sessions?page=${page}&pageSize=${pageSize}`,
  );
}

/** Create a new conversation session. */
export async function createSession(title: string, model: string): Promise<SessionSummary> {
  if (USE_MOCK) {
    await mockDelay();
    return {
      id: `session-${Date.now()}`,
      title,
      model,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return post<SessionSummary>('/sessions', { title, model });
}

/** Delete a conversation session. */
export async function deleteSession(sessionId: string): Promise<void> {
  if (USE_MOCK) {
    await mockDelay();
    return;
  }
  return del(`/sessions/${sessionId}`);
}

// ---------------------
// Messages
// ---------------------

/** Fetch message history for a session. */
export async function getMessages(
  sessionId: string,
  page = 1,
  pageSize = 50,
): Promise<PaginatedResponse<Message>> {
  if (USE_MOCK) {
    await mockDelay();
    return {
      items: [],
      total: 0,
      page,
      pageSize,
      hasMore: false,
    };
  }
  return get<PaginatedResponse<Message>>(
    `/sessions/${sessionId}/messages?page=${page}&pageSize=${pageSize}`,
  );
}

// ---------------------
// Chat completion (non-streaming)
// ---------------------

export async function sendMessage(
  sessionId: string,
  request: ChatCompletionRequest,
): Promise<Message> {
  if (USE_MOCK) {
    await mockDelay(800);
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: '\u8fd9\u662f\u4e00\u6761 Mock \u56de\u590d\u3002\u8fde\u63a5\u540e\u7aef\u540e\u5c06\u663e\u793a\u771f\u5b9e\u7684\u6a21\u578b\u54cd\u5e94\u3002',
      timestamp: new Date().toISOString(),
    };
  }
  return post<Message>(
    `/sessions/${sessionId}/chat`,
    { ...request, stream: false },
  );
}

// ---------------------
// Chat completion (streaming)
// ---------------------

export interface StreamCallbacks {
  /** Called with each incremental text delta */
  onDelta: (delta: string) => void;
  /** Called with each thinking/reasoning delta */
  onThinkingDelta?: (delta: string) => void;
  /** Called when generation completes */
  onDone: (usage?: StreamChunk['usage']) => void;
  /** Called on error */
  onError: (error: Error) => void;
}

/**
 * Send a streaming chat completion request.
 * Returns an abort function to cancel generation.
 */
export function sendMessageStream(
  sessionId: string,
  request: ChatCompletionRequest,
  callbacks: StreamCallbacks,
): () => void {
  const controller = new AbortController();

  if (USE_MOCK) {
    // Simulate streaming with mock data
    const mockText = '\u8fd9\u662f\u4e00\u6761\u6d41\u5f0f Mock \u56de\u590d\u3002\u6bcf\u4e2a\u5b57\u7b26\u4f1a\u9010\u6b65\u51fa\u73b0\uff0c\u6a21\u62df\u771f\u5b9e\u7684\u5927\u6a21\u578b\u8f93\u51fa\u4f53\u9a8c\u3002';
    let i = 0;
    const interval = setInterval(() => {
      if (controller.signal.aborted || i >= mockText.length) {
        clearInterval(interval);
        if (!controller.signal.aborted) {
          callbacks.onDone({ inputTokens: 128, outputTokens: mockText.length });
        }
        return;
      }
      callbacks.onDelta(mockText[i]);
      i++;
    }, 50);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }

  // Real streaming via SSE
  streamRequest(
    `/sessions/${sessionId}/chat`,
    { ...request, stream: true },
    {
      signal: controller.signal,
      onMessage: (data: string) => {
        try {
          const chunk: StreamChunk = JSON.parse(data);
          if (chunk.error) {
            callbacks.onError(new Error(chunk.error.message));
            return;
          }
          if (chunk.delta) {
            callbacks.onDelta(chunk.delta);
          }
          if (chunk.thinkingDelta) {
            callbacks.onThinkingDelta?.(chunk.thinkingDelta);
          }
          if (chunk.done) {
            callbacks.onDone(chunk.usage);
          }
        } catch {
          // Ignore malformed chunk
        }
      },
      onError: (err: Error) => callbacks.onError(err),
      onDone: () => {
        // Stream ended without explicit [DONE] — treat as complete
      },
    },
  );

  return () => controller.abort();
}

// ---------------------
// Stop generation
// ---------------------

/** Request the server to stop an ongoing generation. */
export async function stopGeneration(sessionId: string, messageId: string): Promise<void> {
  if (USE_MOCK) return;
  return post(`/sessions/${sessionId}/messages/${messageId}/stop`);
}
