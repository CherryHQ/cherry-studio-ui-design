// ===========================
// Assistant Mock Data — Thin Re-export Shim
// ===========================
// Physical data has been migrated to /src/app/mock/assistantData.ts.
// This file re-exports everything for backward compatibility.
// New consumers should import from '@/app/mock' instead.

// --- Type re-exports from central type system ---
import type { Message } from '@/app/types/chat';
export type {
  ArtifactData, TokenUsage, FileAttachment, ModelCapability,
  MessageMetadata, SearchResultItem, RAGInfo, RAGChunk, ParallelResponse,
  ModelInfo,
} from '@/app/types/chat';
export type { AssistantInfo, AssistantTopic } from '@/app/types/assistant';

// Backward-compatible type aliases
export type AssistantMessage = Message;
export type AssistantModel = import('@/app/types/chat').ModelInfo;

// --- Config re-exports ---
export { ASSISTANT_MODELS, MODEL_CAPABILITY_LABELS } from '@/app/config/models';

// --- Data re-exports from mock directory ---
export {
  MOCK_ASSISTANTS,
  ASSISTANT_EMOJI_MAP,
  MOCK_TOPICS,
  MOCK_MESSAGES,
  MOCK_PARALLEL_MESSAGES,
  MOCK_MULTI_ASSISTANT_MESSAGES,
} from '@/app/mock/assistantData';
