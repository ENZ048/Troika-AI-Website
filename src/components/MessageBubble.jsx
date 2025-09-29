import React from "react";
import styled from "styled-components";
import TypewriterMarkdown from "./TypewriterMarkdown";
import ReactMarkdown from "react-markdown";
import { FaVolumeUp, FaStopCircle } from "react-icons/fa";

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  margin: 0.5rem 0;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  padding: ${(props) => (props.$isUser ? "0 16px 0 0" : "0 0 0 16px")};
  overflow: visible;

  /* Enhanced mobile responsiveness - Comprehensive breakpoints */
  @media (max-width: 1200px) {
    margin: 0.5rem 0;
    padding: ${(props) => (props.$isUser ? "0 12px 0 0" : "0 0 0 12px")};
  }

  @media (max-width: 1024px) {
    margin: 0.5rem 0;
    padding: ${(props) => (props.$isUser ? "0 10px 0 0" : "0 0 0 10px")};
  }

  @media (max-width: 900px) {
    margin: 0.45rem 0;
    padding: ${(props) => (props.$isUser ? "0 9px 0 0" : "0 0 0 9px")};
  }

  @media (max-width: 768px) {
    margin: 0.375rem 0;
    padding: ${(props) => (props.$isUser ? "0 8px 0 0" : "0 0 0 8px")};
  }

  @media (max-width: 640px) {
    margin: 0.3rem 0;
    padding: ${(props) => (props.$isUser ? "0 6px 0 0" : "0 0 0 6px")};
  }

  @media (max-width: 600px) {
    margin: 0.28rem 0;
    padding: ${(props) => (props.$isUser ? "0 5px 0 0" : "0 0 0 5px")};
  }

  @media (max-width: 480px) {
    margin: 0.25rem 0;
    padding: ${(props) => (props.$isUser ? "0 4px 0 0" : "0 0 0 4px")};
  }

  @media (max-width: 414px) {
    margin: 0.22rem 0;
    padding: ${(props) => (props.$isUser ? "0 3px 0 0" : "0 0 0 3px")};
  }

  @media (max-width: 390px) {
    margin: 0.2rem 0;
    padding: ${(props) => (props.$isUser ? "0 2px 0 0" : "0 0 0 2px")};
  }

  @media (max-width: 375px) {
    margin: 0.18rem 0;
    padding: ${(props) => (props.$isUser ? "0 2px 0 0" : "0 0 0 2px")};
  }

  @media (max-width: 360px) {
    margin: 0.2rem 0;
    padding: ${(props) => (props.$isUser ? "0 2px 0 0" : "0 0 0 2px")};
  }

  @media (max-width: 320px) {
    margin: 0.15rem 0;
    padding: ${(props) => (props.$isUser ? "0 1px 0 0" : "0 0 0 1px")};
  }
`;

const MessageBubble = styled.div`
  padding: 0.79rem 1.05rem; /* Increased by 5% from 0.75rem 1rem for greeting message */
  border-radius: 18px;
  font-size: 1.21rem; /* Increased by additional 10% from 1.1rem for better readability */
  line-height: 1.5; /* Improved line height for better readability */

  /* Desktop-specific font size decrease by 15% */
  @media (min-width: 1201px) {
    font-size: 1.03rem; /* Decreased by 15% from 1.21rem for desktop */
  }
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  hyphens: none;
  word-break: normal;
  max-width: ${(props) => (props.$isUser ? "100%" : "80%")};
  position: relative;
  margin: 0.25rem 0;
  width: fit-content;
  min-width: 60px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Better mobile spacing */
  @media (max-width: 480px) {
    margin: 0.2rem 0;
    min-width: 50px;
  }
  
  @media (max-width: 360px) {
    margin: 0.15rem 0;
    min-width: 40px;
  }

  ${({ $isUser }) =>
    $isUser
      ? `
    background: #000;
    color: #fff;
    align-self: flex-end;
  `
      : `
    background: #f8f9fa;
    color: #000;
    align-self: flex-start;
  `}

  /* Enhanced mobile responsiveness - Comprehensive breakpoints with improved font scaling */
  @media (max-width: 1200px) {
    padding: 0.76rem 1rem; /* Increased by 5% from 0.72rem 0.95rem */
    font-size: 1.19rem; /* Increased by additional 10% from 1.08rem for better readability */
    max-width: ${(props) => (props.$isUser ? "100%" : "79%")};
    border-radius: 17px;
    line-height: 1.45;
  }

  @media (max-width: 1024px) {
    padding: 0.74rem 0.95rem; /* Increased by 5% from 0.7rem 0.9rem */
    font-size: 1.17rem; /* Increased by additional 10% from 1.06rem for better readability */
    max-width: ${(props) => (props.$isUser ? "100%" : "78%")};
    border-radius: 16px;
    line-height: 1.42;
  }

  @media (max-width: 900px) {
    padding: 0.71rem 0.92rem; /* Increased by 5% from 0.68rem 0.88rem */
    font-size: 1.13rem; /* Increased by additional 10% from 1.03rem for better mobile readability */
    max-width: ${(props) => (props.$isUser ? "100%" : "79%")};
    border-radius: 15.5px;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    padding: 0.68rem 0.89rem; /* Increased by 5% from 0.65rem 0.85rem */
    font-size: 1.11rem; /* Increased by additional 10% from 1.01rem for maintained readability on tablets */
    max-width: ${(props) => (props.$isUser ? "100%" : "80%")};
    border-radius: 15px;
    margin: 0.4rem 0;
    line-height: 1.38;
  }

  @media (max-width: 640px) {
    padding: 0.63rem 0.84rem; /* Increased by 5% from 0.6rem 0.8rem */
    font-size: 1.07rem; /* Increased by additional 10% from 0.97rem for good mobile readability */
    max-width: ${(props) => (props.$isUser ? "100%" : "82%")};
    border-radius: 14px;
    margin: 0.35rem 0;
    line-height: 1.35;
  }

  @media (max-width: 600px) {
    padding: 0.61rem 0.82rem; /* Increased by 5% from 0.58rem 0.78rem */
    font-size: 1.05rem; /* Increased by additional 10% from 0.95rem for small screens */
    max-width: ${(props) => (props.$isUser ? "100%" : "83%")};
    border-radius: 13.5px;
    margin: 0.32rem 0;
    line-height: 1.33;
  }

  @media (max-width: 480px) {
    padding: 0.58rem 0.79rem; /* Increased by 5% from 0.55rem 0.75rem */
    font-size: 1.09rem; /* Increased by additional 10% from 0.99rem for better mobile readability */
    max-width: ${(props) => (props.$isUser ? "100%" : "85%")};
    border-radius: 13px;
    margin: 0.3rem 0;
    line-height: 1.32;
  }

  @media (max-width: 414px) {
    padding: 0.55rem 0.76rem; /* Increased by 5% from 0.52rem 0.72rem */
    font-size: 1.07rem; /* Increased by additional 10% from 0.97rem for iPhone readability */
    max-width: ${(props) => (props.$isUser ? "100%" : "86%")};
    border-radius: 12.5px;
    margin: 0.28rem 0;
    line-height: 1.3;
  }

  @media (max-width: 390px) {
    padding: 0.53rem 0.74rem; /* Increased by 5% from 0.5rem 0.7rem */
    font-size: 1.05rem; /* Increased by additional 10% from 0.95rem for small phone optimization */
    max-width: ${(props) => (props.$isUser ? "100%" : "87%")};
    border-radius: 12px;
    margin: 0.26rem 0;
    line-height: 1.28;
  }

  @media (max-width: 375px) {
    padding: 0.5rem 0.71rem; /* Increased by 5% from 0.48rem 0.68rem */
    font-size: 1.01rem; /* Increased by additional 10% from 0.92rem for iPhone SE readability */
    max-width: ${(props) => (props.$isUser ? "100%" : "87.5%")};
    border-radius: 11.5px;
    margin: 0.24rem 0;
    line-height: 1.26;
  }

  @media (max-width: 360px) {
    padding: 0.53rem 0.74rem; /* Increased by 5% from 0.5rem 0.7rem */
    font-size: 0.99rem; /* Increased by additional 10% from 0.9rem for very small screens */
    max-width: ${(props) => (props.$isUser ? "100%" : "88%")};
    border-radius: 12px;
    margin: 0.25rem 0;
    line-height: 1.25;
  }

  @media (max-width: 320px) {
    padding: 0.47rem 0.68rem; /* Increased by 5% from 0.45rem 0.65rem */
    font-size: 0.97rem; /* Increased by additional 10% from 0.88rem for minimum readable size */
    max-width: ${(props) => (props.$isUser ? "100%" : "90%")};
    border-radius: 10px;
    margin: 0.2rem 0;
    line-height: 1.22;
  }
`;

const MessageActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.375rem;
  gap: 0.5rem;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`;

const PlayButton = styled.button`
  cursor: pointer;
  color: #ff6b9d;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  font-size: 10px;
  outline: none;
  background: transparent;
  border-radius: 50%;

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
  }

  &:hover {
    transform: scale(1.1);
    color: #8b5cf6;
    background: rgba(255, 107, 157, 0.1);
  }

  &:disabled {
    cursor: default;
    transform: none;
  }

  /* Enhanced mobile responsiveness */
  @media (max-width: 768px) {
    width: 26px;
    height: 26px;
    font-size: 11px;
    padding: 5px;
  }

  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
    font-size: 10px;
    padding: 4px;
  }

  @media (max-width: 360px) {
    width: 22px;
    height: 22px;
    font-size: 9px;
    padding: 3px;
  }
`;

// Removed AudioWaitingIndicator and ClickToPlayText - no longer needed

const Timestamp = styled.span`
  font-size: 0.85rem; /* Increased by additional 10% from 0.77rem for better readability */
  color: rgb(0, 0, 0);
  margin-top: 0.375rem;
  opacity: 0.7; /* Slightly transparent for better hierarchy */

  /* Desktop-specific font size decrease by 15% */
  @media (min-width: 1201px) {
    font-size: 0.72rem; /* Decreased by 15% from 0.85rem for desktop */
  }

  /* Enhanced mobile responsiveness with improved font scaling */
  @media (max-width: 1200px) {
    font-size: 0.83rem; /* Increased by additional 10% from 0.75rem */
    margin-top: 0.35rem;
  }

  @media (max-width: 1024px) {
    font-size: 0.8rem; /* Increased by additional 10% from 0.73rem */
    margin-top: 0.32rem;
  }

  @media (max-width: 900px) {
    font-size: 0.77rem; /* Increased by additional 10% from 0.7rem */
    margin-top: 0.3rem;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem; /* Increased by additional 10% from 0.68rem for better mobile readability */
    margin-top: 0.28rem;
  }

  @media (max-width: 640px) {
    font-size: 0.73rem; /* Increased by additional 10% from 0.66rem */
    margin-top: 0.25rem;
  }

  @media (max-width: 600px) {
    font-size: 0.7rem; /* Increased by additional 10% from 0.64rem */
    margin-top: 0.22rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem; /* Increased by additional 10% from 0.68rem for better mobile readability */
    margin-top: 0.2rem;
  }

  @media (max-width: 414px) {
    font-size: 0.73rem; /* Increased by additional 10% from 0.66rem for iPhone readability */
    margin-top: 0.18rem;
  }

  @media (max-width: 390px) {
    font-size: 0.7rem; /* Increased by additional 10% from 0.64rem for small phone optimization */
    margin-top: 0.16rem;
  }

  @media (max-width: 375px) {
    font-size: 0.68rem; /* Increased by additional 10% from 0.62rem for iPhone SE readability */
    margin-top: 0.15rem;
  }

  @media (max-width: 360px) {
    font-size: 0.65rem; /* Increased by additional 10% from 0.59rem for very small screens */
    margin-top: 0.14rem;
  }

  @media (max-width: 320px) {
    font-size: 0.63rem; /* Increased by additional 10% from 0.57rem for minimum readable size */
    margin-top: 0.12rem;
  }
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
  return (
    <MessageWrapper $isUser={isUser}>
      <div>
        <MessageBubble $isUser={isUser}>
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
                      e.target.style.textDecoration =
                        "underline";
                      e.target.style.color = "#0f62fe";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = "none";
                      e.target.style.color = "#1e90ff";
                    }}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    style={{ margin: "0", padding: "0" }}
                    {...props}
                  />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </MessageBubble>

        <MessageActions $isUser={isUser}>
          {!isUser && message.audio && (
            <PlayButton
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
          )}
          <Timestamp>
            {message.timestamp ? message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Timestamp>
        </MessageActions>
      </div>
    </MessageWrapper>
  );
};

export default MessageBubbleComponent;
