import { MotionConfig, useReducedMotion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';

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

export function useMotionConfig() {
  const shouldReduceMotion = useReducedMotion();
  return useMemo(() => ({
    shouldReduceMotion,
    transition: shouldReduceMotion ? { duration: 0.01 } : undefined,
  }), [shouldReduceMotion]);
}
