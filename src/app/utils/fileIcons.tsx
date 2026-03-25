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
  pdf:  { icon: FileText, color: 'text-red-500' },
  docx: { icon: FileText, color: 'text-blue-500' },
  doc:  { icon: FileText, color: 'text-blue-500' },
  md:   { icon: FileType, color: 'text-gray-500' },
  txt:  { icon: FileText, color: 'text-gray-500' },
  // Spreadsheets
  xlsx: { icon: FileSpreadsheet, color: 'text-emerald-500' },
  xls:  { icon: FileSpreadsheet, color: 'text-emerald-500' },
  csv:  { icon: FileSpreadsheet, color: 'text-emerald-500' },
  // Code
  py:   { icon: FileCode, color: 'text-violet-500' },
  ts:   { icon: FileCode, color: 'text-violet-500' },
  tsx:  { icon: FileCode, color: 'text-violet-500' },
  js:   { icon: FileCode, color: 'text-violet-500' },
  jsx:  { icon: FileCode, color: 'text-violet-500' },
  json: { icon: FileCode, color: 'text-amber-500' },
  yaml: { icon: FileCode, color: 'text-amber-500' },
  yml:  { icon: FileCode, color: 'text-amber-500' },
  css:  { icon: FileCode, color: 'text-blue-400' },
  scss: { icon: FileCode, color: 'text-pink-400' },
  html: { icon: FileCode, color: 'text-orange-500' },
  // Images
  png:  { icon: ImageIcon, color: 'text-pink-500' },
  jpg:  { icon: ImageIcon, color: 'text-pink-500' },
  jpeg: { icon: ImageIcon, color: 'text-pink-500' },
  gif:  { icon: ImageIcon, color: 'text-pink-500' },
  svg:  { icon: ImageIcon, color: 'text-pink-500' },
  ico:  { icon: ImageIcon, color: 'text-pink-500' },
  // Archives
  zip:  { icon: FileArchive, color: 'text-amber-500' },
  tar:  { icon: FileArchive, color: 'text-amber-500' },
  gz:   { icon: FileArchive, color: 'text-amber-500' },
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
 *   getFileIcon('report.pdf')       // => <FileText size={14} className="text-red-500" />
 *   getFileIcon('tsx', 12)           // => <FileCode size={12} className="text-violet-500" />
 *   getFileIcon('data.csv')          // => <FileSpreadsheet size={14} className="text-emerald-500" />
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
