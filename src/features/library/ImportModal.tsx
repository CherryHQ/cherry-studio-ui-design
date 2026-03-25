import React, { useState, useRef } from 'react';
import {
  X, Upload, Clipboard, Link, FileJson,
  CheckCircle2, AlertCircle, File,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-popover rounded-2xl border border-border/30 w-[460px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/15">
              <div>
                <h3 className="text-[13px] text-foreground">导入资源</h3>
                <p className="text-[9px] text-muted-foreground/45 mt-0.5">支持 JSON / YAML 格式的配置文件</p>
              </div>
              <button onClick={reset} className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent/40 transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0.5 px-5 pt-3">
              {tabs.map(t => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all ${
                      active ? 'bg-accent/60 text-foreground' : 'text-muted-foreground/50 hover:text-foreground hover:bg-accent/30'
                    }`}>
                    <Icon size={11} />
                    <span>{t.label}</span>
                  </button>
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
                        dragOver ? 'border-primary/40 bg-primary/5' : 'border-border/20 hover:border-border/40 hover:bg-accent/10'
                      }`}
                    >
                      <Upload size={24} strokeWidth={1.2} className="text-muted-foreground/30 mb-3" />
                      <p className="text-[11px] text-muted-foreground/50 mb-1">拖放文件到此处，或点击选择文件</p>
                      <p className="text-[9px] text-muted-foreground/35">支持 .json / .yaml / .yml</p>
                    </div>
                    <input ref={fileRef} type="file" accept=".json,.yaml,.yml" className="hidden" onChange={handleFileSelect} />
                  </motion.div>
                )}

                {/* Clipboard */}
                {tab === 'clipboard' && (
                  <motion.div key="clipboard" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <textarea
                      value={clipboardText}
                      onChange={e => setClipboardText(e.target.value)}
                      placeholder="在此粘贴 JSON 或 YAML 配置内容..."
                      className="w-full h-[160px] p-3 rounded-xl border border-border/20 bg-accent/10 text-[11px] text-foreground placeholder:text-muted-foreground/35 resize-none outline-none focus:border-border/40 focus:bg-accent/15 transition-all font-mono [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full"
                    />
                    <button
                      onClick={handleImportClipboard}
                      disabled={!clipboardText.trim()}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <FileJson size={10} />
                      <span>解析并导入</span>
                    </button>
                  </motion.div>
                )}

                {/* URL */}
                {tab === 'url' && (
                  <motion.div key="url" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <p className="text-[10px] text-muted-foreground/50 mb-3">从 GitHub Gist、GitHub 仓库或任何公开 URL 导入配置</p>
                    <input
                      value={urlText}
                      onChange={e => setUrlText(e.target.value)}
                      placeholder="https://gist.github.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-border/20 bg-accent/10 text-[11px] text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-border/40 focus:bg-accent/15 transition-all font-mono"
                    />
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={handleImportUrl}
                        disabled={!urlText.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Link size={10} />
                        <span>获取并导入</span>
                      </button>
                      <p className="text-[9px] text-muted-foreground/35">支持 raw 文件链接</p>
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
                    <span className="text-[10px] text-cherry-primary-dark">
                      {fileName ? `成功导入: ${fileName}` : '配置解析成功，资源已导入'}
                    </span>
                  </motion.div>
                )}
                {importState === 'error' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={12} className="text-red-500" />
                    <span className="text-[10px] text-red-600">解析失败，请检查配置格式</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
