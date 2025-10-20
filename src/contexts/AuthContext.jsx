import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AUTH_STORAGE_KEY = 'chatbot_auth';
const PHONE_STORAGE_KEY = 'chatbot_user_phone';

export const AuthProvider = ({ children, apiBase }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true to check existing auth
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    console.log('🔍 [AUTH CONTEXT] Initializing authentication check...');
    checkExistingAuth();
  }, []);

  const checkExistingAuth = useCallback(async () => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!savedAuth) {
        console.log('ℹ️ [AUTH CONTEXT] No saved authentication found');
        setIsAuthenticated(false);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      const authData = JSON.parse(savedAuth);
      const now = Date.now();

      // Check if authentication exists and hasn't expired (client-side check)
      if (authData.token && authData.issuedAt && authData.expiresAt) {
        const isExpired = now >= authData.expiresAt;
        const sessionAge = now - authData.issuedAt;
        const hoursOld = Math.floor(sessionAge / (60 * 60 * 1000));

        console.log('📊 [AUTH CONTEXT] Session age:', hoursOld, 'hours');
        console.log('⏰ [AUTH CONTEXT] Expires at:', new Date(authData.expiresAt).toLocaleString());
        console.log('🕐 [AUTH CONTEXT] Current time:', new Date(now).toLocaleString());

        if (isExpired) {
          console.log('⏰ [AUTH CONTEXT] Token expired (>24 hours) - Clearing authentication');
          clearAuthData();
          setLoading(false);
          setIsInitialized(true);
          return;
        }

        // Validate token with backend
        console.log('🔐 [AUTH CONTEXT] Validating token with backend...');
        try {
          const response = await fetch(`${apiBase}/auth/validate-token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authData.token}`,
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid) {
              console.log('✅ [AUTH CONTEXT] Token validated by backend - Auto-authenticating');
              console.log('👤 [AUTH CONTEXT] User info:', authData.userInfo);

              setAuthToken(authData.token);
              setUserInfo(authData.userInfo);
              setIsAuthenticated(true);
            } else {
              console.log('❌ [AUTH CONTEXT] Backend rejected token - Clearing');
              clearAuthData();
            }
          } else {
            console.log('❌ [AUTH CONTEXT] Token validation failed - Clearing');
            clearAuthData();
          }
        } catch (validationError) {
          console.error('❌ [AUTH CONTEXT] Backend validation error:', validationError);
          // If backend is unreachable but token not expired, trust local token
          console.log('⚠️ [AUTH CONTEXT] Backend unreachable, using local token');
          setAuthToken(authData.token);
          setUserInfo(authData.userInfo);
          setIsAuthenticated(true);
        }
      } else {
        console.log('⚠️ [AUTH CONTEXT] Invalid auth data structure - Clearing');
        clearAuthData();
      }
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Error checking existing auth:', error);
      clearAuthData();
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [apiBase]);

  // Clear authentication data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(PHONE_STORAGE_KEY);
    setAuthToken(null);
    setUserInfo(null);
    setIsAuthenticated(false);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Send OTP
  const sendOtp = useCallback(async (phone) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = `${apiBase}/whatsapp-otp/send`;
      const requestBody = {
        phone,
        chatbotId: '68ea0b4d28fb01da88e59697',
        campaignName: 'Signup OTP Campaign',
        templateName: 'otp_message'
      };

      console.log('📤 [AUTH CONTEXT] Sending OTP to:', phone);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      const data = await response.json();
      console.log('✅ [AUTH CONTEXT] OTP sent successfully');

      // Start resend cooldown
      setResendCooldown(60);

      return data;
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Error sending OTP:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  // Verify OTP
  const verifyOtp = useCallback(async (otp, phone) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = `${apiBase}/whatsapp-otp/verify`;
      const requestBody = {
        phone,
        otp,
        chatbotId: '68ea0b4d28fb01da88e59697',
        campaignName: 'Signup OTP Campaign',
        templateName: 'otp_message'
      };

      console.log('🔐 [AUTH CONTEXT] Verifying OTP for:', phone);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid OTP');
      }

      const data = await response.json();
      console.log('✅ [AUTH CONTEXT] OTP verification successful');
      console.log('🔑 [AUTH CONTEXT] Backend response:', {
        hasToken: !!data.token,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt,
        expiresIn: data.expiresIn
      });

      // Save phone number
      if (phone) {
        localStorage.setItem(PHONE_STORAGE_KEY, phone);
      }

      // Save authentication data with backend-provided timestamps
      const authData = {
        token: data.token,
        userInfo: data.userInfo || { phone },
        issuedAt: data.issuedAt,      // Backend timestamp in milliseconds
        expiresAt: data.expiresAt      // Backend timestamp in milliseconds
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      console.log('💾 [AUTH CONTEXT] Auth data saved - Session valid for 24 hours');
      console.log('📅 [AUTH CONTEXT] Issued at:', new Date(data.issuedAt).toLocaleString());
      console.log('📅 [AUTH CONTEXT] Expires at:', new Date(data.expiresAt).toLocaleString());

      setAuthToken(data.token);
      setUserInfo(data.userInfo || { phone });
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Error verifying OTP:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  // Logout
  const logout = useCallback(async () => {
    console.log('🚪 [AUTH CONTEXT] Logging out user');

    // Call backend logout endpoint if token exists
    if (authToken) {
      try {
        console.log('📤 [AUTH CONTEXT] Calling backend logout endpoint');
        const response = await fetch(`${apiBase}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          console.log('✅ [AUTH CONTEXT] Backend logout successful');
        } else {
          console.warn('⚠️ [AUTH CONTEXT] Backend logout failed, clearing local data anyway');
        }
      } catch (error) {
        console.error('❌ [AUTH CONTEXT] Logout error:', error);
        // Continue with local logout even if backend call fails
      }
    }

    clearAuthData();
    setError(null);
  }, [authToken, apiBase, clearAuthData]);

  // Resend OTP
  const resendOtp = useCallback(async (phone) => {
    if (resendCooldown > 0) {
      console.log('⏳ [AUTH CONTEXT] Resend cooldown active:', resendCooldown, 'seconds');
      return;
    }

    try {
      await sendOtp(phone);
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Error resending OTP:', error);
    }
  }, [sendOtp, resendCooldown]);

  // Check session validity periodically (every minute)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionValidity = () => {
      try {
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!savedAuth) {
          console.log('⚠️ [AUTH CONTEXT] Auth data missing - Logging out');
          logout();
          return;
        }

        const authData = JSON.parse(savedAuth);
        const now = Date.now();

        if (now >= authData.expiresAt) {
          console.log('⏰ [AUTH CONTEXT] Session expired - Logging out');
          logout();
        }
      } catch (error) {
        console.error('❌ [AUTH CONTEXT] Error checking session validity:', error);
        logout();
      }
    };

    // Check immediately
    checkSessionValidity();

    // Then check every minute
    const interval = setInterval(checkSessionValidity, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  // Listen for 401 logout events from API client
  useEffect(() => {
    const handleLogoutEvent = (event) => {
      console.log('🔔 [AUTH CONTEXT] Received logout event:', event.detail);
      clearAuthData();
      setError(null);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [clearAuthData]);

  const value = {
    isAuthenticated,
    authToken,
    userInfo,
    loading,
    error,
    resendCooldown,
    isInitialized,
    sendOtp,
    verifyOtp,
    logout,
    resendOtp,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
