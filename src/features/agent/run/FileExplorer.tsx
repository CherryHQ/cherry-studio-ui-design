import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  FileJson, FileCode, FileText, Image as ImageIcon, Settings,
  FileSpreadsheet, Presentation, FileType, Download, CheckCircle2, Loader2,
} from 'lucide-react';
import { Button, EmptyState } from '@cherry-studio/ui';
import { motion, AnimatePresence } from 'motion/react';
import type { FileNode, OutputFile } from '@/app/types/agent';

// Re-export for backward compatibility
export type { FileNode, OutputFile };

// ===========================
// Types
// ===========================

interface Props {
  files: FileNode[];
  outputFiles?: OutputFile[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

// ===========================
// Icon Resolver (Monochrome)
// ===========================

function getFileIcon(name: string, size = 13) {
  if (name.endsWith('.json')) return <FileJson size={size} className="text-muted-foreground flex-shrink-0" />;
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={size} className="text-muted-foreground flex-shrink-0" />;
  if (name.endsWith('.jsx') || name.endsWith('.js')) return <FileCode size={size} className="text-muted-foreground flex-shrink-0" />;
  if (name.endsWith('.css') || name.endsWith('.scss')) return <FileCode size={size} className="text-muted-foreground flex-shrink-0" />;
  if (name.endsWith('.html')) return <FileCode size={size} className="text-muted-foreground flex-shrink-0" />;
  if (name.endsWith('.md')) return <FileText size={size} className="text-muted-foreground flex-shrink-0" />;
  if (name.endsWith('.svg') || name.endsWith('.png') || name.endsWith('.ico')) return <ImageIcon size={size} className="text-muted-foreground flex-shrink-0" />;
  if (name === '.gitignore' || name === '.env') return <Settings size={size} className="text-muted-foreground flex-shrink-0" />;
  return <File size={size} className="text-muted-foreground flex-shrink-0" />;
}

function getOutputIcon(format: string, size = 14) {
  const cls = "flex-shrink-0";
  switch (format) {
    case 'docx': case 'doc': return <FileType size={size} className={`text-info ${cls}`} />;
    case 'pptx': case 'ppt': return <Presentation size={size} className={`text-accent-orange ${cls}`} />;
    case 'xlsx': case 'xls': case 'csv': return <FileSpreadsheet size={size} className={`text-accent-cyan ${cls}`} />;
    case 'pdf': return <FileText size={size} className={`text-destructive ${cls}`} />;
    case 'md': return <FileText size={size} className={`text-muted-foreground ${cls}`} />;
    default: return <File size={size} className={`text-muted-foreground ${cls}`} />;
  }
}

// ===========================
// Tree Node
// ===========================

function TreeNode({ node, depth, path, selectedFile, onSelectFile, defaultOpen }: {
  node: FileNode;
  depth: number;
  path: string;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? depth < 1);
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isSelected = selectedFile === fullPath;
  const indent = 10 + depth * 14;

  if (node.type === 'folder') {
    return (
      <div>
        <Button size="inline"
          variant="ghost"
          onClick={() => setOpen(!open)}
          className={`w-full justify-start gap-[5px] py-[3px] font-normal rounded text-xs ${
            isSelected ? 'bg-accent/25 text-foreground' : 'text-foreground hover:bg-accent/50 hover:text-foreground'
          }`}
          style={{ paddingLeft: indent, paddingRight: 8 }}
        >
          <span className="flex-shrink-0 w-3 flex items-center justify-center">
            {open
              ? <ChevronDown size={9} className="text-muted-foreground" />
              : <ChevronRight size={9} className="text-muted-foreground" />}
          </span>
          {open
            ? <FolderOpen size={13} className="text-muted-foreground flex-shrink-0" />
            : <Folder size={13} className="text-muted-foreground flex-shrink-0" />}
          <span className="truncate flex-1 text-left">{node.name}</span>
        </Button>
        <AnimatePresence initial={false}>
          {open && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="overflow-hidden"
            >
              {node.children.map((child, i) => (
                <TreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} path={fullPath}
                  selectedFile={selectedFile} onSelectFile={onSelectFile} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Button size="inline"
      variant="ghost"
      onClick={() => onSelectFile(fullPath)}
      className={`w-full justify-start gap-[5px] py-[3px] font-normal rounded text-xs ${
        isSelected
          ? 'bg-cherry-active-bg text-cherry-text'
          : 'text-foreground hover:bg-accent/50 hover:text-foreground'
      }`}
      style={{ paddingLeft: indent + 16, paddingRight: 8 }}
    >
      {getFileIcon(node.name)}
      <span className="truncate flex-1 text-left">{node.name}</span>
    </Button>
  );
}

// ===========================
// Output File Item
// ===========================

function OutputFileItem({ file, isSelected, onSelect }: {
  file: OutputFile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isGenerating = file.status === 'generating';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-75 group cursor-pointer ${
        isSelected
          ? 'bg-cherry-active-bg'
          : 'hover:bg-accent/50'
      }`}
    >
      {getOutputIcon(file.format)}
      <div className="flex-1 min-w-0 text-left">
        <div className={`text-xs truncate ${isSelected ? 'text-cherry-text' : 'text-foreground'}`}>
          {file.name}
        </div>
        <div className="flex items-center gap-2 mt-[1px]">
          <span className="text-xs text-muted-foreground/50 uppercase">{file.format}</span>
          <span className="text-xs text-muted-foreground/40">{file.size}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isGenerating ? (
          <span className="flex items-center gap-1 text-xs text-warning">
            <Loader2 size={10} className="animate-spin" />
            <span>{"生成中"}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <CheckCircle2 size={10} className="text-cherry-primary" />
            <span className="text-xs text-muted-foreground/50">{file.timestamp}</span>
          </span>
        )}
        {!isGenerating && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={e => { e.stopPropagation(); }}
            className="p-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-foreground"
          >
            <Download size={10} />
          </Button>
        )}
      </div>
    </div>
  );
}

// ===========================
// File Explorer
// ===========================

export function FileExplorer({ files, outputFiles = [], selectedFile, onSelectFile }: Props) {
  const [tab, setTab] = useState<'all' | 'output'>('output');

  return (
    <div className="flex flex-col h-full select-none">
      {/* Tab bar */}
      <div className="px-3 pt-2.5 pb-1 flex-shrink-0 flex items-center gap-3 border-b border-border/15">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setTab('output')}
          className={`pb-1.5 rounded-none border-b-[1.5px] font-normal ${
            tab === 'output'
              ? 'text-foreground border-border'
              : 'text-muted-foreground/50 border-transparent hover:text-foreground hover:bg-transparent'
          }`}
        >
          {"结果"}
          {outputFiles.length > 0 && (
            <span className="text-xs text-muted-foreground/50 ml-1">{outputFiles.length}</span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setTab('all')}
          className={`pb-1.5 rounded-none border-b-[1.5px] font-normal ${
            tab === 'all'
              ? 'text-foreground border-border'
              : 'text-muted-foreground/50 border-transparent hover:text-foreground hover:bg-transparent'
          }`}
        >
          {"全部文件"}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin-xs">
        {tab === 'all' ? (
          <div className="py-1 px-1">
            {files.map((node, i) => (
              <TreeNode key={`${node.name}-${i}`} node={node} depth={0} path=""
                selectedFile={selectedFile} onSelectFile={onSelectFile} defaultOpen />
            ))}
          </div>
        ) : (
          <div className="py-1.5 px-1.5 space-y-[2px]">
            {outputFiles.length === 0 ? (
              <EmptyState preset="no-file" compact />
            ) : (
              outputFiles.map(f => (
                <OutputFileItem
                  key={f.id}
                  file={f}
                  isSelected={selectedFile === `output:${f.id}`}
                  onSelect={() => onSelectFile(`output:${f.id}`)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
