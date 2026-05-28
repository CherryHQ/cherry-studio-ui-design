import { useEffect, useMemo, useState } from 'react';
import { FolderCog, Plus, Sparkles } from 'lucide-react';
import {
  Button, Input, SearchInput,
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@cherry-studio/ui';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import { CATALOG, BUILTIN_FEEDS } from './catalog';
import { KIND_LABEL } from './types';
import type { MarketItem, ResourceKind } from './types';
import { MarketSidebar } from './MarketSidebar';
import { MarketCardGrid } from './MarketCard';
import { MarketDetailDialog } from './MarketDetailDialog';
import { InstallIntegrationDialog } from './InstallIntegrationDialog';
import { SubmitResourceDialog } from './SubmitResourceDialog';

export function MarketPage() {
  const { navigateToLibrary } = useGlobalActions();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<ResourceKind | 'all'>('all');

  // Mock pre-installed set — backs 管理 panel where users see everything
  // they own (installed-from-market + 自定义).
  const [installed, setInstalled] = useState<Set<string>>(() => new Set([
    'm-1', 'm-2', 'm-5', 'm-8', 'm-11', 'm-19', 'm-22', 'm-26',
    'm-29', 'm-32', 'm-7', 'm-13', 'm-3',
  ]));

  const [detailItem, setDetailItem] = useState<MarketItem | null>(null);
  const [installItem, setInstallItem] = useState<MarketItem | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  // Subscription feeds — strip below the search bar. 'cherry' default,
  // users can add custom feeds (label derived from URL host).
  const [feedId, setFeedId] = useState<string>('cherry');
  const [customFeeds, setCustomFeeds] = useState<{ id: string; label: string; url: string }[]>([]);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [feedUrl, setFeedUrl] = useState('');

  const addCustomFeed = () => {
    const url = feedUrl.trim();
    if (!url) return;
    let label = url;
    try {
      label = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
    } catch { /* keep raw url */ }
    const id = `custom-${Date.now()}`;
    setCustomFeeds(prev => [...prev, { id, label, url }]);
    setFeedId(id);
    setFeedUrl('');
    setFeedDialogOpen(false);
  };

  // Defensive: Radix Dialog occasionally leaves body.style.pointerEvents
  // set to 'none' after closing, blocking all clicks.
  useEffect(() => {
    const anyOpen = detailItem !== null || submitOpen || feedDialogOpen || installItem !== null;
    if (!anyOpen) document.body.style.pointerEvents = '';
  }, [detailItem, submitOpen, feedDialogOpen, installItem]);

  const toggleInstall = (id: string) => {
    setInstalled(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = CATALOG.slice();
    if (kind !== 'all') list = list.filter(it => it.kind === kind);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(it =>
      it.name.toLowerCase().includes(q) ||
      it.tagline.toLowerCase().includes(q) ||
      it.author.toLowerCase().includes(q),
    );
    return list;
  }, [kind, search]);

  // Featured strip — top 6 trending in the current selection.
  const featured = useMemo(() => [...filtered]
    .filter(it => it.trending)
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 6),
  [filtered]);

  // Sections under Featured:
  //   全部:   group by kind  (Skill / MCP / CLI / Agent / …)
  //   单 kind: group by category (开发 / 数据 / 办公 / …)
  //   搜索时:  flat — bypassed
  const sectionGroups = useMemo(() => {
    if (search.trim()) return [];
    const featuredIds = new Set(featured.map(f => f.id));
    const rest = filtered.filter(it => !featuredIds.has(it.id));
    const byKey = new Map<string, MarketItem[]>();
    const keyOf = (it: MarketItem) => kind === 'all' ? it.kind : it.category;
    rest.forEach(it => {
      const k = keyOf(it);
      const arr = byKey.get(k) ?? [];
      arr.push(it);
      byKey.set(k, arr);
    });
    return [...byKey.entries()]
      .map(([key, items]) => ({
        key,
        label: kind === 'all' ? KIND_LABEL[key as ResourceKind] : key,
        items: items.sort((a, b) => b.installs - a.installs),
      }))
      .sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label));
  }, [filtered, featured, search, kind]);

  const onIntegrationClick = (it: MarketItem) => setInstallItem(it);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar — submit + 管理 entries. Resource management lives in
          the Library page, not here. */}
      <div className="flex-shrink-0 px-6 pt-5">
        <div className="max-w-[1120px] mx-auto flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigateToLibrary()}
            className="h-8 px-2.5 gap-1 text-xs"
            title="打开资源库"
          >
            <FolderCog size={12} />
            管理
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setSubmitOpen(true)}
            className="h-8 px-2.5 gap-1 text-xs"
          >
            <Plus size={12} />
            提交资源
          </Button>
        </div>
      </div>

      {/* Scrollable content — left rail + right main */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[1120px] mx-auto px-6 pt-8 pb-12">
          <div className="flex gap-8">
            <MarketSidebar kind={kind} onKindChange={setKind} />

            <div className="flex-1 min-w-0">
              {/* Search bar */}
              <div className="mb-3">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="搜索资源"
                  clearable
                  wrapperClassName="flex items-center gap-2 px-3 h-10 rounded-md border border-border/40 bg-background hover:border-border/50 focus-within:border-foreground/70 transition-colors"
                />
              </div>

              {/* Feed strip — built-in + custom sources */}
              <div className="flex items-center gap-1.5 mb-5 flex-wrap">
                {[...BUILTIN_FEEDS, ...customFeeds].map(feed => {
                  const active = feedId === feed.id;
                  return (
                    <button
                      key={feed.id}
                      type="button"
                      onClick={() => setFeedId(feed.id)}
                      className={`inline-flex items-center h-7 px-3 rounded-full text-xs transition-colors ${
                        active
                          ? 'bg-foreground text-background'
                          : 'border border-border/40 text-muted-foreground hover:border-border/50 hover:bg-accent/40 hover:text-foreground'
                      }`}
                    >
                      {feed.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setFeedDialogOpen(true)}
                  aria-label="添加订阅源"
                  title="添加订阅源"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-dashed border-border/40 text-muted-foreground hover:border-border/50 hover:text-foreground hover:bg-accent/40 transition-colors"
                >
                  <Plus size={13} strokeWidth={1.8} />
                </button>
              </div>

              {/* Main content — integrations get a special header */}
              {kind === 'integration' ? (
                <section>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-medium text-foreground">连接器管理</h2>
                      <p className="text-xs text-muted-foreground/50 mt-0.5">连接外部服务，扩展 AI 能力</p>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setSubmitOpen(true)}
                      className="h-7 gap-1 px-2.5 text-xs flex-shrink-0"
                      title="提交自定义连接器配置"
                    >
                      <Plus size={11} />
                      自定义连接器
                    </Button>
                  </div>
                  <MarketCardGrid
                    items={CATALOG.filter(it => it.kind === 'integration')}
                    installed={installed}
                    onSelect={onIntegrationClick}
                    onToggleInstall={(id) => {
                      const it = CATALOG.find(c => c.id === id);
                      if (it) setInstallItem(it);
                    }}
                  />
                </section>
              ) : (
                <>
                  {featured.length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-sm font-medium text-foreground mb-3">Featured</h2>
                      <MarketCardGrid
                        items={featured}
                        installed={installed}
                        onSelect={setDetailItem}
                        onToggleInstall={toggleInstall}
                      />
                    </section>
                  )}

                  {search.trim() ? (
                    filtered.length === 0 ? (
                      <EmptyResults />
                    ) : (
                      <section>
                        <h2 className="text-sm font-medium text-foreground mb-3">搜索结果</h2>
                        <MarketCardGrid
                          items={filtered}
                          installed={installed}
                          onSelect={setDetailItem}
                          onToggleInstall={toggleInstall}
                        />
                      </section>
                    )
                  ) : (
                    sectionGroups.length === 0 && featured.length === 0 ? (
                      <EmptyResults />
                    ) : (
                      sectionGroups.map(({ key, label, items }) => (
                        <section key={key} className="mb-8 last:mb-0">
                          <h2 className="text-sm font-medium text-foreground mb-3">{label}</h2>
                          <MarketCardGrid
                            items={items}
                            installed={installed}
                            onSelect={setDetailItem}
                            onToggleInstall={toggleInstall}
                          />
                        </section>
                      ))
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <MarketDetailDialog
        item={detailItem}
        onOpenChange={(open) => { if (!open) setDetailItem(null); }}
        installed={detailItem ? installed.has(detailItem.id) : false}
        onToggleInstall={toggleInstall}
      />
      <SubmitResourceDialog open={submitOpen} onOpenChange={setSubmitOpen} />
      <InstallIntegrationDialog
        item={installItem}
        installed={installItem ? installed.has(installItem.id) : false}
        onOpenChange={(open) => { if (!open) setInstallItem(null); }}
        onConfirm={() => {
          if (installItem && !installed.has(installItem.id)) toggleInstall(installItem.id);
          setInstallItem(null);
        }}
      />

      {/* Add-feed dialog */}
      <Dialog open={feedDialogOpen} onOpenChange={setFeedDialogOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>添加订阅源</DialogTitle>
            <DialogDescription>
              粘贴一个 RSS / JSON Feed / GitHub 仓库链接，Cherry 会订阅它的新资源更新。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-1">
            <label className="text-xs text-muted-foreground">订阅链接</label>
            <Input
              autoFocus
              value={feedUrl}
              onChange={e => setFeedUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCustomFeed(); }}
              placeholder="https://example.com/feed.json"
              className="h-9"
            />
          </div>
          <DialogFooter className="bg-transparent">
            <Button variant="outline" size="sm" onClick={() => setFeedDialogOpen(false)}>取消</Button>
            <Button size="sm" disabled={!feedUrl.trim()} onClick={addCustomFeed}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="border border-dashed border-border/30 rounded-xl py-12 flex flex-col items-center text-muted-foreground/50">
      <Sparkles size={20} strokeWidth={1.3} className="mb-2 text-muted-foreground/30" />
      <p className="text-xs">没有匹配的资源</p>
    </div>
  );
}
