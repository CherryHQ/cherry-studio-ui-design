import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AgentSession } from '@/app/types/agent';
import { MOCK_SESSIONS } from '@/app/mock';

// ===========================
// Context value shape
// ===========================

interface AgentSessionContextValue {
  sessions: AgentSession[];
  activeSessionId: string | null;
  // Session selection / lifecycle
  selectSession: (id: string) => void;
  newSession: () => void;
  deleteSession: (id: string) => void;
  // Write operations needed by AgentRunPage internals
  addSession: (session: AgentSession, afterId?: string) => void;
  updateSession: (id: string, updates: Partial<AgentSession>) => void;
  /**
   * Move `dragId` relative to `targetId`.
   * position='before' → insert dragId immediately before targetId
   * position='after'  → insert dragId immediately after targetId
   */
  reorderSessions: (dragId: string, targetId: string, position: 'before' | 'after') => void;
}

const AgentSessionContext = createContext<AgentSessionContextValue | null>(null);

// ===========================
// Provider
// Always mounted (not conditional on tab) so session state persists
// when the user navigates away and returns to the agent workspace.
// ===========================

export function AgentSessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<AgentSession[]>(MOCK_SESSIONS.slice(0, 10));
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const selectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const newSession = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setActiveSessionId(prev => (prev === id ? null : prev));
  }, []);

  const addSession = useCallback((session: AgentSession, afterId?: string) => {
    setSessions(prev => {
      if (afterId) {
        const idx = prev.findIndex(s => s.id === afterId);
        if (idx !== -1) {
          const next = [...prev];
          next.splice(idx + 1, 0, session);
          return next;
        }
      }
      return [session, ...prev];
    });
    setActiveSessionId(session.id);
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<AgentSession>) => {
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const reorderSessions = useCallback((dragId: string, targetId: string, position: 'before' | 'after') => {
    setSessions(prev => {
      const item = prev.find(s => s.id === dragId);
      if (!item || dragId === targetId) return prev;
      const without = prev.filter(s => s.id !== dragId);
      const targetIdx = without.findIndex(s => s.id === targetId);
      if (targetIdx === -1) return prev;
      const insertAt = position === 'before' ? targetIdx : targetIdx + 1;
      const result = [...without];
      result.splice(insertAt, 0, item);
      return result;
    });
  }, []);

  return (
    <AgentSessionContext.Provider
      value={{ sessions, activeSessionId, selectSession, newSession, deleteSession, addSession, updateSession, reorderSessions }}
    >
      {children}
    </AgentSessionContext.Provider>
  );
}

// ===========================
// Hook
// ===========================

export function useAgentSession(): AgentSessionContextValue {
  const ctx = useContext(AgentSessionContext);
  if (!ctx) throw new Error('useAgentSession must be used within AgentSessionProvider');
  return ctx;
}
