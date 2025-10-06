import React, { useState } from "react";
import styled from "styled-components";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { FiZap, FiUsers, FiMoon, FiSun, FiSettings } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 2rem;
  border-bottom: none;
  background: ${props => props.$isDarkMode
    ? 'linear-gradient(135deg, #6b46c1 0%, #be185d 50%, #b45309 100%)'
    : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)'};
  flex-shrink: 0;
  border-radius: 0;
  position: relative;
  min-height: 80px;
  width: 100%;
  transition: background 0.3s ease;

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    padding: 1.25rem 1.5rem;
    min-height: 75px;
  }

  @media (max-width: 900px) {
    padding: 1rem 1.25rem;
    min-height: 70px;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    min-height: 65px;
  }

  @media (max-width: 640px) {
    padding: 0.75rem 0.875rem;
    min-height: 60px;
  }

  @media (max-width: 600px) {
    padding: 0.625rem 0.75rem;
    min-height: 55px;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.625rem;
    min-height: 50px;
  }

  @media (max-width: 414px) {
    padding: 0.4rem 0.5rem;
    min-height: 45px;
  }

  @media (max-width: 390px) {
    padding: 0.35rem 0.4rem;
    min-height: 40px;
  }

  @media (max-width: 375px) {
    padding: 0.3rem 0.35rem;
    min-height: 38px;
  }

  @media (max-width: 360px) {
    padding: 0.25rem 0.3rem;
    min-height: 35px;
  }

  @media (max-width: 320px) {
    padding: 0.2rem 0.25rem;
    min-height: 32px;
  }
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1000px;
  gap: 1rem;

  /* Tablet responsive design */
  @media (max-width: 1024px) {
    gap: 0.875rem;
    max-width: 900px;
  }

  @media (max-width: 900px) {
    gap: 0.75rem;
    max-width: 800px;
  }

  @media (max-width: 768px) {
    gap: 0.625rem;
    max-width: 100%;
    padding: 0 0.5rem;
  }

  @media (max-width: 640px) {
    gap: 0.5rem;
    padding: 0 0.25rem;
  }

  @media (max-width: 600px) {
    gap: 0.4rem;
    padding: 0 0.2rem;
  }

  @media (max-width: 480px) {
    gap: 0.3rem;
    padding: 0 0.15rem;
  }

  @media (max-width: 414px) {
    gap: 0.25rem;
    padding: 0 0.1rem;
  }

  @media (max-width: 390px) {
    gap: 0.2rem;
    padding: 0 0.05rem;
  }

  @media (max-width: 375px) {
    gap: 0.15rem;
    padding: 0;
  }

  @media (max-width: 360px) {
    gap: 0.1rem;
    padding: 0;
  }

  @media (max-width: 320px) {
    gap: 0.05rem;
    padding: 0;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  gap: 1rem;
  padding: 0;
  min-width: 0;

  /* Enhanced mobile responsiveness - Better spacing with increased gaps */
  @media (max-width: 1200px) {
    gap: 0.95rem;
  }

  @media (max-width: 1024px) {
    gap: 0.9rem;
  }

  @media (max-width: 900px) {
    gap: 0.85rem;
  }

  @media (max-width: 768px) {
    gap: 0.8rem; /* Better mobile spacing */
    padding-top: 0.1rem;
  }

  @media (max-width: 640px) {
    gap: 0.75rem;
    padding-top: 0.05rem;
  }

  @media (max-width: 600px) {
    gap: 0.7rem;
    padding-top: 0.05rem;
  }

  @media (max-width: 480px) {
    gap: 0.65rem; /* Better mobile spacing */
    padding-top: 0;
  }

  @media (max-width: 414px) {
    gap: 0.6rem; /* iPhone readability */
    padding-top: 0;
  }

  @media (max-width: 390px) {
    gap: 0.55rem; /* Small phone optimization */
    padding-top: 0;
  }

  @media (max-width: 375px) {
    gap: 0.5rem; /* iPhone SE readability */
    padding-top: 0;
  }

  @media (max-width: 360px) {
    gap: 0.45rem; /* Very small screens */
    padding-top: 0;
  }

  @media (max-width: 320px) {
    gap: 0.4rem; /* Minimum spacing */
    padding-top: 0;
  }
`;

/* Generic circle wrapper so avatar, bot name and status can each sit in a circle */
const Circle = styled.div`
  width: ${(props) => props.$size || 63}px; /* Increased by additional 15% from 55px */
  height: ${(props) => props.$size || 63}px; /* Increased by additional 15% from 55px */
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.9);
  padding: 0;
  text-align: center;
  flex-shrink: 0;

  /* Desktop-specific logo size increase by 10% */
  @media (min-width: 1201px) {
    width: ${(props) => props.$size ? (props.$size * 1.1) : 69}px; /* Increased by 10% for desktop */
    height: ${(props) => props.$size ? (props.$size * 1.1) : 69}px; /* Increased by 10% for desktop */
  }

  /* Enhanced mobile responsiveness - Better proportions */
  @media (max-width: 1024px) {
    width: ${(props) => Math.max(69, (props.$size || 63) * 1.1)}px;
    height: ${(props) => Math.max(69, (props.$size || 63) * 1.1)}px;
  }

  @media (max-width: 768px) {
    width: ${(props) => Math.max(67, (props.$size || 63) * 1.05)}px;
    height: ${(props) => Math.max(67, (props.$size || 63) * 1.05)}px;
  }

  @media (max-width: 640px) {
    width: ${(props) => Math.max(64, (props.$size || 63) * 1.02)}px;
    height: ${(props) => Math.max(64, (props.$size || 63) * 1.02)}px;
  }

  @media (max-width: 600px) {
    width: ${(props) => Math.max(62, (props.$size || 63) * 0.98)}px;
    height: ${(props) => Math.max(62, (props.$size || 63) * 0.98)}px;
  }

  @media (max-width: 480px) {
    width: ${(props) => Math.max(60, (props.$size || 63) * 0.93)}px;
    height: ${(props) => Math.max(60, (props.$size || 63) * 0.93)}px;
  }

  @media (max-width: 414px) {
    width: ${(props) => Math.max(58, (props.$size || 63) * 0.89)}px;
    height: ${(props) => Math.max(58, (props.$size || 63) * 0.89)}px;
  }

  @media (max-width: 390px) {
    width: ${(props) => Math.max(55, (props.$size || 63) * 0.84)}px;
    height: ${(props) => Math.max(55, (props.$size || 63) * 0.84)}px;
  }

  @media (max-width: 375px) {
    width: ${(props) => Math.max(53, (props.$size || 63) * 0.8)}px;
    height: ${(props) => Math.max(53, (props.$size || 63) * 0.8)}px;
  }

  @media (max-width: 360px) {
    width: ${(props) => Math.max(51, (props.$size || 63) * 0.76)}px;
    height: ${(props) => Math.max(51, (props.$size || 63) * 0.76)}px;
  }

  @media (max-width: 320px) {
    width: ${(props) => Math.max(48, (props.$size || 63) * 0.71)}px;
    height: ${(props) => Math.max(48, (props.$size || 63) * 0.71)}px;
  }
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* fill circle exactly */
  border-radius: 50%;
  display: block;
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Reverted to original left alignment */
  text-align: left; /* Reverted to original left text alignment */
  gap: 0.4rem; /* Increased gap for better spacing between bot name and status */
  
  /* Enhanced mobile responsiveness - Better spacing */
  @media (max-width: 1200px) {
    gap: 0.38rem;
  }

  @media (max-width: 1024px) {
    gap: 0.36rem;
  }

  @media (max-width: 900px) {
    gap: 0.34rem;
  }

  @media (max-width: 768px) {
    gap: 0.32rem; /* Better mobile spacing */
  }

  @media (max-width: 640px) {
    gap: 0.3rem;
  }

  @media (max-width: 600px) {
    gap: 0.28rem;
  }

  @media (max-width: 480px) {
    gap: 0.26rem; /* Better mobile spacing */
  }

  @media (max-width: 414px) {
    gap: 0.24rem; /* iPhone readability */
  }

  @media (max-width: 390px) {
    gap: 0.22rem; /* Small phone optimization */
  }

  @media (max-width: 375px) {
    gap: 0.2rem; /* iPhone SE readability */
  }

  @media (max-width: 360px) {
    gap: 0.18rem; /* Very small screens */
  }

  @media (max-width: 320px) {
    gap: 0.16rem; /* Minimum spacing */
  }
`;

const BotName = styled.div`
  font-weight: 700;
  color: #ffffff;
  font-size: 1.4rem;
  text-align: left;
  line-height: 1.1;
  margin: 0;

  /* Desktop-specific font size decrease by 15% */
  @media (min-width: 1201px) {
    font-size: 1.23rem; /* Decreased by 15% from 1.8rem for desktop */
  }

  /* Enhanced mobile responsiveness - Better text sizing with improved readability */
  @media (max-width: 1200px) {
    font-size: 1.55rem;
    margin-bottom: 0.2rem;
    line-height: 0.9;
  }

  @media (max-width: 1024px) {
    font-size: 1.8rem; /* Maintained readability on tablets */
    margin-bottom: 0.2rem;
    line-height: 1.25;
  }

  @media (max-width: 900px) {
    font-size: 1.75rem;
    margin-bottom: 0.15rem;
    line-height: 1.22;
  }

  @media (max-width: 768px) {
    font-size: 1.7rem; /* Good mobile readability */
    margin-bottom: 0.15rem;
    line-height: 1.2;
  }

  @media (max-width: 640px) {
    font-size: 1.65rem;
    margin-bottom: 0.1rem;
    line-height: 1.18;
  }

  @media (max-width: 600px) {
    font-size: 1.6rem;
    margin-bottom: 0.1rem;
    line-height: 1.16;
  }

  @media (max-width: 480px) {
    font-size: 1.65rem; /* Better mobile readability */
    margin-bottom: 0.05rem;
    line-height: 1.15;
  }

  @media (max-width: 414px) {
    font-size: 1.6rem; /* iPhone readability - increased for better visibility */
    margin-bottom: 0.05rem;
    line-height: 1.14;
  }

  @media (max-width: 390px) {
    font-size: 1.55rem; /* Small phone optimization - progressive scaling */
    margin-bottom: 0;
    line-height: 1.13;
  }

  @media (max-width: 375px) {
    font-size: 1.5rem; /* iPhone SE readability - increased for better visibility */
    margin-bottom: 0;
    line-height: 1.12;
  }

  @media (max-width: 360px) {
    font-size: 1.45rem; /* Very small screens - increased for readability */
    margin-bottom: 0;
    line-height: 1.1;
  }

  @media (max-width: 320px) {
    font-size: 1.4rem; /* Minimum readable size - increased for better visibility */
    margin-bottom: 0;
    line-height: 1.08;
  }
`;

const Status = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
  font-weight: 400;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  /* Removed gradient background for simple appearance */
  /* Removed padding for simple text appearance */
  /* Removed border-radius for simple text appearance */
  /* Removed box-shadow for simple appearance */

  /* Hide response time on mobile */
  .hide-on-mobile {
    @media (max-width: 640px) {
      display: none;
    }
  }

  /* Desktop-specific font size decrease by 15% */
  @media (min-width: 1201px) {
    font-size: 0.85rem; /* Decreased by 15% from 1rem for desktop */
  }

  /* Enhanced mobile responsiveness - Better status sizing with improved readability */
  @media (max-width: 1200px) {
    font-size: 0.98rem;
    line-height: 1.18;
    gap: 0.3rem;
  }

  @media (max-width: 1024px) {
    font-size: 0.96rem; /* Maintained readability on tablets */
    line-height: 1.16;
  }

  @media (max-width: 900px) {
    font-size: 0.94rem;
    line-height: 1.15;
  }

  @media (max-width: 768px) {
    font-size: 0.92rem; /* Good mobile readability */
    line-height: 1.14;
    gap: 0.25rem;
  }

  @media (max-width: 640px) {
    font-size: 0.9rem;
    line-height: 1.13;
  }

  @media (max-width: 600px) {
    font-size: 0.88rem;
    line-height: 1.12;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem; /* Better mobile readability */
    line-height: 1.11;
    gap: 0.2rem;
  }

  @media (max-width: 414px) {
    font-size: 0.92rem; /* iPhone readability - increased for better visibility */
    line-height: 1.1;
  }

  @media (max-width: 390px) {
    font-size: 0.9rem; /* Small phone optimization - progressive scaling */
    line-height: 1.09;
  }

  @media (max-width: 375px) {
    font-size: 0.88rem; /* iPhone SE readability - increased for better visibility */
    line-height: 1.08;
  }

  @media (max-width: 360px) {
    font-size: 0.86rem; /* Very small screens - increased for readability */
    line-height: 1.07;
  }

  @media (max-width: 320px) {
    font-size: 0.84rem; /* Minimum readable size - increased for better visibility */
    line-height: 1.06;
    gap: 0.15rem;
  }
`;

const OnlineIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }

  @media (max-width: 768px) {
    width: 7px;
    height: 7px;
  }

  @media (max-width: 480px) {
    width: 6px;
    height: 6px;
  }
`;

const StatusDivider = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
`;

const Clock = styled.div`
  position: absolute;
  top: 16px; /* Reverted to original position */
  left: 12px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1f2937;
  z-index: 20;
  pointer-events: none;
  user-select: none;
`;

const BatteryContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 60px; /* Moved left to avoid close button overlap */
  display: flex;
  align-items: center;
  gap: 4px; /* Restored gap between percentage and battery */
  font-size: 0.85rem; /* iPhone-style smaller font */
  font-weight: 600;
  color: #495057; /* Dark gray like iPhone */
  z-index: 20;
  pointer-events: none;
  user-select: none;

  @media (max-width: 480px) {
    right: 50px; /* Adjust for mobile */
    font-size: 0.8rem;
  }
`;

const BatteryIcon = styled.div`
  width: 25px; /* Back to standard iPhone proportions */
  height: 13px;
  border: 1px solid #adb5bd;
  border-radius: 3px;
  position: relative;
  background: transparent;

  &::before {
    content: "";
    position: absolute;
    right: -4px;
    top: 4px;
    width: 3px;
    height: 5px;
    background: #6c757d;
    border-radius: 0 2px 2px 0;
  }

  &::after {
    content: "";
    position: absolute;
    left: 1.5px;
    top: 1.5px;
    bottom: 1.5px;
    width: ${(props) => Math.max(0, (props.$level / 100) * 21)}px;
    background: ${(props) => {
      if (props.$isCharging) return "#34c759"; /* Always green when charging */
      if (props.$level >= 50) return "#34c759"; /* iPhone green */
      if (props.$level >= 20) return "#ff9500"; /* iPhone orange */
      return "#ff3b30"; /* iPhone red */
    }};
    border-radius: 1.5px;
    transition: width 0.3s ease;

    ${(props) =>
      props.$isCharging &&
      `
        animation: chargingPulse 2s ease-in-out infinite;
        
        @keyframes chargingPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}
  }

  @media (max-width: 480px) {
    width: 22px;
    height: 11px;

    &::before {
      right: -3px;
      top: 3px;
      width: 2px;
      height: 5px;
    }

    &::after {
      width: ${(props) => Math.max(0, (props.$level / 100) * 18)}px;
    }
  }
`;

const ChargingIcon = styled.div`
  position: absolute;
  right: 64px; /* Next to battery percentage */
  top: 16px;
  font-size: 0.8rem;
  color: #34c759; /* iPhone green */
  z-index: 21;
  pointer-events: none;
  user-select: none;
  animation: chargingBolt 1.5s ease-in-out infinite;

  @keyframes chargingBolt {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }

  @media (max-width: 480px) {
    right: 54px;
    font-size: 0.75rem;
  }
`;

const BatteryPercentage = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #495057; /* Dark gray like iPhone */

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  
  /* Enhanced mobile responsiveness - Better spacing */
  @media (max-width: 1200px) {
    gap: 0.75rem;
  }

  @media (max-width: 1024px) {
    gap: 0.7rem;
  }

  @media (max-width: 900px) {
    gap: 0.65rem;
  }

  @media (max-width: 768px) {
    gap: 0.6rem; /* Better mobile spacing */
  }

  @media (max-width: 640px) {
    gap: 0.55rem;
  }

  @media (max-width: 600px) {
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    gap: 0.45rem; /* Better mobile spacing */
  }

  @media (max-width: 414px) {
    gap: 0.4rem; /* iPhone readability */
  }

  @media (max-width: 390px) {
    gap: 0.35rem; /* Small phone optimization */
  }

  @media (max-width: 375px) {
    gap: 0.3rem; /* iPhone SE readability */
  }

  @media (max-width: 360px) {
    gap: 0.25rem; /* Very small screens */
  }

  @media (max-width: 320px) {
    gap: 0.2rem; /* Minimum spacing */
  }
`;

const HeaderButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 36px;
  min-height: 36px;
  gap: 0.25rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }

  &:active {
    outline: none;
    border: none;
    box-shadow: none;
  }

  svg {
    font-size: 1.3rem; /* Slightly larger icons */
  }

  span {
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  /* Enhanced mobile responsiveness - Better touch targets */
  @media (max-width: 1200px) {
    padding: 0.65rem;
    min-width: 42px;
    min-height: 42px;
    svg { font-size: 1.25rem; }
  }

  @media (max-width: 1024px) {
    padding: 0.6rem;
    min-width: 40px;
    min-height: 40px;
    svg { font-size: 1.2rem; }
  }

  @media (max-width: 900px) {
    padding: 0.55rem;
    min-width: 38px;
    min-height: 38px;
    svg { font-size: 1.15rem; }
  }

  @media (max-width: 768px) {
    padding: 0.5rem; /* Better mobile touch targets */
    min-width: 36px;
    min-height: 36px;
    svg { font-size: 1.1rem; }
    span { font-size: 0.85rem; }

    /* Hide text on mobile, keep icons only */
    &.hide-text-mobile span {
      display: none;
    }
  }

  @media (max-width: 640px) {
    padding: 0.45rem;
    min-width: 34px;
    min-height: 34px;
    svg { font-size: 1.05rem; }
    span { font-size: 0.8rem; }
  }

  @media (max-width: 600px) {
    padding: 0.4rem;
    min-width: 32px;
    min-height: 32px;
    svg { font-size: 1rem; }
    span { font-size: 0.75rem; }
  }

  @media (max-width: 480px) {
    padding: 0.35rem; /* Better mobile spacing */
    min-width: 30px;
    min-height: 30px;
    svg { font-size: 0.95rem; }
    span { font-size: 0.7rem; }
  }

  @media (max-width: 414px) {
    padding: 0.3rem; /* iPhone readability */
    min-width: 28px;
    min-height: 28px;
    svg { font-size: 0.9rem; }
    span { display: none; }
  }

  @media (max-width: 390px) {
    padding: 0.25rem; /* Small phone optimization */
    min-width: 26px;
    min-height: 26px;
    svg { font-size: 0.85rem; }
    span { display: none; }
  }

  @media (max-width: 375px) {
    padding: 0.2rem; /* iPhone SE readability */
    min-width: 24px;
    min-height: 24px;
    svg { font-size: 0.8rem; }
    span { display: none; }
  }

  @media (max-width: 360px) {
    padding: 0.15rem; /* Very small screens */
    min-width: 22px;
    min-height: 22px;
    svg { font-size: 0.75rem; }
    span { display: none; }
  }

  @media (max-width: 320px) {
    padding: 0.1rem; /* Minimum spacing */
    min-width: 20px;
    min-height: 20px;
    svg { font-size: 0.7rem; }
    span { display: none; }
  }
`;

const ChatHeader = ({
  currentTime,
  batteryLevel,
  isCharging,
  chatbotLogo,
  isMuted,
  toggleMute
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Header $isDarkMode={isDarkMode}>
      <HeaderInner>
        <HeaderLeft>
          <Circle $size={50}>
            <Avatar
              src={chatbotLogo}
              alt="avatar"
              onError={(e) => {
                e.target.src =
                  "https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png";
              }}
            />
          </Circle>
          <StatusBlock>
            <BotName>Supa Agent</BotName>
            <Status>
              <OnlineIndicator />
              <span>Online</span>
              <StatusDivider className="hide-on-mobile">•</StatusDivider>
              <span className="hide-on-mobile">Avg: 2s</span>
            </Status>
          </StatusBlock>
        </HeaderLeft>
        <HeaderRight>
          <HeaderButton title="Streak" className="hide-text-mobile">
            <FiZap /><span>0</span>
          </HeaderButton>
          <HeaderButton title="Users" className="hide-text-mobile">
            <FiUsers /><span>0/5</span>
          </HeaderButton>
          <HeaderButton
            title={isMuted ? "Unmute" : "Mute"}
            onClick={toggleMute}
          >
            {isMuted ? <IoVolumeMute /> : <IoVolumeHigh />}
          </HeaderButton>
          <HeaderButton
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
            onClick={toggleTheme}
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </HeaderButton>
          <HeaderButton title="Settings">
            <FiSettings />
          </HeaderButton>
        </HeaderRight>
      </HeaderInner>
    </Header>
  );
};

export default ChatHeader;
