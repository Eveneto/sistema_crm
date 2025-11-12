/**
 * Testes unitários para MembersModal component
 * Cobre: renderização, busca, CRUD de membros, permissões, estados
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';

import MembersModal from '../../components/chat/MembersModal';
import * as chatSlice from '../../redux/slices/chatSlice';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock das actions do Redux
jest.mock('../../redux/slices/chatSlice', () => ({
  ...jest.requireActual('../../redux/slices/chatSlice'),
  fetchRoomMembers: jest.fn(),
  addRoomMember: jest.fn(),
  removeRoomMember: jest.fn(),
  changeMemberRole: jest.fn(),
}));

// Mock do Ant Design message
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('MembersModal Component', () => {
  const mockMembers = [
    {
      id: '1',
      user: {
        id: 1,
        username: 'admin_user',
        email: 'admin@test.com',
        full_name: 'Admin User',
        first_name: 'Admin',
        last_name: 'User',
      },
      role: 'admin',
      is_active: true,
      joined_at: '2025-01-01T10:00:00Z',
      is_online: true,
      unread_count: 0,
    },
    {
      id: '2',
      user: {
        id: 2,
        username: 'moderator_user',
        email: 'mod@test.com',
        full_name: 'Moderator User',
        first_name: 'Moderator',
        last_name: 'User',
      },
      role: 'moderator',
      is_active: true,
      joined_at: '2025-01-02T10:00:00Z',
      is_online: false,
      unread_count: 0,
    },
    {
      id: '3',
      user: {
        id: 3,
        username: 'regular_user',
        email: 'user@test.com',
        full_name: 'Regular User',
        first_name: 'Regular',
        last_name: 'User',
      },
      role: 'member',
      is_active: true,
      joined_at: '2025-01-03T10:00:00Z',
      is_online: true,
      unread_count: 0,
    },
  ];

  const mockCurrentRoom = {
    id: 'room-1',
    name: 'Test Room',
    room_type: 'group',
    participant_count: 3,
    members: mockMembers,
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
    unread_count: 0,
  };

  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock retornando promises resolvidas
    (chatSlice.fetchRoomMembers as jest.Mock).mockReturnValue({
      type: 'chat/fetchRoomMembers',
      payload: Promise.resolve({ members: mockMembers }),
    });
    (chatSlice.addRoomMember as jest.Mock).mockReturnValue({
      type: 'chat/addRoomMember',
      payload: Promise.resolve({ member: mockMembers[0] }),
    });
    (chatSlice.removeRoomMember as jest.Mock).mockReturnValue({
      type: 'chat/removeRoomMember',
      payload: Promise.resolve({ userId: '3' }),
    });
    (chatSlice.changeMemberRole as jest.Mock).mockReturnValue({
      type: 'chat/changeMemberRole',
      payload: Promise.resolve({ member: mockMembers[0] }),
    });
  });

  const renderWithStore = (storeState: any, props: any = {}) => {
    store = mockStore(storeState);
    return render(
      <Provider store={store}>
        <MembersModal
          visible={true}
          onClose={jest.fn()}
          roomId="room-1"
          {...props}
        />
      </Provider>
    );
  };

  describe('Renderização Básica', () => {
    it('should render modal when visible is true', () => {
      const storeState = {
        chat: {
          currentRoom: mockCurrentRoom,
          loadingMembers: false,
        },
        auth: {
          user: { id: 1, email: 'admin@test.com' },
        },
      };

      renderWithStore(storeState);

      expect(screen.getByText('Gerenciar Membros')).toBeInTheDocument();
    });

    it('should not render when visible is false', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      render(
        <Provider store={mockStore(storeState)}>
          <MembersModal visible={false} onClose={jest.fn()} roomId="room-1" />
        </Provider>
      );

      expect(screen.queryByText('Gerenciar Membros')).not.toBeInTheDocument();
    });

    it('should display list of members', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      expect(screen.getByText('admin_user')).toBeInTheDocument();
      expect(screen.getByText('moderator_user')).toBeInTheDocument();
      expect(screen.getByText('regular_user')).toBeInTheDocument();
    });

    it('should show member count in title', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      expect(screen.getByText(/3 membros/i)).toBeInTheDocument();
    });

    it('should display role badges correctly', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Moderador')).toBeInTheDocument();
      expect(screen.getByText('Membro')).toBeInTheDocument();
    });

    it('should show online status indicators', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      const { container } = renderWithStore(storeState);

      // Verificar indicadores de online/offline
      const onlineIndicators = container.querySelectorAll('.ant-badge-status-success');
      const offlineIndicators = container.querySelectorAll('.ant-badge-status-default');

      expect(onlineIndicators.length).toBeGreaterThan(0);
      expect(offlineIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Busca de Membros', () => {
    it('should render search input', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      expect(screen.getByPlaceholderText(/buscar membro/i)).toBeInTheDocument();
    });

    it('should filter members by username', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      const searchInput = screen.getByPlaceholderText(/buscar membro/i);
      await user.type(searchInput, 'admin');

      await waitFor(() => {
        expect(screen.getByText('admin_user')).toBeInTheDocument();
        expect(screen.queryByText('moderator_user')).not.toBeInTheDocument();
        expect(screen.queryByText('regular_user')).not.toBeInTheDocument();
      });
    });

    it('should filter members by email', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      const searchInput = screen.getByPlaceholderText(/buscar membro/i);
      await user.type(searchInput, 'mod@test.com');

      await waitFor(() => {
        expect(screen.getByText('moderator_user')).toBeInTheDocument();
        expect(screen.queryByText('admin_user')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when no results', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      const searchInput = screen.getByPlaceholderText(/buscar membro/i);
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/nenhum membro encontrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Adicionar Membro - Admin', () => {
    it('should show add member button for admin', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } }, // Admin user
      };

      renderWithStore(storeState);

      expect(screen.getByText(/adicionar membro/i)).toBeInTheDocument();
    });

    it('should open add member form on button click', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      const addButton = screen.getByText(/adicionar membro/i);
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email ou id do usuário/i)).toBeInTheDocument();
      });
    });

    it('should allow selecting member role', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      const addButton = screen.getByText(/adicionar membro/i);
      await user.click(addButton);

      await waitFor(() => {
        const roleSelect = screen.getByText(/membro/i);
        expect(roleSelect).toBeInTheDocument();
      });
    });

    it('should dispatch addRoomMember action on submit', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      // Abrir formulário
      const addButton = screen.getByText(/adicionar membro/i);
      await user.click(addButton);

      // Preencher email
      const emailInput = screen.getByPlaceholderText(/email ou id do usuário/i);
      await user.type(emailInput, '999');

      // Submeter
      const submitButton = screen.getByRole('button', { name: /adicionar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(store.getActions()).toContainEqual(
          expect.objectContaining({
            type: expect.stringContaining('addRoomMember'),
          })
        );
      });
    });
  });

  describe('Remover Membro - Admin', () => {
    it('should show remove button for admin', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      const { container } = renderWithStore(storeState);

      // Verificar se há botões de remover (CloseOutlined)
      const removeButtons = container.querySelectorAll('.anticon-close');
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    it('should show confirmation popconfirm on remove click', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      const { container } = renderWithStore(storeState);

      // Clicar no botão remover
      const removeButton = container.querySelector('.anticon-close') as HTMLElement;
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText(/tem certeza que deseja remover/i)).toBeInTheDocument();
      });
    });

    it('should dispatch removeRoomMember on confirm', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      const { container } = renderWithStore(storeState);

      // Clicar remover
      const removeButton = container.querySelector('.anticon-close') as HTMLElement;
      await user.click(removeButton);

      // Confirmar
      const confirmButton = screen.getByText(/sim/i);
      await user.click(confirmButton);

      await waitFor(() => {
        expect(store.getActions()).toContainEqual(
          expect.objectContaining({
            type: expect.stringContaining('removeRoomMember'),
          })
        );
      });
    });
  });

  describe('Alterar Papel - Admin', () => {
    it('should show role dropdown for admin', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      const { container } = renderWithStore(storeState);

      // Verificar se há selects de papel
      const roleSelects = container.querySelectorAll('.ant-select');
      expect(roleSelects.length).toBeGreaterThan(0);
    });

    it('should dispatch changeMemberRole on role change', async () => {
      const user = userEvent.setup();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      const { container } = renderWithStore(storeState);

      // Clicar no select de papel
      const roleSelect = container.querySelector('.ant-select') as HTMLElement;
      await user.click(roleSelect);

      // Selecionar nova opção
      await waitFor(() => {
        const moderatorOption = screen.getByText(/moderador/i);
        user.click(moderatorOption);
      });

      await waitFor(() => {
        expect(store.getActions()).toContainEqual(
          expect.objectContaining({
            type: expect.stringContaining('changeMemberRole'),
          })
        );
      }, { timeout: 3000 });
    });
  });

  describe('Permissões - Moderador', () => {
    it('should allow moderator to add members', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 2 } }, // Moderator user
      };

      renderWithStore(storeState);

      expect(screen.getByText(/adicionar membro/i)).toBeInTheDocument();
    });

    it('should allow moderator to remove regular members', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 2 } },
      };

      const { container } = renderWithStore(storeState);

      // Deve ter botões de remover
      const removeButtons = container.querySelectorAll('.anticon-close');
      expect(removeButtons.length).toBeGreaterThan(0);
    });

    it('should not show role dropdown for moderator', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 2 } },
      };

      const { container } = renderWithStore(storeState);

      // Moderador não pode alterar papéis
      const roleSelects = container.querySelectorAll('.ant-select');
      expect(roleSelects.length).toBe(0);
    });
  });

  describe('Permissões - Membro Regular', () => {
    it('should show read-only view for member', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 3 } }, // Regular member
      };

      renderWithStore(storeState);

      // Lista de membros deve estar visível
      expect(screen.getByText('admin_user')).toBeInTheDocument();
    });

    it('should not show add member button for member', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 3 } },
      };

      renderWithStore(storeState);

      expect(screen.queryByText(/adicionar membro/i)).not.toBeInTheDocument();
    });

    it('should not show remove buttons for member', () => {
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 3 } },
      };

      const { container } = renderWithStore(storeState);

      const removeButtons = container.querySelectorAll('.anticon-close');
      expect(removeButtons.length).toBe(0);
    });
  });

  describe('Estados de Loading', () => {
    it('should show loading spinner while fetching members', () => {
      const storeState = {
        chat: {
          currentRoom: mockCurrentRoom,
          loadingMembers: true,
        },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
    });

    it('should show empty state when no members', () => {
      const storeState = {
        chat: {
          currentRoom: { ...mockCurrentRoom, members: [] },
        },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState);

      expect(screen.getByText(/nenhum membro/i)).toBeInTheDocument();
    });
  });

  describe('Fechamento do Modal', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onCloseMock = jest.fn();
      const storeState = {
        chat: { currentRoom: mockCurrentRoom },
        auth: { user: { id: 1 } },
      };

      renderWithStore(storeState, { onClose: onCloseMock });

      // Clicar no X do modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onCloseMock).toHaveBeenCalled();
    });
  });
});
