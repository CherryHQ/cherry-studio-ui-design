// ===========================
// Agent Run Mock Data — Thin Re-export Shim
// ===========================
// Physical data has been migrated to /src/app/mock/agentData.ts.
// This file re-exports everything for backward compatibility.
// New consumers should import from '@/app/mock' instead.

// --- Type re-exports from central type system ---
import type { AgentChatMessage, AgentSessionData } from '@/app/types/agent';
export type { AgentSession, AgentChatMessage, AgentSessionData, FileNode, OutputFile } from '@/app/types/agent';
export type { WorkflowStep, ModelCapability, ModelInfo } from '@/app/types/chat';

// Backward-compatible aliases
export type ChatMessage = AgentChatMessage;
export type SessionData = AgentSessionData;
export type AgentModelCapability = import('@/app/types/chat').ModelCapability;
export type AgentModel = import('@/app/types/chat').ModelInfo;

// --- Config re-exports ---
export { AGENT_MODELS, MODEL_CAPABILITY_LABELS } from '@/app/config/models';

// --- Data re-exports from mock directory ---
export {
  AGENT_MODEL_CAPABILITY_LABELS,
  MODELS,
  MOCK_SESSIONS,
  SESSION_DATA_MAP,
  DEFAULT_INITIAL_FILES,
  EMPTY_SESSION_DATA,
} from '@/app/mock/agentData';
