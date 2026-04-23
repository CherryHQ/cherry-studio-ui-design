import React from 'react';
import {
  File, FileText, FileCode, FileSpreadsheet, FileArchive, FileType,
  Image as ImageIcon, Settings,
} from 'lucide-react';

// ===========================
// Unified File Icon Resolver
// ===========================

/** Extension-to-icon mapping with color variants */
const EXT_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  // Documents
  pdf:  { icon: FileText, color: 'text-destructive' },
  docx: { icon: FileText, color: 'text-accent-blue' },
  doc:  { icon: FileText, color: 'text-accent-blue' },
  md:   { icon: FileType, color: 'text-muted-foreground' },
  txt:  { icon: FileText, color: 'text-muted-foreground' },
  // Spreadsheets
  xlsx: { icon: FileSpreadsheet, color: 'text-accent-emerald' },
  xls:  { icon: FileSpreadsheet, color: 'text-accent-emerald' },
  csv:  { icon: FileSpreadsheet, color: 'text-accent-emerald' },
  // Code
  py:   { icon: FileCode, color: 'text-accent-violet' },
  ts:   { icon: FileCode, color: 'text-accent-violet' },
  tsx:  { icon: FileCode, color: 'text-accent-violet' },
  js:   { icon: FileCode, color: 'text-accent-violet' },
  jsx:  { icon: FileCode, color: 'text-accent-violet' },
  json: { icon: FileCode, color: 'text-accent-amber' },
  yaml: { icon: FileCode, color: 'text-accent-amber' },
  yml:  { icon: FileCode, color: 'text-accent-amber' },
  css:  { icon: FileCode, color: 'text-accent-blue' },
  scss: { icon: FileCode, color: 'text-accent-pink' },
  html: { icon: FileCode, color: 'text-accent-orange' },
  // Images
  png:  { icon: ImageIcon, color: 'text-accent-pink' },
  jpg:  { icon: ImageIcon, color: 'text-accent-pink' },
  jpeg: { icon: ImageIcon, color: 'text-accent-pink' },
  gif:  { icon: ImageIcon, color: 'text-accent-pink' },
  svg:  { icon: ImageIcon, color: 'text-accent-pink' },
  ico:  { icon: ImageIcon, color: 'text-accent-pink' },
  // Archives
  zip:  { icon: FileArchive, color: 'text-accent-amber' },
  tar:  { icon: FileArchive, color: 'text-accent-amber' },
  gz:   { icon: FileArchive, color: 'text-accent-amber' },
};

/** Special filenames */
const SPECIAL_FILES: Record<string, { icon: React.ElementType; color: string }> = {
  '.gitignore': { icon: Settings, color: 'text-muted-foreground' },
  '.env':       { icon: Settings, color: 'text-muted-foreground' },
};

const DEFAULT_ENTRY = { icon: File, color: 'text-muted-foreground' };

/**
 * Extract extension from a filename or extension string.
 * Handles both "file.tsx" and bare "tsx" / "pdf" inputs.
 */
function resolveExtension(nameOrExt: string): string {
  const dotIdx = nameOrExt.lastIndexOf('.');
  if (dotIdx >= 0) return nameOrExt.slice(dotIdx + 1).toLowerCase();
  return nameOrExt.toLowerCase();
}

/**
 * Resolve the file icon entry for a given filename or extension.
 * Returns { icon: LucideIcon, color: tailwindColorClass }.
 */
function resolveEntry(nameOrExt: string) {
  // Check special filenames first
  const lower = nameOrExt.toLowerCase();
  if (SPECIAL_FILES[lower]) return SPECIAL_FILES[lower];

  const ext = resolveExtension(nameOrExt);
  return EXT_MAP[ext] || DEFAULT_ENTRY;
}

/**
 * Get a colored file icon element for the given filename or extension.
 *
 * @param nameOrExt - filename ("App.tsx") or bare extension ("pdf")
 * @param size - icon pixel size (default 14)
 *
 * Usage:
 *   getFileIcon('report.pdf')       // => <FileText size={14} className="text-destructive" />
 *   getFileIcon('tsx', 12)           // => <FileCode size={12} className="text-accent-violet" />
 *   getFileIcon('data.csv')          // => <FileSpreadsheet size={14} className="text-accent-emerald" />
 */
export function getFileIcon(nameOrExt: string, size = 14): React.ReactElement {
  const { icon: Icon, color } = resolveEntry(nameOrExt);
  return <Icon size={size} className={color} />;
}

/**
 * Get the icon component type (not rendered) for cases where
 * React.createElement is needed (e.g. knowledge DataSourceList).
 */
export function getFileIconComponent(nameOrExt: string): React.ElementType {
  return resolveEntry(nameOrExt).icon;
}

/**
 * Monochrome variant — uses `text-muted-foreground` for all icons.
 * Used in file explorer trees where color coding is not desired.
 */
export function getFileIconMono(nameOrExt: string, size = 13): React.ReactElement {
  const { icon: Icon } = resolveEntry(nameOrExt);
  return <Icon size={size} className="text-muted-foreground flex-shrink-0" />;
}
