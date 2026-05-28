import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, ChevronRight, ChevronDown, Save, Trash2,
  FileJson, FileText, FileCode, Archive, ExternalLink,
  Tag, Clock, User, Package, RefreshCw, X, MessageSquare,
  Folder, FolderOpen, File as FileIconLucide,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ResourceItem } from '@/app/types';
import { RESOURCE_TYPE_CONFIG, TAG_COLORS, DEFAULT_TAG_COLOR } from '@/app/config/constants';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Input, Textarea, Typography } from '@cherry-studio/ui';
import { Separator } from "@cherry-studio/ui";
// Switch stays on legacy `@cherry-studio/ui` — v2's is visually
// inferior (per the user).
import { Switch } from '@cherry-studio/ui';
import { Combobox } from '@cherrystudio/ui/components/primitives/combobox';
import { Field, FieldContent, FieldLabel } from '@cherrystudio/ui/components/primitives/field';

interface Props {
  resource: ResourceItem;
  onBack: () => void;
  onToggle: (id: string) => void;
  onDelete: (resource: ResourceItem) => void;
  /** When true, hosted inside the library config modal — drop the
   * internal breadcrumb/back/cancel chrome (the modal frame supplies
   * the avatar header + close X). */
  inModal?: boolean;
}

// ============================================================
// Mock Skill bundle file tree
// ============================================================
// Real Skills published to the library are multi-file packages: a
// root SKILL.md plus subfolders for agents, assets, scripts, etc.
// We model the tree statically here so the new viewer (tree + content
// preview) reads as a real package browser instead of a single-file
// stub.

interface SkillFileNode {
  name: string;
  path: string;            // full path inside the bundle
  type: 'file' | 'folder';
  children?: SkillFileNode[];
}

function buildSkillTree(): SkillFileNode[] {
  const f = (path: string, name = path.split('/').pop()!): SkillFileNode => ({ name, path, type: 'file' });
  return [
    f('SKILL.md'),
    {
      name: 'agents', path: 'agents', type: 'folder', children: [
        f('agents/analyzer.md'),
        f('agents/comparator.md'),
        f('agents/grader.md'),
      ],
    },
    {
      name: 'assets', path: 'assets', type: 'folder', children: [
        f('assets/eval_review.html'),
      ],
    },
    {
      name: 'eval-viewer', path: 'eval-viewer', type: 'folder', children: [
        f('eval-viewer/generate_review.py'),
        f('eval-viewer/viewer.html'),
      ],
    },
    {
      name: 'references', path: 'references', type: 'folder', children: [
        f('references/schemas.md'),
      ],
    },
    {
      name: 'scripts', path: 'scripts', type: 'folder', children: [
        f('scripts/__init__.py'),
        f('scripts/aggregate_benchmark.py'),
        f('scripts/generate_report.py'),
        f('scripts/improve_skill.py'),
        f('scripts/package_skill.py'),
        f('scripts/quick_validate.py'),
        f('scripts/run_eval.py'),
      ],
    },
  ];
}

function mockSkillFileContent(path: string, resource: ResourceItem): string {
  if (path === 'SKILL.md') {
    return [
      `# ${resource.name}`,
      '',
      'A skill for creating new skills and iteratively improving them.',
      '',
      'At a high level, the process of creating a skill goes like this:',
      '',
      '- Decide what you want the skill to do and roughly how it should do it',
      '- Write a draft of the skill',
      '- Create a few test prompts and run claude-with-access-to-the-skill on them',
      '- Help the user evaluate the results both qualitatively and quantitatively',
      '- While the runs happen in the background, draft some quantitative evals if there aren\'t any (if there are some, you can either use as is, or modify if you feel something doesn\'t feel right or doesn\'t match what the user wants)',
      '- After runs finish, evaluate the outputs qualitatively, focusing on the user\'s instructions and goals',
      '- Run the quantitative evals if any were defined; aggregate their results into the final report',
      '- Iterate on the skill until the evals show good performance',
    ].join('\n');
  }
  if (path.endsWith('.md')) {
    return `# ${path.split('/').pop()?.replace('.md', '')}\n\nMock markdown content for **${path}**.\n\n- bullet one\n- bullet two\n- bullet three`;
  }
  if (path.endsWith('.py')) {
    return `"""${path.split('/').pop()}\n\nAutomated helper script.\n"""\n\nfrom __future__ import annotations\nimport json\nimport sys\nfrom pathlib import Path\n\n\ndef main() -> int:\n    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()\n    payload = {"source": str(src), "ok": True}\n    print(json.dumps(payload, indent=2))\n    return 0\n\n\nif __name__ == "__main__":\n    raise SystemExit(main())\n`;
  }
  if (path.endsWith('.html')) {
    return `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <title>${path.split('/').pop()}</title>\n  </head>\n  <body>\n    <h1>${path.split('/').pop()}</h1>\n    <p>Mock preview for this asset.</p>\n  </body>\n</html>`;
  }
  return `// ${path}\n// (no preview available)`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return `${Math.floor(days / 30)} 个月前`;
}

// File-tree icon resolver — matches the agent FileExplorer styling
// so the two views feel like siblings.
function getSkillFileIcon(name: string, size = 12) {
  const cls = 'text-muted-foreground/60 flex-shrink-0';
  if (name.endsWith('.md')) return <FileText size={size} className={cls} />;
  if (name.endsWith('.py') || name.endsWith('.html') || name.endsWith('.js') || name.endsWith('.ts')) return <FileCode size={size} className={cls} />;
  if (name.endsWith('.json')) return <FileJson size={size} className={cls} />;
  return <FileIconLucide size={size} className={cls} />;
}

function SkillFileTree({
  nodes,
  selectedPath,
  onSelect,
  expanded,
  onToggleExpand,
  depth = 0,
}: {
  nodes: SkillFileNode[];
  selectedPath: string;
  onSelect: (path: string) => void;
  expanded: Set<string>;
  onToggleExpand: (path: string) => void;
  depth?: number;
}) {
  return (
    <div className="space-y-px">
      {nodes.map(node => {
        if (node.type === 'folder') {
          const isOpen = expanded.has(node.path);
          return (
            <div key={node.path}>
              <button
                type="button"
                onClick={() => onToggleExpand(node.path)}
                className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-accent/40 transition-colors"
                style={{ paddingLeft: depth * 10 + 6 }}
              >
                {isOpen
                  ? <ChevronDown size={9} className="text-muted-foreground/50 flex-shrink-0" />
                  : <ChevronRight size={9} className="text-muted-foreground/50 flex-shrink-0" />}
                {isOpen
                  ? <FolderOpen size={12} className="text-muted-foreground/80 flex-shrink-0" />
                  : <Folder size={12} className="text-muted-foreground/80 flex-shrink-0" />}
                <span className="truncate">{node.name}</span>
              </button>
              {isOpen && node.children && (
                <SkillFileTree
                  nodes={node.children}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                  expanded={expanded}
                  onToggleExpand={onToggleExpand}
                  depth={depth + 1}
                />
              )}
            </div>
          );
        }
        const active = node.path === selectedPath;
        return (
          <button
            key={node.path}
            type="button"
            onClick={() => onSelect(node.path)}
            className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-left transition-colors ${
              active ? 'bg-accent/60 text-foreground font-medium' : 'text-muted-foreground/80 hover:text-foreground hover:bg-accent/40'
            }`}
            style={{ paddingLeft: depth * 10 + 18 }}
          >
            {getSkillFileIcon(node.name, 11)}
            <span className="truncate font-mono">{node.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SkillPluginDetail({ resource, onBack, onToggle, onDelete, inModal = false }: Props) {
  const [description, setDescription] = useState(resource.description);
  const [tags, setTags] = useState(resource.tags);
  const [newTag, setNewTag] = useState('');
  const [saved, setSaved] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const skillTree = useMemo(buildSkillTree, []);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('SKILL.md');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set(['agents', 'scripts']));
  const toggleFolder = (path: string) => setExpandedFolders(prev => {
    const next = new Set(prev);
    if (next.has(path)) next.delete(path); else next.add(path);
    return next;
  });

  const cfg = RESOURCE_TYPE_CONFIG[resource.type];
  const Icon = cfg.icon;
  const isPlugin = resource.type === 'plugin';

  const FileIcon = resource.fileType === 'zip' ? Archive : resource.fileType === 'json' ? FileJson : FileText;

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const addTag = () => {
    const t = newTag.trim();
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); }
    setNewTag('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const mockContentPreview = resource.fileType === 'md'
    ? `# ${resource.name}\n\n${resource.description}\n\n## 使用方法\n\n输入任意网页链接，自动提取核心内容并生成结构化摘要。\n\n## 输出格式\n\n- **标题**: 文章标题\n- **摘要**: 150字以内的核心内容\n- **关键词**: 3-5个关键标签`
    : resource.fileType === 'json'
    ? JSON.stringify({
        name: resource.name,
        version: resource.version || '1.0.0',
        description: resource.description,
        author: resource.author || 'unknown',
        parameters: { input: 'string', max_length: 'number' },
      }, null, 2)
    : `\u251C\u2500\u2500 manifest.json\n\u251C\u2500\u2500 plugin.js\n\u251C\u2500\u2500 README.md\n\u251C\u2500\u2500 assets/\n\u2502   \u2514\u2500\u2500 icon.png\n\u2514\u2500\u2500 lib/\n    \u251C\u2500\u2500 core.js\n    \u2514\u2500\u2500 utils.js`;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {!inModal && (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border/15 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-colors">
            <ArrowLeft size={14} />
          </Button>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
            <span className="hover:text-foreground cursor-pointer transition-colors" onClick={onBack}>资源库</span>
            <ChevronRight size={9} />
            <span className="text-foreground">{resource.name}</span>
            <span className="text-muted-foreground/50 ml-1">({cfg.label})</span>
          </div>
          <div className="flex-1" />
          <AnimatePresence>
            {saved && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs text-cherry-primary">已保存</motion.span>}
          </AnimatePresence>
          <Button variant="outline" size="sm" onClick={onBack} className="px-3 rounded-lg text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 border border-border/20 transition-all">取消</Button>
          <Button variant="default" size="sm" onClick={handleSave} className="flex items-center gap-1.5 px-3 rounded-lg text-xs transition-colors active:scale-[0.97]">
            <Save size={10} /><span>保存</span>
          </Button>
        </div>
      )}

      {inModal ? (
        // Single-column layout per design feedback:
        //   - Top: editable description (intro paragraph)
        //   - Middle: rendered SKILL.md body (markdown preview)
        //   - Bottom: 回收 + 在对话中试用 CTAs
        // File-tree / per-file preview removed — for skills the SKILL.md
        // body is the canonical "what does this do" surface, the rest
        // is implementation detail surfaced elsewhere.
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="px-6 py-5 space-y-5">
              {/* Description — editable inline */}
              <p
                onClick={() => setEditingDesc(true)}
                className={`text-sm leading-relaxed cursor-text rounded-lg transition-all ${
                  editingDesc ? '' : 'px-3 py-2 -mx-3 hover:bg-accent/40 text-muted-foreground'
                }`}
              >
                {editingDesc ? (
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    onBlur={() => setEditingDesc(false)}
                    autoFocus
                    rows={4}
                    placeholder="为这个 Skill 写一段简短描述"
                    className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-border/60 bg-accent/15 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:border-border focus-visible:ring-0 resize-none"
                  />
                ) : (
                  description || '点击添加描述...'
                )}
              </p>

              <Separator opacity={30} />

              {/* Rendered SKILL.md body */}
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed text-sm space-y-3">
                {mockSkillFileContent('SKILL.md', resource).split('\n\n').map((para, i) => {
                  if (para.startsWith('# ')) return <h2 key={i} className="text-base font-semibold text-foreground mt-1 mb-2">{para.slice(2)}</h2>;
                  if (para.startsWith('## ')) return <h3 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1.5">{para.slice(3)}</h3>;
                  if (para.startsWith('- ')) {
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                        {para.split('\n').map((line, j) => (
                          <li key={j}>{line.replace(/^- /, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="text-muted-foreground">{para}</p>;
                })}
              </div>
            </div>
          </div>

          {/* Footer — 回收 left, 在对话中试用 right (per screenshot) */}
          <div className="flex-shrink-0 flex items-center justify-between gap-2 px-5 py-3 border-t border-border/15 bg-background/95">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(resource)}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={11} />
              <span>回收</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90"
            >
              <MessageSquare size={11} />
              <span>在对话中试用</span>
            </Button>
          </div>
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">

          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${cfg.color}`}>
              {resource.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base text-foreground">{resource.name}</h2>
                {resource.hasUpdate && (
                  <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-accent-orange-muted text-accent-orange">
                    <RefreshCw size={8} /> 有新版本
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                <span className={`px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                {resource.version && <span>v{resource.version}</span>}
                {resource.author && <span className="flex items-center gap-1"><User size={9} />{resource.author}</span>}
              </div>
            </div>
            {/* Enable toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground/40">{resource.enabled ? '已启用' : '已禁用'}</span>
              <Switch size="sm" checked={resource.enabled} onCheckedChange={() => onToggle(resource.id)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">描述</label>
            {editingDesc ? (
              <Textarea value={description} onChange={e => setDescription(e.target.value)} onBlur={() => setEditingDesc(false)} autoFocus rows={3}
                className="input-accent resize-none" />
            ) : (
              <p onClick={() => setEditingDesc(true)} className="text-xs text-muted-foreground/60 leading-relaxed px-3 py-2 rounded-xl border border-transparent hover:border-border/15 hover:bg-accent/40 cursor-text transition-all">
                {description || '点击添加描述...'}
              </p>
            )}
          </div>

          <Separator opacity={30} />

          {/* File Info */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">源文件</label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border/15 bg-accent/5">
              <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center flex-shrink-0">
                <FileIcon size={18} strokeWidth={1.3} className="text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate font-mono">{resource.fileName || '未知文件'}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground/40">
                  {resource.fileSize && <span>{resource.fileSize}</span>}
                  {resource.fileType && <span className="px-1.5 py-px rounded-full bg-accent/50 text-muted-foreground/50 uppercase">{resource.fileType}</span>}
                </div>
              </div>
              {resource.homepage && (
                <a href={resource.homepage} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-muted-foreground/50 hover:text-foreground hover:bg-accent/50 border border-border/15 transition-colors flex-shrink-0">
                  <ExternalLink size={9} /> 主页
                </a>
              )}
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              {resource.fileType === 'zip' ? '包内容' : '文件预览'}
            </label>
            <div className="rounded-xl border border-border/15 bg-foreground/[0.03] dark:bg-foreground/[0.06] overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/15 bg-accent/5">
                <FileIcon size={10} className="text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/50 font-mono">{resource.fileName || 'preview'}</span>
              </div>
              <pre className="p-4 text-xs text-muted-foreground/60 leading-relaxed overflow-x-auto font-mono scrollbar-thin">
                {mockContentPreview}
              </pre>
            </div>
          </div>

          <Separator opacity={30} />

          {/* Tags */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1"><Tag size={9} /> 标签</label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-border/15 text-muted-foreground/60 hover:border-border/30 transition-colors group">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${(TAG_COLORS[tag] || DEFAULT_TAG_COLOR).dot}`} />
                  {tag}
                  <Button variant="ghost" onClick={() => removeTag(tag)} size="inline" className="text-muted-foreground/50 hover:text-destructive transition-colors ml-0.5 w-auto p-0">&times;</Button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="添加标签..."
                  className="w-[80px] text-xs px-2 py-0.5 h-auto rounded-full border border-border/15 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 focus:border-border/30 focus:w-[120px] transition-all focus-visible:ring-0" />
              </div>
            </div>
          </div>

          <Separator opacity={30} />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground/40 mb-1 block">创建时间</label>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <Clock size={9} />
                <span>{new Date(resource.createdAt).toLocaleDateString('zh-CN')}</span>
                <span className="text-muted-foreground/50">({timeAgo(resource.createdAt)})</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground/40 mb-1 block">最近更新</label>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <Clock size={9} />
                <span>{new Date(resource.updatedAt).toLocaleDateString('zh-CN')}</span>
                <span className="text-muted-foreground/50">({timeAgo(resource.updatedAt)})</span>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-4">
            <div className="rounded-xl border border-destructive/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-foreground mb-0.5">删除{cfg.label}</p>
                  <p className="text-xs text-muted-foreground/40">移除此{cfg.label}及其所有配置，此操作不可恢复</p>
                </div>
                <Button variant="destructive" size="xs" onClick={() => onDelete(resource)}>
                  <Trash2 size={10} /> 删除
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
