// ===========================
// Quick Provider Setup — provider catalog (mock)
// ===========================
// Prototype-only static catalog. Drives the "服务商类型" select and the
// per-provider default endpoint type / Base URL auto-fill.

export interface ProviderEndpointType {
  id: string;
  name: string;
}

export interface ProviderType {
  id: string;
  name: string;
  /** Passed to <BrandLogo id={...} /> for the provider mark. */
  brandLogoId: string;
  endpointTypes: ProviderEndpointType[];
  defaultEndpointTypeId: string;
  defaultBaseUrl: string;
  /**
   * A user-defined provider: the name is typed by the user, the endpoint
   * type is a generic API protocol, and the Base URL has no default.
   */
  isCustom?: boolean;
}

export const PROVIDER_TYPES: ProviderType[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    brandLogoId: 'openai',
    endpointTypes: [
      { id: 'openai-chat', name: 'OpenAI Chat Completions' },
      { id: 'openai-responses', name: 'OpenAI Responses' },
    ],
    defaultEndpointTypeId: 'openai-chat',
    defaultBaseUrl: 'https://api.openai.com/v1',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    brandLogoId: 'anthropic',
    endpointTypes: [{ id: 'anthropic-messages', name: 'Anthropic Messages' }],
    defaultEndpointTypeId: 'anthropic-messages',
    defaultBaseUrl: 'https://api.anthropic.com',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    brandLogoId: 'gemini',
    endpointTypes: [
      { id: 'gemini-generate', name: 'Gemini generateContent' },
      { id: 'gemini-openai', name: 'Gemini OpenAI 兼容' },
    ],
    defaultEndpointTypeId: 'gemini-generate',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    brandLogoId: 'deepseek',
    endpointTypes: [{ id: 'deepseek-chat', name: 'DeepSeek Chat Completions' }],
    defaultEndpointTypeId: 'deepseek-chat',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
  },
  {
    id: 'groq',
    name: 'Groq',
    brandLogoId: 'groq',
    endpointTypes: [{ id: 'groq-chat', name: 'Groq Chat Completions' }],
    defaultEndpointTypeId: 'groq-chat',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    brandLogoId: 'ollama',
    endpointTypes: [
      { id: 'ollama-chat', name: 'Ollama Chat' },
      { id: 'ollama-openai', name: 'Ollama OpenAI 兼容' },
    ],
    defaultEndpointTypeId: 'ollama-chat',
    defaultBaseUrl: 'http://localhost:11434',
  },
  {
    id: 'custom',
    name: '自定义服务商',
    brandLogoId: '',
    isCustom: true,
    endpointTypes: [
      { id: 'openai-compatible', name: 'OpenAI 兼容' },
      { id: 'anthropic-compatible', name: 'Anthropic 兼容' },
      { id: 'gemini-compatible', name: 'Gemini 兼容' },
    ],
    defaultEndpointTypeId: 'openai-compatible',
    defaultBaseUrl: '',
  },
];

export function getProviderType(id: string | null | undefined): ProviderType | undefined {
  if (!id) return undefined;
  return PROVIDER_TYPES.find((p) => p.id === id);
}
