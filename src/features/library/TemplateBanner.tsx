import { ArrowRight, Check, X } from 'lucide-react';

const SKILL_TEMPLATES = [
  { id: 'st1', icon: '🐍', name: '代码解释器', desc: '在沙箱环境中执行 Python 代码，支持数据可视化' },
  { id: 'st2', icon: '📄', name: 'PDF 解析器', desc: '解析并提取 PDF 文档中的结构化数据' },
  { id: 'st3', icon: '🌍', name: '翻译助手', desc: '支持 100+ 语言的高质量上下文感知翻译' },
];

const ASSISTANT_TEMPLATES = [
  { id: 'at1', icon: '✍️', name: '写作助手', desc: '擅长各类文档写作、润色和多语言翻译' },
  { id: 'at2', icon: '💻', name: '代码解读助手', desc: '阅读和解释复杂代码逻辑，生成文档注释' },
  { id: 'at3', icon: '🎓', name: '英语教学助手', desc: '专业英语教学，支持口语练习和语法纠正' },
];

export function TemplateBanner({ resourceType, onClose, onBrowseAll, installedNames }: {
  resourceType: 'assistant' | 'skill';
  onClose: () => void;
  onBrowseAll: () => void;
  installedNames: Set<string>;
}) {
  const templates = resourceType === 'skill' ? SKILL_TEMPLATES : ASSISTANT_TEMPLATES;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/15 px-4 py-2.5 mb-3 relative">
      <p className="text-xs text-muted-foreground/50 flex-shrink-0">模板</p>
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
        {templates.map(t => {
          const installed = installedNames.has(t.name);
          return (
            <button
              key={t.id}
              className={`flex items-center gap-1.5 px-2.5 py-[4px] rounded-lg text-xs whitespace-nowrap border transition-all flex-shrink-0 ${
                installed
                  ? 'border-border/20 text-muted-foreground/40 bg-transparent'
                  : 'border-border/30 bg-background text-foreground hover:border-border/50 hover:shadow-sm cursor-pointer'
              }`}
            >
              <span className="text-sm leading-none">{t.icon}</span>
              <span>{t.name}</span>
              {installed && <Check size={9} className="text-primary/60" />}
            </button>
          );
        })}
      </div>
      <button
        onClick={onBrowseAll}
        className="flex items-center gap-1 text-xs text-muted-foreground/40 hover:text-foreground transition-colors flex-shrink-0 whitespace-nowrap"
      >
        全部
        <ArrowRight size={10} />
      </button>
      <button
        onClick={onClose}
        className="text-muted-foreground/30 hover:text-muted-foreground transition-colors flex-shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}
