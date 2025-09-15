import React from 'react';
import { notification } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';

interface ToastOptions {
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastService {
  private defaultConfig = {
    placement: 'topRight' as const,
    duration: 4.5,
    style: {
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      backdropFilter: 'blur(20px)',
    }
  };

  success(message: string, description?: string, options?: ToastOptions) {
    notification.success({
      message,
      description,
      icon: React.createElement(CheckCircleOutlined, { style: { color: '#52c41a' } }),
      ...this.defaultConfig,
      ...options,
      btn: options?.action ? React.createElement('button', {
        className: 'toast-action-btn',
        onClick: options.action.onClick
      }, options.action.label) : undefined,
    });
  }

  error(message: string, description?: string, options?: ToastOptions) {
    notification.error({
      message,
      description,
      icon: React.createElement(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      ...this.defaultConfig,
      duration: options?.duration || 6, // Erros ficam mais tempo
      ...options,
      btn: options?.action ? React.createElement('button', {
        className: 'toast-action-btn error',
        onClick: options.action.onClick
      }, options.action.label) : undefined,
    });
  }

  warning(message: string, description?: string, options?: ToastOptions) {
    notification.warning({
      message,
      description,
      icon: React.createElement(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
      ...this.defaultConfig,
      ...options,
      btn: options?.action ? React.createElement('button', {
        className: 'toast-action-btn warning',
        onClick: options.action.onClick
      }, options.action.label) : undefined,
    });
  }

  info(message: string, description?: string, options?: ToastOptions) {
    notification.info({
      message,
      description,
      icon: React.createElement(InfoCircleOutlined, { style: { color: '#1890ff' } }),
      ...this.defaultConfig,
      ...options,
      btn: options?.action ? React.createElement('button', {
        className: 'toast-action-btn info',
        onClick: options.action.onClick
      }, options.action.label) : undefined,
    });
  }

  // Notificações específicas do chat
  chatMessage(userName: string, message: string, roomName?: string) {
    this.info(
      `Nova mensagem${roomName ? ` em ${roomName}` : ''}`,
      `${userName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
      { duration: 3 }
    );
  }

  connectionStatus(connected: boolean) {
    if (connected) {
      this.success(
        'Conectado',
        'Conexão com o chat estabelecida com sucesso',
        { duration: 2 }
      );
    } else {
      this.error(
        'Desconectado',
        'Perdeu a conexão com o chat. Tentando reconectar...',
        { 
          duration: 0, // Não remove automaticamente
          action: {
            label: 'Reconectar',
            onClick: () => window.location.reload()
          }
        }
      );
    }
  }

  fileUpload(progress: number, fileName: string) {
    if (progress === 100) {
      this.success(
        'Upload concluído',
        `${fileName} foi enviado com sucesso`,
        { duration: 3 }
      );
    }
  }

  // Limpar todas as notificações
  clear() {
    notification.destroy();
  }
}

// Exportar instância singleton
export const Toast = new ToastService();
export default Toast;
