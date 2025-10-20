import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const MessageWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 0.75rem 0;
  width: 100%;
  animation: slideUp 0.5s ease-out;
  overflow: visible;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageContainer = styled.div`
  max-width: 75%;
  display: flex;
  flex-direction: column;
  order: 1;
`;

const BotHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
`;

const BotAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  font-size: 1.25rem;
`;

const BotAvatarImage = styled.img`
  width: 80%;
  height: 80%;
  object-fit: cover;
  border-radius: 10px;
`;

const BotName = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  transition: color 0.3s ease;
`;

const MessageBubble = styled.div`
  padding: 0.875rem 1rem;
  border-radius: 24px 24px 24px 4px;
  font-size: 1rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  hyphens: auto;
  word-break: break-word;
  position: relative;
  margin: 0.25rem 0;
  width: 100%;
  max-width: 100%;
  min-width: 60px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transform: scale(1);
  transition: transform 0.2s ease, background 0.3s ease, color 0.3s ease;

  @media (min-width: 1200px) {
    min-width: 300px;
  }

  @media (min-width: 1400px) {
    min-width: 350px;
  }

  @media (min-width: 1600px) {
    min-width: 400px;
  }

  &:hover {
    transform: scale(1.02);
  }
  
  @media (max-width: 480px) {
    margin: 0.2rem 0;
    min-width: 50px;
    padding: 0.75rem 0.875rem;
  }
  
  @media (max-width: 360px) {
    margin: 0.15rem 0;
    min-width: 40px;
    padding: 0.625rem 0.75rem;
  }

  background: ${props => props.$isDarkMode ? '#000000' : '#ffffff'};
  color: ${props => props.$isDarkMode ? '#ffffff' : '#1f2937'};
  border: 1px solid ${props => props.$isDarkMode ? '#374151' : '#e5e7eb'};
`;

const OtpContent = styled.div`
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  width: 100%;
  max-width: 100%;
`;

const OtpTitle = styled.h3`
  color: ${props => props.$isDarkMode ? '#f9fafb' : '#111827'};
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const OtpSubtitle = styled.p`
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  text-align: center;
`;

const OtpInputsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const OtpInput = styled.input`
  width: 3rem;
  height: 3rem;
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
  padding: 0.75rem 1rem;
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
  padding: 0.5rem 1rem;
  background: transparent;
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  border: 1px solid ${props => props.$isDarkMode ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.75rem;
  
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
  margin-top: 0.5rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#9ca3af'};
  margin-top: 0.75rem;
  display: block;
  transition: color 0.3s ease;
`;

const OtpMessageBubble = ({ 
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
    <MessageWrapper>
      <MessageContainer>
        {/* Show AI Assistant header OUTSIDE bubble */}
        <BotHeader>
          <BotAvatar>
            <BotAvatarImage
              src="/logo.png"
              alt="AI"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </BotAvatar>
          <BotName $isDarkMode={isDarkMode}>AI Assistant</BotName>
        </BotHeader>

        <MessageBubble $isDarkMode={isDarkMode}>
          <OtpContent>
            <OtpTitle $isDarkMode={isDarkMode}>Enter Verification Code</OtpTitle>
            <OtpSubtitle $isDarkMode={isDarkMode}>
              We sent a 6-digit code to your WhatsApp number
            </OtpSubtitle>
            
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
          </OtpContent>

          {/* Timestamp inside message bubble */}
          <Timestamp $isDarkMode={isDarkMode}>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Timestamp>
        </MessageBubble>
      </MessageContainer>
    </MessageWrapper>
  );
};

export default OtpMessageBubble;
