import type { LucideIcon } from 'lucide-react';
import {
  FileText, FileCode2, FileSpreadsheet,
  Newspaper, ScrollText, ClipboardList,
  BookOpen, NotebookPen,
  BarChart3, LineChart, PieChart, LayoutDashboard,
  Globe, Sparkles, FlaskConical, Trophy, Receipt, Layers,
} from 'lucide-react';

// Curated palette for the "添加至工作台" dialog icon picker. Kept tight
// (single dialog row, no scrolling) so the user can pick at a glance
// rather than searching across all of lucide-react.
export const ARTIFACT_ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  FileCode2,
  FileSpreadsheet,
  Newspaper,
  ScrollText,
  ClipboardList,
  BookOpen,
  NotebookPen,
  BarChart3,
  LineChart,
  PieChart,
  LayoutDashboard,
  Globe,
  Sparkles,
  FlaskConical,
  Trophy,
  Receipt,
  Layers,
};

export const ARTIFACT_ICON_NAMES: string[] = Object.keys(ARTIFACT_ICON_MAP);

export const DEFAULT_ARTIFACT_ICON_NAME = 'FileText';

/** Resolve a lucide icon by name, falling back to the default. */
export function resolveArtifactIcon(name: string | undefined | null): LucideIcon {
  if (name && ARTIFACT_ICON_MAP[name]) return ARTIFACT_ICON_MAP[name];
  return ARTIFACT_ICON_MAP[DEFAULT_ARTIFACT_ICON_NAME];
}
