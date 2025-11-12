import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Upload, Popover, message as antdMessage } from 'antd';
import { SendOutlined, PaperClipOutlined, SmileOutlined, FileOutlined, CloseOutlined } from '@ant-design/icons';
import { ChatMessage } from '../../redux/slices/chatSlice';

const { TextArea } = Input;

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string, replyTo?: string, files?: File[]) => void;
  onTyping: (isTyping: boolean) => void;
  replyToMessage?: ChatMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  replyToMessage,
  onCancelReply,
  disabled = false,
  placeholder = 'Digite sua mensagem...'
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const inputRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enviar indicador de digitação
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    } else if (!message.trim() && isTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Parar indicador de digitação após 2 segundos de inatividade
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

  const handleSend = () => {
    const content = message.trim();
    if (!content && attachedFiles.length === 0) return;
    if (disabled) return;

    console.log('📤 [MessageInput] Enviando mensagem:', {
      content: content || 'Arquivo anexado',
      messageType: attachedFiles.length > 0 ? 'file' : 'text',
      replyTo: replyToMessage?.id,
      filesCount: attachedFiles.length,
      files: attachedFiles
    });

    onSendMessage(
      content || 'Arquivo anexado',
      attachedFiles.length > 0 ? 'file' : 'text',
      replyToMessage?.id,
      attachedFiles.length > 0 ? attachedFiles : undefined
    );
    
    setMessage('');
    setAttachedFiles([]);
    setIsTyping(false);
    onTyping(false);
    
    if (onCancelReply) {
      onCancelReply();
    }

    // Focar no input após enviar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (file: File) => {
    // Validar tamanho (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      antdMessage.error('Arquivo muito grande! Tamanho máximo: 10MB');
      return false;
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      antdMessage.error('Tipo de arquivo não suportado');
      return false;
    }

    // Adicionar arquivo à lista
    setAttachedFiles(prev => [...prev, file]);
    return false; // Prevenir upload automático do Ant Design
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setAttachedFiles(prev => prev.filter(f => f !== fileToRemove));
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  const emojiPopover = (
    <div className="emoji-picker">
      <div className="emoji-grid">
        {commonEmojis.map((emoji, index) => (
          <button
            key={index}
            className="emoji-button"
            onClick={() => handleEmojiSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="crm-message-input">
      {/* Reply preview */}
      {replyToMessage && (
        <div className="crm-message-input-reply">
          <div className="crm-message-input-reply-content">
            <div className="crm-message-input-reply-to">
              Respondendo a {replyToMessage.sender.username}:
            </div>
            <div className="crm-message-input-reply-message">
              {replyToMessage.content.length > 100 
                ? replyToMessage.content.substring(0, 100) + '...' 
                : replyToMessage.content}
            </div>
          </div>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onCancelReply}
          />
        </div>
      )}

      {/* File preview */}
      {attachedFiles.length > 0 && (
        <div className="crm-message-input-files">
          {attachedFiles.map((file, index) => (
            <div key={index} className="file-preview-chip">
              {file.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name}
                  className="file-preview-thumbnail"
                />
              ) : (
                <FileOutlined className="file-preview-icon" />
              )}
              <div className="file-preview-info">
                <span className="file-preview-name">{file.name}</span>
                <span className="file-preview-size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleRemoveFile(file)}
                className="file-preview-remove"
              />
            </div>
          ))}
        </div>
      )}

      {/* Input area - Modern horizontal layout */}
      <div className="crm-message-input-wrapper">
        {/* Left actions - Anexos e Emojis */}
        <div className="crm-message-input-actions">
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
            disabled={disabled}
          >
            <Button 
              type="text" 
              icon={<PaperClipOutlined />} 
              size="small"
              disabled={disabled}
              title="Anexar arquivo"
              className="crm-message-input-action-btn"
            />
          </Upload>

          <Popover 
            content={emojiPopover} 
            trigger="click" 
            placement="topLeft"
          >
            <Button 
              type="text" 
              icon={<SmileOutlined />} 
              size="small"
              disabled={disabled}
              title="Adicionar emoji"
              className="crm-message-input-action-btn"
            />
          </Popover>
        </div>

        {/* Text input - Flexible width */}
        <TextArea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="crm-message-input-field"
        />

        {/* Send button */}
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachedFiles.length === 0)}
          className="crm-message-input-send"
          title="Enviar mensagem (Enter)"
        />
      </div>
    </div>
  );
};

export default MessageInput;
