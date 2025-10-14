// Cores do tema RD Station CRM
export const colors = {
  // Cores Principais
  primary: '#00B050',        // Verde principal
  primaryHover: '#009A43',   // Verde hover
  primaryLight: '#F0F9F4',   // Verde claro para backgrounds
  
  // Cores de Sucesso
  success: '#52C41A',
  successLight: '#F6FFED',
  
  // Cores de Texto
  textPrimary: '#1C1C1C',     // Preto principal
  textSecondary: '#666666',   // Cinza texto
  textTertiary: '#999999',    // Cinza claro
  textDisabled: '#BFBFBF',    // Texto desabilitado
  
  // Backgrounds
  background: '#FFFFFF',      // Branco principal
  backgroundSecondary: '#FAFAFA', // Cinza muito claro
  backgroundHover: '#F5F5F5', // Hover state
  
  // Bordas
  border: '#E8E8E8',         // Cinza borda
  borderLight: '#F0F0F0',    // Borda clara
  borderDark: '#D9D9D9',     // Borda escura
  
  // Estados
  error: '#FF4D4F',
  errorLight: '#FFF2F0',
  warning: '#FAAD14',
  warningLight: '#FFFBE6',
  info: '#1890FF',
  infoLight: '#E6F7FF',
  
  // Sombras
  shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  shadowLight: '0 1px 4px rgba(0, 0, 0, 0.04)',
  shadowMedium: '0 4px 12px rgba(0, 0, 0, 0.12)',
} as const;

// Exportar cores como CSS variables para uso global
export const cssVariables = `
  :root {
    --rd-primary: ${colors.primary};
    --rd-primary-hover: ${colors.primaryHover};
    --rd-primary-light: ${colors.primaryLight};
    --rd-success: ${colors.success};
    --rd-success-light: ${colors.successLight};
    --rd-text: ${colors.textPrimary};
    --rd-text-secondary: ${colors.textSecondary};
    --rd-text-tertiary: ${colors.textTertiary};
    --rd-text-disabled: ${colors.textDisabled};
    --rd-bg: ${colors.background};
    --rd-bg-secondary: ${colors.backgroundSecondary};
    --rd-bg-hover: ${colors.backgroundHover};
    --rd-border: ${colors.border};
    --rd-border-light: ${colors.borderLight};
    --rd-border-dark: ${colors.borderDark};
    --rd-error: ${colors.error};
    --rd-error-light: ${colors.errorLight};
    --rd-warning: ${colors.warning};
    --rd-warning-light: ${colors.warningLight};
    --rd-info: ${colors.info};
    --rd-info-light: ${colors.infoLight};
    --rd-shadow: ${colors.shadow};
    --rd-shadow-light: ${colors.shadowLight};
    --rd-shadow-medium: ${colors.shadowMedium};
  }
`;
