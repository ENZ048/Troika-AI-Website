import React from "react";
import styled from "styled-components";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaGlobe,
  FaPhone,
  FaWhatsapp,
  FaInfoCircle,
  FaBolt,
  FaChartLine,
  FaRupeeSign,
  FaHandshake,
  FaBullhorn,
  FaHeadset,
  FaPlus,
  FaShareAlt,
  FaPaperPlane,
  FaComment,
  FaChevronDown,
  FaTimes,
  FaBrain,
  FaPhoneAlt
} from "react-icons/fa";

const SidebarContainer = styled.div`
  width: 260px;
  height: 100vh;
  background: ${props => props.$isDarkMode ? '#000000' : '#f9f9f9'};
  border-right: 1px solid ${props => props.$isDarkMode ? '#1f1f1f' : '#e5e5e5'};
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;

  /* Hide scrollbar for all browsers */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  
  &::-webkit-scrollbar {
    display: none; /* WebKit browsers */
  }

  /* Smooth scrolling for mobile */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  /* Hide close button on desktop */
  .mobile-close-btn {
    display: none !important;
  }

  /* Professional Navigation Styles */
  .nav-item {
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 2px 0;
  }

  .nav-item:hover {
    background: ${props => props.$isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
    transform: translateX(2px);
  }

  .nav-item.active {
    background: ${props => props.$isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'};
    border-left: 3px solid #3b82f6;
    font-weight: 600;
  }

  .nav-item.active .nav-icon {
    color: #3b82f6;
  }


  @media (max-width: 768px) {
    width: 100%;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.3s ease;
    
    /* Show close button on mobile */
    .mobile-close-btn {
      display: flex !important;
    }
  }
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#2f2f2f' : '#e5e5e5'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Logo = styled.div`
  width: 32px;
  height: 32px;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#000000'};
  font-weight: bold;
  font-size: 14px;
`;

const LogoText = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#000000'};
`;

const ChevronDown = styled(FaChevronDown)`
  color: ${props => props.$isDarkMode ? '#8e8ea0' : '#6b7280'};
  font-size: 12px;
  margin-left: auto;
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
`;

const Section = styled.div`
  margin-bottom: 1rem;
`;

const SectionTitle = styled.div`
  padding: 0.5rem 1rem;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$isDarkMode ? '#8e8ea0' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const NavItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#000000'};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  border-radius: 0;
  position: relative;

  &:hover {
    background: ${props => props.$isDarkMode ? '#2a2a2a' : '#f0f0f0'};
  }

  &:active {
    background: ${props => props.$isDarkMode ? '#1f1f1f' : '#e5e5e5'};
  }

  &.active {
    background: ${props => props.$isDarkMode ? '#2a2a2a' : '#f0f0f0'};
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #10a37f;
    }
  }
`;

const NavIcon = styled.div`
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const NavText = styled.span`
  flex: 1;
`;


const MobileOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.$isOpen ? 'block' : 'none'};

  @media (min-width: 769px) {
    display: none;
  }
`;

const Sidebar = ({ isOpen, onClose, onSocialMediaClick, onTabNavigation }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: FaHome, path: '/', color: '#10a37f' },
    { id: 'who-is-troika', label: 'Who is Troika?', icon: FaInfoCircle, path: '/who-is-troika', color: '#10a37f' },
    { id: 'what-is-ai-agent', label: 'What is AI agent?', icon: FaBrain, path: '/what-is-ai-agent', color: '#3b82f6' },
    { id: 'how-it-works', label: 'How it works?', icon: FaBolt, path: '/how-it-works', color: '#f59e0b' },
    { id: 'use-case-for-me', label: 'Use Case For Me?', icon: FaChartLine, path: '/use-case-for-me', color: '#8b5cf6' },
    { id: 'pricing-setup', label: 'Pricing & SetUp', icon: FaRupeeSign, path: '/pricing-setup', color: '#dc2626' },
    { id: 'social-media', label: 'Social Media', icon: FaShareAlt, path: '/social-media', color: '#8b5cf6' }
  ];

  const handlePageChange = (pageId, path) => {
    console.log('🔄 Navigating to:', path);
    
    // Use the navigation handler if provided, otherwise use direct navigation
    if (onTabNavigation) {
      onTabNavigation(pageId);
    } else {
      navigate(path);
    }
    
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <MobileOverlay $isOpen={isOpen} onClick={onClose} />
      <SidebarContainer $isDarkMode={isDarkMode} $isOpen={isOpen}>
        <SidebarHeader $isDarkMode={isDarkMode}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo $isDarkMode={isDarkMode}>
              <img src="/logo.png" alt="Supa Agent Logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
            </Logo>
            <LogoText $isDarkMode={isDarkMode}>Troika Tech</LogoText>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: isDarkMode ? '#ffffff' : '#1f2937',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close menu"
            >
              <FaTimes />
            </button>
          )}
        </SidebarHeader>

        <SidebarContent>
          <Section>
            <NavItem 
              $isDarkMode={isDarkMode}
              onClick={() => handlePageChange('new-chat', '/')}
              className=""
            >
              <NavIcon><FaPlus /></NavIcon>
              <NavText>New chat</NavText>
            </NavItem>
          </Section>

          <Section>
            <SectionTitle $isDarkMode={isDarkMode}>Services</SectionTitle>
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavItem
                  key={item.id}
                  $isDarkMode={isDarkMode}
                  onClick={() => handlePageChange(item.id, item.path)}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <NavIcon style={{ color: item.color || 'inherit' }}>
                    <IconComponent />
                  </NavIcon>
                  <NavText>{item.label}</NavText>
                </NavItem>
              );
            })}
          </Section>

        </SidebarContent>

        {/* Powered by Troika Tech - Branding */}
        <div style={{
          padding: "1rem",
          borderTop: `1px solid ${isDarkMode ? '#1f1f1f' : '#e5e5e5'}`,
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          fontSize: "0.875rem",
          fontWeight: "500"
        }}>
          <span>Powered by</span>
          <img
            src="/logo.png"
            alt="Troika Tech"
            style={{
              height: "14px",
              width: "auto",
              filter: isDarkMode ? "brightness(0.8)" : "none"
            }}
          />
          <a
            href="https://troikatech.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
              transition: "color 0.2s ease",
              fontWeight: "600"
            }}
            onMouseEnter={(e) => e.target.style.color = "#8b5cf6"}
            onMouseLeave={(e) => e.target.style.color = isDarkMode ? "#9ca3af" : "#6b7280"}
          >
            Troika Tech
          </a>
        </div>

      </SidebarContainer>
    </>
  );
};

export default Sidebar;
