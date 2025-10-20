import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: ${props => props.$isDarkMode ? '#1f2937' : '#ffffff'};
  border: 2px solid ${props => props.$isDarkMode ? '#374151' : '#e5e7eb'};
  border-radius: 16px;
  padding: 32px;
  margin: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    padding: 24px;
    margin: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const ModalAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
`;

const ModalAvatarImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: cover;
  border-radius: 12px;
`;

const ModalTitle = styled.h2`
  color: ${props => props.$isDarkMode ? '#f9fafb' : '#111827'};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const ModalSubtitle = styled.p`
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  font-size: 1rem;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  color: ${props => props.$isDarkMode ? '#d1d5db' : '#374151'};
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.$isDarkMode ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$isDarkMode ? '#1f2937' : '#ffffff'};
  color: ${props => props.$isDarkMode ? '#f9fafb' : '#111827'};
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.$isDarkMode ? '#9ca3af' : '#9ca3af'};
  }
`;

const SendButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 12px;
  text-align: center;
`;

const AuthModal = ({
  onSendOtp,
  loading,
  error
}) => {
  const { isDarkMode } = useTheme();
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendOtp(phone);
  };

  const isValidInput = () => {
    return phone.length >= 10;
  };

  return (
    <ModalOverlay>
      <ModalContainer $isDarkMode={isDarkMode}>
        <ModalHeader>
          <ModalAvatar>
            <ModalAvatarImage
              src="/logo.png"
              alt="AI"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </ModalAvatar>
          <ModalTitle $isDarkMode={isDarkMode}>AI Assistant</ModalTitle>
        </ModalHeader>

        <ModalSubtitle $isDarkMode={isDarkMode}>
          Please verify your WhatsApp number to continue chatting
        </ModalSubtitle>

        <form onSubmit={handleSubmit}>
          <InputContainer>
            <InputLabel $isDarkMode={isDarkMode}>
              Phone Number
            </InputLabel>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              $isDarkMode={isDarkMode}
              required
            />
          </InputContainer>

          <SendButton
            type="submit"
            disabled={!isValidInput() || loading}
          >
            {loading ? 'Sending...' : 'Send OTP via WhatsApp'}
          </SendButton>

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AuthModal;
