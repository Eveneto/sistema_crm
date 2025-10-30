import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircleOutlined, CheckOutlined } from '@ant-design/icons';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender: {
      username: string;
      full_name?: string;
    };
    created_at: string;
    is_read?: boolean;
    message_type?: string;
    file_url?: string;
    file_name?: string;
  };
  isOwn: boolean;
  showAvatar?: boolean;
  onClick?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = false,
  onClick
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MessageContainer
      isOwn={isOwn}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
    >
      {!isOwn && showAvatar && (
        <Avatar>
          {message.sender.username.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <BubbleContainer isOwn={isOwn}>
        {!isOwn && (
          <SenderName>
            {message.sender.full_name || message.sender.username}
          </SenderName>
        )}

        <Bubble isOwn={isOwn}>
          <MessageContent>
            {message.content}
          </MessageContent>

          <MessageFooter>
            <TimeStamp>
              {formatTime(message.created_at)}
            </TimeStamp>

            {isOwn && (
              <ReadIndicator>
                {message.is_read ? (
                  <CheckCircleOutlined style={{ color: '#ffffff', fontSize: '12px' }} />
                ) : (
                  <CheckOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }} />
                )}
              </ReadIndicator>
            )}
          </MessageFooter>
        </Bubble>
      </BubbleContainer>
    </MessageContainer>
  );
};

const MessageContainer = styled(motion.div)<{ isOwn: boolean }>`
  display: flex;
  margin-bottom: 8px;
  align-items: flex-end;
  flex-direction: ${props => props.isOwn ? 'row-reverse' : 'row'};
  max-width: 100%;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  margin: 0 8px;
  flex-shrink: 0;
`;

const BubbleContainer = styled.div<{ isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  max-width: 70%;
  align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const SenderName = styled.div`
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 4px;
  font-weight: 500;
`;

const Bubble = styled.div<{ isOwn: boolean }>`
  background: ${props => props.isOwn ? '#007AFF' : '#333333'};
  color: #ffffff;
  padding: 12px 16px;
  border-radius: ${props =>
    props.isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
  };
  position: relative;
  word-wrap: break-word;
  max-width: 100%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
`;

const MessageContent = styled.div`
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
`;

const MessageFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const TimeStamp = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  align-self: flex-end;
`;

const ReadIndicator = styled.div`
  display: flex;
  align-items: center;
`;

export default MessageBubble;
