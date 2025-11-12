import React, { useMemo } from 'react';
import { Avatar, Button, Dropdown, Tag, Tooltip } from 'antd';
import { 
  EllipsisOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileOutlined,
  PaperClipOutlined 
} from '@ant-design/icons';
import { ChatMessage as ChatMessageType } from '../../redux/slices/chatSlice';

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
  // DEBUG: Log mensagem
  console.log('💬 [ChatMessage] Renderizando:', {
    id: message.id,
    type: message.message_type,
    content: message.content,
    hasAttachments: !!message.attachments?.length,
    attachmentsCount: message.attachments?.length || 0,
    file_url: message.file_url,
    file_name: message.file_name
  });

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

  if (message.is_deleted) {
    return (
      <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="bg-gray-100 text-gray-500 italic px-3 py-2 rounded-lg text-sm max-w-xs">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      {/* Avatar (apenas para mensagens de outros usuários) */}
      {!isOwn && showAvatar && (
        <Avatar
          size="small"
          className="mr-3 mt-1 flex-shrink-0"
        >
          {message.sender.username.charAt(0).toUpperCase()}
        </Avatar>
      )}

      {/* Espaçador para mensagens próprias */}
      {isOwn && <div className="w-8" />}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
        {/* Sender info (apenas para mensagens de outros usuários) */}
        {!isOwn && (
          <div className="text-xs text-crm-text-secondary mb-1 px-1">
            {message.sender.full_name || message.sender.username}
          </div>
        )}

        {/* Reply preview */}
        {message.reply_to_message && (
          <div className="bg-crm-bg-secondary border-l-4 border-crm-primary rounded-lg p-2 mb-2 ml-3">
            <div className="text-xs font-medium text-crm-primary">
              {message.reply_to_message.sender}
            </div>
            <div className="text-xs text-crm-text-secondary mt-1">
              {message.reply_to_message.content}
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm ${
            isOwn
              ? 'bg-crm-primary text-white rounded-br-md'
              : 'bg-crm-bg-secondary text-crm-text-primary rounded-bl-md'
          }`}
          onClick={handleMessageClick}
        >
          {/* Message content */}
          {message.message_type === 'text' && (
            <div className="text-sm leading-relaxed break-words">
              {message.content}
            </div>
          )}

          {message.message_type === 'image' && (
            <div>
              {/* Renderizar attachments de imagem se existirem */}
              {message.attachments && message.attachments.length > 0 ? (
                <div className="space-y-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id}>
                      {/* Nome do arquivo de imagem */}
                      <div className={`flex items-center gap-2 mb-2 ${
                        isOwn ? 'text-white/90' : 'text-crm-text-secondary'
                      }`}>
                        <PaperClipOutlined className="text-xs" />
                        <span className="text-xs font-medium">{attachment.file_name}</span>
                      </div>
                      {/* Preview da imagem */}
                      <img
                        src={attachment.file}
                        alt={attachment.file_name}
                        className="rounded-lg max-w-full h-auto mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(attachment.file, '_blank')}
                        title="Clique para abrir em tamanho completo"
                      />
                    </div>
                  ))}
                  {message.content && message.content !== 'Arquivo anexado' && (
                    <div className="text-sm mt-2">{message.content}</div>
                  )}
                </div>
              ) : (
                /* Fallback para formato antigo (sem attachments array) */
                <div>
                  {message.file_url && (
                    <img
                      src={message.file_url}
                      alt={message.file_name || 'Imagem'}
                      className="rounded-lg max-w-full h-auto mb-2"
                    />
                  )}
                  {message.content && (
                    <div className="text-sm">{message.content}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {message.message_type === 'file' && (
            <div>
              {/* Renderizar attachments se existirem */}
              {message.attachments && message.attachments.length > 0 ? (
                <div className="space-y-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className={`p-3 rounded-lg border ${
                      isOwn 
                        ? 'bg-white/10 border-white/20' 
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {/* Ícone do arquivo */}
                        <div className={`flex-shrink-0 ${
                          isOwn ? 'text-white/80' : 'text-crm-primary'
                        }`}>
                          <PaperClipOutlined className="text-xl" />
                        </div>
                        
                        {/* Informações do arquivo */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold truncate ${
                            isOwn ? 'text-white' : 'text-crm-text-primary'
                          }`}>
                            {attachment.file_name}
                          </div>
                          {attachment.file_size && (
                            <div className={`text-xs mt-1 ${
                              isOwn ? 'text-white/70' : 'text-crm-text-secondary'
                            }`}>
                              {Math.round(attachment.file_size / 1024)} KB
                            </div>
                          )}
                        </div>
                        
                        {/* Botão de download */}
                        <Button
                          type="primary"
                          size="small"
                          href={attachment.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={isOwn ? 'bg-white/20 hover:bg-white/30 border-white/30' : ''}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                  {message.content && message.content !== 'Arquivo anexado' && (
                    <div className="text-sm mt-2">{message.content}</div>
                  )}
                </div>
              ) : (
                /* Fallback para formato antigo (sem attachments array) */
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PaperClipOutlined />
                    <span className="text-sm font-medium">{message.file_name}</span>
                    {message.file_size && (
                      <span className="text-xs opacity-70">
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
                      className="p-0 h-auto text-xs"
                    >
                      Download
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Message footer */}
          <div className={`flex items-center justify-between mt-1 ${
            isOwn ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <div className={`text-xs ${
              isOwn ? 'text-white/70' : 'text-crm-text-muted'
            }`}>
              {formattedTime}
              {message.is_edited && (
                <span className="ml-1 opacity-70">• editada</span>
              )}
            </div>

            {/* Message actions */}
            {menuItems.length > 0 && (
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                isOwn ? 'mr-2' : 'ml-2'
              }`}>
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                  placement="topRight"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<EllipsisOutlined />}
                    className={`w-6 h-6 p-0 ${
                      isOwn ? 'text-white/70 hover:text-white' : 'text-crm-text-secondary'
                    }`}
                  />
                </Dropdown>
              </div>
            )}

            {/* Read indicator (apenas para mensagens próprias) */}
            {isOwn && (
              <div className="text-white/70 text-xs ml-2">
                <Tooltip title={message.is_read ? 'Lida' : 'Enviada'}>
                  <span>{message.is_read ? '✓✓' : '✓'}</span>
                </Tooltip>
              </div>
            )}
          </div>
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
