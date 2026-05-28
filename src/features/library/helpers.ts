import type { FolderNode, ResourceItem, ResourceType, TagItem } from '@/app/types';
import { DEFAULT_TAG_COLOR, TAG_COLORS } from '@/app/config/constants';

export function findFolder(nodes: FolderNode[], id: string): FolderNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findFolder(n.children, id);
    if (found) return found;
  }
  return null;
}

export function buildTags(resources: ResourceItem[], filterType?: ResourceType): TagItem[] {
  const tagMap = new Map<string, number>();
  const list = filterType ? resources.filter(r => r.type === filterType) : resources;
  list.forEach(r => r.tags.forEach(t => tagMap.set(t, (tagMap.get(t) || 0) + 1)));
  return Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      id: `tag-${i}`,
      name,
      color: (TAG_COLORS[name] || DEFAULT_TAG_COLOR).dot,
      count,
    }));
}
