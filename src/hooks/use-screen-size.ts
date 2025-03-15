import { useState, useEffect } from 'react';

type ScreenSizeBreakpoints = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
};

const breakpoints: ScreenSizeBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakpointKey = keyof typeof breakpoints;

export function useScreenSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Only execute this on the client
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    lessThan: (breakpoint: BreakpointKey) => windowSize.width < breakpoints[breakpoint],
    greaterThan: (breakpoint: BreakpointKey) => windowSize.width > breakpoints[breakpoint],
    between: (minBreakpoint: BreakpointKey, maxBreakpoint: BreakpointKey) =>
      windowSize.width > breakpoints[minBreakpoint] && windowSize.width < breakpoints[maxBreakpoint],
  };
} 