import React from "react";
import styled from "styled-components";
import TypewriterMarkdown from "./TypewriterMarkdown";
import ReactMarkdown from "react-markdown";
import { FaVolumeUp, FaStopCircle } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
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
  order: ${(props) => (props.$isUser ? "2" : "1")};
`;

const MessageBubble = styled.div`
  padding: 1.25rem;
  border-radius: 24px;
  font-size: 1rem;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: ${(props) => (props.$isUser ? "nowrap" : "pre-wrap")};
  hyphens: none;
  word-break: normal;
  max-width: ${(props) => (props.$isUser ? "90%" : "80%")};
  position: relative;
  margin: ${(props) => (props.$isUser ? "0.5rem 0" : "0.25rem 0")};
  width: ${(props) => (props.$isUser ? "auto" : "fit-content")};
  min-width: ${(props) => (props.$isUser ? "120px" : "60px")};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transform: scale(1);
  transition: transform 0.2s ease, background 0.3s ease, color 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
  
  /* Better mobile spacing */
  @media (max-width: 480px) {
    margin: ${(props) => (props.$isUser ? "0.4rem 0" : "0.2rem 0")};
    min-width: ${(props) => (props.$isUser ? "100px" : "50px")};
    padding: 1rem;
  }
  
  @media (max-width: 360px) {
    margin: ${(props) => (props.$isUser ? "0.3rem 0" : "0.15rem 0")};
    min-width: ${(props) => (props.$isUser ? "90px" : "40px")};
    padding: 0.875rem;
  }

  ${({ $isUser, $isDarkMode }) =>
    $isUser
      ? `
    background: linear-gradient(to right, #3b82f6, #8b5cf6);
    color: #ffffff;
    border-radius: 24px 24px 4px 24px;
  `
      : `
    background: ${$isDarkMode ? '#1f2937' : '#ffffff'};
    color: ${$isDarkMode ? '#ffffff' : '#1f2937'};
    border-radius: 24px 24px 24px 4px;
    border: 1px solid ${$isDarkMode ? '#374151' : '#e5e7eb'};
  `}

`;

const MessageContent = styled.div`
  p {
    margin: 0;
    padding: 0;
  }
`;

const MessageActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.375rem;
  gap: 0.5rem;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`;

const AudioButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
`;

const PlayButton = styled.button`
  cursor: pointer;
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  border-radius: 50%;

  &:hover {
    background: ${props => props.$isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'};
    color: #8b5cf6;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Removed AudioWaitingIndicator and ClickToPlayText - no longer needed

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
  background: linear-gradient(to bottom right, #8b5cf6, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  font-size: 1.25rem;
`;

const BotAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
`;

const BotName = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  transition: color 0.3s ease;
`;

const Timestamp = styled.span`
  font-size: 0.75rem;
  color: ${props => props.$isUser
    ? 'rgba(191, 219, 254, 1)'
    : props.$isDarkMode ? '#9ca3af' : '#9ca3af'};
  margin-top: 0.75rem;
  display: block;
  transition: color 0.3s ease;
`;

const MessageBubbleComponent = ({
  message,
  index,
  isUser,
  isTyping,
  animatedMessageIdx,
  chatHistoryLength,
  currentlyPlaying,
  playAudio,
  setAnimatedMessageIdx
}) => {
  const { isDarkMode } = useTheme();

  return (
    <MessageWrapper $isUser={isUser}>
      <MessageContainer $isUser={isUser}>
        {/* Show AI Assistant header OUTSIDE bubble for bot messages */}
        {!isUser && (
          <BotHeader>
            <BotAvatar>
              <BotAvatarImage
                src="https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png"
                alt="AI"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </BotAvatar>
            <BotName $isDarkMode={isDarkMode}>AI Assistant</BotName>
          </BotHeader>
        )}

        <MessageBubble $isUser={isUser} $isDarkMode={isDarkMode}>
          <MessageContent $isUser={isUser}>
            {/* Conditional rendering for typewriter effect with markdown support - ONLY for bot messages */}
            {!isUser &&
            index === chatHistoryLength - 1 &&
            !isTyping &&
            animatedMessageIdx !== index ? (
              <TypewriterMarkdown
                text={message.text}
                onComplete={() => setAnimatedMessageIdx(index)}
                speed={15}
              />
            ) : (
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "0",
                        color: "#1e90ff",
                        textDecoration: "none",
                        transition: "all 0.2s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.textDecoration = "underline";
                        e.target.style.color = "#0f62fe";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.textDecoration = "none";
                        e.target.style.color = "#1e90ff";
                      }}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p style={{ margin: "0", padding: "0" }} {...props} />
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            )}
          </MessageContent>

          {/* Timestamp inside message bubble */}
          <Timestamp $isDarkMode={isDarkMode} $isUser={isUser}>
            {message.timestamp ? message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Timestamp>
        </MessageBubble>

        {/* Audio play button outside bubble */}
        {!isUser && message.audio && (
          <AudioButtonWrapper>
            <PlayButton
              $isDarkMode={isDarkMode}
              onClick={() => {
                console.log(`Play button clicked for message ${index}, audio data:`, message.audio);
                playAudio(message.audio, index);
              }}
              disabled={isTyping}
              title={currentlyPlaying === index ? "Stop audio" : "Play audio"}
            >
              {currentlyPlaying === index ? (
                <FaStopCircle />
              ) : (
                <FaVolumeUp />
              )}
            </PlayButton>
          </AudioButtonWrapper>
        )}
      </MessageContainer>
    </MessageWrapper>
  );
};

export default MessageBubbleComponent;
