import { Trash2, X } from 'lucide-react';
import { Switch } from '@cherry-studio/ui';
import { Button } from '@cherrystudio/ui/components/primitives/button';
import { Dialog, DialogContent } from '@cherrystudio/ui/components/primitives/dialog';
import type { ResourceItem } from '@/app/types';
import { RESOURCE_TYPE_CONFIG } from '@/app/config/constants';
import { AssistantConfig } from '@/features/assistant/AssistantConfig';
import { AgentConfig } from '@/features/agent/AgentConfig';
import { SkillPluginDetail } from '@/features/library/SkillPluginDetail';
import { PromptEditPage } from '@/features/library/PromptEditPage';

// Shared in-app config modal — used by:
//   - LibraryPage (editing resources from the library)
//   - AgentRunPage (clicking the agent avatar / configure button)
//   - AssistantRunPage / ChatPage (clicking the assistant avatar / 配置)
// Routes to AgentConfig / AssistantConfig / SkillPluginDetail /
// PromptEditPage based on `resource.type`. Each embedded editor
// strips its own breadcrumb / save chrome via `inModal`.
export interface ResourceConfigDialogProps {
  resource: ResourceItem | null;
  onOpenChange: (open: boolean) => void;
  /** Toggle enabled — only meaningful for skill / plugin (shows Switch in header). */
  onToggle?: (id: string) => void;
  /** Soft-delete — only meaningful for skill / plugin (shows Trash in header). */
  onDelete?: (resource: ResourceItem) => void;
  /** Persist prompt edits back to the source store (PromptEditPage flow). */
  onSavePrompt?: (id: string, updates: Partial<ResourceItem>) => void;
}

export function ResourceConfigDialog({
  resource, onOpenChange, onToggle, onDelete, onSavePrompt,
}: ResourceConfigDialogProps) {
  const open = !!resource;
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[760px] sm:!max-w-[760px] !w-[min(760px,84vw)] !h-[min(520px,72vh)] !max-h-[72vh] !rounded-2xl !p-0 !gap-0 !grid-cols-1 overflow-hidden border border-border/20 shadow-xl flex flex-col"
      >
        {resource && (() => {
          const cfg = RESOURCE_TYPE_CONFIG[resource.type];
          const TypeIcon = cfg.icon;
          const isSkillish = resource.type === 'skill' || resource.type === 'plugin';
          return (
            <div className="flex items-center gap-3 px-5 h-14 border-b border-border/15 flex-shrink-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cfg.color}`}>
                {resource.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">{resource.name}</span>
                  <span className="inline-flex items-center gap-1 flex-shrink-0 px-1.5 py-px rounded text-[10px] leading-none border border-border/30 bg-muted/40 text-muted-foreground/80 font-normal">
                    <TypeIcon size={9} />
                    {cfg.label}
                  </span>
                  <span className="inline-flex items-center gap-1 flex-shrink-0 text-xs text-muted-foreground/60 font-normal">
                    <span className={`w-1.5 h-1.5 rounded-full ${resource.enabled ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                    {resource.enabled ? '已启用' : '已禁用'}
                  </span>
                </div>
              </div>
              {isSkillish && onToggle && (
                <Switch
                  size="sm"
                  checked={resource.enabled}
                  onCheckedChange={() => onToggle(resource.id)}
                  aria-label={resource.enabled ? '已启用' : '已禁用'}
                  className="flex-shrink-0"
                />
              )}
              {isSkillish && onDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(resource)}
                  aria-label="删除"
                  title={`删除${cfg.label}`}
                  className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={close}
                aria-label="关闭"
                className="text-muted-foreground/50 hover:text-foreground hover:bg-accent/40 flex-shrink-0"
              >
                <X size={14} />
              </Button>
            </div>
          );
        })()}

        <div className="flex-1 min-h-0 flex">
          {resource && resource.type === 'prompt' && (
            <PromptEditPage
              key={resource.id}
              resource={resource}
              onBack={close}
              inModal
              onSave={(updates) => { onSavePrompt?.(resource.id, updates); close(); }}
            />
          )}
          {resource && resource.type === 'assistant' && (
            <AssistantConfig key={resource.id} resource={resource} onBack={close} inModal />
          )}
          {resource && resource.type === 'agent' && (
            <AgentConfig key={resource.id} resource={resource} onBack={close} inModal />
          )}
          {resource && (resource.type === 'skill' || resource.type === 'plugin') && (
            <SkillPluginDetail
              key={resource.id}
              resource={resource}
              onBack={close}
              onToggle={onToggle ?? (() => {})}
              onDelete={onDelete ?? (() => {})}
              inModal
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
