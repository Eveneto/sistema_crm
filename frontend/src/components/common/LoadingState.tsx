import React from 'react';
import { Spin, Skeleton } from 'antd';
import './LoadingState.css';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  text?: string;
  size?: 'small' | 'default' | 'large';
  rows?: number;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  text = 'Carregando...',
  size = 'default',
  rows = 3,
  className = ''
}) => {
  const renderLoadingType = () => {
    switch (type) {
      case 'skeleton':
        return (
          <div className={`loading-skeleton ${className}`}>
            <Skeleton active paragraph={{ rows }} />
          </div>
        );
      
      case 'dots':
        return (
          <div className={`loading-dots ${className}`}>
            <div className="dots-container">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <span className="loading-text">{text}</span>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`loading-pulse ${className}`}>
            <div className="pulse-circle"></div>
            <span className="loading-text">{text}</span>
          </div>
        );
      
      default:
        return (
          <div className={`loading-spinner ${className}`}>
            <Spin size={size} tip={text} />
          </div>
        );
    }
  };

  return (
    <div className="loading-state-container" role="status" aria-label={text}>
      {renderLoadingType()}
    </div>
  );
};

export default LoadingState;
