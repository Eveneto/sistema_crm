import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Upload, Popover } from 'antd';
import { SendOutlined, PaperClipOutlined, SmileOutlined } from '@ant-design/icons';
import { ChatMessage } from '../../redux/slices/chatSlice';
import './MessageInput.css';

const { TextArea } = Input;

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string, replyTo?: string) => void;
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
    if (!content || disabled) return;

    onSendMessage(content, 'text', replyToMessage?.id);
    setMessage('');
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
    // Implementar upload de arquivo
    console.log('Upload file:', file);
    return false; // Prevenir upload automático
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
    <div className="message-input-container">
      {/* Reply preview */}
      {replyToMessage && (
        <div className="reply-preview">
          <div className="reply-content">
            <span className="reply-to">Respondendo a {replyToMessage.sender.username}:</span>
            <span className="reply-message">
              {replyToMessage.content.length > 100 
                ? replyToMessage.content.substring(0, 100) + '...' 
                : replyToMessage.content}
            </span>
          </div>
          <Button 
            type="text" 
            size="small" 
            onClick={onCancelReply}
            className="cancel-reply"
          >
            ×
          </Button>
        </div>
      )}

      <div className="input-wrapper">
        <div className="input-actions-left">
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
            />
          </Popover>
        </div>

        <TextArea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="message-textarea"
        />

        <div className="input-actions-right">
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="send-button"
            title="Enviar mensagem (Enter)"
          />
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
