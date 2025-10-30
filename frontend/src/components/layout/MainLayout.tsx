import React from 'react';
import AppLayout from '../../layout/AppLayout';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <AppLayout title={title} subtitle={subtitle}>
      {children}
    </AppLayout>
  );
};

export default MainLayout;
