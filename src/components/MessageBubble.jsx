import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
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
  max-width: ${(props) => (props.$isPricing || props.$isSales ? "100%" : "75%")};
  display: flex;
  flex-direction: column;
  order: ${(props) => (props.$isUser ? "2" : "1")};

  @media (max-width: 768px) {
    max-width: ${(props) => (props.$isPricing || props.$isSales ? "100%" : props.$isUser ? "75%" : "95%")};
  }
`;

const MessageBubble = styled.div`
  padding: ${(props) => (props.$isPricing || props.$isSales ? "0" : props.$isUser ? "0.875rem 1rem" : "0")};
  border-radius: ${(props) => (props.$isUser ? "24px" : "0")};
  font-size: 1rem;
  line-height: 1.4;
  word-wrap: ${(props) => (props.$isUser ? "break-word" : "normal")};
  overflow-wrap: ${(props) => (props.$isUser ? "break-word" : "normal")};
  white-space: ${(props) => (props.$isUser ? "nowrap" : "normal")};
  hyphens: ${(props) => (props.$isUser ? "auto" : "none")};
  word-break: ${(props) => (props.$isUser ? "break-word" : "normal")};
  position: relative;
  margin: ${(props) => (props.$isUser ? "0.5rem 0" : "0.25rem 0")};
  width: ${(props) => (props.$isUser ? "auto" : "100%")};
  max-width: 100%;
  min-width: ${(props) => (props.$isUser ? "200px" : "60px")};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: ${(props) => (props.$isPricing || props.$isSales || !props.$isUser ? 'none' : '0 10px 40px rgba(0, 0, 0, 0.15)')};
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
    transform: ${(props) => (props.$isUser ? "scale(1.02)" : "scale(1)")};
  }

  /* Better mobile spacing */
  @media (max-width: 480px) {
    margin: ${(props) => (props.$isUser ? "0.4rem 0" : "0.2rem 0")};
    min-width: ${(props) => (props.$isUser ? "150px" : "50px")};
    padding: ${(props) => (props.$isUser ? "0.75rem 0.875rem" : "0")};
  }

  @media (max-width: 360px) {
    margin: ${(props) => (props.$isUser ? "0.3rem 0" : "0.15rem 0")};
    min-width: ${(props) => (props.$isUser ? "120px" : "40px")};
    padding: ${(props) => (props.$isUser ? "0.625rem 0.75rem" : "0")};
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
    background: transparent;
    color: ${$isDarkMode ? '#ffffff' : '#1f2937'};
    border-radius: 0;
    border: none;
  `}

`;

const MessageContent = styled.div`
  text-align: left;
  word-wrap: ${(props) => (props.$isUser ? "break-word" : "normal")};
  overflow-wrap: ${(props) => (props.$isUser ? "break-word" : "normal")};
  word-break: ${(props) => (props.$isUser ? "break-word" : "normal")};
  hyphens: ${(props) => (props.$isUser ? "auto" : "none")};
  white-space: normal;
  width: 100%;
  max-width: 100%;
  word-spacing: ${(props) => (props.$isUser ? "normal" : "0.05em")};
  letter-spacing: ${(props) => (props.$isUser ? "normal" : "0.005em")};
  color: ${(props) => (props.$isUser ? "inherit" : props.$isDarkMode ? '#d1d5db' : '#374151')};
  font-size: 1rem;

  /* Prevent pre-wrap from forcing line breaks inside lists */
  ol, ul, li {
    white-space: normal;
    word-break: normal;
    hyphens: none;
  }

  /* For pricing and sales messages, allow full width and remove any constraints */
  ${(props) => (props.$isPricing || props.$isSales) && `
    width: 100%;
    max-width: 100%;
    overflow: visible;
  `}

  p {
    margin: 0 0 1rem 0;
    padding: 0;
    word-wrap: ${(props) => (props.$isUser ? "break-word" : "normal")};
    overflow-wrap: ${(props) => (props.$isUser ? "break-word" : "normal")};
    word-break: ${(props) => (props.$isUser ? "break-word" : "normal")};
    hyphens: ${(props) => (props.$isUser ? "auto" : "none")};
    white-space: normal;
    line-height: ${(props) => (props.$isUser ? "1.45" : "1.7")};
    width: 100%;
    max-width: 100%;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Ordered lists (numbered) - ChatGPT style */
  ol {
    margin: 0.75rem 0;
    padding-left: 2rem;
    list-style-position: outside;
    list-style-type: decimal;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Unordered lists (bullets) - ChatGPT style */
  ul {
    margin: 0.75rem 0;
    padding-left: 2rem;
    list-style-position: outside;
    list-style-type: disc;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* List items - ChatGPT style */
  li {
    margin: 0.6rem 0;
    padding-left: 0.35rem;
    line-height: 1.7;

    /* Nested paragraphs in list items */
    p {
      margin: 0;
      display: inline;
      line-height: inherit;
    }

    /* Strong text in lists */
    strong {
      font-weight: 700;
    }
  }

  /* Reduce spacing for nested lists */
  li ul, li ol {
    margin: 0.5rem 0 0.35rem 0;
    padding-left: 1.75rem;
  }

  /* Nested list items should have less spacing */
  li li {
    margin: 0.4rem 0;
    padding-left: 0.35rem;
    line-height: 1.6;
  }

  /* Strong/bold text - ChatGPT style */
  strong {
    font-weight: 700;
    color: ${(props) => (props.$isDarkMode ? '#ececec' : '#0d0d0d')};
  }

  /* Headings - ChatGPT style */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    margin: 1.25rem 0 0.75rem 0;
    line-height: 1.4;
    color: ${(props) => (props.$isDarkMode ? '#ececec' : '#0d0d0d')};

    &:first-child {
      margin-top: 0.5rem;
    }
  }

  h1 {
    font-size: 1.5em;
    margin-bottom: 0.85rem;
  }

  h2 {
    font-size: 1.25em;
    margin-bottom: 0.75rem;
  }

  h3 {
    font-size: 1.15em;
    margin-bottom: 0.7rem;
  }

  h4 {
    font-size: 1.1em;
    margin-bottom: 0.65rem;
  }

  h5, h6 {
    font-size: 1.05em;
  }

  /* Add spacing after headings */
  h1 + p, h2 + p, h3 + p, h4 + p, h1 + ul, h2 + ul, h3 + ul, h4 + ul {
    margin-top: 0.35rem;
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
    margin-top: 0.75rem;
  }

  p + ol, p + ul {
    margin-top: 0.5rem;
  }

  /* Horizontal rules */
  hr {
    margin: 1.5rem 0;
    border: none;
    border-top: 1px solid ${(props) => (props.$isDarkMode ? '#4b5563' : '#e5e7eb')};
  }

  /* Code blocks */
  code {
    background: ${(props) => (props.$isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)')};
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
  }

  pre {
    background: ${(props) => (props.$isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)')};
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;

    code {
      background: transparent;
      padding: 0;
    }
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
  chatHistoryLength,
  currentlyPlaying,
  playAudio,
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
              {/* Render message with markdown support - no typewriter animation */}
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
                    <p {...props} />
                  ),
                  div: ({ node, ...props }) => (
                    <div {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4 {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em {...props} />
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            </MessageContent>

            {/* Timestamp inside message bubble */}
            <Timestamp $isDarkMode={isDarkMode} $isUser={isUser}>
              {message.timestamp && message.timestamp instanceof Date && !isNaN(message.timestamp.getTime()) 
                ? message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
              }
            </Timestamp>
          </MessageBubble>
        )}

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
