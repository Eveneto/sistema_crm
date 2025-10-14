import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Offcanvas } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import SidebarBootstrap from './SidebarBootstrap';
import HeaderBootstrap from './HeaderBootstrap';
import ToastContainer from './ToastContainer';

interface MainLayoutBootstrapProps {
  children: React.ReactNode;
}

const MainLayoutBootstrap: React.FC<MainLayoutBootstrapProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 992; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Close mobile sidebar when switching to desktop
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Container fluid className="p-0 h-100">
      <Row className="g-0 h-100">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Col xs="auto" className="d-none d-lg-block">
            <SidebarBootstrap collapsed={false} />
          </Col>
        )}

        {/* Mobile Sidebar */}
        <Offcanvas 
          show={sidebarOpen} 
          onHide={() => setSidebarOpen(false)}
          placement="start"
          className="d-lg-none"
          style={{ width: '280px' }}
        >
          <SidebarBootstrap collapsed={false} />
        </Offcanvas>

        {/* Main Content Area */}
        <Col className="d-flex flex-column h-100">
          {/* Header */}
          <HeaderBootstrap 
            onToggleSidebar={toggleSidebar}
            showSidebarToggle={true}
          />

          {/* Page Content */}
          <div className="flex-grow-1 overflow-auto">
            <Container fluid className="p-3">
              {children}
            </Container>
          </div>
        </Col>
      </Row>

      {/* Toast Container */}
      <ToastContainer />
    </Container>
  );
};

export default MainLayoutBootstrap;
