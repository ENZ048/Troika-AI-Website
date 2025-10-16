import React from 'react';
import styled, { keyframes } from 'styled-components';
import ReactMarkdown from 'react-markdown';

// Animations
const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled components
const StreamingMessageContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 10px 0;
  animation: ${fadeIn} 0.3s ease-in;
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  background: ${props => props.$isDarkMode
    ? 'linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%)'
    : 'linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)'};
  color: ${props => props.$isDarkMode ? '#e0e0e0' : '#333'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const StreamingText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;

  /* Markdown styling */
  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  code {
    background: ${props => props.$isDarkMode ? '#1e1e1e' : '#f5f5f5'};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }

  pre {
    background: ${props => props.$isDarkMode ? '#1e1e1e' : '#f5f5f5'};
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;

    code {
      background: transparent;
      padding: 0;
    }
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  a {
    color: ${props => props.$isDarkMode ? '#60a5fa' : '#3b82f6'};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StreamingCursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: ${props => props.$isDarkMode ? '#60a5fa' : '#3b82f6'};
  margin-left: 2px;
  animation: ${blink} 1s infinite;
  vertical-align: text-bottom;
`;

const AudioIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 6px 10px;
  background: ${props => props.$isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  border-radius: 12px;
  font-size: 12px;
  color: ${props => props.$isDarkMode ? '#60a5fa' : '#3b82f6'};
`;

const AudioIcon = styled.span`
  margin-right: 6px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingDots = styled.span`
  &::after {
    content: '';
    animation: ${keyframes`
      0%, 20% { content: ''; }
      40% { content: '.'; }
      60% { content: '..'; }
      80%, 100% { content: '...'; }
    `} 1.5s infinite;
  }
`;

const ErrorContainer = styled.div`
  padding: 8px 12px;
  margin-top: 8px;
  background: ${props => props.$isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border-radius: 8px;
  color: ${props => props.$isDarkMode ? '#ef4444' : '#dc2626'};
  font-size: 12px;
`;

const RetryButton = styled.button`
  margin-top: 6px;
  padding: 4px 12px;
  background: ${props => props.$isDarkMode ? '#ef4444' : '#dc2626'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isDarkMode ? '#dc2626' : '#b91c1c'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MetricsContainer = styled.div`
  margin-top: 8px;
  padding: 6px 10px;
  background: ${props => props.$isDarkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)'};
  border-radius: 8px;
  font-size: 11px;
  color: ${props => props.$isDarkMode ? '#9ca3af' : '#6b7280'};
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetricItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

/**
 * StreamingMessage Component
 * Displays a streaming message with text animation, audio indicator, and metrics
 */
const StreamingMessage = ({
  text = '',
  isStreaming = false,
  audioPlaying = false,
  error = null,
  metrics = null,
  isDarkMode = false,
  showCursor = true,
  onRetry = null,
}) => {
  // Ensure text is always a string
  const displayText = typeof text === 'string' ? text : String(text || '');

  // Ensure error is always a string
  const errorMessage = error
    ? (typeof error === 'string' ? error : error.message || String(error))
    : null;

  return (
    <StreamingMessageContainer>
      <MessageBubble $isDarkMode={isDarkMode}>
        <StreamingText $isDarkMode={isDarkMode}>
          {displayText ? (
            <>
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p style={{ margin: "0.4rem 0", padding: "0" }} {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }} {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }} {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{ margin: "0.3rem 0", lineHeight: "1.5" }} {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong style={{ fontWeight: "600" }} {...props} />
                  ),
                }}
              >
                {displayText}
              </ReactMarkdown>
              {isStreaming && showCursor && <StreamingCursor $isDarkMode={isDarkMode} />}
            </>
          ) : (
            <span>
              Thinking<LoadingDots />
            </span>
          )}
        </StreamingText>

        {/* Audio indicator removed - audio plays automatically without visual indicator */}

        {errorMessage && (
          <ErrorContainer $isDarkMode={isDarkMode}>
            <div>{errorMessage}</div>
            {onRetry && (
              <RetryButton $isDarkMode={isDarkMode} onClick={onRetry}>
                Retry
              </RetryButton>
            )}
          </ErrorContainer>
        )}

        {metrics && !isStreaming && typeof metrics === 'object' && (
          <MetricsContainer $isDarkMode={isDarkMode}>
            {metrics.duration && (
              <MetricItem>
                ⏱️ {(metrics.duration / 1000).toFixed(2)}s
              </MetricItem>
            )}
            {metrics.firstTokenLatency && (
              <MetricItem>
                ⚡ First token: {metrics.firstTokenLatency}ms
              </MetricItem>
            )}
            {metrics.wordCount && (
              <MetricItem>
                📝 {metrics.wordCount} words
              </MetricItem>
            )}
          </MetricsContainer>
        )}
      </MessageBubble>
    </StreamingMessageContainer>
  );
};

export default StreamingMessage;
