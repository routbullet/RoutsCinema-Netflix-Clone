// Design tokens — single source of truth. No magic hexes in components.
export const tokens = {
  color: {
    bg: '#0B0A18',
    bgElevated: '#14121F',
    surface: '#1C1A2E',
    surfaceHover: '#252238',
    text: '#F5F5F7',
    muted: '#A7A7B8',
    accent: '#E50914',
    accentHover: '#F6121D',
    focus: '#7DD3FC',
    success: '#22C55E',
    warning: '#F59E0B',
    border: 'rgba(245,245,247,0.12)',
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '999px',
  },
  shadow: {
    card: '0 8px 28px rgba(0,0,0,0.45)',
    hero: '0 24px 80px rgba(0,0,0,0.6)',
    focus: '0 0 0 3px rgba(125,211,252,0.55)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2.5rem',
    xxl: '4rem',
  },
  breakpoint: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1440px',
  },
  font: {
    display: '"Bebas Neue", "Arial Narrow", sans-serif',
    body: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
};

export const media = {
  sm: `@media (min-width: ${tokens.breakpoint.sm})`,
  md: `@media (min-width: ${tokens.breakpoint.md})`,
  lg: `@media (min-width: ${tokens.breakpoint.lg})`,
  xl: `@media (min-width: ${tokens.breakpoint.xl})`,
  hover: '@media (hover: hover) and (pointer: fine)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
};
