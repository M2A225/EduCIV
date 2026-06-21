import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const BREAKPOINTS: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
}

export function useBreakpointBelow(breakpoint: Breakpoint): boolean {
  const bpValue = BREAKPOINTS[breakpoint];
  return useMediaQuery(`(max-width: ${bpValue - 1}px)`);
}

export function useIsMobile(): boolean {
  return useBreakpointBelow('md');
}

export function useIsTablet(): boolean {
  const isMd = useBreakpoint('md');
  const isBelowLg = useBreakpointBelow('lg');
  return isMd && isBelowLg;
}

export function useIsDesktop(): boolean {
  return useBreakpoint('lg');
}