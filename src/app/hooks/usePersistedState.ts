import { useCallback, useState } from 'react';

// localStorage 持久化的 useState——工作/对话模块左栏的展示方式、排序、
// 手动顺序等偏好共用。值走 JSON 序列化，仅适用于原始值/数组/普通对象
// （Set/Map 需自行转换）。读写失败（隐私模式等）时静默降级为内存态。
export function usePersistedState<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  });
  const set = useCallback((v: T) => {
    setValue(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* 隐私模式下不持久化 */ }
  }, [key]);
  return [value, set];
}
