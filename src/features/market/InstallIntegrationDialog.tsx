import { ArrowLeftRight, BookOpen, Lock, Settings, ShieldCheck } from 'lucide-react';
import {
  Button, Dialog, DialogContent, DialogDescription, DialogTitle,
} from '@cherry-studio/ui';
import cherryLogoImg from '@/assets/cherry-icon.png';
import { INTEGRATION_LOGO } from './catalog';
import type { MarketItem } from './types';

// Mirrors ChatGPT's connector-install sheet: paired logos at the top,
// the connector name + publisher, a stack of permission rows, primary CTA.
function PolicyRow({
  Icon, title, description,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} strokeWidth={1.5} className="text-muted-foreground/80 flex-shrink-0 mt-[2px]" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground leading-tight">{title}</div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );
}

export function InstallIntegrationDialog({
  item, installed, onOpenChange, onConfirm,
}: {
  item: MarketItem | null;
  installed: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  if (!item) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }
  const logoMeta = INTEGRATION_LOGO[item.id];
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Header — paired logos */}
        <div className="px-7 pt-8 pb-4 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center overflow-hidden">
              <img src={cherryLogoImg} alt="" className="w-7 h-7 object-contain" />
            </div>
            <ArrowLeftRight size={16} strokeWidth={1.5} className="text-muted-foreground/40" />
            <div className="w-11 h-11 rounded-xl bg-muted/40 border border-border/20 flex items-center justify-center overflow-hidden">
              {logoMeta ? (
                <img
                  src={`https://cdn.simpleicons.org/${logoMeta.slug}/${logoMeta.color}`}
                  alt=""
                  className="w-6 h-6"
                  draggable={false}
                />
              ) : (
                <span className="text-2xl">{item.avatar}</span>
              )}
            </div>
          </div>
          <DialogTitle className="text-lg font-semibold mt-5">
            连接 Cherry 与 {item.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5 max-w-[320px]">
            在 Cherry 中搜索并使用 {item.name} 的数据与操作
          </DialogDescription>
        </div>

        {/* Policy card */}
        <div className="mx-6 mb-5 rounded-xl border border-border/20 bg-muted/15 px-5 py-4 space-y-4">
          <PolicyRow
            Icon={Settings}
            title={`你掌控 Cherry 可访问的 ${item.name} 数据`}
            description="选择 Cherry 可访问哪些信息，并随时调整这些设置"
          />
          <PolicyRow
            Icon={ShieldCheck}
            title={`Cherry 严格遵循 ${item.name} 的权限`}
            description={`只能查看你在 ${item.name} 中已授权访问的内容`}
          />
          <PolicyRow
            Icon={Lock}
            title={`Cherry 不会用你的 ${item.name} 数据训练模型`}
            description="你的数据安全是首要原则"
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-1 space-y-2">
          <Button
            size="lg"
            disabled={installed}
            onClick={onConfirm}
            className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 font-medium"
          >
            {installed ? `已连接 ${item.name}` : '继续'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full h-10 rounded-xl gap-1.5 font-normal text-muted-foreground hover:text-foreground"
          >
            <BookOpen size={13} />
            阅读分步指南
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
