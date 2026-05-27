// ===========================
// Brand & Provider Colors
// ===========================
// Centralized brand-color data — all `#hex` values that were previously
// scattered across pages live here so they can be tweaked in one place
// and stay consistent (e.g. Anthropic was `#d97706` in some files but
// `#D4A27F` in others; this fixes that drift).
//
// Use these in:
//   - <BrandLogo fallbackColor={BRAND_COLOR.openai}>
//   - inline pie/bar chart fill colors
//   - settings page provider tiles

export const BRAND_COLOR = {
  // Model providers — values reflect each provider's primary brand color.
  // When inconsistencies existed (e.g. Anthropic was #d97706 in some files
  // and #D4A27F in others), we kept the value used by the majority of
  // existing settings tiles for visual continuity.
  openai:     '#10a37f',
  anthropic:  '#d97706',
  google:     '#4285f4',
  gemini:     '#4285f4',
  meta:       '#0668e1',
  qwen:       '#6366f1',
  deepseek:   '#4f6ef7',
  ollama:     '#1a1a1a',
  groq:       '#f55036',
  mistral:    '#ff7000',
  zhipu:      '#2563eb',
  cherry:     '#e74c8b',
  // Categories (embedding / vector etc.)
  embed:      '#06b6d4',
  // Web search providers
  bing:       '#0078d4',
  perplexity: '#0ea5e9',
  // Misc
  notion:     '#000000',
  // Neutral fallback for unknown brand
  fallback:   '#6b7280',
} as const;

export const FALLBACK_BRAND_COLOR = BRAND_COLOR.fallback;
