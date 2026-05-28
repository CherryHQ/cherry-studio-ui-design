import { ChevronRight, Eye, Pencil, ShieldCheck } from 'lucide-react';
import {
  Button, Dialog, DialogContent, DialogDescription, DialogTitle,
} from '@cherry-studio/ui';
import cherryLogoImg from '@/assets/cherry-icon.png';
import { INTEGRATION_LOGO } from './catalog';
import type { MarketItem } from './types';

// One scope row inside the permissions card.
function ScopeRow({
  Icon, title, description,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} strokeWidth={1.6} className="text-muted-foreground flex-shrink-0 mt-[3px]" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground leading-tight">{title}</div>
        <p className="text-xs text-muted-foreground/70 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// OAuth-style install sheet for marketplace integrations.
// Visual: paired app logos joined with chevrons, intent line ("连接 X
// 作为 ..."), description, scope card (eye / pencil / etc. with subtitles),
// single dark CTA "立即前往授权", privacy footer.
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
      <DialogContent
        showCloseButton={false}
        className="!max-w-[440px] !p-0 !gap-0 overflow-hidden rounded-2xl"
      >
        {/* Header — paired logos */}
        <div className="px-7 pt-10 pb-2 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/20 flex items-center justify-center overflow-hidden">
              {logoMeta ? (
                <img
                  src={`https://cdn.simpleicons.org/${logoMeta.slug}/${logoMeta.color}`}
                  alt=""
                  className="w-8 h-8"
                  draggable={false}
                />
              ) : (
                <span className="text-3xl">{item.avatar}</span>
              )}
            </div>
            <div className="flex items-center gap-[1px] text-muted-foreground/40">
              <ChevronRight size={11} strokeWidth={2} />
              <ChevronRight size={11} strokeWidth={2} />
              <ChevronRight size={11} strokeWidth={2} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center overflow-hidden">
              <img src={cherryLogoImg} alt="" className="w-9 h-9 object-contain" />
            </div>
          </div>

          <DialogTitle className="text-base font-semibold mt-6 text-foreground">
            连接 {item.name} 作为 AI 知识库
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-2.5 max-w-[360px] leading-relaxed">
            授权后，Cherry 将能读取你的 {item.name} 内容，为你提供总结提炼、智能问答，以及自动化文档创作与管理。
          </DialogDescription>
        </div>

        {/* Scopes card */}
        <div className="mx-6 mt-5 rounded-xl bg-muted/30 px-5 py-4">
          <p className="text-xs text-muted-foreground/70 mb-3">即将获取以下权限</p>
          <div className="space-y-3">
            <ScopeRow
              Icon={Eye}
              title="读取文档与内容"
              description="读取您的各类型文件、文件夹及具体内容"
            />
            <ScopeRow
              Icon={Pencil}
              title="编辑与管理文件"
              description="代表您进行查看、编辑、创建及管理操作"
            />
          </div>
        </div>

        {/* Primary CTA */}
        <div className="px-6 pt-4">
          <Button
            size="lg"
            disabled={installed}
            onClick={onConfirm}
            className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 text-sm font-medium"
          >
            {installed ? `已连接 ${item.name}` : '立即前往授权'}
          </Button>
        </div>

        {/* Privacy footer */}
        <div className="px-6 pt-3 pb-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
          <ShieldCheck size={11} className="text-success/70 flex-shrink-0" />
          <span>Cherry 仅在您执行 AI 任务时调用数据，严格保护隐私</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
