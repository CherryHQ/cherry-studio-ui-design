// 按存储的手动顺序（拖拽产生的 id 列表）重排；未登记的条目保持原相对
// 位置排在其后。工作/对话模块左栏的手动排序共用。
export function applyOrder<T extends { id: string }>(list: T[], order: string[]): T[] {
  if (order.length === 0) return list;
  const pos = new Map(order.map((id, i) => [id, i]));
  return list
    .map((it, i) => [it, pos.has(it.id) ? (pos.get(it.id) as number) : order.length + i] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([it]) => it);
}
