import React, { useState } from 'react';
import {
  X, Check, KeyRound, Loader2, RefreshCw, ChevronDown,
  Server, ShieldAlert, Wifi, Sparkles, Boxes, SlidersHorizontal, ArrowUpRight,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogTitle,
  Button, Input, Switch, Skeleton, BrandLogo,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@cherry-studio/ui';
import { useQuickProviderSetup, type QuickProviderSavePayload } from './useQuickProviderSetup';

// ===========================
// QuickProviderSetupDialog
// ===========================
// Centered modal opened from the conversation's model picker ("连接服务商").
// Pick a provider type → API Key auto-fetches its models → toggle which to
// enable → save. Endpoint type + Base URL live under an "高级设置" collapse.
// Prototype-only: all data comes from the mock catalog + mock fetch.

export interface QuickProviderSetupDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave?: (payload: QuickProviderSavePayload) => void;
  /** Routes to the full Model Service settings page; the host closes the dialog. */
  onAdvanced?: () => void;
}

export function QuickProviderSetupDialog({ open, onOpenChange, onSave, onAdvanced }: QuickProviderSetupDialogProps) {
  const s = useQuickProviderSetup(open);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSave = () => {
    s.save((payload) => {
      onSave?.(payload);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[560px] w-[560px] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">连接服务商</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent/40 flex items-center justify-center">
              <Server size={14} className="text-primary/70" />
            </div>
            <div>
              <div className="text-sm text-foreground font-medium">连接服务商</div>
              <div className="text-xs text-muted-foreground/60">填入 API Key 即可自动拉取可用模型</div>
            </div>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={() => onOpenChange(false)}
            className="text-muted-foreground/60 hover:text-foreground hover:bg-accent/40">
            <X size={14} />
          </Button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {/* Provider type */}
          <div>
            <label className="block text-xs text-muted-foreground/80 mb-1">服务商</label>
            <Select value={s.providerId} onValueChange={s.selectProvider}>
              <SelectTrigger className="w-full h-9 bg-background">
                <SelectValue placeholder="选择服务商类型">
                  {s.provider && (
                    <span className="flex items-center gap-2">
                      {s.provider.isCustom
                        ? <Boxes size={15} className="text-muted-foreground" />
                        : <BrandLogo id={s.provider.brandLogoId} size={15} />}
                      <span className="text-sm">{s.provider.name}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[var(--z-popover)]">
                {s.providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      {p.isCustom
                        ? <Boxes size={15} className="text-muted-foreground" />
                        : <BrandLogo id={p.brandLogoId} size={15} />}
                      <span>{p.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom provider: name + protocol + Base URL are required inline */}
          {s.isCustom && (
            <div className="rounded-md border border-border/40 bg-muted/10 px-3 py-3 space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground/80 mb-1">服务商名称</label>
                <Input
                  value={s.customName}
                  onChange={(e) => s.setCustomName(e.target.value)}
                  placeholder="例如：My Gateway"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground/80 mb-1">接口类型</label>
                <Select value={s.endpointTypeId} onValueChange={s.selectEndpointType}>
                  <SelectTrigger className="w-full h-9 bg-background">
                    <SelectValue placeholder="选择接口协议" />
                  </SelectTrigger>
                  <SelectContent className="z-[var(--z-popover)]">
                    {s.provider?.endpointTypes.map((et) => (
                      <SelectItem key={et.id} value={et.id}>{et.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground/80 mb-1">Base URL</label>
                <Input
                  value={s.baseUrl}
                  onChange={(e) => s.changeBaseUrl(e.target.value)}
                  placeholder="https://your-gateway.com/v1"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="block text-xs text-muted-foreground/80 mb-1">API Key</label>
            <div className="relative">
              <KeyRound size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
              <Input
                type="password"
                value={s.apiKey}
                onChange={(e) => s.setApiKey(e.target.value)}
                placeholder="粘贴 API Key"
                className="h-9 text-sm pl-8"
              />
            </div>
            <div className="text-xs text-muted-foreground/40 mt-1">仅用于本地原型演示，不会真正发送请求</div>
          </div>

          {/* Advanced settings (endpoint + base url) — catalog providers only */}
          {!s.isCustom && (
          <div className="rounded-md border border-border/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors"
            >
              <span>高级设置（接口类型 / Base URL）</span>
              <ChevronDown size={13} className={`text-muted-foreground/50 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            {showAdvanced && (
              <div className="px-3 pb-3 pt-1 space-y-3 border-t border-border/30">
                <div>
                  <label className="block text-xs text-muted-foreground/80 mb-1">接口类型</label>
                  <Select value={s.endpointTypeId} onValueChange={s.selectEndpointType} disabled={!s.provider}>
                    <SelectTrigger className="w-full h-9 bg-background">
                      <SelectValue placeholder="选择接口类型" />
                    </SelectTrigger>
                    <SelectContent className="z-[var(--z-popover)]">
                      {s.provider?.endpointTypes.map((et) => (
                        <SelectItem key={et.id} value={et.id}>{et.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground/80 mb-1">Base URL</label>
                  <Input
                    value={s.baseUrl}
                    onChange={(e) => s.changeBaseUrl(e.target.value)}
                    placeholder="https://api.example.com/v1"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              </div>
            )}
          </div>
          )}

          {/* Models */}
          <ModelsSection s={s} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/10 flex-shrink-0">
          {onAdvanced ? (
            <button
              type="button"
              onClick={onAdvanced}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal size={12} />
              <span>高级配置</span>
              <ArrowUpRight size={12} className="text-muted-foreground/50" />
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}
              className="text-xs text-muted-foreground hover:text-foreground">
              取消
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={!s.canSave} className="text-xs">
              {s.saving
                ? <><Loader2 size={12} className="mr-1 animate-spin" />保存中…</>
                : <><Check size={12} className="mr-1" />保存并使用{s.enabledCount > 0 ? `（${s.enabledCount}）` : ''}</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Models section — reflects the fetch state machine.
// ---------------------------------------------------------------------------
function ModelsSection({ s }: { s: ReturnType<typeof useQuickProviderSetup> }) {
  const { status, models, enabledCount } = s;

  if (status.kind === 'idle') {
    return (
      <div className="rounded-md border border-dashed border-border/50 px-3 py-5 text-center">
        <Sparkles size={16} className="mx-auto text-muted-foreground/30 mb-1.5" />
        <div className="text-xs text-muted-foreground/60">填好服务商与 API Key 后将自动获取可用模型</div>
      </div>
    );
  }

  if (status.kind === 'loading') {
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
          <Loader2 size={12} className="animate-spin text-primary/60" />
          <span>正在获取模型…</span>
        </div>
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-border/30">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3.5 flex-1 max-w-[180px]" />
              <Skeleton className="h-4 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status.kind === 'error') {
    const isAuth = status.reason === 'auth';
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-4">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0">
            {isAuth ? <ShieldAlert size={14} className="text-destructive/80" /> : <Wifi size={14} className="text-destructive/80" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-foreground font-medium">
              {isAuth ? 'API Key 校验失败' : '网络连接失败'}
            </div>
            <div className="text-xs text-muted-foreground/70 mt-0.5 leading-[1.5]">
              {isAuth ? '请检查 Key 是否正确、是否有访问该服务商的权限。' : '无法连接到服务商，请检查网络或 Base URL 后重试。'}
            </div>
            <Button variant="outline" size="xs" onClick={s.retry} className="mt-2 h-7 text-xs gap-1">
              <RefreshCw size={11} />重试
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // success
  if (models.length === 0) {
    return (
      <div className="rounded-md border border-border/40 px-3 py-5 text-center">
        <div className="text-xs text-muted-foreground/60">该服务商暂未返回可用模型</div>
      </div>
    );
  }

  const allOn = enabledCount === models.length;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground/80">
          可用模型 <span className="text-muted-foreground/50">· 已选 {enabledCount}/{models.length}</span>
        </div>
        <button
          type="button"
          onClick={() => s.setAllModels(!allOn)}
          className="text-xs text-primary/70 hover:text-primary transition-colors"
        >
          {allOn ? '全不选' : '全选'}
        </button>
      </div>
      <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin pr-0.5">
        {models.map((m) => (
          <label
            key={m.id}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md border border-border/30 hover:bg-accent/20 transition-colors cursor-pointer"
          >
            <span className="flex-1 min-w-0 text-sm text-foreground/90 truncate font-mono">{m.id}</span>
            <Switch checked={m.enabled} onCheckedChange={() => s.toggleModel(m.id)} className="scale-[0.7]" />
          </label>
        ))}
      </div>
    </div>
  );
}
