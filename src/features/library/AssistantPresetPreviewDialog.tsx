import { ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@cherry-studio/ui';
import { useGlobalActions } from '@/app/context/GlobalActionContext';
import type { AssistantPreset } from './assistantPresets';

interface Props {
  preset: AssistantPreset | null;
  installed: boolean;
  onClose: () => void;
  onAdd: (preset: AssistantPreset) => void;
}

/**
 * 极简的助手预设预览弹窗——对齐真实产品（截图 DJ7hg0）。
 *
 * Dialog 里的「添加」语义：**添加 + 立即跳转到 chat**——把"添加 → 自己去
 * 助手列表找 → 开聊"四步合成一步。
 *
 * 已添加的情况下按钮变「立即聊天」：只跳转，不重复添加。
 *
 * 卡片上的「添加」按钮维持 silent 添加（不跳转），支持"逛逛收着"场景；
 * 两个入口因此有差异化语义。
 */
export function AssistantPresetPreviewDialog({ preset, installed, onClose, onAdd }: Props) {
  const { navigateToChat } = useGlobalActions();

  const handlePrimary = () => {
    if (!preset) return;
    if (!installed) onAdd(preset);
    // 原型阶段：chat 模块按 UI-TEAM-SPEC §6 处于冻结状态，
    // 不做 sidebar 自动选中。用 success toast 表达跳转 + 选中意图。
    navigateToChat();
    toast.success(`${preset.emoji} 已切换到「${preset.name}」`, {
      description: installed
        ? '已是你的助手，可以直接开始对话'
        : '已加入你的助手列表，可以直接开始对话',
      duration: 5000,
    });
    onClose();
  };

  return (
    <Dialog open={!!preset} onOpenChange={(open) => { if (!open) onClose(); }}>
      {/* Dialog 默认 sm:max-w-lg ≈ 32rem；按 spec §4 不再自定 max-w。
          仅保留 !p-0 !gap-0 让 hero header 与 body 自行控制内距。 */}
      <DialogContent
        showCloseButton={false}
        className="!p-0 !gap-0 overflow-hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{preset?.name ?? ''}</DialogTitle>
        </DialogHeader>

        {preset && (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-3">
              <div className={`size-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${preset.avatarBg}`}>
                {preset.emoji}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-sm font-semibold text-foreground truncate">{preset.name}</div>
                {preset.featured && (
                  <div className="text-xs text-muted-foreground mt-0.5">精选</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="关闭"
                className="shrink-0"
              >
                <X />
              </Button>
            </div>

            {/* Body */}
            <div className="px-5 pb-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
              <section>
                <div className="text-xs text-muted-foreground mb-1.5">简介</div>
                <p className="text-sm text-foreground leading-relaxed">
                  {preset.description}
                </p>
              </section>

              <section>
                <div className="text-xs text-muted-foreground mb-1.5">提示词</div>
                <div className="rounded-lg border border-border bg-muted px-3.5 py-3 text-foreground leading-relaxed whitespace-pre-wrap font-mono text-xs">
                  {preset.systemPrompt}
                </div>
              </section>
            </div>

            {/* Footer —— 添加 = 添加并跳转聊天 */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted">
              <Button variant="ghost" size="sm" onClick={onClose}>取消</Button>
              <Button size="sm" onClick={handlePrimary} className="gap-1">
                {installed ? '立即聊天' : '添加并聊天'}
                <ArrowRight />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
