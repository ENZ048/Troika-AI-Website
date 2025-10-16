import React from "react";
import styled from "styled-components";
import { useTheme } from "../contexts/ThemeContext";

const SuggestionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
  margin: 0.25rem 0 0.5rem 0;
  background: transparent;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  justify-content: center;
  align-items: center;

  /* Enhanced mobile responsiveness */
  @media (max-width: 1024px) {
    gap: 0.4rem;
    padding: 0.4rem 0;
    margin: 0.2rem 0 0.4rem 0;
  }

  @media (max-width: 768px) {
    gap: 0.35rem;
    padding: 0.35rem 0;
    margin: 0.15rem 0 0.35rem 0;
  }

  @media (max-width: 640px) {
    gap: 0.3rem;
    padding: 0.3rem 0;
    margin: 0.1rem 0 0.3rem 0;
  }

  @media (max-width: 480px) {
    gap: 0.25rem;
    padding: 0.25rem 0;
    margin: 0.05rem 0 0.25rem 0;
  }

  @media (max-width: 414px) {
    gap: 0.2rem;
    padding: 0.2rem 0;
    margin: 0.05rem 0 0.2rem 0;
  }

  @media (max-width: 375px) {
    gap: 0.15rem;
    padding: 0.15rem 0;
    margin: 0.05rem 0 0.15rem 0;
  }

  @media (max-width: 360px) {
    gap: 0.1rem;
    padding: 0.1rem 0;
    margin: 0.05rem 0 0.1rem 0;
  }

  @media (max-width: 320px) {
    gap: 0.08rem;
    padding: 0.08rem 0;
    margin: 0.05rem 0 0.08rem 0;
  }

  /* Extra small screens */
  @media (max-width: 280px) {
    gap: 0.05rem;
    padding: 0.05rem 0;
    margin: 0.05rem 0 0.05rem 0;
  }
`;

const SuggestionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  color: ${props => props.$isDarkMode ? '#e5e7eb' : '#495057'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  white-space: normal;
  flex-shrink: 1;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;

  /* Gradient border effect - matching ServiceSelectionButtons */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(${props => props.$isDarkMode ? '#1f2937' : '#ffffff'}, ${props => props.$isDarkMode ? '#1f2937' : '#ffffff'}),
    linear-gradient(90deg, #20E3B2, #8B5CF6);
  background-origin: border-box;
  background-clip: padding-box, border-box;

  /* Animation properties */
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.4s ease-in-out forwards;
  animation-delay: ${(props) => props.$delay || "0s"};

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-image: 
      linear-gradient(${props => props.$isDarkMode ? '#374151' : '#f8f9fa'}, ${props => props.$isDarkMode ? '#374151' : '#f8f9fa'}),
      linear-gradient(90deg, #20E3B2, #8B5CF6);
  }

  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }

  @media (max-width: 1024px) {
    padding: 0.45rem 0.9rem;
    font-size: 0.8rem;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    max-width: 100%;
  }

  @media (max-width: 640px) {
    padding: 0.35rem 0.7rem;
    font-size: 0.7rem;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
    max-width: 100%;
  }

  @media (max-width: 414px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.6rem;
    max-width: 100%;
  }

  @media (max-width: 375px) {
    padding: 0.2rem 0.4rem;
    font-size: 0.55rem;
    max-width: 100%;
  }

  @media (max-width: 360px) {
    padding: 0.18rem 0.35rem;
    font-size: 0.5rem;
    max-width: 100%;
  }

  @media (max-width: 320px) {
    padding: 0.15rem 0.3rem;
    font-size: 0.45rem;
    max-width: 100%;
    min-width: 120px;
  }

  /* Extra small screens */
  @media (max-width: 280px) {
    padding: 0.1rem 0.25rem;
    font-size: 0.4rem;
    max-width: 100%;
    min-width: 100px;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextContainer = styled.div`
  text-align: center;
`;

const SuggestionButtons = ({ suggestions, onSuggestionClick, isDarkMode }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <SuggestionContainer>
      {suggestions.map((suggestion, index) => {
        // Handle both string suggestions and object suggestions
        const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text;
        const suggestionTitle = typeof suggestion === 'string' ? suggestion : suggestion.text;
        
        return (
          <SuggestionButton
            key={index}
            $isDarkMode={isDarkMode}
            $delay={`${index * 0.1}s`}
            onClick={() => onSuggestionClick(suggestion)}
            title={suggestionTitle}
          >
            <ButtonContent>
              <TextContainer>{suggestionText}</TextContainer>
            </ButtonContent>
          </SuggestionButton>
        );
      })}
    </SuggestionContainer>
  );
};

export default SuggestionButtons;