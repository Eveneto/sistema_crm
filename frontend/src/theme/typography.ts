// Configuração de tipografia moderna (Inter/Roboto)
export const typography = {
  // Família de fontes
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    monospace: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace",
  },
  
  // Tamanhos de fonte
  fontSize: {
    xs: '12px',
    sm: '13px', 
    base: '14px',   // Base do sistema
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px',
  },
  
  // Pesos de fonte
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Altura da linha
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Espaçamento de letras
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// CSS Variables para tipografia
export const typographyCSSVariables = `
  :root {
    --rd-font-family: ${typography.fontFamily.primary};
    --rd-font-family-mono: ${typography.fontFamily.monospace};
    
    --rd-font-size-xs: ${typography.fontSize.xs};
    --rd-font-size-sm: ${typography.fontSize.sm};
    --rd-font-size-base: ${typography.fontSize.base};
    --rd-font-size-lg: ${typography.fontSize.lg};
    --rd-font-size-xl: ${typography.fontSize.xl};
    --rd-font-size-2xl: ${typography.fontSize['2xl']};
    --rd-font-size-3xl: ${typography.fontSize['3xl']};
    --rd-font-size-4xl: ${typography.fontSize['4xl']};
    --rd-font-size-5xl: ${typography.fontSize['5xl']};
    
    --rd-font-weight-normal: ${typography.fontWeight.normal};
    --rd-font-weight-medium: ${typography.fontWeight.medium};
    --rd-font-weight-semibold: ${typography.fontWeight.semibold};
    --rd-font-weight-bold: ${typography.fontWeight.bold};
    
    --rd-line-height-tight: ${typography.lineHeight.tight};
    --rd-line-height-normal: ${typography.lineHeight.normal};
    --rd-line-height-relaxed: ${typography.lineHeight.relaxed};
  }
`;

// Import Google Fonts (Inter)
export const googleFontsImport = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');";
