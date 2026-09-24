import { createContext, useContext, type ReactNode } from 'react';
import { usePiAgentDemo } from './usePiAgentDemo';

const PiAgentDemoContext = createContext<ReturnType<typeof usePiAgentDemo> | null>(null);

export function PiAgentDemoProvider({ children }: { children: ReactNode }) {
  const demo = usePiAgentDemo();
  return <PiAgentDemoContext.Provider value={demo}>{children}</PiAgentDemoContext.Provider>;
}

export function usePiAgentWorkspace() {
  const demo = useContext(PiAgentDemoContext);
  if (!demo) throw new Error('PiAgentDemoProvider is required');
  return demo;
}
