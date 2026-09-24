export type AgentSource = 'builtin' | 'local' | 'cloud';
export type DemoScenario = 'chat' | 'tool' | 'error';
export type MessageStatus = 'running' | 'approval' | 'executing' | 'done' | 'error' | 'stopped';

export interface DemoMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  status: MessageStatus;
  scenario?: DemoScenario;
  attachments?: DemoAttachment[];
  result?: boolean;
}

export const PI_TOOLS = {
  read: '读取文件',
  bash: '执行命令',
  edit: '编辑文件',
  write: '写入文件',
  tool_search: '搜索工具',
  tool_describe: '查看工具说明',
  tool_call: '调用工具',
  tool_exec: '执行工具代码',
};

export interface DemoAgent {
  id: string;
  name: string;
  source: AgentSource;
  runtime: 'pi';
  description: string;
  model: string;
  permission: string;
  language: string;
  instructions: string;
  boundPrompt: boolean;
  tools: Record<string, boolean>;
  capabilities: Record<string, boolean>;
  heartbeat: boolean;
  interval: number;
  env: string;
  draft: string;
  attachments: DemoAttachment[];
  providerId?: string;
  messages: DemoMessage[];
  updatedAt: number;
  unread: number;
}

export const SOURCE_LABELS: Record<AgentSource, string> = {
  builtin: 'Built-in · 内置智能体',
  local: 'Local · 本地智能体',
  cloud: 'Cloud · 云端智能体',
};

export function createDemoAgent(name: string, source: AgentSource): DemoAgent {
  return {
    id: crypto.randomUUID(),
    name,
    source,
    runtime: 'pi',
    description: '把复杂的问题变成清晰的行动。',
    model: 'GPT-5.4',
    permission: 'auto',
    language: 'system',
    instructions:
      '你是一位可靠的工作伙伴。先理解目标，把复杂问题拆成可以执行的步骤。表达清晰简洁，在需要时使用工具，并在有风险的操作前征求确认。',
    boundPrompt: true,
    tools: Object.fromEntries(Object.keys(PI_TOOLS).map((key) => [key, true])),
    capabilities: { browser: true, notes: false, research: true, writing: true, knowledge: false },
    heartbeat: false,
    interval: 30,
    env: '',
    draft: '',
    attachments: [],
    messages: [],
    updatedAt: Date.now(),
    unread: 0,
  };
}

export function createDemoAgents(): DemoAgent[] {
  const pi = createDemoAgent('Pi Agent', 'builtin');
  const local = createDemoAgent('工作区助手', 'local');
  const cloud = createDemoAgent('研究伙伴', 'cloud');
  pi.messages = [
    {
      id: 'pi-intro',
      role: 'assistant',
      status: 'done',
      text: '你好，我是 Pi。研究一个问题、整理一份文档，或者把想法变成下一步，我们从这里开始。',
    },
    { id: 'pi-question', role: 'user', status: 'done', text: '帮我整理一下 PC 端新的交互方向，先聚焦工作台。' },
    {
      id: 'pi-answer',
      role: 'assistant',
      status: 'done',
      text: '可以，先收敛为三个重点：\n\n1. 左侧直接展示智能体，每个智能体都有持续的对话。\n2. 极简模式把空间留给内容，搜索和添加收进两个小按钮。\n3. 用来源标识区分内置、本地和云端能力，设置统一按五个分组组织。\n\n我也整理了一份交互清单，方便你继续讨论。',
      result: true,
    },
  ];
  local.messages = [
    {
      id: 'local-intro',
      role: 'assistant',
      status: 'done',
      text: '本地工作区已就绪。我可以帮助你阅读文件、整理资料，并在执行操作前请求确认。',
    },
  ];
  cloud.messages = [
    { id: 'cloud-question', role: 'user', status: 'done', text: '帮我研究一下最近的桌面 Agent 产品趋势。' },
    {
      id: 'cloud-answer',
      role: 'assistant',
      status: 'done',
      text: '有三个值得关注的方向：持续对话、人与智能体协作，以及工具执行过程的可见性。\n\n建议先验证用户是否能快速找到合适的智能体，以及是否清楚当前任务进行到了哪一步。',
    },
  ];
  local.updatedAt -= 11 * 60_000;
  cloud.updatedAt -= 4 * 60_000;
  cloud.unread = 1;
  return [pi, local, cloud];
}

export function agentPreview(agent: DemoAgent): string {
  const last = agent.messages[agent.messages.length - 1];
  if (last?.status === 'running') return '正在思考…';
  if (last?.status === 'approval') return '等待你批准工具操作';
  if (last?.status === 'executing') return '正在整理工作区…';
  if (last?.status === 'error') return '连接暂时中断，点击重试';
  if (agent.draft.trim()) return `草稿：${agent.draft}`;
  return last?.text.replace(/\s+/g, ' ') || '开始和这个智能体对话';
}

export const DEMO_RESULT =
  '# 产品交互清单\n\n✓ 传统 / 极简双模式\n✓ 每个智能体一段持续对话\n✓ 紧凑搜索与添加入口\n✓ Built-in / Local / Cloud 来源标识\n✓ 基本、提示词、能力、自动化、高级设置\n✓ 工具调用审批与结果预览';

export function demoReply(scenario: DemoScenario): string {
  return scenario === 'tool'
    ? '整理完成。产品交互清单已生成，包含工作台布局、智能体来源标识、设置分组和关键操作流程。'
    : '我把重点收敛成了三个方向：\n\n1. 让智能体成为工作的起点，用同一套交互连接内置、本地和云端能力。\n2. 极简模式把空间留给对话；需要多任务时，随时切回传统模式。\n3. 在设置中按基本、提示词、能力、自动化和高级组织配置。\n\n你可以从左侧切换智能体，继续各自的讨论。';
}
import type { FileAttachment } from '@/app/types/shared';

export interface DemoAttachment extends FileAttachment {
  fileUrl: string;
  content?: string;
  mimeType: string;
}
