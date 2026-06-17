// ===========================
// Quick Provider Setup — mock model fetch
// ===========================
// Prototype-only. Resolves to one of three outcomes so every state can be
// walked without a real backend:
//   - apiKey contains "401" → auth error
//   - apiKey contains "net" → network error
//   - otherwise            → 8–12 models after a ~1.2s delay
// The empty-success case is reachable by passing providerId 'empty' (not in
// the catalog UI; kept for completeness if a provider returns no models).

export type FetchModelsResult =
  | { status: 'success'; models: string[] }
  | { status: 'error'; reason: 'auth' | 'network' };

const MODELS_BY_PROVIDER: Record<string, string[]> = {
  openai: [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4o',
    'gpt-4o-mini',
    'o3',
    'o4-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'text-embedding-3-large',
    'dall-e-3',
  ],
  anthropic: [
    'claude-4-opus',
    'claude-4-sonnet',
    'claude-4-haiku',
    'claude-3.7-sonnet',
    'claude-3.5-sonnet',
    'claude-3.5-haiku',
    'claude-3-opus',
    'claude-3-haiku',
  ],
  gemini: [
    'gemini-3-pro',
    'gemini-3-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'text-embedding-004',
    'imagen-3',
  ],
  deepseek: ['deepseek-v3', 'deepseek-r1', 'deepseek-coder-v2', 'deepseek-chat'],
  groq: [
    'llama-3.3-70b',
    'llama-3.1-8b-instant',
    'mixtral-8x7b',
    'gemma2-9b-it',
    'qwen-2.5-32b',
    'deepseek-r1-distill-llama-70b',
  ],
  ollama: [
    'llama3.2',
    'llama3.1:8b',
    'qwen2.5:14b',
    'mistral',
    'gemma2',
    'phi3',
    'codellama',
    'nomic-embed-text',
    'llava',
  ],
  // A custom (OpenAI-compatible) gateway often proxies many upstream models.
  custom: [
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3.5-sonnet',
    'deepseek-v3',
    'llama-3.3-70b',
    'qwen-2.5-72b',
  ],
};

export function mockFetchModels(args: {
  providerId: string;
  apiKey: string;
  signal?: AbortSignal;
}): Promise<FetchModelsResult> {
  const { providerId, apiKey, signal } = args;
  return new Promise((resolve, reject) => {
    const key = apiKey.toLowerCase();
    const delay = key.includes('401') || key.includes('net') ? 700 : 1200;

    const timer = setTimeout(() => {
      if (key.includes('401')) {
        resolve({ status: 'error', reason: 'auth' });
        return;
      }
      if (key.includes('net')) {
        resolve({ status: 'error', reason: 'network' });
        return;
      }
      const models = MODELS_BY_PROVIDER[providerId] ?? [];
      resolve({ status: 'success', models });
    }, delay);

    // Honour aborts so superseded fetches (rapid typing) don't land late.
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
