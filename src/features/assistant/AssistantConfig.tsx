import React, { useState } from 'react';
import { ArrowLeft, Save, Settings, FileText, BookOpen, ChevronRight, Wrench, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@cherry-studio/ui';
import type { ResourceItem } from '@/app/types';
import { BasicSection } from './sections/BasicSection';
import { PromptSection } from './sections/PromptSection';
import { KnowledgeSection } from './sections/KnowledgeSection';
import { ToolSection } from './sections/ToolSection';
import { PhrasesSection } from './sections/PhrasesSection';

interface Props {
  resource: ResourceItem;
  onBack: () => void;
  /** When true, AssistantConfig is hosted inside a modal that already
   * provides the avatar header + close affordance, so the internal
   * breadcrumb + back + cancel chrome should be hidden. The 保存
   * button stays so saving still works in-place. */
  inModal?: boolean;
}

type Section = 'basic' | 'prompt' | 'phrases' | 'knowledge' | 'tools';

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'basic', label: '基础设置', icon: Settings },
  { id: 'prompt', label: '提示词', icon: FileText },
  { id: 'phrases', label: '快捷短语', icon: Zap },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'tools', label: '工具', icon: Wrench },
];

export function AssistantConfig({ resource, onBack, inModal = false }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {!inModal && (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border/15 flex-shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={onBack} className=" text-muted-foreground/40"><ArrowLeft size={14} /></Button>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
            <span className="hover:text-foreground cursor-pointer transition-colors" onClick={onBack}>资源库</span>
            <ChevronRight size={9} />
            <span className="text-foreground">{resource.name}</span>
          </div>
          <div className="flex-1" />
          <AnimatePresence>
            {saved && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs text-cherry-primary">已保存</motion.span>}
          </AnimatePresence>
          <Button variant="outline" size="xs" onClick={onBack} className="text-muted-foreground/50">取消</Button>
          <Button variant="default" size="xs" onClick={handleSave} className="active:scale-[0.97]"><Save size={10} /><span>保存</span></Button>
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        <div className="w-[180px] flex-shrink-0 border-r border-border/15 p-3">
          {sections.map(s => {
            const Icon = s.icon; const active = activeSection === s.id;
            return (
              <Button key={s.id} variant="ghost" size="inline"
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-left mb-1 ${active ? 'bg-accent/50 text-foreground' : 'text-muted-foreground/60'}`}>
                <Icon size={13} strokeWidth={1.6} className="flex-shrink-0" />
                <span className="text-sm">{s.label}</span>
              </Button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeSection === 'basic' && <BasicSection resource={resource} />}
              {activeSection === 'prompt' && <PromptSection />}
              {activeSection === 'phrases' && <PhrasesSection />}
              {activeSection === 'knowledge' && <KnowledgeSection />}
              {activeSection === 'tools' && <ToolSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
