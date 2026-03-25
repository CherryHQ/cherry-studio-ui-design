import React, { useState } from 'react';
import {
  ArrowLeft, ChevronRight, Save, Trash2,
  FileJson, FileText, Archive, ExternalLink,
  Tag, Clock, User, Package, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ResourceItem } from '@/app/types';
import { RESOURCE_TYPE_CONFIG, TAG_COLORS, DEFAULT_TAG_COLOR } from '@/app/config/constants';

interface Props {
  resource: ResourceItem;
  onBack: () => void;
  onToggle: (id: string) => void;
  onDelete: (resource: ResourceItem) => void;
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

export function SkillPluginDetail({ resource, onBack, onToggle, onDelete }: Props) {
  const [description, setDescription] = useState(resource.description);
  const [tags, setTags] = useState(resource.tags);
  const [newTag, setNewTag] = useState('');
  const [saved, setSaved] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

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
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border/15 flex-shrink-0">
        <button onClick={onBack} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/40 transition-colors">
          <ArrowLeft size={14} />
        </button>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <span className="hover:text-foreground cursor-pointer transition-colors" onClick={onBack}>资源库</span>
          <ChevronRight size={9} />
          <span className="text-foreground">{resource.name}</span>
          <span className="text-muted-foreground/35 ml-1">({cfg.label})</span>
        </div>
        <div className="flex-1" />
        <AnimatePresence>
          {saved && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-cherry-primary">已保存</motion.span>}
        </AnimatePresence>
        <button onClick={onBack} className="px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 border border-border/20 transition-all">取消</button>
        <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] hover:bg-foreground/90 transition-colors active:scale-[0.97]">
          <Save size={10} /><span>保存</span>
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="max-w-2xl mx-auto px-8 py-8 space-y-8">

          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${cfg.color}`}>
              {resource.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[16px] text-foreground">{resource.name}</h2>
                {resource.hasUpdate && (
                  <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                    <RefreshCw size={8} /> 有新版本
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                <span className={`px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                {resource.version && <span>v{resource.version}</span>}
                {resource.author && <span className="flex items-center gap-1"><User size={9} />{resource.author}</span>}
              </div>
            </div>
            {/* Enable toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[9px] text-muted-foreground/40">{resource.enabled ? '已启用' : '已禁用'}</span>
              <button onClick={() => onToggle(resource.id)}
                className={`relative w-9 h-5 rounded-full transition-colors ${resource.enabled ? 'bg-cherry-primary/70' : 'bg-accent/60'}`}>
                <motion.div animate={{ x: resource.enabled ? 17 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-muted-foreground/60 mb-1.5 block">描述</label>
            {editingDesc ? (
              <textarea value={description} onChange={e => setDescription(e.target.value)} onBlur={() => setEditingDesc(false)} autoFocus rows={3}
                className="w-full px-3 py-2 rounded-xl border border-border/20 bg-accent/10 text-[11px] text-foreground outline-none focus:border-border/40 focus:bg-accent/15 transition-all resize-none" />
            ) : (
              <p onClick={() => setEditingDesc(true)} className="text-[11px] text-muted-foreground/70 leading-relaxed px-3 py-2 rounded-xl border border-transparent hover:border-border/15 hover:bg-accent/5 cursor-text transition-all">
                {description || '点击添加描述...'}
              </p>
            )}
          </div>

          <div className="h-px bg-border/10" />

          {/* File Info */}
          <div>
            <label className="text-[10px] text-muted-foreground/60 mb-2 block">源文件</label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border/15 bg-accent/5">
              <div className="w-10 h-10 rounded-xl bg-accent/40 flex items-center justify-center flex-shrink-0">
                <FileIcon size={18} strokeWidth={1.3} className="text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground truncate font-mono">{resource.fileName || '未知文件'}</p>
                <div className="flex items-center gap-3 mt-0.5 text-[9px] text-muted-foreground/40">
                  {resource.fileSize && <span>{resource.fileSize}</span>}
                  {resource.fileType && <span className="px-1.5 py-px rounded-full bg-accent/40 text-muted-foreground/50 uppercase">{resource.fileType}</span>}
                </div>
              </div>
              {resource.homepage && (
                <a href={resource.homepage} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 border border-border/15 transition-colors flex-shrink-0">
                  <ExternalLink size={9} /> 主页
                </a>
              )}
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <label className="text-[10px] text-muted-foreground/60 mb-2 block">
              {resource.fileType === 'zip' ? '包内容' : '文件预览'}
            </label>
            <div className="rounded-xl border border-border/15 bg-[#0d1117]/40 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/10 bg-accent/5">
                <FileIcon size={10} className="text-muted-foreground/40" />
                <span className="text-[9px] text-muted-foreground/50 font-mono">{resource.fileName || 'preview'}</span>
              </div>
              <pre className="p-4 text-[10px] text-muted-foreground/70 leading-relaxed overflow-x-auto font-mono [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-thumb]:bg-border/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                {mockContentPreview}
              </pre>
            </div>
          </div>

          <div className="h-px bg-border/10" />

          {/* Tags */}
          <div>
            <label className="text-[10px] text-muted-foreground/60 mb-2 block flex items-center gap-1"><Tag size={9} /> 标签</label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border border-border/15 text-muted-foreground/65 hover:border-border/30 transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: TAG_COLORS[tag] || DEFAULT_TAG_COLOR }} />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-muted-foreground/30 hover:text-red-500 transition-colors ml-0.5">&times;</button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="添加标签..."
                  className="w-[80px] text-[9px] px-2 py-0.5 rounded-full border border-border/15 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/35 focus:border-border/30 focus:w-[120px] transition-all" />
              </div>
            </div>
          </div>

          <div className="h-px bg-border/10" />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] text-muted-foreground/40 mb-1 block">创建时间</label>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/55">
                <Clock size={9} />
                <span>{new Date(resource.createdAt).toLocaleDateString('zh-CN')}</span>
                <span className="text-muted-foreground/35">({timeAgo(resource.createdAt)})</span>
              </div>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground/40 mb-1 block">最近更新</label>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/55">
                <Clock size={9} />
                <span>{new Date(resource.updatedAt).toLocaleDateString('zh-CN')}</span>
                <span className="text-muted-foreground/35">({timeAgo(resource.updatedAt)})</span>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-4">
            <div className="rounded-xl border border-red-500/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-foreground mb-0.5">删除{cfg.label}</p>
                  <p className="text-[9px] text-muted-foreground/40">移除此{cfg.label}及其所有配置，此操作不可恢复</p>
                </div>
                <button onClick={() => onDelete(resource)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                  <Trash2 size={10} /> 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
