import React from "react";
import styled from "styled-components";
import TypewriterMarkdown from "./TypewriterMarkdown";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { FaVolumeUp, FaStopCircle } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import SuggestionButtons from "./SuggestionButtons";

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
  max-width: ${(props) => (props.$isPricing || props.$isSales ? "100%" : "75%")};
  display: flex;
  flex-direction: column;
  order: ${(props) => (props.$isUser ? "2" : "1")};
`;

const MessageBubble = styled.div`
  padding: ${(props) => (props.$isPricing || props.$isSales ? "0" : "0.875rem 1rem")};
  border-radius: 24px;
  font-size: 1rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: ${(props) => (props.$isUser ? "nowrap" : "normal")};
  hyphens: auto;
  word-break: break-word;
  position: relative;
  margin: ${(props) => (props.$isUser ? "0.5rem 0" : "0.25rem 0")};
  width: ${(props) => (props.$isUser ? "auto" : "100%")};
  max-width: 100%;
  min-width: ${(props) => (props.$isUser ? "200px" : "60px")};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: ${(props) => (props.$isPricing || props.$isSales ? 'none' : '0 10px 40px rgba(0, 0, 0, 0.15)')};
  transform: scale(1);
  transition: transform 0.2s ease, background 0.3s ease, color 0.3s ease;

  /* Increased min-width for bot messages on big screens - following Reference.jsx approach */
  @media (min-width: 1200px) {
    min-width: ${(props) => (props.$isUser ? "200px" : "300px")};
  }

  @media (min-width: 1400px) {
    min-width: ${(props) => (props.$isUser ? "200px" : "350px")};
  }

  @media (min-width: 1600px) {
    min-width: ${(props) => (props.$isUser ? "200px" : "400px")};
  }

  &:hover {
    transform: scale(1.02);
  }
  
  /* Better mobile spacing */
  @media (max-width: 480px) {
    margin: ${(props) => (props.$isUser ? "0.4rem 0" : "0.2rem 0")};
    min-width: ${(props) => (props.$isUser ? "150px" : "50px")};
    padding: 0.75rem 0.875rem;
  }
  
  @media (max-width: 360px) {
    margin: ${(props) => (props.$isUser ? "0.3rem 0" : "0.15rem 0")};
    min-width: ${(props) => (props.$isUser ? "120px" : "40px")};
    padding: 0.625rem 0.75rem;
  }

  ${({ $isUser, $isDarkMode, $isPricing }) =>
    $isPricing
      ? `
    background: transparent;
    color: inherit;
    border-radius: 0;
    border: none;
    box-shadow: none;
  `
      : $isUser
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
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  width: 100%;
  max-width: 100%;
  /* Prevent pre-wrap from forcing line breaks inside lists */
  ol, ul, li { white-space: normal; }
  
  /* For pricing and sales messages, allow full width and remove any constraints */
  ${(props) => (props.$isPricing || props.$isSales) && `
    width: 100%;
    max-width: 100%;
    overflow: visible;
  `}
  
  p {
    margin: 0 0 0.4rem 0;
    padding: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    line-height: 1.45;
    width: 100%;
    max-width: 100%;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Ordered lists (numbered) */
  ol {
    margin: 0.15rem 0;
    padding-left: 1.5rem;
    list-style-position: outside;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Unordered lists (bullets) */
  ul {
    margin: 0.15rem 0;
    padding-left: 1.5rem;
    list-style-position: outside;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  /* List items */
  li {
    margin: 0.2rem 0;
    padding-left: 0.25rem; /* tighter so text aligns closer to marker */
    line-height: 1.45;
    
    /* Nested paragraphs in list items */
    p {
      margin: 0;
      display: inline;
      line-height: inherit;
    }
  }

  /* Reduce spacing for nested lists */
  li ul, li ol {
    margin: 0.25rem 0 0.15rem 0;
    padding-left: 1.25rem;
  }
  
  /* Nested list items should have less spacing */
  li li {
    margin: 0.15rem 0;
    padding-left: 0.3rem;
    line-height: 1.4;
  }

  /* Strong/bold text in lists */
  strong {
    font-weight: 600;
  }

  /* Remove extra spacing from markdown-generated content */
  > *:first-child {
    margin-top: 0;
  }
  
  > *:last-child {
    margin-bottom: 0;
  }

  /* Ensure proper spacing between different list types */
  ol + p, ul + p {
    margin-top: 0.5rem;
  }
  
  p + ol, p + ul {
    margin-top: 0.35rem;
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
  // background: linear-gradient(to bottom right, #8b5cf6, #ec4899);
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
  setAnimatedMessageIdx,
  onSuggestionClick
}) => {
  const { isDarkMode } = useTheme();

  // Check if this is a pricing or sales message that needs HTML rendering
  const isPricingMessage = !isUser && message.text && (
    message.text.includes('<div style=') || 
    message.text.includes('Choose Your Perfect Plan') ||
    message.text.includes('AI Website Pricing Plans')
  );
  
  const isSalesMessage = !isUser && message.text && (
    message.text.includes('Special Offer Package') ||
    message.text.includes('Bonuses for Closing Deals') ||
    message.text.includes('Discount Information') ||
    message.text.includes('🎯 Special Offer Package') ||
    message.text.includes('🎁 Bonuses for Closing Deals') ||
    message.text.includes('💸 Discount Information') ||
    (message.text.includes('<div style=') && 
     !message.text.includes('Choose Your Perfect Plan') && 
     !message.text.includes('AI Website Pricing Plans') &&
     !message.text.includes('AI Marketing Revolution') &&
     !message.text.includes('Follow Us on Social Media'))
  );
  
  const isMarketingMessage = !isUser && message.text && (
    message.text.includes('AI Marketing Revolution') ||
    message.text.includes('Follow Us on Social Media') ||
    message.text.includes('Marketing')
  );
  
  const isHTMLMessage = isPricingMessage || isSalesMessage || isMarketingMessage || message.isHTML;

  return (
    <MessageWrapper $isUser={isUser}>
      <MessageContainer $isUser={isUser} $isPricing={isPricingMessage} $isSales={isSalesMessage}>
        {/* Show AI Assistant header OUTSIDE bubble for bot messages */}
        {!isUser && (
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
        )}

        {isHTMLMessage ? (
          <div 
            dangerouslySetInnerHTML={{ __html: message.text }} 
            style={{
              width: '100%',
              maxWidth: '100%',
              overflow: 'visible',
              background: 'transparent',
              border: 'none',
              padding: '0',
              margin: '0',
              fontSize: '14px',
              lineHeight: '1.4'
            }}
          />
        ) : (
          <MessageBubble $isUser={isUser} $isDarkMode={isDarkMode} $isPricing={isPricingMessage} $isSales={isSalesMessage}>
            <MessageContent $isUser={isUser} $isPricing={isPricingMessage} $isSales={isSalesMessage}>
              {/* Conditional rendering for typewriter effect with markdown support - ONLY for bot messages */}
              {!isUser &&
              index === chatHistoryLength - 1 &&
              !isTyping &&
              animatedMessageIdx !== index &&
              !message.wasStreamed ? (
                <TypewriterMarkdown
                  text={message.text}
                  onComplete={() => setAnimatedMessageIdx(index)}
                  speed={15}
                />
              ) : (
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
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
                    div: ({ node, ...props }) => (
                      <div {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} />
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
        )}

        {/* Audio play button outside bubble - hidden for streamed messages as they handle audio via WebAudioPlayer */}
        {!isUser && message.audio && !message.wasStreamed && (
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

        {/* Suggestion buttons for bot messages */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <SuggestionButtons
            suggestions={message.suggestions}
            onSuggestionClick={onSuggestionClick}
            isDarkMode={isDarkMode}
          />
        )}
      </MessageContainer>
    </MessageWrapper>
  );
};

export default MessageBubbleComponent;
