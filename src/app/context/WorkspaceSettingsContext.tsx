import { createContext, useContext, useState, type ReactNode } from 'react';
import { MOCK_RESOURCES } from '@/app/config/constants';

function fields(partial: Partial<ToolProviderFields> = {}): ToolProviderFields {
  return { apiKey: '', endpoint: '', model: '', username: '', password: '', language: '', ...partial };
}

export interface SpeechProviderSettings {
  id: string;
  name: string;
  description: string;
  model: string;
  endpoint: string;
  apiKey: string;
  enabled: boolean;
  local?: boolean;
}

export type BuiltinToolId = 'browser' | 'search' | 'documents' | 'ocr' | 'asr' | 'tts';

export interface ToolProviderFields {
  apiKey: string;
  endpoint: string;
  model: string;
  username: string;
  password: string;
  language: string;
}

export type AgentProviderSource = 'builtin' | 'local' | 'cloud';

export interface AgentProviderSettings {
  id: string;
  name: string;
  source: AgentProviderSource;
  description: string;
  command: string;
  endpoint: string;
  apiKey: string;
}

function useWorkspaceSettingsState() {
  const [profileName, setProfileName] = useState('Siin');
  const [profileEmail, setProfileEmail] = useState('siin@example.com');
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free');
  const [agentProviders, setAgentProviders] = useState<AgentProviderSettings[]>([
    {
      id: 'pi-agent',
      name: 'Pi Agent',
      source: 'builtin',
      description: 'Cherry 内置 Pi 运行时，已在当前工作空间中可用。',
      command: '',
      endpoint: '',
      apiKey: '',
    },
    {
      id: 'claude',
      name: 'Claude',
      source: 'local',
      description: '本地 Claude Code CLI。这里只记录启动命令，不会安装或调用。',
      command: 'claude',
      endpoint: '',
      apiKey: '',
    },
    {
      id: 'codex',
      name: 'Codex',
      source: 'local',
      description: '本地 Codex CLI。这里只记录启动命令，不会安装或调用。',
      command: 'codex',
      endpoint: '',
      apiKey: '',
    },
    {
      id: 'grok',
      name: 'Grok',
      source: 'local',
      description: '本地 Grok CLI。这里只记录启动命令，不会安装或调用。',
      command: 'grok',
      endpoint: '',
      apiKey: '',
    },
    {
      id: 'cloud-hermes',
      name: 'Hermes',
      source: 'cloud',
      description: '云端 Agent 接口。地址和密钥只保存在这次演示里，不会发出请求。',
      command: '',
      endpoint: 'https://agent.example.com/v1',
      apiKey: '',
    },
  ]);
  const [toolEnabled, setToolEnabled] = useState<Record<string, boolean>>({
    browser: true,
    ocr: true,
    asr: true,
    tts: true,
  });
  const [builtinTool, setBuiltinTool] = useState<BuiltinToolId>('browser');
  const [browserSettings, setBrowserSettings] = useState({ allowAiControl: true, openLinksInBrowser: true });
  const [searchProviderId, setSearchProviderId] = useState('tavily');
  const [fetchProviderId, setFetchProviderId] = useState('jina');
  const [modelToolsPreferred, setModelToolsPreferred] = useState(true);
  const [searchAdvanced, setSearchAdvanced] = useState({
    maxResults: 5,
    compression: 'none' as 'none' | 'cutoff',
    cutoffLimit: 2000,
    blacklist: '',
  });
  const [documentProcessorId, setDocumentProcessorId] = useState('paddleocr');
  const [ocrProcessorId, setOcrProcessorId] = useState('system');
  const [speechProviderIds, setSpeechProviderIds] = useState({ asr: 'whisper', tts: 'openai-tts' });
  const [toolFields, setToolFields] = useState<Record<string, ToolProviderFields>>(() => ({
    'search:zhipu': fields({ endpoint: 'https://open.bigmodel.cn/api/paas/v4/web_search' }),
    'search:tavily': fields({ endpoint: 'https://api.tavily.com' }),
    'search:searxng': fields({ endpoint: 'http://localhost:8080' }),
    'search:exa': fields({ endpoint: 'https://api.exa.ai' }),
    'search:exa-mcp': fields({ endpoint: 'https://mcp.exa.ai/mcp' }),
    'search:bocha': fields({ endpoint: 'https://api.bochaai.com' }),
    'search:querit': fields({ endpoint: 'https://api.querit.ai' }),
    'search:jina': fields({ endpoint: 'https://s.jina.ai' }),
    'search:firecrawl': fields({ endpoint: 'https://api.firecrawl.dev' }),
    'search:parallel': fields({ endpoint: 'https://api.parallel.ai' }),
    'search:serply': fields({ endpoint: 'https://api.serply.io' }),
    'fetch:querit': fields({ endpoint: 'https://api.querit.ai' }),
    'fetch:fetch': fields(),
    'fetch:jina': fields({ endpoint: 'https://r.jina.ai' }),
    'fetch:firecrawl': fields({ endpoint: 'https://api.firecrawl.dev' }),
    'doc:local-document': fields(),
    'doc:mineru': fields({ endpoint: 'https://mineru.net', model: 'pipeline' }),
    'doc:paddleocr': fields({ endpoint: 'https://paddleocr.aistudio-app.com/', model: 'PaddleOCR-VL-1.6' }),
    'doc:doc2x': fields({ endpoint: 'https://v2.doc2x.noedgeai.com', model: 'v3-2026' }),
    'doc:mistral': fields({ endpoint: 'https://api.mistral.ai', model: 'mistral-ocr-latest' }),
    'doc:open-mineru': fields({ endpoint: 'http://127.0.0.1:8000' }),
    'ocr:system': fields(),
    'ocr:paddleocr': fields({ endpoint: 'https://paddleocr.aistudio-app.com/', model: 'PP-OCRv6' }),
    'ocr:local-paddleocr': fields(),
    'ocr:tesseract': fields({ language: 'chi_sim+eng' }),
    'ocr:mistral': fields({ endpoint: 'https://api.mistral.ai', model: 'mistral-ocr-latest' }),
    'ocr:ovocr': fields(),
  }));
  const [toolSamples, setToolSamples] = useState<Record<string, string>>({
    tts: '你好，我是 Pi Agent，很高兴和你一起工作。',
  });
  const [toolResults, setToolResults] = useState<Record<string, string>>({});
  const [speechProviders, setSpeechProviders] = useState<Record<'asr' | 'tts', SpeechProviderSettings[]>>({
    asr: [
      {
        id: 'whisper',
        name: 'Whisper',
        description: 'OpenAI 语音识别服务',
        model: 'whisper-1',
        endpoint: 'https://api.openai.com/v1',
        apiKey: '',
        enabled: true,
      },
      {
        id: 'azure-asr',
        name: 'Azure Speech',
        description: 'Microsoft 多语言语音识别',
        model: 'azure-speech',
        endpoint: 'https://eastus.api.cognitive.microsoft.com',
        apiKey: '',
        enabled: false,
      },
      {
        id: 'local-asr',
        name: '本地引擎',
        description: '离线语音识别',
        model: 'whisper-small',
        endpoint: 'http://localhost:8080',
        apiKey: '',
        enabled: false,
        local: true,
      },
    ],
    tts: [
      {
        id: 'openai-tts',
        name: 'OpenAI TTS',
        description: 'OpenAI 自然语音合成',
        model: 'gpt-4o-mini-tts',
        endpoint: 'https://api.openai.com/v1',
        apiKey: '',
        enabled: true,
      },
      {
        id: 'azure-tts',
        name: 'Azure Speech',
        description: 'Microsoft 多语言语音合成',
        model: 'zh-CN-XiaoxiaoNeural',
        endpoint: 'https://eastus.tts.speech.microsoft.com',
        apiKey: '',
        enabled: false,
      },
      {
        id: 'local-tts',
        name: '本地引擎',
        description: '离线语音合成',
        model: 'system-default',
        endpoint: '',
        apiKey: '',
        enabled: false,
        local: true,
      },
    ],
  });
  const [prompts, setPrompts] = useState(() => MOCK_RESOURCES.filter((item) => item.type === 'prompt'));
  const [skills, setSkills] = useState(() => MOCK_RESOURCES.filter((item) => item.type === 'skill'));
  return {
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    subscriptionPlan,
    setSubscriptionPlan,
    agentProviders,
    setAgentProviders,
    toolEnabled,
    setToolEnabled,
    builtinTool,
    setBuiltinTool,
    browserSettings,
    setBrowserSettings,
    searchProviderId,
    setSearchProviderId,
    fetchProviderId,
    setFetchProviderId,
    modelToolsPreferred,
    setModelToolsPreferred,
    searchAdvanced,
    setSearchAdvanced,
    documentProcessorId,
    setDocumentProcessorId,
    ocrProcessorId,
    setOcrProcessorId,
    speechProviderIds,
    setSpeechProviderIds,
    toolFields,
    setToolFields,
    toolSamples,
    setToolSamples,
    toolResults,
    setToolResults,
    speechProviders,
    setSpeechProviders,
    prompts,
    setPrompts,
    skills,
    setSkills,
  };
}

const WorkspaceSettingsContext = createContext<ReturnType<typeof useWorkspaceSettingsState> | null>(null);

export function WorkspaceSettingsProvider({ children }: { children: ReactNode }) {
  const settings = useWorkspaceSettingsState();
  return <WorkspaceSettingsContext.Provider value={settings}>{children}</WorkspaceSettingsContext.Provider>;
}

export function useWorkspaceSettings() {
  const settings = useContext(WorkspaceSettingsContext);
  if (!settings) throw new Error('WorkspaceSettingsProvider is required');
  return settings;
}
