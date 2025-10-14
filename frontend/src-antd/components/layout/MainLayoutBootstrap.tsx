import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SidebarBootstrap from './SidebarBootstrap';

interface MainLayoutBootstrapProps {
  children: React.ReactNode;
}

const MainLayoutBootstrap: React.FC<MainLayoutBootstrapProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="main-layout">
      <Container fluid className="p-0 h-100">
        <Row className="g-0 h-100">
          {/* Sidebar */}
          <Col 
            xs={sidebarCollapsed ? 1 : 4} 
            md={sidebarCollapsed ? 1 : 3} 
            lg={sidebarCollapsed ? 1 : 2}
            className="position-relative"
          >
            <SidebarBootstrap 
              collapsed={sidebarCollapsed} 
              onCollapse={setSidebarCollapsed} 
            />
          </Col>
          
          {/* Main Content */}
          <Col 
            xs={sidebarCollapsed ? 11 : 8} 
            md={sidebarCollapsed ? 11 : 9} 
            lg={sidebarCollapsed ? 11 : 10}
          >
            <div className="content-container">
              <div className="fade-in">
                {children}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainLayoutBootstrap;
