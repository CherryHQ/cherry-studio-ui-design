import React, { useState, useRef, useCallback } from 'react';
import { X, Package, FileJson, FileText, Archive, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@cherry-studio/ui';
import type { ResourceType, ResourceItem } from '@/app/types';

interface Props {
  open: boolean;
  importType: 'skill' | 'plugin';
  onClose: () => void;
  onImportComplete: (resource: ResourceItem) => void;
}

interface ParsedFile {
  name: string;
  size: string;
  type: 'md' | 'json' | 'zip';
  rawName: string;
}

const ACCEPT_SKILL = '.md,.json';
const ACCEPT_PLUGIN = '.zip,.json';

const typeLabels: Record<'skill' | 'plugin', { title: string; desc: string; formats: string }> = {
  skill: {
    title: '导入技能',
    desc: '拖拽技能文件到此处，或点击选择文件',
    formats: '支持 Markdown（.md）和 JSON（.json）格式',
  },
  plugin: {
    title: '导入插件',
    desc: '拖拽插件 ZIP 到此处，或点击选择文件',
    formats: '支持插件包格式（.claude-plugin/plugin.json）',
  },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function inferFileType(name: string): 'md' | 'json' | 'zip' {
  if (name.endsWith('.md')) return 'md';
  if (name.endsWith('.json')) return 'json';
  return 'zip';
}

// Regex helpers (avoid regex literals for write_tool compliance)
const reExtStrip = new RegExp(String.fromCharCode(92) + '.[^.]+$');
const reDashUnderscore = new RegExp('[-_]', 'g');
const reWordBoundary = new RegExp(String.fromCharCode(92) + 'b' + String.fromCharCode(92) + 'w', 'g');

export function SkillPluginImportModal({ open, importType, onClose, onImportComplete }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cfg = typeLabels[importType];
  const accept = importType === 'skill' ? ACCEPT_SKILL : ACCEPT_PLUGIN;

  const resetState = useCallback(() => {
    setParsedFile(null);
    setImporting(false);
    setError(null);
    setDragOver(false);
  }, []);

  const handleClose = () => { resetState(); onClose(); };

  const processFile = useCallback((file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    // Validate
    if (importType === 'skill' && !['md', 'json'].includes(ext)) {
      setError('技能仅支持 .md 或 .json 格式文件');
      return;
    }
    if (importType === 'plugin' && !['zip', 'json'].includes(ext)) {
      setError('插件仅支持 .zip 或 .json 格式文件');
      return;
    }
    setParsedFile({
      name: file.name.replace(reExtStrip, ''),
      size: formatBytes(file.size),
      type: inferFileType(file.name),
      rawName: file.name,
    });
  }, [importType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [processFile]);

  const handleImport = useCallback(() => {
    if (!parsedFile) return;
    setImporting(true);
    // Simulate async import
    setTimeout(() => {
      const now = new Date().toISOString();
      const resource: ResourceItem = {
        id: `res-imp-${Date.now()}`,
        name: parsedFile.name.replace(reDashUnderscore, ' ').replace(reWordBoundary, c => c.toUpperCase()),
        type: importType,
        description: importType === 'skill' ? '从文件导入的技能' : '从插件包导入的插件',
        avatar: importType === 'skill' ? '📄' : '🧩',
        version: '1.0.0',
        tags: [],
        createdAt: now,
        updatedAt: now,
        enabled: true,
        fileName: parsedFile.rawName,
        fileSize: parsedFile.size,
        fileType: parsedFile.type,
      };
      onImportComplete(resource);
      resetState();
    }, 800);
  }, [parsedFile, importType, onImportComplete, resetState]);

  const FileIcon = parsedFile?.type === 'zip' ? Archive : parsedFile?.type === 'json' ? FileJson : FileText;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="w-[440px] p-0">
          {/* Header */}
          <DialogHeader className="px-5 py-4 border-b border-border/10">
            <DialogTitle className="text-sm">{cfg.title}</DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="p-5">
            {!parsedFile ? (
              /* Drop Zone */
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center py-12 px-6
                  border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${dragOver
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border/20 hover:border-border/40 hover:bg-accent/10'
                  }
                `}
              >
                <Package size={28} strokeWidth={1.2} className={`mb-4 transition-colors ${dragOver ? 'text-primary/50' : 'text-muted-foreground/15'}`} />
                <p className="text-xs text-muted-foreground/50 mb-1.5">{cfg.desc}</p>
                <p className="text-[9px] text-muted-foreground/25">{cfg.formats}</p>
                <input ref={inputRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />
              </div>
            ) : (
              /* File Preview */
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border/20 bg-accent/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center flex-shrink-0">
                    <FileIcon size={18} strokeWidth={1.3} className="text-muted-foreground/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{parsedFile.rawName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground/30">{parsedFile.size}</span>
                      <span className="text-[9px] px-1.5 py-px rounded-full bg-accent/40 text-muted-foreground/35 uppercase">{parsedFile.type}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-xs" onClick={resetState} className="text-muted-foreground/20 hover:text-foreground hover:bg-accent/40 flex-shrink-0">
                    <X size={10} />
                  </Button>
                </div>

                {/* Parsed meta preview */}
                <div className="px-4 py-3 rounded-xl border border-border/15 bg-accent/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground/30 w-12 flex-shrink-0">名称</span>
                    <span className="text-xs text-foreground">{parsedFile.name.replace(reDashUnderscore, ' ').replace(reWordBoundary, c => c.toUpperCase())}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground/30 w-12 flex-shrink-0">类型</span>
                    <span className="text-xs text-foreground">{importType === 'skill' ? '技能' : '插件'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground/30 w-12 flex-shrink-0">格式</span>
                    <span className="text-xs text-foreground font-mono">.{parsedFile.type}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/15">
                  <AlertCircle size={11} className="text-destructive/60 flex-shrink-0" />
                  <span className="text-xs text-destructive/70">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <DialogFooter className="px-5 py-4 border-t border-border/10">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              取消
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleImport}
              disabled={!parsedFile || importing}
            >
              {importing ? (
                <div className="contents">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-3 h-3 border-1.5 border-background/30 border-t-background rounded-full" />
                  <span>导入中...</span>
                </div>
              ) : (
                <div className="contents">
                  <Upload size={10} />
                  <span>确认导入</span>
                </div>
              )}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
