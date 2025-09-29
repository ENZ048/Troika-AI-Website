import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

// Import components
import DeviceFrameComponent from "./DeviceFrame";
import ChatHeader from "./ChatHeader";
import MessageBubbleComponent from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import VoiceInputIndicatorComponent from "./VoiceInputIndicator";
// import InlineAuth from "./InlineAuth";
// import OtpVerification from "./OtpVerification";
import InputArea from "./InputArea";
// Removed SuggestionButtons import - no longer needed

// Import styles
import { Wrapper, Overlay, Chatbox, ChatContainer, MessagesContainer } from "../styles/MainStyles";
import GlobalStyle from "../styles/GlobalStyles";

// Import hooks
import { useBattery } from "../hooks/useBattery";
import { useClock } from "../hooks/useClock";
import { useAudio } from "../hooks/useAudio";
import { useVoiceRecording } from "../hooks/useVoiceRecording";

// Import utils
import { getTimeBasedGreeting } from "../utils/timeUtils";
import { isMobileDevice, getDeviceInfo, hapticFeedback, debounce } from "../utils/mobileUtils";

const SupaChatbot = ({ chatbotId, apiBase }) => {
  // State management
  const [showChat, setShowChat] = useState(true);
  const [phone, setPhone] = useState("9999999999");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(true);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [animatedMessageIdx, setAnimatedMessageIdx] = useState(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [resendIntervalId, setResendIntervalId] = useState(null);
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authMethod, setAuthMethod] = useState("whatsapp");
  const [email, setEmail] = useState("");
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [requireAuthText, setRequireAuthText] = useState(
    "Verify yourself to continue chat"
  );
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showInlineAuth, setShowInlineAuth] = useState(false);
  const [showInlineAuthInput, setShowInlineAuthInput] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [chatbotLogo, setChatbotLogo] = useState(
    "https://raw.githubusercontent.com/troika-tech/Asset/refs/heads/main/Supa%20Agent%20new.png"
  );
  const [finalGreetingReady, setFinalGreetingReady] = useState(false);
  const [ttsGenerationInProgress, setTtsGenerationInProgress] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(getTimeBasedGreeting());
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  // Removed showSuggestions state - no longer needed
  // Removed "I'm interested" functionality
  // const [hasShownInterestResponse, setHasShownInterestResponse] = useState(false);
  // const [prefetchedThankYouTTS, setPrefetchedThankYouTTS] = useState(null);
  // const [isPrefetchingTTS, setIsPrefetchingTTS] = useState(false);
  // Removed greetingAudioReady state - no longer needed without autoplay

  // Refs
  const ttsGenerationTimeout = useRef(null);
  const lastGeneratedGreeting = useRef(null);
  const overlayRef = useRef(null);
  const chatboxRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasMounted = useRef(false);
  const greetingAutoPlayed = useRef(false);
  const pendingGreetingAudio = useRef(null);
  const languageMessageShown = useRef(false);

  // Custom hooks
  const { batteryLevel, isCharging } = useBattery();
  const currentTime = useClock();
  const { playAudio, stopAudio, currentlyPlaying, audioObject, toggleMuteForCurrentAudio, muteCurrentAudio, ensureAudioMuted } = useAudio(isMuted, hasUserInteracted);
  const { isRecording, startRecording, stopRecording } = useVoiceRecording(apiBase);

  // Constants
  const AUTH_GATE_KEY = (sid, bot) => `supa_auth_gate:${bot}:${sid}`;
  const SESSION_STORE_KEY = (method) =>
    method === "email" ? "chatbot_user_email" : "chatbot_user_phone";
  const USER_MESSAGE_COUNT_KEY = (sid, bot) => `supa_user_message_count:${bot}:${sid}`;

  // Function to check if user has sent 2 messages and needs auth
  const checkUserMessageCount = useCallback(() => {
    return userMessageCount >= 2;
  }, [userMessageCount]);

  // Function to load user message count from localStorage
  const loadUserMessageCount = useCallback(() => {
    if (!sessionId || !chatbotId) {
      return 0;
    }
    
    try {
      const key = USER_MESSAGE_COUNT_KEY(sessionId, chatbotId);
      const stored = localStorage.getItem(key);
      const count = stored ? parseInt(stored, 10) : 0;
      return count;
    } catch (error) {
      console.error("Error loading user message count:", error);
      return 0;
    }
  }, [sessionId, chatbotId]);

  // Function to increment user message count
  const incrementUserMessageCount = useCallback(() => {
    console.log('incrementUserMessageCount called, current count:', userMessageCount);
    setUserMessageCount(prev => {
      const newCount = prev + 1;
      console.log('Incrementing message count from', prev, 'to', newCount);
      // Persist to localStorage
      if (sessionId && chatbotId) {
        try {
          const key = `supa_user_message_count:${chatbotId}:${sessionId}`;
          localStorage.setItem(key, newCount.toString());
          console.log('Saved message count to localStorage:', newCount);
        } catch (error) {
          console.error("Error saving user message count:", error);
        }
      } else {
        console.log('No sessionId or chatbotId, not saving to localStorage');
      }
      return newCount;
    });
  }, [sessionId, chatbotId, userMessageCount]);

  // Function to generate TTS for greeting message
  const generateGreetingTTS = useCallback(
    async (greetingText, retryCount = 0) => {
      if (!apiBase || ttsGenerationInProgress) return null;

      setTtsGenerationInProgress(true);

      try {
        const response = await axios.post(`${apiBase}/text-to-speech`, {
          text: greetingText,
        });

        if (response.data.audio) {
          const base64Data = response.data.audio.replace(
            "data:audio/mpeg;base64,",
            ""
          );
          const byteArray = Array.from(atob(base64Data), (c) =>
            c.charCodeAt(0)
          );

          return {
            data: byteArray,
            contentType: "audio/mpeg",
          };
        } else {
        }
      } catch (error) {
        console.error("Failed to generate greeting TTS:", error);

        if (retryCount < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1))
          );
          return generateGreetingTTS(greetingText, retryCount + 1);
        }
      } finally {
        setTtsGenerationInProgress(false);
      }
      return null;
    },
    [apiBase, ttsGenerationInProgress]
  );

  // Removed prefetchThankYouTTS function - no longer needed

  // Function to ensure greeting TTS is generated and updated in chat history
  const ensureGreetingTTS = useCallback(
    async (greetingText, forceUpdate = false) => {
      if (!apiBase || !greetingText) return;

      if (!forceUpdate && lastGeneratedGreeting.current === greetingText) {
        return;
      }

      if (ttsGenerationTimeout.current) {
        clearTimeout(ttsGenerationTimeout.current);
      }

      ttsGenerationTimeout.current = setTimeout(async () => {
        const greetingAudio = await generateGreetingTTS(greetingText);
        if (greetingAudio) {
          lastGeneratedGreeting.current = greetingText;

          setChatHistory((prev) => {
            if (prev.length === 0) {
              return [
                {
                  sender: "bot",
                  text: greetingText,
                  audio: greetingAudio,
                  timestamp: new Date(),
                },
              ];
            } else {
              return prev.map((msg, index) => {
                if (index === 0 && msg.sender === "bot") {
                  return { ...msg, text: greetingText, audio: greetingAudio, timestamp: new Date() };
                }
                return msg;
              });
            }
          });

          // Store the greeting audio for manual playback only
          if (showChat && !greetingAutoPlayed.current) {
            pendingGreetingAudio.current = greetingAudio;
            // No autoplay - user must click play button
          }
        }
      }, 500);
    },
    [apiBase, generateGreetingTTS, showChat]
  );

  // Handle user interaction (simplified - no audio enable needed)
  const handleUserInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
  }, [hasUserInteracted]);

  // Load chatbot configuration
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(
          `${apiBase}/chatbot/${chatbotId}/config`
        );
        if (cancelled) return;
        
        const cfg = data || {};
        const newAuthMethod = cfg.auth_method || "whatsapp";
        setAuthMethod(newAuthMethod);
        setRequireAuthText(
          cfg.require_auth_text || "Verify yourself to continue chat"
        );

        if (cfg.require_auth_from_start) {
          setNeedsAuth(true);
          setShowInlineAuth(true);
          setShowAuthScreen(false);
        }

        if (cfg.immediate_auth_required || cfg.require_auth) {
          setNeedsAuth(true);
          setShowInlineAuth(true);
          setShowAuthScreen(false);
        }

        // Check for existing session
        const storeKey = SESSION_STORE_KEY(newAuthMethod);
        const saved = localStorage.getItem(storeKey);
        if (saved) {
          try {
            const qs =
              newAuthMethod === "email"
                ? `email=${encodeURIComponent(saved)}`
                : `phone=${encodeURIComponent(saved)}`;

            const url =
              newAuthMethod === "email"
                ? `${apiBase}/otp/check-session?${qs}&chatbotId=${chatbotId}`
                : `${apiBase}/whatsapp-otp/check-session?${qs}&chatbotId=${chatbotId}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Session validation failed");
            const json = await res.json();

            if (json.valid) {
              if (newAuthMethod === "email") setEmail(saved);
              else setPhone(saved);
              setVerified(true);
              setNeedsAuth(false);
              setShowAuthScreen(false);
              setShowInlineAuth(false);
              // Don't reset userMessageCount here - let it be handled by the auth flow
              // Removed setHasShownInterestResponse - no longer needed
              
              // Only set chat history if it's empty (to avoid overriding existing greeting)
              setChatHistory(prev => {
                if (prev.length === 0) {
                  return [
                    {
                      sender: "bot",
                      text: welcomeMessage,
                      timestamp: new Date(),
                    },
                  ];
                }
                return prev;
              });
              setFinalGreetingReady(true);
              
              // Generate TTS for the welcome message
              if (apiBase) {
                ensureGreetingTTS(welcomeMessage);
              }
            } else {
              localStorage.removeItem(storeKey);
              toast.info("Your session has expired. Please sign in again.");
              setVerified(false);
              setNeedsAuth(true);
              setShowInlineAuth(true);
            }
          } catch (err) {
            localStorage.removeItem(storeKey);
            toast.error(
              "Unable to restore your session. Please sign in again."
            );
            setVerified(false);
            setNeedsAuth(true);
            setShowInlineAuth(true);
          }
        } else {
          // No saved session, check if user needs auth based on message count
          // This will be handled by the useEffect that loads user message count
        }
      } catch {
        setAuthMethod("whatsapp");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, chatbotId]);

  // Generate TTS for initial greeting message
  useEffect(() => {
    const generateInitialGreetingTTS = async () => {
      if (
        chatbotId &&
        apiBase &&
        chatHistory.length === 1 &&
        chatHistory[0].sender === "bot" &&
        !chatHistory[0].audio
      ) {
        const greetingText = chatHistory[0].text;
        setTimeout(() => {
          ensureGreetingTTS(greetingText);
        }, 200);
      }
    };

    generateInitialGreetingTTS();
  }, [chatbotId, apiBase, ensureGreetingTTS]);

  // Removed prefetch Thank you TTS useEffect - no longer needed

  // Initialize session
  useEffect(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("sessionId", id);
    }
    setSessionId(id);
  }, []);

  // Load user message count when sessionId and chatbotId are available
  useEffect(() => {
    if (sessionId && chatbotId) {
      const key = `supa_user_message_count:${chatbotId}:${sessionId}`;
      const stored = localStorage.getItem(key);
      const savedCount = stored ? parseInt(stored, 10) : 0;
      setUserMessageCount(savedCount);
      
      // Only trigger auth if user has sent 2+ messages and is not verified
      // This will be handled by the other useEffect that watches userMessageCount and verified
    }
  }, [sessionId, chatbotId]);

  // Check if user needs auth based on message count when component mounts or verified state changes
  useEffect(() => {
    console.log('Auth trigger check:', {
      userMessageCount,
      verified,
      needsAuth,
      showInlineAuth
    });
    
    if (userMessageCount >= 2 && !verified) {
      console.log('Triggering auth - user has sent 2+ messages and not verified');
      setNeedsAuth(true);
      setShowInlineAuth(true);
    } else if (verified) {
      console.log('User verified - disabling auth');
      setNeedsAuth(false);
      setShowInlineAuth(false);
    }
  }, [userMessageCount, verified]);

  // Set initial greeting
  useEffect(() => {
    if (!finalGreetingReady && chatbotId) {
      setChatHistory([
        {
          sender: "bot",
          text: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
      setFinalGreetingReady(true);
      
      // Generate TTS for the welcome message
      if (apiBase) {
        ensureGreetingTTS(welcomeMessage);
      }
    }
  }, [chatbotId, finalGreetingReady, welcomeMessage, apiBase, ensureGreetingTTS]);

  // Ensure greeting shows even when auth is required from start
  useEffect(() => {
    if (showChat && chatHistory.length === 0 && chatbotId && !finalGreetingReady) {
      setChatHistory([
        {
          sender: "bot",
          text: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
      setFinalGreetingReady(true);
      
      // Generate TTS for the welcome message
      if (apiBase) {
        ensureGreetingTTS(welcomeMessage);
      }
    }
  }, [showChat, chatbotId, finalGreetingReady, welcomeMessage, apiBase, ensureGreetingTTS]);

  // Update welcome message periodically
  useEffect(() => {
    const updateWelcomeMessage = () => {
      setWelcomeMessage(getTimeBasedGreeting());
    };

    updateWelcomeMessage();
    const interval = setInterval(updateWelcomeMessage, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);




  // Debug effect to track authentication state (removed to prevent infinite loop)
  // useEffect(() => {
  //   console.log("Auth state changed:", {
  //     verified,
  //     needsAuth,
  //     showInlineAuth,
  //     showInlineAuthInput,
  //     userMessageCount
  //   });
  // }, [verified, needsAuth, showInlineAuth, showInlineAuthInput, userMessageCount]);

  // Note: Removed autoplay functionality - greeting TTS now only plays on manual user interaction

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (chatHistory.length > 0 || isTyping) {
      const timeoutId = setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isTyping]);


  // Handle inline auth input display - commented out for default auth state
  /* useEffect(() => {
    console.log('Auth display check:', {
      showInlineAuth,
      verified,
      isTyping,
      otpSent,
      userMessageCount,
      animatedMessageIdx,
      chatHistoryLength: chatHistory.length
    });
    
    if (
      showInlineAuth &&
      !verified &&
      !isTyping &&
      !otpSent
    ) {
      // Show auth input immediately if user has sent 2+ messages (page refresh scenario)
      if (userMessageCount >= 2) {
        console.log('Showing auth input immediately - user has sent 2+ messages');
        setShowInlineAuthInput(true);
      } else {
        // For new messages, show auth input after a short delay regardless of animation
        console.log('Showing auth input after short delay');
        const delayTimer = setTimeout(() => {
          setShowInlineAuthInput(true);
        }, 1000); // Reduced from 2000ms to 1000ms
        return () => clearTimeout(delayTimer);
      }
    } else {
      console.log('Not showing auth input - conditions not met');
      setShowInlineAuthInput(false);
    }
  }, [
    showInlineAuth,
    verified,
    isTyping,
    otpSent,
    userMessageCount,
  ]); */

  // Handle OTP input display after animation completes - commented out for default auth state
  /* useEffect(() => {
    if (
      otpSent &&
      !verified &&
      !isTyping &&
      animatedMessageIdx === chatHistory.length - 1
    ) {
      setShowOtpInput(true);
    } else {
      setShowOtpInput(false);
    }
  }, [otpSent, verified, isTyping, animatedMessageIdx]); */

  // Check auth gate - commented out for default auth state
  /* useEffect(() => {
    if (!sessionId || verified || !authMethod) return;
    try {
      const shouldGate =
        localStorage.getItem(AUTH_GATE_KEY(sessionId, chatbotId)) === "1";
      if (shouldGate) {
        setNeedsAuth(true);
        setShowInlineAuth(true);
      }
    } catch {}
  }, [sessionId, verified, chatbotId, authMethod]); */

  // Handle resend timeout
  useEffect(() => {
    const saved = localStorage.getItem("resend_otp_start");
    if (saved) {
      const elapsed = Math.floor((Date.now() - parseInt(saved, 10)) / 1000);
      const remaining = 60 - elapsed;
      if (remaining > 0) {
        setResendTimeout(remaining);
        let countdown = remaining;
        const timer = setInterval(() => {
          countdown--;
          setResendTimeout(countdown);
          if (countdown <= 0) {
            clearInterval(timer);
            localStorage.removeItem("resend_otp_start");
          }
        }, 1000);
        setResendIntervalId(timer);
      }
    }
    return () => {
      if (resendIntervalId) clearInterval(resendIntervalId);
    };
  }, []);

  // Reset OTP when phone changes
  useEffect(() => {
    setOtpSent(false);
    setOtp("");
    setResendTimeout(0);
    localStorage.removeItem("resend_otp_start");
  }, [phone]);

  // Check mobile - Enhanced detection using utility
  useEffect(() => {
    const checkMobile = () => {
      const deviceInfo = getDeviceInfo();
      setIsMobile(deviceInfo.isMobile);
      
      // Log for debugging
    };

    checkMobile();
    
    // Add resize listener with debouncing for better performance
    const debouncedCheckMobile = debounce(checkMobile, 100);
    
    window.addEventListener("resize", debouncedCheckMobile);
    window.addEventListener("orientationchange", checkMobile); // Handle orientation changes
    
    return () => {
      window.removeEventListener("resize", debouncedCheckMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  // Add user interaction listeners - Enhanced for mobile
  useEffect(() => {
    const handleInteraction = () => {
      handleUserInteraction();
    };

    // Add multiple event listeners to catch different types of user interaction
    // Enhanced for better mobile touch support
    const events = [
      'click', 
      'touchstart', 
      'touchend', 
      'keydown', 
      'mousedown',
      'touchmove', // Add touchmove for better mobile detection
      'gesturestart', // iOS gesture support
      'gesturechange'
    ];
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { 
        once: true,
        passive: true, // Better performance on mobile
        capture: false
      });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [handleUserInteraction]);

  // Reset component when chatbot changes
  useEffect(() => {
    // Only reset if this is not the initial load
    if (hasMounted.current) {
      setVerified(false);
      setNeedsAuth(false);
      setShowAuthScreen(false);
      setOtpSent(false);
      setOtp("");
      setResendTimeout(0);
      setUserMessageCount(0);
      setShowInlineAuth(false);
      setShowInlineAuthInput(false);
      setShowOtpInput(false);
      lastGeneratedGreeting.current = null;
      localStorage.removeItem("resend_otp_start");
      greetingAutoPlayed.current = false;
      setChatHistory([]);
      setFinalGreetingReady(false);
      // Removed setHasShownInterestResponse - no longer needed
      languageMessageShown.current = false;
      
      // Clear user message count from localStorage
      if (sessionId) {
        try {
          const key = `supa_user_message_count:${chatbotId}:${sessionId}`;
          localStorage.removeItem(key);
        } catch (error) {
          console.error("Error clearing user message count:", error);
        }
      }
    } else {
      hasMounted.current = true;
    }

    if (sessionId) {
      try {
        const shouldGate =
          localStorage.getItem(AUTH_GATE_KEY(sessionId, chatbotId)) === "1";
        if (shouldGate) {
          setNeedsAuth(true);
          setShowInlineAuth(true);
        }
      } catch {}
    }
  }, [chatbotId, sessionId, apiBase]);

  // OTP handling functions - commented out for default auth state
  /* const handleSendOtp = async () => {
    if (resendTimeout > 0 || !authMethod) return;
    try {
      setLoadingOtp(true);

      if (authMethod === "email") {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        if (!ok) return toast.error("Enter a valid email address");
        await axios.post(`${apiBase}/otp/request-otp`, { email, chatbotId });
        toast.success("OTP sent to your email!");
      } else {
        const ok = /^[6-9]\d{9}$/.test(phone);
        if (!ok) return toast.error("Enter a valid 10-digit WhatsApp number");
        await axios.post(`${apiBase}/whatsapp-otp/send`, { phone, chatbotId });
        toast.success("OTP sent to your WhatsApp number!");
      }

      setOtpSent(true);

      const now = Date.now();
      localStorage.setItem("resend_otp_start", now.toString());
      setResendTimeout(60);
      let countdown = 60;
      const timer = setInterval(() => {
        countdown--;
        setResendTimeout(countdown);
        if (countdown <= 0) {
          clearInterval(timer);
          localStorage.removeItem("resend_otp_start");
        }
      }, 1000);
      setResendIntervalId(timer);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoadingOtp(false);
    }
  }; */

  /* const handleVerifyOtp = async () => {
    try {
      if (otp.length !== 6)
        return toast.error("Please enter the complete 6-digit code");
      setLoadingVerify(true);

      let res;
      if (authMethod === "email") {
        res = await axios.post(`${apiBase}/otp/verify-otp`, {
          email,
          otp,
          chatbotId,
        });
      } else {
        res = await axios.post(`${apiBase}/whatsapp-otp/verify`, {
          phone,
          otp,
          chatbotId,
        });
      }

      if (res.data.success) {
        localStorage.setItem(
          SESSION_STORE_KEY(authMethod),
          authMethod === "email" ? email : phone
        );
        setVerified(true);
        setNeedsAuth(false);
        setShowAuthScreen(false);
        setShowInlineAuth(false);
        setShowInlineAuthInput(false);
        setShowOtpInput(false);

        try {
          const sid = sessionId || localStorage.getItem("sessionId");
          if (sid) {
            localStorage.removeItem(AUTH_GATE_KEY(sid, chatbotId));
            const key = `supa_user_message_count:${chatbotId}:${sid}`;
            localStorage.removeItem(key);
            setUserMessageCount(0);
          }
        } catch {}

        toast.success(
          "✅ Verified successfully! You can now continue chatting."
        );
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch {
      toast.error("An error occurred during verification.");
    } finally {
      setLoadingVerify(false);
    }
  }; */

  const toggleMute = () => {
    const newMutedState = !isMuted;
    console.log(`toggleMute called: current state=${isMuted}, new state=${newMutedState}, currentlyPlaying=${currentlyPlaying}`);
    
    // Update the state first
    setIsMuted(newMutedState);
    
    // Then apply the mute state to currently playing audio
    if (currentlyPlaying !== null) {
      console.log(`Applying mute state ${newMutedState} to currently playing audio`);
      muteCurrentAudio(newMutedState);
    } else {
      console.log(`No audio currently playing, mute state set to ${newMutedState}`);
    }
  };

  // Removed handleSuggestionClick function - no longer needed


  const handleSendMessage = useCallback(
    async (inputText) => {
      console.log('handleSendMessage called with:', { inputText, message, sessionId, verified, needsAuth });
      
      // Removed auth check for default auth state
      // if (needsAuth && !verified) {
      //   return;
      // }

      if (!sessionId) {
        console.log('No sessionId, returning early');
        return;
      }

      const textToSend = inputText || message;
      if (!textToSend.trim()) return;

      // Properly stop any currently playing audio
      stopAudio();
      
      // Small delay to ensure audio is fully stopped
      await new Promise(resolve => setTimeout(resolve, 50));
      const userMessage = { sender: "user", text: textToSend, timestamp: new Date() };
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);

      // Increment user message count
      console.log('Incrementing user message count, current count:', userMessageCount);
      incrementUserMessageCount();

      try {
        // Regular message handling - removed "I'm interested" special handling
        const requestData = {
          chatbotId,
          query: textToSend,
          sessionId,
          phone: phone, // Always send phone for default auth state
        };
        console.log('Sending request to backend:', requestData);
        const response = await axios.post(`${apiBase}/chat/query`, requestData);

        const { answer, audio, requiresAuthNext, auth_method } = response.data;

        const botMessage = {
          sender: "bot",
          text: answer || "Sorry, I couldn't get that.",
          audio,
          timestamp: new Date(),
        };
        
        setChatHistory((prev) => {
          const nh = [...prev, botMessage];
          const botMessageIndex = nh.length - 1;
          
          // Auto-play audio after state update with correct index
          if (audio) {
            playAudio(audio, botMessageIndex);
            // Ensure mute state is applied immediately
            setTimeout(() => {
              if (audioObject) {
                ensureAudioMuted(audioObject, isMuted);
              }
            }, 100);
          }
          
          return nh;
        });

        // Removed suggestion hiding - no longer needed

        // Handle authentication requirements from backend
        if (requiresAuthNext) {
          setAuthMethod(auth_method || authMethod || "whatsapp");
          setNeedsAuth(true);
          setShowInlineAuth(true);
          try {
            localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
          } catch {}
        }
      } catch (err) {
        if (
          err?.response?.status === 403 &&
          (err?.response?.data?.error === "NEED_AUTH" ||
            err?.response?.data?.error === "AUTH_REQUIRED")
        ) {
          setAuthMethod(
            err.response.data.auth_method || authMethod || "whatsapp"
          );
          setNeedsAuth(true);
          setShowInlineAuth(true);
          try {
            localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
          } catch {}
          toast.info(err.response.data.message || "Please verify to continue.");
        } else if (err?.response?.status === 403) {
          const errorMessage = err?.response?.data?.message || "";
          if (
            errorMessage.toLowerCase().includes("subscription") &&
            (errorMessage.toLowerCase().includes("expired") ||
              errorMessage.toLowerCase().includes("inactive"))
          ) {
            toast.error(errorMessage);
          } else {
            setNeedsAuth(true);
            setShowInlineAuth(true);
            try {
              localStorage.setItem(AUTH_GATE_KEY(sessionId, chatbotId), "1");
            } catch {}
            toast.error("Authentication required to continue.");
          }
        } else {
          console.error("Chat error:", err);
          toast.error("Failed to get a response.");
          setChatHistory((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Something went wrong. Please try again later.",
              timestamp: new Date(),
            },
          ]);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [
      apiBase,
      chatbotId,
      phone,
      verified,
      message,
      playAudio,
      stopAudio,
      sessionId,
    ]
  );

  // Voice recording handlers
  const handleMicClick = () => {
    if (!isMobile) {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording((text) => {
          handleSendMessage(text);
        }).catch((error) => {
          toast.error(error.message || "Voice recording failed");
        });
      }
    }
  };

  const handleMicTouchStart = useCallback(
    (e) => {
      if (isMobile && !isTyping) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Add haptic feedback if available
        hapticFeedback(50); // Short vibration
        
        startRecording((text) => {
          handleSendMessage(text);
        }).catch((error) => {
          toast.error(error.message || "Voice recording failed");
        });
      }
    },
    [isMobile, isTyping, startRecording, handleSendMessage]
  );

  const handleMicTouchEnd = useCallback(
    (e) => {
      if (isMobile) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Add haptic feedback if available
        hapticFeedback(25); // Short vibration
        
        stopRecording();
      }
    },
    [isMobile, stopRecording]
  );

  const handleMicMouseDown = useCallback((e) => {
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      
      // Add haptic feedback if available
      hapticFeedback(50);
      
      startRecording((text) => {
        handleSendMessage(text);
      }).catch((error) => {
        toast.error(error.message || "Voice recording failed");
      });
    }
  }, [isMobile, startRecording, handleSendMessage]);

  const handleMicMouseUp = useCallback((e) => {
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      
      // Add haptic feedback if available
      hapticFeedback(25);
      
      stopRecording();
    }
  }, [isMobile, stopRecording]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!isTyping) {
        handleSendMessage();
      }
    }
  };

  return (
    <Wrapper>
      <GlobalStyle />

      {showChat && (
        <Overlay ref={overlayRef}>
          <DeviceFrameComponent>
            <Chatbox ref={chatboxRef}>
              <ChatHeader
                currentTime={currentTime}
                batteryLevel={batteryLevel}
                isCharging={isCharging}
                chatbotLogo={chatbotLogo}
              />

              <ChatContainer>
                <MessagesContainer 
                  ref={messagesContainerRef}
                >
                  {chatHistory.map((msg, idx) => (
                    <MessageBubbleComponent
                      key={idx}
                      message={msg}
                      index={idx}
                      isUser={msg.sender === "user"}
                      isTyping={isTyping}
                      animatedMessageIdx={animatedMessageIdx}
                      chatHistoryLength={chatHistory.length}
                      currentlyPlaying={currentlyPlaying}
                      playAudio={playAudio}
                      setAnimatedMessageIdx={setAnimatedMessageIdx}
                    />
                  ))}

                  <TypingIndicator isTyping={isTyping} />

                  {/* Authentication components - commented out for default auth state */}
                  {/* <InlineAuth
                    showInlineAuthInput={showInlineAuthInput}
                    authMethod={authMethod}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    isPhoneValid={isPhoneValid}
                    setIsPhoneValid={setIsPhoneValid}
                    handleSendOtp={handleSendOtp}
                    loadingOtp={loadingOtp}
                    resendTimeout={resendTimeout}
                  />

                  <OtpVerification
                    showOtpInput={showOtpInput}
                    authMethod={authMethod}
                    email={email}
                    phone={phone}
                    otp={otp}
                    setOtp={setOtp}
                    handleVerifyOtp={handleVerifyOtp}
                    loadingVerify={loadingVerify}
                    resendTimeout={resendTimeout}
                    handleSendOtp={handleSendOtp}
                  /> */}

                  {/* Removed SuggestionButtons component - no longer needed */}

                  <div ref={endOfMessagesRef} />
                </MessagesContainer>

                <VoiceInputIndicatorComponent isRecording={isRecording} />

                <InputArea
                  message={message}
                  setMessage={setMessage}
                  handleKeyPress={handleKeyPress}
                  isTyping={isTyping}
                  userMessageCount={userMessageCount}
                  verified={verified}
                  needsAuth={needsAuth}
                  isRecording={isRecording}
                  isMuted={isMuted}
                  toggleMute={toggleMute}
                  handleMicClick={handleMicClick}
                  handleMicTouchStart={handleMicTouchStart}
                  handleMicTouchEnd={handleMicTouchEnd}
                  handleMicMouseDown={handleMicMouseDown}
                  handleMicMouseUp={handleMicMouseUp}
                  isMobile={isMobile}
                  handleSendMessage={handleSendMessage}
                  currentlyPlaying={currentlyPlaying}
                />
              </ChatContainer>
              <div className="gesture-bar" />
            </Chatbox>
          </DeviceFrameComponent>

          <ToastContainer position="top-center" />
        </Overlay>
      )}
    </Wrapper>
  );
};

export default SupaChatbot;
