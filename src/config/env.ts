// ===========================
// Environment Configuration
// ===========================
// Type-safe access to Vite environment variables.
// All env vars must be prefixed with VITE_ to be exposed to client code.
// See .env.example for the full list.

/** API base URL for REST endpoints */
export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

/** WebSocket URL for streaming */
export const WS_URL: string =
  (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8000/ws';

/** Whether to use mock data instead of real API */
export const USE_MOCK: boolean =
  ((import.meta as any).env?.VITE_USE_MOCK ?? 'true') === 'true';

/** Request timeout in milliseconds */
export const REQUEST_TIMEOUT: number =
  Number((import.meta as any).env?.VITE_REQUEST_TIMEOUT) || 30000;

/** Application version string */
export const APP_VERSION: string =
  (import.meta as any).env?.VITE_APP_VERSION || '2.0.0';

/** SSE endpoint path (appended to API_BASE_URL) */
export const SSE_CHAT_PATH = '/chat/completions';

/** Max retry count for failed API requests */
export const MAX_RETRY_COUNT = 2;
