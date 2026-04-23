import React, { useState, useRef } from 'react';
import {
  Upload, Clipboard, Link, FileJson,
  CheckCircle2, AlertCircle, File,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input, Textarea, Dialog, DialogContent, DialogTitle } from '@cherry-studio/ui';

interface Props {
  open: boolean;
  onClose: () => void;
}

type ImportTab = 'file' | 'clipboard' | 'url';

export function ImportModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<ImportTab>('file');
  const [dragOver, setDragOver] = useState(false);
  const [clipboardText, setClipboardText] = useState('');
  const [urlText, setUrlText] = useState('');
  const [importState, setImportState] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateImport(file.name);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateImport(file.name);
  };

  const simulateImport = (name: string) => {
    setFileName(name);
    setImportState('success');
    setTimeout(() => {
      setImportState('idle');
      setFileName('');
    }, 3000);
  };

  const handleImportClipboard = () => {
    if (clipboardText.trim()) {
      setImportState('success');
      setTimeout(() => setImportState('idle'), 3000);
    }
  };

  const handleImportUrl = () => {
    if (urlText.trim()) {
      setImportState('success');
      setTimeout(() => setImportState('idle'), 3000);
    }
  };

  const tabs: { id: ImportTab; label: string; icon: React.ElementType }[] = [
    { id: 'file', label: '文件上传', icon: Upload },
    { id: 'clipboard', label: '剪贴板', icon: Clipboard },
    { id: 'url', label: 'URL 导入', icon: Link },
  ];

  const reset = () => {
    setTab('file');
    setClipboardText('');
    setUrlText('');
    setImportState('idle');
    setFileName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); }}>
      <DialogContent className="bg-popover rounded-2xl border border-border/30 w-[460px] max-w-[460px] shadow-2xl overflow-hidden p-0 gap-0 [&>button:last-child]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/15">
          <div>
            <DialogTitle className="text-sm text-foreground">导入资源</DialogTitle>
            <p className="text-xs text-muted-foreground/40 mt-0.5">支持 JSON / YAML 格式的配置文件</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 px-5 pt-3">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <Button key={t.id} variant="ghost" size="inline" onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  active ? 'bg-accent/50 text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/50'
                }`}>
                <Icon size={11} />
                <span>{t.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Content */}
        <div className="px-5 py-4 min-h-[200px]">
          <AnimatePresence mode="wait">
            {/* File Upload */}
            {tab === 'file' && (
              <motion.div key="file" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    dragOver ? 'border-primary/40 bg-primary/5' : 'border-border/20 hover:border-border/40 hover:bg-accent/15'
                  }`}
                >
                  <Upload size={24} strokeWidth={1.2} className="text-muted-foreground/40 mb-3" />
                  <p className="text-xs text-muted-foreground/50 mb-1">拖放文件到此处，或点击选择文件</p>
                  <p className="text-xs text-muted-foreground/50">支持 .json / .yaml / .yml</p>
                </div>
                <input ref={fileRef} type="file" accept=".json,.yaml,.yml" className="hidden" onChange={handleFileSelect} />
              </motion.div>
            )}

            {/* Clipboard */}
            {tab === 'clipboard' && (
              <motion.div key="clipboard" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <Textarea
                  value={clipboardText}
                  onChange={e => setClipboardText(e.target.value)}
                  placeholder="在此粘贴 JSON 或 YAML 配置内容..."
                  className="input-accent h-[160px] p-3 placeholder:text-muted-foreground/60 resize-none font-mono scrollbar-thin"
                />
                <Button size="inline"
                  variant="default"
                  onClick={handleImportClipboard}
                  disabled={!clipboardText.trim()}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FileJson size={10} />
                  <span>解析并导入</span>
                </Button>
              </motion.div>
            )}

            {/* URL */}
            {tab === 'url' && (
              <motion.div key="url" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <p className="text-xs text-muted-foreground/50 mb-3">从 GitHub Gist、GitHub 仓库或任何公开 URL 导入配置</p>
                <Input
                  value={urlText}
                  onChange={e => setUrlText(e.target.value)}
                  placeholder="https://gist.github.com/..."
                  className="input-accent h-auto placeholder:text-muted-foreground/60 font-mono"
                />
                <div className="mt-3 flex items-center gap-3">
                  <Button size="inline"
                    variant="default"
                    onClick={handleImportUrl}
                    disabled={!urlText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Link size={10} />
                    <span>获取并导入</span>
                  </Button>
                  <p className="text-xs text-muted-foreground/50">支持 raw 文件链接</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Import status */}
          <AnimatePresence>
            {importState === 'success' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-cherry-active-bg border border-cherry-ring">
                <CheckCircle2 size={12} className="text-cherry-primary" />
                <span className="text-xs text-cherry-primary-dark">
                  {fileName ? `成功导入: ${fileName}` : '配置解析成功，资源已导入'}
                </span>
              </motion.div>
            )}
            {importState === 'error' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle size={12} className="text-destructive" />
                <span className="text-xs text-destructive">解析失败，请检查配置格式</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
