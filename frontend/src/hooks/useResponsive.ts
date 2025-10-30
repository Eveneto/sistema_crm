import { useMediaQuery } from 'react-responsive';

// Breakpoints baseados no design system
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Hooks personalizados para responsividade
export const useResponsive = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1280 });

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // Breakpoints específicos
    isSm: useMediaQuery({ minWidth: breakpoints.sm }),
    isMd: useMediaQuery({ minWidth: breakpoints.md }),
    isLg: useMediaQuery({ minWidth: breakpoints.lg }),
    isXl: useMediaQuery({ minWidth: breakpoints.xl }),
    is2Xl: useMediaQuery({ minWidth: breakpoints['2xl'] }),
  };
};

// Hook específico para orientação
export const useOrientation = () => {
  const isPortrait = useMediaQuery({ orientation: 'portrait' });
  const isLandscape = useMediaQuery({ orientation: 'landscape' });

  return {
    isPortrait,
    isLandscape,
  };
};

// Hook para detectar toques (mobile/tablet)
export const useTouchDevice = () => {
  const isTouchDevice = useMediaQuery({ query: '(hover: none) and (pointer: coarse)' });
  return isTouchDevice;
};

// Hook para detectar se é dispositivo móvel pequeno
export const useSmallMobile = () => {
  return useMediaQuery({ maxWidth: 480 });
};
