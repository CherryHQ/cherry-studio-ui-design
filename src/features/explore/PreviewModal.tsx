import React from 'react';
import {
  X, Star, Play, MessageCircle, Download, FileText,
  Heart, BookmarkPlus, Check, Wrench,
  Calendar, Tag, Zap, User as UserIcon, Clock,
  ExternalLink, Share2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import type { Agent, Assistant, KnowledgeBase, MCPTool, Skill, Plugin, ResourceCategory } from './ExploreData';
import { integrationIcons, formatNumber, models } from './ExploreData';

type AnyResource = Agent | Assistant | KnowledgeBase | MCPTool | Skill | Plugin;

interface PreviewModalProps {
  resource: AnyResource;
  category: ResourceCategory;
  isFavorited: boolean;
  isSaved: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onSaveToLibrary: () => void;
  onTry?: () => void;
}

function isAgent(r: AnyResource, c: ResourceCategory): r is Agent { return c === 'agents'; }
function isAssistant(r: AnyResource, c: ResourceCategory): r is Assistant { return c === 'assistants'; }
function isKB(r: AnyResource, c: ResourceCategory): r is KnowledgeBase { return c === 'knowledge'; }
function isMCP(r: AnyResource, c: ResourceCategory): r is MCPTool { return c === 'mcp'; }
function isSkill(r: AnyResource, c: ResourceCategory): r is Skill { return c === 'skills'; }
function isPlugin(r: AnyResource, c: ResourceCategory): r is Plugin { return c === 'plugins'; }

const categoryGradients: Record<ResourceCategory, string> = {
  agents: 'from-violet-500/[0.06] via-blue-500/[0.03] to-transparent',
  assistants: 'from-foreground/[0.04] via-foreground/[0.02] to-transparent',
  knowledge: 'from-blue-500/[0.06] via-indigo-500/[0.03] to-transparent',
  mcp: 'from-orange-500/[0.06] via-amber-500/[0.03] to-transparent',
  skills: 'from-amber-500/[0.06] via-yellow-500/[0.03] to-transparent',
  plugins: 'from-pink-500/[0.06] via-rose-500/[0.03] to-transparent',
};

const categoryLabels: Record<ResourceCategory, string> = {
  agents: '智能体', assistants: '助手', knowledge: '知识库',
  mcp: 'MCP 工具', skills: '技能', plugins: '插件',
};

export function PreviewModal({
  resource, category, isFavorited, isSaved,
  onClose, onToggleFavorite, onSaveToLibrary, onTry,
}: PreviewModalProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const name = resource.name;
  const description = resource.description;
  const author = resource.author;
  const tags = resource.tags;
  const createdAt = resource.createdAt;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-popover border border-border/30 rounded-2xl shadow-2xl w-[540px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero area — Knowledge uses cover image, others use gradient */}
        {isKB(resource, category) ? (
          <div className="h-40 relative overflow-hidden flex-shrink-0">
            <ImageWithFallback src={resource.cover} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-popover via-popover/50 to-transparent" />
            <button onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <X size={13} />
            </button>
            {/* Title overlay on cover */}
            <div className="absolute bottom-3 left-5 right-5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] px-1.5 py-px rounded-full bg-white/15 text-white/70 backdrop-blur-sm uppercase tracking-wider">{categoryLabels[category]}</span>
              </div>
              <h2 className="text-[16px] text-white">{name}</h2>
            </div>
          </div>
        ) : (
          <div className="relative flex-shrink-0">
            {/* Gradient hero */}
            <div className={`absolute inset-0 bg-gradient-to-b ${categoryGradients[category]} pointer-events-none`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.04),transparent_70%)] pointer-events-none" />
            <div className="relative px-5 pt-5 pb-4">
              {/* Close + share */}
              <div className="flex items-center justify-end gap-1 mb-4">
                <button className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-colors">
                  <Share2 size={11} />
                </button>
                <button onClick={onClose}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
                  <X size={13} />
                </button>
              </div>
              {/* Avatar + Title */}
              <div className="flex items-start gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ring-1 ring-border/10 ${
                  isAgent(resource, category) ? 'bg-gradient-to-br from-violet-500/10 to-blue-500/10' :
                  isAssistant(resource, category) ? 'bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.06]' :
                  'bg-accent/60'
                }`}>
                  {(resource as any).avatar || (resource as any).icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-[15px] text-foreground truncate">{name}</h2>
                    <span className="text-[8px] px-1.5 py-px rounded-full bg-accent text-muted-foreground/50 uppercase tracking-wider flex-shrink-0">{categoryLabels[category]}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                      <UserIcon size={9} />
                      <span>{author}</span>
                    </div>
                    {(resource as any).version && (
                      <span className="text-[9px] text-muted-foreground/25 px-1.5 py-px rounded bg-accent/50">v{(resource as any).version}</span>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/30">
                      <Clock size={8} />
                      <span>{createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Description */}
          <div>
            <SectionLabel>简介</SectionLabel>
            <p className="text-[12px] text-muted-foreground/60 leading-[1.7]">{description}</p>
          </div>

          {/* Persona for Assistant */}
          {isAssistant(resource, category) && (
            <div>
              <SectionLabel>角色设定</SectionLabel>
              <div className="px-3.5 py-3 rounded-xl bg-gradient-to-r from-foreground/[0.03] to-foreground/[0.03] border border-border/10">
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed italic">"{resource.persona}"</p>
              </div>
            </div>
          )}

          {/* Agent integrations */}
          {isAgent(resource, category) && (
            <div>
              <SectionLabel>集成工具</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {resource.integrations.map(intg => (
                  <div key={intg}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/40 border border-border/10 hover:border-border/25 transition-colors">
                    <span className="text-[12px]">{integrationIcons[intg] || '\uD83D\uDD27'}</span>
                    <span className="text-[10px] text-muted-foreground/50">{intg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended model for Agent / Assistant */}
          {(isAgent(resource, category) || isAssistant(resource, category)) && (
            <div>
              <SectionLabel>推荐模型</SectionLabel>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/25 border border-border/10 w-fit">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Zap size={10} className="text-amber-500/60" />
                </div>
                <span className="text-[11px] text-foreground/70">{models.find(m => m.id === resource.recommended_model)?.name}</span>
                <span className="text-[9px] text-muted-foreground/30 px-1.5 py-px rounded bg-accent/50">{models.find(m => m.id === resource.recommended_model)?.provider}</span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div>
            <SectionLabel>数据概览</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {isAgent(resource, category) && (
                <div className="contents">
                  <StatCard icon={<Star size={12} className="text-amber-500/60" />} label="收藏" value={formatNumber(resource.stars)} color="amber" />
                  <StatCard icon={<Play size={12} className="text-violet-500/60" />} label="运行次数" value={formatNumber(resource.runs)} color="violet" />
                  <StatCard icon={<Tag size={12} className="text-blue-500/50" />} label="分类" value={resource.subcategory} color="blue" />
                </div>
              )}
              {isAssistant(resource, category) && (
                <div className="contents">
                  <StatCard icon={<Star size={12} className="text-amber-500/60" />} label="评分" value={String(resource.rating)} color="amber" />
                  <StatCard icon={<MessageCircle size={12} className="text-foreground/45" />} label="对话数" value={formatNumber(resource.conversations)} color="neutral" />
                  <StatCard icon={<Tag size={12} className="text-blue-500/50" />} label="分类" value={resource.subcategory} color="blue" />
                </div>
              )}
              {isKB(resource, category) && (
                <div className="contents">
                  <StatCard icon={<FileText size={12} className="text-blue-500/60" />} label="文档" value={`${resource.docCount} 篇`} color="blue" />
                  <StatCard icon={<Tag size={12} className="text-indigo-500/50" />} label="分类" value={resource.subcategory} color="indigo" />
                  <StatCard icon={<Calendar size={12} className="text-muted-foreground/35" />} label="更新时间" value={createdAt.slice(5)} color="gray" />
                </div>
              )}
              {(isMCP(resource, category) || isPlugin(resource, category)) && (
                <div className="contents">
                  <StatCard icon={<Download size={12} className="text-blue-500/60" />} label="下载量" value={formatNumber(resource.downloads)} color="blue" />
                  <StatCard icon={<Tag size={12} className="text-orange-500/50" />} label="分类" value={resource.subcategory} color="orange" />
                  <StatCard icon={<Calendar size={12} className="text-muted-foreground/35" />} label="更新时间" value={createdAt.slice(5)} color="gray" />
                </div>
              )}
              {isSkill(resource, category) && (
                <div className="contents">
                  <StatCard icon={<Zap size={12} className="text-amber-500/60" />} label="使用次数" value={formatNumber(resource.usageCount)} color="amber" />
                  <StatCard icon={<Tag size={12} className="text-amber-500/50" />} label="分类" value={resource.subcategory} color="amber" />
                  <StatCard icon={<Calendar size={12} className="text-muted-foreground/35" />} label="更新时间" value={createdAt.slice(5)} color="gray" />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <SectionLabel>标签</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span key={tag} className="text-[10px] px-2.5 py-1 rounded-lg bg-accent/40 text-muted-foreground/45 border border-border/8 hover:border-border/20 transition-colors cursor-default">{tag}</span>
              ))}
              {isKB(resource, category) && (
                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-accent/40 text-muted-foreground/45 border border-border/8">{resource.subcategory}</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-border/15 flex items-center gap-2 bg-accent/[0.03]">
          {/* Favorite */}
          <button
            onClick={onToggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all active:scale-[0.97] ${
              isFavorited
                ? 'bg-red-500/10 text-red-500 border border-red-500/15'
                : 'bg-accent/40 text-muted-foreground/50 border border-border/15 hover:text-foreground hover:border-border/40'
            }`}
          >
            <Heart size={11} fill={isFavorited ? 'currentColor' : 'none'} />
            <span>{isFavorited ? '已收藏' : '收藏'}</span>
          </button>

          {/* Save to library */}
          <button
            onClick={onSaveToLibrary}
            disabled={isSaved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all active:scale-[0.97] ${
              isSaved
                ? 'bg-cherry-active-bg text-cherry-primary-dark border border-cherry-ring'
                : 'bg-accent/40 text-muted-foreground/50 border border-border/15 hover:text-foreground hover:border-border/40'
            }`}
          >
            {isSaved ? <Check size={11} /> : <BookmarkPlus size={11} />}
            <span>{isSaved ? '已添加资源库' : '添加到资源库'}</span>
          </button>

          <span className="flex-1" />

          {/* Try / Use */}
          {(isAgent(resource, category) || isAssistant(resource, category)) && onTry && (
            <button
              onClick={onTry}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-foreground text-background text-[11px] hover:bg-foreground/90 transition-colors active:scale-[0.97]"
            >
              {isAgent(resource, category) ? <Play size={10} /> : <MessageCircle size={10} />}
              <span>{isAgent(resource, category) ? '体验智能体' : '开始对话'}</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ===========================
// Section Label
// ===========================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] text-muted-foreground/30 uppercase tracking-wider mb-2">{children}</div>
  );
}

// ===========================
// Stat Card (richer than before)
// ===========================

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div className="px-3 py-2.5 rounded-xl bg-accent/20 border border-border/8 hover:border-border/15 transition-colors">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[9px] text-muted-foreground/30">{label}</span>
      </div>
      <span className="text-[13px] text-foreground/80">{value}</span>
    </div>
  );
}
