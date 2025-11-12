import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import notificationService, { NotificationPermission } from '../services/notificationService';

interface NotificationSettings {
  enabled: boolean;
  notifyAllMessages: boolean;
  notifyMentionsOnly: boolean;
  playSound: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  notifyAllMessages: true,
  notifyMentionsOnly: false,
  playSound: true,
};

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    // Carregar configurações do localStorage
    const saved = localStorage.getItem('crm_notification_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Verificar suporte e permissão inicial
  useEffect(() => {
    if (notificationService.isSupported()) {
      setPermission(notificationService.getPermission());
    }
  }, []);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem('crm_notification_settings', JSON.stringify(settings));
  }, [settings]);

  /**
   * Solicita permissão de notificação
   */
  const requestPermission = useCallback(async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    return newPermission;
  }, []);

  /**
   * Verifica se deve notificar uma mensagem
   */
  const shouldNotify = useCallback((
    messageContent: string,
    senderId: number,
    currentRoomId?: string
  ): boolean => {
    // Não notificar se desabilitado
    if (!settings.enabled) return false;

    // Não notificar se permissão negada
    if (permission !== 'granted') return false;

    // Não notificar mensagens próprias
    if (currentUser && senderId === currentUser.id) return false;

    // Se apenas menções
    if (settings.notifyMentionsOnly) {
      // Verificar se usuário foi mencionado
      const username = currentUser?.username || '';
      const isMentioned = messageContent.includes(`@${username}`);
      return isMentioned;
    }

    // Notificar todas as mensagens
    return settings.notifyAllMessages;
  }, [settings, permission, currentUser]);

  /**
   * Notifica nova mensagem
   */
  const notifyNewMessage = useCallback(async (
    senderName: string,
    messageContent: string,
    senderId: number,
    roomId: string,
    roomName?: string
  ) => {
    // Verificar se deve notificar
    if (!shouldNotify(messageContent, senderId, roomId)) {
      return;
    }

    // Verificar se é menção
    const username = currentUser?.username || '';
    const isMention = messageContent.includes(`@${username}`);

    // Mostrar notificação apropriada
    if (isMention) {
      await notificationService.showMentionNotification(
        senderName,
        messageContent,
        roomId,
        roomName
      );
    } else {
      await notificationService.showMessageNotification(
        senderName,
        messageContent,
        roomId,
        roomName
      );
    }
  }, [shouldNotify, currentUser]);

  /**
   * Atualiza configurações
   */
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Limpa notificações de uma sala
   */
  const clearRoomNotifications = useCallback((roomId: string) => {
    notificationService.clearRoomNotifications(roomId);
  }, []);

  return {
    // Estado
    permission,
    settings,
    isSupported: notificationService.isSupported(),
    
    // Ações
    requestPermission,
    updateSettings,
    notifyNewMessage,
    clearRoomNotifications,
  };
};

export default useNotifications;
