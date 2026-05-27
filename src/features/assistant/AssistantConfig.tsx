import React, { useState } from 'react';
import { ArrowLeft, Save, Settings, FileText, BookOpen, ChevronRight, Wrench, Zap, SlidersHorizontal, CheckCircle2, Blocks, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import type { ResourceItem } from '@/app/types';
import { BasicSection } from './sections/BasicSection';
import { ModelSection } from './sections/ModelSection';
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

// Flat sidebar items at the top + a 拓展 group whose children are
// 知识库 and 工具(MCP). Mirrors the Agent's sidebar shape so the two
// configs feel structurally identical.
type ExtensionId = 'knowledge' | 'tools';
type Section = 'basic' | 'model' | 'prompt' | 'phrases' | `extensions:${ExtensionId}`;

const sections: { id: Exclude<Section, `extensions:${string}`>; label: string; icon: React.ElementType }[] = [
  { id: 'basic',   label: '基础设置', icon: Settings },
  { id: 'model',   label: '模型设置', icon: SlidersHorizontal },
  { id: 'prompt',  label: '提示词',   icon: FileText },
  { id: 'phrases', label: '快捷短语', icon: Zap },
];

const EXTENSION_CHILDREN: { id: ExtensionId; label: string; icon: React.ElementType }[] = [
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'tools',     label: 'MCP',    icon: Wrench },
];

export function AssistantConfig({ resource, onBack, inModal = false }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [extensionsExpanded, setExtensionsExpanded] = useState(true);
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
        <div className="w-[150px] flex-shrink-0 border-r border-border/15 p-2">
          {sections.map(s => {
            const Icon = s.icon; const active = activeSection === s.id;
            return (
              <Button key={s.id} variant="ghost" size="inline"
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center justify-start gap-2 w-full px-3 py-2 rounded-lg text-left mb-0.5 transition-colors ${active ? 'bg-accent/50 text-foreground font-medium' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}>
                <Icon size={13} strokeWidth={1.6} className="flex-shrink-0" />
                <span className="text-sm">{s.label}</span>
              </Button>
            );
          })}

          {/* 拓展 group — collapsible parent containing 知识库 + MCP.
              Mirrors the Agent sidebar's 拓展 treatment. */}
          {(() => {
            const childActive = typeof activeSection === 'string' && activeSection.startsWith('extensions:');
            return (
              <>
                <Button variant="ghost" size="inline"
                  onClick={() => setExtensionsExpanded(v => !v)}
                  className={`flex items-center justify-start gap-2 w-full px-3 py-2 rounded-lg text-left mb-0.5 transition-colors ${childActive ? 'bg-accent/50 text-foreground font-medium' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}>
                  <Blocks size={13} strokeWidth={1.6} className={`flex-shrink-0 ${childActive ? 'text-muted-foreground' : 'text-muted-foreground/40'}`} />
                  <span className="text-sm flex-1">拓展</span>
                  <ChevronDown size={11} className={`flex-shrink-0 text-muted-foreground/40 transition-transform ${extensionsExpanded ? '' : '-rotate-90'}`} />
                </Button>
                <AnimatePresence initial={false}>
                  {extensionsExpanded && (
                    <motion.div key="extensions-children"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {EXTENSION_CHILDREN.map(c => {
                          const sid: Section = `extensions:${c.id}`;
                          const isActive = activeSection === sid;
                          const CIcon = c.icon;
                          return (
                            <Button key={c.id} variant="ghost" size="inline"
                              onClick={() => setActiveSection(sid)}
                              className={`flex items-center justify-start gap-2 w-full px-3 py-1.5 rounded-lg text-left mb-0.5 transition-colors ${isActive ? 'bg-accent/50 text-foreground font-medium' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/40'}`}>
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
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeSection === 'basic' && <BasicSection resource={resource} />}
              {activeSection === 'model' && <ModelSection />}
              {activeSection === 'prompt' && <PromptSection />}
              {activeSection === 'phrases' && <PhrasesSection />}
              {activeSection === 'extensions:knowledge' && <KnowledgeSection />}
              {activeSection === 'extensions:tools' && <ToolSection />}
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
