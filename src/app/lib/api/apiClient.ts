// ===========================
// API Client
// ===========================
// Thin fetch wrapper with interceptors for auth, timeout, and error handling.
// Uses native fetch (no Axios dependency).

import { API_BASE_URL, REQUEST_TIMEOUT, USE_MOCK } from '@/app/config/env';
import type { ApiResponse, ApiErrorDetail } from '@/app/types/api';

// ---------------------
// Custom Error
// ---------------------

export class ApiError extends Error {
  public status: number;
  public code: string;
  public detail?: ApiErrorDetail;

  constructor(status: number, code: string, message: string, detail?: ApiErrorDetail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

// ---------------------
// Token management
// ---------------------

let _accessToken: string | null = null;

/** Set the auth token (called after login). */
export function setAccessToken(token: string | null) {
  _accessToken = token;
}

/** Get current auth token. */
export function getAccessToken(): string | null {
  return _accessToken;
}

// ---------------------
// Error handler hook
// ---------------------

type GlobalErrorHandler = (error: ApiError) => void;
let _onGlobalError: GlobalErrorHandler | null = null;

/** Register a global error handler (e.g. to show toast). */
export function onApiError(handler: GlobalErrorHandler) {
  _onGlobalError = handler;
}

// ---------------------
// Core request
// ---------------------

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON body (will be serialized automatically) */
  body?: unknown;
  /** Override timeout for this request (ms) */
  timeout?: number;
  /** Skip global error handler */
  silent?: boolean;
  /** Custom base URL override */
  baseUrl?: string;
}

/**
 * Perform an API request.
 * In mock mode (`USE_MOCK=true`) this function is never called by service
 * methods — they return mock data directly. This is the real-API path.
 */
export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    timeout = REQUEST_TIMEOUT,
    silent = false,
    baseUrl = API_BASE_URL,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  // --- Build URL ---
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;

  // --- Headers ---
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(customHeaders as Record<string, string> || {}),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  // --- Timeout via AbortController ---
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    // --- Handle HTTP errors ---
    if (!response.ok) {
      let errorDetail: ApiErrorDetail | undefined;
      try {
        const errorBody = await response.json();
        errorDetail = errorBody as ApiErrorDetail;
      } catch {
        // Response body is not JSON
      }

      const apiError = new ApiError(
        response.status,
        errorDetail?.code || `HTTP_${response.status}`,
        errorDetail?.message || getDefaultErrorMessage(response.status),
        errorDetail,
      );

      if (!silent && _onGlobalError) {
        _onGlobalError(apiError);
      }

      throw apiError;
    }

    // --- Parse response ---
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json: ApiResponse<T> = await response.json();
      return json.data;
    }

    // Non-JSON (e.g. file download)
    return (await response.blob()) as unknown as T;
  } catch (err) {
    clearTimeout(timer);

    if (err instanceof ApiError) throw err;

    // AbortError = timeout
    if ((err as Error).name === 'AbortError') {
      const timeoutError = new ApiError(0, 'TIMEOUT', '\u8bf7\u6c42\u8d85\u65f6\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5');
      if (!silent && _onGlobalError) _onGlobalError(timeoutError);
      throw timeoutError;
    }

    // Network error
    const networkError = new ApiError(0, 'NETWORK_ERROR', '\u7f51\u7edc\u8fde\u63a5\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u8bbe\u7f6e');
    if (!silent && _onGlobalError) _onGlobalError(networkError);
    throw networkError;
  }
}

// ---------------------
// Convenience methods
// ---------------------

export function get<T = unknown>(path: string, options?: RequestOptions) {
  return request<T>(path, { ...options, method: 'GET' });
}

export function post<T = unknown>(path: string, body?: unknown, options?: RequestOptions) {
  return request<T>(path, { ...options, method: 'POST', body });
}

export function put<T = unknown>(path: string, body?: unknown, options?: RequestOptions) {
  return request<T>(path, { ...options, method: 'PUT', body });
}

export function del<T = unknown>(path: string, options?: RequestOptions) {
  return request<T>(path, { ...options, method: 'DELETE' });
}

// ---------------------
// File upload
// ---------------------

export async function upload<T = unknown>(
  path: string,
  file: File,
  options: RequestOptions = {},
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const { headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string> || {}),
  };
  // Do NOT set Content-Type — browser will set multipart boundary automatically
  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  return request<T>(path, {
    ...rest,
    method: 'POST',
    headers,
    body: undefined,
    // We need to pass FormData directly, so we call fetch manually here
  });
}

// ---------------------
// SSE helper
// ---------------------

export interface SSEOptions {
  /** Called for each SSE data line */
  onMessage: (data: string) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Called when stream ends */
  onDone?: () => void;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Open a POST-based SSE stream (for chat completions).
 * Unlike EventSource, this supports POST with JSON body.
 */
export async function streamRequest(
  path: string,
  body: unknown,
  sseOptions: SSEOptions,
): Promise<void> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: sseOptions.signal,
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `HTTP_${response.status}`,
        getDefaultErrorMessage(response.status),
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError(0, 'NO_BODY', '\u670d\u52a1\u5668\u672a\u8fd4\u56de\u6d41\u5f0f\u6570\u636e');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split by double newline (SSE event boundary)
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const lines = part.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              sseOptions.onDone?.();
              return;
            }
            sseOptions.onMessage(data);
          }
        }
      }
    }

    sseOptions.onDone?.();
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      sseOptions.onDone?.();
      return;
    }
    sseOptions.onError?.(err as Error);
  }
}

// ---------------------
// Helpers
// ---------------------

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400: return '\u8bf7\u6c42\u53c2\u6570\u9519\u8bef';
    case 401: return '\u767b\u5f55\u5df2\u8fc7\u671f\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55';
    case 403: return '\u65e0\u6743\u8bbf\u95ee\u8be5\u8d44\u6e90';
    case 404: return '\u8bf7\u6c42\u7684\u8d44\u6e90\u4e0d\u5b58\u5728';
    case 429: return '\u8bf7\u6c42\u8fc7\u4e8e\u9891\u7e41\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5';
    case 500: return '\u670d\u52a1\u5668\u5185\u90e8\u9519\u8bef';
    case 502: return '\u7f51\u5173\u9519\u8bef';
    case 503: return '\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528';
    default: return `\u8bf7\u6c42\u5931\u8d25 (${status})`;
  }
}
