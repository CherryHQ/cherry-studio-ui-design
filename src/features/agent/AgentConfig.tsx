import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft, Save, Settings, FileText,
  Wrench, SlidersHorizontal, ChevronRight, ChevronDown,
  X, Check, Plus, Trash2,
  RefreshCw, CheckCircle2, Circle, AlertTriangle,
  Search, ExternalLink, Power,
  Terminal, FileEdit, Globe, Code2, Database, FolderSearch,
  Image, GitBranch, FileJson, Network, Lock,
  Mail, Calendar, Cpu, HardDrive, Clipboard, Eye,
  Download, MessageSquare, Zap, Bug,
  Layers, Sparkles, BookOpen, FolderOpen,
} from 'lucide-react';
import { Button, Input, Slider, Textarea, Popover, PopoverTrigger, PopoverContent, EmptyState, SearchInput, Typography, Switch, Checkbox, Badge } from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import type { ResourceItem, MCPServerStatus } from '@/app/types';
import { PromptSection } from '@/features/assistant/sections/PromptSection';
import { AVATAR_OPTIONS } from '@/app/config/constants';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { ASSISTANT_MODELS } from '@/app/config/models';

interface Props { resource: ResourceItem; onBack: () => void }
type Section = 'basic' | 'prompt' | 'knowledge' | 'toolchain' | 'advanced';
const sections: { id: Section; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'basic', label: '基础设置', desc: '名称、头像、模型参数', icon: Settings },
  { id: 'prompt', label: '提示词', desc: '系统提示词、变量、样本', icon: FileText },
  { id: 'knowledge', label: '知识库', desc: '关联知识库、检索策略', icon: BookOpen },
  { id: 'toolchain', label: '工具', desc: 'MCP 服务与工具配置', icon: Wrench },
  { id: 'advanced', label: '高级设置', desc: '执行限制、运行参数', icon: SlidersHorizontal },
];


const TAG_PRESETS: { tag: string; color: string }[] = [
  { tag: '编程', color: 'bg-accent-cyan-muted text-accent-cyan border-accent-cyan/20' },
  { tag: '数据分析', color: 'bg-accent-indigo-muted text-accent-indigo border-accent-indigo/20' },
  { tag: '写作', color: 'bg-warning-muted text-warning border-warning/20' },
  { tag: '工具', color: 'bg-accent-orange-muted text-accent-orange border-accent-orange/20' },
  { tag: '自动化', color: 'bg-muted text-foreground border-border/50' },
  { tag: '研究', color: 'bg-accent-violet-muted text-accent-violet border-accent-violet/20' },
];
function getTagColor(tag: string): string {
  return TAG_PRESETS.find(p => p.tag === tag)?.color || 'bg-muted text-foreground border-border/50';
}

// ===========================
// Main Component
// ===========================
export function AgentConfig({ resource, onBack }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border/15 flex-shrink-0">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-muted-foreground/40"><ArrowLeft size={14} /></Button>
        <div className="flex items-center gap-1 text-sm text-muted-foreground/50">
          <span className="hover:text-foreground cursor-pointer transition-colors" onClick={onBack}>{"资源库"}</span>
          <ChevronRight size={9} /><span className="text-foreground">{resource.name}</span>
          <span className="text-muted-foreground/50 ml-1">{"(智能体)"}</span>
        </div>
        <div className="flex-1" />
        <AnimatePresence>
          {saved && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs text-cherry-primary">{"已保存"}</motion.span>}
        </AnimatePresence>
        <Button variant="outline" size="sm" onClick={onBack} className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 border-border/20">{"取消"}</Button>
        <Button size="sm" onClick={handleSave} className="active:scale-[0.97]"><Save size={10} /><span>{"保存"}</span></Button>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-[180px] flex-shrink-0 border-r border-border/15 p-3 overflow-y-auto">
          {sections.map(s => {
            const active = activeSection === s.id;
            const Icon = s.icon;
            return (
              <Button variant="ghost" key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full justify-start gap-2.5 px-3 py-2.5 font-normal mb-0.5 ${active ? 'bg-accent/50 text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/50'}`}>
                <Icon size={14} strokeWidth={1.5} className={`flex-shrink-0 ${active ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm">{s.label}</div>
                  <div className={`text-xs truncate ${active ? 'text-muted-foreground/50' : 'text-muted-foreground/60'}`}>{s.desc}</div>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeSection === 'basic' && <AgentBasicSection resource={resource} />}
              {activeSection === 'prompt' && <AgentPromptSection />}
              {activeSection === 'knowledge' && <KnowledgeBaseSection />}
              {activeSection === 'toolchain' && <ToolchainSection onExplore={onBack} />}
              {activeSection === 'advanced' && <AgentAdvancedSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ===========================
// Model Selector
// ===========================
function ModelSelector({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint: string }) {
  const [open, setOpen] = useState(false);
  const selected = ASSISTANT_MODELS.find(m => m.id === value);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-muted-foreground/60">{label}</label>
        <span className="text-xs text-muted-foreground/50">{hint}</span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between px-3 py-2 border-border/20 bg-accent/15 text-sm text-foreground hover:border-border/40">
            <span className="truncate">{selected?.name || value}</span><ChevronDown size={10} className="text-muted-foreground/40 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-[480px]">
          <ModelPickerPanel
            selectedModels={[value]}
            onSelectModel={onChange}
            multiModel={false}
            onToggleMultiModel={() => {}}
            onClose={() => setOpen(false)}
            showMultiModelToggle={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ===========================
// Agent Basic Section
// ===========================
function AgentBasicSection({ resource }: { resource: ResourceItem }) {
  const [name, setName] = useState(resource.name);
  const [description, setDescription] = useState(resource.description);
  const [avatar, setAvatar] = useState(resource.avatar);
  const [tags, setTags] = useState<string[]>(resource.tags || ['工具']);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [planningModel, setPlanningModel] = useState('claude-4-opus');
  const [regularModel, setRegularModel] = useState('gpt-41');
  const [fastModel, setFastModel] = useState('gemini-25-flash');
  const addTag = (tag: string) => { const t = tag.trim(); if (t && !tags.includes(t)) setTags(prev => [...prev, t]); setTagInput(''); };
  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));
  const togglePresetTag = (tag: string) => { if (tags.includes(tag)) removeTag(tag); else setTags(prev => [...prev, tag]); };
  return (
    <div className="max-w-lg space-y-5">
      <div><Typography variant="subtitle" className="mb-1">{"基础设置"}</Typography><p className="text-xs text-muted-foreground/60">{"配置智能体的身份信息和模型"}</p></div>
      <FieldGroup label="头像"><div className="flex items-center gap-2"><div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center text-xl">{avatar}</div><div className="flex flex-wrap gap-1">{AVATAR_OPTIONS.map(a => (<Button variant="ghost" size="icon-xs" key={a} onClick={() => setAvatar(a)} className={`text-sm ${avatar === a ? 'bg-accent ring-1 ring-primary/20' : ''}`}>{a}</Button>))}</div></div></FieldGroup>
      <FieldGroup label="名称"><Input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border-border/20 bg-accent/15 text-sm text-foreground focus-visible:border-border/40 focus-visible:ring-0 shadow-none" /></FieldGroup>
      <div className="space-y-3"><div className="flex items-center gap-2 mb-1"><span className="text-sm text-muted-foreground/60">{"模型配置"}</span><div className="flex-1 h-px bg-border/30" /></div><ModelSelector label="规划模型" value={planningModel} onChange={setPlanningModel} hint="负责任务拆解和决策" /><ModelSelector label="常规模型" value={regularModel} onChange={setRegularModel} hint="负责主要推理和执行" /><ModelSelector label="快速模型" value={fastModel} onChange={setFastModel} hint="负责简单判断和格式化" /></div>
      <FieldGroup label="简介"><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="input-accent resize-none" /></FieldGroup>
      <FieldGroup label="标签">
        <div className="min-h-[36px] px-2.5 py-2 rounded-xl border border-border/20 bg-accent/15 flex flex-wrap items-center gap-1.5">
          {tags.map(tag => (<Badge key={tag} variant="outline" className={`gap-1 px-1.5 py-[2px] rounded-md ${getTagColor(tag)}`}>{tag}<Button variant="ghost" size="icon-xs" onClick={() => removeTag(tag)} className="ml-0.5 text-current opacity-40 hover:opacity-100 hover:bg-transparent"><X size={7} /></Button></Badge>))}
          <Input ref={tagInputRef} value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); addTag(tagInput); } if (e.key === 'Backspace' && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1]); }} placeholder={tags.length === 0 ? '输入标签，回车添加' : ''} className="flex-1 min-w-[80px] h-auto border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent text-sm text-foreground placeholder:text-muted-foreground/60 py-0 px-0 rounded-none" />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">{TAG_PRESETS.map(preset => { const selected = tags.includes(preset.tag); return (<Button variant="outline" size="xs" key={preset.tag} onClick={() => togglePresetTag(preset.tag)} className={`px-1.5 text-xs gap-0.5 ${preset.color} ${selected ? 'ring-1 ring-ring/10' : 'opacity-50 hover:opacity-80'}`}>{selected && <Check size={7} className="text-current" />}{preset.tag}</Button>); })}</div>
      </FieldGroup>
    </div>
  );
}

function AgentPromptSection() { return <div className="space-y-6"><PromptSection hideFewShot /></div>; }

// ===========================
// Toolchain Section
// ===========================
interface ToolItem { id: string; name: string; desc: string; icon: React.ElementType; enabled: boolean; category: string }
interface MCPToolItem { id: string; name: string; desc: string; enabled: boolean }
interface MCPServerLocal {
  id: string; name: string; desc: string; author: string; url: string;
  status: MCPServerStatus; tags: string[];
  tools: MCPToolItem[];
}
interface SkillItem { id: string; name: string; desc: string; icon: React.ElementType; enabled: boolean; tags: string[] }
interface MCPCatalogItem { id: string; name: string; desc: string; author: string; url: string; tags: string[]; tools: MCPToolItem[] }
interface SkillCatalogItem { id: string; name: string; desc: string; icon: React.ElementType; tags: string[] }
type ToolchainTab = 'tools' | 'mcp' | 'skills';

const TOOL_CATEGORIES = ['执行环境', '计算资源', '文件操作', '网络与数据', '开发工具', '系统集成', '内容处理'] as const;

const ALL_TOOLS_CATALOG: ToolItem[] = [
  { id: 'bash', name: 'Shell 终端', desc: '执行 Bash/Zsh 命令', icon: Terminal, enabled: true, category: '执行环境' },
  { id: 'code-exec', name: '代码执行', desc: 'Python/Node.js 沙箱', icon: Code2, enabled: true, category: '执行环境' },
  { id: 'python-exec', name: 'Python 执行', desc: 'Python 运行环境', icon: Code2, enabled: true, category: '执行环境' },
  { id: 'node-exec', name: 'Node.js 执行', desc: 'Node.js 运行环境', icon: Code2, enabled: true, category: '执行环境' },
  { id: 'cpu-compute', name: '计算资源', desc: 'GPU/CPU 调度', icon: Cpu, enabled: true, category: '计算资源' },
  { id: 'sandbox', name: '隔离沙箱', desc: '安全隔离执行环境', icon: Lock, enabled: true, category: '计算资源' },
  { id: 'file-edit', name: '文件编辑', desc: '读写文件内容', icon: FileEdit, enabled: true, category: '文件操作' },
  { id: 'file-search', name: '文件检索', desc: '全局搜索文件', icon: FolderSearch, enabled: true, category: '文件操作' },
  { id: 'file-manage', name: '目录管理', desc: '创建/移动/删除', icon: HardDrive, enabled: true, category: '文件操作' },
  { id: 'file-json', name: 'JSON 处理', desc: '解析/转换/校验', icon: FileJson, enabled: true, category: '文件操作' },
  { id: 'file-download', name: '文件下载', desc: '从 URL 获取文件', icon: Download, enabled: true, category: '文件操作' },
  { id: 'browser', name: '浏览器', desc: '访问网页和截图', icon: Globe, enabled: true, category: '网络与数据' },
  { id: 'http-req', name: 'HTTP 请求', desc: 'REST API 调用', icon: Network, enabled: true, category: '网络与数据' },
  { id: 'database', name: '数据库', desc: 'SQL/NoSQL 查询', icon: Database, enabled: true, category: '网络与数据' },
  { id: 'web-search', name: '联网搜索', desc: '实时搜索引擎', icon: Search, enabled: true, category: '网络与数据' },
  { id: 'email', name: '邮件发送', desc: 'SMTP 邮件通知', icon: Mail, enabled: true, category: '网络与数据' },
  { id: 'git-ops', name: 'Git 操作', desc: '版本控制和提交', icon: GitBranch, enabled: true, category: '开发工具' },
  { id: 'debugger', name: '调试器', desc: '断点和变量检查', icon: Bug, enabled: true, category: '开发工具' },
  { id: 'linter', name: '代码检查', desc: 'Lint 和格式化', icon: Eye, enabled: true, category: '开发工具' },
  { id: 'test-runner', name: '测试运行', desc: '自动化测试执行', icon: Zap, enabled: true, category: '开发工具' },
  { id: 'browser-preview', name: '浏览器预览', desc: '实时预览网页', icon: Globe, enabled: true, category: '开发工具' },
  { id: 'clipboard', name: '剪贴板', desc: '读写系统剪贴板', icon: Clipboard, enabled: true, category: '系统集成' },
  { id: 'scheduler', name: '定时任务', desc: 'Cron 调度执行', icon: Calendar, enabled: true, category: '系统集成' },
  { id: 'notification', name: '消息通知', desc: '系统/Webhook 通知', icon: MessageSquare, enabled: true, category: '系统集成' },
  { id: 'image-gen', name: '图像生成', desc: 'AI 绘图和编辑', icon: Image, enabled: true, category: '内容处理' },
  { id: 'doc-parse', name: '文档解析', desc: 'PDF/Word 提取', icon: FileText, enabled: true, category: '内容处理' },
  { id: 'data-viz', name: '数据可视化', desc: '图表和报表生成', icon: Layers, enabled: true, category: '内容处理' },
];

const MCP_TAGS = ['开发', '数据', '部署', '通信', '搜索', '设计', '存储'] as const;
const ALL_MCP_CATALOG: MCPCatalogItem[] = [
  { id: 'mcp-1', name: 'GitHub', desc: '代码仓库与 PR 管理', author: 'github', url: 'https://mcp.github.com', tags: ['开发'],
    tools: [{ id: 'gh-1', name: 'create_pull_request', desc: '创建 Pull Request', enabled: true }, { id: 'gh-2', name: 'list_issues', desc: '列出 Issues', enabled: true }, { id: 'gh-3', name: 'search_code', desc: '搜索代码', enabled: true }, { id: 'gh-4', name: 'get_file_contents', desc: '获取文件内容', enabled: true }, { id: 'gh-5', name: 'create_branch', desc: '创建分支', enabled: true }] },
  { id: 'mcp-2', name: 'Filesystem', desc: '本地文件系统访问', author: 'modelcontextprotocol', url: 'npx @mcp/filesystem', tags: ['存储'],
    tools: [{ id: 'fs-1', name: 'read_file', desc: '读取文件', enabled: true }, { id: 'fs-2', name: 'write_file', desc: '写入文件', enabled: true }, { id: 'fs-3', name: 'list_directory', desc: '列出目录', enabled: true }] },
  { id: 'mcp-3', name: 'Docker', desc: '容器管理与部署', author: 'docker', url: 'https://mcp.docker.com', tags: ['部署'],
    tools: [{ id: 'dk-1', name: 'run_container', desc: '运行容器', enabled: true }, { id: 'dk-2', name: 'build_image', desc: '构建镜像', enabled: true }, { id: 'dk-3', name: 'list_containers', desc: '列出容器', enabled: true }] },
  { id: 'mcp-4', name: 'PostgreSQL', desc: '关系型数据库操作', author: 'postgresql', url: 'https://mcp.postgresql.org', tags: ['数据', '存储'],
    tools: [{ id: 'pg-1', name: 'query', desc: '执行 SQL 查询', enabled: true }, { id: 'pg-2', name: 'list_tables', desc: '列出数据表', enabled: true }, { id: 'pg-3', name: 'describe_table', desc: '表结构描述', enabled: true }, { id: 'pg-4', name: 'insert_data', desc: '插入数据', enabled: true }] },
  { id: 'mcp-5', name: 'Redis', desc: '缓存与消息队列', author: 'redis', url: 'https://mcp.redis.io', tags: ['数据', '存储'],
    tools: [{ id: 'rd-1', name: 'get_key', desc: '获取键值', enabled: true }, { id: 'rd-2', name: 'set_key', desc: '设置键值', enabled: true }, { id: 'rd-3', name: 'publish', desc: '发布消息', enabled: true }] },
  { id: 'mcp-6', name: 'Tavily Search', desc: 'AI 搜索引擎', author: 'tavily', url: 'https://mcp.tavily.com', tags: ['搜索'],
    tools: [{ id: 'tv-1', name: 'search', desc: '执行搜索', enabled: true }, { id: 'tv-2', name: 'extract', desc: '内容提取', enabled: true }] },
  { id: 'mcp-7', name: 'Notion', desc: '知识库与文档协作', author: 'notion', url: 'https://mcp.notion.so', tags: ['通信', '存储'],
    tools: [{ id: 'nt-1', name: 'search_pages', desc: '搜索页面', enabled: true }, { id: 'nt-2', name: 'create_page', desc: '创建页面', enabled: true }, { id: 'nt-3', name: 'update_block', desc: '更新块', enabled: true }, { id: 'nt-4', name: 'query_database', desc: '查询数据库', enabled: true }] },
  { id: 'mcp-8', name: 'Slack', desc: '团队消息通知', author: 'slack', url: 'https://mcp.slack.com', tags: ['通信'],
    tools: [{ id: 'sl-1', name: 'send_message', desc: '发送消息', enabled: true }, { id: 'sl-2', name: 'list_channels', desc: '列出频道', enabled: true }, { id: 'sl-3', name: 'search_messages', desc: '搜索消息', enabled: true }] },
  { id: 'mcp-9', name: 'Linear', desc: '项目管理工具', author: 'linear', url: 'https://mcp.linear.app', tags: ['开发'],
    tools: [{ id: 'ln-1', name: 'create_issue', desc: '创建任务', enabled: true }, { id: 'ln-2', name: 'list_issues', desc: '列出任务', enabled: true }, { id: 'ln-3', name: 'update_issue', desc: '更新任务', enabled: true }] },
  { id: 'mcp-10', name: 'Jupyter', desc: 'Notebook 执行环境', author: 'jupyter', url: 'https://mcp.jupyter.org', tags: ['开发', '数据'],
    tools: [{ id: 'jp-1', name: 'execute_cell', desc: '执行单元格', enabled: true }, { id: 'jp-2', name: 'create_notebook', desc: '创建 Notebook', enabled: true }] },
  { id: 'mcp-11', name: 'Vercel', desc: '部署与 Serverless', author: 'vercel', url: 'https://mcp.vercel.com', tags: ['部署'],
    tools: [{ id: 'vc-1', name: 'deploy', desc: '触发部署', enabled: true }, { id: 'vc-2', name: 'list_deployments', desc: '列出部署', enabled: true }] },
  { id: 'mcp-12', name: 'Supabase', desc: 'BaaS 数据库服务', author: 'supabase', url: 'https://mcp.supabase.com', tags: ['数据', '存储'],
    tools: [{ id: 'sb-1', name: 'query', desc: '查询数据', enabled: true }, { id: 'sb-2', name: 'insert', desc: '插入数据', enabled: true }, { id: 'sb-3', name: 'auth_user', desc: '用户认证', enabled: true }] },
  { id: 'mcp-13', name: 'Stripe', desc: '支付与订阅管理', author: 'stripe', url: 'https://mcp.stripe.com', tags: ['数据'],
    tools: [{ id: 'st-1', name: 'create_payment', desc: '创建支付', enabled: true }, { id: 'st-2', name: 'list_invoices', desc: '列出账单', enabled: true }] },
  { id: 'mcp-14', name: 'Figma', desc: '设计文件与资源', author: 'figma', url: 'https://mcp.figma.com', tags: ['设计'],
    tools: [{ id: 'fg-1', name: 'get_file', desc: '获取设计文件', enabled: true }, { id: 'fg-2', name: 'export_assets', desc: '导出资源', enabled: true }, { id: 'fg-3', name: 'list_components', desc: '列出组件', enabled: true }] },
  { id: 'mcp-15', name: 'Airtable', desc: '电子表格数据库', author: 'airtable', url: 'https://mcp.airtable.com', tags: ['数据', '存储'],
    tools: [{ id: 'at-1', name: 'list_records', desc: '列出记录', enabled: true }, { id: 'at-2', name: 'create_record', desc: '创建记录', enabled: true }] },
];

const SKILL_TAGS = ['代码', '文档', '数据', '通信', '媒体', '搜索'] as const;
const ALL_SKILLS_CATALOG: SkillCatalogItem[] = [
  { id: 'sk-1', name: '代码生成', desc: '根据需求生成高质量代码', icon: Code2, tags: ['代码'] },
  { id: 'sk-2', name: '代码审查', desc: '自动审查代码质量与安全', icon: Eye, tags: ['代码'] },
  { id: 'sk-3', name: '文档生成', desc: '自动生成项目文档', icon: FileText, tags: ['文档'] },
  { id: 'sk-4', name: '数据分析', desc: '统计分析与数据洞察', icon: Layers, tags: ['数据'] },
  { id: 'sk-5', name: '网页搜索', desc: '实时搜索互联网信息', icon: Globe, tags: ['搜索'] },
  { id: 'sk-6', name: '图表生成', desc: '可视化数据图表', icon: Layers, tags: ['数据'] },
  { id: 'sk-7', name: '数据清洗', desc: '数据预处理与转换', icon: Database, tags: ['数据'] },
  { id: 'sk-8', name: 'API 测试', desc: '接口自动化测试', icon: Network, tags: ['代码'] },
  { id: 'sk-9', name: 'SQL 查询', desc: '数据库查询与优化', icon: Database, tags: ['数据'] },
  { id: 'sk-10', name: '翻译', desc: '多语言文本翻译', icon: MessageSquare, tags: ['通信'] },
  { id: 'sk-11', name: '摘要提取', desc: '长文本智能摘要', icon: FileText, tags: ['文档'] },
  { id: 'sk-12', name: '图片识别', desc: '图像内容分析', icon: Image, tags: ['媒体'] },
  { id: 'sk-13', name: '情感分析', desc: '文本情感倾向识别', icon: MessageSquare, tags: ['通信', '数据'] },
  { id: 'sk-14', name: 'OCR 识别', desc: '图像文字提取', icon: Eye, tags: ['媒体'] },
  { id: 'sk-15', name: '语音转文字', desc: '音频内容转录', icon: MessageSquare, tags: ['媒体'] },
  { id: 'sk-16', name: '知识问答', desc: '基于知识库的精准回答', icon: FileText, tags: ['文档', '搜索'] },
  { id: 'sk-17', name: '文档比对', desc: '多版本文档差异分析', icon: FileText, tags: ['文档'] },
  { id: 'sk-18', name: '代码重构', desc: '自动代码结构优化', icon: Code2, tags: ['代码'] },
  { id: 'sk-19', name: 'CSS 生成', desc: '从设计稿生成样式代码', icon: Code2, tags: ['代码'] },
  { id: 'sk-20', name: '正则生成', desc: '自然语言描述生成正则', icon: Code2, tags: ['代码'] },
];

const statusConfig: Record<MCPServerStatus, { label: string; color: string }> = {
  connected: { label: '已连接', color: 'text-cherry-primary' },
  disconnected: { label: '未连接', color: 'text-muted-foreground/50' },
  error: { label: '错误', color: 'text-destructive' },
};


// Tag pill filter bar
function TagFilter({ tags, selected, onToggle }: { tags: readonly string[]; selected: string | null; onToggle: (t: string | null) => void }) {
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      <Button variant="ghost" size="xs" onClick={() => onToggle(null)} className={`px-2 py-[3px] rounded-full text-xs ${selected === null ? 'bg-accent/50 border border-border/30 text-foreground' : 'border border-transparent text-muted-foreground/40 hover:text-foreground hover:bg-accent/15'}`}>{"全部"}</Button>
      {tags.map(tag => (
        <Button variant="ghost" size="xs" key={tag} onClick={() => onToggle(selected === tag ? null : tag)} className={`px-2 py-[3px] rounded-full text-xs ${selected === tag ? 'bg-accent/50 border border-border/30 text-foreground' : 'border border-transparent text-muted-foreground/40 hover:text-foreground hover:bg-accent/15'}`}>{tag}</Button>
      ))}
    </div>
  );
}

function TabEmptyState({ preset, label, onAdd }: { preset: 'no-code-tool' | 'no-resource' | 'no-result'; label: string; onAdd: () => void }) {
  return (
    <EmptyState
      preset={preset}
      title={`尚未添加任何${label}`}
      description="点击右上角 + 按钮从资源库中添加，或手动添加"
      actionLabel={`添加${label}`}
      onAction={onAdd}
      compact
    />
  );
}

// Add panel sidebar for MCP / Skills (with tag filters in add panel too)
function AddResourcePanel({ activeTab, addedIds, onAdd, onClose, onExplore }: { activeTab: ToolchainTab; addedIds: Set<string>; onAdd: (item: any) => void; onClose: () => void; onExplore: () => void }) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  React.useEffect(() => { searchRef.current?.focus(); }, []);
  const tabLabel = activeTab === 'tools' ? '内置工具' : activeTab === 'mcp' ? 'MCP Server' : 'Skill';
  const availableTags = activeTab === 'mcp' ? MCP_TAGS : activeTab === 'skills' ? SKILL_TAGS : TOOL_CATEGORIES;

  const catalog = useMemo(() => {
    const items: any[] = activeTab === 'tools' ? ALL_TOOLS_CATALOG : activeTab === 'mcp' ? ALL_MCP_CATALOG : ALL_SKILLS_CATALOG;
    return items.filter((item: any) => {
      if (addedIds.has(item.id)) return false;
      if (tagFilter) {
        const itemTags = item.tags || (item.category ? [item.category] : []);
        if (!itemTags.includes(tagFilter)) return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || (item.category && item.category.toLowerCase().includes(q));
    });
  }, [activeTab, search, addedIds, tagFilter]);

  const groupedCatalog = useMemo(() => {
    if (activeTab !== 'tools') return null;
    const map = new Map<string, any[]>();
    for (const item of catalog) { const cat = item.category || '其他'; if (!map.has(cat)) map.set(cat, []); map.get(cat)!.push(item); }
    return map;
  }, [activeTab, catalog]);

  const getIcon = (item: any) => {
    if (activeTab === 'tools') { const I = item.icon; return <I size={11} strokeWidth={1.5} className="text-muted-foreground/60" />; }
    if (activeTab === 'mcp') return <Network size={11} className="text-info/50" />;
    const I = item.icon; return <I size={11} strokeWidth={1.5} className="text-warning/50" />;
  };
  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="w-[240px] flex-shrink-0 bg-background rounded-2xl border border-border/20 shadow-2xl flex flex-col overflow-hidden self-start" style={{ maxHeight: 'min(580px, calc(100vh - 140px))' }}>
      <div className="flex items-center justify-between px-3.5 h-[36px] flex-shrink-0 border-b border-border/15">
        <span className="text-sm text-foreground">{"添加"}{tabLabel}</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40"><X size={11} /></Button>
      </div>
      <div className="px-2.5 pt-2 pb-1.5">
        <SearchInput ref={searchRef} value={search} onChange={setSearch} placeholder={`搜索${tabLabel}...`} clearable wrapperClassName="flex items-center gap-1.5 px-2 py-[5px] rounded-lg bg-accent/15 border border-border/12" />
      </div>
      {/* Tag filter pills in add panel */}
      {(activeTab === 'mcp' || activeTab === 'skills') && (
        <div className="px-2.5 pb-1.5 flex flex-wrap gap-1">
          <Button variant="ghost" size="xs" onClick={() => setTagFilter(null)} className={`px-1.5 py-[2px] rounded-full text-xs ${tagFilter === null ? 'bg-accent/50 border border-border/30 text-foreground' : 'border border-transparent text-muted-foreground/50 hover:text-foreground'}`}>{"全部"}</Button>
          {availableTags.map(t => (<Button variant="ghost" size="xs" key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)} className={`px-1.5 py-[2px] rounded-full text-xs ${tagFilter === t ? 'bg-accent/50 border border-border/30 text-foreground' : 'border border-transparent text-muted-foreground/50 hover:text-foreground'}`}>{t}</Button>))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-1.5 pb-1.5 scrollbar-thin">
        {catalog.length === 0 ? (
          <EmptyState preset="no-result" compact />
        ) : activeTab === 'tools' && groupedCatalog ? (
          Array.from(groupedCatalog.entries()).map(([cat, items]) => (
            <div key={cat} className="mb-1.5">
              <div className="text-xs text-muted-foreground/50 px-2 py-1 uppercase tracking-wider">{cat}</div>
              {items.map((item: any) => (<div key={item.id} className="flex items-center gap-2 px-2 py-[6px] rounded-md hover:bg-accent/15 transition-colors group cursor-pointer" onClick={() => onAdd(item)}><div className="w-5 h-5 rounded bg-accent/15 flex items-center justify-center flex-shrink-0">{getIcon(item)}</div><div className="flex-1 min-w-0"><div className="text-sm text-foreground truncate">{item.name}</div><div className="text-xs text-muted-foreground/50 truncate">{item.desc}</div></div><Plus size={10} className="text-muted-foreground/40 group-hover:text-cherry-primary transition-colors flex-shrink-0" /></div>))}
            </div>
          ))
        ) : (
          <div className="space-y-0.5">
            {catalog.map((item: any) => (<div key={item.id} className="flex items-center gap-2 px-2 py-[6px] rounded-md hover:bg-accent/15 transition-colors group cursor-pointer" onClick={() => onAdd(item)}><div className="w-5 h-5 rounded bg-accent/15 flex items-center justify-center flex-shrink-0">{getIcon(item)}</div><div className="flex-1 min-w-0"><div className="text-sm text-foreground truncate">{item.name}</div><div className="text-xs text-muted-foreground/50 truncate">{item.author ? `@${item.author}` : item.desc}</div></div><Plus size={10} className="text-muted-foreground/40 group-hover:text-cherry-primary transition-colors flex-shrink-0" /></div>))}
          </div>
        )}
      </div>
      <div className="px-2.5 pb-2.5 pt-1.5 border-t border-border/15">
        <AnimatePresence>
          {showManualForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="mb-2 p-2.5 rounded-lg bg-accent/5 border border-border/10 space-y-2">
                <div className="text-xs text-muted-foreground/50 mb-1">{activeTab === 'mcp' ? '手动添加 MCP Server' : activeTab === 'skills' ? '手动添加 Skill' : '手动添加工具'}</div>
                <Input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="名称" className="w-full px-2 py-[5px] border-border/15 bg-background text-sm text-foreground focus-visible:border-border/30 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/60" />
                {activeTab === 'mcp' && <Input value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="Server URL (如 https://... 或 npx @mcp/...)" className="w-full px-2 py-[5px] border-border/15 bg-background text-sm text-foreground font-mono focus-visible:border-border/30 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/60" />}
                <Input value={manualDesc} onChange={e => setManualDesc(e.target.value)} placeholder="简要描述 (可选)" className="w-full px-2 py-[5px] border-border/15 bg-background text-sm text-foreground focus-visible:border-border/30 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/60" />
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Button size="xs" disabled={!manualName.trim() || (activeTab === 'mcp' && !manualUrl.trim())} onClick={() => {
                    if (activeTab === 'mcp') {
                      onAdd({ id: `custom-mcp-${Date.now()}`, name: manualName.trim(), desc: manualDesc.trim() || '自定义 Server', author: 'custom', url: manualUrl.trim(), tags: [], tools: [] });
                    } else if (activeTab === 'skills') {
                      onAdd({ id: `custom-sk-${Date.now()}`, name: manualName.trim(), desc: manualDesc.trim() || '自定义 Skill', icon: Sparkles, tags: [] });
                    } else {
                      onAdd({ id: `custom-tool-${Date.now()}`, name: manualName.trim(), desc: manualDesc.trim() || '自定义工具', icon: Wrench, category: '系统集成' });
                    }
                    setManualName(''); setManualUrl(''); setManualDesc(''); setShowManualForm(false);
                  }} className="flex-1 py-[5px] rounded-md bg-cherry-primary text-primary-foreground text-xs hover:bg-cherry-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all">{"确认添加"}</Button>
                  <Button variant="ghost" size="xs" onClick={() => { setShowManualForm(false); setManualName(''); setManualUrl(''); setManualDesc(''); }} className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/15">{"取消"}</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-0.5">
          <Button variant="ghost" size="xs" onClick={onExplore} className="w-full justify-start gap-2 text-muted-foreground/60 hover:text-foreground hover:bg-accent/15"><ExternalLink size={9} className="text-muted-foreground/40" /><span>{"去探索浏览"}</span></Button>
          <Button variant="ghost" size="xs" onClick={() => setShowManualForm(!showManualForm)} className={`w-full justify-start gap-2 ${showManualForm ? 'text-foreground bg-accent/15' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/15'}`}><Plus size={9} className="text-muted-foreground/40" /><span>{"手动添加"}</span></Button>
        </div>
      </div>
    </motion.div>
  );
}

// MCP Server expanded card — shows tools with toggles
function MCPServerCard({ server, onToggleConnect, onRemove, onToggleTool, onToggleAll }: {
  server: MCPServerLocal;
  onToggleConnect: () => void;
  onRemove: () => void;
  onToggleTool: (toolId: string) => void;
  onToggleAll: (enabled: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isConnected = server.status === 'connected';
  const enabledCount = server.tools.filter(t => t.enabled).length;
  const allEnabled = enabledCount === server.tools.length;

  return (
    <div className="rounded-xl border border-border/12 bg-accent/5 overflow-hidden transition-all">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-accent/15 transition-colors" onClick={() => isConnected && setExpanded(!expanded)}>
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-cherry-primary' : server.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground/20'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground truncate">{server.name}</span>
            <span className={`text-xs ${statusConfig[server.status].color}`}>{statusConfig[server.status].label}</span>
            {isConnected && <span className="text-xs text-muted-foreground/50">{enabledCount}/{server.tools.length} {"个工具"}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-px">
            <span className="text-xs text-muted-foreground/50 font-mono truncate">{server.url}</span>
            {server.tags.map(t => (<span key={t} className="text-xs px-1 py-px rounded bg-accent/15 text-muted-foreground/50">{t}</span>))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onToggleConnect(); }} className={isConnected ? 'text-cherry-primary hover:bg-cherry-active-bg' : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/50'} title={isConnected ? '断开连接' : '连接'}>
            <Power size={11} />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={e => { e.stopPropagation(); onRemove(); }} className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8"><Trash2 size={10} /></Button>
          {isConnected && <ChevronDown size={10} className={`text-muted-foreground/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />}
        </div>
      </div>

      {/* Expanded tool list */}
      <AnimatePresence>
        {expanded && isConnected && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border-t border-border/15 px-3 py-2">
              {/* Toggle all */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs text-muted-foreground/40">{"工具列表"}</span>
                <Button variant="link" size="xs" onClick={() => onToggleAll(!allEnabled)} className={`px-1.5 text-xs ${allEnabled ? 'text-muted-foreground/40 hover:text-foreground' : 'text-cherry-text-muted hover:text-cherry-primary-dark'}`}>
                  {allEnabled ? '全部关闭' : '全部启用'}
                </Button>
              </div>
              <div className="space-y-0.5 max-h-[180px] overflow-y-auto scrollbar-thin-xs">
                {server.tools.map(tool => (
                  <div key={tool.id} className={`flex items-center gap-2.5 px-1.5 py-[5px] rounded-md cursor-pointer transition-colors ${tool.enabled ? 'hover:bg-accent/15' : 'hover:bg-accent/15'}`} onClick={() => onToggleTool(tool.id)}>
                    <Checkbox checked={tool.enabled} className="flex-shrink-0" />
                    <span className={`text-sm font-mono truncate flex-1 min-w-0 ${tool.enabled ? 'text-foreground' : 'text-muted-foreground/50'}`}>{tool.name}</span>
                    <span className="text-xs text-muted-foreground/50 truncate max-w-[100px] flex-shrink-0">{tool.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



function ToolchainSection({ onExplore }: { onExplore: () => void }) {
  const [tools, setTools] = useState<ToolItem[]>(() => ALL_TOOLS_CATALOG.map(t => ({ ...t })));
  const [mcpServers, setMcpServers] = useState<MCPServerLocal[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ToolchainTab>('tools');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [mcpTagFilter, setMcpTagFilter] = useState<string | null>(null);
  const [skillTagFilter, setSkillTagFilter] = useState<string | null>(null);

  const toggleTool = (id: string) => setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  const toggleSkill = (id: string) => setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const handleAdd = useCallback((item: any) => {
    if (activeTab === 'tools') setTools(prev => [...prev, { ...item, enabled: true }]);
    else if (activeTab === 'mcp') {
      const catalogItem = item as MCPCatalogItem;
      setMcpServers(prev => [...prev, {
        id: catalogItem.id, name: catalogItem.name, desc: catalogItem.desc,
        author: catalogItem.author, url: catalogItem.url, status: 'disconnected',
        tags: catalogItem.tags, tools: catalogItem.tools.map(t => ({ ...t })),
      }]);
    } else {
      const catalogItem = item as SkillCatalogItem;
      setSkills(prev => [...prev, { ...catalogItem, enabled: true, tags: catalogItem.tags }]);
    }
  }, [activeTab]);

  const toggleMcpConnect = (id: string) => setMcpServers(prev => prev.map(s =>
    s.id === id ? { ...s, status: s.status === 'connected' ? 'disconnected' as const : 'connected' as const } : s
  ));
  const removeMcp = (id: string) => setMcpServers(prev => prev.filter(s => s.id !== id));
  const toggleMcpTool = (serverId: string, toolId: string) => setMcpServers(prev => prev.map(s =>
    s.id === serverId ? { ...s, tools: s.tools.map(t => t.id === toolId ? { ...t, enabled: !t.enabled } : t) } : s
  ));
  const toggleAllMcpTools = (serverId: string, enabled: boolean) => setMcpServers(prev => prev.map(s =>
    s.id === serverId ? { ...s, tools: s.tools.map(t => ({ ...t, enabled })) } : s
  ));

  const enabledToolsCount = tools.filter(t => t.enabled).length;
  const connectedMCPCount = mcpServers.filter(s => s.status === 'connected').length;
  const enabledSkillsCount = skills.filter(s => s.enabled).length;

  const addedIds = useMemo(() => {
    if (activeTab === 'tools') return new Set(tools.map(t => t.id));
    if (activeTab === 'mcp') return new Set(mcpServers.map(m => m.id));
    return new Set(skills.map(s => s.id));
  }, [activeTab, tools, mcpServers, skills]);



  const filteredTools = useMemo(() => { if (!search.trim()) return tools; const q = search.toLowerCase(); return tools.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)); }, [tools, search]);
  const groupedTools = useMemo(() => { const g: Record<string, ToolItem[]> = {}; for (const c of TOOL_CATEGORIES) g[c] = []; for (const t of filteredTools) { if (g[t.category]) g[t.category].push(t); } return g; }, [filteredTools]);

  const filteredMCP = useMemo(() => {
    let list = mcpServers;
    if (mcpTagFilter) list = list.filter(s => s.tags.includes(mcpTagFilter!));
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)); }
    return list;
  }, [mcpServers, search, mcpTagFilter]);

  const filteredSkills = useMemo(() => {
    let list = skills;
    if (skillTagFilter) list = list.filter(s => (s.tags || []).includes(skillTagFilter!));
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)); }
    return list;
  }, [skills, search, skillTagFilter]);

  const tabs = [
    { id: 'tools' as const, label: '内置工具', count: `${enabledToolsCount}/${tools.length}` },
    { id: 'mcp' as const, label: 'MCP Server', count: `${connectedMCPCount}/${mcpServers.length}` },
    { id: 'skills' as const, label: 'Skills', count: `${enabledSkillsCount}/${skills.length}` },
  ];

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0 space-y-4">
        <div><Typography variant="subtitle" className="mb-1">{"能力扩展"}</Typography><p className="text-xs text-muted-foreground/40">{"配置智能体可使用的工具和 MCP Server"}</p></div>
        <div className="max-w-2xl"><SearchInput value={search} onChange={setSearch} placeholder="搜索工具或 Server..." wrapperClassName="flex items-center gap-1.5 px-2 py-[5px] rounded-lg bg-accent/5 border border-border/15" /></div>
        <div className="flex items-center border-b border-border/15 pb-px max-w-2xl">
          {tabs.map(tab => (<Button variant="ghost" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative px-3 py-1.5 font-normal rounded-none ${activeTab === tab.id ? 'text-foreground hover:bg-transparent' : 'text-muted-foreground/40 hover:text-foreground hover:bg-transparent'}`}>{tab.label}<span className={`ml-1.5 text-xs ${activeTab === tab.id ? 'text-muted-foreground/50' : 'text-muted-foreground/40'}`}>{tab.count}</span>{activeTab === tab.id && <motion.div layoutId="toolchain-tab" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-foreground/60 rounded-full" />}</Button>))}
          <Button variant="ghost" size="xs" onClick={() => setShowAddPanel(!showAddPanel)} className={`ml-auto gap-1 ${showAddPanel ? 'text-foreground bg-accent/25' : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/15'}`}><Plus size={10} /><span>{"添加"}</span></Button>
        </div>
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

              {/* === Tools === */}
              {activeTab === 'tools' && (tools.length === 0 ? <TabEmptyState preset="no-code-tool" label="内置工具" onAdd={() => setShowAddPanel(true)} /> : (
                <div className="space-y-5">
                  {TOOL_CATEGORIES.map(cat => { const items = groupedTools[cat]; if (!items || items.length === 0) return null; return (<div key={cat}><div className="flex items-center gap-2 mb-2.5"><span className="text-xs text-muted-foreground/50">{cat}</span><div className="flex-1 h-px bg-border/30" /><span className="text-xs text-muted-foreground/50">{items.filter(t => t.enabled).length}/{items.length}</span></div><div className="grid grid-cols-2 gap-x-3 gap-y-1">{items.map(tool => { const Icon = tool.icon; return (<div key={tool.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${tool.enabled ? 'hover:bg-accent/15' : 'opacity-40 hover:opacity-65'}`} onClick={() => toggleTool(tool.id)}><Icon size={14} strokeWidth={1.5} className={tool.enabled ? 'text-muted-foreground' : 'text-muted-foreground/40'} /><div className="flex-1 min-w-0"><div className="text-sm text-foreground truncate">{tool.name}</div><div className="text-xs text-muted-foreground/50 truncate">{tool.desc}</div></div><Switch size="sm" checked={tool.enabled} className="pointer-events-none" /></div>); })}</div></div>); })}
                  {filteredTools.length === 0 && search && <EmptyState preset="no-result" compact />}
                </div>
              ))}

              {/* === MCP Servers === */}
              {activeTab === 'mcp' && (mcpServers.length === 0 ? <TabEmptyState preset="no-resource" label="MCP Server" onAdd={() => setShowAddPanel(true)} /> : (
                <div>
                  <TagFilter tags={MCP_TAGS} selected={mcpTagFilter} onToggle={setMcpTagFilter} />
                  <div className="space-y-2">
                    {filteredMCP.map(server => (
                      <MCPServerCard
                        key={server.id}
                        server={server}
                        onToggleConnect={() => toggleMcpConnect(server.id)}
                        onRemove={() => removeMcp(server.id)}
                        onToggleTool={(toolId) => toggleMcpTool(server.id, toolId)}
                        onToggleAll={(enabled) => toggleAllMcpTools(server.id, enabled)}
                      />
                    ))}
                    {filteredMCP.length === 0 && <EmptyState preset="no-result" title={search ? '未找到匹配结果' : '该分类下无 Server'} compact />}
                  </div>
                  <div className="pt-3 flex items-center gap-2"><Button variant="ghost" size="xs" onClick={() => setShowAddPanel(true)} className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/15"><Plus size={10} /> {"继续添加"}</Button><Button variant="link" size="xs" onClick={onExplore} className="text-cherry-text-muted hover:text-cherry-primary-dark"><ExternalLink size={9} /> {"去探索浏览"}</Button></div>
                </div>
              ))}

              {/* === Skills === */}
              {activeTab === 'skills' && (skills.length === 0 ? <TabEmptyState preset="no-resource" label="Skill" onAdd={() => setShowAddPanel(true)} /> : (
                <div>
                  <TagFilter tags={SKILL_TAGS} selected={skillTagFilter} onToggle={setSkillTagFilter} />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {filteredSkills.map(skill => { const Icon = skill.icon; return (
                      <div key={skill.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${skill.enabled ? 'hover:bg-accent/15' : 'opacity-40 hover:opacity-65'}`} onClick={() => toggleSkill(skill.id)}>
                        <Icon size={14} strokeWidth={1.5} className={skill.enabled ? 'text-muted-foreground' : 'text-muted-foreground/40'} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{skill.name}</div>
                          <div className="text-xs text-muted-foreground/50 truncate">{skill.desc}</div>
                        </div>
                        <Switch size="sm" checked={skill.enabled} className="pointer-events-none" />
                      </div>
                    ); })}
                  </div>
                  {filteredSkills.length === 0 && <EmptyState preset="no-result" title={search ? '未找到匹配结果' : '该分类下无 Skill'} compact />}
                  <div className="pt-3 flex items-center gap-2"><Button variant="ghost" size="xs" onClick={() => setShowAddPanel(true)} className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/15"><Plus size={10} /> {"继续添加"}</Button><Button variant="link" size="xs" onClick={onExplore} className="text-cherry-text-muted hover:text-cherry-primary-dark"><ExternalLink size={9} /> {"去探索浏览"}</Button></div>
                </div>
              ))}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {showAddPanel && <AddResourcePanel activeTab={activeTab} addedIds={addedIds} onAdd={handleAdd} onClose={() => setShowAddPanel(false)} onExplore={onExplore} />}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// Knowledge Base Section
// ===========================
interface KBItem {
  id: string; name: string; group: string; docCount: number; size: string;
  iconColor: string; desc: string;
}

const KB_GROUPS = ['全部', '产品文档', '技术文档', '运营资料', '学习资源'] as const;

const ALL_KB_CATALOG: KBItem[] = [
  { id: 'kb-1', name: '产品文档库', group: '产品文档', docCount: 128, size: '45 MB', iconColor: 'bg-accent-blue', desc: '产品需求、设计规范、迭代记录' },
  { id: 'kb-2', name: 'API 参考文档', group: '技术文档', docCount: 256, size: '120 MB', iconColor: 'bg-muted0', desc: 'REST API、SDK 接入文档' },
  { id: 'kb-3', name: '用户反馈集', group: '运营资料', docCount: 1024, size: '230 MB', iconColor: 'bg-warning', desc: '用户工单、NPS 调研、反馈汇总' },
  { id: 'kb-4', name: '内部 Wiki', group: '技术文档', docCount: 512, size: '180 MB', iconColor: 'bg-destructive', desc: '团队知识沉淀、最佳实践' },
  { id: 'kb-5', name: '技术博客合集', group: '学习资源', docCount: 89, size: '35 MB', iconColor: 'bg-accent-violet', desc: '技术博客、分享文章汇编' },
  { id: 'kb-6', name: '竞品分析库', group: '产品文档', docCount: 67, size: '28 MB', iconColor: 'bg-accent-cyan', desc: '竞品调研报告、功能对比' },
  { id: 'kb-7', name: '运维手册', group: '技术文档', docCount: 145, size: '55 MB', iconColor: 'bg-accent-orange', desc: '部署文档、故障排查指南' },
  { id: 'kb-8', name: '营销素材库', group: '运营资料', docCount: 320, size: '480 MB', iconColor: 'bg-accent-pink', desc: '宣传文案、活动策划、渠道资料' },
  { id: 'kb-9', name: '培训教程', group: '学习资源', docCount: 42, size: '15 MB', iconColor: 'bg-accent-emerald', desc: '新人入职、技能培训材料' },
  { id: 'kb-10', name: '法务合规文档', group: '运营资料', docCount: 38, size: '12 MB', iconColor: 'bg-muted-foreground', desc: '隐私政策、合规条款、审计记录' },
];

function KnowledgeBaseSection() {
  const [linkedKBs, setLinkedKBs] = useState<KBItem[]>([ALL_KB_CATALOG[0], ALL_KB_CATALOG[1]]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addGroupFilter, setAddGroupFilter] = useState('全部');
  const [similarity, setSimilarity] = useState(0.95);
  const [topK, setTopK] = useState(5);

  const linkedIds = useMemo(() => new Set(linkedKBs.map(k => k.id)), [linkedKBs]);

  const filteredCatalog = useMemo(() => {
    return ALL_KB_CATALOG.filter(kb => {
      if (linkedIds.has(kb.id)) return false;
      if (addGroupFilter !== '全部' && kb.group !== addGroupFilter) return false;
      if (addSearch.trim()) {
        const q = addSearch.toLowerCase();
        return kb.name.toLowerCase().includes(q) || kb.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [linkedIds, addGroupFilter, addSearch]);

  const addKB = (kb: KBItem) => { setLinkedKBs(prev => [...prev, kb]); };
  const removeKB = (id: string) => { setLinkedKBs(prev => prev.filter(k => k.id !== id)); };


  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Typography variant="subtitle" className="mb-1">{"知识库关联"}</Typography>
        <p className="text-xs text-muted-foreground/40">{"选择知识库并配置检索参数"}</p>
      </div>

      {/* Linked knowledge bases */}
      <div>
        <div className="text-xs text-muted-foreground/50 mb-2.5">{"已关联知识库"}</div>
        {linkedKBs.length === 0 ? (
          <EmptyState
            preset="no-knowledge"
            title="尚未关联任何知识库"
            description="关联知识库后，智能体可检索其中的内容来回答问题"
            compact
          />
        ) : (
          <div className="space-y-2">
            {linkedKBs.map(kb => (
              <motion.div key={kb.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/12 bg-accent/4 hover:bg-accent/15 transition-all group">
                <div className={`w-8 h-8 rounded-lg ${kb.iconColor} flex items-center justify-center flex-shrink-0`}>
                  <FolderOpen size={14} className="text-white/90" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground">{kb.name}</div>
                  <div className="text-xs text-muted-foreground/50">{kb.docCount} {"文档"} · {kb.size}</div>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => removeKB(kb.id)} className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 opacity-0 group-hover:opacity-100"><Trash2 size={11} /></Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add button + dropdown */}
        <div className="mt-3">
          <Popover open={showAddPanel} onOpenChange={(v) => { setShowAddPanel(v); if (v) { setAddSearch(''); setAddGroupFilter('全部'); } }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="xs"
                className="text-muted-foreground/50 hover:text-foreground">
                <Plus size={11} /><span>{"添加知识库"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 w-[340px] overflow-hidden">
              {/* Search */}
              <div className="px-3 pt-3 pb-2">
                <SearchInput value={addSearch} onChange={setAddSearch} placeholder="搜索知识库..." clearable wrapperClassName="flex items-center gap-1.5 px-2.5 py-[6px] rounded-lg bg-accent/15 border border-border/12" autoFocus />
              </div>

              {/* Group filter pills */}
              <div className="px-3 pb-2 flex flex-wrap gap-1">
                {KB_GROUPS.map(g => (
                  <Button variant="ghost" size="xs" key={g} onClick={() => setAddGroupFilter(g)}
                    className={`px-1.5 py-[2px] rounded-full text-xs ${addGroupFilter === g ? 'bg-accent/50 border border-border/30 text-foreground' : 'border border-transparent text-muted-foreground/50 hover:text-foreground'}`}>{g}</Button>
                ))}
              </div>

              {/* KB list */}
              <div className="max-h-[240px] overflow-y-auto px-1.5 pb-2 scrollbar-thin">
                {filteredCatalog.length === 0 ? (
                  <EmptyState preset="no-result" title="无匹配知识库" compact />
                ) : (
                  <div className="space-y-0.5">
                    {filteredCatalog.map(kb => (
                      <div key={kb.id} onClick={() => addKB(kb)}
                        className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg hover:bg-accent/15 transition-colors cursor-pointer group">
                        <div className={`w-6 h-6 rounded ${kb.iconColor} flex items-center justify-center flex-shrink-0`}>
                          <FolderOpen size={11} className="text-white/90" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{kb.name}</div>
                          <div className="text-xs text-muted-foreground/50">{kb.docCount} {"文档"}</div>
                        </div>
                        <Plus size={10} className="text-muted-foreground/40 group-hover:text-cherry-primary transition-colors flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Retrieval parameters */}
      <div className="border-t border-border/15 pt-5 space-y-5">
        <div className="text-xs text-muted-foreground/50 mb-2">{"检索参数"}</div>

        {/* Similarity threshold */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground/60">{"相似度阈值"}</label>
            <span className="text-xs text-foreground font-mono">{similarity.toFixed(2)}</span>
          </div>
          <Slider min={0} max={1} step={0.01} value={[similarity]} onValueChange={([v]) => setSimilarity(v)} />
          <div className="flex justify-between mt-1"><span className="text-xs text-muted-foreground/50">0</span><span className="text-xs text-muted-foreground/50">1.0</span></div>
          <p className="text-xs text-muted-foreground/50 mt-1.5">{"仅返回相似度高于该阈值的文档片段。值越高匹配越精确，但可能遗漏相关内容。"}</p>
        </div>

        {/* Top K */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground/60">{"返回数量 (Top K)"}</label>
            <span className="text-xs text-foreground font-mono">{topK}</span>
          </div>
          <Slider min={1} max={20} step={1} value={[topK]} onValueChange={([v]) => setTopK(v)} />
          <div className="flex justify-between mt-1"><span className="text-xs text-muted-foreground/50">1</span><span className="text-xs text-muted-foreground/50">20</span></div>
          <p className="text-xs text-muted-foreground/50 mt-1.5">{"每次检索返回的最大文档片段数量。增加数量可提供更多上下文，但会消耗更多 Token。"}</p>
        </div>
      </div>
    </div>
  );
}

function AgentAdvancedSection() {
  const [maxRounds, setMaxRounds] = useState(10);
  return (
    <div className="max-w-lg space-y-6">
      <div><Typography variant="subtitle" className="mb-1">{"高级设置"}</Typography><p className="text-xs text-muted-foreground/40">{"配置智能体的执行限制"}</p></div>
      <div>
        <label className="text-sm text-muted-foreground/60 mb-1.5 block">{"最大执行轮次"} <span className="text-muted-foreground/50 ml-1">{maxRounds}</span></label>
        <Slider min={1} max={50} step={1} value={[maxRounds]} onValueChange={([v]) => setMaxRounds(v)} />
        <div className="flex justify-between mt-1"><span className="text-xs text-muted-foreground/50">1</span><span className="text-xs text-muted-foreground/50">50</span></div>
        <p className="text-xs text-muted-foreground/50 mt-2">{"每次会话中智能体与工具交互的最大轮次数。达到上限后将停止执行并返回当前结果。"}</p>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (<div><label className="text-sm text-muted-foreground/60 mb-1.5 block">{label}</label>{children}</div>);
}
