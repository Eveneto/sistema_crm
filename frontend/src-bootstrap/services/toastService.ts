interface ToastOptions {
  duration?: number;
  placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  options?: ToastOptions;
  timestamp: number;
}

class ToastService {
  private toasts: ToastItem[] = [];
  private listeners: Array<(toasts: ToastItem[]) => void> = [];
  private toastCounter = 0;

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  subscribe(listener: (toasts: ToastItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private addToast(type: ToastItem['type'], message: string, description?: string, options?: ToastOptions) {
    const id = `toast-${++this.toastCounter}`;
    const toast: ToastItem = {
      id,
      type,
      message,
      description,
      options,
      timestamp: Date.now()
    };

    this.toasts.push(toast);
    this.notifyListeners();

    const duration = options?.duration || (type === 'error' ? 6000 : 4500);
    setTimeout(() => {
      this.removeToast(id);
    }, duration);

    return id;
  }

  removeToast(id: string) {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
      this.notifyListeners();
    }
  }

  success(message: string, description?: string, options?: ToastOptions) {
    return this.addToast('success', message, description, options);
  }

  error(message: string, description?: string, options?: ToastOptions) {
    return this.addToast('error', message, description, options);
  }

  warning(message: string, description?: string, options?: ToastOptions) {
    return this.addToast('warning', message, description, options);
  }

  info(message: string, description?: string, options?: ToastOptions) {
    return this.addToast('info', message, description, options);
  }

  chatMessage(userName: string, message: string, roomName?: string) {
    const title = roomName ? `Nova mensagem em ${roomName}` : 'Nova mensagem';
    const description = `${userName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`;
    
    this.info(title, description, {
      duration: 3000
    });
  }

  connectionStatus(connected: boolean) {
    if (connected) {
      this.success('Conectado', 'Conexão com o servidor estabelecida', {
        duration: 2000
      });
    } else {
      this.warning('Desconectado', 'Tentando reconectar...', {
        duration: 0
      });
    }
  }

  fileUpload(progress: number, fileName: string) {
    if (progress < 100) {
      this.info('Upload em progresso', `${fileName} - ${progress}%`, {
        duration: 0
      });
    } else {
      this.success('Upload concluído', `${fileName} foi enviado com sucesso`, {
        duration: 3000
      });
    }
  }

  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  getToasts() {
    return [...this.toasts];
  }
}

const toastService = new ToastService();
export default toastService;
export type { ToastItem, ToastOptions };
