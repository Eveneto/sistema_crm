/**
 * Testes unitários para Redux Member Management Actions
 * Cobre: fetchRoomMembers, addRoomMember, removeRoomMember, changeMemberRole
 */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  fetchRoomMembers,
  addRoomMember,
  removeRoomMember,
  changeMemberRole,
} from '../../redux/slices/chatSlice';
import api from '../../services/api';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock do axios
const mockAxios = new MockAdapter(api);

describe('Redux - Member Management Actions', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  afterEach(() => {
    mockAxios.reset();
  });

  const mockMembers = [
    {
      id: '1',
      user: {
        id: 1,
        username: 'admin',
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
        username: 'user',
        email: 'user@test.com',
        full_name: 'Regular User',
        first_name: 'Regular',
        last_name: 'User',
      },
      role: 'member',
      is_active: true,
      joined_at: '2025-01-02T10:00:00Z',
      is_online: false,
      unread_count: 0,
    },
  ];

  describe('fetchRoomMembers', () => {
    it('should fetch room members successfully', async () => {
      const roomId = 'room-1';
      mockAxios.onGet(`/chat/rooms/${roomId}/members/`).reply(200, mockMembers);

      const store = mockStore({});
      
      await store.dispatch(fetchRoomMembers(roomId) as any);

      const actions = store.getActions();
      expect(actions[0].type).toBe('chat/fetchRoomMembers/pending');
      expect(actions[1].type).toBe('chat/fetchRoomMembers/fulfilled');
      expect(actions[1].payload).toEqual({
        roomId,
        members: mockMembers,
      });
    });

    it('should handle fetch members error', async () => {
      const roomId = 'room-1';
      mockAxios.onGet(`/chat/rooms/${roomId}/members/`).reply(500, {
        error: 'Internal Server Error',
      });

      const store = mockStore({});

      try {
        await store.dispatch(fetchRoomMembers(roomId) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[0].type).toBe('chat/fetchRoomMembers/pending');
      expect(actions[1].type).toBe('chat/fetchRoomMembers/rejected');
    });

    it('should handle 404 error', async () => {
      const roomId = 'nonexistent';
      mockAxios.onGet(`/chat/rooms/${roomId}/members/`).reply(404);

      const store = mockStore({});

      try {
        await store.dispatch(fetchRoomMembers(roomId) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[1].type).toBe('chat/fetchRoomMembers/rejected');
    });
  });

  describe('addRoomMember', () => {
    it('should add member to room successfully', async () => {
      const roomId = 'room-1';
      const userId = '3';
      const role = 'member';

      const newMember = {
        id: '3',
        user: {
          id: 3,
          username: 'newuser',
          email: 'new@test.com',
          full_name: 'New User',
          first_name: 'New',
          last_name: 'User',
        },
        role: 'member',
        is_active: true,
        joined_at: '2025-01-03T10:00:00Z',
        is_online: false,
        unread_count: 0,
      };

      mockAxios.onPost(`/chat/rooms/${roomId}/add_member/`).reply(200, {
        member: newMember,
        message: 'Member added successfully',
      });

      const store = mockStore({});

      await store.dispatch(addRoomMember({ roomId, userId, role }) as any);

      const actions = store.getActions();
      expect(actions[0].type).toBe('chat/addRoomMember/pending');
      expect(actions[1].type).toBe('chat/addRoomMember/fulfilled');
      expect(actions[1].payload).toEqual({
        roomId,
        member: newMember,
      });
    });

    it('should handle add member error', async () => {
      const roomId = 'room-1';
      const userId = '999';
      const role = 'member';

      mockAxios.onPost(`/chat/rooms/${roomId}/add_member/`).reply(400, {
        error: 'User not found',
      });

      const store = mockStore({});

      try {
        await store.dispatch(addRoomMember({ roomId, userId, role }) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[1].type).toBe('chat/addRoomMember/rejected');
    });

    it('should handle permission denied', async () => {
      const roomId = 'room-1';
      const userId = '3';
      const role = 'admin';

      mockAxios.onPost(`/chat/rooms/${roomId}/add_member/`).reply(403, {
        error: 'Permission denied',
      });

      const store = mockStore({});

      try {
        await store.dispatch(addRoomMember({ roomId, userId, role }) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[1].type).toBe('chat/addRoomMember/rejected');
    });
  });

  describe('removeRoomMember', () => {
    it('should remove member from room successfully', async () => {
      const roomId = 'room-1';
      const userId = '2';

      mockAxios.onPost(`/chat/rooms/${roomId}/remove_member/`).reply(200, {
        message: 'Member removed successfully',
      });

      const store = mockStore({});

      await store.dispatch(removeRoomMember({ roomId, userId }) as any);

      const actions = store.getActions();
      expect(actions[0].type).toBe('chat/removeRoomMember/pending');
      expect(actions[1].type).toBe('chat/removeRoomMember/fulfilled');
      expect(actions[1].payload).toEqual({
        roomId,
        userId,
      });
    });

    it('should handle remove member error', async () => {
      const roomId = 'room-1';
      const userId = '999';

      mockAxios.onPost(`/chat/rooms/${roomId}/remove_member/`).reply(404, {
        error: 'Member not found',
      });

      const store = mockStore({});

      try {
        await store.dispatch(removeRoomMember({ roomId, userId }) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[1].type).toBe('chat/removeRoomMember/rejected');
    });

    it('should handle cannot remove admin error', async () => {
      const roomId = 'room-1';
      const userId = '1'; // Admin user

      mockAxios.onPost(`/chat/rooms/${roomId}/remove_member/`).reply(400, {
        error: 'Cannot remove admin',
      });

      const store = mockStore({});

      try {
        await store.dispatch(removeRoomMember({ roomId, userId }) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[1].type).toBe('chat/removeRoomMember/rejected');
    });
  });

  describe('changeMemberRole', () => {
    it('should change member role successfully', async () => {
      const roomId = 'room-1';
      const userId = '2';
      const role = 'moderator';

      const updatedMember = {
        ...mockMembers[1],
        role: 'moderator',
      };

      mockAxios.onPost(`/chat/rooms/${roomId}/change_member_role/`).reply(200, {
        member: updatedMember,
        message: 'Role updated successfully',
      });

      const store = mockStore({});

      await store.dispatch(changeMemberRole({ roomId, userId, role }) as any);

      const actions = store.getActions();
      expect(actions[0].type).toBe('chat/changeMemberRole/pending');
      expect(actions[1].type).toBe('chat/changeMemberRole/fulfilled');
      expect(actions[1].payload).toEqual({
        roomId,
        member: updatedMember,
      });
    });

    it('should handle change role error', async () => {
      const roomId = 'room-1';
      const userId = '999';
      const role = 'admin';

      mockAxios.onPost(`/chat/rooms/${roomId}/change_member_role/`).reply(404, {
        error: 'Member not found',
      });

      const store = mockStore({});

      try {
        await store.dispatch(changeMemberRole({ roomId, userId, role }) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[1].type).toBe('chat/changeMemberRole/rejected');
    });

    it('should handle permission denied for role change', async () => {
      const roomId = 'room-1';
      const userId = '2';
      const role = 'admin';

      mockAxios.onPost(`/chat/rooms/${roomId}/change_member_role/`).reply(403, {
        error: 'Only admins can change roles',
      });

      const store = mockStore({});

      try {
        await store.dispatch(changeMemberRole({ roomId, userId, role }) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[1].type).toBe('chat/changeMemberRole/rejected');
    });

    it('should handle invalid role error', async () => {
      const roomId = 'room-1';
      const userId = '2';
      const role = 'invalid_role';

      mockAxios.onPost(`/chat/rooms/${roomId}/change_member_role/`).reply(400, {
        error: 'Invalid role',
      });

      const store = mockStore({});

      try {
        await store.dispatch(changeMemberRole({ roomId, userId, role }) as any);
      } catch (error) {
        // Error expected
      }

      const actions = store.getActions();
      expect(actions[1].type).toBe('chat/changeMemberRole/rejected');
    });
  });

  describe('Integração de Ações', () => {
    it('should add and then remove member', async () => {
      const roomId = 'room-1';
      const userId = '3';

      const newMember = {
        id: '3',
        user: { id: 3, username: 'tempuser', email: 'temp@test.com', full_name: 'Temp', first_name: 'T', last_name: 'U' },
        role: 'member',
        is_active: true,
        joined_at: '2025-01-03T10:00:00Z',
        is_online: false,
        unread_count: 0,
      };

      // Add member
      mockAxios.onPost(`/chat/rooms/${roomId}/add_member/`).reply(200, {
        member: newMember,
      });

      const store = mockStore({});
      await store.dispatch(addRoomMember({ roomId, userId, role: 'member' }) as any);

      const addActions = store.getActions();
      expect(addActions[1].type).toBe('chat/addRoomMember/fulfilled');

      // Remove member
      mockAxios.onPost(`/chat/rooms/${roomId}/remove_member/`).reply(200, {
        message: 'Member removed',
      });

      await store.dispatch(removeRoomMember({ roomId, userId }) as any);

      const allActions = store.getActions();
      const removeActions = allActions.filter(a => a.type.includes('removeRoomMember'));
      expect(removeActions[1].type).toBe('chat/removeRoomMember/fulfilled');
    });

    it('should add member and change their role', async () => {
      const roomId = 'room-1';
      const userId = '3';

      const newMember = {
        id: '3',
        user: { id: 3, username: 'newuser', email: 'new@test.com', full_name: 'New', first_name: 'N', last_name: 'U' },
        role: 'member',
        is_active: true,
        joined_at: '2025-01-03T10:00:00Z',
        is_online: false,
        unread_count: 0,
      };

      // Add as member
      mockAxios.onPost(`/chat/rooms/${roomId}/add_member/`).reply(200, {
        member: newMember,
      });

      const store = mockStore({});
      await store.dispatch(addRoomMember({ roomId, userId, role: 'member' }) as any);

      // Promote to moderator
      const updatedMember = { ...newMember, role: 'moderator' };
      mockAxios.onPost(`/chat/rooms/${roomId}/change_member_role/`).reply(200, {
        member: updatedMember,
      });

      await store.dispatch(changeMemberRole({ roomId, userId, role: 'moderator' }) as any);

      const allActions = store.getActions();
      const roleActions = allActions.filter(a => a.type.includes('changeMemberRole'));
      expect(roleActions[1].type).toBe('chat/changeMemberRole/fulfilled');
      expect(roleActions[1].payload.member.role).toBe('moderator');
    });
  });
});
