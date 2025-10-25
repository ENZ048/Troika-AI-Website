import SupaChatbot from "./components/SupaChatbot"
import ScheduleMeeting from "./components/ScheduleMeeting"
import React, { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import AuthModal from "./components/AuthModal"
import OtpModal from "./components/OtpModal"
import useAuthentication from "./hooks/useAuthentication"
import { ThemeProvider } from "./contexts/ThemeContext"

// Constants for chatbot configuration
const CHATBOT_ID = "68f1dfa097793a45f3951812"
// const API_BASE = "https://api.0804.in/api"
const API_BASE = "http://localhost:5000/api"

// Development mode - set to true to bypass authentication during development
const SKIP_AUTH_IN_DEV = true;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '2px solid red', margin: '20px', backgroundColor: 'lightcoral' }}>
          <h2>Error in SupaChatbot Component</h2>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <p><strong>Stack:</strong> {this.state.error?.stack}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Authentication wrapper component
function AuthenticationGate({ children }) {
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [intendedRoute, setIntendedRoute] = useState(null);

  const {
    isAuthenticated,
    userInfo,
    loading: authLoading,
    error: authError,
    resendCooldown,
    sendOtp,
    verifyOtp,
    resendOtp
  } = useAuthentication(API_BASE);

  // Persist phone from userInfo once authenticated
  useEffect(() => {
    if (isAuthenticated && userInfo && userInfo.phone) {
      try { localStorage.setItem('chatbot_user_phone', String(userInfo.phone)); } catch {}
    }
  }, [isAuthenticated, userInfo]);

  // Save the intended route when user is not authenticated
  useEffect(() => {
    if (!isAuthenticated && !intendedRoute) {
      setIntendedRoute(location.pathname);
      setShowAuthModal(true);
    }
  }, [isAuthenticated, location.pathname, intendedRoute]);

  // Handle OTP sending
  const handleSendOtp = async (phone) => {
    try {
      setPhoneNumber(phone);
      await sendOtp(phone);
      setShowAuthModal(false);
      setShowOtpModal(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (otp) => {
    try {
      await verifyOtp(otp, phoneNumber);
      setShowOtpModal(false);
      // Route preservation is handled by React Router automatically
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    try {
      await resendOtp(phoneNumber);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  // Skip authentication in development mode
  if (SKIP_AUTH_IN_DEV) {
    return children;
  }

  // Show auth modals if user is not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {showAuthModal && (
          <AuthModal
            onSendOtp={handleSendOtp}
            loading={authLoading}
            error={authError}
          />
        )}
        {showOtpModal && (
          <OtpModal
            onVerifyOtp={handleVerifyOtp}
            onResendOtp={handleResendOtp}
            loading={authLoading}
            error={authError}
            resendCooldown={resendCooldown}
          />
        )}
      </>
    );
  }

  // User is authenticated; render children
  return children;
}

function App() {
  console.log("App component is rendering!");

  return (
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AuthenticationGate>
            <Routes>
              <Route path="/" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/new-chat" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/home" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/who-is-troika" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/what-is-ai-agent" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/how-it-works" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/use-case-for-me" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/pricing-setup" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-websites" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-calling" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-whatsapp" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-telegram" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/industry-use-cases" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/social-media" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/pricing" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/sales" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/marketing" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/about" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/features" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/roi" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              {/* New sidebar routes */}
              <Route path="/ai-agent" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/ai-calling-agent" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/whatsapp-marketing" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/rcs-messaging" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/get-quote" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
              <Route path="/schedule-meeting" element={<ScheduleMeeting />} />
              <Route path="/book-call" element={<SupaChatbot chatbotId={CHATBOT_ID} apiBase={API_BASE} />} />
            </Routes>
          </AuthenticationGate>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App
