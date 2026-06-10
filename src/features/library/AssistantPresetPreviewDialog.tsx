import { useState } from 'react';
import { Check, MessageCirclePlus, X } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@cherry-studio/ui';
import type { AssistantPreset } from './assistantPresets';
import { getTrial, startTrial, discardTrial } from '@/app/stores/trialAssistantStore';
import { useGlobalActions } from '@/app/context/GlobalActionContext';

interface Props {
  preset: AssistantPreset | null;
  installed: boolean;
  /** Used to decide which CTA is primary — empty list → 立即试聊 highlighted */
  hasAnyInstalled: boolean;
  onClose: () => void;
  onAdd: (preset: AssistantPreset) => void;
}

/**
 * 极简的助手预设预览弹窗——对齐真实产品（截图 DJ7hg0）。
 * 头部 emoji + 标题 + 精选 badge + ×；简介；提示词；底部「立即试聊」+「添加」。
 *
 * 立即试聊路径：
 *   - 无已有试聊 → startTrial + 跳到 chat tab
 *   - 已有试聊 → 内嵌冲突确认（保留 / 丢弃旧试聊）→ 然后再开新试聊
 */
export function AssistantPresetPreviewDialog({
  preset, installed, hasAnyInstalled, onClose, onAdd,
}: Props) {
  const { navigateToChat } = useGlobalActions();
  const [conflict, setConflict] = useState<{ existing: string } | null>(null);

  const startNewTrial = (p: AssistantPreset) => {
    // 真实产品里 preset.defaultModel 可能为空——mock 里没有该字段，
    // 演示用一个全局默认模型 "gpt-4o" 占位，flag 标 true 让 banner 显示
    // "使用默认模型" note。
    startTrial({
      preset: p,
      modelId: 'gpt-4o',
      usingGlobalDefault: true,
    });
    navigateToChat();
    onClose();
  };

  const handleChatNow = () => {
    if (!preset) return;
    const existing = getTrial();
    if (existing && existing.preset.id !== preset.id) {
      setConflict({ existing: existing.preset.name });
      return;
    }
    startNewTrial(preset);
  };

  // 默认 primary 取决于用户是否已有助手（issue spec）：
  //   - 空列表：试聊高亮，引导先试
  //   - 已有助手：添加为主操作
  const trialIsPrimary = !hasAnyInstalled;

  return (
    <>
      <Dialog open={!!preset && !conflict} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent
          showCloseButton={false}
          className="!max-w-[480px] sm:!max-w-[480px] !w-[min(480px,90vw)] !p-0 !gap-0 !rounded-2xl overflow-hidden border border-border/20 shadow-xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{preset?.name ?? ''}</DialogTitle>
          </DialogHeader>

          {preset && (
            <>
              {/* Header */}
              <div className="flex items-start gap-3 px-5 pt-5 pb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${preset.avatarBg}`}>
                  {preset.emoji}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-sm font-semibold text-foreground truncate">{preset.name}</div>
                  {preset.featured && (
                    <div className="text-xs text-muted-foreground/60 mt-0.5">精选</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/40 flex-shrink-0"
                  aria-label="关闭"
                >
                  <X size={14} />
                </Button>
              </div>

              {/* Body */}
              <div className="px-5 pb-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                <section>
                  <div className="text-xs text-muted-foreground/50 mb-1.5">简介</div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {preset.description}
                  </p>
                </section>

                <section>
                  <div className="text-xs text-muted-foreground/50 mb-1.5">提示词</div>
                  <div className="rounded-lg border border-border/20 bg-muted/30 px-3.5 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono text-xs">
                    {preset.systemPrompt}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/15 bg-muted/15">
                <Button variant="ghost" size="sm" onClick={onClose}>取消</Button>
                <Button
                  size="sm"
                  variant={trialIsPrimary ? 'default' : 'outline'}
                  onClick={handleChatNow}
                  className="gap-1.5"
                >
                  <MessageCirclePlus size={12} />
                  立即试聊
                </Button>
                <Button
                  size="sm"
                  variant={trialIsPrimary ? 'outline' : 'default'}
                  onClick={() => onAdd(preset)}
                  disabled={installed}
                  className="gap-1.5"
                >
                  {installed ? <><Check size={12} />已添加</> : '添加'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 冲突确认：已存在另一个未保留的试聊 */}
      <Dialog open={!!conflict} onOpenChange={(open) => { if (!open) setConflict(null); }}>
        <DialogContent
          showCloseButton={false}
          className="!max-w-[400px] sm:!max-w-[400px] !w-[min(400px,90vw)] !p-0 !gap-0 !rounded-2xl overflow-hidden border border-border/20 shadow-xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>替换试聊</DialogTitle>
          </DialogHeader>
          {conflict && preset && (
            <>
              <div className="px-5 pt-5 pb-3">
                <div className="text-sm font-medium text-foreground">
                  要保留还是丢弃当前试聊「{conflict.existing}」？
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed mt-2">
                  一次只能存在一个试聊。开始「{preset.name}」的新试聊前，需要处理当前未保留的试聊。
                </p>
              </div>
              <DialogFooter className="px-5 py-3 border-t border-border/15 bg-muted/15">
                <Button variant="ghost" size="sm" onClick={() => setConflict(null)}>取消</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    discardTrial();
                    setConflict(null);
                    startNewTrial(preset);
                  }}
                >
                  丢弃旧试聊
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // "保留" 路径：mock 把旧 trial 当成已添加，然后开新 trial
                    const existing = getTrial();
                    if (existing) {
                      // mock：保留即视为已添加（不做真实持久化），清空 store
                      discardTrial();
                    }
                    setConflict(null);
                    startNewTrial(preset);
                  }}
                >
                  保留旧试聊
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
