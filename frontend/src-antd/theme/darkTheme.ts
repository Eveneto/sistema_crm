import { ThemeConfig } from 'antd';
import { darkColors } from './darkColors';
import { typography } from './typography';

// Tema escuro para Ant Design
export const darkTheme: ThemeConfig = {
  token: {
    // Cores principais
    colorPrimary: darkColors.primary,
    colorPrimaryHover: darkColors.primaryHover,
    colorSuccess: darkColors.success,
    colorError: darkColors.error,
    colorWarning: darkColors.warning,
    colorInfo: darkColors.info,
    
    // Cores de texto - sempre branco
    colorText: darkColors.textPrimary,
    colorTextSecondary: darkColors.textPrimary,
    colorTextTertiary: darkColors.textTertiary,
    colorTextQuaternary: darkColors.textDisabled,
    
    // Backgrounds
    colorBgContainer: darkColors.backgroundElevated,
    colorBgElevated: darkColors.backgroundElevated,
    colorBgLayout: darkColors.background,
    colorBgSpotlight: darkColors.backgroundHover,
    colorBgBase: darkColors.background,
    colorBgMask: 'rgba(24, 144, 255, 0.3)',
    
    // Bordas
    colorBorder: darkColors.border,
    colorBorderSecondary: darkColors.borderLight,
    
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
    borderRadiusXS: 4,
    borderRadiusSM: 6,
    
    // Sombras
    boxShadow: darkColors.shadowLight,
    boxShadowSecondary: darkColors.shadowMedium,
    
    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    
    // Cores específicas para componentes
    colorFillAlter: darkColors.backgroundSecondary,
    colorFillContent: darkColors.backgroundHover,
    colorFillContentHover: '#303030',
    colorFillSecondary: darkColors.borderLight,
    
    // Links
    colorLink: darkColors.primary,
    colorLinkHover: darkColors.primaryHover,
    colorLinkActive: darkColors.primaryHover,
  },
  
  components: {
    // Layout
    Layout: {
      bodyBg: darkColors.background,
      headerBg: darkColors.backgroundElevated,
      siderBg: darkColors.backgroundElevated,
      footerBg: darkColors.backgroundElevated,
    },
    
    // Menu
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: darkColors.primaryLight,
      itemHoverBg: darkColors.backgroundHover,
      subMenuItemBg: 'transparent',
      itemColor: darkColors.textSecondary,
      itemSelectedColor: darkColors.primary,
      itemHoverColor: darkColors.textPrimary,
      colorBgElevated: darkColors.backgroundElevated,
    },
    
    // Card
    Card: {
      colorBgContainer: darkColors.backgroundElevated,
      colorBorderSecondary: darkColors.border,
    },
    
    // Button
    Button: {
      colorBgContainer: darkColors.backgroundElevated,
      colorBorder: darkColors.border,
      colorText: darkColors.textPrimary,
    },
    
    // Input
    Input: {
      colorBgContainer: darkColors.backgroundElevated,
      colorBorder: darkColors.border,
      colorText: darkColors.textPrimary,
      colorTextPlaceholder: darkColors.textTertiary,
    },
    
    // Select
    Select: {
      colorBgContainer: darkColors.backgroundElevated,
      colorBgElevated: darkColors.backgroundElevated,
      colorBorder: darkColors.border,
      colorText: darkColors.textPrimary,
      colorTextPlaceholder: darkColors.textTertiary,
    },
    
    // Table
    Table: {
      colorBgContainer: darkColors.backgroundElevated,
      colorFillAlter: darkColors.backgroundSecondary,
      colorBorderSecondary: darkColors.border,
      colorText: darkColors.textPrimary,
      colorTextHeading: darkColors.textPrimary,
    },
    
    // Modal
    Modal: {
      colorBgElevated: darkColors.backgroundElevated,
      colorBgMask: 'rgba(0, 0, 0, 0.65)',
      colorText: darkColors.textPrimary,
    },
    
    // Drawer
    Drawer: {
      colorBgElevated: darkColors.backgroundElevated,
      colorBgMask: 'rgba(0, 0, 0, 0.65)',
      colorText: darkColors.textPrimary,
    },
    
    // Tooltip
    Tooltip: {
      colorBgSpotlight: darkColors.backgroundElevated,
      colorTextLightSolid: darkColors.textPrimary,
    },
    
    // Popover
    Popover: {
      colorBgElevated: darkColors.backgroundElevated,
      colorText: darkColors.textPrimary,
    },
    
    // Notification
    Notification: {
      colorBgElevated: darkColors.backgroundElevated,
      colorText: darkColors.textPrimary,
      colorIcon: darkColors.textSecondary,
    },
    
    // Message
    Message: {
      colorBgElevated: darkColors.backgroundElevated,
      colorText: darkColors.textPrimary,
    },
    
    // Dropdown
    Dropdown: {
      colorBgElevated: darkColors.backgroundElevated,
      colorText: darkColors.textPrimary,
    },
    
    // Tabs
    Tabs: {
      colorBgContainer: 'transparent',
      colorText: darkColors.textSecondary,
      itemSelectedColor: darkColors.primary,
      itemHoverColor: darkColors.textPrimary,
      inkBarColor: darkColors.primary,
    },
    
    // Progress
    Progress: {
      colorText: darkColors.textPrimary,
    },
    
    // Spin
    Spin: {
      colorPrimary: darkColors.primary,
      colorText: darkColors.textSecondary,
    },
    
    // Tag
    Tag: {
      colorBgContainer: darkColors.backgroundSecondary,
      colorBorder: darkColors.border,
      colorText: darkColors.textPrimary,
    },
    
    // Badge
    Badge: {
      colorBgContainer: darkColors.backgroundElevated,
      colorText: darkColors.textPrimary,
    },
    
    // Divider
    Divider: {
      colorSplit: darkColors.border,
      colorText: darkColors.textSecondary,
    },
    
    // Switch
    Switch: {
      colorPrimary: darkColors.primary,
      colorPrimaryHover: darkColors.primaryHover,
    },
    
    // Radio
    Radio: {
      colorText: darkColors.textPrimary,
      colorBgContainer: darkColors.backgroundElevated,
    },
    
    // Checkbox
    Checkbox: {
      colorText: darkColors.textPrimary,
      colorBgContainer: darkColors.backgroundElevated,
    },
    
    // DatePicker e TimePicker
    DatePicker: {
      colorBgContainer: darkColors.backgroundElevated,
      colorBgElevated: darkColors.backgroundElevated,
      colorBorder: darkColors.border,
      colorText: darkColors.textPrimary,
      colorTextPlaceholder: darkColors.textTertiary,
    },
  },
};

export default darkTheme;
