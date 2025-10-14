import React from 'react';

interface ContentContainerProps {
  children: React.ReactNode;
  maxWidth?: number | string;
  padding?: number | string;
  background?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  maxWidth = '1400px',
  padding = '24px',
  background = 'transparent',
  className = '',
  style,
}) => {
  return (
    <div
      className={`rd-content-container ${className}`}
      style={{
        maxWidth,
        margin: '0 auto',
        padding,
        background,
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ContentContainer;
