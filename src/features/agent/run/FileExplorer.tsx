import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  FileJson, FileCode, FileText, Image as ImageIcon, Settings,
  FileSpreadsheet, Presentation, FileType, Download, CheckCircle2, Loader2,
} from 'lucide-react';
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
    case 'docx': case 'doc': return <FileType size={size} className={`text-blue-500 ${cls}`} />;
    case 'pptx': case 'ppt': return <Presentation size={size} className={`text-orange-500 ${cls}`} />;
    case 'xlsx': case 'xls': case 'csv': return <FileSpreadsheet size={size} className={`text-cyan-500 ${cls}`} />;
    case 'pdf': return <FileText size={size} className={`text-red-500 ${cls}`} />;
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
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-[5px] w-full py-[3px] rounded text-[10.5px] transition-all duration-75
            ${isSelected ? 'bg-accent/35 text-foreground' : 'text-foreground/75 hover:bg-accent/20 hover:text-foreground'}`}
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
        </button>
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
    <button
      onClick={() => onSelectFile(fullPath)}
      className={`flex items-center gap-[5px] w-full py-[3px] rounded text-[10.5px] transition-all duration-75
        ${isSelected
          ? 'bg-cherry-active-bg text-cherry-text'
          : 'text-foreground/75 hover:bg-accent/20 hover:text-foreground'}`}
      style={{ paddingLeft: indent + 16, paddingRight: 8 }}
    >
      {getFileIcon(node.name)}
      <span className="truncate flex-1 text-left">{node.name}</span>
    </button>
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
          : 'hover:bg-accent/20'
      }`}
    >
      {getOutputIcon(file.format)}
      <div className="flex-1 min-w-0 text-left">
        <div className={`text-[10.5px] truncate ${isSelected ? 'text-cherry-text' : 'text-foreground/75'}`}>
          {file.name}
        </div>
        <div className="flex items-center gap-2 mt-[1px]">
          <span className="text-[9px] text-muted-foreground/50 uppercase">{file.format}</span>
          <span className="text-[9px] text-muted-foreground/40">{file.size}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isGenerating ? (
          <span className="flex items-center gap-1 text-[9px] text-amber-500">
            <Loader2 size={10} className="animate-spin" />
            <span>{"生成中"}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <CheckCircle2 size={10} className="text-cherry-primary" />
            <span className="text-[9px] text-muted-foreground/50">{file.timestamp}</span>
          </span>
        )}
        {!isGenerating && (
          <button
            onClick={e => { e.stopPropagation(); }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-foreground transition-all"
          >
            <Download size={10} />
          </button>
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
      <div className="px-2.5 pt-2 pb-1 flex-shrink-0">
        <div className="inline-flex items-center bg-accent/20 rounded-lg p-[3px]">
          <button
            onClick={() => setTab('output')}
            className={`px-2.5 py-[4px] text-[10px] rounded-md transition-all duration-150 flex items-center gap-1.5 ${
              tab === 'output'
                ? 'bg-background text-foreground shadow-sm shadow-black/5'
                : 'text-muted-foreground/60 hover:text-muted-foreground'
            }`}
          >
            {"结果"}
            {outputFiles.length > 0 && (
              <span className={`text-[8.5px] min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center ${
                tab === 'output' ? 'bg-cherry-active-bg text-cherry-primary-dark' : 'bg-accent/40 text-muted-foreground/60'
              }`}>{outputFiles.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-2.5 py-[4px] text-[10px] rounded-md transition-all duration-150 ${
              tab === 'all'
                ? 'bg-background text-foreground shadow-sm shadow-black/5'
                : 'text-muted-foreground/60 hover:text-muted-foreground'
            }`}
          >
            {"全部文件"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/25 [&::-webkit-scrollbar-thumb]:rounded-full">
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
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <File size={16} className="text-muted-foreground/25 mb-2" />
                <span className="text-[10px] text-muted-foreground/40">{"暂无结果文件"}</span>
              </div>
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
