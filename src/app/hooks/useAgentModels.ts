import { useCallback, useMemo } from 'react';
import { AGENT_MODELS, CHERRY_AI_FREE_MODEL } from '@/app/config/models';
import type { ModelInfo } from '@/app/types/shared';
import { useAuth } from '@/app/context/AuthContext';
import { useQuotaNotice } from '@/app/components/shared/QuotaNotice';

// ===========================
// 工作模块（Agent）的模型列表
// ===========================
// CherryAI 免费模型只对内测白名单账号出现，放在列表**最前面**，所以模型选择器
// 里 CherryAI 是第一个分组 —— 免费是这批内测账号最该先看到的东西。

export interface AgentModelsResult {
  models: ModelInfo[];
  /** 选中模型时的额外提示（额度用完时提示，其余情况什么都不做） */
  noticeOnSelect: (modelId: string) => void;
  /** 该模型现在是否因为额度用完而发不出消息 */
  isQuotaBlocked: (modelId: string) => boolean;
}

export function useAgentModels(baseModels: ModelInfo[] = AGENT_MODELS): AgentModelsResult {
  const { showFreeModels } = useAuth();
  const { quotaExhausted, message, notify } = useQuotaNotice();

  const models = useMemo(() => {
    if (!showFreeModels) return baseModels;
    // 额度用完：礼物标识转灰、整行（图标 + 名称）置灰，模型卡的说明行从"限时免费"
    // 换成带倒计时的用完状态 —— 模型本身不从列表消失，仍可选中（选中时给提示）。
    const free: ModelInfo = quotaExhausted
      ? {
          ...CHERRY_AI_FREE_MODEL,
          mutedCapabilities: ['free'],
          muted: true,
          note: message,
        }
      : CHERRY_AI_FREE_MODEL;
    return [free, ...baseModels];
  }, [baseModels, showFreeModels, quotaExhausted, message]);

  const isQuotaBlocked = useCallback(
    (modelId: string) => showFreeModels && quotaExhausted && modelId === CHERRY_AI_FREE_MODEL.id,
    [showFreeModels, quotaExhausted],
  );

  const noticeOnSelect = useCallback((modelId: string) => {
    if (!isQuotaBlocked(modelId)) return;
    notify();
  }, [isQuotaBlocked, notify]);

  return { models, noticeOnSelect, isQuotaBlocked };
}
