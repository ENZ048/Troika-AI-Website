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
  FaPhoneAlt,
  FaMagic,
  FaTelegram,
  FaInstagram,
  FaLinkedin
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
  outline: none;
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
    outline: none;
  }

  &:focus {
    outline: none;
  }

  &.active {
    background: ${props => props.$isDarkMode ? '#2a2a2a' : '#f0f0f0'};
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

const SocialIconsContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.$isDarkMode ? '#2f2f2f' : '#e5e5e5'};
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: auto;
`;

const SocialIcon = styled.a`
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: space-betwen;
  border-radius: 8px;
  background: transparent;
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  transition: all 0.2s ease;

  svg {
    width: 30px;
    height: 30px;
  }

  &:hover {
    color: ${props => props.$hoverColor || '#8b5cf6'};
    transform: translateY(-2px);
  }
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
    { id: 'ai-agent', label: 'AI Agent', icon: FaBrain, path: '/ai-agent', color: '#10a37f' },
    { id: 'ai-calling-agent', label: 'AI Calling Agent', icon: FaPhoneAlt, path: '/ai-calling-agent', color: '#3b82f6' },
    { id: 'whatsapp-marketing', label: 'WhatsApp Marketing', icon: FaWhatsapp, path: '/whatsapp-marketing', color: '#25d366' },
    { id: 'rcs-messaging', label: 'RCS Messaging', icon: FaComment, path: '/rcs-messaging', color: '#8b5cf6' }
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
              <NavIcon><FaMagic   /></NavIcon>
              <NavText>Ask Me Anything</NavText>
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

          <Section>
            <SectionTitle $isDarkMode={isDarkMode}>Contact</SectionTitle>
            <NavItem
              $isDarkMode={isDarkMode}
              onClick={() => handlePageChange('get-quote', '/get-quote')}
              className={`nav-item ${isActive('/get-quote') ? 'active' : ''}`}
            >
              <NavIcon style={{ color: '#f59e0b' }}>
                <FaRupeeSign />
              </NavIcon>
              <NavText>Get Quote</NavText>
            </NavItem>
            <NavItem
              $isDarkMode={isDarkMode}
              onClick={() => handlePageChange('schedule-meeting', '/schedule-meeting')}
              className={`nav-item ${isActive('/schedule-meeting') ? 'active' : ''}`}
            >
              <NavIcon style={{ color: '#ec4899' }}>
                <FaHandshake />
              </NavIcon>
              <NavText>Schedule a Meeting</NavText>
            </NavItem>
            <NavItem
              $isDarkMode={isDarkMode}
              onClick={() => handlePageChange('book-call', '/book-call')}
              className={`nav-item ${isActive('/book-call') ? 'active' : ''}`}
            >
              <NavIcon style={{ color: '#10b981' }}>
                <FaPhone />
              </NavIcon>
              <NavText>Book a Call</NavText>
            </NavItem>
          </Section>

        </SidebarContent>

        {/* Social Media Icons */}
        <SocialIconsContainer $isDarkMode={isDarkMode}>
          <SocialIcon
            href="https://wa.me/your-number"
            target="_blank"
            rel="noopener noreferrer"
            $isDarkMode={isDarkMode}
            $hoverColor="#25d366"
            title="WhatsApp"
          >
            <FaWhatsapp />
          </SocialIcon>
          <SocialIcon
            href="https://t.me/your-telegram"
            target="_blank"
            rel="noopener noreferrer"
            $isDarkMode={isDarkMode}
            $hoverColor="#0088cc"
            title="Telegram"
          >
            <FaTelegram />
          </SocialIcon>
          <SocialIcon
            href="https://instagram.com/your-instagram"
            target="_blank"
            rel="noopener noreferrer"
            $isDarkMode={isDarkMode}
            $hoverColor="#E4405F"
            title="Instagram"
          >
            <FaInstagram />
          </SocialIcon>
          <SocialIcon
            href="https://linkedin.com/company/your-linkedin"
            target="_blank"
            rel="noopener noreferrer"
            $isDarkMode={isDarkMode}
            $hoverColor="#0077b5"
            title="LinkedIn"
          >
            <FaLinkedin />
          </SocialIcon>
        </SocialIconsContainer>

        {/* Powered by Troika Tech - Branding */}
        <div style={{
          padding: "1rem",
          borderTop: `1px solid ${isDarkMode ? '#1f1f1f' : '#e5e5e5'}`,
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
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
