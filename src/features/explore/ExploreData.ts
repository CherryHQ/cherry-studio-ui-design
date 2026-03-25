// ===========================
// Types
// ===========================

export type ResourceCategory = 'agents' | 'assistants' | 'knowledge' | 'mcp' | 'skills' | 'plugins';

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  integrations: string[];
  category: string;
  subcategory: string;
  stars: number;
  runs: number;
  author: string;
  recommended_model: string;
  tags: string[];
  createdAt: string;
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  avatar: string;
  persona: string;
  subcategory: string;
  rating: number;
  conversations: number;
  author: string;
  recommended_model: string;
  tags: string[];
  createdAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  cover: string;
  docCount: number;
  subcategory: string;
  author: string;
  tags: string[];
  createdAt: string;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  downloads: number;
  subcategory: string;
  author: string;
  version: string;
  tags: string[];
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  usageCount: number;
  subcategory: string;
  author: string;
  tags: string[];
  createdAt: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  downloads: number;
  subcategory: string;
  author: string;
  version: string;
  tags: string[];
  createdAt: string;
}

export type Resource = Agent | Assistant | KnowledgeBase | MCPTool | Skill | Plugin;

// ===========================
// Subcategories per category
// ===========================

export const subcategories: Record<ResourceCategory, string[]> = {
  agents: ['全部', '工程', '研究', '数据', '客服', '设计', '运营', '安全', '产品', '财务'],
  assistants: ['全部', '写作', '编程', '教育', '商业', '创意', '翻译', '法律', '健康', '生活'],
  knowledge: ['全部', 'AI/ML', '工程', '产品', '设计', '运营', '金融', '法律', '医学'],
  mcp: ['全部', '数据', '网络', '文件', '开发', '浏览器', '媒体', '通信', '安全'],
  skills: ['全部', '代码', '数据', '文档', '翻译', '图像', '音频', '视频'],
  plugins: ['全部', '记忆', '界面', '导出', '集成', '安全', '分析', '协作'],
};

// ===========================
// Models
// ===========================

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  badge?: string;
}

export const models: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', badge: '热门' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI' },
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: '推荐' },
  { id: 'claude-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', badge: '推理' },
  { id: 'gemini-2', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'qwen-max', name: 'Qwen-Max', provider: 'Alibaba' },
  { id: 'llama-3.3', name: 'Llama 3.3 70B', provider: 'Meta' },
];

// ===========================
// Integration icons
// ===========================

export const integrationIcons: Record<string, string> = {
  github: '\u2699\uFE0F', google: '\uD83D\uDD0D', python: '\uD83D\uDC0D', slack: '\uD83D\uDCAC',
  notion: '\uD83D\uDCDD', jira: '\uD83D\uDCCB', figma: '\uD83C\uDFA8', aws: '\u2601\uFE0F',
  docker: '\uD83D\uDC33', postgres: '\uD83D\uDC18', redis: '\uD83D\uDD34', stripe: '\uD83D\uDCB3',
  web: '\uD83C\uDF10', file: '\uD83D\uDCC1', api: '\uD83D\uDD0C', terminal: '\u2328\uFE0F',
  calendar: '\uD83D\uDCC5', email: '\u2709\uFE0F', database: '\uD83D\uDDC4\uFE0F', search: '\uD83D\uDD0E',
  k8s: '\u2638\uFE0F', grafana: '\uD83D\uDCCA', jenkins: '\uD83C\uDFD7\uFE0F', gitlab: '\uD83E\uDD8A',
  azure: '\uD83D\uDD37', gcp: '\uD83D\uDFE1', mongodb: '\uD83C\uDF43', elastic: '\uD83D\uDD36',
};

// ===========================
// Mock Data — Agents (18)
// ===========================

export const agents: Agent[] = [
  { id: 'a1', name: 'DevOps 工程师', description: '自主管理 CI/CD 流水线、基础设施监控和事故响应，支持多工具协调编排。', avatar: '\uD83E\uDD16', integrations: ['github', 'docker', 'aws', 'terminal'], subcategory: '工程', category: '工程', stars: 4820, runs: 12400, author: 'cherry-team', recommended_model: 'claude-sonnet', tags: ['运维', '自动化'], createdAt: '2025-12-01' },
  { id: 'a2', name: '研究分析师', description: '深度网络调研、论文分析与结构化报告生成，自动管理引用来源。', avatar: '\uD83D\uDD2C', integrations: ['web', 'google', 'notion', 'file'], subcategory: '研究', category: '研究', stars: 3650, runs: 8900, author: 'research-lab', recommended_model: 'gpt-4o', tags: ['研究', '分析'], createdAt: '2025-11-15' },
  { id: 'a3', name: '数据管道构建师', description: '自动化数据抽取、转换和加载（ETL），支持 Schema 校验和异常处理。', avatar: '\uD83D\uDCCA', integrations: ['postgres', 'python', 'api', 'redis'], subcategory: '数据', category: '数据', stars: 2890, runs: 6700, author: 'data-guild', recommended_model: 'deepseek-v3', tags: ['数据', 'ETL'], createdAt: '2025-10-20' },
  { id: 'a4', name: '全栈开发者', description: '端到端的应用搭建、代码生成、测试和部署自动化。', avatar: '\uD83D\uDCBB', integrations: ['github', 'terminal', 'docker', 'postgres'], subcategory: '工程', category: '工程', stars: 5200, runs: 15800, author: 'cherry-team', recommended_model: 'claude-sonnet', tags: ['编码', '全栈'], createdAt: '2025-09-10' },
  { id: 'a5', name: '客户成功顾问', description: '智能工单路由、回复起草和跨渠道客户情感分析。', avatar: '\uD83C\uDFAF', integrations: ['slack', 'email', 'jira', 'notion'], subcategory: '客服', category: '客服', stars: 1980, runs: 4500, author: 'support-ai', recommended_model: 'gpt-4o', tags: ['客服', 'CRM'], createdAt: '2025-11-01' },
  { id: 'a6', name: '设计系统管理', description: '组件审计、设计 Token 管理和无障碍合规性检查。', avatar: '\uD83C\uDFA8', integrations: ['figma', 'github', 'web', 'file'], subcategory: '设计', category: '设计', stars: 1540, runs: 3200, author: 'design-ops', recommended_model: 'gpt-4o', tags: ['设计', 'UI'], createdAt: '2025-10-05' },
  { id: 'a7', name: 'K8s 集群运维', description: '自动化 Kubernetes 集群管理、Pod 调度优化和故障自愈。', avatar: '\u2638\uFE0F', integrations: ['k8s', 'docker', 'grafana', 'terminal'], subcategory: '工程', category: '工程', stars: 3120, runs: 7800, author: 'cloud-ops', recommended_model: 'claude-sonnet', tags: ['K8s', '容器'], createdAt: '2025-12-10' },
  { id: 'a8', name: '竞品分析师', description: '全网竞品情报收集、功能对比分析和市场定位洞察。', avatar: '\uD83D\uDCC8', integrations: ['web', 'google', 'notion', 'api'], subcategory: '研究', category: '研究', stars: 2340, runs: 5100, author: 'strategy-ai', recommended_model: 'gpt-4o', tags: ['竞品', '市场'], createdAt: '2025-11-20' },
  { id: 'a9', name: '数据可视化师', description: '智能数据分析与可视化方案生成，支持多维度数据探索。', avatar: '\uD83D\uDCC9', integrations: ['python', 'postgres', 'api', 'file'], subcategory: '数据', category: '数据', stars: 2670, runs: 6200, author: 'viz-team', recommended_model: 'deepseek-v3', tags: ['可视化', '分析'], createdAt: '2025-10-15' },
  { id: 'a10', name: '智能客服机器人', description: '多轮对话管理、意图识别和情感分析，支持多渠道接入。', avatar: '\uD83E\uDD1D', integrations: ['slack', 'email', 'api', 'database'], subcategory: '客服', category: '客服', stars: 3890, runs: 18200, author: 'cherry-team', recommended_model: 'gpt-4o', tags: ['客服', '对话'], createdAt: '2025-09-25' },
  { id: 'a11', name: 'UI/UX 审查员', description: '界面可用性分析、设计一致性检查和用户体验改进建议。', avatar: '\uD83D\uDD8C\uFE0F', integrations: ['figma', 'web', 'file', 'api'], subcategory: '设计', category: '设计', stars: 1820, runs: 3900, author: 'design-ops', recommended_model: 'gpt-4o', tags: ['UX', '审查'], createdAt: '2025-11-08' },
  { id: 'a12', name: 'SEO 优化师', description: '网站 SEO 分析、关键词策略制定和内容优化建议。', avatar: '\uD83D\uDD17', integrations: ['web', 'google', 'api', 'file'], subcategory: '运营', category: '运营', stars: 2150, runs: 4800, author: 'growth-ai', recommended_model: 'gpt-4o', tags: ['SEO', '运营'], createdAt: '2025-10-28' },
  { id: 'a13', name: '安全审计师', description: '代码安全扫描、漏洞检测和合规性报告生成。', avatar: '\uD83D\uDEE1\uFE0F', integrations: ['github', 'terminal', 'api', 'file'], subcategory: '安全', category: '安全', stars: 2980, runs: 5600, author: 'sec-team', recommended_model: 'claude-sonnet', tags: ['安全', '审计'], createdAt: '2025-12-05' },
  { id: 'a14', name: '产品需求分析', description: '用户反馈分析、需求优先级排序和 PRD 文档自动生成。', avatar: '\uD83D\uDCCB', integrations: ['jira', 'notion', 'slack', 'api'], subcategory: '产品', category: '产品', stars: 1670, runs: 3400, author: 'product-ai', recommended_model: 'gpt-4o', tags: ['产品', '需求'], createdAt: '2025-11-12' },
  { id: 'a15', name: '财务报表分析', description: '自动化财务数据分析、报表生成和异常检测。', avatar: '\uD83D\uDCB0', integrations: ['python', 'api', 'file', 'database'], subcategory: '财务', category: '财务', stars: 1340, runs: 2800, author: 'fin-ai', recommended_model: 'deepseek-v3', tags: ['财务', '报表'], createdAt: '2025-10-18' },
  { id: 'a16', name: 'API 测试工程师', description: '自动化 API 测试用例生成、执行和覆盖率报告。', avatar: '\uD83E\uDDEA', integrations: ['api', 'github', 'terminal', 'docker'], subcategory: '工程', category: '工程', stars: 2450, runs: 5900, author: 'qa-team', recommended_model: 'claude-sonnet', tags: ['测试', 'API'], createdAt: '2025-12-08' },
  { id: 'a17', name: '社交媒体运营', description: '多平台内容策划、发布排期和数据分析。', avatar: '\uD83D\uDCF1', integrations: ['web', 'api', 'calendar', 'file'], subcategory: '运营', category: '运营', stars: 1890, runs: 4100, author: 'growth-ai', recommended_model: 'gpt-4o', tags: ['社媒', '运营'], createdAt: '2025-11-25' },
  { id: 'a18', name: '数据库管理员', description: '数据库性能优化、查询调优和备份恢复自动化。', avatar: '\uD83D\uDDC4\uFE0F', integrations: ['postgres', 'redis', 'mongodb', 'terminal'], subcategory: '数据', category: '数据', stars: 2210, runs: 4700, author: 'data-guild', recommended_model: 'deepseek-v3', tags: ['DBA', '优化'], createdAt: '2025-10-30' },
];

// ===========================
// Mock Data — Assistants (18)
// ===========================

export const assistants: Assistant[] = [
  { id: 'as1', name: '技术文档撰写', description: '擅长创建结构清晰、示例完善的技术文档。', avatar: '\u270D\uFE0F', persona: '严谨、精确、耐心。写作前总会先确认需求细节。', subcategory: '写作', rating: 4.9, conversations: 28400, author: 'cherry-team', recommended_model: 'claude-sonnet', tags: ['写作', '文档'], createdAt: '2025-12-01' },
  { id: 'as2', name: '创意文案', description: '全能型创意写手，专攻营销文案、品牌调性和叙事表达。', avatar: '\uD83D\uDD8A\uFE0F', persona: '风趣、想象力丰富、文化敏感。能适配任何品牌风格。', subcategory: '创意', rating: 4.8, conversations: 35200, author: 'content-studio', recommended_model: 'gpt-4o', tags: ['创意', '营销'], createdAt: '2025-11-15' },
  { id: 'as3', name: '代码审查员', description: '以资深工程师视角审查代码质量、设计模式、安全性和性能优化。', avatar: '\uD83D\uDD0D', persona: '建设性且深入。每个建议都会解释背后的原因。', subcategory: '编程', rating: 4.9, conversations: 19600, author: 'eng-guild', recommended_model: 'deepseek-v3', tags: ['代码', '审查'], createdAt: '2025-10-20' },
  { id: 'as4', name: '语言导师', description: '个性化语言学习，提供语法纠正、会话练习和文化知识。', avatar: '\uD83D\uDDE3\uFE0F', persona: '鼓励式教学，自适应调整。根据学习者水平灵活调整难度。', subcategory: '教育', rating: 4.7, conversations: 42100, author: 'edu-ai', recommended_model: 'gpt-4o', tags: ['语言', '教育'], createdAt: '2025-11-01' },
  { id: 'as5', name: '创业顾问', description: '产品市场匹配、融资策略和上市策略方面的战略指导。', avatar: '\uD83D\uDE80', persona: '直接、数据驱动。用市场洞察挑战你的假设。', subcategory: '商业', rating: 4.6, conversations: 8900, author: 'venture-ai', recommended_model: 'claude-sonnet', tags: ['创业', '战略'], createdAt: '2025-10-05' },
  { id: 'as6', name: '数学辅导', description: '从代数到高等微积分的分步数学解题辅导。', avatar: '\uD83D\uDCD0', persona: '耐心且系统化。将复杂问题拆解为易懂的步骤。', subcategory: '教育', rating: 4.8, conversations: 31500, author: 'edu-ai', recommended_model: 'deepseek-r1', tags: ['数学', '教育'], createdAt: '2025-09-10' },
  { id: 'as7', name: '小说写作助手', description: '协助构建故事情节、塑造人物角色和优化叙事节奏。', avatar: '\uD83D\uDCD6', persona: '富有创造力，擅长构建引人入胜的故事世界。', subcategory: '创意', rating: 4.7, conversations: 22800, author: 'creative-lab', recommended_model: 'claude-sonnet', tags: ['小说', '创作'], createdAt: '2025-12-10' },
  { id: 'as8', name: 'Python 导师', description: '从入门到精通的 Python 编程辅导，覆盖数据科学和Web开发。', avatar: '\uD83D\uDC0D', persona: '循序渐进，注重实践。每个概念都配合可运行的代码示例。', subcategory: '编程', rating: 4.9, conversations: 38900, author: 'code-edu', recommended_model: 'deepseek-v3', tags: ['Python', '编程'], createdAt: '2025-11-20' },
  { id: 'as9', name: '英文润色师', description: '学术论文和商务邮件的英文润色、语法纠正和风格优化。', avatar: '\uD83C\uDDEC\uD83C\uDDE7', persona: '专业、高效。兼顾学术规范和可读性。', subcategory: '翻译', rating: 4.8, conversations: 26300, author: 'lang-ai', recommended_model: 'gpt-4o', tags: ['英文', '润色'], createdAt: '2025-10-15' },
  { id: 'as10', name: '法律咨询助手', description: '提供法律法规查询、合同审查要点和法律文书模板。', avatar: '\u2696\uFE0F', persona: '严谨务实，注重法律条文的准确引用。', subcategory: '法律', rating: 4.5, conversations: 11200, author: 'legal-ai', recommended_model: 'gpt-4o', tags: ['法律', '合同'], createdAt: '2025-11-08' },
  { id: 'as11', name: '健康顾问', description: '健康知识科普、运动计划制定和营养建议。', avatar: '\uD83C\uDFE5', persona: '关怀、专业。始终建议在重要决定前咨询医生。', subcategory: '健康', rating: 4.4, conversations: 15600, author: 'health-ai', recommended_model: 'gpt-4o', tags: ['健康', '运动'], createdAt: '2025-10-28' },
  { id: 'as12', name: '面试教练', description: '模拟技术面试、行为面试，提供个性化反馈和改进建议。', avatar: '\uD83C\uDFAF', persona: '既像面试官又像导师。严格但给出建设性反馈。', subcategory: '商业', rating: 4.8, conversations: 24700, author: 'career-ai', recommended_model: 'claude-sonnet', tags: ['面试', '求职'], createdAt: '2025-12-05' },
  { id: 'as13', name: 'SQL 专家', description: '复杂 SQL 查询编写、性能优化和数据库设计咨询。', avatar: '\uD83D\uDDC3\uFE0F', persona: '逻辑清晰，善于用图表解释查询执行计划。', subcategory: '编程', rating: 4.7, conversations: 17800, author: 'data-guild', recommended_model: 'deepseek-v3', tags: ['SQL', '数据库'], createdAt: '2025-11-12' },
  { id: 'as14', name: '日语会话', description: '日常日语对话练习、敬语使用指导和JLPT备考。', avatar: '\uD83C\uDDEF\uD83C\uDDF5', persona: '温和耐心，善用情景模拟。会根据水平切换日中双语。', subcategory: '翻译', rating: 4.6, conversations: 19400, author: 'lang-ai', recommended_model: 'gpt-4o', tags: ['日语', '会话'], createdAt: '2025-10-18' },
  { id: 'as15', name: '产品经理助手', description: 'PRD 撰写、用户故事拆分和竞品分析框架指导。', avatar: '\uD83D\uDCCA', persona: '结构化思维，善于提问引导需求澄清。', subcategory: '商业', rating: 4.7, conversations: 13500, author: 'product-ai', recommended_model: 'claude-sonnet', tags: ['产品', 'PRD'], createdAt: '2025-12-08' },
  { id: 'as16', name: '生活规划师', description: '时间管理、习惯养成和个人目标制定的智能辅导。', avatar: '\uD83C\uDF1F', persona: '温暖积极，善于将大目标分解为可执行的小步骤。', subcategory: '生活', rating: 4.5, conversations: 20100, author: 'life-ai', recommended_model: 'gpt-4o', tags: ['规划', '习惯'], createdAt: '2025-11-25' },
  { id: 'as17', name: '学术论文辅导', description: '论文选题、文献综述、研究方法和写作规范全流程指导。', avatar: '\uD83C\uDF93', persona: '学术严谨，熟悉各学科论文规范。', subcategory: '写作', rating: 4.8, conversations: 16200, author: 'edu-ai', recommended_model: 'claude-sonnet', tags: ['论文', '学术'], createdAt: '2025-10-30' },
  { id: 'as18', name: '前端开发顾问', description: 'React/Vue 技术选型、组件设计模式和性能优化建议。', avatar: '\u269B\uFE0F', persona: '实战经验丰富，善于用最佳实践解决具体问题。', subcategory: '编程', rating: 4.9, conversations: 21300, author: 'eng-guild', recommended_model: 'deepseek-v3', tags: ['前端', 'React'], createdAt: '2025-12-12' },
];

// ===========================
// Mock Data — Knowledge Bases (12)
// ===========================

const kbCovers = [
  'https://images.unsplash.com/photo-1687392946857-96c2b7f94b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdyYWRpZW50JTIwbWVzaCUyMHB1cnBsZSUyMGJsdWV8ZW58MXx8fHwxNzcyMDA3NTIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1770169272345-9636d5ef2681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNoaW5lJTIwbGVhcm5pbmclMjBuZXVyYWwlMjBuZXR3b3JrJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzcxOTk0Mjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1679931974865-4a2bb1a2d13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwYWJzdHJhY3QlMjBnZW9tZXRyaWMlMjBkYXJrfGVufDF8fHx8MTc3MjAwNzUyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1766471674240-4755677065f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGtub3dsZWRnZSUyMGxpYnJhcnklMjBib29rcyUyMG1pbmltYWx8ZW58MXx8fHwxNzcyMDA3NTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
];

export const knowledgeBases: KnowledgeBase[] = [
  { id: 'k1', name: 'LLM 工程实战手册', description: '构建生产级 LLM 应用的全面指南，涵盖模型选型、Prompt 工程、向量数据库、部署运维等核心环节。', cover: kbCovers[0], docCount: 248, subcategory: 'AI/ML', author: 'cherry-team', tags: ['LLM', '工程'], createdAt: '2025-12-01' },
  { id: 'k2', name: 'RAG 架构模式', description: '检索增强生成系统的设计模式与最佳实践，包含混合检索、重排序和上下文压缩策略。', cover: kbCovers[1], docCount: 124, subcategory: 'AI/ML', author: 'rag-lab', tags: ['RAG', '架构'], createdAt: '2025-11-15' },
  { id: 'k3', name: '系统设计面试指南', description: '精选系统设计题目、解决方案和分析框架合集，覆盖分布式系统核心概念。', cover: kbCovers[2], docCount: 89, subcategory: '工程', author: 'eng-guild', tags: ['面试', '系统设计'], createdAt: '2025-10-20' },
  { id: 'k4', name: 'Prompt 工程宝典', description: '提示词设计、思维链和多轮技巧的权威指南。', cover: kbCovers[3], docCount: 156, subcategory: 'AI/ML', author: 'prompt-lab', tags: ['Prompt', '技巧'], createdAt: '2025-09-10' },
  { id: 'k5', name: 'React 最佳实践', description: '现代 React 应用开发的架构模式、状态管理和性能优化技巧。', cover: kbCovers[0], docCount: 183, subcategory: '工程', author: 'eng-guild', tags: ['React', '前端'], createdAt: '2025-11-01' },
  { id: 'k6', name: '产品设计方法论', description: '用户研究、原型设计、可用性测试和设计系统构建的系统方法。', cover: kbCovers[1], docCount: 97, subcategory: '设计', author: 'design-ops', tags: ['产品设计', 'UX'], createdAt: '2025-10-05' },
  { id: 'k7', name: '增长运营手册', description: '用户增长策略、数据驱动运营和A/B测试方法论。', cover: kbCovers[2], docCount: 134, subcategory: '运营', author: 'growth-ai', tags: ['增长', '运营'], createdAt: '2025-12-10' },
  { id: 'k8', name: '金融量化入门', description: '量化交易基础、策略开发和风险管理入门教程。', cover: kbCovers[3], docCount: 76, subcategory: '金融', author: 'fin-ai', tags: ['量化', '金融'], createdAt: '2025-11-20' },
  { id: 'k9', name: 'Kubernetes 运维实战', description: '容器编排、集群管理、监控告警和故障排查实战手册。', cover: kbCovers[0], docCount: 211, subcategory: '工程', author: 'cloud-ops', tags: ['K8s', '运维'], createdAt: '2025-10-15' },
  { id: 'k10', name: '数据隐私合规', description: 'GDPR、个人信息保护法等数据隐私法规解读与合规指南。', cover: kbCovers[1], docCount: 68, subcategory: '法律', author: 'legal-ai', tags: ['隐私', '合规'], createdAt: '2025-11-08' },
  { id: 'k11', name: 'AI 产品设计手册', description: 'AI 功能的用户体验设计原则、交互模式和伦理考量。', cover: kbCovers[2], docCount: 112, subcategory: '产品', author: 'product-ai', tags: ['AI', '产品'], createdAt: '2025-12-05' },
  { id: 'k12', name: '临床医学笔记', description: '常见疾病诊疗指南、药物手册和临床案例分析。', cover: kbCovers[3], docCount: 342, subcategory: '医学', author: 'med-team', tags: ['医学', '临床'], createdAt: '2025-10-28' },
];

// ===========================
// Mock Data — MCP Tools (12)
// ===========================

export const mcpTools: MCPTool[] = [
  { id: 'm1', name: '网页抓取器', description: '智能网页内容提取，支持反爬处理和结构化输出。', icon: '\uD83C\uDF10', downloads: 34200, subcategory: '网络', author: 'mcp-official', version: '2.1.0', tags: ['网页', '抓取'], createdAt: '2025-12-01' },
  { id: 'm2', name: 'SQL 执行器', description: '安全的 SQL 查询执行，支持 Schema 检查和结果格式化。', icon: '\uD83D\uDDC3\uFE0F', downloads: 28900, subcategory: '数据', author: 'mcp-official', version: '1.8.3', tags: ['SQL', '数据库'], createdAt: '2025-11-15' },
  { id: 'm3', name: '文件管理器', description: '跨平台文件操作，支持 Glob 模式匹配和流式处理。', icon: '\uD83D\uDCC2', downloads: 22100, subcategory: '文件', author: 'mcp-contrib', version: '1.5.0', tags: ['文件', '系统'], createdAt: '2025-10-20' },
  { id: 'm4', name: 'GitHub API', description: '完整 GitHub API 集成，管理仓库、Issue、PR 和 Actions。', icon: '\u2699\uFE0F', downloads: 41500, subcategory: '开发', author: 'mcp-official', version: '3.0.1', tags: ['GitHub', 'API'], createdAt: '2025-09-10' },
  { id: 'm5', name: '浏览器控制', description: '无头浏览器自动化，适用于测试、抓取和交互操作。', icon: '\uD83D\uDDA5\uFE0F', downloads: 18700, subcategory: '浏览器', author: 'mcp-contrib', version: '1.2.0', tags: ['浏览器', '自动化'], createdAt: '2025-11-01' },
  { id: 'm6', name: '图像分析', description: '视觉模型集成，支持图像描述、OCR 和视觉问答。', icon: '\uD83D\uDC41\uFE0F', downloads: 15400, subcategory: '媒体', author: 'mcp-official', version: '2.0.0', tags: ['视觉', '图像'], createdAt: '2025-10-05' },
  { id: 'm7', name: 'Redis 连接器', description: '高性能 Redis 操作，支持集群模式和数据流处理。', icon: '\uD83D\uDD34', downloads: 19800, subcategory: '数据', author: 'mcp-contrib', version: '1.3.0', tags: ['Redis', '缓存'], createdAt: '2025-12-10' },
  { id: 'm8', name: 'Email 发送器', description: '邮件发送和收取，支持 SMTP/IMAP 协议和模板渲染。', icon: '\u2709\uFE0F', downloads: 16300, subcategory: '通信', author: 'mcp-official', version: '2.2.0', tags: ['邮件', '通信'], createdAt: '2025-11-20' },
  { id: 'm9', name: 'Docker 管理', description: '容器生命周期管理、镜像构建和日志查看。', icon: '\uD83D\uDC33', downloads: 24600, subcategory: '开发', author: 'mcp-official', version: '1.7.0', tags: ['Docker', '容器'], createdAt: '2025-10-15' },
  { id: 'm10', name: 'PDF 处理器', description: 'PDF 解析、合并、拆分和文字提取。', icon: '\uD83D\uDCC4', downloads: 21200, subcategory: '文件', author: 'mcp-contrib', version: '1.4.0', tags: ['PDF', '文档'], createdAt: '2025-11-08' },
  { id: 'm11', name: 'Slack 集成', description: 'Slack 消息发送、频道管理和事件监听。', icon: '\uD83D\uDCAC', downloads: 27800, subcategory: '通信', author: 'mcp-official', version: '2.5.0', tags: ['Slack', '协作'], createdAt: '2025-12-05' },
  { id: 'm12', name: '密钥管理', description: '安全的密钥和证书管理，支持加密解密操作。', icon: '\uD83D\uDD10', downloads: 12400, subcategory: '安全', author: 'mcp-official', version: '1.1.0', tags: ['安全', '密钥'], createdAt: '2025-10-28' },
];

// ===========================
// Mock Data — Skills (10)
// ===========================

export const skills: Skill[] = [
  { id: 's1', name: '代码解释器', description: '在沙箱环境中执行 Python 代码，支持数据可视化。', icon: '\uD83D\uDC0D', usageCount: 89000, subcategory: '代码', author: 'cherry-team', tags: ['Python', '执行'], createdAt: '2025-12-01' },
  { id: 's2', name: '图表生成器', description: '从原始数据创建精美图表和图形，支持多种渲染引擎。', icon: '\uD83D\uDCC8', usageCount: 45600, subcategory: '数据', author: 'viz-team', tags: ['图表', '可视化'], createdAt: '2025-11-15' },
  { id: 's3', name: 'PDF 解析器', description: '解析并提取 PDF 文档中的结构化数据，包括表格和图片。', icon: '\uD83D\uDCC4', usageCount: 38200, subcategory: '文档', author: 'doc-tools', tags: ['PDF', '提取'], createdAt: '2025-10-20' },
  { id: 's4', name: '翻译助手', description: '支持 100+ 语言的高质量翻译，具备上下文感知的术语处理。', icon: '\uD83C\uDF0D', usageCount: 67800, subcategory: '翻译', author: 'cherry-team', tags: ['翻译', '语言'], createdAt: '2025-09-10' },
  { id: 's5', name: '图像生成', description: '基于文本描述生成高质量图像，支持多种风格。', icon: '\uD83C\uDFA8', usageCount: 72300, subcategory: '图像', author: 'creative-lab', tags: ['AI绘画', '生成'], createdAt: '2025-11-01' },
  { id: 's6', name: '语音转写', description: '高精度语音识别和转写，支持多语言和说话人分离。', icon: '\uD83C\uDFA4', usageCount: 31500, subcategory: '音频', author: 'audio-lab', tags: ['语音', '转写'], createdAt: '2025-10-05' },
  { id: 's7', name: 'LaTeX 渲染', description: '数学公式和学术文档的 LaTeX 渲染和预览。', icon: '\uD83D\uDCD0', usageCount: 24800, subcategory: '文档', author: 'doc-tools', tags: ['LaTeX', '公式'], createdAt: '2025-12-10' },
  { id: 's8', name: 'JSON/XML 转换', description: '数据格式转换、校验和美化，支持 JSON/XML/YAML/CSV。', icon: '\uD83D\uDD04', usageCount: 41200, subcategory: '数据', author: 'tools-team', tags: ['格式', '转换'], createdAt: '2025-11-20' },
  { id: 's9', name: '代码格式化', description: '多语言代码格式化和Lint检查，支持自定义规则。', icon: '\u2728', usageCount: 35600, subcategory: '代码', author: 'eng-guild', tags: ['格式化', 'Lint'], createdAt: '2025-10-15' },
  { id: 's10', name: '视频摘要', description: '视频内容理解和关键帧提取，自动生成文字摘要。', icon: '\uD83C\uDFAC', usageCount: 18900, subcategory: '视频', author: 'media-ai', tags: ['视频', '摘要'], createdAt: '2025-11-08' },
];

// ===========================
// Mock Data — Plugins (10)
// ===========================

export const plugins: Plugin[] = [
  { id: 'p1', name: '记忆管理器', description: '持久化对话记忆，支持语义搜索和自动摘要。', icon: '\uD83E\uDDE0', downloads: 52300, subcategory: '记忆', author: 'cherry-team', version: '2.3.0', tags: ['记忆', '上下文'], createdAt: '2025-12-01' },
  { id: 'p2', name: '语音输入输出', description: '语音转文字和文字转语音集成，支持多种语音模型。', icon: '\uD83C\uDF99\uFE0F', downloads: 31200, subcategory: '集成', author: 'audio-lab', version: '1.6.0', tags: ['语音', '音频'], createdAt: '2025-11-15' },
  { id: 'p3', name: '主题工作室', description: '自定义主题创建，支持实时预览和社区主题市场。', icon: '\uD83C\uDFA8', downloads: 28900, subcategory: '界面', author: 'cherry-team', version: '1.4.0', tags: ['主题', 'UI'], createdAt: '2025-10-20' },
  { id: 'p4', name: '导出套件', description: '将对话导出为 Markdown、PDF、HTML 或结构化 JSON。', icon: '\uD83D\uDCE4', downloads: 19800, subcategory: '导出', author: 'tools-team', version: '2.0.1', tags: ['导出', '格式'], createdAt: '2025-09-10' },
  { id: 'p5', name: '团队协作', description: '多人实时协作编辑、评论和任务分配。', icon: '\uD83D\uDC65', downloads: 23400, subcategory: '协作', author: 'cherry-team', version: '1.8.0', tags: ['协作', '团队'], createdAt: '2025-11-01' },
  { id: 'p6', name: '数据看板', description: '对话数据统计、使用分析和可视化仪表盘。', icon: '\uD83D\uDCCA', downloads: 17600, subcategory: '分析', author: 'analytics-team', version: '1.2.0', tags: ['分析', '统计'], createdAt: '2025-10-05' },
  { id: 'p7', name: '安全审计日志', description: '操作审计日志、敏感数据脱敏和访问控制。', icon: '\uD83D\uDD12', downloads: 14200, subcategory: '安全', author: 'sec-team', version: '1.5.0', tags: ['安全', '审计'], createdAt: '2025-12-10' },
  { id: 'p8', name: '快捷指令', description: '自定义快捷键和指令宏，提升操作效率。', icon: '\u26A1', downloads: 26800, subcategory: '界面', author: 'cherry-team', version: '2.1.0', tags: ['快捷键', '效率'], createdAt: '2025-11-20' },
  { id: 'p9', name: 'Webhook 集成', description: '灵活的 Webhook 配置，支持事件触发和外部系统集成。', icon: '\uD83D\uDD17', downloads: 15900, subcategory: '集成', author: 'tools-team', version: '1.3.0', tags: ['Webhook', '集成'], createdAt: '2025-10-15' },
  { id: 'p10', name: '多语言界面', description: '界面国际化支持，覆盖 20+ 语言。', icon: '\uD83C\uDF10', downloads: 21100, subcategory: '界面', author: 'cherry-team', version: '1.7.0', tags: ['i18n', '多语言'], createdAt: '2025-11-08' },
];

// ===========================
// Category total counts (simulated)
// ===========================

export const categoryTotalCounts: Record<ResourceCategory, number> = {
  agents: 12847,
  assistants: 18623,
  knowledge: 8456,
  mcp: 3291,
  skills: 5734,
  plugins: 2168,
};

// ===========================
// Helpers
// ===========================

export function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
