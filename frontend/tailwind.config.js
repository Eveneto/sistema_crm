/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crm-primary': 'var(--crm-primary)',
        'crm-primary-dark': 'var(--crm-primary-dark)',
        'crm-primary-light': 'var(--crm-primary-light)',
        'crm-accent': 'var(--crm-accent)',
        'crm-accent-hover': 'var(--crm-accent-hover)',
        'crm-bg-primary': 'var(--crm-bg-primary)',
        'crm-bg-secondary': 'var(--crm-bg-secondary)',
        'crm-bg-tertiary': 'var(--crm-bg-tertiary)',
        'crm-bg-elevated': 'var(--crm-bg-elevated)',
        'crm-bg-overlay': 'var(--crm-bg-overlay)',
        'crm-text-primary': 'var(--crm-text-primary)',
        'crm-text-secondary': 'var(--crm-text-secondary)',
        'crm-text-tertiary': 'var(--crm-text-tertiary)',
        'crm-text-muted': 'var(--crm-text-muted)',
        'crm-border': 'var(--crm-border)',
        'crm-border-light': 'var(--crm-border-light)',
        'crm-border-focus': 'var(--crm-border-focus)',
        'crm-success': 'var(--crm-success)',
        'crm-warning': 'var(--crm-warning)',
        'crm-error': 'var(--crm-error)',
        'crm-info': 'var(--crm-info)',
      },
      spacing: {
        'crm-1': 'var(--crm-space-1)',
        'crm-2': 'var(--crm-space-2)',
        'crm-3': 'var(--crm-space-3)',
        'crm-4': 'var(--crm-space-4)',
        'crm-6': 'var(--crm-space-6)',
        'crm-8': 'var(--crm-space-8)',
      },
      fontSize: {
        'crm-xs': 'var(--crm-font-size-xs)',
        'crm-sm': 'var(--crm-font-size-sm)',
        'crm-base': 'var(--crm-font-size-base)',
        'crm-lg': 'var(--crm-font-size-lg)',
        'crm-xl': 'var(--crm-font-size-xl)',
        'crm-2xl': 'var(--crm-font-size-2xl)',
        'crm-3xl': 'var(--crm-font-size-3xl)',
      },
      fontFamily: {
        'crm-primary': 'var(--crm-font-primary)',
        'crm-mono': 'var(--crm-font-mono)',
      },
      fontWeight: {
        'crm-normal': 'var(--crm-font-weight-normal)',
        'crm-medium': 'var(--crm-font-weight-medium)',
        'crm-semibold': 'var(--crm-font-weight-semibold)',
        'crm-bold': 'var(--crm-font-weight-bold)',
      },
      borderRadius: {
        'crm-sm': 'var(--crm-radius-sm)',
        'crm-md': 'var(--crm-radius-md)',
        'crm-lg': 'var(--crm-radius-lg)',
        'crm-xl': 'var(--crm-radius-xl)',
        'crm-full': 'var(--crm-radius-full)',
      },
      boxShadow: {
        'crm-sm': 'var(--crm-shadow-sm)',
        'crm-md': 'var(--crm-shadow-md)',
        'crm-lg': 'var(--crm-shadow-lg)',
        'crm-xl': 'var(--crm-shadow-xl)',
      },
      transitionDuration: {
        'crm-fast': 'var(--crm-transition-fast)',
        'crm-base': 'var(--crm-transition-base)',
        'crm-slow': 'var(--crm-transition-slow)',
      },
      screens: {
        'crm-mobile': '480px',
        'crm-tablet': '768px',
        'crm-desktop': '1024px',
        'crm-large': '1280px',
        'crm-xl': '1536px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/aspect-ratio'),
    function({ addUtilities }) {
      return addUtilities({
        '.crm-gradient-primary': {
          'background': 'linear-gradient(135deg, var(--crm-primary) 0%, var(--crm-primary-light) 100%)',
        },
        '.crm-gradient-accent': {
          'background': 'linear-gradient(135deg, var(--crm-accent) 0%, #3b82f6 100%)',
        },
        '.crm-gradient-success': {
          'background': 'linear-gradient(135deg, var(--crm-success) 0%, #10b981 100%)',
        },
        '.crm-glass-effect': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.crm-glow-primary': {
          'box-shadow': '0 0 20px rgba(59, 130, 246, 0.3)',
        },
        '.crm-glow-success': {
          'box-shadow': '0 0 20px rgba(16, 185, 129, 0.3)',
        },
        '.crm-fade-in': {
          'animation': 'crm-fade-in 0.5s ease-out',
        },
        '.crm-slide-up': {
          'animation': 'crm-slide-up 0.6s ease-out',
        },
        '.crm-bounce-in': {
          'animation': 'crm-bounce-in 0.8s ease-out',
        },
        '.crm-pulse-gentle': {
          'animation': 'crm-pulse-gentle 2s infinite',
        },
        '.crm-hover-lift': {
          'transition': 'all var(--crm-transition-base)',
        },
        '.crm-hover-lift:hover': {
          'transform': 'translateY(-4px) scale(1.02)',
          'box-shadow': 'var(--crm-shadow-lg)',
        },
        '.crm-metric-card': {
          'background': 'linear-gradient(135deg, var(--crm-bg-elevated) 0%, rgba(255,255,255,0.05) 100%)',
          'border': '1px solid var(--crm-border)',
          'border-radius': 'var(--crm-radius-xl)',
          'padding': 'var(--crm-space-6)',
          'position': 'relative',
          'overflow': 'hidden',
          'transition': 'all var(--crm-transition-base)',
        },
        '.crm-metric-card::before': {
          'content': "''",
          'position': 'absolute',
          'top': '0',
          'left': '0',
          'right': '0',
          'height': '3px',
          'background': 'linear-gradient(90deg, var(--crm-primary), var(--crm-accent))',
        },
        '.crm-chat-container': {
          'display': 'flex',
          'height': 'calc(100vh - 64px)', /* Altura da tela menos header */
          'background': 'var(--crm-bg-primary)',
        },
        '.crm-chat-sidebar': {
          'width': '320px',
          'background': 'var(--crm-bg-secondary)',
          'border-right': '1px solid var(--crm-border)',
          'display': 'flex',
          'flex-direction': 'column',
          'transition': 'width var(--crm-transition-base)',
        },
        '.crm-chat-sidebar-collapsed': {
          'width': '0px',
          'overflow': 'hidden',
        },
        '.crm-chat-sidebar-header': {
          'border-bottom': '1px solid var(--crm-border)',
          'background': 'var(--crm-bg-secondary)',
        },
        '.crm-chat-conversations': {
          'flex': '1',
          'overflow-y': 'auto',
        },
        '.crm-chat-conversation-item': {
          'cursor': 'pointer',
          'transition': 'background-color var(--crm-transition-fast)',
        },
        '.crm-chat-conversation-item:hover': {
          'background': 'var(--crm-bg-tertiary)',
        },
        '.crm-chat-conversation-active': {
          'background': 'var(--crm-primary)',
          'color': 'white',
        },
        '.crm-chat-conversation-active *': {
          'color': 'white !important',
        },
        '.crm-chat-avatar': {
          'width': '48px',
          'height': '48px',
          'border-radius': '50%',
          'background': 'var(--crm-primary)',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'color': 'white',
          'font-weight': 'var(--crm-font-semibold)',
          'flex-shrink': '0',
        },
        '.crm-chat-unread-badge': {
          'position': 'absolute',
          'top': '-4px',
          'right': '-4px',
        },
        '.crm-chat-main': {
          'flex': '1',
          'display': 'flex',
          'flex-direction': 'column',
          'background': 'var(--crm-bg-primary)',
        },
        '.crm-chat-header': {
          'background': 'var(--crm-bg-secondary)',
          'border-bottom': '1px solid var(--crm-border)',
        },
        '.crm-chat-room-avatar': {
          'width': '40px',
          'height': '40px',
          'border-radius': '50%',
          'background': 'var(--crm-primary)',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'color': 'white',
          'font-weight': 'var(--crm-font-semibold)',
        },
        '.crm-chat-messages-area': {
          'flex': '1',
          'display': 'flex',
          'flex-direction': 'column',
          'overflow': 'hidden',
        },
        '.crm-chat-messages': {
          'flex': '1',
          'overflow-y': 'auto',
          'padding': 'var(--crm-space-4)',
          'display': 'flex',
          'flex-direction': 'column',
        },
        '.crm-chat-messages-list': {
          'display': 'flex',
          'flex-direction': 'column',
          'gap': 'var(--crm-space-1)',
        },
        '.crm-chat-input-area': {
          'background': 'var(--crm-bg-secondary)',
          'border-top': '1px solid var(--crm-border)',
          'padding': 'var(--crm-space-4)',
        },
        '.crm-chat-search-input': {
          'border-radius': 'var(--crm-radius-xl)',
          'border': '1px solid var(--crm-border)',
        },
        '.crm-dashboard-grid': {
          'display': 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))',
          'gap': '1.5rem',
          'margin-bottom': '2rem',
        },
        '.crm-dashboard-stats': {
          'display': 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))',
          'gap': '1.5rem',
          'margin-bottom': '2rem',
        },
        '.crm-card-grid': {
          'display': 'grid',
          'gap': '1.5rem',
          'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))',
        },
        '.crm-flex-center': {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        '.crm-flex-between': {
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
        },
        '.crm-text-gradient': {
          'background': 'linear-gradient(135deg, #ffffff, var(--crm-accent))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      });
    },
  ],
  keyframes: {
    'crm-fade-in': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    'crm-slide-up': {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'crm-bounce-in': {
      '0%': { transform: 'scale(0.3)', opacity: '0' },
      '50%': { transform: 'scale(1.05)' },
      '70%': { transform: 'scale(0.9)' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    'crm-pulse-gentle': {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.7' },
    },
  },
}
