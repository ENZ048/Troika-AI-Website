import styled, { keyframes } from "styled-components";

const slideOut = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  40% {
    transform: scale(0.97);
  }
  100% {
    opacity: 0;
    transform: translateY(100px) scale(0.9);
  }
`;

const pop = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
`;

const fadeInItem = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Wrapper = styled.div`
  @keyframes slideOut {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    40% {
      transform: scale(0.97);
    }
    100% {
      opacity: 0;
      transform: translateY(100px) scale(0.9);
    }
  }

  @keyframes pop {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    60% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes fadeInItem {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  font-family: "Amaranth", "Poppins", sans-serif;
`;

export const Overlay = styled.div`
  opacity: 0;
  animation: fadeIn 0.4s ease forwards 0s;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overscroll-behavior: contain; /* prevents scroll chaining to host page */
  touch-action: pan-y; /* keeps vertical scrolling smooth inside */
  z-index: 2147481000; /* sits above WP sticky headers/admin bar */
  overflow: visible; /* Ensure buttons are not clipped */

  /* Enhanced mobile responsiveness - Comprehensive breakpoints */
  @media (max-width: 1200px) {
    align-items: flex-start;
    padding-top: 20px;
    padding-left: 15px;
    padding-right: 15px;
  }

  @media (max-width: 1024px) {
    align-items: flex-start;
    padding-top: 15px;
    padding-left: 10px;
    padding-right: 10px;
  }

  @media (max-width: 900px) {
    align-items: flex-start;
    padding-top: 12px;
    padding-left: 8px;
    padding-right: 8px;
  }

  @media (max-width: 768px) {
    align-items: flex-start;
    padding-top: 10px;
    padding-left: 8px;
    padding-right: 8px;
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    padding-top: 8px;
    padding-left: 6px;
    padding-right: 6px;
  }

  @media (max-width: 600px) {
    align-items: flex-start;
    padding-top: 6px;
    padding-left: 5px;
    padding-right: 5px;
  }

  @media (max-width: 480px) {
    align-items: flex-start;
    padding-top: 5px;
    padding-left: 4px;
    padding-right: 4px;
  }

  @media (max-width: 414px) {
    align-items: flex-start;
    padding-top: 4px;
    padding-left: 3px;
    padding-right: 3px;
  }

  @media (max-width: 390px) {
    align-items: flex-start;
    padding-top: 3px;
    padding-left: 2px;
    padding-right: 2px;
  }

  @media (max-width: 375px) {
    align-items: flex-start;
    padding-top: 2px;
    padding-left: 2px;
    padding-right: 2px;
  }

  @media (max-width: 360px) {
    align-items: flex-start;
    padding-top: 2px;
    padding-left: 2px;
    padding-right: 2px;
  }

  @media (max-width: 320px) {
    align-items: flex-start;
    padding-top: 1px;
    padding-left: 1px;
    padding-right: 1px;
  }

  /* Landscape mobile optimization */
  @media (max-height: 500px) and (orientation: landscape) {
    align-items: flex-start;
    padding-top: 2px;
    padding-left: 5px;
    padding-right: 5px;
  }

  /* Very small landscape screens */
  @media (max-height: 400px) and (orientation: landscape) {
    align-items: flex-start;
    padding-top: 1px;
    padding-left: 3px;
    padding-right: 3px;
  }
`;

export const Chatbox = styled.div`
  &.closing {
    animation: slideOut 0.5s ease forwards;
  }
  transform: translateY(40px);
  opacity: 0;
  animation: slideUp 0.5s ease-out forwards;
  width: 100%;
  max-width: 820px;
  height: 96vh;
  max-height: 96vh;
  position: relative;

  /* Enhanced responsive breakpoints - Comprehensive mobile coverage */
  @media (max-width: 1200px) {
    width: 100%;
    max-width: 430px;
    height: 96vh;
    max-height: 96vh;
  }

  @media (max-width: 1024px) {
    width: 100%;
    max-width: 430px;
    height: 95vh;
    max-height: 95vh;
  }

  @media (max-width: 900px) {
    width: 96%;
    max-width: 96%;
    height: 94vh;
    max-height: 94vh;
  }

  @media (max-width: 768px) {
    width: 95%;
    max-width: 95%;
    height: 95vh;
    max-height: 95vh;
  }

  @media (max-width: 640px) {
    width: 96%;
    max-width: 96%;
    height: 90vh;
    max-height: 90vh;
  }

  @media (max-width: 600px) {
    width: 97%;
    max-width: 97%;
    height: 88vh;
    max-height: 88vh;
  }

  @media (max-width: 480px) {
    width: 98%;
    max-width: 98%;
    height: 85vh;
    max-height: 85vh;
  }

  @media (max-width: 414px) {
    width: 98.5%;
    max-width: 98.5%;
    height: 84vh;
    max-height: 84vh;
  }

  @media (max-width: 390px) {
    width: 99%;
    max-width: 99%;
    height: 83vh;
    max-height: 83vh;
  }

  @media (max-width: 375px) {
    width: 99%;
    max-width: 99%;
    height: 82vh;
    max-height: 82vh;
  }

  @media (max-width: 360px) {
    width: 99%;
    max-width: 99%;
    height: 82vh;
    max-height: 82vh;
  }

  @media (max-width: 320px) {
    width: 100%;
    max-width: 100%;
    height: 80vh;
    max-height: 80vh;
  }

  /* Landscape mobile optimization */
  @media (max-height: 500px) and (orientation: landscape) {
    width: 95%;
    max-width: 95%;
    height: 90vh;
    max-height: 90vh;
  }

  /* Very small landscape screens */
  @media (max-height: 400px) and (orientation: landscape) {
    width: 96%;
    max-width: 96%;
    height: 88vh;
    max-height: 88vh;
  }

  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);

  /* Responsive border radius - Enhanced mobile coverage */
  @media (max-width: 900px) {
    border-radius: 19px;
  }

  @media (max-width: 640px) {
    border-radius: 18px;
  }

  @media (max-width: 600px) {
    border-radius: 17px;
  }

  @media (max-width: 480px) {
    border-radius: 16px;
  }

  @media (max-width: 414px) {
    border-radius: 15px;
  }

  @media (max-width: 390px) {
    border-radius: 14px;
  }

  @media (max-width: 375px) {
    border-radius: 13px;
  }

  @media (max-width: 360px) {
    border-radius: 12px;
  }

  @media (max-width: 320px) {
    border-radius: 10px;
  }
`;

export const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: transparent;
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 0 0 0; /* Added top padding to move greeting message down */
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  background: transparent;

  /* Enhanced scrollbar for mobile */
  &::-webkit-scrollbar {
    width: 4px;
  }

  @media (max-width: 480px) {
    &::-webkit-scrollbar {
      width: 3px;
    }
  }

  &::-webkit-scrollbar-track {
    background: rgba(241, 241, 241, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(193, 193, 193, 0.6);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(168, 168, 168, 0.8);
  }

  /* Mobile-specific scrollbar styling */
  @media (max-width: 480px) {
    &::-webkit-scrollbar-track {
      background: rgba(241, 241, 241, 0.2);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(193, 193, 193, 0.5);
      border-radius: 2px;
    }
  }

  /* Smooth scrolling for mobile */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  /* Responsive top padding for greeting message positioning */
  @media (max-width: 1200px) {
    padding: 0.95rem 0 0 0;
  }

  @media (max-width: 1024px) {
    padding: 0.9rem 0 0 0;
  }

  @media (max-width: 900px) {
    padding: 0.85rem 0 0 0;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 0 0 0;
  }

  @media (max-width: 640px) {
    padding: 0.75rem 0 0 0;
  }

  @media (max-width: 600px) {
    padding: 0.7rem 0 0 0;
  }

  @media (max-width: 480px) {
    padding: 0.65rem 0 0 0;
  }

  @media (max-width: 414px) {
    padding: 0.6rem 0 0 0;
  }

  @media (max-width: 390px) {
    padding: 0.55rem 0 0 0;
  }

  @media (max-width: 375px) {
    padding: 0.5rem 0 0 0;
  }

  @media (max-width: 360px) {
    padding: 0.45rem 0 0 0;
  }

  @media (max-width: 320px) {
    padding: 0.4rem 0 0 0;
  }
`;

export const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px; /* Adds space between messages */
  padding: 1.25rem;
`;
