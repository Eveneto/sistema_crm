/**
 * Notification Service
 * 
 * Gerencia notificações desktop do navegador
 * Compatível com Notification API moderna
 */

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  silent?: boolean;
  requireInteraction?: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private notificationSound?: HTMLAudioElement;

  private constructor() {
    this.checkPermission();
    this.loadNotificationSound();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Verifica se o navegador suporta notificações
   */
  public isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Verifica permissão atual
   */
  private checkPermission(): void {
    if (this.isSupported()) {
      this.permission = Notification.permission as NotificationPermission;
    }
  }

  /**
   * Obtém permissão atual
   */
  public getPermission(): NotificationPermission {
    this.checkPermission();
    return this.permission;
  }

  /**
   * Solicita permissão ao usuário
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notificações não são suportadas neste navegador');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission as NotificationPermission;
      return this.permission;
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return 'denied';
    }
  }

  /**
   * Carrega som de notificação
   */
  private loadNotificationSound(): void {
    // Som simples de notificação (pode ser substituído por arquivo real)
    // Por enquanto, usaremos beep nativo se disponível
    try {
      this.notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjOJ0fPTgjMGHm7A7+OZUQ8PVqzn77BZFwlIouHyvmwiCDKIzvPUgjQGHm++7+OZUQ8QV6zn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUQ8PVqzn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUQ8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUQ8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZUg8PVqvn77BYFwlLo+Hxvm0iCDKIzvPUgjQGHm+97+OZ');
    } catch (error) {
      console.warn('Não foi possível carregar som de notificação:', error);
    }
  }

  /**
   * Toca som de notificação
   */
  private playSound(): void {
    if (this.notificationSound) {
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch(err => {
        console.warn('Não foi possível tocar som de notificação:', err);
      });
    }
  }

  /**
   * Mostra notificação
   */
  public async showNotification(options: NotificationOptions): Promise<Notification | null> {
    // Verificar permissão
    if (this.permission !== 'granted') {
      console.warn('Permissão de notificação não concedida');
      return null;
    }

    // Verificar se documento está visível
    if (document.visibilityState === 'visible' && document.hasFocus()) {
      // Não mostrar notificação se usuário está vendo a página
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/logo192.png',
        tag: options.tag,
        data: options.data,
        silent: options.silent ?? false,
        requireInteraction: options.requireInteraction ?? false,
      });

      // Tocar som (se não for silencioso)
      if (!options.silent) {
        this.playSound();
      }

      // Auto-fechar após 5 segundos (se não requerer interação)
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
      return null;
    }
  }

  /**
   * Mostra notificação de nova mensagem
   */
  public async showMessageNotification(
    senderName: string,
    messageContent: string,
    roomId: string,
    roomName?: string
  ): Promise<Notification | null> {
    const title = roomName ? `${senderName} em ${roomName}` : senderName;
    const body = messageContent.length > 100 
      ? messageContent.substring(0, 100) + '...' 
      : messageContent;

    const notification = await this.showNotification({
      title,
      body,
      tag: `chat-room-${roomId}`,
      data: { roomId, type: 'message' },
      requireInteraction: false,
    });

    // Handler de click
    if (notification) {
      notification.onclick = () => {
        window.focus();
        // Navegar para a sala
        window.location.hash = `#/chat/${roomId}`;
        notification.close();
      };
    }

    return notification;
  }

  /**
   * Mostra notificação de menção
   */
  public async showMentionNotification(
    senderName: string,
    messageContent: string,
    roomId: string,
    roomName?: string
  ): Promise<Notification | null> {
    const title = `${senderName} mencionou você`;
    const subtitle = roomName ? `em ${roomName}` : '';
    const body = `${subtitle}\n${messageContent.substring(0, 80)}...`;

    const notification = await this.showNotification({
      title,
      body,
      tag: `chat-mention-${roomId}`,
      data: { roomId, type: 'mention' },
      requireInteraction: true, // Menções requerem atenção
    });

    // Handler de click
    if (notification) {
      notification.onclick = () => {
        window.focus();
        window.location.hash = `#/chat/${roomId}`;
        notification.close();
      };
    }

    return notification;
  }

  /**
   * Limpa todas as notificações de uma sala
   */
  public clearRoomNotifications(roomId: string): void {
    // Não há API para listar notificações, mas podemos usar tags
    // Notificações com mesma tag substituem as antigas automaticamente
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
export default notificationService;
