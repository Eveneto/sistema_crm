import { ThemeConfig } from 'antd';

// Tema Tech CRM - Design Moderno e Tecnológico
export const techTheme: ThemeConfig = {
  token: {
    // === CORES PRINCIPAIS ===
    colorPrimary: '#1a237e',           // Azul escuro profundo
    colorPrimaryHover: '#303f9f',      // Azul médio
    colorPrimaryActive: '#0d1962',     // Azul escuro mais intenso
    colorPrimaryBg: '#f8fafc',         // Background primário
    
    // === CORES DE TEXTO ===
    colorText: '#0f172a',              // Texto principal (cinza quase preto)
    colorTextSecondary: '#475569',     // Texto secundário
    colorTextTertiary: '#64748b',      // Texto terciário
    colorTextQuaternary: '#94a3b8',    // Texto desabilitado
    
    // === BACKGROUNDS ===
    colorBgContainer: '#ffffff',       // Background de containers
    colorBgElevated: '#ffffff',        // Background elevado
    colorBgLayout: '#f8fafc',          // Background do layout
    colorBgSpotlight: '#f1f5f9',       // Background de destaque
    colorBgMask: 'rgba(15, 23, 42, 0.45)', // Máscara de modal
    
    // === BORDAS ===
    colorBorder: '#e2e8f0',            // Borda padrão
    colorBorderSecondary: '#f1f5f9',   // Borda secundária
    
    // === CORES DE ESTADO ===
    colorSuccess: '#10b981',           // Verde tech
    colorWarning: '#f59e0b',           // Amarelo tech
    colorError: '#ef4444',             // Vermelho tech
    colorInfo: '#3f51b5',              // Azul info
    
    // === TIPOGRAFIA ===
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyCode: "'JetBrains Mono', 'SF Mono', 'Monaco', monospace",
    
    // Tamanhos de fonte
    fontSize: 16,                      // Fonte base
    fontSizeSM: 14,                    // Fonte pequena
    fontSizeLG: 18,                    // Fonte grande
    fontSizeXL: 20,                    // Fonte extra grande
    
    // Tamanhos de títulos
    fontSizeHeading1: 48,              // H1
    fontSizeHeading2: 36,              // H2
    fontSizeHeading3: 30,              // H3
    fontSizeHeading4: 24,              // H4
    fontSizeHeading5: 20,              // H5
    
    // === ESPAÇAMENTOS ===
    padding: 16,                       // Padding padrão
    paddingXS: 8,                      // Padding extra pequeno
    paddingSM: 12,                     // Padding pequeno
    paddingLG: 24,                     // Padding grande
    paddingXL: 32,                     // Padding extra grande
    
    margin: 16,                        // Margin padrão
    marginXS: 8,                       // Margin extra pequeno
    marginSM: 12,                      // Margin pequeno
    marginLG: 24,                      // Margin grande
    marginXL: 32,                      // Margin extra grande
    
    // === BORDAS E RAIOS ===
    borderRadius: 4,                   // Raio padrão (mais quadrado)
    borderRadiusXS: 2,                 // Raio extra pequeno
    borderRadiusSM: 4,                 // Raio pequeno
    borderRadiusLG: 8,                 // Raio grande (máximo)
    borderRadiusOuter: 6,              // Raio externo
    
    // === SOMBRAS ===
    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px -1px rgba(15, 23, 42, 0.1)',
    boxShadowSecondary: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    boxShadowTertiary: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)',
    
    // === DIMENSÕES DE CONTROLE ===
    controlHeight: 40,                 // Altura padrão de controles
    controlHeightSM: 32,               // Altura pequena
    controlHeightLG: 48,               // Altura grande
    
    // === TRANSIÇÕES ===
    motionDurationFast: '0.15s',       // Transição rápida
    motionDurationMid: '0.2s',         // Transição média
    motionDurationSlow: '0.3s',        // Transição lenta
    
    // === OPACIDADE ===
    opacityLoading: 0.65,              // Opacidade de loading
    
    // === LINHA ===
    lineWidth: 1,                      // Largura da linha
    lineType: 'solid',                 // Tipo da linha
    
    // === WIREFRAME (desabilitado para design personalizado) ===
    wireframe: false,
  },
  
  // === COMPONENTES ESPECÍFICOS ===
  components: {
    // === LAYOUT ===
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#ffffff',
      triggerBg: '#f8fafc',
      triggerColor: '#1a237e',
    },
    
    // === MENU ===
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#f1f5f9',
      itemHoverBg: '#f8fafc',
      itemSelectedColor: '#1a237e',
      itemColor: '#475569',
      iconSize: 18,
      fontSize: 15,
      borderRadius: 4,
    },
    
    // === BOTÕES ===
    Button: {
      borderRadius: 4,
      fontWeight: 500,
      primaryShadow: '0 2px 4px rgba(26, 35, 126, 0.15)',
    },
    
    // === CARDS ===
    Card: {
      borderRadius: 4,
      headerBg: 'transparent',
      boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px -1px rgba(15, 23, 42, 0.1)',
    },
    
    // === INPUTS ===
    Input: {
      borderRadius: 4,
      fontSize: 15,
      paddingBlock: 10,
      paddingInline: 12,
    },
    
    // === TABELAS ===
    Table: {
      borderRadius: 4,
      headerBg: '#f8fafc',
      headerSplitColor: '#e2e8f0',
      rowHoverBg: '#f8fafc',
    },
    
    // === MODAIS ===
    Modal: {
      borderRadius: 8,
      headerBg: '#ffffff',
      contentBg: '#ffffff',
    },
    
    // === TABS ===
    Tabs: {
      inkBarColor: '#1a237e',
      itemActiveColor: '#1a237e',
      itemHoverColor: '#303f9f',
      itemSelectedColor: '#1a237e',
    },
    
    // === BADGES ===
    Badge: {
      textFontSize: 12,
      textFontWeight: 500,
    },
    
    // === TOOLTIPS ===
    Tooltip: {
      borderRadius: 4,
    },
    
    // === DROPDOWNS ===
    Dropdown: {
      borderRadius: 4,
    },
    
    // === PAGINATION ===
    Pagination: {
      borderRadius: 4,
      itemActiveBg: '#1a237e',
    },
    
    // === PROGRESS ===
    Progress: {
      defaultColor: '#1a237e',
      remainingColor: '#e2e8f0',
    },
  },
};

export default techTheme;
