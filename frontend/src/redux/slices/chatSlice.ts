import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Types
export interface ChatUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface ChatMessage {
  id: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
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
      const response = await api.get('/api/chat/rooms/');
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
    const response = await api.get(`/api/chat/rooms/${roomId}/`);
    return response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ roomId, beforeId }: { roomId: string; beforeId?: string }) => {
    const params = beforeId ? `?before=${beforeId}` : '';
    const response = await api.get(`/api/chat/rooms/${roomId}/messages/${params}`);
    return { roomId, ...response.data };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ roomId, content, messageType = 'text', replyTo }: {
    roomId: string;
    content: string;
    messageType?: string;
    replyTo?: string;
  }) => {
    const response = await api.post(`/api/chat/rooms/${roomId}/send_message/`, {
      content,
      message_type: messageType,
      reply_to: replyTo,
    });
    return { roomId, message: response.data };
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ messageId, content }: { messageId: string; content: string }) => {
    const response = await api.patch(`/api/chat/messages/${messageId}/`, {
      content,
    });
    return response.data;
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId: string) => {
    await api.delete(`/api/chat/messages/${messageId}/`);
    return messageId;
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async ({ roomId, messageId }: { roomId: string; messageId: string }) => {
    await api.post(`/api/chat/rooms/${roomId}/mark_as_read/`, {
      message_id: messageId,
    });
    return { roomId, messageId };
  }
);

export const joinChatRoom = createAsyncThunk(
  'chat/joinRoom',
  async (roomId: string) => {
    const response = await api.post(`/api/chat/rooms/${roomId}/join/`);
    return response.data;
  }
);

export const leaveChatRoom = createAsyncThunk(
  'chat/leaveRoom',
  async (roomId: string) => {
    const response = await api.post(`/api/chat/rooms/${roomId}/leave/`);
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
  }) => {
    const response = await api.post('/api/chat/rooms/', roomData);
    return response.data;
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
      state.messages[roomId].push(message);
      
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
      // Message will be added via WebSocket
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
