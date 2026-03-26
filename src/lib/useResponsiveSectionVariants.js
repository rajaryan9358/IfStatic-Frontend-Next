'use client';

import React from 'react';

export const useIsMobileViewport = (breakpoint = 768) => {
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateViewportState = () => {
      setIsMobileViewport(window.innerWidth <= breakpoint);
    };

    updateViewportState();
    window.addEventListener('resize', updateViewportState);

    return () => {
      window.removeEventListener('resize', updateViewportState);
    };
  }, [breakpoint]);

  return isMobileViewport;
};

export const useViewportDevice = (mobileBreakpoint = 768, tabletBreakpoint = 1024) => {
  const [device, setDevice] = React.useState('pc');

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateViewportState = () => {
      if (window.innerWidth <= mobileBreakpoint) {
        setDevice('mobile');
        return;
      }

      if (window.innerWidth <= tabletBreakpoint) {
        setDevice('tablet');
        return;
      }

      setDevice('pc');
    };

    updateViewportState();
    window.addEventListener('resize', updateViewportState);

    return () => {
      window.removeEventListener('resize', updateViewportState);
    };
  }, [mobileBreakpoint, tabletBreakpoint]);

  return device;
};

export const useResponsiveSectionVariants = (desktopOffset = 24, mobileOffset = 8, breakpoint = 768) => {
  const isMobileViewport = useIsMobileViewport(breakpoint);

  return React.useMemo(() => ({
    hidden: { opacity: 0, y: isMobileViewport ? mobileOffset : desktopOffset },
    visible: { opacity: 1, y: 0 }
  }), [desktopOffset, mobileOffset, isMobileViewport]);
};