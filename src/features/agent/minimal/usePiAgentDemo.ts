import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadFile } from '@/app/services/resourceService';
import type { AttachmentFileType } from '@/app/types/shared';
import { toast } from 'sonner';
import {
  createDemoAgent,
  createDemoAgents,
  demoReply,
  type AgentSource,
  type DemoAgent,
  type DemoMessage,
  type DemoScenario,
} from './piAgentDemo';

export function usePiAgentDemo() {
  const [agents, setAgents] = useState(createDemoAgents);
  const [selectedId, setSelectedId] = useState(() => agents[0].id);
  const selectedIdRef = useRef(selectedId);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const fileUrls = useRef(new Set<string>());
  const agent = agents.find((item) => item.id === selectedId)!;
  const busy = agent.messages.some((message) => ['running', 'approval', 'executing'].includes(message.status));

  useEffect(() => {
    const pending = timers.current;
    const urls = fileUrls.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
      urls.forEach(URL.revokeObjectURL);
    };
  }, []);

  const updateAgent = useCallback((id: string, update: (agent: DemoAgent) => DemoAgent) => {
    setAgents((current) => current.map((item) => (item.id === id ? update(item) : item)));
  }, []);

  const patch = (changes: Partial<DemoAgent>) => updateAgent(selectedId, (item) => ({ ...item, ...changes }));

  const selectAgent = (id: string) => {
    selectedIdRef.current = id;
    setSelectedId(id);
    updateAgent(id, (item) => ({ ...item, unread: 0 }));
  };

  const addAgent = (name: string, source: AgentSource, model: string, description: string, providerId?: string) => {
    const next = { ...createDemoAgent(name, source), model, description, providerId };
    setAgents((current) => [...current, next]);
    selectedIdRef.current = next.id;
    setSelectedId(next.id);
  };

  const addAttachments = async (files: File[]) => {
    const agentId = selectedId;
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const uploaded = await uploadFile(file);
        fileUrls.current.add(uploaded.fileUrl);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
        const text =
          file.type.startsWith('text/') || /^(md|txt|csv|json|js|jsx|ts|tsx|py|html|css|svg|yml|yaml)$/.test(ext);
        return {
          id: crypto.randomUUID(),
          name: file.name,
          type: ext as AttachmentFileType,
          size:
            file.size < 1024
              ? `${file.size} B`
              : file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          fileUrl: uploaded.fileUrl,
          mimeType: uploaded.mimeType,
          previewUrl: file.type.startsWith('image/') ? uploaded.fileUrl : undefined,
          content: text ? await file.text() : undefined,
        };
      }),
    );
    for (const result of results) {
      if (result.status === 'fulfilled')
        updateAgent(agentId, (item) => ({ ...item, attachments: [...item.attachments, result.value] }));
      else toast.error('附件读取失败，请重新选择。');
    }
  };

  const removeAttachment = (id: string) =>
    updateAgent(selectedId, (item) => ({ ...item, attachments: item.attachments.filter((file) => file.id !== id) }));

  const schedule = (agentId: string, messageId: string, changes: Partial<DemoMessage>) => {
    clearTimeout(timers.current.get(messageId));
    timers.current.set(
      messageId,
      setTimeout(() => {
        timers.current.delete(messageId);
        updateAgent(agentId, (item) => ({
          ...item,
          messages: item.messages.map((message) => (message.id === messageId ? { ...message, ...changes } : message)),
          updatedAt: Date.now(),
          unread: item.id === selectedIdRef.current ? 0 : item.unread + 1,
        }));
      }, 1100),
    );
  };

  const send = (text: string, scenario: DemoScenario = 'chat') => {
    if ((!text.trim() && !agent.attachments.length) || busy) return;
    const answer: DemoMessage = { id: crypto.randomUUID(), role: 'assistant', text: '', status: 'running', scenario };
    updateAgent(selectedId, (item) => ({
      ...item,
      draft: '',
      attachments: [],
      updatedAt: Date.now(),
      messages: [
        ...item.messages,
        { id: crypto.randomUUID(), role: 'user', text: text.trim(), status: 'done', attachments: item.attachments },
        answer,
      ],
    }));
    schedule(
      selectedId,
      answer.id,
      scenario === 'tool'
        ? { status: 'approval' }
        : scenario === 'error'
          ? { status: 'error' }
          : { status: 'done', text: demoReply('chat') },
    );
  };

  const approve = (messageId: string, allowed: boolean) => {
    updateAgent(selectedId, (item) => ({
      ...item,
      messages: item.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              status: allowed ? 'executing' : 'done',
              text: allowed ? '' : '已拒绝工具调用，未执行文件操作。',
            }
          : message,
      ),
    }));
    if (allowed) schedule(selectedId, messageId, { status: 'done', text: demoReply('tool'), result: true });
  };

  const retry = (messageId: string) => {
    if (busy) return;
    const message = agent.messages.find((item) => item.id === messageId);
    if (!message) return;
    updateAgent(selectedId, (item) => ({
      ...item,
      messages: item.messages.map((message) =>
        message.id === messageId ? { ...message, status: 'running', text: '', result: false } : message,
      ),
    }));
    schedule(
      selectedId,
      messageId,
      message.scenario === 'tool' ? { status: 'approval' } : { status: 'done', text: demoReply('chat') },
    );
  };

  const stop = () => {
    agent.messages.forEach((message) => {
      clearTimeout(timers.current.get(message.id));
      timers.current.delete(message.id);
    });
    patch({
      messages: agent.messages.map((message) =>
        ['running', 'approval', 'executing'].includes(message.status)
          ? { ...message, status: 'stopped', text: '已停止生成。' }
          : message,
      ),
    });
  };

  return {
    agents,
    agent,
    busy,
    selectAgent,
    addAgent,
    addAttachments,
    removeAttachment,
    patch,
    send,
    approve,
    retry,
    stop,
  };
}
