// Cores do tema escuro para o CRM - Visual elegante azul/branco
export const darkColors = {
  // Cores Principais - azul padrão do sistema
  primary: '#1890ff',        // Azul padrão
  primaryHover: '#40a9ff',   // Azul hover
  primaryLight: '#0f1419',   // Azul muito escuro para backgrounds
  
  // Cores neutras - apenas branco
  success: '#ffffff',
  successLight: '#0f1419',
  
  // Cores de Texto - sempre branco
  textPrimary: '#ffffff',    // Branco principal
  textSecondary: '#ffffff',  // Branco secundário
  textTertiary: '#e6f0ff',   // Branco azulado muito claro
  textDisabled: '#8cc8ff',   // Azul claro para desabilitado
  
  // Backgrounds - azul escuro
  background: '#0f1419',     // Azul muito escuro principal
  backgroundSecondary: '#1890ff', // Azul para sidebar
  backgroundHover: '#1a1a2e', // Azul escuro para hover
  backgroundElevated: '#1a1a2e', // Azul escuro para cards
  
  // Bordas - azul
  border: 'rgba(24, 144, 255, 0.3)',     // Azul transparente
  borderLight: 'rgba(24, 144, 255, 0.2)', // Azul mais transparente
  borderDark: '#1890ff',      // Azul sólido
  
  // Estados - apenas branco
  error: '#ffffff',
  errorLight: '#0f1419',
  warning: '#ffffff',
  warningLight: '#0f1419',
  info: '#ffffff',
  infoLight: '#0f1419',
  
  // Sombras - azuis
  shadow: '0 2px 8px rgba(24, 144, 255, 0.2)',
  shadowLight: '0 1px 4px rgba(24, 144, 255, 0.15)',
  shadowMedium: '0 4px 12px rgba(24, 144, 255, 0.25)',
} as const;

// Exportar cores escuras como CSS variables
export const darkCssVariables = `
  :root[data-theme="dark"] {
    --rd-primary: ${darkColors.primary};
    --rd-primary-hover: ${darkColors.primaryHover};
    --rd-primary-light: ${darkColors.primaryLight};
    --rd-success: ${darkColors.success};
    --rd-success-light: ${darkColors.successLight};
    --rd-text: ${darkColors.textPrimary};
    --rd-text-secondary: ${darkColors.textSecondary};
    --rd-text-tertiary: ${darkColors.textTertiary};
    --rd-text-disabled: ${darkColors.textDisabled};
    --rd-bg: ${darkColors.background};
    --rd-bg-secondary: ${darkColors.backgroundSecondary};
    --rd-bg-hover: ${darkColors.backgroundHover};
    --rd-bg-elevated: ${darkColors.backgroundElevated};
    --rd-border: ${darkColors.border};
    --rd-border-light: ${darkColors.borderLight};
    --rd-border-dark: ${darkColors.borderDark};
    --rd-error: ${darkColors.error};
    --rd-error-light: ${darkColors.errorLight};
    --rd-warning: ${darkColors.warning};
    --rd-warning-light: ${darkColors.warningLight};
    --rd-info: ${darkColors.info};
    --rd-info-light: ${darkColors.infoLight};
    --rd-shadow: ${darkColors.shadow};
    --rd-shadow-light: ${darkColors.shadowLight};
    --rd-shadow-medium: ${darkColors.shadowMedium};
  }
`;
