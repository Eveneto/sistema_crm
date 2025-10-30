import React from 'react';
import styled, { keyframes } from 'styled-components';

interface TypingIndicatorProps {
  users: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} está digitando...`;
    } else if (users.length === 2) {
      return `${users[0]} e ${users[1]} estão digitando...`;
    } else {
      return `${users.length} pessoas estão digitando...`;
    }
  };

  return (
    <Container>
      <TypingAnimation>
        <Dot />
        <Dot />
        <Dot />
      </TypingAnimation>
      <Text>{getTypingText()}</Text>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #666;
  font-size: 14px;
`;

const TypingAnimation = styled.div`
  display: flex;
  gap: 4px;
`;

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  background: #007AFF;
  border-radius: 50%;

  &:nth-child(1) {
    animation: ${bounce} 1.4s infinite ease-in-out;
  }

  &:nth-child(2) {
    animation: ${bounce} 1.4s infinite ease-in-out 0.2s;
  }

  &:nth-child(3) {
    animation: ${bounce} 1.4s infinite ease-in-out 0.4s;
  }
`;

const Text = styled.span`
  color: #ffffff;
  font-size: 12px;
`;

export default TypingIndicator;
