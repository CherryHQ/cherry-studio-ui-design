import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft, Save, Settings, Settings2, FileText,
  Wrench, SlidersHorizontal, ChevronRight, ChevronDown,
  X, Check, Plus, Trash2,
  RefreshCw, CheckCircle2, Circle, AlertTriangle,
  Search, ExternalLink,
  Terminal, FileEdit, Globe, Code2, Database, FolderSearch,
  Image, GitBranch, FileJson, Network, Lock,
  Mail, Calendar, Cpu, HardDrive, Clipboard, Eye,
  Download, MessageSquare, Zap, Bug,
  Layers, Sparkles, BookOpen, FolderOpen,
  Upload, Link2,
  Send, MessageCircle, Github, Info,
  Cable, Plug, LayoutGrid, Blocks,
  Users2,
} from 'lucide-react';
import { EmailAuthWizard } from '@/features/collaboration/components/EmailAuthWizard';
import { useCollab } from '@/features/collaboration/CollabContext';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Slider } from '@cherrystudio/ui/components/primitives/slider';
// Input + Textarea kept on legacy — v2's are too faint on the modal card.
import { Popover, PopoverTrigger, PopoverContent } from '@cherrystudio/ui/components/primitives/popover';
import { Combobox } from '@cherrystudio/ui/components/primitives/combobox';
import { Checkbox } from '@cherrystudio/ui/components/primitives/checkbox';
import { Badge } from '@cherrystudio/ui/components/primitives/badge';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@cherrystudio/ui/components/primitives/select';
// V2 doesn't ship SearchInput / Typography / EmptyState / SimpleTooltip / Switch
import {
  Input, Textarea, EmptyState, SearchInput, Typography, SimpleTooltip, Switch,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Separator,
} from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import type { ResourceItem, MCPServerStatus } from '@/app/types';
import { PromptSection } from '@/features/assistant/sections/PromptSection';
import { AVATAR_OPTIONS } from '@/app/config/constants';
import { ModelPickerPanel } from '@/app/components/shared/ModelPickerPanel';
import { ASSISTANT_MODELS } from '@/app/config/models';
import { InstallIntegrationDialog } from '@/features/market/InstallIntegrationDialog';
import { INTEGRATION_LOGO } from '@/features/market/catalog';

interface Props { resource: ResourceItem; onBack: () => void; inModal?: boolean }
// The 工具 sidebar entry is a collapsible group: the four toolchain
// sub-tabs each become a separate sidebar item under it. Other entries
// stay flat.
type ToolchainTabId = 'tools' | 'mcp' | 'skills' | 'integrations';
type Section = 'basic' | 'models' | 'prompt' | 'knowledge' | 'notes' | 'collaboration' | 'advanced' | `toolchain:${ToolchainTabId}`;

// 拓展 group children — Skills 排第一位（最高频）。Knowledge / notes
// 走自己的 dedicated section；toolchain 四个子 tab 走 <ToolchainSection
// controlledTab>。
const EXPANSION_CHILDREN: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'toolchain:skills',       label: 'Skills',     icon: Sparkles },
  { id: 'toolchain:tools',        label: '内置工具',   icon: Wrench },
  { id: 'toolchain:mcp',          label: 'MCP Server', icon: Cable },
  { id: 'toolchain:integrations', label: '连接器',     icon: Plug },
  { id: 'knowledge',              label: '知识库',     icon: BookOpen },
  { id: 'notes',                  label: '笔记',       icon: FileEdit },
];

// Flat top-level entries above the collapsible 拓展 group + the
// 高级设置 tail. 模型设置 split out from BasicSection per design feedback.
const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'basic',         label: '基础设置', icon: Settings },
  { id: 'models',        label: '模型设置', icon: Layers },
  { id: 'prompt',        label: '提示词',   icon: FileText },
  { id: 'collaboration', label: '协作',     icon: Users2 },
  { id: 'advanced',      label: '高级设置', icon: Settings2 },
];


const TAG_PRESETS: { tag: string; color: string }[] = [
  { tag: '编程', color: 'bg-accent-cyan-muted text-muted-foreground border-accent-cyan/15' },
  { tag: '数据分析', color: 'bg-accent-indigo-muted text-muted-foreground border-accent-indigo/15' },
  { tag: '写作', color: 'bg-warning-muted text-muted-foreground border-warning/15' },
  { tag: '工具', color: 'bg-accent-orange-muted text-muted-foreground border-accent-orange/15' },
  { tag: '自动化', color: 'bg-muted text-muted-foreground border-border/30' },
  { tag: '研究', color: 'bg-accent-violet-muted text-muted-foreground border-accent-violet/15' },
];
function getTagColor(tag: string): string {
  return TAG_PRESETS.find(p => p.tag === tag)?.color || 'bg-muted text-muted-foreground border-border/30';
}

// ===========================
// Main Component
// ===========================
export function AgentConfig({ resource, onBack, inModal = false }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [toolchainExpanded, setToolchainExpanded] = useState(true);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {!inModal && (
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
      )}
      <div className="flex flex-1 min-h-0">
        <div className="w-[150px] flex-shrink-0 border-r border-border/15 p-2 overflow-y-auto">
          {/* Flat entries: 基础设置 / 提示词 (advanced moved below
              the 拓展 group; knowledge + notes now live inside it). */}
          {sections.filter(s => s.id !== 'advanced').map(s => {
            const active = activeSection === s.id;
            const Icon = s.icon;
            return (
              <Button variant="ghost" key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full justify-start gap-2 px-3 py-2 mb-0.5 rounded-lg transition-colors ${active ? 'bg-accent/50 text-foreground font-medium' : 'font-normal text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}>
                <Icon size={13} strokeWidth={1.5} className={`flex-shrink-0 ${active ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                <span className="text-sm">{s.label}</span>
              </Button>
            );
          })}

          {/* 工具拓展 group — collapsible parent that expands into the
              four toolchain sub-tabs. Sits at the bottom of the sidebar
              since its children form a longer secondary nav. */}
          {(() => {
            const childActive = EXPANSION_CHILDREN.some(c => c.id === activeSection);
            return (
              <>
                <Button variant="ghost"
                  onClick={() => setToolchainExpanded(v => !v)}
                  className={`w-full justify-start gap-2 px-3 py-2 mb-0.5 rounded-lg transition-colors ${childActive ? 'bg-accent/50 text-foreground font-medium' : 'font-normal text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}>
                  <Blocks size={13} strokeWidth={1.5} className={`flex-shrink-0 ${childActive ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                  <span className="text-sm flex-1 text-left">拓展</span>
                  <ChevronDown size={11} className={`flex-shrink-0 text-muted-foreground/40 transition-transform ${toolchainExpanded ? '' : '-rotate-90'}`} />
                </Button>
                <AnimatePresence initial={false}>
                  {toolchainExpanded && (
                    <motion.div
                      key="toolchain-children"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {EXPANSION_CHILDREN.map(c => {
                          const isActive = activeSection === c.id;
                          const CIcon = c.icon;
                          return (
                            <Button variant="ghost" key={c.id} onClick={() => setActiveSection(c.id)}
                              className={`w-full justify-start gap-2 px-3 py-1.5 mb-0.5 rounded-lg transition-colors ${isActive ? 'bg-accent/50 text-foreground font-medium' : 'font-normal text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}>
                              <CIcon size={11} strokeWidth={1.5} className={`flex-shrink-0 ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                              <span className="text-sm">{c.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            );
          })()}

          {/* 高级设置 — sits below the 拓展 group as the tail entry. */}
          {sections.filter(s => s.id === 'advanced').map(s => {
            const active = activeSection === s.id;
            const Icon = s.icon;
            return (
              <Button variant="ghost" key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full justify-start gap-2 px-3 py-2 mb-0.5 rounded-lg transition-colors ${active ? 'bg-accent/50 text-foreground font-medium' : 'font-normal text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}>
                <Icon size={13} strokeWidth={1.5} className={`flex-shrink-0 ${active ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                <span className="text-sm">{s.label}</span>
              </Button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeSection === 'basic' && <AgentBasicSection resource={resource} />}
              {activeSection === 'models' && <AgentModelsSection />}
              {activeSection === 'prompt' && <AgentPromptSection />}
              {activeSection === 'knowledge' && <KnowledgeBaseSection />}
              {activeSection === 'notes' && <AgentNotesSection />}
              {typeof activeSection === 'string' && activeSection.startsWith('toolchain:') && (
                <ToolchainSection
                  onExplore={onBack}
                  controlledTab={activeSection.slice('toolchain:'.length) as ToolchainTabId}
                />
              )}
              {activeSection === 'collaboration' && <AgentCollaborationSection />}
              {activeSection === 'advanced' && <AgentAdvancedSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {inModal && (
        <div className="flex-shrink-0 flex items-center justify-end gap-2 px-4 py-2.5 border-t border-border/15 bg-background/95 backdrop-blur-sm">
          <AnimatePresence>
            {saved
              ? <motion.span key="saved" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs text-cherry-primary mr-auto flex items-center gap-1"><CheckCircle2 size={11} />已保存</motion.span>
              : <motion.span key="dirty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-muted-foreground/50 mr-auto">有未保存的更改</motion.span>}
          </AnimatePresence>
          <Button variant="outline" size="xs" onClick={onBack} className="h-7 px-3 text-xs">取消</Button>
          <Button size="xs" onClick={handleSave} className="h-7 px-3 text-xs gap-1.5"><Save size={11} />保存</Button>
        </div>
      )}
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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0 w-[200px]">
        <label className="text-sm text-muted-foreground">{label}</label>
        <SimpleTooltip content={hint} side="top" sideOffset={6}>
          <Info size={12} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-help" />
        </SimpleTooltip>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex-1 justify-between px-3 py-2 border-border/40 bg-muted/30 text-sm text-foreground hover:border-border/50 hover:bg-accent/40">
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
  const [avatarType, setAvatarType] = useState<'emoji' | 'image'>('emoji');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarTab, setAvatarTab] = useState<'emoji' | 'image'>('emoji');
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  // Agent runtime type — drives how the agent executes (terminal-native
  // Claude Code, Cherry's in-app runtime, or long-running background job)
  const [agentType, setAgentType] = useState<'claude-code' | 'cherry-runtime' | 'long-running'>('cherry-runtime');
  return (
    <div className="max-w-3xl space-y-5">
      <div className="grid grid-cols-1 gap-3">
        <div className="min-w-0">
          <label className="text-sm text-muted-foreground mb-1.5 block">头像与名称</label>
          <div className="flex items-center gap-3 min-w-0">
          <Popover>
            <PopoverTrigger asChild>
              <button type="button"
                className="w-9 h-9 rounded-lg bg-accent/50 flex items-center justify-center text-lg flex-shrink-0 border border-border/60 overflow-hidden hover:border-border transition-colors">
                {avatarType === 'image' && avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  avatar
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={6} className="w-[340px] p-0 overflow-hidden">
              <div className="flex items-center gap-0.5 px-1.5 pt-1.5">
                {([
                  { key: 'emoji' as const, label: 'Emoji' },
                  { key: 'image' as const, label: '图片' },
                ]).map(tab => {
                  const active = avatarTab === tab.key;
                  return (
                    <button key={tab.key} onClick={() => setAvatarTab(tab.key)}
                      className={`flex-1 px-2 py-1.5 rounded-md text-xs transition-colors ${
                        active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                      }`}>
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <Separator opacity={30} className="mt-1.5" />
              {avatarTab === 'emoji' && (
                <div className="grid grid-cols-8 gap-1 p-2 max-h-[260px] overflow-y-auto scrollbar-thin">
                  {AVATAR_OPTIONS.map(a => (
                    <button key={a} type="button"
                      onClick={() => { setAvatar(a); setAvatarType('emoji'); }}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-colors ${
                        avatarType === 'emoji' && avatar === a ? 'bg-accent ring-1 ring-primary/40' : 'hover:bg-accent/50'
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              )}
              {avatarTab === 'image' && (
                <div className="p-3 space-y-2.5">
                  <input ref={fileInputRef2} type="file" accept="image/*" className="hidden"
                    onChange={e => { const file = e.target.files?.[0]; if (file) { setAvatarUrl(URL.createObjectURL(file)); setAvatarType('image'); } }} />
                  <button onClick={() => fileInputRef2.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-md border border-dashed border-border/50 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                    <Upload size={16} className="text-muted-foreground/60" />
                    <span>点击上传图片</span>
                    <span className="text-muted-foreground/40">PNG / JPG，建议 256×256</span>
                  </button>
                  <div className="text-xs text-muted-foreground/60">或粘贴图片链接</div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Link2 size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://… 或 data:image/…"
                        className="w-full pl-7 h-7 text-xs rounded-md border-border/40" />
                    </div>
                    <Button variant="default" size="xs" onClick={() => { if (avatarUrl.trim()) setAvatarType('image'); }}
                      disabled={!avatarUrl.trim()}
                      className="h-7 px-3 text-xs">
                      使用
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="智能体名称"
            className="flex-1 min-w-0 h-9 px-3 py-1.5 rounded-lg border border-border/60 bg-accent/15 text-xs md:text-xs text-foreground focus-visible:border-border focus-visible:ring-0 shadow-none transition-all" />
          </div>
        </div>
        <div className="min-w-0">
          <label className="text-sm text-muted-foreground mb-1.5 block">类型</label>
          <Select value={agentType} onValueChange={(v) => setAgentType(v as typeof agentType)}>
            <SelectTrigger className="w-full !h-9 px-3 text-xs border border-border/60 bg-accent/15 hover:bg-accent/40 rounded-lg">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude-code">Claude Code</SelectItem>
              <SelectItem value="cherry-runtime">Cherry Runtime</SelectItem>
              <SelectItem value="long-running">Long Running</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <FieldGroup label="简介">
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border/60 bg-accent/15 text-xs text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:border-border focus-visible:ring-0 resize-none"
        />
      </FieldGroup>
    </div>
  );
}

// ===========================
// 模型设置 — Three-tier model picker (规划 / 常规 / 快速). Split out
// from BasicSection so the basic info form stays focused on identity.
// ===========================
function AgentModelsSection() {
  const [planningModel, setPlanningModel] = useState('claude-4-opus');
  const [regularModel, setRegularModel] = useState('gpt-41');
  const [fastModel, setFastModel] = useState('gemini-25-flash');

  return (
    <div className="max-w-3xl space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">三档模型</h3>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          智能体按任务自动选择对应档位。规划负责拆解 / 决策，常规负责推理 / 执行，快速负责简单判断 / 格式化。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-y-2.5">
        <ModelSelector label="规划模型" value={planningModel} onChange={setPlanningModel} hint="负责任务拆解和决策" />
        <ModelSelector label="常规模型" value={regularModel} onChange={setRegularModel} hint="负责主要推理和执行" />
        <ModelSelector label="快速模型" value={fastModel} onChange={setFastModel} hint="负责简单判断和格式化" />
      </div>
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
type ToolchainTab = 'tools' | 'mcp' | 'skills' | 'integrations';

interface IntegrationItem {
  id: string;
  name: string;
  desc: string;
  /** Lucide icon component */
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  /** Visual hint behind the icon */
  tintCls: string;
  enabled: boolean;
}


const ALL_INTEGRATIONS_CATALOG: Omit<IntegrationItem, 'enabled'>[] = [
  { id: 'integ-cli',       name: 'CLI',          desc: '在终端中调用助手能力（cherry-cli）',           icon: Terminal,      tintCls: 'text-foreground' },
  { id: 'integ-notion',    name: 'Notion',       desc: 'Notion 页面读写、数据库查询',                   icon: FileText,      tintCls: 'text-foreground' },
  { id: 'integ-yuque',     name: '语雀',          desc: '语雀知识库 / 文档读写',                         icon: BookOpen,      tintCls: 'text-success' },
  { id: 'integ-feishu',    name: '飞书',          desc: '飞书消息 / 文档 / 多维表格',                    icon: Send,          tintCls: 'text-info' },
  { id: 'integ-slack',     name: 'Slack',        desc: '频道消息 / DM / 工作流',                        icon: MessageCircle, tintCls: 'text-accent-violet' },
  { id: 'integ-github',    name: 'GitHub',       desc: 'Issue / PR / Release 自动化',                  icon: Github,        tintCls: 'text-foreground' },
  { id: 'integ-linear',    name: 'Linear',       desc: '任务 / 项目 / 冲刺管理',                        icon: Layers,        tintCls: 'text-accent-violet' },
];

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
      <Button variant="ghost" size="xs" onClick={() => onToggle(null)} className={`px-2 py-[3px] rounded-full text-xs ${selected === null ? 'bg-accent/50 border border-border/30 text-foreground' : 'border border-transparent text-muted-foreground/40 hover:text-foreground hover:bg-accent/40'}`}>{"全部"}</Button>
      {tags.map(tag => (
        <Button variant="ghost" size="xs" key={tag} onClick={() => onToggle(selected === tag ? null : tag)} className={`px-2 py-[3px] rounded-full text-xs ${selected === tag ? 'bg-accent/50 border border-border/30 text-foreground' : 'border border-transparent text-muted-foreground/40 hover:text-foreground hover:bg-accent/40'}`}>{tag}</Button>
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
    <div className="flex flex-col overflow-hidden" style={{ maxHeight: 'min(480px, calc(100vh - 200px))' }}>
      <div className="flex items-center justify-between px-3.5 h-[36px] flex-shrink-0 border-b border-border/15">
        <span className="text-sm text-foreground">{"添加"}{tabLabel}</span>
        <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-muted-foreground/40"><X size={11} /></Button>
      </div>
      <div className="px-2.5 pt-2 pb-1.5">
        <SearchInput ref={searchRef} value={search} onChange={setSearch} placeholder={`搜索${tabLabel}...`} clearable wrapperClassName="flex items-center gap-1.5 px-2 py-[5px] rounded-lg bg-accent/15 border border-border/15" />
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
              {items.map((item: any) => (<div key={item.id} className="flex items-center gap-2 px-2 py-[6px] rounded-md hover:bg-accent/40 transition-colors group cursor-pointer" onClick={() => onAdd(item)}><div className="w-5 h-5 rounded bg-accent/15 flex items-center justify-center flex-shrink-0">{getIcon(item)}</div><div className="flex-1 min-w-0"><div className="text-sm text-foreground truncate">{item.name}</div><div className="text-xs text-muted-foreground/50 truncate">{item.desc}</div></div><Plus size={10} className="text-muted-foreground/40 group-hover:text-cherry-primary transition-colors flex-shrink-0" /></div>))}
            </div>
          ))
        ) : (
          <div className="space-y-0.5">
            {catalog.map((item: any) => (<div key={item.id} className="flex items-center gap-2 px-2 py-[6px] rounded-md hover:bg-accent/40 transition-colors group cursor-pointer" onClick={() => onAdd(item)}><div className="w-5 h-5 rounded bg-accent/15 flex items-center justify-center flex-shrink-0">{getIcon(item)}</div><div className="flex-1 min-w-0"><div className="text-sm text-foreground truncate">{item.name}</div><div className="text-xs text-muted-foreground/50 truncate">{item.author ? `@${item.author}` : item.desc}</div></div><Plus size={10} className="text-muted-foreground/40 group-hover:text-cherry-primary transition-colors flex-shrink-0" /></div>))}
          </div>
        )}
      </div>
      <div className="px-2.5 pb-2.5 pt-1.5 border-t border-border/15">
        <AnimatePresence>
          {showManualForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="mb-2 p-2.5 rounded-lg bg-accent/5 border border-border/15 space-y-2">
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
                  <Button variant="ghost" size="xs" onClick={() => { setShowManualForm(false); setManualName(''); setManualUrl(''); setManualDesc(''); }} className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/40">{"取消"}</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-0.5">
          <Button variant="ghost" size="xs" onClick={onExplore} className="w-full justify-start gap-2 text-muted-foreground/60 hover:text-foreground hover:bg-accent/40"><ExternalLink size={9} className="text-muted-foreground/40" /><span>{"去探索浏览"}</span></Button>
          <Button variant="ghost" size="xs" onClick={() => setShowManualForm(!showManualForm)} className={`w-full justify-start gap-2 ${showManualForm ? 'text-foreground bg-accent/15' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}><Plus size={9} className="text-muted-foreground/40" /><span>{"手动添加"}</span></Button>
        </div>
      </div>
    </div>
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
    <div className="group/mcp rounded-xl border border-border/15 bg-accent/15 overflow-hidden transition-all">
      {/* Header row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-accent/40 transition-colors" onClick={() => isConnected ? setExpanded(!expanded) : onToggleConnect()}>
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-cherry-primary' : server.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground/20'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground truncate">{server.name}</span>
            <span className={`text-xs ${statusConfig[server.status].color}`}>{statusConfig[server.status].label}</span>
            {isConnected && <span className="text-xs text-muted-foreground/50">{enabledCount}/{server.tools.length} {"个工具"}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
            <span className="text-xs text-muted-foreground/50 font-mono truncate min-w-0">{server.url}</span>
            {server.tags.map(t => (
              <span key={t}
                className="inline-flex items-center text-[10px] leading-none px-1.5 py-0.5 rounded bg-accent/40 text-muted-foreground/60 flex-shrink-0">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isConnected && <ChevronDown size={10} className={`text-muted-foreground/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />}
          <Button variant="ghost" size="icon-xs"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/mcp:opacity-100 transition-opacity"
            title="移除">
            <Trash2 size={10} />
          </Button>
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
                  <div key={tool.id} className={`flex items-center gap-2.5 px-1.5 py-[5px] rounded-md cursor-pointer transition-colors ${tool.enabled ? 'hover:bg-accent/40' : 'hover:bg-accent/40'}`} onClick={() => onToggleTool(tool.id)}>
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



function ToolchainSection({ onExplore, controlledTab }: { onExplore: () => void; controlledTab?: ToolchainTab }) {
  const [tools, setTools] = useState<ToolItem[]>(() => ALL_TOOLS_CATALOG.map(t => ({ ...t })));
  const [mcpServers, setMcpServers] = useState<MCPServerLocal[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(() =>
    ALL_INTEGRATIONS_CATALOG.slice(0, 3).map(i => ({ ...i, enabled: true })),
  );
  const [search, setSearch] = useState('');
  const [internalTab, setInternalTab] = useState<ToolchainTab>('tools');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (t: ToolchainTab) => { if (!controlledTab) setInternalTab(t); };
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [mcpTagFilter, setMcpTagFilter] = useState<string | null>(null);
  const [skillTagFilter, setSkillTagFilter] = useState<string | null>(null);
  const [toolTagFilter, setToolTagFilter] = useState<string | null>(null);
  // OAuth-style install sheet for integrations — triggered when the
  // user clicks an integration row that's not yet connected. Same dialog
  // is used in the Marketplace so the visual + permission copy stay
  // consistent between the two entry points.
  const [installIntegration, setInstallIntegration] = useState<IntegrationItem | null>(null);

  const toggleTool = (id: string) => setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  const removeTool = (id: string) => setTools(prev => prev.filter(t => t.id !== id));
  const toggleSkill = (id: string) => setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  const removeSkill = (id: string) => setSkills(prev => prev.filter(s => s.id !== id));
  const toggleIntegration = (id: string) => setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  const handleIntegrationClick = (integ: IntegrationItem) => {
    if (integ.enabled) {
      // Already connected → disconnect inline.
      toggleIntegration(integ.id);
    } else {
      setInstallIntegration(integ);
    }
  };

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
  const enabledIntegrationsCount = integrations.filter(i => i.enabled).length;

  const addedIds = useMemo(() => {
    if (activeTab === 'tools') return new Set(tools.map(t => t.id));
    if (activeTab === 'mcp') return new Set(mcpServers.map(m => m.id));
    if (activeTab === 'integrations') return new Set(integrations.map(i => i.id));
    return new Set(skills.map(s => s.id));
  }, [activeTab, tools, mcpServers, skills, integrations]);

  const filteredIntegrations = useMemo(() => {
    let list = integrations;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    }
    return list;
  }, [integrations, search]);




  const filteredTools = useMemo(() => {
    let list = tools;
    if (toolTagFilter) list = list.filter(t => t.category === toolTagFilter);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)); }
    return list;
  }, [tools, search, toolTagFilter]);

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
    { id: 'integrations' as const, label: '连接器', count: `${enabledIntegrationsCount}/${integrations.length}` },
  ];

  return (
    <div>
      <div className="space-y-6 max-w-3xl">
        {/* Header — search + add. Section title and tab bar are owned
            by the sidebar when controlledTab is set, so we drop them. */}
        <div className="flex items-center justify-end gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="搜索…"
            wrapperClassName="w-[200px] flex items-center gap-1.5 px-2 h-7 rounded-md bg-muted/30 border border-border/20" />
          <Popover open={showAddPanel} onOpenChange={setShowAddPanel}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="xs"
                className={`gap-1 h-7 px-2.5 rounded-md text-xs border border-border/30 ${
                  showAddPanel ? 'text-foreground bg-accent/25 border-border/50' : 'text-muted-foreground/80 hover:text-foreground hover:bg-accent/40'
                }`}>
                <Plus size={11} />
                <span>添加</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" sideOffset={6} className="p-0 w-[280px] overflow-hidden">
              <AddResourcePanel activeTab={activeTab} addedIds={addedIds} onAdd={handleAdd} onClose={() => setShowAddPanel(false)} onExplore={onExplore} />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="xs" onClick={onExplore}
            className="gap-1 h-7 px-2.5 rounded-md text-xs border border-border/30 text-muted-foreground/80 hover:text-foreground hover:bg-accent/40">
            <ExternalLink size={11} />
            <span>去市场浏览</span>
          </Button>
        </div>
        {!controlledTab && (
          <div className="flex items-center border-b border-border/15">
            {tabs.map(tab => (
              <Button variant="ghost" key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1.5 font-normal rounded-none ${
                  activeTab === tab.id ? 'text-foreground hover:bg-transparent' : 'text-muted-foreground/40 hover:text-foreground hover:bg-transparent'
                }`}>
                {tab.label}
                <span className={`ml-1.5 text-xs tabular-nums ${activeTab === tab.id ? 'text-muted-foreground/60' : 'text-muted-foreground/40'}`}>
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <motion.div layoutId="toolchain-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground/70 rounded-t" />
                )}
              </Button>
            ))}
          </div>
        )}
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

              {/* === Tools === */}
              {activeTab === 'tools' && (tools.length === 0 ? <TabEmptyState preset="no-code-tool" label="内置工具" onAdd={() => setShowAddPanel(true)} /> : (
                <div>
                  <TagFilter tags={TOOL_CATEGORIES} selected={toolTagFilter} onToggle={setToolTagFilter} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredTools.map(tool => {
                      const ToolIcon = tool.icon;
                      return (
                        <div key={tool.id}
                          onClick={() => toggleTool(tool.id)}
                          className={`group/tool flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/30 bg-accent/15 hover:border-border/50 hover:bg-accent/40 transition-all cursor-pointer ${tool.enabled ? '' : 'opacity-55'}`}>
                          <div className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center flex-shrink-0">
                            <ToolIcon size={13} className="text-muted-foreground/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground truncate">{tool.name}</div>
                            <div className="text-xs text-muted-foreground/55 truncate">{tool.desc}</div>
                          </div>
                          <Button variant="ghost" size="icon-xs"
                            onClick={e => { e.stopPropagation(); removeTool(tool.id); }}
                            title="移除"
                            className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/tool:opacity-100 transition-opacity flex-shrink-0">
                            <Trash2 size={11} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  {filteredTools.length === 0 && <EmptyState preset="no-result" title={search ? '未找到匹配结果' : '该分类下无工具'} compact />}
                </div>
              ))}

              {/* === MCP Servers === */}
              {activeTab === 'mcp' && (mcpServers.length === 0 ? <TabEmptyState preset="no-resource" label="MCP Server" onAdd={() => setShowAddPanel(true)} /> : (
                <div>
                  <TagFilter tags={MCP_TAGS} selected={mcpTagFilter} onToggle={setMcpTagFilter} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
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
                </div>
              ))}

              {/* === Integrations === */}
              {activeTab === 'integrations' && (integrations.length === 0 ? <TabEmptyState preset="no-resource" label="集成" onAdd={() => setShowAddPanel(true)} /> : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredIntegrations.map(integ => { const Icon = integ.icon; const brand = INTEGRATION_LOGO[integ.id]; return (
                      <div key={integ.id}
                        onClick={() => handleIntegrationClick(integ)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/15 bg-accent/15 hover:bg-accent/40 transition-all cursor-pointer ${integ.enabled ? '' : 'opacity-70'}`}>
                        {brand ? (
                          <div className="w-7 h-7 rounded-md bg-muted/40 border border-border/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src={`https://cdn.simpleicons.org/${brand.slug}/${brand.color}`} alt="" className="w-4 h-4" draggable={false} />
                          </div>
                        ) : (
                          <Icon size={15} strokeWidth={1.5} className={integ.enabled ? `${integ.tintCls} flex-shrink-0` : 'text-muted-foreground/40 flex-shrink-0'} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{integ.name}</div>
                          <div className="text-xs text-muted-foreground/50 truncate">{integ.desc}</div>
                        </div>
                        {integ.enabled ? (
                          <Switch size="sm" checked className="pointer-events-none flex-shrink-0" />
                        ) : (
                          <span className="text-xs text-muted-foreground/50 flex-shrink-0 px-1.5">未连接</span>
                        )}
                      </div>
                    ); })}
                  </div>
                  {filteredIntegrations.length === 0 && <EmptyState preset="no-result" title={search ? '未找到匹配结果' : '暂无集成'} compact />}
                </div>
              ))}

              {/* === Skills === */}
              {activeTab === 'skills' && (skills.length === 0 ? <TabEmptyState preset="no-resource" label="Skill" onAdd={() => setShowAddPanel(true)} /> : (
                <div>
                  <TagFilter tags={SKILL_TAGS} selected={skillTagFilter} onToggle={setSkillTagFilter} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredSkills.map(skill => {
                      const SkillIcon = skill.icon;
                      return (
                        <div key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className={`group/skill flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/30 bg-accent/15 hover:border-border/50 hover:bg-accent/40 transition-all cursor-pointer ${skill.enabled ? '' : 'opacity-55'}`}>
                          <div className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center flex-shrink-0">
                            <SkillIcon size={13} className="text-muted-foreground/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground truncate">{skill.name}</div>
                            <div className="text-xs text-muted-foreground/55 truncate">{skill.desc}</div>
                          </div>
                          <Button variant="ghost" size="icon-xs"
                            onClick={e => { e.stopPropagation(); removeSkill(skill.id); }}
                            title="移除"
                            className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/skill:opacity-100 transition-opacity flex-shrink-0">
                            <Trash2 size={11} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  {filteredSkills.length === 0 && <EmptyState preset="no-result" title={search ? '未找到匹配结果' : '该分类下无 Skill'} compact />}
                </div>
              ))}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* OAuth-style install sheet — shared visual with the Market's
          InstallIntegrationDialog so user sees the same scopes /
          permission card / branded logos regardless of where they
          triggered the connect from. */}
      <InstallIntegrationDialog
        item={installIntegration ? {
          id: installIntegration.id,
          kind: 'integration',
          name: installIntegration.name,
          tagline: installIntegration.desc,
          author: '',
          avatar: '🔌',
          avatarBg: 'bg-muted/30',
          category: '集成',
          ageLabel: '',
          installs: 0,
        } : null}
        installed={false}
        onOpenChange={(open) => { if (!open) setInstallIntegration(null); }}
        onConfirm={() => {
          if (installIntegration) toggleIntegration(installIntegration.id);
          setInstallIntegration(null);
        }}
      />
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
  // 知识库识别 — 'off' / 'on' segment, matches Cherry Studio source's
  // AssistantKnowledgeBaseSettings.knowledgeRecognition.
  const [recognition, setRecognition] = useState<'off' | 'on'>('off');
  // 自动关联 — when ON, Cherry picks relevant KBs per query and the
  // manual list below is hidden. When OFF, fall back to the manual
  // "已关联知识库" picker.
  const [autoLink, setAutoLink] = useState(true);

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
    <div className="max-w-3xl space-y-3">
      {/* 自动关联 — top-level toggle. When on, Cherry decides per query;
          when off, user manually curates the list below. */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <label className="text-sm text-muted-foreground">自动关联</label>
          <SimpleTooltip
            content="开启后 Cherry 自动判断当前消息需要哪些知识库；关闭后由你手动选择固定关联的知识库。"
            side="top"
            sideOffset={6}
          >
            <button type="button" tabIndex={-1}
              className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help"
              aria-label="什么是自动关联">
              <Info size={12} />
            </button>
          </SimpleTooltip>
        </div>
        <Switch checked={autoLink} onCheckedChange={setAutoLink} className="flex-shrink-0" />
      </div>

      {/* Manual KB list — only shown when 自动关联 is off. */}
      {!autoLink && (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-muted-foreground">已关联知识库</label>
          <Popover open={showAddPanel} onOpenChange={(v) => { setShowAddPanel(v); if (v) { setAddSearch(''); setAddGroupFilter('全部'); } }}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="xs"
                className="flex items-center gap-1 h-7 px-2.5 rounded-md text-xs text-muted-foreground/80 hover:text-foreground hover:bg-accent/40 border border-border/30">
                <Plus size={11} /><span>添加知识库</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-[340px] overflow-hidden">
              <div className="px-3 pt-3 pb-2">
                <SearchInput value={addSearch} onChange={setAddSearch} placeholder="搜索知识库..." clearable wrapperClassName="flex items-center gap-1.5 px-2.5 py-[6px] rounded-lg bg-accent/15 border border-border/15" autoFocus />
              </div>
              <div className="px-3 pb-2 flex flex-wrap gap-1">
                {KB_GROUPS.map(g => (
                  <Button variant="ghost" size="xs" key={g} onClick={() => setAddGroupFilter(g)}
                    className={`px-1.5 py-[2px] rounded-full text-xs ${addGroupFilter === g ? 'bg-accent/50 border border-border/30 text-foreground' : 'border border-transparent text-muted-foreground/50 hover:text-foreground'}`}>{g}</Button>
                ))}
              </div>
              <div className="max-h-[240px] overflow-y-auto px-1.5 pb-2 scrollbar-thin">
                {filteredCatalog.length === 0 ? (
                  <EmptyState preset="no-result" title="无匹配知识库" compact />
                ) : (
                  <div className="space-y-0.5">
                    {filteredCatalog.map(kb => (
                      <div key={kb.id} onClick={() => addKB(kb)}
                        className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg hover:bg-accent/40 transition-colors cursor-pointer group">
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
        {linkedKBs.length === 0 ? (
          <EmptyState
            preset="no-knowledge"
            title="尚未关联任何知识库"
            description="关联知识库后，智能体可检索其中的内容来回答问题"
            compact
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {linkedKBs.map(kb => (
              <motion.div key={kb.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/15 bg-accent/15 hover:bg-accent/40 transition-all group">
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

      </div>
      )}

      {/* 知识库识别 — Switch row, matches Cherry Studio source pattern
          (knowledgeRecognition off/on Segmented + question tooltip).
          Retrieval params (Top-K, similarity threshold) are not part of
          source's AssistantKnowledgeBaseSettings — they belong on the
          knowledge base itself, configured in 资源库 → 知识库. */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/15">
        <div className="flex items-center gap-1.5 min-w-0">
          <label className="text-sm text-muted-foreground">知识库识别</label>
          <SimpleTooltip
            content="开启后助手自动判断是否需要检索已引用的知识库；关闭则每条消息都强制检索。"
            side="top"
            sideOffset={6}
          >
            <button
              type="button"
              tabIndex={-1}
              className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help"
              aria-label="什么是知识库识别"
            >
              <Info size={12} />
            </button>
          </SimpleTooltip>
        </div>
        <Switch
          checked={recognition === 'on'}
          onCheckedChange={(v) => setRecognition(v ? 'on' : 'off')}
          className="flex-shrink-0"
        />
      </div>
    </div>
  );
}

// ===========================
// Notes Section — read / write / manage permissions for user notes
// ===========================

// Mock note tree — in production this comes from the notes feature.
// Notes can live at any depth; folders carry children.
interface NoteNode {
  id: string;
  type: 'folder' | 'note';
  title: string;
  updatedAt: string;
  children?: NoteNode[];
}

const MOCK_NOTE_TREE: NoteNode[] = [
  {
    id: 'nf-prod', type: 'folder', title: '产品', updatedAt: '今天',
    children: [
      { id: 'n-1', type: 'note', title: '产品周会纪要', updatedAt: '2 天前' },
      { id: 'n-7', type: 'note', title: 'PRD: 新版编辑器', updatedAt: '5 天前' },
      {
        id: 'nf-research', type: 'folder', title: '调研', updatedAt: '1 周前',
        children: [
          { id: 'n-3', type: 'note', title: '客户访谈记录', updatedAt: '2 周前' },
          { id: 'n-4', type: 'note', title: '竞品分析', updatedAt: '3 周前' },
        ],
      },
    ],
  },
  {
    id: 'nf-eng', type: 'folder', title: '工程', updatedAt: '昨天',
    children: [
      { id: 'n-2', type: 'note', title: 'API 设计稿', updatedAt: '1 周前' },
      { id: 'n-5', type: 'note', title: '架构演进备忘', updatedAt: '1 个月前' },
      { id: 'n-8', type: 'note', title: '部署 Runbook', updatedAt: '2 个月前' },
    ],
  },
  { id: 'n-6', type: 'note', title: '随笔：阅读笔记', updatedAt: '昨天' },
];

// Flatten the tree into a path-aware list, used for both search and
// "find selected node" lookups.
function flattenNoteTree(nodes: NoteNode[], parents: NoteNode[] = []): { node: NoteNode; path: NoteNode[] }[] {
  return nodes.flatMap(node => {
    const here = { node, path: parents };
    const children = node.children ? flattenNoteTree(node.children, [...parents, node]) : [];
    return [here, ...children];
  });
}

const ALL_NOTE_FLAT = flattenNoteTree(MOCK_NOTE_TREE);

function findNoteNode(id: string): NoteNode | null {
  return ALL_NOTE_FLAT.find(({ node }) => node.id === id)?.node ?? null;
}

function getNodesAtPath(path: string[]): NoteNode[] {
  let level = MOCK_NOTE_TREE;
  for (const id of path) {
    const found = level.find(n => n.id === id);
    if (!found?.children) return [];
    level = found.children;
  }
  return level;
}

function AgentNotesSection() {
  // 总开关 — 关闭后整个笔记能力对智能体不可见（读 / 写 / 管理都失效）。
  const [notesEnabled, setNotesEnabled] = useState(true);

  // 读取
  const [readEnabled, setReadEnabled] = useState(true);
  // 'auto' = 智能体自行判断；'specified' = 用户指定一批可读笔记/文件夹
  const [readScope, setReadScope] = useState<'auto' | 'specified'>('auto');
  // Both folders and notes can be picked — selecting a folder grants
  // read on the entire subtree.
  const [pickedIds, setPickedIds] = useState<Set<string>>(() => new Set(['n-1']));
  const [notePickerOpen, setNotePickerOpen] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');
  // Hierarchical browse — folder ids from root → current.
  const [browsePath, setBrowsePath] = useState<string[]>([]);

  // 写入
  const [writeEnabled, setWriteEnabled] = useState(false);
  // 管理 / 删除
  const [manageEnabled, setManageEnabled] = useState(false);

  // Items shown in the popover:
  //   - 搜索时：跨层级 flat 结果（含 path）
  //   - 默认：当前 browsePath 这一层的子项
  // 已选中的项隐藏掉，跟知识库 add 行为一致。
  const browseItems = useMemo(() => {
    const q = noteSearch.trim().toLowerCase();
    if (q) {
      return ALL_NOTE_FLAT
        .filter(({ node }) => !pickedIds.has(node.id) && node.title.toLowerCase().includes(q));
    }
    return getNodesAtPath(browsePath)
      .filter(node => !pickedIds.has(node.id))
      .map(node => ({ node, path: [] as NoteNode[] }));
  }, [noteSearch, browsePath, pickedIds]);

  const breadcrumbNodes = useMemo(
    () => browsePath.map(id => findNoteNode(id)).filter((n): n is NoteNode => !!n),
    [browsePath],
  );

  const pickedNodes = useMemo(
    () => Array.from(pickedIds).map(id => findNoteNode(id)).filter((n): n is NoteNode => !!n),
    [pickedIds],
  );

  const addNode = (node: NoteNode) => {
    setPickedIds(prev => new Set(prev).add(node.id));
  };

  const removeNode = (id: string) => {
    setPickedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const enterFolder = (id: string) => {
    setBrowsePath(prev => [...prev, id]);
    setNoteSearch('');
  };

  const goToCrumb = (index: number) => {
    // index === -1 → root (笔记)
    setBrowsePath(prev => prev.slice(0, index + 1));
    setNoteSearch('');
  };

  // 笔记内 N 条（递归）— 用于已选文件夹卡片副文本。
  const countNotesInside = (node: NoteNode): number => {
    if (node.type === 'note') return 1;
    return (node.children ?? []).reduce((acc, c) => acc + countNotesInside(c), 0);
  };

  return (
    <div className="max-w-3xl space-y-3">
      {/* 使用笔记 — 总开关。关闭后下方所有读 / 写 / 管理配置隐藏，
          智能体完全感知不到笔记能力。 */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/15">
        <div className="flex items-center gap-1.5 min-w-0">
          <label className="text-sm font-medium text-foreground">使用笔记</label>
          <SimpleTooltip content="关闭后智能体完全不感知笔记能力（读、写、管理全部失效）。" side="top" sideOffset={6}>
            <button type="button" tabIndex={-1}
              className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help"
              aria-label="什么是使用笔记">
              <Info size={12} />
            </button>
          </SimpleTooltip>
        </div>
        <Switch checked={notesEnabled} onCheckedChange={setNotesEnabled} className="flex-shrink-0" />
      </div>

      {notesEnabled && <>
      {/* 读取 */}
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <label className="text-sm text-muted-foreground">读取权限</label>
            <SimpleTooltip content="关闭后智能体完全无法访问你的笔记内容。" side="top" sideOffset={6}>
              <button type="button" tabIndex={-1}
                className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help"
                aria-label="什么是读取权限">
                <Info size={12} />
              </button>
            </SimpleTooltip>
          </div>
          <Switch checked={readEnabled} onCheckedChange={setReadEnabled} className="flex-shrink-0" />
        </div>

        {readEnabled && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <label className="text-sm text-muted-foreground">自动读取</label>
                <span className="text-xs text-muted-foreground/45 mt-0.5">
                  {readScope === 'auto' ? '助手按意图自动选择需要读取的笔记' : '仅读取下方手动指定的范围'}
                </span>
              </div>
              <Switch
                checked={readScope === 'auto'}
                onCheckedChange={(v) => setReadScope(v ? 'auto' : 'specified')}
                className="flex-shrink-0"
              />
            </div>

            {/* 已指定笔记 — 同知识库添加的形式：右上「添加笔记」popover +
                下方已选卡片 grid + 空态。Popover 支持文件夹层级浏览 +
                跨层级搜索，选中文件夹相当于授权整个子树。 */}
            {readScope === 'specified' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-muted-foreground">已指定笔记</label>
                  <Popover open={notePickerOpen} onOpenChange={(v) => { setNotePickerOpen(v); if (v) { setNoteSearch(''); setBrowsePath([]); } }}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="xs"
                        className="flex items-center gap-1 h-7 px-2.5 rounded-md text-xs text-muted-foreground/80 hover:text-foreground hover:bg-accent/40 border border-border/30">
                        <Plus size={11} /><span>添加笔记</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="p-0 w-[340px] overflow-hidden">
                      <div className="px-3 pt-3 pb-2">
                        <SearchInput
                          value={noteSearch}
                          onChange={setNoteSearch}
                          placeholder="搜索笔记 / 文件夹..."
                          clearable
                          wrapperClassName="flex items-center gap-1.5 px-2.5 py-[6px] rounded-lg bg-accent/15 border border-border/15"
                          autoFocus
                        />
                      </div>

                      {/* Breadcrumb — only when not searching */}
                      {!noteSearch.trim() && (
                        <div className="px-3 pb-2 flex items-center gap-0.5 text-xs text-muted-foreground/60 overflow-x-auto scrollbar-hide">
                          <button type="button" onClick={() => goToCrumb(-1)}
                            className={`px-1.5 py-[2px] rounded text-xs leading-none transition-colors hover:bg-accent/40 ${browsePath.length === 0 ? 'text-foreground font-medium' : 'hover:text-foreground'}`}>
                            笔记
                          </button>
                          {breadcrumbNodes.map((node, i) => (
                            <React.Fragment key={node.id}>
                              <ChevronRight size={9} className="text-muted-foreground/40 flex-shrink-0" />
                              <button type="button" onClick={() => goToCrumb(i)}
                                className={`px-1.5 py-[2px] rounded text-xs leading-none transition-colors hover:bg-accent/40 truncate max-w-[100px] ${i === breadcrumbNodes.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground'}`}>
                                {node.title}
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      <div className="max-h-[240px] overflow-y-auto px-1.5 pb-2 scrollbar-thin">
                        {browseItems.length === 0 ? (
                          <EmptyState preset="no-result" title={noteSearch ? '无匹配项' : '空文件夹'} compact />
                        ) : (
                          <div className="space-y-0.5">
                            {browseItems.map(({ node, path }) => {
                              const isFolder = node.type === 'folder';
                              const Icon = isFolder ? FolderOpen : FileEdit;
                              return (
                                <div key={node.id}
                                  className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg hover:bg-accent/40 transition-colors cursor-pointer group"
                                  onClick={() => { if (isFolder && !noteSearch) enterFolder(node.id); else addNode(node); }}
                                >
                                  <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${isFolder ? 'bg-accent-amber-muted' : 'bg-accent/50'}`}>
                                    <Icon size={11} className={isFolder ? 'text-accent-amber' : 'text-muted-foreground/70'} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-foreground truncate">{node.title}</div>
                                    <div className="text-xs text-muted-foreground/50 truncate">
                                      {path.length > 0 && (
                                        <span className="font-mono">{path.map(p => p.title).join(' / ')} · </span>
                                      )}
                                      {isFolder ? `${countNotesInside(node)} 条笔记` : node.updatedAt}
                                    </div>
                                  </div>
                                  {/* For folders: chevron to drill in (when not searching);
                                      + button to add whole subtree. For notes: just +. */}
                                  {isFolder && !noteSearch && (
                                    <Button variant="ghost" size="icon-xs"
                                      onClick={(e) => { e.stopPropagation(); addNode(node); }}
                                      className="text-muted-foreground/40 hover:text-cherry-primary opacity-0 group-hover:opacity-100"
                                      title="添加整个文件夹">
                                      <Plus size={11} />
                                    </Button>
                                  )}
                                  {isFolder && !noteSearch ? (
                                    <ChevronRight size={11} className="text-muted-foreground/40 flex-shrink-0" />
                                  ) : (
                                    <Plus size={10} className="text-muted-foreground/40 group-hover:text-cherry-primary transition-colors flex-shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {pickedNodes.length === 0 ? (
                  <EmptyState
                    preset="no-resource"
                    title="尚未指定笔记"
                    description="点击右上「添加笔记」从笔记库中选择，文件夹或单条笔记都可以。"
                    compact
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pickedNodes.map(n => {
                      const isFolder = n.type === 'folder';
                      const Icon = isFolder ? FolderOpen : FileEdit;
                      return (
                        <motion.div key={n.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/15 bg-accent/15 hover:bg-accent/40 transition-all group">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isFolder ? 'bg-accent-amber-muted' : 'bg-accent/60'}`}>
                            <Icon size={14} className={isFolder ? 'text-accent-amber' : 'text-muted-foreground/70'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground truncate">{n.title}</div>
                            <div className="text-xs text-muted-foreground/50">
                              {isFolder ? `整个文件夹 · ${countNotesInside(n)} 条笔记` : n.updatedAt}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon-xs" onClick={() => removeNode(n.id)} className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 opacity-0 group-hover:opacity-100"><Trash2 size={11} /></Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* 写入 */}
      <section className="space-y-2 pt-2 border-t border-border/15">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <label className="text-sm text-muted-foreground">写入权限</label>
            <SimpleTooltip content="开启后智能体可新建或编辑笔记内容；建议配合「管理删除」一起决策。" side="top" sideOffset={6}>
              <button type="button" tabIndex={-1}
                className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help"
                aria-label="什么是写入权限">
                <Info size={12} />
              </button>
            </SimpleTooltip>
          </div>
          <Switch checked={writeEnabled} onCheckedChange={setWriteEnabled} className="flex-shrink-0" />
        </div>
      </section>

      {/* 管理 / 删除 */}
      <section className="space-y-2 pt-2 border-t border-border/15">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <label className="text-sm text-muted-foreground">管理 / 删除权限</label>
            <SimpleTooltip content="开启后智能体可删除笔记或移动文件夹，删除操作进入回收站可恢复。" side="top" sideOffset={6}>
              <button type="button" tabIndex={-1}
                className="inline-flex items-center text-muted-foreground/40 hover:text-muted-foreground cursor-help"
                aria-label="什么是管理删除权限">
                <Info size={12} />
              </button>
            </SimpleTooltip>
          </div>
          <Switch checked={manageEnabled} onCheckedChange={setManageEnabled} className="flex-shrink-0" />
        </div>
      </section>
      </>}
    </div>
  );
}

function AgentAdvancedSection() {
  const [maxRounds, setMaxRounds] = useState(10);
  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">{"最大执行轮次"} <span className="text-muted-foreground/50 ml-1">{maxRounds}</span></label>
        <Slider min={1} max={100} step={1} value={[maxRounds]} onValueChange={([v]) => setMaxRounds(v)} />
        <div className="flex justify-between mt-1"><span className="text-xs text-muted-foreground/50">1</span><span className="text-xs text-muted-foreground/50">100</span></div>
        <p className="text-xs text-muted-foreground/50 mt-2">{"每次会话中智能体与工具交互的最大轮次数。达到上限后将停止执行并返回当前结果。"}</p>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (<div><label className="text-sm text-muted-foreground mb-1.5 block">{label}</label>{children}</div>);
}

// ===========================
// Agent Collaboration Section (协作)
// ===========================

interface CloneRecord {
  userName: string;
  userAvatarInitial: string;
  userAvatarColor: string;  // tailwind gradient classes
  time: string;
}

// Mock clone history — illustrative only, no real persistence.
const MOCK_CLONE_HISTORY: CloneRecord[] = [
  { userName: '张三', userAvatarInitial: '张', userAvatarColor: 'from-amber-400 to-orange-500', time: '今天 10:32' },
  { userName: '李四', userAvatarInitial: '李', userAvatarColor: 'from-emerald-400 to-teal-500', time: '昨天 16:45' },
  { userName: '王五', userAvatarInitial: '王', userAvatarColor: 'from-rose-400 to-pink-500', time: '2026-05-25 14:20' },
  { userName: '赵六', userAvatarInitial: '赵', userAvatarColor: 'from-violet-400 to-purple-500', time: '2026-05-22 09:05' },
  { userName: '孙七', userAvatarInitial: '孙', userAvatarColor: 'from-cyan-400 to-blue-500', time: '2026-05-18 21:11' },
];

function AgentCollaborationSection() {
  const { boundEmail: userEmail } = useCollab();
  const [agentEmail, setAgentEmail] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [cloneable, setCloneable] = useState(false);
  const [cloneHistoryOpen, setCloneHistoryOpen] = useState(false);

  const cloneCount = MOCK_CLONE_HISTORY.length;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Section header */}
      <div>
        <p className="text-xs text-muted-foreground/55">
          Agent 在协作模块（群组 + 话题）里收发消息所需的配置。
        </p>
      </div>

      {/* Agent email */}
      <div className="rounded-lg border border-border/40 bg-card/30 p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-sm text-foreground/85">
          <Mail size={13} strokeWidth={1.6} />
          <span>Agent 邮箱</span>
        </div>
        <p className="text-xs text-muted-foreground/55 leading-relaxed">
          Agent 需要一个独立邮箱用于收发协作消息，必须与你的用户邮箱不同。
        </p>
        {agentEmail ? (
          <div className="flex items-center justify-between mt-1 px-2.5 py-2 rounded-md bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <CheckCircle2 size={11} strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-sm text-foreground">{agentEmail}</div>
                <div className="text-xs text-muted-foreground/55">已绑定</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAgentEmail(null)} className="text-muted-foreground/55 hover:text-destructive text-xs h-7">
              解绑
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setWizardOpen(true)} className="w-full mt-1 border-dashed text-muted-foreground/65 hover:text-foreground">
            为 Agent 绑定邮箱
          </Button>
        )}
        {!userEmail && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            提示：你尚未绑定用户邮箱，建议先去左下角个人信息里完成。
          </p>
        )}
      </div>

      {/* Clone permission — adds an inline "已被克隆 N 次" stat that opens
          the clone history modal. Stat stays visible regardless of toggle
          state since the history is retrospective. */}
      <div className="rounded-lg border border-border/40 bg-card/30 p-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-foreground/90">允许被克隆</div>
            <div className="text-xs text-muted-foreground/55 leading-relaxed mt-0.5">
              开启后，其他成员可以把这个 Agent 克隆到自己本地，用他们的 token 跑。
            </div>
          </div>
          <Switch checked={cloneable} onCheckedChange={setCloneable} />
        </div>
        {cloneCount > 0 && (
          <button
            type="button"
            onClick={() => setCloneHistoryOpen(true)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-primary transition-colors"
          >
            已被克隆 <span className="text-foreground/85 font-medium">{cloneCount}</span> 次
            <ChevronRight size={11} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <EmailAuthWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={(email) => { setAgentEmail(email); setWizardOpen(false); }}
        forbidEmail={userEmail ?? undefined}
        title="为 Agent 绑定邮箱"
        description="Agent 邮箱必须与你的用户邮箱不同"
      />

      <CloneHistoryDialog
        open={cloneHistoryOpen}
        onClose={() => setCloneHistoryOpen(false)}
        records={MOCK_CLONE_HISTORY}
      />
    </div>
  );
}

function CloneHistoryDialog({
  open, onClose, records,
}: { open: boolean; onClose: () => void; records: CloneRecord[] }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>克隆记录</DialogTitle>
          <DialogDescription>
            共 {records.length} 次克隆 · 谁、什么时候把这个 Agent 克隆到了自己本地
          </DialogDescription>
        </DialogHeader>
        <div className="border border-border rounded-md max-h-[320px] overflow-y-auto">
          {records.length === 0 ? (
            <div className="text-center text-[12px] text-muted-foreground py-8">
              还没有克隆记录
            </div>
          ) : (
            records.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 border-b border-border/30 last:border-b-0"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${r.userAvatarColor} text-white text-[12px] flex items-center justify-center flex-shrink-0`}>
                  {r.userAvatarInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] text-foreground truncate">{r.userName}</div>
                  <div className="text-[10.5px] text-muted-foreground">克隆于 {r.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
