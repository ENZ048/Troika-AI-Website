import React from "react";
import styled from "styled-components";

const SuggestionContainer = styled.div`
  display: inline-block;
  padding: 0.75rem;
  margin: 0.5rem 0 1rem 0;
  background: transparent;
  position: relative;
  z-index: 1;
  width: 100%;

  /* Enhanced mobile responsiveness */
  @media (max-width: 1024px) {
    padding: 0.7rem;
    margin: 0.4rem 0 0.8rem 0;
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
    margin: 0.3rem 0 0.7rem 0;
  }

  @media (max-width: 640px) {
    padding: 0.5rem;
    margin: 0.25rem 0 0.6rem 0;
  }

  @media (max-width: 480px) {
    padding: 0.4rem;
    margin: 0.2rem 0 0.5rem 0;
  }

  @media (max-width: 360px) {
    padding: 0.3rem;
    margin: 0.15rem 0 0.4rem 0;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const TextContainer = styled.div`
  flex: 1;
  text-align: center;
`;

const SuggestionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  /* --- FIX STARTS HERE --- */

  /* 1. Set a transparent border to define the border's thickness */
  border: 2px solid transparent;
  
  /* 2. Apply two backgrounds: the inner color and the outer gradient */
  background-image: 
    linear-gradient(#ffffff, #ffffff), /* Inner background */
    linear-gradient(90deg, #20E3B2, #8B5CF6); /* Border gradient */

  /* 3. Define the origin and clip for each background */
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* The ::before pseudo-element is no longer needed */

  /* --- FIX ENDS HERE --- */


  /* Animation properties (unchanged) */
  opacity: 0;
  transform: translateX(-30px);
  animation: fadeInLeft 1s ease-in-out forwards;
  animation-delay: ${(props) => props.$delay || "0s"};

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    /* Update the inner background color on hover */
    background-image: 
      linear-gradient(#f8f9fa, #f8f9fa),
      linear-gradient(90deg, #20E3B2, #8B5CF6);
  }

  &:active {
    transform: translateY(0) scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }

  /* Responsive styles remain the same, but the border will now work correctly */
  @media (max-width: 1024px) {
    margin: 10px 0px;
    padding: 11px 18px;
    font-size: 1rem;
    border-radius: 12px;
  }

  @media (max-width: 768px) {
    margin: 8px 0px;
    padding: 10px 16px;
    font-size: 0.95rem;
    border-radius: 18px;
  }

  @media (max-width: 640px) {
    margin: 6px 0px;
    padding: 9px 14px;
    font-size: 1rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    margin: 5px 0px;
    padding: 8px 12px;
    font-size: 1.05rem;
    border-radius: 14px;
  }

  @media (max-width: 360px) {
    margin: 4px 0px;
    padding: 7px 10px;
    font-size: 1.1rem;
    border-radius: 12px;
  }

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    display: block;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 14px;
      height: 14px;
    }

    @media (max-width: 480px) {
      width: 12px;
      height: 12px;
    }

    @media (max-width: 360px) {
      width: 10px;
      height: 10px;
    }
  }
`;

const LanguageText = styled.div`
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  line-height: 1.4;
  opacity: 0;
  animation: fadeInUp 0.5s ease-out 1.5s forwards;
  
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
`;

// The rest of your component remains the same
const SuggestionButtons = ({ onSuggestionClick, isVisible }) => {
  const suggestions = [
    { text: "Want me to explain how it works?" },
    { text: "Would you like to try our free demo?" },
    { text: "Shall I share the current offer packages?" },
    { text: "Do you want more details on data?" },
  ];

  if (!isVisible) return null;

  return (
    <SuggestionContainer>
      {suggestions.map((suggestion, index) => (
        <SuggestionButton
          key={index}
          $delay={`${index * 0.2}s`} // Each button appears 0.2 seconds after the previous
          onClick={() => onSuggestionClick(suggestion.text)}
        >
          <ButtonContent>
            <TextContainer>{suggestion.text}</TextContainer>
          </ButtonContent>
        </SuggestionButton>
      ))}
      <LanguageText>
        You can chat with me in all the Indian languages
      </LanguageText>
    </SuggestionContainer>
  );
};

export default SuggestionButtons;