import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isDarkMode
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.90) 100%)'
  };
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);

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
  position: relative;
  background: ${props => props.$isDarkMode
    ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${props => props.$isDarkMode
    ? 'rgba(148, 163, 184, 0.1)'
    : 'rgba(226, 232, 240, 0.8)'
  };
  border-radius: 24px;
  padding: 40px;
  margin: 20px;
  box-shadow: ${props => props.$isDarkMode
    ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(148, 163, 184, 0.05), inset 0 1px 0 0 rgba(148, 163, 184, 0.05)'
    : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
  };
  max-width: 440px;
  width: 100%;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: ${props => props.$isDarkMode
      ? 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.08) 0%, transparent 60%)'
      : 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.05) 0%, transparent 60%)'
    };
    pointer-events: none;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 480px) {
    padding: 32px 24px;
    margin: 16px;
    border-radius: 20px;
  }
`;

const ModalHeader = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  z-index: 1;
`;

const ModalAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => props.$isDarkMode
    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)'
  };
  border: 1px solid ${props => props.$isDarkMode
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  box-shadow: ${props => props.$isDarkMode
    ? '0 8px 24px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    : '0 8px 24px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
  };
`;

const ModalAvatarImage = styled.img`
  width: 85%;
  height: 85%;
  object-fit: cover;
  border-radius: 14px;
`;

const ModalTitle = styled.h2`
  color: ${props => props.$isDarkMode ? '#f1f5f9' : '#0f172a'};
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
  background: ${props => props.$isDarkMode
    ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'
    : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)'
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ModalSubtitle = styled.p`
  position: relative;
  color: ${props => props.$isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 1rem;
  margin: 0 0 32px 0;
  line-height: 1.6;
  z-index: 1;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 28px;
  z-index: 1;
`;

const InputLabel = styled.label`
  display: block;
  color: ${props => props.$isDarkMode ? '#cbd5e1' : '#334155'};
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 18px;
  border: 2px solid ${props => props.$isDarkMode
    ? 'rgba(148, 163, 184, 0.15)'
    : 'rgba(226, 232, 240, 0.8)'
  };
  border-radius: 12px;
  background: ${props => props.$isDarkMode
    ? 'rgba(15, 23, 42, 0.4)'
    : 'rgba(255, 255, 255, 0.8)'
  };
  color: ${props => props.$isDarkMode ? '#f1f5f9' : '#0f172a'};
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  box-shadow: ${props => props.$isDarkMode
    ? 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
    : 'inset 0 2px 4px rgba(0, 0, 0, 0.03)'
  };

  &:hover {
    border-color: ${props => props.$isDarkMode
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.4)'
    };
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: ${props => props.$isDarkMode
      ? 'rgba(15, 23, 42, 0.6)'
      : '#ffffff'
    };
    box-shadow: ${props => props.$isDarkMode
      ? '0 0 0 4px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
      : '0 0 0 4px rgba(59, 130, 246, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.03)'
    };
    transform: translateY(-1px);
  }

  &::placeholder {
    color: ${props => props.$isDarkMode ? '#64748b' : '#94a3b8'};
  }
`;

const SendButton = styled.button`
  position: relative;
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3),
              0 2px 4px rgba(59, 130, 246, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 1;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4),
                0 3px 8px rgba(59, 130, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);

    &::before {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: ${props => props.$isDarkMode
      ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
      : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'
    };
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.6;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 16px;
  padding: 12px 16px;
  background: ${props => props.$isDarkMode
    ? 'rgba(239, 68, 68, 0.1)'
    : 'rgba(254, 226, 226, 0.8)'
  };
  border: 1px solid ${props => props.$isDarkMode
    ? 'rgba(239, 68, 68, 0.2)'
    : 'rgba(239, 68, 68, 0.3)'
  };
  border-radius: 10px;
  text-align: center;
  animation: shake 0.3s ease-in-out;

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
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
    <ModalOverlay $isDarkMode={isDarkMode}>
      <ModalContainer $isDarkMode={isDarkMode}>
        <ModalHeader>
          <ModalAvatar $isDarkMode={isDarkMode}>
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
          Please verify your phone number to access our website
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
              placeholder="Enter your phone number"
              $isDarkMode={isDarkMode}
              required
            />
          </InputContainer>

          <SendButton
            type="submit"
            disabled={!isValidInput() || loading}
            $isDarkMode={isDarkMode}
          >
            <span>{loading ? 'Sending...' : 'Send OTP'}</span>
          </SendButton>

          {error && (
            <ErrorMessage $isDarkMode={isDarkMode}>{error}</ErrorMessage>
          )}
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AuthModal;
