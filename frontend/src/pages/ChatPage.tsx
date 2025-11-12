import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  List, 
  Typography, 
  Avatar, 
  Badge, 
  Spin, 
  Alert, 
  Button,
  Input,
  Tag,
  Space,
  Tooltip,
  Empty
} from 'antd';
import { 
  MessageOutlined, 
  UsergroupAddOutlined, 
  SettingOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  WifiOutlined,
  DisconnectOutlined,
  BellOutlined
} from '@ant-design/icons';
import { RootState, AppDispatch } from '../redux/store';
import {
  fetchChatRooms,
  fetchChatRoomDetail,
  fetchMessages,
  sendMessage,
  clearCurrentRoom,
  ChatMessage as ChatMessageType,
  ChatRoom,
} from '../redux/slices/chatSlice';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { useNotifications } from '../hooks/useNotifications';
import ChatMessage from '../components/chat/ChatMessage';
import MessageInput from '../components/chat/MessageInput';
import NotificationSettingsModal from '../components/chat/NotificationSettingsModal';
import MembersModal from '../components/chat/MembersModal';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const ChatPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId?: string }>();
  
  // Redux state
  const { 
    rooms, 
    currentRoom, 
    messages, 
    loadingMessages, 
    isLoading, 
    error,
    wsConnected,
    wsError,
    typingUsers,
  } = useSelector((state: RootState) => state.chat);
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // DEBUG: Log estados importantes
  console.log('🔍 CHAT DEBUG:', {
    rooms: rooms,
    roomsLength: rooms?.length,
    roomsType: typeof rooms,
    isAuthenticated,
    user: user?.email,
    wsConnected,
    wsError,
    isLoading,
    error
  });
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessageType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // WebSocket hook
  const { 
    isConnected, 
    sendMessage: wsSendMessage, 
    sendTyping, 
    markAsRead: wsMarkAsRead 
  } = useChatWebSocket(roomId || null, isAuthenticated);
  
  // Notifications hook
  const {
    permission: notificationPermission,
    requestPermission: requestNotificationPermission,
    notifyNewMessage,
    clearRoomNotifications,
  } = useNotifications();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Função auxiliar para formatar tempo das mensagens
  const formatMessageTime = (timestamp: string) => {
    try {
      const messageDate = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'agora';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      return `${Math.floor(diffInMinutes / 1440)}d`;
    } catch {
      return '';
    }
  };

  // Effects
  useEffect(() => {
    console.log('🔍 FETCH ROOMS EFFECT:', { isAuthenticated });
    if (isAuthenticated) {
      console.log('📡 Dispatching fetchChatRooms...');
      dispatch(fetchChatRooms());
    } else {
      console.log('❌ Not authenticated, skipping fetchChatRooms');
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (roomId && isAuthenticated) {
      dispatch(fetchChatRoomDetail(roomId));
      dispatch(fetchMessages({ roomId }));
    } else {
      dispatch(clearCurrentRoom());
    }
  }, [roomId, dispatch, isAuthenticated]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, roomId]);

  // Solicitar permissão de notificação ao entrar no chat
  useEffect(() => {
    if (isAuthenticated && notificationPermission === 'default') {
      const timer = setTimeout(() => {
        requestNotificationPermission();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, notificationPermission, requestNotificationPermission]);
  
  // Limpar notificações da sala quando entrar nela
  useEffect(() => {
    if (roomId) {
      clearRoomNotifications(roomId);
    }
  }, [roomId, clearRoomNotifications]);
  
  // Notificar sobre novas mensagens
  useEffect(() => {
    if (!roomId || !currentRoom || !user) return;
    
    const roomMessages = messages[roomId] || [];
    if (roomMessages.length === 0) return;
    
    const lastMessage = roomMessages[roomMessages.length - 1];
    
    // Notificar apenas se a mensagem for de outro usuário
    if (lastMessage.sender.id !== user.id) {
      notifyNewMessage(
        lastMessage.sender.full_name || lastMessage.sender.username,
        lastMessage.content,
        lastMessage.sender.id,
        currentRoom.id.toString(),
        currentRoom.name
      );
    }
  }, [messages, roomId, currentRoom, user, notifyNewMessage]);

  // Filter rooms based on search
  const filteredRooms = Array.isArray(rooms) ? rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Get current room messages
  const currentMessages = roomId ? messages[roomId] || [] : [];
  
  // DEBUG: Log mensagens da sala atual
  console.log('📨 [ChatPage] Current Messages:', {
    roomId,
    messagesInState: messages[roomId || ''],
    messagesCount: currentMessages.length,
    lastMessage: currentMessages[currentMessages.length - 1]
  });

  // Get typing users for current room
  const currentTypingUsers = roomId ? typingUsers[roomId] || [] : [];

  // Handlers
  const handleRoomSelect = (room: ChatRoom) => {
    navigate(`/chat/${room.id}`);
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  const handleSendMessage = (content: string, messageType = 'text', replyTo?: string, files?: File[]) => {
    console.log('📨 [ChatPage] handleSendMessage chamado:', {
      content,
      messageType,
      replyTo,
      filesCount: files?.length || 0,
      files,
      roomId
    });

    if (!roomId) {
      console.error('❌ [ChatPage] Sem roomId!');
      return;
    }
    
    // Se tem arquivos, usar HTTP API (não WebSocket)
    if (files && files.length > 0) {
      console.log('📁 [ChatPage] Enviando via HTTP API (com arquivos)');
      dispatch(sendMessage({
        roomId,
        content: content || 'Arquivo anexado',
        messageType,
        replyTo,
        files
      }));
      setReplyToMessage(null);
      return;
    }
    
    // Se não tem arquivos, validar conteúdo
    if (!content.trim()) {
      console.warn('⚠️ [ChatPage] Mensagem vazia, não enviando');
      return;
    }
    
    console.log('💬 [ChatPage] Enviando via WebSocket (sem arquivos)');
    // Send via WebSocket for real-time delivery
    if (isConnected) {
      wsSendMessage(content, messageType, replyTo);
    } else {
      console.error('❌ [ChatPage] WebSocket não conectado!');
    }
    
    // Clear reply
    setReplyToMessage(null);
  };

  const handleReplyToMessage = (message: ChatMessageType) => {
    setReplyToMessage(message);
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  const handleMarkAsRead = (messageId: string) => {
    if (isConnected) {
      wsMarkAsRead(messageId);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (isConnected) {
      sendTyping(isTyping);
    }
  };

  const handleBackToRooms = () => {
    navigate('/chat');
    setSidebarCollapsed(false);
  };

  // Connection status indicator
  const connectionStatus = (
    <div className="connection-status">
      {wsConnected && isConnected ? (
        <Tooltip title="Conectado">
          <WifiOutlined className="crm-chat-connection-online" />
        </Tooltip>
      ) : (
        <Tooltip title="Desconectado">
          <DisconnectOutlined className="crm-chat-connection-offline" />
        </Tooltip>
      )}
    </div>
  );

  // Typing indicator
  const typingIndicator = currentTypingUsers.length > 0 && (
    <div className="typing-indicator">
      <Text type="secondary">
        {currentTypingUsers.length === 1 
          ? `${currentTypingUsers[0].username} está digitando...`
          : `${currentTypingUsers.length} pessoas estão digitando...`
        }
      </Text>
    </div>
  );

  // Error handling
  if (error) {
    return (
      <Layout className="chat-layout">
        <Content className="error-content">
          <Alert
            message="Erro no Chat"
            description={error}
            type="error"
            showIcon
            action={
              <Button onClick={() => window.location.reload()}>
                Recarregar
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <div className="crm-chat-container">
      {/* Sidebar - Lista de Conversas */}
      <div className={`crm-chat-sidebar ${sidebarCollapsed ? 'crm-chat-sidebar-collapsed' : ''}`}>
        <div className="crm-chat-sidebar-header">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <MessageOutlined className="text-lg text-crm-primary" />
              <h2 className="text-lg font-semibold text-crm-text-primary">Conversas</h2>
            </div>
            {connectionStatus}
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <Input
              placeholder="Buscar conversas..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="crm-chat-search-input"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="crm-chat-conversations">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spin />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Empty
                description="Nenhuma conversa encontrada"
                className="text-crm-text-secondary"
              />
            </div>
          ) : (
            <div className="divide-y divide-crm-border">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className={`crm-chat-conversation-item ${roomId === room.id ? 'crm-chat-conversation-active' : ''}`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="relative">
                      <Avatar className="crm-chat-avatar">
                        {room.name.charAt(0).toUpperCase()}
                      </Avatar>
                      {room.unread_count > 0 && (
                        <Badge
                          count={room.unread_count}
                          size="small"
                          className="crm-chat-unread-badge"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-crm-text-primary truncate">
                          {room.name}
                        </h3>
                        <span className="text-xs text-crm-text-secondary flex-shrink-0">
                          {room.last_message ? formatMessageTime(room.last_message.created_at) : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-crm-text-secondary truncate flex-1 mr-2">
                          {room.last_message ? (
                            <>
                              <span className="font-medium">{room.last_message.sender}:</span>{' '}
                              {room.last_message.content}
                            </>
                          ) : (
                            'Nenhuma mensagem'
                          )}
                        </p>
                        <Tag
                          color={room.room_type === 'community' ? 'blue' : 'green'}
                          className="text-xs flex-shrink-0 px-2 py-0.5"
                        >
                          {room.room_type === 'community' ? 'Comunidade' : 'Chat'}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área Principal do Chat */}
      <div className="crm-chat-main">
        {currentRoom ? (
          <>
            {/* Header da Conversa - Modern Design */}
            <div className="crm-chat-header">
              <div className="flex items-center justify-between p-4 border-b border-crm-border bg-crm-bg-elevated">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Botão voltar (mobile) */}
                  {sidebarCollapsed && (
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={handleBackToRooms}
                      className="md:hidden flex-shrink-0"
                      size="large"
                    />
                  )}

                  <Avatar 
                    className="crm-chat-room-avatar flex-shrink-0"
                    size={44}
                  >
                    {currentRoom.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-crm-text-primary truncate">
                      {currentRoom.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-crm-text-secondary truncate">
                        {currentRoom.participant_count} {currentRoom.participant_count === 1 ? 'membro' : 'membros'}
                      </p>
                      {currentRoom.room_type === 'community' && (
                        <>
                          <span className="text-crm-text-muted">•</span>
                          <span className="text-xs text-crm-text-muted bg-crm-bg-secondary px-2 py-0.5 rounded-full">
                            Comunidade
                          </span>
                        </>
                      )}
                      {currentRoom.is_read_only && (
                        <>
                          <span className="text-crm-text-muted">•</span>
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            Somente leitura
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {connectionStatus}
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => setShowNotificationSettings(true)}
                    title="Configurações de notificações"
                    size="large"
                    className="hover:bg-crm-bg-hover"
                  />
                  <Button
                    type="text"
                    icon={<UsergroupAddOutlined />}
                    onClick={() => setShowMembersDrawer(true)}
                    title="Ver membros"
                    size="large"
                    className="hover:bg-crm-bg-hover"
                  />
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    title="Configurações"
                    size="large"
                    className="hover:bg-crm-bg-hover"
                  />
                </div>
              </div>
            </div>

            {/* Área de Mensagens - Modern Layout */}
            <div className="crm-chat-messages-area flex-1 flex flex-col min-h-0">
              {wsError && (
                <div className="p-4 border-b border-crm-border">
                  <Alert
                    message="Erro de conexão"
                    description={wsError}
                    type="warning"
                    closable
                    className="mb-0"
                  />
                </div>
              )}

              <div
                ref={messagesContainerRef}
                className="crm-chat-messages flex-1 overflow-y-auto p-4"
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Spin size="large" />
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="mb-4">
                      <MessageOutlined className="text-4xl text-crm-text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-crm-text-primary mb-2">
                      Comece uma conversa
                    </h3>
                    <p className="text-crm-text-secondary max-w-sm">
                      Envie a primeira mensagem para iniciar esta conversa.
                    </p>
                  </div>
                ) : (
                  <div className="crm-chat-messages-list space-y-1">
                    {currentMessages.map((message, index) => {
                      const isOwn = message.sender.id === user?.id;
                      const showAvatar = !isOwn &&
                        (index === 0 || currentMessages[index - 1].sender.id !== message.sender.id);

                      return (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                          onReply={handleReplyToMessage}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Typing indicator */}
              {typingIndicator}

              {/* Message Input Area */}
              <div className="crm-chat-input-area border-t border-crm-border bg-crm-bg-elevated p-4">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  replyToMessage={replyToMessage}
                  onCancelReply={handleCancelReply}
                  disabled={!isConnected || currentRoom.is_read_only}
                  placeholder={
                    !isConnected
                      ? "Reconectando..."
                      : currentRoom.is_read_only
                      ? "Chat em modo somente leitura"
                      : "Digite sua mensagem..."
                  }
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Empty
              description="Selecione uma conversa para começar"
              className="text-crm-text-secondary"
            />
          </div>
        )}
      </div>

      {/* Modal de Membros */}
      {roomId && (
        <MembersModal
          visible={showMembersDrawer}
          onClose={() => setShowMembersDrawer(false)}
          roomId={roomId}
        />
      )}
      
      {/* Modal de Configurações de Notificações */}
      <NotificationSettingsModal
        open={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </div>
  );
};

export default ChatPage;
