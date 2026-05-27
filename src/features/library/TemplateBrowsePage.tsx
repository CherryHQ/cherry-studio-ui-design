import { useMemo, useState } from 'react';
import { Check, ChevronLeft, Download } from 'lucide-react';
import { SearchInput } from '@cherry-studio/ui';
import { skills as discoverSkills, assistants as discoverAssistants } from '@/features/explore/ExploreData';

const TEMPLATE_CATEGORIES: Record<'skill' | 'assistant', string[]> = {
  skill: ['全部', '代码', '数据', '文档', '翻译', '图像', '音频'],
  assistant: ['全部', '写作', '编程', '教育', '创意', '商业', '翻译', '法律', '健康'],
};

export function TemplateBrowsePage({ resourceType, onBack, onUse, installedNames }: {
  resourceType: 'skill' | 'assistant';
  onBack: () => void;
  onUse: (item: any) => void;
  installedNames: Set<string>;
}) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('全部');

  const allItems: any[] = resourceType === 'skill' ? discoverSkills : discoverAssistants;
  const categories = TEMPLATE_CATEGORIES[resourceType];
  const label = resourceType === 'skill' ? 'Skill' : '助手';

  const filtered = useMemo(() => {
    let list = allItems;
    if (activeCat !== '全部') {
      list = list.filter(item => item.subcategory === activeCat || item.category === activeCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }
    return list;
  }, [allItems, activeCat, search]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0 border-b border-border/20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground/50 hover:text-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-base text-foreground font-medium">{label}模板</h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">浏览和使用预配置的{label}模板</p>
          </div>
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={`搜索${label}模板...`}
          iconSize={10}
          wrapperClassName="flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg bg-muted/50 border border-border/30 w-[220px]"
        />
      </div>

      <div className="flex items-center gap-1.5 px-6 py-3 flex-shrink-0 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-3 py-[4px] rounded-full text-xs transition-all border ${
              activeCat === cat
                ? 'bg-accent border-border text-foreground font-medium'
                : 'bg-transparent border-border/40 text-muted-foreground/60 hover:text-foreground hover:border-border hover:bg-accent/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40">
            <p className="text-sm">没有匹配的模板</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item: any) => {
              const installed = installedNames.has(item.name);
              return (
                <div
                  key={item.id}
                  className={`group rounded-xl border bg-background transition-all overflow-hidden ${
                    installed ? 'border-border/20' : 'border-border/30 hover:border-border/50 hover:shadow-sm cursor-pointer'
                  }`}
                >
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-10 h-10 rounded-xl bg-accent/60 flex items-center justify-center text-lg flex-shrink-0">
                        {item.avatar || item.icon || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground/40 mt-0.5">{item.author}</p>
                      </div>
                      {installed && (
                        <span className="flex items-center gap-1 px-2 py-[2px] rounded-full text-xs text-primary/70 bg-primary/8 border border-primary/15 flex-shrink-0">
                          <Check size={10} />
                          已安装
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.tags?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="px-1.5 py-[1px] rounded text-xs text-muted-foreground/40 bg-muted/50">{tag}</span>
                        ))}
                      </div>
                      {installed ? (
                        <span className="text-xs text-muted-foreground/30">已添加到资源库</span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); onUse(item); }}
                          className="flex items-center gap-1 px-2.5 py-[3px] rounded-lg text-xs text-muted-foreground/50 hover:text-foreground border border-border/30 hover:border-border/50 hover:bg-accent/50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Download size={10} />
                          安装
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
