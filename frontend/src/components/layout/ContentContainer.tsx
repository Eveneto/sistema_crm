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
  maxWidth = '100%', // Alterado de '1400px' para '100%'
  padding = '6px', // Reduzido ainda mais para 6px
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
