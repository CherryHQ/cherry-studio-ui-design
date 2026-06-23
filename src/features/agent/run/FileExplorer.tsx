import React, { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  FileJson, FileCode, FileText, Image as ImageIcon, Settings,
  FileSpreadsheet, Presentation, FileType, Download, CheckCircle2, Loader2,
  Eye, Globe, MousePointer2, TerminalSquare, ExternalLink, FolderOpen as FolderOpenIcon,
} from 'lucide-react';
import {
  Button, EmptyState, SearchInput,
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
} from '@cherry-studio/ui';
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
// "Open with" context menu — used by both tree files and output files
// ===========================

function FileOpenWithMenu({ name }: { name: string }) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const previewable = ['pdf', 'md', 'html', 'docx', 'png', 'jpg', 'jpeg', 'svg', 'pptx'].includes(ext);
  const browserable = ['html', 'pdf', 'png', 'jpg', 'jpeg', 'svg', 'md'].includes(ext);
  const editable = ['ts', 'tsx', 'js', 'jsx', 'md', 'json', 'css', 'html', 'csv', 'py', 'go', 'rs', 'java', 'sh', 'yml', 'yaml', 'toml', 'txt'].includes(ext);

  return (
    <ContextMenuContent className="w-[160px]">
      {previewable && (
        <ContextMenuItem className="gap-2 px-2 py-[5px] text-xs">
          <Eye size={12} className="text-muted-foreground/80 flex-shrink-0" />
          <span className="flex-1">预览</span>
        </ContextMenuItem>
      )}
      {browserable && (
        <ContextMenuItem className="gap-2 px-2 py-[5px] text-xs">
          <Globe size={12} className="text-accent-violet flex-shrink-0" />
          <span className="flex-1">浏览器</span>
        </ContextMenuItem>
      )}
      {editable && (
        <ContextMenuItem className="gap-2 px-2 py-[5px] text-xs">
          <MousePointer2 size={12} className="text-foreground flex-shrink-0" />
          <span className="flex-1">Cursor</span>
        </ContextMenuItem>
      )}
      <ContextMenuSeparator />
      <ContextMenuItem className="gap-2 px-2 py-[5px] text-xs">
        <FolderOpenIcon size={12} className="text-blue-500 flex-shrink-0" />
        <span className="flex-1">Finder</span>
      </ContextMenuItem>
      <ContextMenuItem className="gap-2 px-2 py-[5px] text-xs">
        <TerminalSquare size={12} className="text-muted-foreground/80 flex-shrink-0" />
        <span className="flex-1">Terminal</span>
      </ContextMenuItem>
      <ContextMenuItem className="gap-2 px-2 py-[5px] text-xs">
        <ExternalLink size={12} className="text-muted-foreground/80 flex-shrink-0" />
        <span className="flex-1">复制路径</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

// ===========================
// Tree Node
// ===========================

function TreeNode({ node, depth, path, selectedFile, onSelectFile, defaultOpen, forceOpen }: {
  node: FileNode;
  depth: number;
  path: string;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(forceOpen || (defaultOpen ?? depth < 1));
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
    <ContextMenu>
      <ContextMenuTrigger asChild>
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
      </ContextMenuTrigger>
      <FileOpenWithMenu name={node.name} />
    </ContextMenu>
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
  const row = (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-75 group cursor-pointer ${
        isSelected
          ? 'bg-cherry-active-bg'
          : 'hover:bg-accent/50'
      }`}
    >
      {getOutputIcon(file.format, 12)}
      <span className={`text-xs truncate flex-1 text-left ${isSelected ? 'text-cherry-text' : 'text-foreground'}`}>
        {file.name}
      </span>
      {isGenerating && (
        <Loader2 size={10} className="text-warning animate-spin flex-shrink-0" />
      )}
    </div>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
      <FileOpenWithMenu name={file.name} />
    </ContextMenu>
  );
}

// ===========================
// File Explorer
// ===========================

export function FileExplorer({ files, outputFiles = [], selectedFile, onSelectFile }: Props) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  // Prune the tree to matching nodes, keeping ancestor folders so the path
  // to a hit stays visible.
  const filteredFiles = useMemo(() => {
    if (!q) return files;
    const walk = (list: FileNode[]): FileNode[] =>
      list.reduce<FileNode[]>((acc, n) => {
        if (n.type === 'folder') {
          const kids = n.children ? walk(n.children) : [];
          if (kids.length > 0 || n.name.toLowerCase().includes(q)) {
            acc.push({ ...n, children: kids.length > 0 ? kids : n.children });
          }
        } else if (n.name.toLowerCase().includes(q)) {
          acc.push(n);
        }
        return acc;
      }, []);
    return walk(files);
  }, [files, q]);

  const filteredOutputs = useMemo(
    () => (!q ? outputFiles : outputFiles.filter(f => f.name.toLowerCase().includes(q))),
    [outputFiles, q],
  );

  const hasResults = filteredFiles.length > 0 || filteredOutputs.length > 0;

  return (
    <div className="flex flex-col h-full select-none">
      {/* Search */}
      <div className="px-2.5 pt-2.5 pb-1.5 flex-shrink-0">
        <SearchInput value={query} onChange={setQuery} placeholder="搜索文件..." />
      </div>

      {/* Content — 结果 (deliverables) section + the workspace file tree.
          Keyed on search-vs-browse so folders re-open when filtering. */}
      <div key={q ? 'search' : 'browse'} className="flex-1 overflow-y-auto scrollbar-thin-xs">
        {!hasResults ? (
          <EmptyState preset={q ? 'no-result' : 'no-file'} compact />
        ) : (
          <>
            {filteredOutputs.length > 0 && (
              <div className="py-1.5 px-1.5">
                <div className="px-1.5 pb-1 text-[11px] text-muted-foreground/50">结果</div>
                <div className="space-y-[2px]">
                  {filteredOutputs.map(f => (
                    <OutputFileItem
                      key={f.id}
                      file={f}
                      isSelected={selectedFile === `output:${f.id}`}
                      onSelect={() => onSelectFile(`output:${f.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
            {filteredFiles.length > 0 && (
              <div className="py-1 px-1">
                {filteredOutputs.length > 0 && (
                  <div className="px-1.5 pt-1 pb-1 text-[11px] text-muted-foreground/50">文件</div>
                )}
                {filteredFiles.map((node, i) => (
                  <TreeNode key={`${node.name}-${i}`} node={node} depth={0} path=""
                    selectedFile={selectedFile} onSelectFile={onSelectFile}
                    defaultOpen forceOpen={!!q} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
