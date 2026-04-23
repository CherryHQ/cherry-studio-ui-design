import type { KnowledgeBase } from '@/features/knowledge/KnowledgeSidebar';
import type { DataSource } from '@/features/knowledge/DataSourceList';

export const MOCK_KNOWLEDGE_BASE_LIST: KnowledgeBase[] = [
  { id: 'kb1', name: 'AI 技术文档', icon: '🤖', colorClass: 'bg-accent-violet-muted', docCount: 10, status: 'ready', group: '工作', updatedAt: '2 小时前' },
  { id: 'kb2', name: '产品设计规范', icon: '🎨', colorClass: 'bg-accent-pink-muted', docCount: 5, status: 'ready', group: '工作', updatedAt: '昨天' },
  { id: 'kb3', name: 'API 接口文档', icon: '📡', colorClass: 'bg-accent-blue-muted', docCount: 6, status: 'indexing', group: '工作', updatedAt: '30 分钟前' },
  { id: 'kb4', name: '竞品分析报告', icon: '📊', colorClass: 'bg-accent-amber-muted', docCount: 4, status: 'ready', group: '工作', updatedAt: '3 天前' },
  { id: 'kb5', name: '阅读笔记', icon: '📚', colorClass: 'bg-accent-emerald-muted', docCount: 7, status: 'ready', group: '个人', updatedAt: '1 天前' },
  { id: 'kb6', name: '旅行攻略', icon: '✈️', colorClass: 'bg-accent-cyan-muted', docCount: 3, status: 'ready', group: '个人', updatedAt: '1 周前' },
  { id: 'kb7', name: '食谱收藏', icon: '🍳', colorClass: 'bg-accent-orange-muted', docCount: 4, status: 'error', group: '个人', updatedAt: '5 天前' },
  { id: 'kb8', name: 'Cherry Studio V2', icon: '🍒', colorClass: 'bg-destructive/12', docCount: 8, status: 'indexing', group: '项目', updatedAt: '1 小时前' },
  { id: 'kb9', name: '机器学习论文集', icon: '🧠', colorClass: 'bg-accent-purple-muted', docCount: 6, status: 'ready', group: '项目', updatedAt: '2 天前' },
];

export const MOCK_DATA_SOURCES: Record<string, DataSource[]> = {
  kb1: [
    { id: 'd1', name: 'RAG 技术指南', type: 'file', format: 'pdf', size: '2.4 MB', status: 'success', updatedAt: '2 小时前', chunks: 48 },
    { id: 'd2', name: '向量数据库原理', type: 'file', format: 'md', size: '156 KB', status: 'success', updatedAt: '3 小时前', chunks: 12 },
    { id: 'd3', name: '检索策略对比分析', type: 'file', format: 'docx', size: '890 KB', status: 'success', updatedAt: '昨天', chunks: 24 },
    { id: 'd4', name: 'LLM 部署手册', type: 'file', format: 'pdf', size: '5.1 MB', status: 'chunking', updatedAt: '30 分钟前', chunks: 0 },
    { id: 'd5', name: '知识库最佳实践', type: 'note', size: '45 KB', status: 'success', updatedAt: '1 天前', chunks: 8 },
    { id: 'd6', name: 'AI 研究论文目录', type: 'folder', size: '12.3 MB', status: 'success', updatedAt: '2 天前', chunks: 156 },
    { id: 'd7', name: 'https://docs.anthropic.com', type: 'url', status: 'success', updatedAt: '3 天前', chunks: 34, url: 'https://docs.anthropic.com' },
    { id: 'd8', name: 'OpenAI 文档站', type: 'website', status: 'embedding', updatedAt: '10 分钟前', chunks: 0, url: 'https://platform.openai.com/docs' },
    { id: 'd9', name: 'Embedding 模型评测', type: 'file', format: 'xlsx', size: '340 KB', status: 'success', updatedAt: '4 天前', chunks: 6 },
    { id: 'd10', name: '多模态 AI 综述', type: 'file', format: 'pdf', size: '3.8 MB', status: 'error', errorMsg: 'PDF 解析失败：文件已加密或损坏，无法提取文本内容', updatedAt: '1 天前', chunks: 0 },
  ],
  kb2: [
    { id: 'd20', name: '设计系统规范 v3', type: 'file', format: 'pdf', size: '8.2 MB', status: 'success', updatedAt: '昨天', chunks: 92 },
    { id: 'd21', name: 'UI 组件文档', type: 'url', status: 'success', updatedAt: '2 天前', chunks: 45, url: 'https://design.example.com' },
    { id: 'd22', name: '品牌指南', type: 'file', format: 'pdf', size: '4.5 MB', status: 'success', updatedAt: '1 周前', chunks: 38 },
    { id: 'd23', name: '交互设计原则', type: 'note', size: '32 KB', status: 'success', updatedAt: '3 天前', chunks: 6 },
    { id: 'd24', name: '色彩系统参考', type: 'file', format: 'md', size: '78 KB', status: 'success', updatedAt: '5 天前', chunks: 4 },
  ],
  kb3: [
    { id: 'd30', name: 'REST API 规范', type: 'file', format: 'md', size: '245 KB', status: 'success', updatedAt: '1 小时前', chunks: 18 },
    { id: 'd31', name: 'GraphQL Schema', type: 'file', format: 'json', size: '120 KB', status: 'success', updatedAt: '2 小时前', chunks: 8 },
    { id: 'd32', name: 'Swagger 文档', type: 'url', status: 'preprocessing', updatedAt: '30 分钟前', chunks: 0, url: 'https://api.example.com/docs' },
    { id: 'd33', name: '认证授权说明', type: 'file', format: 'pdf', size: '1.1 MB', status: 'success', updatedAt: '3 天前', chunks: 14 },
    { id: 'd34', name: 'WebSocket 协议', type: 'file', format: 'md', size: '89 KB', status: 'success', updatedAt: '4 天前', chunks: 6 },
    { id: 'd35', name: '错误码手册', type: 'file', format: 'xlsx', size: '56 KB', status: 'embedding', updatedAt: '1 小时前', chunks: 0 },
  ],
  kb4: [
    { id: 'd40', name: 'Notion AI 分析', type: 'file', format: 'pdf', size: '3.2 MB', status: 'success', updatedAt: '3 天前', chunks: 28 },
    { id: 'd41', name: 'Obsidian 功能对比', type: 'file', format: 'docx', size: '1.8 MB', status: 'success', updatedAt: '5 天前', chunks: 16 },
    { id: 'd42', name: '市场调研报告 Q4', type: 'file', format: 'pdf', size: '6.7 MB', status: 'success', updatedAt: '1 周前', chunks: 52 },
    { id: 'd43', name: '用户反馈汇总', type: 'note', size: '67 KB', status: 'success', updatedAt: '4 天前', chunks: 10 },
  ],
  kb5: [
    { id: 'd50', name: '深度学习花书笔记', type: 'note', size: '128 KB', status: 'success', updatedAt: '1 天前', chunks: 22 },
    { id: 'd51', name: 'Transformer 论文精读', type: 'note', size: '85 KB', status: 'success', updatedAt: '2 天前', chunks: 14 },
    { id: 'd52', name: '强化学习导论', type: 'file', format: 'pdf', size: '4.2 MB', status: 'success', updatedAt: '3 天前', chunks: 36 },
    { id: 'd53', name: 'Python 设计模式', type: 'file', format: 'md', size: '210 KB', status: 'success', updatedAt: '5 天前', chunks: 18 },
    { id: 'd54', name: '数据结构与算法笔记', type: 'note', size: '95 KB', status: 'success', updatedAt: '1 周前', chunks: 12 },
    { id: 'd55', name: '系统设计面试指南', type: 'file', format: 'pdf', size: '2.8 MB', status: 'success', updatedAt: '1 周前', chunks: 24 },
    { id: 'd56', name: 'LangChain 实战', type: 'url', status: 'success', updatedAt: '2 天前', chunks: 20, url: 'https://langchain.readthedocs.io' },
  ],
  kb6: [
    { id: 'd60', name: '日本关西攻略', type: 'note', size: '45 KB', status: 'success', updatedAt: '1 周前', chunks: 8 },
    { id: 'd61', name: '欧洲自驾路线', type: 'file', format: 'pdf', size: '2.1 MB', status: 'success', updatedAt: '2 周前', chunks: 18 },
    { id: 'd62', name: '东南亚美食地图', type: 'note', size: '32 KB', status: 'success', updatedAt: '3 周前', chunks: 6 },
  ],
  kb7: [
    { id: 'd70', name: '中式家常菜', type: 'note', size: '78 KB', status: 'success', updatedAt: '5 天前', chunks: 14 },
    { id: 'd71', name: '烘焙入门指南', type: 'file', format: 'pdf', size: '3.4 MB', status: 'error', errorMsg: '文件大小超出限制 (max: 2 MB)，请压缩后重新上传', updatedAt: '1 周前', chunks: 0 },
    { id: 'd72', name: '日料制作教程', type: 'url', status: 'success', updatedAt: '2 周前', chunks: 22, url: 'https://cooking.example.com/japanese' },
    { id: 'd73', name: '健康饮食计划', type: 'note', size: '25 KB', status: 'success', updatedAt: '3 天前', chunks: 4 },
  ],
  kb8: [
    { id: 'd80', name: '产品需求文档 PRD', type: 'file', format: 'docx', size: '2.8 MB', status: 'success', updatedAt: '1 小时前', chunks: 32 },
    { id: 'd81', name: '技术方案设计', type: 'file', format: 'md', size: '180 KB', status: 'success', updatedAt: '3 小时前', chunks: 16 },
    { id: 'd82', name: '测试用例集', type: 'file', format: 'xlsx', size: '450 KB', status: 'success', updatedAt: '昨天', chunks: 8 },
    { id: 'd83', name: '发布日志', type: 'note', size: '56 KB', status: 'success', updatedAt: '2 天前', chunks: 10 },
    { id: 'd84', name: '架构设计文档', type: 'file', format: 'pdf', size: '5.6 MB', status: 'chunking', updatedAt: '30 分钟前', chunks: 0 },
    { id: 'd85', name: '用户手册', type: 'website', status: 'success', updatedAt: '3 天前', chunks: 42, url: 'https://docs.cherrystudio.dev' },
    { id: 'd86', name: 'CI/CD 配置', type: 'file', format: 'yaml', size: '12 KB', status: 'success', updatedAt: '4 天前', chunks: 2 },
    { id: 'd87', name: '代码审查指南', type: 'file', format: 'md', size: '95 KB', status: 'success', updatedAt: '2 小时前', chunks: 0 },
  ],
  kb9: [
    { id: 'd90', name: 'Attention Is All You Need', type: 'file', format: 'pdf', size: '1.2 MB', status: 'success', updatedAt: '2 天前', chunks: 18 },
    { id: 'd91', name: 'BERT 论文精读', type: 'file', format: 'pdf', size: '980 KB', status: 'success', updatedAt: '3 天前', chunks: 14 },
    { id: 'd92', name: 'GPT 系列论文', type: 'folder', size: '8.5 MB', status: 'success', updatedAt: '5 天前', chunks: 86 },
    { id: 'd93', name: 'Diffusion Models 综述', type: 'file', format: 'pdf', size: '4.1 MB', status: 'success', updatedAt: '1 周前', chunks: 32 },
    { id: 'd94', name: 'RL from Human Feedback', type: 'file', format: 'pdf', size: '1.5 MB', status: 'success', updatedAt: '1 周前', chunks: 20 },
    { id: 'd95', name: 'Papers With Code', type: 'website', status: 'success', updatedAt: '4 天前', chunks: 56, url: 'https://paperswithcode.com' },
  ],
};
