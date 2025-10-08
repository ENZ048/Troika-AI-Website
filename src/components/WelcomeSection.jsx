import React from "react";
import styled from "styled-components";
import { useTheme } from "../contexts/ThemeContext";
import { FaGlobe, FaBolt, FaRobot } from "react-icons/fa";

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 4rem 2rem;
  padding-top: 6rem; /* Extra space above to prevent touching header */
  text-align: center;
  background: transparent;
  flex: 1 1 auto;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  
  /* Force visibility in production */
  visibility: visible !important;
  opacity: 1 !important;
  display: flex !important;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.5);
  }

  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;


  /* Tablet responsive design */
  @media (max-width: 1024px) {
    padding: 0.5rem 1.5rem;
    padding-top: 5rem; /* Reduced top padding for tablets */
    justify-content: flex-start;
  }

  @media (max-width: 900px) {
    padding: 2.5rem 1.25rem;
    padding-top: 5.5rem; /* Adequate space for floating avatar */
    justify-content: flex-start;
  }

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    padding-top: 5rem; /* Good spacing for mobile */
    justify-content: flex-start;
  }

  @media (max-width: 640px) {
    padding: 1.5rem 0.75rem;
    padding-top: 4.5rem; /* Reduced but safe spacing */
    justify-content: flex-start;
  }

  @media (max-width: 600px) {
    padding: 1.25rem 0.5rem;
    padding-top: 4rem; /* Compact but safe */
    justify-content: flex-start;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.4rem;
    padding-top: 3.5rem; /* Mobile-optimized spacing */
    justify-content: flex-start;
  }

  @media (max-width: 414px) {
    padding: 0.875rem 0.3rem;
    padding-top: 3rem; /* iPhone Plus spacing */
    justify-content: flex-start;
  }

  @media (max-width: 390px) {
    padding: 0.75rem 0.25rem;
    padding-top: 2.75rem; /* Small phone spacing */
    justify-content: flex-start;
  }

  @media (max-width: 375px) {
    padding: 0.625rem 0.2rem;
    padding-top: 2.5rem; /* iPhone standard spacing */
    justify-content: flex-start;
  }

  @media (max-width: 360px) {
    padding: 0.5rem 0.15rem;
    padding-top: 2.25rem; /* Android standard spacing */
    justify-content: flex-start;
  }

  @media (max-width: 320px) {
    padding: 0.3rem 0.05rem;
    padding-top: 2rem; /* Very small screen spacing */
    justify-content: flex-start;
  }

  /* Extra small screens */
  @media (max-width: 280px) {
    padding: 0.2rem 0.025rem;
    padding-top: 1.75rem; /* Minimal but safe spacing */
    justify-content: flex-start;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  z-index: 2;
  margin-bottom: 1.5rem;
  margin-top: 1rem; /* Additional top margin for extra safety */

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    margin-bottom: 1.25rem;
    margin-top: 0.75rem;
  }

  @media (max-width: 900px) {
    margin-bottom: 1rem;
    margin-top: 0.75rem;
  }

  @media (max-width: 768px) {
    margin-bottom: 0.875rem;
    margin-top: 0.5rem;
  }

  @media (max-width: 640px) {
    margin-bottom: 0.75rem;
    margin-top: 0.5rem;
  }

  @media (max-width: 600px) {
    margin-bottom: 0.625rem;
    margin-top: 0.4rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 0.5rem;
    margin-top: 0.4rem;
  }

  @media (max-width: 414px) {
    margin-bottom: 0.4rem;
    margin-top: 0.3rem;
  }

  @media (max-width: 390px) {
    margin-bottom: 0.35rem;
    margin-top: 0.3rem;
  }

  @media (max-width: 375px) {
    margin-bottom: 0.3rem;
    margin-top: 0.25rem;
  }

  @media (max-width: 360px) {
    margin-bottom: 0.25rem;
    margin-top: 0.25rem;
  }

  @media (max-width: 320px) {
    margin-bottom: 0.5rem;
    margin-top: 0.2rem;
  }

  /* Extra small screens */
  @media (max-width: 280px) {
    margin-bottom: 0.4rem;
    margin-top: 0.2rem;
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
  animation: float 3s ease-in-out infinite;

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

  /* Reduce border thickness on smaller screens */
  @media (max-width: 480px) {
    &::before {
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
    }
  }

  @media (max-width: 320px) {
    &::before {
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
    }
  }

  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes float {
    0%, 100% { 
      transform: translateY(0px); 
    }
    50% { 
      transform: translateY(-10px); 
    }
  }

  /* Reduce floating animation on smaller screens */
  @media (max-width: 480px) {
    animation: floatMobile 3s ease-in-out infinite;
  }

  @keyframes floatMobile {
    0%, 100% { 
      transform: translateY(0px); 
    }
    50% { 
      transform: translateY(-5px); 
    }
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
    width: 70px;
    height: 70px;
    margin-bottom: 0.5rem;
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.25);
  }

  /* Extra small screens - maintain minimum usable size */
  @media (max-width: 280px) {
    width: 65px;
    height: 65px;
    margin-bottom: 0.4rem;
    box-shadow: 0 5px 15px rgba(139, 92, 246, 0.2);
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
    width: 50px;
    height: 50px;
  }

  /* Extra small screens - maintain minimum usable size */
  @media (max-width: 280px) {
    width: 45px;
    height: 45px;
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
  animation: pulse 2s infinite, float-indicator 3s ease-in-out infinite;
  animation-delay: 0.5s;

  @keyframes float-indicator {
    0%, 100% { 
      transform: translateY(0px) scale(1); 
    }
    50% { 
      transform: translateY(-2px) scale(1.05); 
    }
  }

  /* Responsive sizing for smaller screens */
  @media (max-width: 480px) {
    width: 14px;
    height: 14px;
    top: 8px;
    right: 8px;
    border: 2px solid white;
    box-shadow: 0 0 0 1px #10b981;
  }

  @media (max-width: 375px) {
    width: 12px;
    height: 12px;
    top: 6px;
    right: 6px;
    border: 2px solid white;
    box-shadow: 0 0 0 1px #10b981;
  }

  @media (max-width: 320px) {
    width: 10px;
    height: 10px;
    top: 5px;
    right: 5px;
    border: 1px solid white;
    box-shadow: 0 0 0 1px #10b981;
  }
`;

const GreetingText = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#1f2937'};
  margin: 0 0 0.5rem 0;
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }

  @media (max-width: 375px) {
    font-size: 1.5rem;
  }

  @media (max-width: 320px) {
    font-size: 1.25rem;
  }
`;

const SubText = styled.p`
  font-size: 1.1rem;
  color: ${props => props.$isDarkMode ? '#a0a0a0' : '#6b7280'};
  margin: 0 0 2rem 0;
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin: 0 0 1.5rem 0;
  }

  @media (max-width: 375px) {
    font-size: 0.85rem;
    margin: 0 0 1.25rem 0;
  }

  @media (max-width: 320px) {
    font-size: 0.8rem;
    margin: 0 0 1rem 0;
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

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    max-width: 100%;
    padding: 0 0.5rem;
  }

  @media (max-width: 375px) {
    gap: 0.4rem;
    padding: 0 0.25rem;
  }

  @media (max-width: 320px) {
    gap: 0.3rem;
    padding: 0 0.1rem;
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
  width: 100%;
  min-height: 60px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
    border-color: #8b5cf6;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 0.5rem;
    min-height: 50px;
  }

  @media (max-width: 375px) {
    padding: 0.6rem;
    gap: 0.4rem;
    min-height: 45px;
  }

  @media (max-width: 320px) {
    padding: 0.5rem;
    gap: 0.3rem;
    min-height: 40px;
  }
`;

const SuggestionIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }

  @media (max-width: 375px) {
    font-size: 1.1rem;
  }

  @media (max-width: 320px) {
    font-size: 1rem;
  }
`;

const SuggestionText = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.$isDarkMode ? '#e5e7eb' : '#374151'};
  flex: 1;
  transition: color 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }

  @media (max-width: 375px) {
    font-size: 0.8rem;
  }

  @media (max-width: 320px) {
    font-size: 0.75rem;
  }
`;


const FeatureTags = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  
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
    gap: 1rem;
    margin-top: 2.5rem;
    margin-bottom: 2rem;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-top: 2rem;
    margin-bottom: 1.5rem;
    max-width: 100%;
    padding: 0 0.5rem;
  }

  @media (max-width: 375px) {
    gap: 0.6rem;
    margin-top: 1.5rem;
    margin-bottom: 1.25rem;
    padding: 0 0.25rem;
  }

  @media (max-width: 320px) {
    gap: 0.5rem;
    margin-top: 1.25rem;
    margin-bottom: 1rem;
    padding: 0 0.1rem;
  }

  @media (max-width: 640px) {
    gap: 0.875rem;
    margin-top: 2.25rem;
    margin-bottom: 1.75rem;
    max-width: 280px;
  }

  @media (max-width: 600px) {
    gap: 0.875rem;
    margin-top: 2rem;
    margin-bottom: 1.5rem;
    max-width: 260px;
  }

  @media (max-width: 480px) {
    gap: 0.875rem;
    margin-top: 1.75rem;
    margin-bottom: 1.25rem;
    max-width: 240px;
  }

  @media (max-width: 414px) {
    gap: 0.75rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    max-width: 220px;
  }

  @media (max-width: 390px) {
    gap: 0.75rem;
    margin-top: 1.25rem;
    margin-bottom: 0.875rem;
    max-width: 200px;
  }

  @media (max-width: 375px) {
    gap: 0.75rem;
    margin-top: 1rem;
    margin-bottom: 0.75rem;
    max-width: 180px;
  }

  @media (max-width: 360px) {
    gap: 0.75rem;
    margin-top: 0.875rem;
    margin-bottom: 0.625rem;
    max-width: 160px;
  }

  @media (max-width: 320px) {
    gap: 0.75rem;
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
    max-width: 140px;
  }
`;

const ScrollIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;

  .scroll-text {
    font-size: 0.75rem;
    color: ${props => props.$isDarkMode ? '#a0a0a0' : '#6b7280'};
    font-weight: 500;
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    border: 2px solid ${props => props.$isDarkMode ? '#a0a0a0' : '#6b7280'};
    border-top: none;
    border-left: none;
    transform: rotate(45deg);
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: rotate(45deg) translateY(0);
    }
    40% {
      transform: rotate(45deg) translateY(-5px);
    }
    60% {
      transform: rotate(45deg) translateY(-3px);
    }
  }
`;

// =======================================================
// THIS IS THE CORRECTED PART (REVERTED TO NO WRAPPING)
// =======================================================
const FeatureTag = styled.div`
  background: white;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: fit-content;
  max-width: 100%;
  justify-content: center;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: visible;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .feature-icon {
    font-size: 1.75rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feature-text {
    font-weight: 600;
    color: #1f2937;
    flex: 1;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    margin-left: -0.25rem;
    white-space: nowrap;
    overflow: visible;
    text-overflow: unset;
    max-width: none;
  }

  @media (min-width: 1001px) {
    gap: 0.75rem;
    
    .feature-text {
      margin-left: 0;
    }
  }

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }

  @media (max-width: 900px) {
    padding: 0.8rem 0.9rem;
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
    width: fit-content;
    max-width: 100%;
    justify-content: center;
    gap: 0.5rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }
  }

  @media (max-width: 640px) {
    padding: 0.9rem 1rem;
    font-size: 0.85rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.4rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }
  }

  @media (max-width: 600px) {
    padding: 0.85rem 0.9rem;
    font-size: 0.8rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.3rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }
  }

  @media (max-width: 480px) {
    padding: 0.8rem 0.85rem;
    font-size: 0.75rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.3rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }
  }

  @media (max-width: 414px) {
    padding: 0.75rem 0.8rem;
    font-size: 0.75rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.3rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }

    .feature-icon {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 390px) {
    padding: 0.7rem 0.75rem;
    font-size: 0.7rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.2rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }

    .feature-icon {
      font-size: 1.4rem;
    }
  }

  @media (max-width: 375px) {
    padding: 0.65rem 0.7rem;
    font-size: 0.65rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.2rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }

    .feature-icon {
      font-size: 1.35rem;
    }
  }

  @media (max-width: 360px) {
    padding: 0.6rem 0.65rem;
    font-size: 0.6rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.2rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }

    .feature-icon {
      font-size: 1.3rem;
    }
  }

  @media (max-width: 320px) {
    padding: 0.5rem 0.6rem;
    font-size: 0.6rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.4rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }

    .feature-icon {
      font-size: 1.4rem;
    }
  }

  /* Extra small screens */
  @media (max-width: 280px) {
    padding: 0.45rem 0.5rem;
    font-size: 0.55rem;
    width: fit-content;
    max-width: 100%;
    gap: 0.3rem;
    
    .feature-text {
      margin-left: 0;
      max-width: none;
    }

    .feature-icon {
      font-size: 1.3rem;
    }
  }
`;

const WelcomeSection = ({ onSuggestionClick }) => {
  const { isDarkMode } = useTheme();
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(false);

  const suggestions = [
    {
      icon: "🛠️",
      text: "What Services You Offer?",
      action: "services"
    },
    {
      icon: "🏢",
      text: "Who is Troika Tech?",
      action: "about"
    },
    {
      icon: "💰",
      text: "What are your pricing plans?",
      action: "pricing"
    },
    {
      icon: "💡",
      text: "How your services can help me?",
      action: "help"
    }
  ];

  const features = [
    { icon: FaGlobe, text: "80+ Languages", color: "#3B82F6" },
    { icon: FaBolt, text: "Instant Responses", color: "#F59E0B" },
    { icon: FaRobot, text: "AI-Powered", color: "#8B5CF6" }
  ];

  // Check if content overflows and show scroll indicator
  React.useEffect(() => {
    const checkScrollable = () => {
      const container = document.querySelector('[data-welcome-container]');
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight;
        setShowScrollIndicator(isScrollable);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);

  return (
    <>
      <WelcomeContainer data-welcome-container>
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
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <FeatureTag key={index}>
                <div className="feature-icon" style={{ color: feature.color }}>
                  <IconComponent />
                </div>
                <span className="feature-text">{feature.text}</span>
              </FeatureTag>
            );
          })}
        </FeatureTags>
      </WelcomeContainer>

      <ScrollIndicator $show={showScrollIndicator} $isDarkMode={isDarkMode}>
        <div className="scroll-text">Scroll to view all content</div>
        <div className="scroll-arrow"></div>
      </ScrollIndicator>
    </>
  );
};

export default WelcomeSection;