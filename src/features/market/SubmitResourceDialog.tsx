import { useState } from 'react';
import { Link2, Plus, Upload } from 'lucide-react';
import {
  Badge, Button, Input, Textarea,
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@cherry-studio/ui';
import { KIND_ICON, KIND_LABEL } from './types';
import type { ResourceKind } from './types';

const ALL_KINDS: ResourceKind[] = [
  'skill', 'cli', 'assistant', 'agent', 'mcp', 'prompt', 'kb', 'integration',
];

export function SubmitResourceDialog({
  open, onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [kind, setKind] = useState<ResourceKind>('skill');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const canSubmit = name.trim().length > 0 && tagline.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/20">
          <DialogTitle className="text-base">提交资源到市场</DialogTitle>
          <DialogDescription className="text-xs">
            提交的资源会在 24 小时内由社区审核员审阅。审核通过后才会出现在公开目录中。
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin px-5 py-4 space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">资源类型</label>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_KINDS.map(k => {
                const Icon = KIND_ICON[k];
                const active = kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`flex items-center justify-center gap-1.5 h-9 rounded-md border text-xs transition-colors ${
                      active
                        ? 'border-foreground/80 bg-foreground text-background'
                        : 'border-border/30 text-muted-foreground hover:text-foreground hover:bg-accent/40'
                    }`}
                  >
                    <Icon size={12} />
                    {KIND_LABEL[k]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <Field label="名称">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例如：网页摘要"
                className="h-9 text-sm"
              />
            </Field>
            <Field label="一句话简介">
              <Input
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="120 字以内，描述这条资源的核心能力"
                className="h-9 text-sm"
              />
            </Field>
            <Field label="详细描述">
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="支持 Markdown：用法说明、示例输入输出、依赖等"
                rows={5}
                className="text-xs leading-relaxed resize-none"
              />
            </Field>
            <Field label="源仓库 / 安装地址">
              <div className="relative">
                <Link2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <Input
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder="https://github.com/your-org/your-skill"
                  className="h-9 pl-8 text-sm font-mono"
                />
              </div>
            </Field>
            <Field label="标签">
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  {tags.map(t => (
                    <Badge key={t} variant="outline" className="gap-1 px-1.5 py-[2px] rounded-md text-xs border-border/40 bg-muted/40 text-muted-foreground">
                      {t}
                      <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="opacity-50 hover:opacity-100">×</button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="输入标签后回车"
                  className="h-8 text-xs flex-1"
                />
                <Button variant="outline" size="xs" onClick={addTag} className="h-8">添加</Button>
              </div>
            </Field>
          </div>

          {/* Upload hint */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border/30 bg-muted/15">
            <Upload size={13} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              如果你的资源需要附带文件，请将仓库根目录的 <span className="font-mono text-foreground">cherry.json</span> + 资源主体一起打包推送到上述地址，审核员会自动拉取。
            </p>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border/20 bg-muted/15">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8">取消</Button>
            <Button
              variant="default"
              size="sm"
              disabled={!canSubmit}
              onClick={() => onOpenChange(false)}
              className="h-8 gap-1.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
            >
              <Plus size={12} />
              提交审核
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
