import React from 'react';
import {
  Star, Play, MessageCircle, FileText, Download,
  ArrowRight, Heart,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button, ImageWithFallback } from '@cherry-studio/ui';
import type { Agent, Assistant, KnowledgeBase } from './ExploreData';
import { integrationIcons, formatNumber } from './ExploreData';

// ===========================
// Favorite Badge (top-right)
// ===========================

function FavBadge() {
  return (
    <div className="absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center backdrop-blur-sm border border-destructive/15 shadow-sm">
      <Heart size={9} className="text-destructive" fill="currentColor" />
    </div>
  );
}

// ===========================
// Agent Card
// ===========================

export function AgentCard({ agent, onTry, onClick, isFavorited }: {
  agent: Agent; onTry: () => void; onClick: () => void; isFavorited?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group relative rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {isFavorited && <FavBadge />}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-violet/10 to-blue-500/10 flex items-center justify-center text-lg">
              {agent.avatar}
            </div>
            <div>
              <h3 className="text-sm text-foreground group-hover:text-foreground transition-colors">{agent.name}</h3>
              <span className="text-xs text-muted-foreground/50">{agent.subcategory} · {agent.author}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground/50">
            <Star size={8} className="text-warning/60" />
            <span>{formatNumber(agent.stars)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50 leading-relaxed line-clamp-2 mb-3">{agent.description}</p>

        <div className="flex items-center gap-1 mb-3">
          {agent.integrations.slice(0, 4).map(intg => (
            <div key={intg} className="w-6 h-6 rounded-lg bg-accent/50 flex items-center justify-center text-xs" title={intg}>
              {integrationIcons[intg] || '\uD83D\uDD27'}
            </div>
          ))}
          {agent.integrations.length > 4 && (
            <span className="text-xs text-muted-foreground/50 ml-0.5">+{agent.integrations.length - 4}</span>
          )}
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground/50">{formatNumber(agent.runs)} 次运行</span>
        </div>

        <div className="flex items-center gap-1">
          {agent.tags.map(tag => (
            <span key={tag} className="text-xs px-1.5 py-px rounded-md bg-accent/50 text-muted-foreground/40">{tag}</span>
          ))}
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-border/15">
        <Button
          variant="ghost"
          size="xs"
          onClick={e => { e.stopPropagation(); onTry(); }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-foreground hover:text-foreground bg-accent/25 hover:bg-accent/50 group/btn"
        >
          <Play size={9} className="group-hover/btn:text-accent-violet transition-colors" />
          <span>体验智能体</span>
          <ArrowRight size={9} className="opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Assistant Card
// ===========================

export function AssistantCard({ assistant, onChat, onClick, isFavorited }: {
  assistant: Assistant; onChat: () => void; onClick: () => void; isFavorited?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group relative rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {isFavorited && <FavBadge />}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.06] flex items-center justify-center text-xl flex-shrink-0">
            {assistant.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm text-foreground truncate">{assistant.name}</h3>
              <div className="flex items-center gap-0.5 text-xs text-warning/60 flex-shrink-0">
                <Star size={7} fill="currentColor" />
                <span>{assistant.rating}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-0.5">{assistant.author}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/50 leading-relaxed line-clamp-2 mb-2">{assistant.description}</p>

        <div className="px-2.5 py-1.5 rounded-lg bg-accent/25 border border-border/10 mb-3">
          <p className="text-xs text-muted-foreground/40 leading-relaxed line-clamp-2 italic">"{assistant.persona}"</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {assistant.tags.map(tag => (
              <span key={tag} className="text-xs px-1.5 py-px rounded-md bg-accent/50 text-muted-foreground/40">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground/50">
            <MessageCircle size={8} />
            <span>{formatNumber(assistant.conversations)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-border/15">
        <Button
          variant="ghost"
          size="xs"
          onClick={e => { e.stopPropagation(); onChat(); }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-foreground hover:text-foreground bg-accent/25 hover:bg-accent/50 group/btn"
        >
          <MessageCircle size={9} className="group-hover/btn:text-muted-foreground transition-colors" />
          <span>开始对话</span>
          <ArrowRight size={9} className="opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===========================
// Knowledge Card
// ===========================

export function KnowledgeCard({ kb, onClick, isFavorited }: { kb: KnowledgeBase; onClick: () => void; isFavorited?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group relative rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {isFavorited && (
        <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full bg-foreground/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
          <Heart size={9} className="text-destructive" fill="currentColor" />
        </div>
      )}
      <div className="h-28 overflow-hidden relative">
        <ImageWithFallback src={kb.cover} alt={kb.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-sm text-white truncate">{kb.name}</h3>
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-xs text-muted-foreground/50 leading-relaxed line-clamp-2 mb-2.5">{kb.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {kb.tags.map(tag => (
              <span key={tag} className="text-xs px-1.5 py-px rounded-md bg-accent/50 text-muted-foreground/40">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground/50">
            <FileText size={8} />
            <span>{kb.docCount} 篇文档</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===========================
// Tool / Plugin Card
// ===========================

export function ToolCard({ item, metricLabel, metricValue, onClick, isFavorited }: {
  item: { id: string; name: string; description: string; icon: string; author: string; version?: string; tags: string[] };
  metricLabel: string;
  metricValue: string;
  onClick: () => void;
  isFavorited?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group relative rounded-2xl border border-border/20 bg-card hover:border-border/40 hover:shadow-lg hover:shadow-black/[0.03] transition-all duration-200 p-4 cursor-pointer"
      onClick={onClick}
    >
      {isFavorited && <FavBadge />}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent/50 flex items-center justify-center text-lg flex-shrink-0">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm text-foreground truncate">{item.name}</h3>
            {item.version && <span className="text-xs text-muted-foreground/50 flex-shrink-0">v{item.version}</span>}
          </div>
          <p className="text-xs text-muted-foreground/50 mt-0.5">{item.author}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/50 leading-relaxed line-clamp-2 mb-3">{item.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {item.tags.map(tag => (
            <span key={tag} className="text-xs px-1.5 py-px rounded-md bg-accent/50 text-muted-foreground/40">{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-0.5 text-xs text-muted-foreground/50">
          <Download size={8} />
          <span>{metricValue} {metricLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}
