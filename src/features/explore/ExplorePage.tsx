import React, { useState, useMemo, useCallback } from 'react';
import {
  Bot, MessageCircle, BookOpen, Wrench,
  Zap, Puzzle, Sparkles, Heart,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, SearchInput, EmptyState } from '@cherry-studio/ui';
import { AgentCard, AssistantCard, KnowledgeCard, ToolCard } from './ResourceCards';
import { ExperienceModal } from './ExperienceModal';
import { PreviewModal } from './PreviewModal';
import { FavoritesDrawer, type FavoriteItem } from './FavoritesDrawer';
import {
  agents, assistants, knowledgeBases, mcpTools, skills, plugins,
  subcategories, categoryTotalCounts, formatNumber, integrationIcons,
  type ResourceCategory, type Agent, type Assistant,
} from './ExploreData';

// ===========================
// Category Config
// ===========================

const categoryLabels: Record<ResourceCategory, string> = {
  agents: '智能体', assistants: '助手', knowledge: '知识库',
  mcp: 'MCP 工具', skills: '技能', plugins: '插件',
};

const categories: { id: ResourceCategory; label: string; icon: React.ElementType }[] = [
  { id: 'agents', label: '智能体', icon: Bot },
  { id: 'assistants', label: '助手', icon: MessageCircle },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'mcp', label: 'MCP 工具', icon: Wrench },
  { id: 'skills', label: '技能', icon: Zap },
  { id: 'plugins', label: '插件', icon: Puzzle },
];

// ===========================
// Helper: get avatar/icon from any resource
// ===========================

function getResourceAvatar(resource: any): string {
  return resource.avatar || resource.icon || '\uD83D\uDCE6';
}

// ===========================
// Featured Banner
// ===========================

function FeaturedBanner({ onTry }: { onTry: (agent: Agent) => void }) {
  const featured = agents[3];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden mb-5"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-accent-violet/[0.08] via-blue-500/[0.05] to-foreground/[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.06),transparent_60%)]" />
      <div className="relative px-6 py-5 flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 text-xs text-accent-violet/70 bg-accent-violet/[0.08] px-2 py-0.5 rounded-full">
              <TrendingUp size={8} />
              <span>本周热门</span>
            </div>
          </div>
          <h3 className="text-base text-foreground mb-1">{featured.name}</h3>
          <p className="text-xs text-muted-foreground/50 leading-relaxed max-w-md mb-3">{featured.description}</p>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onTry(featured)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-colors active:scale-[0.97]"
            >
              <Sparkles size={10} />
              <span>立即体验</span>
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
              <span>{formatNumber(featured.stars)} 收藏</span>
              <span>{'\u00B7'}</span>
              <span>{formatNumber(featured.runs)} 次运行</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5">
          {featured.integrations.map(intg => (
            <div key={intg} className="w-8 h-8 rounded-xl bg-accent/50 flex items-center justify-center text-sm backdrop-blur-sm">
              {integrationIcons[intg] || '\u2699\uFE0F'}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ===========================
// Filter Tabs
// ===========================

function FilterTabs({ active, onChange }: { active: ResourceCategory; onChange: (cat: ResourceCategory) => void }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide pb-px">
      {categories.map(cat => {
        const isActive = active === cat.id;
        const Icon = cat.icon;
        const total = categoryTotalCounts[cat.id];
        return (
          <Button
            variant="ghost"
            size="sm"
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`relative flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-all whitespace-nowrap ${
              isActive
                ? 'text-foreground bg-accent/50'
                : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <Icon size={12} strokeWidth={1.6} />
            <span>{cat.label}</span>
            <span className={`text-xs tabular-nums ${isActive ? 'text-muted-foreground/50' : 'text-muted-foreground/50'}`}>
              {formatNumber(total)}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

// ===========================
// Subcategory Tags
// ===========================

function SubcategoryTags({ category, active, onChange }: {
  category: ResourceCategory; active: string; onChange: (sub: string) => void;
}) {
  const subs = subcategories[category];
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2.5 px-0.5">
      {subs.map(sub => {
        const isActive = active === sub;
        return (
          <Button
            variant="ghost"
            size="sm"
            key={sub}
            onClick={() => onChange(sub)}
            className={`px-2.5 py-[3px] rounded-full text-xs whitespace-nowrap transition-all border ${
              isActive
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground/40 border-border/30 hover:border-border/50 hover:text-foreground'
            }`}
          >
            {sub}
          </Button>
        );
      })}
    </div>
  );
}

// ===========================
// Search Bar
// ===========================

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="max-w-xs">
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder="搜索资源..."
        iconSize={12}
        clearable
      />
    </div>
  );
}

// ===========================
// Main Page
// ===========================

export function ExplorePage() {
  const [category, setCategory] = useState<ResourceCategory>('agents');
  const [subcategory, setSubcategory] = useState('全部');
  const [search, setSearch] = useState('');

  // Modals
  const [experienceModal, setExperienceModal] = useState<{ resource: Agent | Assistant; type: 'agent' | 'assistant' } | null>(null);
  const [previewModal, setPreviewModal] = useState<{ resource: any; category: ResourceCategory } | null>(null);

  // Favorites & Library
  const [favorites, setFavorites] = useState<Map<string, number>>(new Map());
  const [library, setLibrary] = useState<Set<string>>(new Set());
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);

  const searchLower = search.toLowerCase();

  const handleCategoryChange = (cat: ResourceCategory) => {
    setCategory(cat);
    setSubcategory('全部');
  };

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, Date.now());
      return next;
    });
  }, []);

  // Save to library
  const saveToLibrary = useCallback((id: string) => {
    setLibrary(prev => new Set(prev).add(id));
  }, []);

  // Filter helper
  const filterBySearch = (item: { name: string; description: string; tags: string[] }) =>
    !searchLower || item.name.toLowerCase().includes(searchLower) || item.description.toLowerCase().includes(searchLower) || item.tags.some(t => t.toLowerCase().includes(searchLower));

  const filterBySub = (sub: string) => subcategory === '全部' || sub === subcategory;

  // Filtered lists
  const filteredAgents = useMemo(() =>
    agents.filter(a => filterBySearch(a) && filterBySub(a.subcategory)),
    [searchLower, subcategory]
  );
  const filteredAssistants = useMemo(() =>
    assistants.filter(a => filterBySearch(a) && filterBySub(a.subcategory)),
    [searchLower, subcategory]
  );
  const filteredKBs = useMemo(() =>
    knowledgeBases.filter(k => filterBySearch(k) && filterBySub(k.subcategory)),
    [searchLower, subcategory]
  );
  const filteredMCP = useMemo(() =>
    mcpTools.filter(m => filterBySearch(m) && filterBySub(m.subcategory)),
    [searchLower, subcategory]
  );
  const filteredSkills = useMemo(() =>
    skills.filter(s => filterBySearch(s) && filterBySub(s.subcategory)),
    [searchLower, subcategory]
  );
  const filteredPlugins = useMemo(() =>
    plugins.filter(p => filterBySearch(p) && filterBySub(p.subcategory)),
    [searchLower, subcategory]
  );

  const handleTryAgent = (agent: Agent) => setExperienceModal({ resource: agent, type: 'agent' });
  const handleChatAssistant = (assistant: Assistant) => setExperienceModal({ resource: assistant, type: 'assistant' });

  const handlePreview = (resource: any, cat: ResourceCategory) => {
    setPreviewModal({ resource, category: cat });
  };

  // Build favorites list for drawer
  const allResources = useMemo(() => {
    const list: { resource: any; category: ResourceCategory }[] = [];
    agents.forEach(a => list.push({ resource: a, category: 'agents' }));
    assistants.forEach(a => list.push({ resource: a, category: 'assistants' }));
    knowledgeBases.forEach(k => list.push({ resource: k, category: 'knowledge' }));
    mcpTools.forEach(m => list.push({ resource: m, category: 'mcp' }));
    skills.forEach(s => list.push({ resource: s, category: 'skills' }));
    plugins.forEach(p => list.push({ resource: p, category: 'plugins' }));
    return list;
  }, []);

  const favoriteItems: FavoriteItem[] = useMemo(() =>
    allResources
      .filter(r => favorites.has(r.resource.id))
      .map(r => ({
        id: r.resource.id,
        name: r.resource.name,
        avatar: getResourceAvatar(r.resource),
        category: r.category,
        categoryLabel: categoryLabels[r.category],
        author: r.resource.author,
        favoritedAt: favorites.get(r.resource.id) || Date.now(),
      })),
    [favorites, allResources]
  );

  // Favorites drawer: preview from drawer item
  const handleDrawerPreview = (item: FavoriteItem) => {
    const found = allResources.find(r => r.resource.id === item.id);
    if (found) {
      setFavDrawerOpen(false);
      setPreviewModal({ resource: found.resource, category: found.category });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0 px-6 pt-6 pb-0"
      >
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-xl text-foreground tracking-tight mb-0.5">探索</h1>
            <p className="text-xs text-muted-foreground/40">发现智能体、助手和工具，提升你的工作效率</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Favorites button */}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setFavDrawerOpen(true)}
              className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/25 text-xs text-muted-foreground/50 hover:text-foreground hover:border-border/50 hover:bg-accent/50 transition-all"
            >
              <Heart size={11} className={favorites.size > 0 ? 'text-destructive/70' : ''} fill={favorites.size > 0 ? 'currentColor' : 'none'} />
              <span>收藏夹</span>
              {favorites.size > 0 && (
                <span className="ml-0.5 px-1 py-px rounded-full bg-destructive/10 text-destructive text-xs tabular-nums">{favorites.size}</span>
              )}
            </Button>
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        {/* Featured */}
        {!search && category === 'agents' && subcategory === '全部' && <FeaturedBanner onTry={handleTryAgent} />}

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-border/15">
          <FilterTabs active={category} onChange={handleCategoryChange} />
        </div>

        {/* Subcategory tags */}
        <SubcategoryTags category={category} active={subcategory} onChange={setSubcategory} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-5 scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={category + subcategory}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* Agents */}
            {category === 'agents' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAgents.map(agent => (
                  <AgentCard key={agent.id} agent={agent}
                    isFavorited={favorites.has(agent.id)}
                    onTry={() => handleTryAgent(agent)}
                    onClick={() => handlePreview(agent, 'agents')} />
                ))}
                {filteredAgents.length === 0 && <div className="col-span-full"><EmptyState preset="no-result" /></div>}
              </div>
            )}

            {/* Assistants */}
            {category === 'assistants' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAssistants.map(a => (
                  <AssistantCard key={a.id} assistant={a}
                    isFavorited={favorites.has(a.id)}
                    onChat={() => handleChatAssistant(a)}
                    onClick={() => handlePreview(a, 'assistants')} />
                ))}
                {filteredAssistants.length === 0 && <div className="col-span-full"><EmptyState preset="no-result" /></div>}
              </div>
            )}

            {/* Knowledge */}
            {category === 'knowledge' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredKBs.map(kb => (
                  <KnowledgeCard key={kb.id} kb={kb}
                    isFavorited={favorites.has(kb.id)}
                    onClick={() => handlePreview(kb, 'knowledge')} />
                ))}
                {filteredKBs.length === 0 && <div className="col-span-full"><EmptyState preset="no-result" /></div>}
              </div>
            )}

            {/* MCP Tools */}
            {category === 'mcp' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMCP.map(tool => (
                  <ToolCard key={tool.id} item={tool} metricLabel="下载" metricValue={formatNumber(tool.downloads)}
                    isFavorited={favorites.has(tool.id)}
                    onClick={() => handlePreview(tool, 'mcp')} />
                ))}
                {filteredMCP.length === 0 && <div className="col-span-full"><EmptyState preset="no-result" /></div>}
              </div>
            )}

            {/* Skills */}
            {category === 'skills' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSkills.map(skill => (
                  <ToolCard key={skill.id} item={skill} metricLabel="次使用" metricValue={formatNumber(skill.usageCount)}
                    isFavorited={favorites.has(skill.id)}
                    onClick={() => handlePreview(skill, 'skills')} />
                ))}
                {filteredSkills.length === 0 && <div className="col-span-full"><EmptyState preset="no-result" /></div>}
              </div>
            )}

            {/* Plugins */}
            {category === 'plugins' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPlugins.map(plugin => (
                  <ToolCard key={plugin.id} item={plugin} metricLabel="下载" metricValue={formatNumber(plugin.downloads)}
                    isFavorited={favorites.has(plugin.id)}
                    onClick={() => handlePreview(plugin, 'plugins')} />
                ))}
                {filteredPlugins.length === 0 && <div className="col-span-full"><EmptyState preset="no-result" /></div>}
              </div>
            )}

            {/* Load more hint */}
            {getFilteredCount() > 0 && (
              <div className="flex flex-col items-center py-8">
                <p className="text-xs text-muted-foreground/50 mb-0.5">
                  当前展示 {getFilteredCount()} 个资源，共 {formatNumber(categoryTotalCounts[category])} 个
                </p>
                <Button variant="ghost" size="xs" className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors mt-1 px-3 py-1 hover:bg-accent/50">
                  加载更多...
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Favorites Drawer */}
      <FavoritesDrawer
        open={favDrawerOpen}
        favorites={favoriteItems}
        onClose={() => setFavDrawerOpen(false)}
        onRemove={id => toggleFavorite(id)}
        onPreview={handleDrawerPreview}
      />

      {/* Preview Modal */}
      <AnimatePresence>
        {previewModal && (
          <PreviewModal
            resource={previewModal.resource}
            category={previewModal.category}
            isFavorited={favorites.has(previewModal.resource.id)}
            isSaved={library.has(previewModal.resource.id)}
            onClose={() => setPreviewModal(null)}
            onToggleFavorite={() => toggleFavorite(previewModal.resource.id)}
            onSaveToLibrary={() => saveToLibrary(previewModal.resource.id)}
            onTry={
              previewModal.category === 'agents'
                ? () => { setPreviewModal(null); handleTryAgent(previewModal.resource); }
                : previewModal.category === 'assistants'
                ? () => { setPreviewModal(null); handleChatAssistant(previewModal.resource); }
                : undefined
            }
          />
        )}
      </AnimatePresence>

      {/* Experience Modal */}
      <AnimatePresence>
        {experienceModal && (
          <ExperienceModal
            resource={experienceModal.resource}
            type={experienceModal.type}
            onClose={() => setExperienceModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );

  function getFilteredCount() {
    switch (category) {
      case 'agents': return filteredAgents.length;
      case 'assistants': return filteredAssistants.length;
      case 'knowledge': return filteredKBs.length;
      case 'mcp': return filteredMCP.length;
      case 'skills': return filteredSkills.length;
      case 'plugins': return filteredPlugins.length;
    }
  }
}

