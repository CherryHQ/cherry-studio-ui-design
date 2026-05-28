import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Textarea, Button } from '@cherry-studio/ui';
import { Cloud, Monitor, ChevronDown, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AVATAR_OPTIONS, PROVIDER_MODELS } from '@/app/config/constants';

type Location = 'cloud' | 'local';

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
}

// Single-step dialog: location is a tab toggle at the top (default 本地),
// then the same form fields below regardless of choice. Visual style mirrors
// AddFriendDialog / NewGroupDialog — DialogTitle + DialogDescription,
// 12px labels, 12.5px inputs, lightweight borders.
export function CreateAgentDialog({ open, onClose }: CreateAgentDialogProps) {
  const [location, setLocation] = useState<Location>('local');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [name, setName] = useState('');
  const [model, setModel] = useState('anthropic/claude-4-opus');
  const [modelOpen, setModelOpen] = useState(false);
  const [description, setDescription] = useState('');

  const handleClose = () => {
    setLocation('local');
    setAvatar(AVATAR_OPTIONS[0]);
    setName('');
    setModel('anthropic/claude-4-opus');
    setDescription('');
    setAvatarOpen(false);
    setModelOpen(false);
    onClose();
  };

  const handleCreate = () => {
    toast.success(`Agent「${name.trim()}」已创建`, {
      description: location === 'cloud' ? '运行在 Cherry 云端' : '运行在这台电脑',
    });
    handleClose();
  };

  const modelEntries = Object.entries(PROVIDER_MODELS).flatMap(([provider, models]) =>
    models.map((m) => ({ provider, model: m, fullId: `${provider.toLowerCase()}/${m}` })),
  );
  const currentModel = modelEntries.find((m) => m.fullId === model) ?? modelEntries[0];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>新建 Agent</DialogTitle>
        </DialogHeader>

        {/* Location tabs */}
        <div className="grid grid-cols-2 gap-1 p-0.5 bg-foreground/[0.04] rounded-md">
          <TabButton
            icon={<Monitor size={12} strokeWidth={1.8} />}
            label="本地"
            active={location === 'local'}
            onClick={() => setLocation('local')}
          />
          <TabButton
            icon={<Cloud size={12} strokeWidth={1.8} />}
            label="云端"
            active={location === 'cloud'}
            onClick={() => setLocation('cloud')}
          />
        </div>
        <div className="-mt-1 text-[11px] text-muted-foreground">
          {location === 'local'
            ? '运行在这台电脑 · 使用本机 token 配额，数据不出本地'
            : '运行在 Cherry 云端 · 跨设备可用，无需配置本地环境'}
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          {/* Avatar + name row */}
          <div className="grid grid-cols-[auto_1fr] gap-2.5 items-start">
            <div>
              <label className="text-[12px] text-foreground/80 block mb-1.5">头像</label>
              <div className="relative">
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="h-9 w-[64px] rounded-md border border-border bg-input-background flex items-center justify-center gap-1 hover:bg-accent/30 transition-colors"
                >
                  <span className="text-[16px] leading-none">{avatar}</span>
                  <ChevronDown size={11} className="text-muted-foreground" />
                </button>
                {avatarOpen && (
                  <div className="absolute z-10 top-full mt-1 left-0 w-[260px] rounded-md border border-border bg-popover shadow-md p-2 grid grid-cols-10 gap-0.5 max-h-[200px] overflow-y-auto">
                    {AVATAR_OPTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => { setAvatar(e); setAvatarOpen(false); }}
                        className={`w-6 h-6 rounded flex items-center justify-center text-[15px] hover:bg-accent/50 ${avatar === e ? 'bg-accent' : ''}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-[12px] text-foreground/80 block mb-1.5">名称</label>
              <Input
                placeholder="例如：代码助手"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-[12.5px]"
              />
            </div>
          </div>

          {/* Description — placed right after name/avatar since they're the
              identity fields; model belongs further down with config. */}
          <div>
            <label className="text-[12px] text-foreground/80 block mb-1.5">描述</label>
            <Textarea
              placeholder="一句话介绍这个 Agent 的用途与擅长场景"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-[12.5px] resize-none"
            />
          </div>

          {/* Model */}
          <div className="relative">
            <label className="text-[12px] text-foreground/80 block mb-1.5">模型</label>
            <button
              onClick={() => setModelOpen((v) => !v)}
              className="w-full h-9 rounded-md border border-border bg-input-background px-2.5 flex items-center gap-2 text-[12.5px] hover:bg-accent/20 transition-colors"
            >
              <Sparkles size={12} strokeWidth={1.8} className="text-muted-foreground" />
              <span className="text-foreground truncate">{currentModel.fullId}</span>
              <span className="text-muted-foreground text-[11px]">· {currentModel.provider}</span>
              <ChevronDown size={12} className="text-muted-foreground ml-auto" />
            </button>
            {modelOpen && (
              <div className="absolute z-10 top-full mt-1 left-0 right-0 max-h-[240px] overflow-y-auto rounded-md border border-border bg-popover shadow-md p-1">
                {modelEntries.map((m) => (
                  <button
                    key={m.fullId}
                    onClick={() => { setModel(m.fullId); setModelOpen(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] hover:bg-accent/40 transition-colors"
                  >
                    <span className="flex-1 text-left text-foreground truncate">{m.fullId}</span>
                    <span className="text-muted-foreground text-[10.5px]">{m.provider}</span>
                    {m.fullId === model && <Check size={11} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={handleClose}>取消</Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            创建 Agent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabButton({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 h-7 rounded text-[12px] transition-colors ${
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
