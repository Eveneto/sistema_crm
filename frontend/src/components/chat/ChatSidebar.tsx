import React from 'react';
import styled from 'styled-components';
import { Avatar, Badge, Input, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ChatRoom } from '../../redux/slices/chatSlice';

interface ChatSidebarProps {
  rooms: ChatRoom[];
  selectedRoomId?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRoomSelect: (room: ChatRoom) => void;
  loading?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  rooms,
  selectedRoomId,
  searchTerm,
  onSearchChange,
  onRoomSelect,
  loading = false
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarContainer>
      <Header>
        <Title>Conversas</Title>
      </Header>

      <SearchContainer>
        <SearchInput
          placeholder="Buscar conversas..."
          prefix={<SearchOutlined style={{ color: '#666' }} />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
        />
      </SearchContainer>

      <RoomsList>
        {loading ? (
          <LoadingContainer>
            Carregando...
          </LoadingContainer>
        ) : filteredRooms.length === 0 ? (
          <EmptyContainer>
            Nenhuma conversa encontrada
          </EmptyContainer>
        ) : (
          <List
            dataSource={filteredRooms}
            renderItem={(room) => (
              <RoomItem
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className={selectedRoomId === room.id ? 'active' : ''}
              >
                <RoomContent>
                  <RoomAvatar>
                    <Badge count={room.unread_count} size="small" offset={[-2, 2]}>
                      <Avatar size={48} style={{ backgroundColor: '#007AFF' }}>
                        {room.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </RoomAvatar>

                  <RoomInfo>
                    <RoomHeader>
                      <RoomName>{room.name}</RoomName>
                      {room.last_message && (
                        <MessageTime>
                          {formatTime(room.last_message.created_at)}
                        </MessageTime>
                      )}
                    </RoomHeader>

                    {room.last_message ? (
                      <LastMessage>
                        <SenderName>{room.last_message.sender}:</SenderName>
                        <MessagePreview>{room.last_message.content}</MessagePreview>
                      </LastMessage>
                    ) : (
                      <NoMessage>Nenhuma mensagem</NoMessage>
                    )}
                  </RoomInfo>
                </RoomContent>
              </RoomItem>
            )}
          />
        )}
      </RoomsList>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 320px;
  height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
`;

const Title = styled.h2`
  color: #ffffff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const SearchContainer = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #333;
`;

const SearchInput = styled(Input)`
  .ant-input {
    background: #1a1a1a !important;
    border: 1px solid #333 !important;
    color: #ffffff !important;

    &::placeholder {
      color: #666 !important;
    }
  }

  .ant-input-prefix {
    color: #666;
  }

  .ant-input-clear-icon {
    color: #666;
  }
`;

const RoomsList = styled.div`
  flex: 1;
  overflow-y: auto;

  .ant-list-item {
    padding: 0;
    border-bottom: none;
  }
`;

const RoomItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1a1a1a;
  }

  &.active {
    background: #007AFF;
  }
`;

const RoomContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RoomAvatar = styled.div`
  flex-shrink: 0;
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const RoomName = styled.div`
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MessageTime = styled.div`
  color: #666;
  font-size: 12px;
  flex-shrink: 0;
`;

const LastMessage = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const SenderName = styled.span`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
`;

const MessagePreview = styled.span`
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const NoMessage = styled.div`
  color: #666;
  font-size: 14px;
  font-style: italic;
`;

const LoadingContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

const EmptyContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

export default ChatSidebar;
