import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  AGENT_MODELS, CHERRY_AI_FREE_MODEL, CHERRY_GO_CTA_MODEL, CHERRY_GO_MODELS,
} from '@/app/config/models';
import { GO_LIMIT_DETAILS, GO_LIMIT_MESSAGES } from '@/app/config/goPlan';
import type { ModelInfo } from '@/app/types/shared';
import { useAuth } from '@/app/context/AuthContext';
import { useQuotaNotice } from '@/app/components/shared/QuotaNotice';

// ===========================
// 工作模块（Agent）的模型列表
// ===========================
// CherryAI（免费内测）与 CherryAI Go（订阅）是两个分组，参考 opencode：
// - Go 已订阅：Go 组置顶（付费买到的东西最该先看到），Free 组其后；
// - Go 未订阅：Free 组在前，Go 组只有一行「旗舰开源模型 · 订阅」弱引导
//   （CHERRY_GO_CTA_MODEL，点击跳网页端订阅，不进入选中态）；
// - Free 组仍然只对内测白名单账号出现（黑盒逻辑不变）。
// 额度打满（free 月度 / Go 5h / Go 月度）时模型不消失：整行置灰，选中时提示。

export interface AgentModelsResult {
  models: ModelInfo[];
  /** 选中模型时的额外提示（额度用完时提示，其余情况什么都不做） */
  noticeOnSelect: (modelId: string) => void;
  /** 该模型现在是否因为额度用完而发不出消息 */
  isQuotaBlocked: (modelId: string) => boolean;
  /** 被额度挡住时，对话里错误块用的文案（free 和 Go 各说各的话） */
  quotaErrorFor: (modelId: string) => { classification: string; message: string } | null;
}

const GO_MODEL_IDS = new Set(CHERRY_GO_MODELS.map(m => m.id));

export function useAgentModels(baseModels: ModelInfo[] = AGENT_MODELS): AgentModelsResult {
  const { showFreeModels, goSubscribed, goState, resetGoQuota } = useAuth();
  const { quotaExhausted, message, notify, title, detail } = useQuotaNotice();

  const goLimited = goState === 'limit-5h' || goState === 'limit-month';
  const goLimitMessage = goLimited ? GO_LIMIT_MESSAGES[goState] : null;
  const goLimitDetail = goLimited ? GO_LIMIT_DETAILS[goState] : null;

  const models = useMemo(() => {
    // 免费模型：额度用完时礼物标识转灰、整行置灰，说明行换成用完状态
    const free: ModelInfo | null = !showFreeModels
      ? null
      : quotaExhausted
        ? { ...CHERRY_AI_FREE_MODEL, mutedCapabilities: ['free'], muted: true, note: message }
        : CHERRY_AI_FREE_MODEL;

    if (goSubscribed) {
      const goModels = goLimitMessage
        ? CHERRY_GO_MODELS.map(m => ({ ...m, muted: true, note: goLimitMessage }))
        : CHERRY_GO_MODELS;
      return [...goModels, ...(free ? [free] : []), ...baseModels];
    }
    // 未订阅：Free 在前，Go 的一行引导其后（没有 onCtaClick 的选择器不会渲染它）
    return [...(free ? [free] : []), CHERRY_GO_CTA_MODEL, ...baseModels];
  }, [baseModels, showFreeModels, quotaExhausted, message, goSubscribed, goLimitMessage]);

  const isQuotaBlocked = useCallback(
    (modelId: string) => {
      if (showFreeModels && quotaExhausted && modelId === CHERRY_AI_FREE_MODEL.id) return true;
      if (goSubscribed && goLimited && GO_MODEL_IDS.has(modelId)) return true;
      return false;
    },
    [showFreeModels, quotaExhausted, goSubscribed, goLimited],
  );

  const noticeOnSelect = useCallback((modelId: string) => {
    if (!isQuotaBlocked(modelId)) return;
    if (GO_MODEL_IDS.has(modelId) && goLimitMessage && goLimitDetail) {
      // 5h 打满时给一个当场可点的动作按钮 —— 重置在客户端就能完成；
      // 月度打满没有可做的动作，不放按钮
      toast.info(goLimitMessage, {
        description: goLimitDetail,
        ...(goState === 'limit-5h'
          ? {
              action: {
                label: '立即重置',
                onClick: () => {
                  resetGoQuota();
                  toast.success('已重置，5 小时与每周额度已恢复');
                },
              },
            }
          : {}),
      });
      return;
    }
    notify();
  }, [isQuotaBlocked, goLimitMessage, goLimitDetail, goState, resetGoQuota, notify]);

  const quotaErrorFor = useCallback((modelId: string) => {
    if (!isQuotaBlocked(modelId)) return null;
    if (GO_MODEL_IDS.has(modelId) && goLimitMessage && goLimitDetail) {
      return { classification: goLimitMessage, message: goLimitDetail };
    }
    return { classification: title, message: detail };
  }, [isQuotaBlocked, goLimitMessage, goLimitDetail, title, detail]);

  return { models, noticeOnSelect, isQuotaBlocked, quotaErrorFor };
}
