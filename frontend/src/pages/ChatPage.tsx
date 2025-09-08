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
  Drawer,
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
  DisconnectOutlined
} from '@ant-design/icons';
import { RootState, AppDispatch } from '../redux/store';
import {
  fetchChatRooms,
  fetchChatRoomDetail,
  fetchMessages,
  clearCurrentRoom,
  ChatMessage as ChatMessageType,
  ChatRoom,
} from '../redux/slices/chatSlice';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import ChatMessage from '../components/chat/ChatMessage';
import MessageInput from '../components/chat/MessageInput';
import './ChatPage.css';

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
  const [replyToMessage, setReplyToMessage] = useState<ChatMessageType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // WebSocket hook
  const {
    isConnected,
    sendMessage: wsSendMessage,
    sendTyping,
    markAsRead: wsMarkAsRead,
  } = useChatWebSocket(roomId || null, isAuthenticated);

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

  // Filter rooms based on search
  const filteredRooms = Array.isArray(rooms) ? rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Get current room messages
  const currentMessages = roomId ? messages[roomId] || [] : [];

  // Get typing users for current room
  const currentTypingUsers = roomId ? typingUsers[roomId] || [] : [];

  // Handlers
  const handleRoomSelect = (room: ChatRoom) => {
    navigate(`/chat/${room.id}`);
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  const handleSendMessage = (content: string, messageType = 'text', replyTo?: string) => {
    if (!roomId || !content.trim()) return;
    
    // Send via WebSocket for real-time delivery
    if (isConnected) {
      wsSendMessage(content, messageType, replyTo);
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
          <WifiOutlined style={{ color: '#52c41a' }} />
        </Tooltip>
      ) : (
        <Tooltip title="Desconectado">
          <DisconnectOutlined style={{ color: '#ff4d4f' }} />
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
    <Layout className="chat-layout">
      {/* Sidebar with room list */}
      <Sider
        className="chat-sidebar"
        width={320}
        breakpoint="md"
        collapsedWidth={0}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        trigger={null}
      >
        <div className="sidebar-header">
          <div className="header-title">
            <MessageOutlined />
            <Title level={4} style={{ margin: 0, color: 'white' }}>
              Chat
            </Title>
          </div>
          {connectionStatus}
        </div>

        <div className="sidebar-search">
          <Input
            placeholder="Buscar conversas..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>

        <div className="rooms-list">
          {isLoading ? (
            <div className="loading-container">
              <Spin />
            </div>
          ) : filteredRooms.length === 0 ? (
            <Empty
              description="Nenhuma conversa encontrada"
              style={{ padding: '20px' }}
            />
          ) : (
            <List
              dataSource={filteredRooms}
              renderItem={(room) => (
                <List.Item
                  className={`room-item ${roomId === room.id ? 'active' : ''}`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={room.unread_count} size="small">
                        <Avatar>
                          {room.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <div className="room-title">
                        <span className="room-name">{room.name}</span>
                        <Tag color={room.room_type === 'community' ? 'blue' : 'green'}>
                          {room.room_type === 'community' ? 'Comunidade' : 'Chat'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="room-description">
                        {room.last_message ? (
                          <Text ellipsis>
                            <strong>{room.last_message.sender}:</strong> {room.last_message.content}
                          </Text>
                        ) : (
                          <Text type="secondary">Nenhuma mensagem</Text>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Sider>

      {/* Main chat content */}
      <Layout className="chat-content-layout">
        {currentRoom ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <div className="header-left">
                {sidebarCollapsed && (
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackToRooms}
                    className="back-button"
                  />
                )}
                <Avatar className="room-avatar">
                  {currentRoom.name.charAt(0).toUpperCase()}
                </Avatar>
                <div className="room-info">
                  <Title level={5} style={{ margin: 0 }}>
                    {currentRoom.name}
                  </Title>
                  <Text type="secondary">
                    {currentRoom.participant_count} {currentRoom.participant_count === 1 ? 'membro' : 'membros'}
                  </Text>
                </div>
              </div>
              
              <div className="header-actions">
                <Space>
                  {connectionStatus}
                  <Button
                    type="text"
                    icon={<UsergroupAddOutlined />}
                    onClick={() => setShowMembersDrawer(true)}
                    title="Ver membros"
                  />
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    title="Configurações"
                  />
                </Space>
              </div>
            </div>

            {/* Messages area */}
            <Content className="messages-content">
              {wsError && (
                <Alert
                  message="Erro de conexão"
                  description={wsError}
                  type="warning"
                  closable
                  style={{ margin: '8px' }}
                />
              )}
              
              <div 
                ref={messagesContainerRef}
                className="messages-container"
              >
                {loadingMessages && (
                  <div className="loading-messages">
                    <Spin />
                  </div>
                )}
                
                {currentMessages.length === 0 && !loadingMessages ? (
                  <div className="empty-messages">
                    <Empty
                      description="Nenhuma mensagem ainda"
                      style={{ padding: '40px' }}
                    />
                  </div>
                ) : (
                  <div className="messages-list">
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
            </Content>

            {/* Message input */}
            <div className="message-input-area">
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
          </>
        ) : (
          <Content className="no-room-selected">
            <Empty
              description="Selecione uma conversa para começar"
              style={{ padding: '60px 20px' }}
            />
          </Content>
        )}
      </Layout>

      {/* Members drawer */}
      <Drawer
        title="Membros do Chat"
        placement="right"
        onClose={() => setShowMembersDrawer(false)}
        open={showMembersDrawer}
        width={320}
      >
        {currentRoom?.members && (
          <List
            dataSource={currentRoom.members}
            renderItem={(member) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Badge 
                      dot 
                      status={member.is_online ? 'success' : 'default'}
                      offset={[-8, 8]}
                    >
                      <Avatar>
                        {member.user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  }
                  title={member.user.full_name || member.user.username}
                  description={
                    <Space>
                      <Tag color={
                        member.role === 'admin' ? 'red' :
                        member.role === 'moderator' ? 'orange' : 'blue'
                      }>
                        {member.role}
                      </Tag>
                      {member.is_online && (
                        <Text type="success">Online</Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </Layout>
  );
};

export default ChatPage;
