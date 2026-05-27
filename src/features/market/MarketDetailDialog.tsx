import { Check, Download, ExternalLink, Star } from 'lucide-react';
import {
  Button, Dialog, DialogContent, DialogFooter,
} from '@cherry-studio/ui';
import { KIND_ICON, KIND_LABEL } from './types';
import type { MarketItem } from './types';

export function MarketDetailDialog({
  item, onOpenChange, installed, onToggleInstall,
}: {
  item: MarketItem | null;
  onOpenChange: (open: boolean) => void;
  installed: boolean;
  onToggleInstall: (id: string) => void;
}) {
  if (!item) return (
    <Dialog open={false} onOpenChange={onOpenChange}>
      <DialogContent />
    </Dialog>
  );
  const KIcon = KIND_ICON[item.kind];
  const installsLabel = item.installs >= 10000
    ? `${(item.installs / 1000).toFixed(1)}K`
    : item.installs.toLocaleString();
  const sourceUrl = `https://github.com/${item.author.replace(/^@/, '')}/${item.name.replace(/\s+/g, '-')}`;

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[680px] p-0 overflow-hidden">
        {/* Hero — avatar tile + name */}
        <div className={`relative h-[120px] ${item.avatarBg} overflow-hidden`}>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-background/60 via-transparent to-foreground/10" />
          <div className="absolute inset-0 flex items-end gap-3 px-5 pb-4">
            <div className="w-14 h-14 rounded-xl bg-background shadow-md border border-border/30 flex items-center justify-center text-2xl flex-shrink-0">
              {item.avatar}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base font-semibold text-foreground truncate">{item.name}</span>
                <span className="text-[10px] uppercase px-1.5 py-px rounded border border-border/30 bg-background/70 text-muted-foreground">
                  {KIND_LABEL[item.kind]}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {item.author} · 上架于 {item.ageLabel} 前
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div className="px-5 py-4 space-y-4">
            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg bg-muted/30 border border-border/20">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                  <Download size={9} /> 安装
                </div>
                <div className="text-base font-medium text-foreground tabular-nums">{installsLabel}</div>
              </div>
              <div className="flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg bg-muted/30 border border-border/20">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                  <Star size={9} /> 评分
                </div>
                <div className="text-base font-medium text-foreground tabular-nums">4.6</div>
              </div>
              <div className="flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg bg-muted/30 border border-border/20">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                  <KIcon size={9} /> 分类
                </div>
                <div className="text-sm font-medium text-foreground truncate w-full">{item.category}</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.tagline}
            </p>

            {/* Meta — compact 2-col key/value */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pt-3 border-t border-border/20">
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground/50 w-12 flex-shrink-0">作者</span>
                <span className="text-foreground truncate">{item.author}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground/50 w-12 flex-shrink-0">上架</span>
                <span className="text-foreground">{item.ageLabel} 前</span>
              </div>
              {(item.language || item.region) && (
                <div className="flex items-baseline gap-2">
                  <span className="text-muted-foreground/50 w-12 flex-shrink-0">语言</span>
                  <span className="text-foreground">
                    {[item.language, item.region].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground/50 w-12 flex-shrink-0">类型</span>
                <span className="text-foreground">{KIND_LABEL[item.kind]}</span>
              </div>
            </div>

            {/* Source repo chip */}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-border/30 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors max-w-full"
            >
              <ExternalLink size={11} className="text-muted-foreground/60 flex-shrink-0" />
              <span className="font-mono truncate">{sourceUrl.replace(/^https?:\/\//, '')}</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-3 border-t border-border/20 bg-muted/15">
          <div className="flex items-center justify-between w-full gap-2">
            <Button variant="ghost" size="xs" className="gap-1.5 text-muted-foreground">
              <ExternalLink size={11} />
              查看源仓库
            </Button>
            <Button
              variant={installed ? 'outline' : 'default'}
              size="sm"
              onClick={() => onToggleInstall(item.id)}
              className="h-8 gap-1.5"
            >
              {installed ? <><Check size={12} />已安装</> : <><Download size={12} />立即安装</>}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
