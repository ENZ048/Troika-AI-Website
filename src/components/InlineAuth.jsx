import React from "react";
import styled from "styled-components";
import { ClipLoader } from "react-spinners";
import { IoSend } from "react-icons/io5";

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  margin: 0.625rem 0;
  justify-content: flex-start;
  padding: 0 0 0 12px;
  overflow: visible;
`;

const MessageBubble = styled.div`
  padding: 0.79rem 1.05rem; /* Increased by 5% from 0.75rem 1rem for greeting message */
  border-radius: 18px;
  font-size: 1.33rem; /* Increased by additional 10% from 1.21rem for better readability */
  line-height: 1.5; /* Improved line height */

  /* Desktop-specific font size decrease by 15% */
  @media (min-width: 1201px) {
    font-size: 1.13rem; /* Decreased by 15% from 1.33rem for desktop */
  }
  word-wrap: break-word;
  max-width: 80%;
  position: relative;
  margin: 0.5rem 0;
  width: fit-content;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
  color: #000;
  align-self: flex-start;

  /* Enhanced mobile responsiveness for auth input with improved font scaling */
  @media (max-width: 1200px) {
    font-size: 1.19rem; /* Match bot message styling */
    line-height: 1.45;
    max-width: 79%;
  }

  @media (max-width: 1024px) {
    font-size: 1.16rem; /* Match bot message styling */
    line-height: 1.42;
    max-width: 80%;
  }

  @media (max-width: 900px) {
    font-size: 1.14rem; /* Match bot message styling */
    line-height: 1.4;
    max-width: 81%;
  }

  @media (max-width: 768px) {
    font-size: 1.12rem; /* Match bot message styling */
    line-height: 1.38;
    max-width: 82%;
  }

  @media (max-width: 640px) {
    font-size: 1.08rem; /* Match bot message styling */
    line-height: 1.36;
    max-width: 83%;
  }

  @media (max-width: 600px) {
    font-size: 1.06rem; /* Match bot message styling */
    line-height: 1.34;
    max-width: 84%;
  }

  @media (max-width: 480px) {
    font-size: 1.04rem; /* Match bot message styling */
    line-height: 1.32;
    max-width: 85%;
  }

  @media (max-width: 414px) {
    font-size: 1.02rem; /* Match bot message styling */
    line-height: 1.3;
    max-width: 86%;
  }

  @media (max-width: 390px) {
    font-size: 1rem; /* Match bot message styling */
    line-height: 1.28;
    max-width: 87%;
  }

  @media (max-width: 375px) {
    font-size: 0.98rem; /* Match bot message styling */
    line-height: 1.26;
    max-width: 88%;
  }

  @media (max-width: 360px) {
    font-size: 0.96rem; /* Match bot message styling */
    line-height: 1.24;
    max-width: 89%;
  }

  @media (max-width: 320px) {
    font-size: 0.94rem; /* Match bot message styling */
    line-height: 1.22;
    max-width: 90%;
  }
`;

const InlineAuth = ({
  showInlineAuthInput,
  authMethod,
  email,
  setEmail,
  phone,
  setPhone,
  isPhoneValid,
  setIsPhoneValid,
  handleSendOtp,
  loadingOtp,
  resendTimeout
}) => {
  if (!showInlineAuthInput) return null;

  return (
    <MessageWrapper $isUser={false}>
      <div>
        <MessageBubble $isUser={false}>
          <div style={{ marginBottom: "12px" }}>
            Share your WhatsApp number so we can keep the conversation going if we get disconnected.
          </div>

          {authMethod === "email" ? (
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value.trim())
                }
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  fontSize: "16px", /* Increased for better mobile readability */
                  outline: "none",
                  background: "white",
                  color: "#000",
                  lineHeight: "1.4", /* Added line height for better readability */
                }}
                className="auth-input"
              />
              <button
                onClick={handleSendOtp}
                disabled={
                  loadingOtp || !email || resendTimeout > 0
                }
                style={{
                  padding: "10px 16px",
                  background:
                    loadingOtp || !email || resendTimeout > 0
                      ? "#ccc"
                      : "linear-gradient(135deg, #8a2be2, #14b8a6)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px", /* Increased for better mobile readability */
                  fontWeight: "600",
                  cursor:
                    loadingOtp || !email || resendTimeout > 0
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {loadingOtp ? (
                  <>
                    <ClipLoader size={12} color="#fff" />
                    Sending...
                  </>
                ) : resendTimeout > 0 ? (
                  `Resend in ${resendTimeout}s`
                ) : (
                  <IoSend size={16} />
                )}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flex: "1",
                  minWidth: "0",
                }}
              >
                <span
                  style={{ 
                    fontSize: "16px", /* Increased for better mobile readability */
                    color: "#666",
                    flexShrink: "0",
                  }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Enter WhatsApp number"
                  value={phone}
                  onChange={(e) => {
                    const inputPhone = e.target.value.replace(
                      /\D/g,
                      ""
                    );
                    setPhone(inputPhone);
                    setIsPhoneValid(
                      /^[6-9]\d{9}$/.test(inputPhone)
                    );
                  }}
                  style={{
                    flex: "1",
                    minWidth: "120px",
                    padding: "10px 12px",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    fontSize: "16px", /* Increased for better mobile readability */
                    outline: "none",
                    background: "white",
                    color: "#000",
                    lineHeight: "1.4", /* Added line height for better readability */
                  }}
                  className="auth-input"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={
                  loadingOtp ||
                  !isPhoneValid ||
                  resendTimeout > 0
                }
                style={{
                  padding: "10px 12px",
                  background:
                    loadingOtp ||
                    !isPhoneValid ||
                    resendTimeout > 0
                      ? "#ccc"
                      : "linear-gradient(135deg, #8a2be2, #14b8a6)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px", /* Increased for better mobile readability */
                  fontWeight: "600",
                  cursor:
                    loadingOtp ||
                    !isPhoneValid ||
                    resendTimeout > 0
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: "0",
                  whiteSpace: "nowrap",
                }}
              >
                {loadingOtp ? (
                  <>
                    <ClipLoader size={12} color="#fff" />
                  </>
                ) : resendTimeout > 0 ? (
                  `Resend in ${resendTimeout}s`
                ) : (
                  <IoSend size={16} />
                )}
              </button>
            </div>
          )}
        </MessageBubble>
      </div>
    </MessageWrapper>
  );
};

export default InlineAuth;
