import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { FriendRequest, MOCK_FRIEND_REQUESTS } from './data';

interface CollabContextValue {
  // User email binding state (mock)
  boundEmail: string | null;
  setBoundEmail: (email: string | null) => void;

  // Friend requests
  pendingRequests: FriendRequest[];
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;

  // User info popup
  userInfoOpen: boolean;
  openUserInfo: () => void;
  closeUserInfo: () => void;
}

const CollabContext = createContext<CollabContextValue | null>(null);

export function CollabProvider({ children }: { children: React.ReactNode }) {
  const [boundEmail, setBoundEmail] = useState<string | null>(null);
  const [requests, setRequests] = useState<FriendRequest[]>(MOCK_FRIEND_REQUESTS);
  const [userInfoOpen, setUserInfoOpen] = useState(false);

  const pendingRequests = useMemo(
    () => requests.filter(r => r.status === 'pending'),
    [requests],
  );

  const acceptRequest = useCallback((id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
  }, []);

  const rejectRequest = useCallback((id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  }, []);

  const value = useMemo<CollabContextValue>(() => ({
    boundEmail,
    setBoundEmail,
    pendingRequests,
    acceptRequest,
    rejectRequest,
    userInfoOpen,
    openUserInfo: () => setUserInfoOpen(true),
    closeUserInfo: () => setUserInfoOpen(false),
  }), [boundEmail, pendingRequests, acceptRequest, rejectRequest, userInfoOpen]);

  return <CollabContext.Provider value={value}>{children}</CollabContext.Provider>;
}

export function useCollab(): CollabContextValue {
  const ctx = useContext(CollabContext);
  if (!ctx) throw new Error('useCollab must be used within CollabProvider');
  return ctx;
}
