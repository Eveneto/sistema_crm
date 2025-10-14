import { ThemeConfig } from 'antd';
import { colors } from './colors';
import { typography } from './typography';

// Tema principal do RD Station CRM
export const rdstationTheme: ThemeConfig = {
  token: {
    // Cores principais
    colorPrimary: colors.primary,
    colorPrimaryHover: colors.primaryHover,
    colorSuccess: colors.success,
    colorError: colors.error,
    colorWarning: colors.warning,
    colorInfo: colors.info,
    
    // Cores de texto
    colorText: colors.textPrimary,
    colorTextSecondary: colors.textSecondary,
    colorTextTertiary: colors.textTertiary,
    colorTextQuaternary: colors.textDisabled,
    
    // Backgrounds
    colorBgContainer: colors.background,
    colorBgElevated: colors.background,
    colorBgLayout: colors.backgroundSecondary,
    colorBgSpotlight: colors.backgroundHover,
    
    // Bordas
    colorBorder: colors.border,
    colorBorderSecondary: colors.borderLight,
    
    // Tipografia
    fontFamily: typography.fontFamily.primary,
    fontSize: parseInt(typography.fontSize.base),
    fontSizeHeading1: parseInt(typography.fontSize['5xl']),
    fontSizeHeading2: parseInt(typography.fontSize['4xl']),
    fontSizeHeading3: parseInt(typography.fontSize['3xl']),
    fontSizeHeading4: parseInt(typography.fontSize['2xl']),
    fontSizeHeading5: parseInt(typography.fontSize.xl),
    
    // Espaçamentos
    padding: 16,
    paddingXS: 8,
    paddingSM: 12,
    paddingLG: 24,
    paddingXL: 32,
    
    // Bordas e raios
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    
    // Sombras
    boxShadow: colors.shadow,
    boxShadowSecondary: colors.shadowLight,
    boxShadowTertiary: colors.shadowMedium,
  },
  
  components: {
    // Layout
    Layout: {
      headerBg: colors.background,
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: colors.background,
      bodyBg: colors.backgroundSecondary,
      triggerBg: colors.backgroundHover,
    },
    
    // Menu
    Menu: {
      itemBg: 'transparent',
      itemColor: colors.textSecondary,
      itemHoverBg: colors.backgroundHover,
      itemHoverColor: colors.textPrimary,
      itemSelectedBg: colors.primaryLight,
      itemSelectedColor: colors.primary,
      itemActiveBg: colors.primaryLight,
      subMenuItemBg: 'transparent',
      horizontalItemHoverBg: colors.backgroundHover,
      horizontalItemSelectedBg: colors.primaryLight,
      horizontalItemSelectedColor: colors.primary,
    },
    
    // Button
    Button: {
      primaryColor: colors.background,
      colorPrimary: colors.primary,
      colorPrimaryHover: colors.primaryHover,
      borderRadius: 8,
      paddingInline: 20,
      fontWeight: typography.fontWeight.medium,
    },
    
    // Input
    Input: {
      borderRadius: 8,
      paddingInline: 12,
      activeBorderColor: colors.primary,
    },
    
    // Card
    Card: {
      borderRadius: 12,
      paddingLG: 24,
      boxShadow: colors.shadowLight,
      headerBg: colors.background,
    },
    
    // Table
    Table: {
      headerBg: colors.backgroundSecondary,
      headerColor: colors.textSecondary,
      borderColor: colors.borderLight,
      rowHoverBg: colors.backgroundHover,
    },
    
    // Dropdown
    Dropdown: {
      borderRadius: 8,
      boxShadow: colors.shadowMedium,
    },
    
    // Modal
    Modal: {
      borderRadius: 12,
      paddingLG: 24,
      headerBg: colors.background,
    },
    
    // Notification
    Notification: {
      borderRadius: 8,
      paddingLG: 20,
    },
    
    // Tabs
    Tabs: {
      itemColor: colors.textSecondary,
      itemHoverColor: colors.textPrimary,
      itemSelectedColor: colors.primary,
      itemActiveColor: colors.primary,
      inkBarColor: colors.primary,
    },
  },
};

export default rdstationTheme;
