import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Types
export interface ChatUser {
  id: number;
  username: string;
  email?: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface ChatAttachment {
  id: string;
  file: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export interface ChatMessage {
  id: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  attachments?: ChatAttachment[];
  sender: ChatUser;
  reply_to?: string;
  reply_to_message?: {
    id: string;
    content: string;
    sender: string;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  is_read: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface ChatRoomMember {
  id: string;
  user: ChatUser;
  role: 'admin' | 'moderator' | 'member';
  is_active: boolean;
  joined_at: string;
  last_seen?: string;
  notifications_enabled: boolean;
  is_muted: boolean;
  is_online: boolean;
  unread_count: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  room_type: 'community' | 'private' | 'group';
  participant_count: number;
  last_message?: {
    id: string;
    content: string;
    sender: string;
    created_at: string;
    message_type: string;
  };
  unread_count: number;
  user_role?: 'admin' | 'moderator' | 'member';
  created_at: string;
  updated_at: string;
}

export interface ChatRoomDetail extends ChatRoom {
  members: ChatRoomMember[];
  created_by: ChatUser;
  community_info?: {
    id: string;
    name: string;
    description: string;
  };
  user_permissions: {
    can_send_messages: boolean;
    can_delete_messages: boolean;
    can_manage_members: boolean;
    role: string | null;
  };
  is_active: boolean;
  max_participants?: number;
  is_read_only: boolean;
}

export interface TypingUser {
  user_id: number;
  username: string;
  is_typing: boolean;
}

export interface OnlineUser {
  user_id: number;
  username: string;
  status: 'online' | 'offline';
  timestamp: string;
}

interface ChatState {
  // Chat rooms
  rooms: ChatRoom[];
  currentRoom: ChatRoomDetail | null;
  
  // Messages
  messages: { [roomId: string]: ChatMessage[] };
  hasMoreMessages: { [roomId: string]: boolean };
  loadingMessages: boolean;
  
  // UI states
  isLoading: boolean;
  error: string | null;
  
  // Real-time states
  typingUsers: { [roomId: string]: TypingUser[] };
  onlineUsers: { [roomId: string]: OnlineUser[] };
  
  // WebSocket
  wsConnected: boolean;
  wsError: string | null;
}

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: {},
  hasMoreMessages: {},
  loadingMessages: false,
  isLoading: false,
  error: null,
  typingUsers: {},
  onlineUsers: {},
  wsConnected: false,
  wsError: null,
};

// Async thunks
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchRooms',
  async () => {
    console.log('🔍 FETCHING CHAT ROOMS...');
    try {
      const response = await api.get('/chat/rooms/');
      console.log('✅ CHAT ROOMS RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CHAT ROOMS ERROR:', error);
      throw error;
    }
  }
);

export const fetchChatRoomDetail = createAsyncThunk(
  'chat/fetchRoomDetail',
  async (roomId: string) => {
    const response = await api.get(`/chat/rooms/${roomId}/`);
    return response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ roomId, beforeId }: { roomId: string; beforeId?: string }) => {
    const params = beforeId ? `?before=${beforeId}` : '';
    const response = await api.get(`/chat/rooms/${roomId}/messages/${params}`);
    return { roomId, ...response.data };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ roomId, content, messageType = 'text', replyTo, files }: {
    roomId: string;
    content: string;
    messageType?: string;
    replyTo?: string;
    files?: File[];
  }) => {
    console.log('🚀 [Redux] sendMessage iniciado:', {
      roomId,
      content,
      messageType,
      replyTo,
      filesCount: files?.length || 0,
      files: files?.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    const formData = new FormData();
    formData.append('content', content);
    formData.append('message_type', messageType);
    if (replyTo) {
      formData.append('reply_to', replyTo);
    }
    
    // Adicionar arquivos se houver
    if (files && files.length > 0) {
      console.log('📎 [Redux] Adicionando arquivos ao FormData:', files.length);
      files.forEach((file, index) => {
        formData.append(`attachments[${index}]file`, file);
        formData.append(`attachments[${index}]original_name`, file.name);
        formData.append(`attachments[${index}]content_type`, file.type);
        formData.append(`attachments[${index}]file_size`, file.size.toString());
      });
    }

    console.log('📡 [Redux] Fazendo POST para:', `/chat/rooms/${roomId}/send_message/`);
    const response = await api.post(`/chat/rooms/${roomId}/send_message/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ [Redux] Resposta recebida:', response.data);
    return { roomId, message: response.data };
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ messageId, content }: { messageId: string; content: string }) => {
    const response = await api.patch(`/chat/messages/${messageId}/`, {
      content,
    });
    return response.data;
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId: string) => {
    await api.delete(`/chat/messages/${messageId}/`);
    return messageId;
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async ({ roomId, messageId }: { roomId: string; messageId: string }) => {
    await api.post(`/chat/rooms/${roomId}/mark_as_read/`, {
      message_id: messageId,
    });
    return { roomId, messageId };
  }
);

export const joinChatRoom = createAsyncThunk(
  'chat/joinRoom',
  async (roomId: string) => {
    const response = await api.post(`/chat/rooms/${roomId}/join/`);
    return response.data;
  }
);

// ===== MEMBER MANAGEMENT ACTIONS =====

export const fetchRoomMembers = createAsyncThunk(
  'chat/fetchRoomMembers',
  async (roomId: string) => {
    const response = await api.get(`/chat/rooms/${roomId}/members/`);
    return { roomId, members: response.data };
  }
);

export const addRoomMember = createAsyncThunk(
  'chat/addRoomMember',
  async ({ roomId, userId, role = 'member' }: { roomId: string; userId: string; role?: 'admin' | 'moderator' | 'member' }) => {
    const response = await api.post(`/chat/rooms/${roomId}/add_member/`, {
      user_id: userId,
      role,
    });
    return { roomId, member: response.data.member };
  }
);

export const removeRoomMember = createAsyncThunk(
  'chat/removeRoomMember',
  async ({ roomId, userId }: { roomId: string; userId: string }) => {
    await api.post(`/chat/rooms/${roomId}/remove_member/`, {
      user_id: userId,
    });
    return { roomId, userId };
  }
);

export const changeMemberRole = createAsyncThunk(
  'chat/changeMemberRole',
  async ({ roomId, userId, role }: { roomId: string; userId: string; role: 'admin' | 'moderator' | 'member' }) => {
    const response = await api.post(`/chat/rooms/${roomId}/change_member_role/`, {
      user_id: userId,
      role,
    });
    return { roomId, member: response.data.member };
  }
);

export const leaveChatRoom = createAsyncThunk(
  'chat/leaveRoom',
  async (roomId: string) => {
    const response = await api.post(`/chat/rooms/${roomId}/leave/`);
    return { roomId, ...response.data };
  }
);

export const createChatRoom = createAsyncThunk(
  'chat/createRoom',
  async (roomData: {
    name: string;
    room_type: string;
    community?: string;
    participant_ids?: number[];
    max_participants?: number;
    is_read_only?: boolean;
  }, { rejectWithValue }) => {
    try {
      console.log('🚀 createChatRoom - Enviando:', roomData);
      const response = await api.post('/chat/rooms/', roomData);
      console.log('✅ createChatRoom - Resposta:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ createChatRoom - Erro completo:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // WebSocket actions
    setWsConnected: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
      if (action.payload) {
        state.wsError = null;
      }
    },
    
    setWsError: (state, action: PayloadAction<string | null>) => {
      state.wsError = action.payload;
    },
    
    // Real-time message handling
    addMessage: (state, action: PayloadAction<{ roomId: string; message: ChatMessage }>) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      
      // Verificar se mensagem já existe (evitar duplicação do WebSocket)
      const exists = state.messages[roomId].some(m => m.id === message.id);
      if (!exists) {
        state.messages[roomId].push(message);
        console.log('➕ [WebSocket] Mensagem adicionada:', message.id);
      } else {
        console.log('⚠️ [WebSocket] Mensagem já existe, não duplicando:', message.id);
      }
      
      // Update last message in room list
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.last_message = {
          id: message.id,
          content: message.content,
          sender: message.sender.username,
          created_at: message.created_at,
          message_type: message.message_type,
        };
        room.updated_at = message.created_at;
      }
    },
    
    updateMessage: (state, action: PayloadAction<{ roomId: string; message: ChatMessage }>) => {
      const { roomId, message } = action.payload;
      if (state.messages[roomId]) {
        const index = state.messages[roomId].findIndex(m => m.id === message.id);
        if (index !== -1) {
          state.messages[roomId][index] = message;
        }
      }
    },
    
    removeMessage: (state, action: PayloadAction<{ roomId: string; messageId: string }>) => {
      const { roomId, messageId } = action.payload;
      if (state.messages[roomId]) {
        const index = state.messages[roomId].findIndex(m => m.id === messageId);
        if (index !== -1) {
          state.messages[roomId][index] = {
            ...state.messages[roomId][index],
            is_deleted: true,
            content: '[Mensagem deletada]',
          };
        }
      }
    },
    
    // Typing indicators
    setUserTyping: (state, action: PayloadAction<{
      roomId: string;
      user_id: number;
      username: string;
      is_typing: boolean;
    }>) => {
      const { roomId, user_id, username, is_typing } = action.payload;
      
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      
      const existingIndex = state.typingUsers[roomId].findIndex(u => u.user_id === user_id);
      
      if (is_typing) {
        if (existingIndex === -1) {
          state.typingUsers[roomId].push({ user_id, username, is_typing: true });
        }
      } else {
        if (existingIndex !== -1) {
          state.typingUsers[roomId].splice(existingIndex, 1);
        }
      }
    },
    
    // Online status
    setUserOnlineStatus: (state, action: PayloadAction<{
      roomId: string;
      user_id: number;
      username: string;
      status: 'online' | 'offline';
      timestamp: string;
    }>) => {
      const { roomId, user_id, username, status, timestamp } = action.payload;
      
      if (!state.onlineUsers[roomId]) {
        state.onlineUsers[roomId] = [];
      }
      
      const existingIndex = state.onlineUsers[roomId].findIndex(u => u.user_id === user_id);
      
      if (existingIndex !== -1) {
        state.onlineUsers[roomId][existingIndex] = { user_id, username, status, timestamp };
      } else {
        state.onlineUsers[roomId].push({ user_id, username, status, timestamp });
      }
    },
    
    // UI actions
    clearError: (state) => {
      state.error = null;
      state.wsError = null;
    },
    
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    
    setCurrentRoom: (state, action: PayloadAction<ChatRoomDetail>) => {
      state.currentRoom = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch chat rooms
    builder.addCase(fetchChatRooms.pending, (state) => {
      console.log('🔄 FETCH ROOMS PENDING');
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchChatRooms.fulfilled, (state, action) => {
      console.log('✅ FETCH ROOMS FULFILLED:', action.payload);
      state.isLoading = false;
      
      // A API retorna {count, results}, precisamos pegar apenas results
      const rooms = action.payload?.results || action.payload;
      state.rooms = Array.isArray(rooms) ? rooms : [];
      
      console.log('💾 ROOMS SAVED TO STATE:', state.rooms);
      console.log('🔢 ROOMS COUNT:', state.rooms.length);
    });
    builder.addCase(fetchChatRooms.rejected, (state, action) => {
      console.log('❌ FETCH ROOMS REJECTED:', action.error);
      state.isLoading = false;
      state.error = action.error.message || 'Erro ao carregar chats';
    });
    
    // Fetch chat room detail
    builder.addCase(fetchChatRoomDetail.fulfilled, (state, action) => {
      state.currentRoom = action.payload;
    });
    
    // Fetch messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loadingMessages = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loadingMessages = false;
      const { roomId, messages, has_more } = action.payload;
      
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      
      // Prepend older messages
      state.messages[roomId] = [...messages, ...state.messages[roomId]];
      state.hasMoreMessages[roomId] = has_more;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.loadingMessages = false;
      state.error = action.error.message || 'Erro ao carregar mensagens';
    });
    
    // Send message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const { roomId, message } = action.payload;
      console.log('✅ [Redux Reducer] sendMessage.fulfilled:', { roomId, message });
      
      // Adicionar mensagem ao estado
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      
      // Verificar se mensagem já existe (evitar duplicação)
      const exists = state.messages[roomId].some(m => m.id === message.id);
      if (!exists) {
        state.messages[roomId].push(message);
        console.log('➕ [Redux Reducer] Mensagem adicionada ao estado');
      } else {
        console.log('⚠️ [Redux Reducer] Mensagem já existe, não duplicando');
      }
      
      // Atualizar last_message da sala
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.last_message = {
          id: message.id,
          content: message.content,
          sender: message.sender.username,
          created_at: message.created_at,
          message_type: message.message_type
        };
      }
    });
    
    builder.addCase(sendMessage.rejected, (state, action) => {
      console.error('❌ [Redux Reducer] sendMessage.rejected:', action.error);
      state.error = action.error.message || 'Erro ao enviar mensagem';
    });
    
    // Edit message
    builder.addCase(editMessage.fulfilled, (state, action) => {
      // Message will be updated via WebSocket
    });
    
    // Delete message
    builder.addCase(deleteMessage.fulfilled, (state, action) => {
      // Message will be updated via WebSocket
    });
    
    // Create chat room
    builder.addCase(createChatRoom.fulfilled, (state, action) => {
      state.rooms.unshift(action.payload);
    });
    
    // Leave chat room
    builder.addCase(leaveChatRoom.fulfilled, (state, action) => {
      const { roomId } = action.payload;
      state.rooms = state.rooms.filter(room => room.id !== roomId);
      if (state.currentRoom?.id === roomId) {
        state.currentRoom = null;
      }
      delete state.messages[roomId];
      delete state.typingUsers[roomId];
      delete state.onlineUsers[roomId];
    });
    
    // ===== MEMBER MANAGEMENT REDUCERS =====
    
    // Fetch room members
    builder.addCase(fetchRoomMembers.fulfilled, (state, action) => {
      const { roomId, members } = action.payload;
      if (state.currentRoom && state.currentRoom.id === roomId) {
        state.currentRoom.members = members;
      }
    });
    
    // Add room member
    builder.addCase(addRoomMember.fulfilled, (state, action) => {
      const { roomId, member } = action.payload;
      if (state.currentRoom && state.currentRoom.id === roomId) {
        state.currentRoom.members.push(member);
        state.currentRoom.participant_count += 1;
      }
      // Atualizar na lista de rooms
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.participant_count += 1;
      }
    });
    
    // Remove room member
    builder.addCase(removeRoomMember.fulfilled, (state, action) => {
      const { roomId, userId } = action.payload;
      if (state.currentRoom && state.currentRoom.id === roomId) {
        state.currentRoom.members = state.currentRoom.members.filter(
          m => String(m.user.id) !== String(userId)
        );
        state.currentRoom.participant_count -= 1;
      }
      // Atualizar na lista de rooms
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.participant_count -= 1;
      }
    });
    
    // Change member role
    builder.addCase(changeMemberRole.fulfilled, (state, action) => {
      const { roomId, member } = action.payload;
      if (state.currentRoom && state.currentRoom.id === roomId) {
        const index = state.currentRoom.members.findIndex(m => m.id === member.id);
        if (index !== -1) {
          state.currentRoom.members[index] = member;
        }
      }
    });
  },
});

export const {
  setWsConnected,
  setWsError,
  addMessage,
  updateMessage,
  removeMessage,
  setUserTyping,
  setUserOnlineStatus,
  clearError,
  clearCurrentRoom,
  setCurrentRoom,
} = chatSlice.actions;

export default chatSlice.reducer;
