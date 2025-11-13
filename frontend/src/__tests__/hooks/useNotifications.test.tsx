/**
 * Testes unitários para Desktop Notifications
 * Cobre: permissão, exibição, configurações, interações
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useNotifications } from '../../hooks/useNotifications';
import notificationService from '../../services/notificationService';

const mockStore = configureStore([]);

// Mock do notificationService
jest.mock('../../services/notificationService', () => ({
  __esModule: true,
  default: {
    isSupported: jest.fn(() => true),
    getPermission: jest.fn(() => 'default'),
    requestPermission: jest.fn(),
    showMessageNotification: jest.fn(),
    showMentionNotification: jest.fn(),
    clearRoomNotifications: jest.fn(),
  },
}));

// Mock do Notification API
const mockNotification = {
  permission: 'default' as NotificationPermission,
  requestPermission: jest.fn(),
};

Object.defineProperty(global, 'Notification', {
  writable: true,
  value: jest.fn().mockImplementation((title, options) => ({
    title,
    ...options,
    close: jest.fn(),
    addEventListener: jest.fn(),
  })),
});

(global.Notification as any).permission = 'default';
(global.Notification as any).requestPermission = mockNotification.requestPermission;

describe('Desktop Notifications', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    store = mockStore({
      auth: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      },
    });

    // Reset mocks
    (notificationService.getPermission as jest.Mock).mockReturnValue('default');
    (notificationService.requestPermission as jest.Mock).mockResolvedValue('granted');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  describe('Verificação de Suporte', () => {
    it('should check if notifications are supported', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.isSupported).toBe(true);
      expect(notificationService.isSupported).toHaveBeenCalled();
    });

    it('should return false when notifications not supported', () => {
      (notificationService.isSupported as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('Status de Permissão', () => {
    it('should get initial permission status', () => {
      (notificationService.getPermission as jest.Mock).mockReturnValue('default');

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.permission).toBe('default');
    });

    it('should handle granted permission', () => {
      (notificationService.getPermission as jest.Mock).mockReturnValue('granted');

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.permission).toBe('granted');
    });

    it('should handle denied permission', () => {
      (notificationService.getPermission as jest.Mock).mockReturnValue('denied');

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.permission).toBe('denied');
    });
  });

  describe('Solicitar Permissão', () => {
    it('should request notification permission', async () => {
      (notificationService.requestPermission as jest.Mock).mockResolvedValue('granted');

      const { result } = renderHook(() => useNotifications(), { wrapper });

      let permission: string | undefined;
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(notificationService.requestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
      expect(result.current.permission).toBe('granted');
    });

    it('should update permission state after request', async () => {
      (notificationService.requestPermission as jest.Mock).mockResolvedValue('denied');

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.permission).toBe('denied');
    });
  });

  describe('Configurações de Notificação', () => {
    it('should load default settings', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.settings).toEqual({
        enabled: true,
        notifyAllMessages: true,
        notifyMentionsOnly: false,
        playSound: true,
      });
    });

    it('should load settings from localStorage', () => {
      const savedSettings = {
        enabled: false,
        notifyAllMessages: false,
        notifyMentionsOnly: true,
        playSound: false,
      };
      localStorage.setItem('crm_notification_settings', JSON.stringify(savedSettings));

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.settings).toEqual(savedSettings);
    });

    it('should update settings', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.updateSettings({ enabled: false });
      });

      expect(result.current.settings.enabled).toBe(false);
    });

    it('should save settings to localStorage', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.updateSettings({ playSound: false });
      });

      const saved = JSON.parse(localStorage.getItem('crm_notification_settings') || '{}');
      expect(saved.playSound).toBe(false);
    });

    it('should update multiple settings at once', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.updateSettings({
          notifyAllMessages: false,
          notifyMentionsOnly: true,
          playSound: false,
        });
      });

      expect(result.current.settings.notifyAllMessages).toBe(false);
      expect(result.current.settings.notifyMentionsOnly).toBe(true);
      expect(result.current.settings.playSound).toBe(false);
    });
  });

  describe('Exibição de Notificações', () => {
    beforeEach(() => {
      (notificationService.getPermission as jest.Mock).mockReturnValue('granted');
    });

    it('should show notification for new message', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await act(async () => {
        await result.current.notifyNewMessage(
          'John Doe',
          'Hello World',
          2, // Different user ID
          'room-1',
          'Test Room'
        );
      });

      expect(notificationService.showMessageNotification).toHaveBeenCalledWith(
        'John Doe',
        'Hello World',
        'room-1',
        'Test Room'
      );
    });

    it('should not show notification for own messages', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await act(async () => {
        await result.current.notifyNewMessage(
          'testuser',
          'My message',
          1, // Same as current user
          'room-1',
          'Test Room'
        );
      });

      expect(notificationService.showMessageNotification).not.toHaveBeenCalled();
    });

    it('should show mention notification when mentioned', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await act(async () => {
        await result.current.notifyNewMessage(
          'John Doe',
          'Hey @testuser check this out',
          2,
          'room-1',
          'Test Room'
        );
      });

      expect(notificationService.showMentionNotification).toHaveBeenCalledWith(
        'John Doe',
        'Hey @testuser check this out',
        'room-1',
        'Test Room'
      );
    });

    it('should not notify when permission is denied', async () => {
      (notificationService.getPermission as jest.Mock).mockReturnValue('denied');

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await act(async () => {
        await result.current.notifyNewMessage(
          'John Doe',
          'Hello',
          2,
          'room-1'
        );
      });

      expect(notificationService.showMessageNotification).not.toHaveBeenCalled();
    });

    it('should not notify when notifications disabled', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.updateSettings({ enabled: false });
      });

      await act(async () => {
        await result.current.notifyNewMessage(
          'John Doe',
          'Hello',
          2,
          'room-1'
        );
      });

      expect(notificationService.showMessageNotification).not.toHaveBeenCalled();
    });
  });

  describe('Filtro: Apenas Menções', () => {
    beforeEach(() => {
      (notificationService.getPermission as jest.Mock).mockReturnValue('granted');
    });

    it('should only notify on mentions when configured', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.updateSettings({
          notifyAllMessages: false,
          notifyMentionsOnly: true,
        });
      });

      // Mensagem sem menção
      await act(async () => {
        await result.current.notifyNewMessage(
          'John Doe',
          'Hello everyone',
          2,
          'room-1'
        );
      });

      expect(notificationService.showMessageNotification).not.toHaveBeenCalled();

      // Mensagem com menção
      await act(async () => {
        await result.current.notifyNewMessage(
          'John Doe',
          'Hey @testuser',
          2,
          'room-1'
        );
      });

      expect(notificationService.showMentionNotification).toHaveBeenCalled();
    });

    it('should not notify regular messages when mentions only', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.updateSettings({
          notifyAllMessages: false,
          notifyMentionsOnly: true,
        });
      });

      await act(async () => {
        await result.current.notifyNewMessage(
          'Jane Doe',
          'Regular message',
          3,
          'room-1'
        );
      });

      expect(notificationService.showMessageNotification).not.toHaveBeenCalled();
      expect(notificationService.showMentionNotification).not.toHaveBeenCalled();
    });
  });

  describe('Limpar Notificações', () => {
    it('should clear notifications for specific room', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.clearRoomNotifications('room-1');
      });

      expect(notificationService.clearRoomNotifications).toHaveBeenCalledWith('room-1');
    });
  });

  describe('Integração com Redux', () => {
    it('should use current user from Redux store', async () => {
      const customStore = mockStore({
        auth: {
          user: {
            id: 999,
            username: 'customuser',
            email: 'custom@example.com',
          },
        },
      });

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={customStore}>{children}</Provider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper: customWrapper });

      (notificationService.getPermission as jest.Mock).mockReturnValue('granted');

      // Mensagem do próprio usuário
      await act(async () => {
        await result.current.notifyNewMessage(
          'customuser',
          'My message',
          999, // Mesmo ID do Redux
          'room-1'
        );
      });

      expect(notificationService.showMessageNotification).not.toHaveBeenCalled();
    });

    it('should detect mentions using Redux username', async () => {
      const customStore = mockStore({
        auth: {
          user: {
            id: 1,
            username: 'alice',
            email: 'alice@example.com',
          },
        },
      });

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={customStore}>{children}</Provider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper: customWrapper });

      (notificationService.getPermission as jest.Mock).mockReturnValue('granted');

      await act(async () => {
        await result.current.notifyNewMessage(
          'Bob',
          'Hey @alice, check this',
          2,
          'room-1'
        );
      });

      expect(notificationService.showMentionNotification).toHaveBeenCalled();
    });
  });
});
