// ===========================
// File Management — Mock Data
// ===========================
// Canonical location for file module mock data.

export type { FileTag, FileFolder, FileItem } from '@/app/types/file';
export {
  FILE_TAGS,
  FILE_FOLDERS,
  MOCK_FILES,
  getFormatLabel,
  flattenFolders,
} from '@/app/mock/fileData';
