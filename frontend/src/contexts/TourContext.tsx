'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface TourContextValue {
  active: boolean;
  stepIndex: number;
  systemNodeId: string | null;
  start: (systemNodeId?: string) => void;
  end: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  setSystemNodeId: (id: string) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [systemNodeId, setSystemNodeIdState] = useState<string | null>(null);

  const start = useCallback((id?: string) => {
    if (id) setSystemNodeIdState(id);
    setStepIndex(0);
    setActive(true);
  }, []);

  const end = useCallback(() => {
    setActive(false);
    setStepIndex(0);
  }, []);

  const next = useCallback(() => setStepIndex(i => i + 1), []);
  const prev = useCallback(() => setStepIndex(i => Math.max(0, i - 1)), []);
  const goTo = useCallback((i: number) => setStepIndex(i), []);
  const setSystemNodeId = useCallback((id: string) => setSystemNodeIdState(id), []);

  return (
    <TourContext.Provider value={{ active, stepIndex, systemNodeId, start, end, next, prev, goTo, setSystemNodeId }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
