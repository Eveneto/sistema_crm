import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos para o contexto de tema
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

// Contexto do tema
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Props do provider
interface ThemeProviderProps {
  children: ReactNode;
}

// Constantes
const THEME_STORAGE_KEY = 'crm_theme_mode';

// Provider do tema
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Função para detectar preferência do sistema - MODO ESCURO COMO PADRÃO
  const getSystemPreference = (): ThemeMode => {
    return 'dark'; // Sempre retorna dark como padrão
  };

  // Função para carregar tema do localStorage - MODO ESCURO COMO PADRÃO
  const getStoredTheme = (): ThemeMode => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return 'dark'; // Retorna dark como padrão se não houver preferência salva
  };

  // Estado do tema
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredTheme);

  // Função para atualizar tema
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    updateDocumentClass(mode);
  };

  // Função para alternar tema
  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  // Função para atualizar classe no documento
  const updateDocumentClass = (mode: ThemeMode) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('theme-light', 'theme-dark');
      document.documentElement.classList.add(`theme-${mode}`);
      
      // Atualizar atributo data-theme para CSS
      document.documentElement.setAttribute('data-theme', mode);
    }
  };

  // Efeito para aplicar tema inicial e listener de mudanças do sistema
  useEffect(() => {
    updateDocumentClass(themeMode);

    // Só adicionar listener se window.matchMedia estiver disponível
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
          // Só atualiza se não há preferência salva
          const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
          if (!storedTheme) {
            const systemMode = e.matches ? 'dark' : 'light';
            setThemeModeState(systemMode);
            updateDocumentClass(systemMode);
          }
        };

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleSystemThemeChange);
          
          return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
          };
        }
      } catch (error) {
        // Ignorar erros de matchMedia (ex: ambiente de teste)
        console.warn('matchMedia não disponível:', error);
      }
    }
  }, [themeMode]);

  // Valor do contexto
  const value: ThemeContextType = {
    themeMode,
    toggleTheme,
    setThemeMode,
    isDarkMode: themeMode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
