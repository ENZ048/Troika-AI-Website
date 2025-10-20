import React, { useState, useRef, useEffect } from 'react';
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

const OtpInputsContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
`;

const OtpInput = styled.input`
  width: 48px;
  height: 48px;
  border: 2px solid ${props => props.$isDarkMode ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$isDarkMode ? '#1f2937' : '#ffffff'};
  color: ${props => props.$isDarkMode ? '#f9fafb' : '#111827'};
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:invalid {
    border-color: #ef4444;
  }
`;

const VerifyButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResendButton = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  border: 1px solid ${props => props.$isDarkMode ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
  
  &:hover:not(:disabled) {
    background: ${props => props.$isDarkMode ? '#374151' : '#f3f4f6'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 12px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 12px;
  text-align: center;
`;

const OtpModal = ({ 
  onVerifyOtp, 
  onResendOtp, 
  loading, 
  error, 
  success,
  resendCooldown 
}) => {
  const { isDarkMode } = useTheme();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onVerifyOtp(otpString);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

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
          We sent a 6-digit verification code to your phone number
        </ModalSubtitle>
        
        <form onSubmit={handleSubmit}>
          <OtpInputsContainer>
            {otp.map((digit, index) => (
              <OtpInput
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                $isDarkMode={isDarkMode}
                required
              />
            ))}
          </OtpInputsContainer>

          <VerifyButton
            type="submit"
            disabled={!isOtpComplete || loading}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </VerifyButton>

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          {success && (
            <SuccessMessage>{success}</SuccessMessage>
          )}

          <ResendButton
            type="button"
            onClick={onResendOtp}
            disabled={resendCooldown > 0}
            $isDarkMode={isDarkMode}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </ResendButton>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default OtpModal;
