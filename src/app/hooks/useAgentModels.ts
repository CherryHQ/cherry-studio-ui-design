import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { AGENT_MODELS, CHERRY_AI_FREE_MODEL } from '@/app/config/models';
import type { ModelInfo } from '@/app/types/shared';
import { useAuth } from '@/app/context/AuthContext';

// ===========================
// 工作模块（Agent）的模型列表
// ===========================
// 在基础模型列表后面追加 CherryAI 免费模型 —— 只对内测白名单账号出现。
// 追加在末尾，所以模型选择器里 CherryAI 是最后一个分组。

export interface AgentModelsResult {
  models: ModelInfo[];
  /** 选中模型时的额外提示（额度用完时提示，其余情况什么都不做） */
  noticeOnSelect: (modelId: string) => void;
}

export function useAgentModels(baseModels: ModelInfo[] = AGENT_MODELS): AgentModelsResult {
  const { showFreeModels, quotaExhausted } = useAuth();

  const models = useMemo(() => {
    if (!showFreeModels) return baseModels;
    const free: ModelInfo = quotaExhausted
      ? { ...CHERRY_AI_FREE_MODEL, mutedCapabilities: ['free'] }
      : CHERRY_AI_FREE_MODEL;
    return [...baseModels, free];
  }, [baseModels, showFreeModels, quotaExhausted]);

  const noticeOnSelect = useCallback((modelId: string) => {
    if (!showFreeModels || !quotaExhausted) return;
    if (modelId !== CHERRY_AI_FREE_MODEL.id) return;
    toast.info('本月免费额度已用完，可继续使用其他模型');
  }, [showFreeModels, quotaExhausted]);

  return { models, noticeOnSelect };
}
