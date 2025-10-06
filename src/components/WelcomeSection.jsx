import React from "react";
import styled from "styled-components";
import { useTheme } from "../contexts/ThemeContext";

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 4rem 2rem;
  text-align: center;
  background: transparent;
  flex: 0 0 auto;
  position: relative;
  overflow: visible;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  
  /* Force visibility in production */
  visibility: visible !important;
  opacity: 1 !important;
  display: flex !important;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
    animation: float 6s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: -30%;
    right: -30%;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
    animation: float 8s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
  }

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    padding: 3rem 1.5rem;
    justify-content: flex-start;
  }

  @media (max-width: 900px) {
    padding: 2.5rem 1.25rem;
    justify-content: flex-start;
  }

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    justify-content: flex-start;
  }

  @media (max-width: 640px) {
    padding: 1.5rem 0.75rem;
    justify-content: flex-start;
  }

  @media (max-width: 600px) {
    padding: 1.25rem 0.5rem;
    justify-content: flex-start;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.4rem;
    justify-content: flex-start;
  }

  @media (max-width: 414px) {
    padding: 0.875rem 0.3rem;
    justify-content: flex-start;
  }

  @media (max-width: 390px) {
    padding: 0.75rem 0.25rem;
    justify-content: flex-start;
  }

  @media (max-width: 375px) {
    padding: 0.625rem 0.2rem;
    justify-content: flex-start;
  }

  @media (max-width: 360px) {
    padding: 0.5rem 0.15rem;
    justify-content: flex-start;
  }

  @media (max-width: 320px) {
    padding: 0.4rem 0.1rem;
    justify-content: flex-start;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  z-index: 2;
  margin-bottom: 1.5rem;

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    margin-bottom: 1.25rem;
  }

  @media (max-width: 900px) {
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    margin-bottom: 0.875rem;
  }

  @media (max-width: 640px) {
    margin-bottom: 0.75rem;
  }

  @media (max-width: 600px) {
    margin-bottom: 0.625rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 0.5rem;
  }

  @media (max-width: 414px) {
    margin-bottom: 0.4rem;
  }

  @media (max-width: 390px) {
    margin-bottom: 0.35rem;
  }

  @media (max-width: 375px) {
    margin-bottom: 0.3rem;
  }

  @media (max-width: 360px) {
    margin-bottom: 0.25rem;
  }

  @media (max-width: 320px) {
    margin-bottom: 0.2rem;
  }
`;

const AvatarCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
  position: relative;
  margin-bottom: 1rem;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b);
    z-index: -1;
    animation: rotate 3s linear infinite;
  }

  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    width: 110px;
    height: 110px;
    margin-bottom: 0.875rem;
  }

  @media (max-width: 900px) {
    width: 105px;
    height: 105px;
    margin-bottom: 0.75rem;
  }

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    margin-bottom: 0.625rem;
  }

  @media (max-width: 640px) {
    width: 90px;
    height: 90px;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 600px) {
    width: 85px;
    height: 85px;
    margin-bottom: 0.4rem;
  }

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
    margin-bottom: 0.35rem;
  }

  @media (max-width: 414px) {
    width: 75px;
    height: 75px;
    margin-bottom: 0.3rem;
  }

  @media (max-width: 390px) {
    width: 70px;
    height: 70px;
    margin-bottom: 0.25rem;
  }

  @media (max-width: 375px) {
    width: 65px;
    height: 65px;
    margin-bottom: 0.2rem;
  }

  @media (max-width: 360px) {
    width: 60px;
    height: 60px;
    margin-bottom: 0.15rem;
  }

  @media (max-width: 320px) {
    width: 55px;
    height: 55px;
    margin-bottom: 0.1rem;
  }
`;

const AvatarImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
  z-index: 1;

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    width: 70px;
    height: 70px;
  }

  @media (max-width: 900px) {
    width: 65px;
    height: 65px;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }

  @media (max-width: 640px) {
    width: 55px;
    height: 55px;
  }

  @media (max-width: 600px) {
    width: 50px;
    height: 50px;
  }

  @media (max-width: 480px) {
    width: 45px;
    height: 45px;
  }

  @media (max-width: 414px) {
    width: 40px;
    height: 40px;
  }

  @media (max-width: 390px) {
    width: 38px;
    height: 38px;
  }

  @media (max-width: 375px) {
    width: 35px;
    height: 35px;
  }

  @media (max-width: 360px) {
    width: 32px;
    height: 32px;
  }

  @media (max-width: 320px) {
    width: 30px;
    height: 30px;
  }
`;

const OnlineIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #10b981;
  animation: pulse 2s infinite;
`;

const GreetingText = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#1f2937'};
  margin: 0 0 0.5rem 0;
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SubText = styled.p`
  font-size: 1.1rem;
  color: ${props => props.$isDarkMode ? '#a0a0a0' : '#6b7280'};
  margin: 0 0 2rem 0;
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SuggestionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  position: relative;
  z-index: 2;
  margin: 0 auto;
  
  /* Force visibility in production */
  visibility: visible !important;
  opacity: 1 !important;
  display: grid !important;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    max-width: 400px;
  }
`;

const SuggestionCard = styled.button`
  background: ${props => props.$isDarkMode ? '#2d2d2d' : 'white'};
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e5e7eb'};
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
    border-color: #8b5cf6;
  }

  &:active {
    transform: translateY(0);
  }
`;

const SuggestionIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const SuggestionText = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.$isDarkMode ? '#e5e7eb' : '#374151'};
  flex: 1;
  transition: color 0.3s ease;
`;


const FeatureTags = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
  justify-content: center;
  
  /* Force visibility in production */
  visibility: visible !important;
  opacity: 1 !important;
  display: flex !important;

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    gap: 0.8rem;
    margin-top: 1.25rem;
  }

  @media (max-width: 900px) {
    gap: 0.75rem;
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    gap: 0.6rem;
    margin-top: 0.875rem;
    flex-direction: column;
    align-items: center;
  }

  @media (max-width: 640px) {
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  @media (max-width: 600px) {
    gap: 0.4rem;
    margin-top: 0.625rem;
  }

  @media (max-width: 480px) {
    gap: 0.3rem;
    margin-top: 0.5rem;
  }

  @media (max-width: 414px) {
    gap: 0.25rem;
    margin-top: 0.4rem;
  }

  @media (max-width: 390px) {
    gap: 0.2rem;
    margin-top: 0.35rem;
  }

  @media (max-width: 375px) {
    gap: 0.15rem;
    margin-top: 0.3rem;
  }

  @media (max-width: 360px) {
    gap: 0.1rem;
    margin-top: 0.25rem;
  }

  @media (max-width: 320px) {
    gap: 0.05rem;
    margin-top: 0.2rem;
  }
`;

const FeatureTag = styled.div`
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;

  &:hover {
    background: rgba(139, 92, 246, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  }

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    padding: 0.45rem 0.9rem;
    font-size: 0.8rem;
    border-radius: 18px;
    gap: 0.45rem;
  }

  @media (max-width: 900px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    border-radius: 16px;
    gap: 0.4rem;
  }

  @media (max-width: 768px) {
    padding: 0.35rem 0.7rem;
    font-size: 0.7rem;
    border-radius: 14px;
    gap: 0.35rem;
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }

  @media (max-width: 640px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
    border-radius: 12px;
    gap: 0.3rem;
    max-width: 180px;
  }

  @media (max-width: 600px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.6rem;
    border-radius: 10px;
    gap: 0.25rem;
    max-width: 160px;
  }

  @media (max-width: 480px) {
    padding: 0.2rem 0.4rem;
    font-size: 0.55rem;
    border-radius: 8px;
    gap: 0.2rem;
    max-width: 140px;
  }

  @media (max-width: 414px) {
    padding: 0.18rem 0.35rem;
    font-size: 0.5rem;
    border-radius: 7px;
    gap: 0.18rem;
    max-width: 120px;
  }

  @media (max-width: 390px) {
    padding: 0.15rem 0.3rem;
    font-size: 0.48rem;
    border-radius: 6px;
    gap: 0.15rem;
    max-width: 110px;
  }

  @media (max-width: 375px) {
    padding: 0.12rem 0.25rem;
    font-size: 0.45rem;
    border-radius: 5px;
    gap: 0.12rem;
    max-width: 100px;
  }

  @media (max-width: 360px) {
    padding: 0.1rem 0.2rem;
    font-size: 0.42rem;
    border-radius: 4px;
    gap: 0.1rem;
    max-width: 90px;
  }

  @media (max-width: 320px) {
    padding: 0.08rem 0.15rem;
    font-size: 0.4rem;
    border-radius: 3px;
    gap: 0.08rem;
    max-width: 80px;
  }
`;

const WelcomeSection = ({ onSuggestionClick }) => {
  const { isDarkMode } = useTheme();

  const suggestions = [
    {
      icon: "💰",
      text: "What are your pricing plans?",
      action: "pricing"
    },
    {
      icon: "🚀",
      text: "How do I get started?",
      action: "getting-started"
    },
    {
      icon: "🌍",
      text: "What languages do you support?",
      action: "languages"
    },
    {
      icon: "📞",
      text: "Book a demo call",
      action: "demo"
    }
  ];

  const features = [
    { icon: "💬", text: "80+ Languages" },
    { icon: "⚡", text: "Instant Responses" },
    { icon: "✨", text: "AI-Powered" }
  ];

  return (
    <WelcomeContainer>
      <AvatarContainer>
        <AvatarCircle>
          <AvatarImage
            src="https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png"
            alt="Supa Agent"
            onError={(e) => {
              e.target.src = "https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png";
            }}
          />
          <OnlineIndicator />
        </AvatarCircle>
      </AvatarContainer>
      
      <GreetingText $isDarkMode={isDarkMode}>Hi! I'm Supa Agent 👋</GreetingText>
      <SubText $isDarkMode={isDarkMode}>Your AI assistant ready to help in any language! 🌍</SubText>

      <SuggestionsContainer>
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={index}
            $isDarkMode={isDarkMode}
            onClick={() => onSuggestionClick && onSuggestionClick(suggestion.action)}
          >
            <SuggestionIcon>{suggestion.icon}</SuggestionIcon>
            <SuggestionText $isDarkMode={isDarkMode}>{suggestion.text}</SuggestionText>
          </SuggestionCard>
        ))}
      </SuggestionsContainer>
      
      <FeatureTags>
        {features.map((feature, index) => (
          <FeatureTag key={index}>
            <span>{feature.icon}</span>
            <span>{feature.text}</span>
          </FeatureTag>
        ))}
      </FeatureTags>
      
    </WelcomeContainer>
  );
};

export default WelcomeSection;
