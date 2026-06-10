import { ArrowRight, Check, X } from 'lucide-react';
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
 * 添加路径走"成功态原地切换"：
 *   - 未添加：底部「取消 + 添加」
 *   - 已添加：底部「关闭 + ✓已添加 + 立即聊天 →」
 *
 * 「立即聊天」帮用户省掉"添加 → 自己去助手列表里找 → 点开 → 开聊"四步路。
 */
export function AssistantPresetPreviewDialog({ preset, installed, onClose, onAdd }: Props) {
  const { navigateToChat } = useGlobalActions();

  const handleChatNow = () => {
    if (!preset) return;
    // 原型阶段：chat 模块按 UI-TEAM-SPEC §6 处于冻结状态，
    // 不做 sidebar 自动选中。用 success toast 表达跳转 + 选中意图。
    navigateToChat();
    toast.success(`${preset.emoji} 已切换到「${preset.name}」`, {
      description: '已加入你的助手列表，可以直接开始对话',
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

            {/* Footer —— 成功态原地 swap */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted">
              {!installed ? (
                <>
                  <Button variant="ghost" size="sm" onClick={onClose}>取消</Button>
                  <Button size="sm" onClick={() => onAdd(preset)}>
                    添加
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={onClose}>关闭</Button>
                  {/* 「已添加」用 outline 静态展示而非 disabled button——
                      避免 §7 disabled opacity-40 把成功反馈视觉打弱。 */}
                  <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-sm text-muted-foreground select-none">
                    <Check size={12} className="text-success" />
                    已添加
                  </div>
                  <Button size="sm" onClick={handleChatNow} className="gap-1">
                    立即聊天
                    <ArrowRight />
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
