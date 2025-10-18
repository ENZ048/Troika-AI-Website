import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { FiGlobe, FiPhone, FiMessageCircle } from 'react-icons/fi';
import { RiWhatsappLine, RiTelegramLine } from 'react-icons/ri';

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  /* Hide on mobile */
  @media (max-width: 768px) {
    display: none;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.625rem;
  }
`;

const ServiceButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.$isActive 
    ? props.$isDarkMode ? '#111111' : '#f3f4f6'
    : props.$isDarkMode ? '#000000' : '#ffffff'};
  border: 1px solid ${props => props.$isActive 
    ? '#8b5cf6' 
    : props.$isDarkMode ? '#404040' : '#e5e7eb'};
  border-radius: 8px;
  color: ${props => props.$isActive 
    ? '#8b5cf6' 
    : props.$isDarkMode ? '#ffffff' : '#1f2937'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  svg {
    font-size: 1.125rem;
    flex-shrink: 0;
  }
  
  &:hover {
    background: ${props => props.$isDarkMode ? '#111111' : '#f9fafb'};
    border-color: ${props => props.$isDarkMode ? '#525252' : '#d1d5db'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    font-size: 0.8125rem;
    padding: 0.625rem 0.875rem;
    
    svg {
      font-size: 1rem;
    }
  }
`;

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: slideDown 0.2s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const QuestionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: ${props => props.$isDarkMode ? '#000000' : '#ffffff'};
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e5e7eb'};
  border-radius: 8px;
  color: ${props => props.$isDarkMode ? '#e5e7eb' : '#374151'};
  font-size: 0.875rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  svg {
    font-size: 1rem;
    color: ${props => props.$isDarkMode ? '#a1a1aa' : '#6b7280'};
    flex-shrink: 0;
  }
  
  &:hover {
    background: ${props => props.$isDarkMode ? '#111111' : '#f9fafb'};
    border-color: #8b5cf6;
    color: #8b5cf6;
    transform: translateY(-1px);
    
    svg {
      color: #8b5cf6;
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 480px) {
    font-size: 0.8125rem;
    padding: 0.75rem 0.875rem;
    gap: 0.625rem;
  }
`;

const serviceQuestions = {
  'ai-websites': [
    'How can AI Websites help grow my business?',
    'What features does an AI Website include?',
    'Can I customize my AI Website design?'
  ],
  'ai-calling': [
    'How does the AI Calling Agent work?',
    'Can AI Calling Agent handle multiple calls simultaneously?',
    'What languages does the AI Calling Agent support?'
  ],
  'ai-telegram': [
    'How do I set up an AI Telegram Agent?',
    'Can the Telegram bot handle customer queries 24/7?',
    'What kind of automation can Telegram Agent provide?'
  ],
  'ai-whatsapp': [
    'How does AI WhatsApp Agent integrate with my business?',
    'Can WhatsApp Agent send automated messages?',
    'Is WhatsApp Agent compliant with privacy regulations?'
  ]
};

const ServiceSuggestions = ({ onQuestionClick, isWelcomeMode }) => {
  const { isDarkMode } = useTheme();
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { id: 'ai-websites', label: 'AI Website', icon: FiGlobe },
    { id: 'ai-calling', label: 'AI Calling', icon: FiPhone },
    { id: 'ai-telegram', label: 'AI Telegram', icon: RiTelegramLine },
    { id: 'ai-whatsapp', label: 'AI WhatsApp', icon: RiWhatsappLine }
  ];

  const handleServiceClick = (serviceId) => {
    setSelectedService(selectedService === serviceId ? null : serviceId);
  };

  const handleQuestionClick = (question) => {
    onQuestionClick(question);
    setSelectedService(null); // Close the questions after selection
  };

  // Only show on welcome mode
  if (!isWelcomeMode) return null;

  return (
    <Container>
      <ServicesGrid>
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <ServiceButton
              key={service.id}
              $isDarkMode={isDarkMode}
              $isActive={selectedService === service.id}
              onClick={() => handleServiceClick(service.id)}
            >
              <Icon />
              {service.label}
            </ServiceButton>
          );
        })}
      </ServicesGrid>
      
      {selectedService && (
        <QuestionsContainer>
          {serviceQuestions[selectedService].map((question, index) => (
            <QuestionButton
              key={index}
              $isDarkMode={isDarkMode}
              onClick={() => handleQuestionClick(question)}
            >
              <FiMessageCircle />
              {question}
            </QuestionButton>
          ))}
        </QuestionsContainer>
      )}
    </Container>
  );
};

export default ServiceSuggestions;

