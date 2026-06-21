import { MotionConfig, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { ReactNode } from 'react';

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const shouldReduceMotion = useReducedMotion();

  const config = useMemo(() => ({
    transition: shouldReduceMotion ? { duration: 0.01 } : undefined,
  }), [shouldReduceMotion]);

  return (
    <MotionConfig {...config}>
      {children}
    </MotionConfig>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMotionConfig() {
  const shouldReduceMotion = useReducedMotion();
  return useMemo(() => ({
    shouldReduceMotion,
    transition: shouldReduceMotion ? { duration: 0.01 } : undefined,
  }), [shouldReduceMotion]);
}
