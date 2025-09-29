import React from "react";
import styled from "styled-components";
import { FiArrowUp, FiMic, FiSquare, FiVolume2, FiVolumeX } from "react-icons/fi";
import { IoSend } from "react-icons/io5";

const InputContainer = styled.div`
  flex-shrink: 0;
  padding: 1rem 1.25rem 1.25rem 1.25rem;
  border-top: none;
  background: transparent;
  position: relative;

  /* Enhanced mobile responsiveness - Better mobile spacing */
  @media (max-width: 1200px) {
    padding: 1.2rem 1.1rem 1.1rem 1.1rem;
  }

  @media (max-width: 1024px) {
    padding: 1.1rem 1rem 1rem 1rem;
  }

  @media (max-width: 900px) {
    padding: 1rem 0.9rem 0.9rem 0.9rem;
  }

  @media (max-width: 768px) {
    padding: 0.9rem 0.8rem 0.8rem 0.8rem;
  }

  @media (max-width: 640px) {
    padding: 0.8rem 0.7rem 0.7rem 0.7rem;
  }

  @media (max-width: 600px) {
    padding: 0.75rem 0.65rem 0.65rem 0.65rem;
  }

  @media (max-width: 480px) {
    padding: 0.7rem 0.6rem 0.6rem 0.6rem;
  }

  @media (max-width: 414px) {
    padding: 0.65rem 0.55rem 0.55rem 0.55rem;
  }

  @media (max-width: 390px) {
    padding: 0.6rem 0.5rem 0.5rem 0.5rem;
  }

  @media (max-width: 375px) {
    padding: 0.55rem 0.45rem 0.45rem 0.45rem;
  }

  @media (max-width: 360px) {
    padding: 0.5rem 0.4rem 0.4rem 0.4rem;
  }

  @media (max-width: 320px) {
    padding: 0.45rem 0.35rem 0.35rem 0.35rem;
  }
`;

const ChatInput = styled.input`
  padding: 1.01rem 172px 1.01rem 1.15rem; /* Increased by 15% from 0.875rem 150px 0.875rem 1rem */
  border: 1px solid #e5e7eb;
  border-radius: 29px; /* Increased by 15% from 25px */
  font-size: 1rem; /* Increased by 15% from 1rem for better readability */
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: all 0.3s;
  background: #f8f9fa;
  color: #000;
  line-height: 1.4; /* Added line height for better readability */
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: #2d2d2d;
    color: #ffffff;
    border-color: #4a4a4a;
  }
  
  /* Force visibility in all modes */
  &::placeholder {
    color: #666;
    @media (prefers-color-scheme: dark) {
      color: #999;
    }
  }
  
  &:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    background: #ffffff;
    
    /* Dark mode focus state */
    @media (prefers-color-scheme: dark) {
      background: #2d2d2d;
      color: #ffffff;
    }
  }

  /* Enhanced mobile responsiveness - Better mobile input layout with improved font scaling */
  @media (max-width: 1200px) {
    padding: 1.04rem 161px 1.04rem 1.04rem; /* Increased by 15% from 0.9rem 140px 0.9rem 0.9rem */
    font-size: 1.13rem; /* Increased by 15% from 0.98rem for better readability */
    border-radius: 28px; /* Increased by 15% from 24px */
    line-height: 1.38;
  }

  @media (max-width: 1024px) {
    padding: 0.98rem 155px 0.98rem 0.92rem; /* Increased by 15% from 0.85rem 135px 0.85rem 0.8rem */
    font-size: 1.1rem; /* Increased by 15% from 0.96rem for improved readability */
    border-radius: 26px; /* Increased by 15% from 23px */
    line-height: 1.36;
  }

  @media (max-width: 900px) {
    padding: 0.92rem 150px 0.92rem 0.86rem; /* Increased by 15% from 0.8rem 130px 0.8rem 0.75rem */
    font-size: 1.08rem; /* Increased by 15% from 0.94rem for better mobile readability */
    border-radius: 25px; /* Increased by 15% from 22px */
    line-height: 1.34;
  }

  @media (max-width: 768px) {
    padding: 0.86rem 144px 0.86rem 0.81rem; /* Increased by 15% from 0.75rem 125px 0.75rem 0.7rem */
    font-size: 1.06rem; /* Increased by 15% from 0.92rem for maintained readability on tablets */
    border-radius: 24px; /* Increased by 15% from 21px */
    line-height: 1.32;
  }

  @media (max-width: 640px) {
    padding: 0.81rem 138px 0.81rem 0.75rem; /* Increased by 15% from 0.7rem 120px 0.7rem 0.65rem */
    font-size: 1.04rem; /* Increased by 15% from 0.9rem for good mobile readability */
    border-radius: 22px; /* Increased by 15% from 19px */
    line-height: 1.3;
  }

  @media (max-width: 600px) {
    padding: 0.75rem 132px 0.75rem 0.69rem; /* Increased by 15% from 0.65rem 115px 0.65rem 0.6rem */
    font-size: 1.01rem; /* Increased by 15% from 0.88rem for optimized small screens */
    border-radius: 21px; /* Increased by 15% from 18px */
    line-height: 1.28;
  }

  @media (max-width: 480px) {
    padding: 0.69rem 127px 0.69rem 0.63rem; /* Increased by 15% from 0.6rem 110px 0.6rem 0.55rem */
    font-size: 1.06rem; /* Increased by 15% from 0.92rem for better mobile readability */
    border-radius: 20px; /* Increased by 15% from 17px */
    line-height: 1.26;
  }

  @media (max-width: 414px) {
    padding: 0.63rem 121px 0.63rem 0.58rem; /* Increased by 15% from 0.55rem 105px 0.55rem 0.5rem */
    font-size: 1.04rem; /* Increased by 15% from 0.9rem for iPhone readability */
    border-radius: 18px; /* Increased by 15% from 16px */
    line-height: 1.24;
  }

  @media (max-width: 390px) {
    padding: 0.58rem 115px 0.58rem 0.52rem; /* Increased by 15% from 0.5rem 100px 0.5rem 0.45rem */
    font-size: 1.01rem; /* Increased by 15% from 0.88rem for small phone optimization */
    border-radius: 17px; /* Increased by 15% from 15px */
    line-height: 1.22;
  }

  @media (max-width: 375px) {
    padding: 0.52rem 109px 0.52rem 0.46rem; /* Increased by 15% from 0.45rem 95px 0.45rem 0.4rem */
    font-size: 0.99rem; /* Increased by 15% from 0.86rem for iPhone SE readability */
    border-radius: 16px; /* Increased by 15% from 14px */
    line-height: 1.2;
  }

  @media (max-width: 360px) {
    padding: 0.46rem 104px 0.46rem 0.4rem; /* Increased by 15% from 0.4rem 90px 0.4rem 0.35rem */
    font-size: 0.97rem; /* Increased by 15% from 0.84rem for very small screens */
    border-radius: 15px; /* Increased by 15% from 13px */
    line-height: 1.18;
  }

  @media (max-width: 320px) {
    padding: 0.4rem 98px 0.4rem 0.35rem; /* Increased by 15% from 0.35rem 85px 0.35rem 0.3rem */
    font-size: 0.94rem; /* Increased by 15% from 0.82rem for minimum readable size */
    border-radius: 14px; /* Increased by 15% from 12px */
    line-height: 1.16;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
`;

const InputButtons = styled.div`
  position: absolute;
  right: 9px; /* Increased by 15% from 8px */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 7px; /* Increased by 15% from 6px */

  /* Enhanced mobile responsiveness - Comprehensive breakpoints */
  @media (max-width: 1200px) {
    right: 8.6px; /* Increased by 15% from 7.5px */
    gap: 8.6px; /* Increased by 15% from 7.5px */
  }

  @media (max-width: 1024px) {
    right: 8px; /* Increased by 15% from 7px */
    gap: 8px; /* Increased by 15% from 7px */
  }

  @media (max-width: 900px) {
    right: 7.5px; /* Increased by 15% from 6.5px */
    gap: 7.5px; /* Increased by 15% from 6.5px */
  }

  @media (max-width: 768px) {
    right: 7px; /* Increased by 15% from 6px */
    gap: 7px; /* Increased by 15% from 6px */
  }

  @media (max-width: 640px) {
    right: 5.8px; /* Increased by 15% from 5px */
    gap: 5.8px; /* Increased by 15% from 5px */
  }

  @media (max-width: 600px) {
    right: 5.2px; /* Increased by 15% from 4.5px */
    gap: 5.2px; /* Increased by 15% from 4.5px */
  }

  @media (max-width: 480px) {
    right: 4.6px; /* Increased by 15% from 4px */
    gap: 4.6px; /* Increased by 15% from 4px */
  }

  @media (max-width: 414px) {
    right: 4px; /* Increased by 15% from 3.5px */
    gap: 4px; /* Increased by 15% from 3.5px */
  }

  @media (max-width: 390px) {
    right: 3.5px; /* Increased by 15% from 3px */
    gap: 3.5px; /* Increased by 15% from 3px */
  }

  @media (max-width: 375px) {
    right: 2.9px; /* Increased by 15% from 2.5px */
    gap: 2.9px; /* Increased by 15% from 2.5px */
  }

  @media (max-width: 360px) {
    right: 3.5px; /* Increased by 15% from 3px */
    gap: 3.5px; /* Increased by 15% from 3px */
  }

  @media (max-width: 320px) {
    right: 2.3px; /* Increased by 15% from 2px */
    gap: 2.3px; /* Increased by 15% from 2px */
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #8b5cf6 100%);
  border: none;
  border-radius: 50%;
  width: 41px; /* Increased by 15% from 36px */
  height: 41px; /* Increased by 15% from 36px */
  min-width: 41px; /* Increased by 15% from 36px */
  min-height: 41px; /* Increased by 15% from 36px */
  max-width: 41px; /* Increased by 15% from 36px */
  max-height: 41px; /* Increased by 15% from 36px */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  flex-shrink: 0;
  padding: 0;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
  aspect-ratio: 1;

  svg {
    color: inherit;
    flex-shrink: 0;
    font-size: 21px; /* Increased by 15% from 18px */
    width: 21px; /* Increased by 15% from 18px */
    height: 21px; /* Increased by 15% from 18px */
    font-weight: 900;
    stroke-width: 3;
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #8b5cf6 100%);
    box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: #9ca3af;
    box-shadow: none;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
  }

  /* Enhanced mobile responsiveness - Better touch targets */
  @media (max-width: 1024px) {
    width: 44px; /* Increased by 15% from 38px */
    height: 44px; /* Increased by 15% from 38px */
    min-width: 44px; /* Increased by 15% from 38px */
    min-height: 44px; /* Increased by 15% from 38px */
    max-width: 44px; /* Increased by 15% from 38px */
    max-height: 44px; /* Increased by 15% from 38px */

    svg {
      font-size: 21px; /* Increased by 15% from 18px */
      width: 21px; /* Increased by 15% from 18px */
      height: 21px; /* Increased by 15% from 18px */
    }
  }

  @media (max-width: 768px) {
    width: 41px; /* Increased by 15% from 36px */
    height: 41px; /* Increased by 15% from 36px */
    min-width: 41px; /* Increased by 15% from 36px */
    min-height: 41px; /* Increased by 15% from 36px */
    max-width: 41px; /* Increased by 15% from 36px */
    max-height: 41px; /* Increased by 15% from 36px */

    svg {
      font-size: 20px; /* Increased by 15% from 17px */
      width: 20px; /* Increased by 15% from 17px */
      height: 20px; /* Increased by 15% from 17px */
    }
  }

  @media (max-width: 640px) {
    width: 39px; /* Increased by 15% from 34px */
    height: 39px; /* Increased by 15% from 34px */
    min-width: 39px; /* Increased by 15% from 34px */
    min-height: 39px; /* Increased by 15% from 34px */
    max-width: 39px; /* Increased by 15% from 34px */
    max-height: 39px; /* Increased by 15% from 34px */

    svg {
      font-size: 18px; /* Increased by 15% from 16px */
      width: 18px; /* Increased by 15% from 16px */
      height: 18px; /* Increased by 15% from 16px */
    }
  }

  @media (max-width: 600px) {
    width: 37px; /* Increased by 15% from 32px */
    height: 37px; /* Increased by 15% from 32px */
    min-width: 37px; /* Increased by 15% from 32px */
    min-height: 37px; /* Increased by 15% from 32px */
    max-width: 37px; /* Increased by 15% from 32px */
    max-height: 37px; /* Increased by 15% from 32px */

    svg {
      font-size: 17px; /* Increased by 15% from 15px */
      width: 17px; /* Increased by 15% from 15px */
      height: 17px; /* Increased by 15% from 15px */
    }
  }

  @media (max-width: 480px) {
    width: 35px; /* Increased by 15% from 30px */
    height: 35px; /* Increased by 15% from 30px */
    min-width: 35px; /* Increased by 15% from 30px */
    min-height: 35px; /* Increased by 15% from 30px */
    max-width: 35px; /* Increased by 15% from 30px */
    max-height: 35px; /* Increased by 15% from 30px */

    svg {
      font-size: 16px; /* Increased by 15% from 14px */
      width: 16px; /* Increased by 15% from 14px */
      height: 16px; /* Increased by 15% from 14px */
    }
  }

  @media (max-width: 414px) {
    width: 32px; /* Increased by 15% from 28px */
    height: 32px; /* Increased by 15% from 28px */
    min-width: 32px; /* Increased by 15% from 28px */
    min-height: 32px; /* Increased by 15% from 28px */
    max-width: 32px; /* Increased by 15% from 28px */
    max-height: 32px; /* Increased by 15% from 28px */

    svg {
      font-size: 15px; /* Increased by 15% from 13px */
      width: 15px; /* Increased by 15% from 13px */
      height: 15px; /* Increased by 15% from 13px */
    }
  }

  @media (max-width: 390px) {
    width: 30px; /* Increased by 15% from 26px */
    height: 30px; /* Increased by 15% from 26px */
    min-width: 30px; /* Increased by 15% from 26px */
    min-height: 30px; /* Increased by 15% from 26px */
    max-width: 30px; /* Increased by 15% from 26px */
    max-height: 30px; /* Increased by 15% from 26px */

    svg {
      font-size: 14px; /* Increased by 15% from 12px */
      width: 14px; /* Increased by 15% from 12px */
      height: 14px; /* Increased by 15% from 12px */
    }
  }

  @media (max-width: 375px) {
    width: 28px; /* Increased by 15% from 24px */
    height: 28px; /* Increased by 15% from 24px */
    min-width: 28px; /* Increased by 15% from 24px */
    min-height: 28px; /* Increased by 15% from 24px */
    max-width: 28px; /* Increased by 15% from 24px */
    max-height: 28px; /* Increased by 15% from 24px */

    svg {
      font-size: 13px; /* Increased by 15% from 11px */
      width: 13px; /* Increased by 15% from 11px */
      height: 13px; /* Increased by 15% from 11px */
    }
  }

  @media (max-width: 360px) {
    width: 25px; /* Increased by 15% from 22px */
    height: 25px; /* Increased by 15% from 22px */
    min-width: 25px; /* Increased by 15% from 22px */
    min-height: 25px; /* Increased by 15% from 22px */
    max-width: 25px; /* Increased by 15% from 22px */
    max-height: 25px; /* Increased by 15% from 22px */

    svg {
      font-size: 12px; /* Increased by 15% from 10px */
      width: 12px; /* Increased by 15% from 10px */
      height: 12px; /* Increased by 15% from 10px */
    }
  }

  @media (max-width: 320px) {
    width: 23px; /* Increased by 15% from 20px */
    height: 23px; /* Increased by 15% from 20px */
    min-width: 23px; /* Increased by 15% from 20px */
    min-height: 23px; /* Increased by 15% from 20px */
    max-width: 23px; /* Increased by 15% from 20px */
    max-height: 23px; /* Increased by 15% from 20px */

    svg {
      font-size: 10px; /* Increased by 15% from 9px */
      width: 10px; /* Increased by 15% from 9px */
      height: 10px; /* Increased by 15% from 9px */
    }
  }
`;

const MuteButton = styled.button`
  background: ${props => props.$isMuted ? 'rgba(255, 107, 157, 0.1)' : 'transparent'};
  border: none;
  border-radius: 50%;
  width: 37px; /* Increased by 15% from 32px */
  height: 37px; /* Increased by 15% from 32px */
  min-width: 37px; /* Increased by 15% from 32px */
  min-height: 37px; /* Increased by 15% from 32px */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$isMuted ? '#ff6b9d' : '#ff6b9d'};
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 9999;
  transform: scale(1);

  svg {
    color: inherit;
    flex-shrink: 0;
    font-size: 23px; /* Increased by 15% from 20px */
  }

  &:hover:not(:disabled) {
    transform: scale(1.1);
    color: #8b5cf6;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
    background-color: rgba(255, 107, 157, 0.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
  }

  /* Enhanced mobile responsiveness - Better touch targets */
  @media (max-width: 1024px) {
    width: 39px; /* Increased by 15% from 34px */
    height: 39px; /* Increased by 15% from 34px */
    min-width: 39px; /* Increased by 15% from 34px */
    min-height: 39px; /* Increased by 15% from 34px */

    svg {
      font-size: 23px; /* Increased by 15% from 20px */
    }
  }

  @media (max-width: 768px) {
    width: 37px; /* Increased by 15% from 32px */
    height: 37px; /* Increased by 15% from 32px */
    min-width: 37px; /* Increased by 15% from 32px */
    min-height: 37px; /* Increased by 15% from 32px */

    svg {
      font-size: 22px; /* Increased by 15% from 19px */
    }
  }

  @media (max-width: 640px) {
    width: 35px; /* Increased by 15% from 30px */
    height: 35px; /* Increased by 15% from 30px */
    min-width: 35px; /* Increased by 15% from 30px */
    min-height: 35px; /* Increased by 15% from 30px */

    svg {
      font-size: 21px; /* Increased by 15% from 18px */
    }
  }

  @media (max-width: 600px) {
    width: 32px; /* Increased by 15% from 28px */
    height: 32px; /* Increased by 15% from 28px */
    min-width: 32px; /* Increased by 15% from 28px */
    min-height: 32px; /* Increased by 15% from 28px */

    svg {
      font-size: 20px; /* Increased by 15% from 17px */
    }
  }

  @media (max-width: 480px) {
    width: 30px; /* Increased by 15% from 26px */
    height: 30px; /* Increased by 15% from 26px */
    min-width: 30px; /* Increased by 15% from 26px */
    min-height: 30px; /* Increased by 15% from 26px */

    svg {
      font-size: 18px; /* Increased by 15% from 16px */
    }
  }

  @media (max-width: 414px) {
    width: 28px; /* Increased by 15% from 24px */
    height: 28px; /* Increased by 15% from 24px */
    min-width: 28px; /* Increased by 15% from 24px */
    min-height: 28px; /* Increased by 15% from 24px */

    svg {
      font-size: 17px; /* Increased by 15% from 15px */
    }
  }

  @media (max-width: 390px) {
    width: 25px; /* Increased by 15% from 22px */
    height: 25px; /* Increased by 15% from 22px */
    min-width: 25px; /* Increased by 15% from 22px */
    min-height: 25px; /* Increased by 15% from 22px */

    svg {
      font-size: 16px; /* Increased by 15% from 14px */
    }
  }

  @media (max-width: 375px) {
    width: 23px; /* Increased by 15% from 20px */
    height: 23px; /* Increased by 15% from 20px */
    min-width: 23px; /* Increased by 15% from 20px */
    min-height: 23px; /* Increased by 15% from 20px */

    svg {
      font-size: 15px; /* Increased by 15% from 13px */
    }
  }

  @media (max-width: 360px) {
    width: 21px; /* Increased by 15% from 18px */
    height: 21px; /* Increased by 15% from 18px */
    min-width: 21px; /* Increased by 15% from 18px */
    min-height: 21px; /* Increased by 15% from 18px */

    svg {
      font-size: 14px; /* Increased by 15% from 12px */
    }
  }

  @media (max-width: 320px) {
    width: 18px; /* Increased by 15% from 16px */
    height: 18px; /* Increased by 15% from 16px */
    min-width: 18px; /* Increased by 15% from 16px */
    min-height: 18px; /* Increased by 15% from 16px */

    svg {
      font-size: 13px; /* Increased by 15% from 11px */
    }
  }
`;

const VoiceButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 37px; /* Increased by 15% from 32px */
  height: 37px; /* Increased by 15% from 32px */
  min-width: 37px; /* Increased by 15% from 32px */
  min-height: 37px; /* Increased by 15% from 32px */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(props) => (props.$isRecording ? "#ef4444" : "#ff6b9d")};
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 9999;
  transform: ${(props) => (props.$isRecording ? "scale(1.1)" : "scale(1)")};

  /* Add pulsing animation when recording */
  ${(props) =>
    props.$isRecording &&
    `
      animation: pulse 1s infinite;
    `}

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  svg {
    color: inherit;
    flex-shrink: 0;
    font-size: 23px; /* Increased by 15% from 20px */
  }

  &:hover:not(:disabled) {
    transform: ${(props) => (props.$isRecording ? "scale(1.2)" : "scale(1.1)")};
    color: ${(props) => (props.$isRecording ? "#dc2626" : "#8b5cf6")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
  }

  /* Enhanced mobile responsiveness - Better touch targets */
  @media (max-width: 1024px) {
    width: 39px; /* Increased by 15% from 34px */
    height: 39px; /* Increased by 15% from 34px */
    min-width: 39px; /* Increased by 15% from 34px */
    min-height: 39px; /* Increased by 15% from 34px */

    svg {
      font-size: 23px; /* Increased by 15% from 20px */
    }
  }

  @media (max-width: 768px) {
    width: 37px; /* Increased by 15% from 32px */
    height: 37px; /* Increased by 15% from 32px */
    min-width: 37px; /* Increased by 15% from 32px */
    min-height: 37px; /* Increased by 15% from 32px */

    svg {
      font-size: 22px; /* Increased by 15% from 19px */
    }
  }

  @media (max-width: 640px) {
    width: 35px; /* Increased by 15% from 30px */
    height: 35px; /* Increased by 15% from 30px */
    min-width: 35px; /* Increased by 15% from 30px */
    min-height: 35px; /* Increased by 15% from 30px */

    svg {
      font-size: 21px; /* Increased by 15% from 18px */
    }
  }

  @media (max-width: 600px) {
    width: 32px; /* Increased by 15% from 28px */
    height: 32px; /* Increased by 15% from 28px */
    min-width: 32px; /* Increased by 15% from 28px */
    min-height: 32px; /* Increased by 15% from 28px */

    svg {
      font-size: 20px; /* Increased by 15% from 17px */
    }
  }

  @media (max-width: 480px) {
    width: 30px; /* Increased by 15% from 26px */
    height: 30px; /* Increased by 15% from 26px */
    min-width: 30px; /* Increased by 15% from 26px */
    min-height: 30px; /* Increased by 15% from 26px */

    svg {
      font-size: 18px; /* Increased by 15% from 16px */
    }
  }

  @media (max-width: 414px) {
    width: 28px; /* Increased by 15% from 24px */
    height: 28px; /* Increased by 15% from 24px */
    min-width: 28px; /* Increased by 15% from 24px */
    min-height: 28px; /* Increased by 15% from 24px */

    svg {
      font-size: 17px; /* Increased by 15% from 15px */
    }
  }

  @media (max-width: 390px) {
    width: 25px; /* Increased by 15% from 22px */
    height: 25px; /* Increased by 15% from 22px */
    min-width: 25px; /* Increased by 15% from 22px */
    min-height: 25px; /* Increased by 15% from 22px */

    svg {
      font-size: 16px; /* Increased by 15% from 14px */
    }
  }

  @media (max-width: 375px) {
    width: 23px; /* Increased by 15% from 20px */
    height: 23px; /* Increased by 15% from 20px */
    min-width: 23px; /* Increased by 15% from 20px */
    min-height: 23px; /* Increased by 15% from 20px */

    svg {
      font-size: 15px; /* Increased by 15% from 13px */
    }
  }

  @media (max-width: 360px) {
    width: 21px; /* Increased by 15% from 18px */
    height: 21px; /* Increased by 15% from 18px */
    min-width: 21px; /* Increased by 15% from 18px */
    min-height: 21px; /* Increased by 15% from 18px */

    svg {
      font-size: 14px; /* Increased by 15% from 12px */
    }
  }

  @media (max-width: 320px) {
    width: 18px; /* Increased by 15% from 16px */
    height: 18px; /* Increased by 15% from 16px */
    min-width: 18px; /* Increased by 15% from 16px */
    min-height: 18px; /* Increased by 15% from 16px */

    svg {
      font-size: 13px; /* Increased by 15% from 11px */
    }
  }
`;

const InputArea = ({
  message,
  setMessage,
  handleKeyPress,
  isTyping,
  userMessageCount,
  verified,
  needsAuth,
  isRecording,
  isMuted,
  toggleMute,
  handleMicClick,
  handleMicTouchStart,
  handleMicTouchEnd,
  handleMicMouseDown,
  handleMicMouseUp,
  isMobile,
  handleSendMessage,
  currentlyPlaying
}) => {
  const shouldDisable = isTyping; // Simplified - only disable when typing
  
  return (
    <InputContainer>
      <InputWrapper>
        <ChatInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={
            isTyping
              ? "Thinking..."
              : "Type your message..."
          }
          disabled={shouldDisable}
          style={{
            opacity: shouldDisable ? 0.6 : 1,
            cursor: shouldDisable ? "not-allowed" : "text",
          }}
        />
        <InputButtons>
          <VoiceButton
            $isRecording={isRecording}
            onClick={handleMicClick}
            onTouchStart={handleMicTouchStart}
            onTouchEnd={handleMicTouchEnd}
            onMouseDown={handleMicMouseDown}
            onMouseUp={handleMicMouseUp}
            disabled={shouldDisable}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isRecording && !isMobile ? <FiSquare /> : <FiMic />}
          </VoiceButton>
          <MuteButton
            $isMuted={isMuted}
            $isPlaying={currentlyPlaying !== null}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(`Mute button clicked, current state: ${isMuted}, currentlyPlaying: ${currentlyPlaying}`);
              console.log('toggleMute function:', typeof toggleMute);
              if (typeof toggleMute === 'function') {
                toggleMute();
              } else {
                console.error('toggleMute is not a function!');
              }
            }}
            disabled={false}
            title={
              currentlyPlaying !== null 
                ? (isMuted ? "Unmute currently playing audio" : "Mute currently playing audio")
                : (isMuted ? "Unmute audio" : "Mute audio")
            }
          >
            {isMuted ? <FiVolumeX /> : <FiVolume2 />}
          </MuteButton>
          <SendButton
            onClick={() => {
              console.log('Send button clicked', { isTyping, shouldDisable, message });
              if (!isTyping) {
                handleSendMessage();
              }
            }}
            disabled={shouldDisable}
          >
            <FiArrowUp />
          </SendButton>
        </InputButtons>
      </InputWrapper>

      {/* Instructions (hide when gated) */}
      <p
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "0.8rem", /* Increased base size for better readability */
          margin: "0.8rem 0 0 0",
          lineHeight: "1.3", /* Added line height for better readability */
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.25rem",
            flexWrap: "wrap",
            lineHeight: "1.2",
          }}
        >
          <span>Powered by</span>
          <a
            href="https://troikatech.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <img
              src="https://raw.githubusercontent.com/troikatechindia/Asset/refs/heads/main/logo.png"
              alt="Troika Tech Logo"
              style={{ height: "12px", verticalAlign: "middle" }}
            />
            <strong>Troika Tech</strong>
          </a>
        </span>
      </p>
    </InputContainer>
  );
};

export default InputArea;
