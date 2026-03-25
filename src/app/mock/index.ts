// ===========================
// Mock Data Barrel
// ===========================
// Central re-export point for all mock data.
// Types are imported from ../types (canonical).
// Data for file & image lives in this directory (mock/*.ts).
// Data for assistant is migrated to mock/assistantData.ts.
// Data for agent is migrated to mock/agentData.ts.
//
// Usage:
//   import { MOCK_ASSISTANTS, MOCK_TOPICS } from '@/app/mock';
//   import { MOCK_SESSIONS } from '@/app/mock';

// --- Assistant mock data (migrated to mock/assistantData.ts) ---
export {
  MOCK_ASSISTANTS,
  MOCK_MESSAGES,
  MOCK_TOPICS,
  MOCK_PARALLEL_MESSAGES,
  MOCK_MULTI_ASSISTANT_MESSAGES,
  ASSISTANT_EMOJI_MAP,
} from './assistantData';

// --- Assistant types (re-export from central types) ---
export type { AssistantInfo, AssistantTopic } from '../types/assistant';
// AssistantMessage is now an alias for Message in the unified type system
export type { Message as AssistantMessage } from '../types/chat';

// --- Agent mock data (migrated to mock/agentData.ts) ---
export {
  MOCK_SESSIONS,
  SESSION_DATA_MAP,
  EMPTY_SESSION_DATA,
  DEFAULT_INITIAL_FILES,
  MODELS,
  AGENT_MODEL_CAPABILITY_LABELS,
} from './agentData';

// --- Agent types (re-export from central types) ---
export type {
  AgentSession, AgentChatMessage, AgentSessionData,
  FileNode, OutputFile,
} from '../types/agent';
// Legacy aliases
export type { AgentChatMessage as ChatMessage } from '../types/agent';
export type { AgentSessionData as SessionData } from '../types/agent';

// --- File management mock data (migrated to mock/fileData.ts) ---
export {
  FILE_TAGS,
  FILE_FOLDERS,
  MOCK_FILES,
  getFormatLabel,
  flattenFolders,
} from './fileData';

// --- File management types (re-export from central types) ---
export type { FileTag, FileFolder, FileItem } from '../types/file';

// --- Image generation mock data (migrated to mock/imageData.ts) ---
export {
  IMAGE_MODELS,
  RATIO_DIMENSIONS,
  SIZE_LABELS,
  MOCK_IMAGES,
} from './imageData';

// --- Image generation types (re-export from central types) ---
export type {
  ImageModel, ImageMode, AspectRatio, ImageSize,
  GenerationParams, GeneratedImage,
} from '../types/image';

// --- Constants mock data (extracted from config/constants.ts) ---
export {
  MOCK_FOLDERS,
  MOCK_RESOURCES,
  MOCK_KNOWLEDGE_BASES,
  MOCK_BUILTIN_TOOLS,
  MOCK_CUSTOM_SCRIPTS,
  MOCK_MCP_SERVERS,
  MOCK_INSTALLED_PLUGINS,
  MODEL_PROVIDERS,
  PROVIDER_MODELS,
} from './constants.mock';