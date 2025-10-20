import SupaChatbot from "./components/SupaChatbot"
import ScheduleMeeting from "./components/ScheduleMeeting"
import BookCall from "./components/BookCall"
import React, { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import AuthModal from "./components/AuthModal"
import OtpModal from "./components/OtpModal"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"

// Constants for chatbot configuration
const CHATBOT_ID = "68f1dfa097793a45f3951812"
const API_BASE = "https://api.0804.in/api"
// const API_BASE = "http://localhost:5000/api"

// Development mode - set to true to bypass authentication during development
const SKIP_AUTH_IN_DEV = false;

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
    loading: authLoading,
    error: authError,
    resendCooldown,
    isInitialized,
    sendOtp,
    verifyOtp,
    resendOtp
  } = useAuth();

  // Show auth modal when not authenticated (after initialization is complete)
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !intendedRoute) {
      console.log('🔓 [AUTH GATE] User not authenticated - Showing auth modal');
      setIntendedRoute(location.pathname);
      setShowAuthModal(true);
    }
  }, [isInitialized, isAuthenticated, location.pathname, intendedRoute]);

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

  // Show loading state while checking authentication
  if (!isInitialized || authLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        zIndex: 9999
      }}>
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid rgba(255, 255, 255, 0.2)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <p style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>Verifying authentication...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
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

  // User is authenticated, render the children
  return children;
}

function App() {
  console.log("App component is rendering!");

  return (
    <ThemeProvider>
      <AuthProvider apiBase={API_BASE}>
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
                <Route path="/book-call" element={<BookCall />} />
              </Routes>
            </AuthenticationGate>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
