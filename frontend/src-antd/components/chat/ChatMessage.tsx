import React, { useMemo } from 'react';
import { Avatar, Button, Dropdown, Tag, Tooltip } from 'antd';
import { EllipsisOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ChatMessage as ChatMessageType } from '../../redux/slices/chatSlice';
import './ChatMessage.css';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: ChatMessageType) => void;
  onEdit?: (message: ChatMessageType) => void;
  onDelete?: (messageId: string) => void;
  onMarkAsRead?: (messageId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onEdit,
  onDelete,
  onMarkAsRead,
}) => {
  const formattedTime = useMemo(() => {
    try {
      const messageDate = new Date(message.created_at);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'agora';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      return `${Math.floor(diffInMinutes / 1440)}d`;
    } catch {
      return 'agora';
    }
  }, [message.created_at]);

  const menuItems = useMemo(() => {
    const items = [];
    
    if (onReply) {
      items.push({
        key: 'reply',
        label: 'Responder',
        icon: <ReplyArrowIcon />,
        onClick: () => onReply(message),
      });
    }
    
    if (message.can_edit && onEdit) {
      items.push({
        key: 'edit',
        label: 'Editar',
        icon: <EditOutlined />,
        onClick: () => onEdit(message),
      });
    }
    
    if (message.can_delete && onDelete) {
      items.push({
        key: 'delete',
        label: 'Deletar',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDelete(message.id),
      });
    }
    
    return items;
  }, [message, onReply, onEdit, onDelete]);

  const handleMessageClick = () => {
    if (!isOwn && !message.is_read && onMarkAsRead) {
      onMarkAsRead(message.id);
    }
  };

  if (message.is_deleted) {
    return (
      <div className={`chat-message deleted ${isOwn ? 'own' : 'other'}`}>
        <div className="message-content deleted-content">
          <em>{message.content}</em>
        </div>
      </div>
    );
  }

  if (message.message_type === 'system') {
    return (
      <div className="chat-message system">
        <div className="system-content">
          {message.content}
        </div>
        <div className="message-time">
          {formattedTime}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`chat-message ${isOwn ? 'own' : 'other'} ${!message.is_read && !isOwn ? 'unread' : ''}`}
      onClick={handleMessageClick}
    >
      {/* Avatar (apenas para mensagens de outros usuários) */}
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          <Avatar size="small">
            {message.sender.username.charAt(0).toUpperCase()}
          </Avatar>
        </div>
      )}

      <div className="message-bubble">
        {/* Sender info (apenas para mensagens de outros usuários) */}
        {!isOwn && (
          <div className="message-sender">
            {message.sender.full_name || message.sender.username}
          </div>
        )}

        {/* Reply preview */}
        {message.reply_to_message && (
          <div className="reply-preview">
            <div className="reply-line"></div>
            <div className="reply-info">
              <span className="reply-sender">{message.reply_to_message.sender}</span>
              <span className="reply-content">{message.reply_to_message.content}</span>
            </div>
          </div>
        )}

        {/* Message content */}
        <div className="message-content">
          {message.message_type === 'text' && (
            <div className="text-content">
              {message.content}
            </div>
          )}
          
          {message.message_type === 'image' && (
            <div className="image-content">
              {message.file_url && (
                <img 
                  src={message.file_url} 
                  alt={message.file_name || 'Imagem'}
                  className="message-image"
                />
              )}
              {message.content && (
                <div className="image-caption">{message.content}</div>
              )}
            </div>
          )}
          
          {message.message_type === 'file' && (
            <div className="file-content">
              <div className="file-info">
                <span className="file-name">{message.file_name}</span>
                {message.file_size && (
                  <span className="file-size">
                    ({Math.round(message.file_size / 1024)} KB)
                  </span>
                )}
              </div>
              {message.file_url && (
                <Button 
                  type="link" 
                  size="small"
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Message footer */}
        <div className="message-footer">
          <div className="message-time">
            {formattedTime}
            {message.is_edited && (
              <Tag color="default" className="edited-tag">
                editada
              </Tag>
            )}
          </div>

          {/* Message actions */}
          {menuItems.length > 0 && (
            <div className="message-actions">
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="topRight"
              >
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EllipsisOutlined />}
                  className="action-button"
                />
              </Dropdown>
            </div>
          )}

          {/* Read indicator (apenas para mensagens próprias) */}
          {isOwn && (
            <div className="read-indicator">
              <Tooltip title={message.is_read ? 'Lida' : 'Enviada'}>
                <div className={`read-status ${message.is_read ? 'read' : 'sent'}`}>
                  ✓{message.is_read ? '✓' : ''}
                </div>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Icon personalizado para reply
const ReplyArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <path d="M5.5 3L2 6.5l3.5 3.5M2 6.5h10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

export default ChatMessage;
