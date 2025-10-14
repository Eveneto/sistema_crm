import React from 'react';
import { Navbar, Button, Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface HeaderBootstrapProps {
  onToggleSidebar: () => void;
  showSidebarToggle: boolean;
}

const HeaderBootstrap: React.FC<HeaderBootstrapProps> = ({ 
  onToggleSidebar, 
  showSidebarToggle 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Navbar 
      bg="white" 
      className="border-bottom px-3 py-2"
      style={{ minHeight: '60px' }}
    >
      <Container fluid className="d-flex align-items-center">
        {/* Mobile Sidebar Toggle */}
        {showSidebarToggle && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-lg-none me-3"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className="navbar-toggler-icon">☰</span>
          </Button>
        )}

        {/* Page Title or Breadcrumb would go here */}
        <div className="flex-grow-1">
          {/* This can be populated with breadcrumbs or page title */}
        </div>

        {/* Right side - User info, notifications, etc */}
        <div className="d-flex align-items-center">
          {user && (
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                style={{ width: '32px', height: '32px', fontSize: '14px' }}
              >
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-muted d-none d-md-inline">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default HeaderBootstrap;
