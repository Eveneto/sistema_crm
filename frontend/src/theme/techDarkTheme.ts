import { ThemeConfig } from 'antd';

// Tema Tech Dark CRM - Design Moderno e Tecnológico (Modo Escuro)
export const techDarkTheme: ThemeConfig = {
  token: {
    // === CORES PRINCIPAIS ===
    colorPrimary: '#3b82f6',           // Azul mais claro para contraste
    colorPrimaryHover: '#60a5fa',      // Azul claro hover
    colorPrimaryActive: '#1d4ed8',     // Azul ativo
    colorPrimaryBg: '#1e293b',         // Background primário escuro
    
    // === CORES DE TEXTO ===
    colorText: '#ffffff',              // Texto principal branco
    colorTextSecondary: '#e2e8f0',     // Texto secundário claro
    colorTextTertiary: '#cbd5e1',      // Texto terciário
    colorTextQuaternary: '#94a3b8',    // Texto desabilitado
    
    // === BACKGROUNDS ===
    colorBgContainer: '#0f172a',       // Background de containers escuro
    colorBgElevated: '#1e293b',        // Background elevado
    colorBgLayout: '#020617',          // Background do layout (mais escuro)
    colorBgSpotlight: '#334155',       // Background de destaque
    colorBgMask: 'rgba(0, 0, 0, 0.65)', // Máscara de modal
    
    // === BORDAS ===
    colorBorder: '#334155',            // Borda padrão escura
    colorBorderSecondary: '#1e293b',   // Borda secundária
    
    // === CORES DE ESTADO ===
    colorSuccess: '#22c55e',           // Verde mais claro
    colorWarning: '#fbbf24',           // Amarelo mais claro
    colorError: '#f87171',             // Vermelho mais claro
    colorInfo: '#60a5fa',              // Azul info claro
    
    // === TIPOGRAFIA ===
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyCode: "'JetBrains Mono', 'SF Mono', 'Monaco', monospace",
    
    // Tamanhos de fonte
    fontSize: 16,                      
    fontSizeSM: 14,                    
    fontSizeLG: 18,                    
    fontSizeXL: 20,                    
    
    // Tamanhos de títulos
    fontSizeHeading1: 48,              
    fontSizeHeading2: 36,              
    fontSizeHeading3: 30,              
    fontSizeHeading4: 24,              
    fontSizeHeading5: 20,              
    
    // === ESPAÇAMENTOS ===
    padding: 16,                       
    paddingXS: 8,                      
    paddingSM: 12,                     
    paddingLG: 24,                     
    paddingXL: 32,                     
    
    margin: 16,                        
    marginXS: 8,                       
    marginSM: 12,                      
    marginLG: 24,                      
    marginXL: 32,                      
    
    // === BORDAS E RAIOS ===
    borderRadius: 4,                   
    borderRadiusXS: 2,                 
    borderRadiusSM: 4,                 
    borderRadiusLG: 8,                 
    borderRadiusOuter: 6,              
    
    // === SOMBRAS ESCURAS ===
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
    boxShadowSecondary: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    boxShadowTertiary: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    
    // === DIMENSÕES DE CONTROLE ===
    controlHeight: 40,                 
    controlHeightSM: 32,               
    controlHeightLG: 48,               
    
    // === TRANSIÇÕES ===
    motionDurationFast: '0.15s',       
    motionDurationMid: '0.2s',         
    motionDurationSlow: '0.3s',        
    
    // === OPACIDADE ===
    opacityLoading: 0.65,              
    
    // === LINHA ===
    lineWidth: 1,                      
    lineType: 'solid',                 
    
    // === WIREFRAME ===
    wireframe: false,
  },
  
  // === COMPONENTES ESPECÍFICOS MODO ESCURO ===
  components: {
    // === LAYOUT ===
    Layout: {
      headerBg: '#0f172a',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#0f172a',
      triggerBg: '#1e293b',
      triggerColor: '#3b82f6',
    },
    
    // === MENU ===
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#1e293b',
      itemHoverBg: '#334155',
      itemSelectedColor: '#60a5fa',
      itemColor: '#e2e8f0',
      iconSize: 18,
      fontSize: 15,
      borderRadius: 4,
      darkItemBg: 'transparent',
      darkItemSelectedBg: '#1e293b',
      darkItemHoverBg: '#334155',
    },
    
    // === BOTÕES ===
    Button: {
      borderRadius: 4,
      fontWeight: 500,
      primaryShadow: '0 2px 4px rgba(59, 130, 246, 0.25)',
      defaultBg: '#334155',
      defaultBorderColor: '#475569',
      defaultColor: '#e2e8f0',
    },
    
    // === CARDS ===
    Card: {
      borderRadius: 4,
      headerBg: 'transparent',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
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
      headerBg: '#1e293b',
      headerSplitColor: '#334155',
      rowHoverBg: '#334155',
    },
    
    // === MODAIS ===
    Modal: {
      borderRadius: 8,
      headerBg: '#0f172a',
      contentBg: '#0f172a',
    },
    
    // === TABS ===
    Tabs: {
      inkBarColor: '#3b82f6',
      itemActiveColor: '#60a5fa',
      itemHoverColor: '#93c5fd',
      itemSelectedColor: '#60a5fa',
    },
    
    // === BADGES ===
    Badge: {
      textFontSize: 12,
      textFontWeight: 500,
    },
    
    // === TOOLTIPS ===
    Tooltip: {
      borderRadius: 4,
      colorBgSpotlight: '#334155',
    },
    
    // === DROPDOWNS ===
    Dropdown: {
      borderRadius: 4,
    },
    
    // === PAGINATION ===
    Pagination: {
      borderRadius: 4,
      itemActiveBg: '#3b82f6',
    },
    
    // === PROGRESS ===
    Progress: {
      defaultColor: '#3b82f6',
      remainingColor: '#334155',
    },
  },
};

export default techDarkTheme;
