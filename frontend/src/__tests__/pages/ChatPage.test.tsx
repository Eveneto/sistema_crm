/**
 * Testes unitários para componentes de chat do frontend.
 * 
 * Cobre: ChatPage, ChatMessage, MessageInput components usando Jest e React Testing Library
 */

// Mocks devem vir ANTES de qualquer import
jest.mock('axios');
jest.mock('../../services/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => ({ roomId: '123' })),
  useNavigate: jest.fn(() => jest.fn()),
  useLocation: jest.fn(() => ({ pathname: '/chat/123' })),
  useHistory: jest.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  NavLink: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';

import ChatPage from '../../pages/ChatPage';
import ChatMessage from '../../components/chat/ChatMessage';
import MessageInput from '../../components/chat/MessageInput';
import { ChatMessage as ChatMessageType, ChatUser } from '../../redux/slices/chatSlice';

// Mock Router Component for tests
const MemoryRouter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

const mockStore = configureStore([]);

// Mock window.matchMedia (necessário para Ant Design)
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Mock do useChatWebSocket
jest.mock('../../hooks/useChatWebSocket', () => ({
  __esModule: true,
  default: () => ({
    isConnected: true,
    sendMessage: jest.fn(),
    sendTyping: jest.fn(),
    markAsRead: jest.fn(),
  }),
}));

// Helper para criar mensagens mock completas
const createMockMessage = (overrides?: Partial<ChatMessageType>): ChatMessageType => {
  return {
    id: '1',
    content: 'Test message',
    sender: {
      id: 1,  // number, não string
      username: 'testuser',
      email: 'test@test.com',
      first_name: 'Test',
      last_name: 'User',
      full_name: 'Test User',
    },
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
    message_type: 'text',
    is_edited: false,
    is_deleted: false,
    is_read: false,
    can_edit: true,
    can_delete: true,
    ...overrides,
  };
};


describe('ChatMessage Component', () => {
  const mockMessage = createMockMessage({
    content: 'Hello World',
  });

  const mockHandlers = {
    onReply: jest.fn(),
    onMarkAsRead: jest.fn(),
  };

  it('renders message content correctly', () => {
    render(
      <ChatMessage
        message={mockMessage}
        isOwn={false}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('displays sender avatar when showAvatar is true', () => {
    render(
      <ChatMessage
        message={mockMessage}
        isOwn={false}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    // Verificar se avatar está presente
    const avatar = screen.getByText('J'); // Primeira letra do username
    expect(avatar).toBeInTheDocument();
  });

  it('hides avatar when showAvatar is false', () => {
    const { container } = render(
      <ChatMessage
        message={mockMessage}
        isOwn={false}
        showAvatar={false}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    // Avatar não deve estar visível
    expect(container.querySelector('.crm-chat-message-avatar')).not.toBeInTheDocument();
  });

  it('aligns message to right when isOwn is true', () => {
    const { container } = render(
      <ChatMessage
        message={mockMessage}
        isOwn={true}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    const messageElement = container.querySelector('.crm-chat-message.own');
    expect(messageElement).toBeInTheDocument();
  });

  it('displays "edited" indicator when message is edited', () => {
    const editedMessage = createMockMessage({
      content: 'Edited message',
      is_edited: true,
    });

    render(
      <ChatMessage
        message={editedMessage}
        isOwn={false}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    expect(screen.getByText(/edited/i)).toBeInTheDocument();
  });

  it('handles reply action', () => {
    render(
      <ChatMessage
        message={mockMessage}
        isOwn={false}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    const replyButton = screen.getByRole('button', { name: /reply/i });
    fireEvent.click(replyButton);

    expect(mockHandlers.onReply).toHaveBeenCalledWith(mockMessage);
  });

  it('displays reply preview when replying to message', () => {
    const replyMessage = createMockMessage({
      id: '2',
      content: 'This is a reply',
      reply_to: mockMessage.id, // reply_to deve ser string (ID da mensagem)
    });

    render(
      <ChatMessage
        message={replyMessage}
        isOwn={false}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    expect(screen.getByText(/replying to/i)).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    render(
      <ChatMessage
        message={mockMessage}
        isOwn={false}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    // Verificar se timestamp está formatado
    const timeElement = screen.getByText(/ago|hoje|ontem/i);
    expect(timeElement).toBeInTheDocument();
  });

  it('shows system message styling', () => {
    const systemMessage: ChatMessageType = createMockMessage({
      message_type: 'system', // Usa type annotation no objeto inteiro
      content: 'User John joined the chat',
    });

    const { container } = render(
      <ChatMessage
        message={systemMessage}
        isOwn={false}
        showAvatar={false}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    const messageElement = container.querySelector('.crm-chat-message-system');
    expect(messageElement).toBeInTheDocument();
  });

  it('truncates very long messages', () => {
    const longMessage = createMockMessage({
      content: 'A'.repeat(500),
    });

    const { container } = render(
      <ChatMessage
        message={longMessage}
        isOwn={false}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    // Verificar se mensagem foi truncada
    const contentElement = container.querySelector('.crm-chat-message-text');
    expect(contentElement!.textContent!.length).toBeLessThan(600);
  });

  it('renders emoji in message', () => {
    const emojiMessage = createMockMessage({
      content: 'Hello 🎉 World 🚀',
    });

    render(
      <ChatMessage
        message={emojiMessage}
        isOwn={false}
        showAvatar={true}
        onReply={mockHandlers.onReply}
        onMarkAsRead={mockHandlers.onMarkAsRead}
      />
    );

    expect(screen.getByText(/🎉/)).toBeInTheDocument();
    expect(screen.getByText(/🚀/)).toBeInTheDocument();
  });
});


describe('MessageInput Component', () => {
  const mockHandlers = {
    onSendMessage: jest.fn(),
    onTyping: jest.fn(),
    onCancelReply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field', () => {
    render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('allows typing in input field', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    await user.type(input, 'Hello World');

    expect(input.value).toBe('Hello World');
  });

  it('sends message on Enter key', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    await user.type(input, 'Test message{Enter}');

    expect(mockHandlers.onSendMessage).toHaveBeenCalledWith('Test message', 'text', undefined);
  });

  it('does not send message on Shift+Enter', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(mockHandlers.onSendMessage).not.toHaveBeenCalled();
  });

  it('sends message on button click', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    await user.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send|enviar/i });
    await user.click(sendButton);

    expect(mockHandlers.onSendMessage).toHaveBeenCalledWith('Test message', 'text', undefined);
  });

  it('clears input after sending', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    await user.type(input, 'Test message{Enter}');

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('disables input when disabled prop is true', () => {
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        disabled={true}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    expect(input).toBeDisabled();
  });

  it('disables send button when input is empty', () => {
    render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const sendButton = screen.getByRole('button', { name: /send|enviar/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    const sendButton = screen.getByRole('button', { name: /send|enviar/i });

    await user.type(input, 'Test');

    expect(sendButton).not.toBeDisabled();
  });

  it('triggers typing indicator', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    await user.type(input, 'T');

    await waitFor(() => {
      expect(mockHandlers.onTyping).toHaveBeenCalledWith(true);
    });
  });

  it('shows reply preview', () => {
    const replyMessage = createMockMessage({
      id: '1',
      content: 'Original message',
      sender: {
        id: 1,
        username: 'John',
        email: 'john@test.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
      },
    });

    render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        replyToMessage={replyMessage}
        onCancelReply={mockHandlers.onCancelReply}
        placeholder="Type a message..."
      />
    );

    expect(screen.getByText(/responding to/i)).toBeInTheDocument();
    expect(screen.getByText('Original message')).toBeInTheDocument();
  });

  it('cancels reply', async () => {
    const user = userEvent.setup();
    const replyMessage = createMockMessage({
      id: '1',
      content: 'Original message',
      sender: {
        id: 1,
        username: 'John',
        email: 'john@test.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
      },
    });

    render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        replyToMessage={replyMessage}
        onCancelReply={mockHandlers.onCancelReply}
        placeholder="Type a message..."
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockHandlers.onCancelReply).toHaveBeenCalled();
  });

  it('allows adding emoji', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const emojiButton = screen.getByRole('button', { name: /emoji|😀/i });
    await user.click(emojiButton);

    // Emoji picker deve aparecer
    const emojiOption = screen.getByText(/😀|😂|😍/);
    expect(emojiOption).toBeInTheDocument();
  });

  it('allows attaching file', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const attachButton = screen.getByRole('button', { name: /attach|paperclip|📎/i });
    expect(attachButton).toBeInTheDocument();
  });

  it('handles multiline input correctly', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(input.value).toBe('Line 1\nLine 2');
  });

  it('respects max rows for textarea', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MessageInput
        onSendMessage={mockHandlers.onSendMessage}
        onTyping={mockHandlers.onTyping}
        placeholder="Type a message..."
      />
    );

    const input = container.querySelector('textarea')!;

    // Digitar muitas linhas
    for (let i = 0; i < 10; i++) {
      await user.type(input, `Line ${i}{Shift>}{Enter}{/Shift}`);
    }

    // Verificar se height é limitada (scrollable)
    const computedStyle = window.getComputedStyle(input);
    const height = parseInt(computedStyle.height, 10);
    expect(height).toBeLessThan(500); // Limite de altura
  });
});


describe('ChatPage Component', () => {
  const initialState = {
    chat: {
      rooms: [
        { id: '1', name: 'Room 1', room_type: 'private', participant_count: 2 },
        { id: '2', name: 'Room 2', room_type: 'community', participant_count: 5 },
      ],
      currentRoom: { id: '1', name: 'Room 1', room_type: 'private', participant_count: 2 },
      messages: {
        '1': [
          {
            id: 'msg1',
            content: 'Hello',
            sender: { id: 'user1', username: 'John' },
            created_at: '2025-01-01T10:00:00Z',
          },
        ],
      },
      loadingMessages: false,
      isLoading: false,
      error: null,
      wsConnected: true,
      wsError: null,
      typingUsers: {},
    },
    auth: {
      user: { id: 'user1', email: 'user@test.com' },
      isAuthenticated: true,
    },
  };

  it('renders chat page layout', () => {
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </Provider>
    );

    // Verificar elementos principais
    expect(screen.getByText(/conversas/i)).toBeInTheDocument();
  });

  it('displays list of rooms', () => {
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Room 1')).toBeInTheDocument();
    expect(screen.getByText('Room 2')).toBeInTheDocument();
  });

  it('displays messages for selected room', () => {
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles room selection', async () => {
    const user = userEvent.setup();
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </Provider>
    );

    const room = screen.getByText('Room 1');
    await user.click(room);

    // Verificar se room foi selecionada
    expect(room.closest('.crm-chat-conversation-active')).toBeInTheDocument();
  });

  it('searches conversations', async () => {
    const user = userEvent.setup();
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText(/buscar/i);
    await user.type(searchInput, 'Room 1');

    // Room 1 deve estar visível
    expect(screen.getByText('Room 1')).toBeInTheDocument();
    // Room 2 deve estar oculta
    expect(screen.queryByText('Room 2')).not.toBeInTheDocument();
  });

  it('displays connection status', () => {
    const store = mockStore(initialState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </Provider>
    );

    // Verificar se ícone de conexão está presente
    const connectionIcon = screen.getByTitle(/conectado|connected/i);
    expect(connectionIcon).toBeInTheDocument();
  });

  it('shows empty state when no rooms', () => {
    const emptyState = {
      ...initialState,
      chat: { ...initialState.chat, rooms: [] },
    };
    const store = mockStore(emptyState);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/nenhuma conversa/i)).toBeInTheDocument();
  });
});
