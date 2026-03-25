import React, { useState } from 'react';
import { ArrowLeft, Save, Settings, FileText, BookOpen, ChevronRight, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ResourceItem } from '@/app/types';
import { BasicSection } from './sections/BasicSection';
import { PromptSection } from './sections/PromptSection';
import { KnowledgeSection } from './sections/KnowledgeSection';
import { ToolSection } from './sections/ToolSection';

interface Props {
  resource: ResourceItem;
  onBack: () => void;
}

type Section = 'basic' | 'prompt' | 'knowledge' | 'tools';

const sections: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'basic', label: '基础设置', icon: Settings, desc: '名称、头像、模型参数' },
  { id: 'prompt', label: '提示词', icon: FileText, desc: '系统提示词、变量、样本' },
  { id: 'knowledge', label: '知识库', icon: BookOpen, desc: '关联知识库、检索策略' },
  { id: 'tools', label: '工具', icon: Wrench, desc: 'MCP 服务与工具配置' },
];

export function AssistantConfig({ resource, onBack }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border/15 flex-shrink-0">
        <button onClick={onBack} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/40 transition-colors"><ArrowLeft size={14} /></button>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <span className="hover:text-foreground cursor-pointer transition-colors" onClick={onBack}>资源库</span>
          <ChevronRight size={9} />
          <span className="text-foreground">{resource.name}</span>
        </div>
        <div className="flex-1" />
        <AnimatePresence>
          {saved && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-cherry-primary">已保存</motion.span>}
        </AnimatePresence>
        <button onClick={onBack} className="px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 border border-border/20 transition-all">取消</button>
        <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] hover:bg-foreground/90 transition-colors active:scale-[0.97]"><Save size={10} /><span>保存</span></button>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-[180px] flex-shrink-0 border-r border-border/10 p-3">
          {sections.map(s => {
            const Icon = s.icon; const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-start gap-2.5 w-full px-3 py-2.5 rounded-xl text-left transition-all mb-1 ${active ? 'bg-accent/60 text-foreground' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/25'}`}>
                <Icon size={13} strokeWidth={1.6} className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px]">{s.label}</div>
                  <div className={`text-[9px] mt-px ${active ? 'text-muted-foreground/50' : 'text-muted-foreground/45'}`}>{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeSection === 'basic' && <BasicSection resource={resource} />}
              {activeSection === 'prompt' && <PromptSection />}
              {activeSection === 'knowledge' && <KnowledgeSection />}
              {activeSection === 'tools' && <ToolSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
