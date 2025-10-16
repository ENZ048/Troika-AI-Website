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
import VoiceInputIndicatorComponent from "./VoiceInputIndicator";
import WelcomeSection from "./WelcomeSection";
import Confetti from "./Confetti";
import ServiceSelectionButtons from "./ServiceSelectionButtons";
import Sidebar from "./Sidebar";
import SocialFeedPanel from "./SocialFeedPanel";
import StreamingMessage from "./StreamingMessage";
import InlineAuth from "./InlineAuth";
import OtpVerification from "./OtpVerification";
import InputArea from "./InputArea";
// Removed SuggestionButtons import - no longer needed

// Import styles
import { Wrapper, Overlay, AnimatedBlob, Chatbox, ChatContainer, MessagesContainer, MessagesInnerContainer, MainContentArea } from "../styles/MainStyles";
import GlobalStyle from "../styles/GlobalStyles";

// Import theme
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

// Import hooks
import { useBattery } from "../hooks/useBattery";
import { useClock } from "../hooks/useClock";
import { useAudio } from "../hooks/useAudio";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import { useStreamingChat } from "../hooks/useStreamingChat";

// Import utils
import { getTimeBasedGreeting } from "../utils/timeUtils";
import { isMobileDevice, getDeviceInfo, hapticFeedback, debounce } from "../utils/mobileUtils";

// Import services
import frontendInactivityManager from "../services/frontendInactivityManager";

const SupaChatbotInner = ({ chatbotId, apiBase }) => {
  const { isDarkMode } = useTheme();

  // State management
  const [showChat, setShowChat] = useState(true);
  const [phone, setPhone] = useState(""); // User's WhatsApp number for OTP authentication
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false); // Changed to false - require auth
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [message, setMessage] = useState("");

  // Per-tab chat histories - each tab maintains its own conversation history
  const [chatHistories, setChatHistories] = useState({
    home: [],
    'ai-websites': [],
    'ai-calling': [],
    'ai-whatsapp': [],
    'ai-telegram': [],
    'industry-use-cases': [],
    'social-media': []
  });

  // Per-tab state management - each tab has independent states
  const [tabStates, setTabStates] = useState({
    home: { isTyping: false, animatedMessageIdx: null, message: '', currentStreamingMessageId: null },
    'ai-websites': { isTyping: false, animatedMessageIdx: null, message: '', currentStreamingMessageId: null },
    'ai-calling': { isTyping: false, animatedMessageIdx: null, message: '', currentStreamingMessageId: null },
    'ai-whatsapp': { isTyping: false, animatedMessageIdx: null, message: '', currentStreamingMessageId: null },
    'ai-telegram': { isTyping: false, animatedMessageIdx: null, message: '', currentStreamingMessageId: null },
    'industry-use-cases': { isTyping: false, animatedMessageIdx: null, message: '', currentStreamingMessageId: null },
    'social-media': { isTyping: false, animatedMessageIdx: null, message: '', currentStreamingMessageId: null }
  });

  // Enable streaming mode by default
  const [enableStreaming, setEnableStreaming] = useState(true);

  const [isResetting, setIsResetting] = useState(false);
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
  const [showWelcome, setShowWelcome] = useState(true);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [socialFeedOpen, setSocialFeedOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
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
  const greetingAddedRef = useRef(false);

  // Custom hooks
  const { batteryLevel, isCharging } = useBattery();
  const currentTime = useClock();
  const { playAudio, stopAudio, currentlyPlaying, audioObject, toggleMuteForCurrentAudio, muteCurrentAudio, ensureAudioMuted } = useAudio(isMuted, hasUserInteracted);
  const { isRecording, startRecording, stopRecording } = useVoiceRecording(apiBase);

  // Helper functions for per-tab chat history management
  const getCurrentChatHistory = useCallback(() => {
    return chatHistories[activePage] || [];
  }, [chatHistories, activePage]);

  const setCurrentChatHistory = useCallback((updater) => {
    setChatHistories(prev => {
      const currentHistory = prev[activePage] || [];
      const newHistory = typeof updater === 'function' ? updater(currentHistory) : updater;
      return {
        ...prev,
        [activePage]: newHistory
      };
    });
  }, [activePage]);

  // Helper functions for per-tab state management
  const getCurrentTabState = useCallback(() => {
    return tabStates[activePage] || { isTyping: false, animatedMessageIdx: null, message: '' };
  }, [tabStates, activePage]);

  const setCurrentTabState = useCallback((updater) => {
    setTabStates(prev => ({
      ...prev,
      [activePage]: typeof updater === 'function' ? updater(prev[activePage]) : updater
    }));
  }, [activePage]);

  // Wrapper functions to update specific tab state properties
  const setIsTyping = useCallback((value) => {
    setTabStates(prev => ({
      ...prev,
      [activePage]: { ...prev[activePage], isTyping: value }
    }));
  }, [activePage]);

  const setAnimatedMessageIdx = useCallback((value) => {
    setTabStates(prev => ({
      ...prev,
      [activePage]: { ...prev[activePage], animatedMessageIdx: value }
    }));
  }, [activePage]);

  const setCurrentStreamingMessageId = useCallback((value) => {
    setTabStates(prev => ({
      ...prev,
      [activePage]: { ...prev[activePage], currentStreamingMessageId: value }
    }));
  }, [activePage]);

  // Derived values from current tab state
  const isTyping = getCurrentTabState().isTyping;
  const animatedMessageIdx = getCurrentTabState().animatedMessageIdx;
  const currentStreamingMessageId = getCurrentTabState().currentStreamingMessageId;

  const clearCurrentChatHistory = useCallback(() => {
    setChatHistories(prev => ({
      ...prev,
      [activePage]: []
    }));
  }, [activePage]);

  const clearAllChatHistories = useCallback(() => {
    setChatHistories({
      home: [],
      'ai-websites': [],
      'ai-calling': [],
      'ai-whatsapp': [],
      'ai-telegram': [],
      'industry-use-cases': [],
      'social-media': []
    });
  }, []);

  // Computed value - current tab's chat history for easier access
  const chatHistory = getCurrentChatHistory();

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
    setUserMessageCount(prev => {
      const newCount = prev + 1;
      // Persist to localStorage
      if (sessionId && chatbotId) {
        try {
          const key = `supa_user_message_count:${chatbotId}:${sessionId}`;
          localStorage.setItem(key, newCount.toString());
        } catch (error) {
          console.error("Error saving user message count:", error);
        }
      }
      return newCount;
    });
  }, [sessionId, chatbotId, userMessageCount]);

  // Streaming chat hook callbacks
  const handleStreamingComplete = useCallback((data) => {
    const { fullAnswer, suggestions, metrics } = data;

    // Update the streaming message with final answer
    setCurrentChatHistory((prev) => {
      return prev.map((msg) => {
        if (msg.isStreaming) {
          return {
            ...msg,
            text: fullAnswer,
            suggestions: suggestions || [],
            metrics,
            isStreaming: false,
            wasStreamed: true, // Flag to prevent typing animation
          };
        }
        return msg;
      });
    });

    // Clear streaming message ID and ensure no typing animation
    setCurrentStreamingMessageId(null);
    setIsTyping(false);
    setAnimatedMessageIdx(null); // Prevent typing animation on completed message
  }, [setCurrentChatHistory, setCurrentStreamingMessageId, setIsTyping, setAnimatedMessageIdx]);

  const handleStreamingError = useCallback((error) => {
    console.error('Streaming error:', error);

    // Add error message to chat
    setCurrentChatHistory((prev) => {
      // Remove streaming message if exists
      const filtered = prev.filter(msg => !msg.isStreaming);

      return [
        ...filtered,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        }
      ];
    });

    setCurrentStreamingMessageId(null);
    setIsTyping(false);
    toast.error("Failed to get a response.");
  }, [setCurrentChatHistory, setCurrentStreamingMessageId, setIsTyping]);

  // Streaming chat hook - initialize after helper functions are defined
  const streamingChat = useStreamingChat({
    apiBase,
    chatbotId,
    sessionId,
    enableTTS: !isMuted,
    isMuted,
    onComplete: handleStreamingComplete,
    onError: handleStreamingError,
  });

  // Update streaming message in real-time as new text arrives
  useEffect(() => {
    if (streamingChat && streamingChat.isStreaming && streamingChat.streamingResponse && currentStreamingMessageId) {
      setCurrentChatHistory((prev) => {
        return prev.map((msg) => {
          if (msg.id === currentStreamingMessageId) {
            return {
              ...msg,
              text: streamingChat.streamingResponse,
              audioPlaying: streamingChat.audioPlaying,
              isStreaming: true,
            };
          }
          return msg;
        });
      });
    }
  }, [streamingChat?.streamingResponse, streamingChat?.audioPlaying, streamingChat?.isStreaming, currentStreamingMessageId, setCurrentChatHistory]);

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

          setCurrentChatHistory((prev) => {
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
              setCurrentChatHistory(prev => {
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
      const currentHistory = getCurrentChatHistory();
      if (
        chatbotId &&
        apiBase &&
        currentHistory.length === 1 &&
        currentHistory[0].sender === "bot" &&
        !currentHistory[0].audio
      ) {
        const greetingText = currentHistory[0].text;
        setTimeout(() => {
          ensureGreetingTTS(greetingText);
        }, 200);
      }
    };

    generateInitialGreetingTTS();
  }, [chatbotId, apiBase, ensureGreetingTTS]);

  // Removed prefetch Thank you TTS useEffect - no longer needed

  // Initialize session - Always generate new session ID on page refresh
  useEffect(() => {
    // Always generate a new session ID on page refresh
    const id = crypto.randomUUID();
    localStorage.setItem("sessionId", id);
    setSessionId(id);
    
    // Set verified state to true to bypass auth UI while sending default phone
    setVerified(true);
    setNeedsAuth(false);
    setShowInlineAuth(false);
    setShowAuthScreen(false);
    
    // Clear any existing auth data from localStorage
    try {
      localStorage.removeItem(AUTH_GATE_KEY(id, chatbotId));
      localStorage.removeItem(SESSION_STORE_KEY("whatsapp"));
      localStorage.removeItem(SESSION_STORE_KEY("email"));
    } catch (error) {
      console.log("Error clearing auth data:", error);
    }
  }, []);

  // Load chat histories from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistories = localStorage.getItem(`supa_chat_histories:${chatbotId}`);
      if (savedHistories) {
        const parsed = JSON.parse(savedHistories);

        // Convert timestamp strings back to Date objects
        const historiesWithDates = {};
        Object.keys(parsed).forEach(tabId => {
          historiesWithDates[tabId] = parsed[tabId].map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
        });

        setChatHistories(historiesWithDates);
      }
    } catch (error) {
      console.error('Error loading chat histories from localStorage:', error);
    }
  }, [chatbotId]);

  // Save chat histories to localStorage whenever they change (but skip initial render)
  useEffect(() => {
    // Skip saving on initial mount to avoid overwriting loaded data
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    try {
      localStorage.setItem(`supa_chat_histories:${chatbotId}`, JSON.stringify(chatHistories));
    } catch (error) {
      console.error('Error saving chat histories to localStorage:', error);
    }
  }, [chatHistories, chatbotId]);

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

  // Set initial greeting - DISABLED: Greeting should only show in WelcomeSection, not as a chat message
  // This prevents the welcome screen from disappearing when switching tabs without sending a message
  useEffect(() => {
    // Don't add greeting to chat history anymore
    // The greeting is displayed in the WelcomeSection component
    // Chat history should only contain actual user and bot conversation messages
    const currentHistory = getCurrentChatHistory();

    if (!isResetting && !greetingAddedRef.current && showWelcome && chatbotId && !finalGreetingReady && currentHistory.length === 0) {
      greetingAddedRef.current = true; // Mark as added IMMEDIATELY

      // DO NOT add greeting to chat history
      // setCurrentChatHistory([
      //   {
      //     sender: "bot",
      //     text: welcomeMessage,
      //     timestamp: new Date(),
      //   },
      // ]);

      setFinalGreetingReady(true);

      // Generate TTS for greeting if needed (optional)
      // if (apiBase) {
      //   ensureGreetingTTS(welcomeMessage);
      // }
    } else if (currentHistory.length > 0) {
      // Mark as added so we don't try again
      greetingAddedRef.current = true;
      setFinalGreetingReady(true);
    }
  }, [chatbotId, finalGreetingReady, welcomeMessage, apiBase, ensureGreetingTTS, showWelcome, isResetting, getCurrentChatHistory]);


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

  // Auto-scroll when new messages are added or typing starts
  useEffect(() => {
    const currentHistory = getCurrentChatHistory();
    if ((currentHistory.length > 0 || isTyping) && !showWelcome) {
      const scrollToBottom = () => {
        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end' 
          });
        } else if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // Immediate scroll
      scrollToBottom();
      
      // Additional scroll after a short delay
      const timeoutId = setTimeout(scrollToBottom, 100);
      
      // Extra scroll after content is fully rendered
      const extraTimeoutId = setTimeout(scrollToBottom, 300);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(extraTimeoutId);
      };
    }
  }, [getCurrentChatHistory, isTyping, showWelcome]);

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isTyping && !showWelcome) {
      // Check if user is near bottom before auto-scrolling
      const isNearBottom = () => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          const threshold = 100; // pixels from bottom
          return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        }
        return true; // Default to true if can't determine
      };

      const scrollToBottom = () => {
        // Only auto-scroll if user hasn't manually scrolled up
        if (!isNearBottom()) {
          return; // User has scrolled up, don't force them down
        }

        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
          });
        } else if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      };

      // Initial scroll when typing starts
      scrollToBottom();

      // One more scroll after a short delay to ensure typing indicator is visible
      const timeoutId = setTimeout(scrollToBottom, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isTyping, showWelcome]);

  // Auto-scroll when typing stops (message is complete)
  useEffect(() => {
    if (!isTyping && chatHistory.length > 0 && !showWelcome) {
      const scrollToBottom = () => {
        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end' 
          });
        } else if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // Immediate scroll when typing stops
      scrollToBottom();
      
      // Additional scroll after content is fully rendered
      const timeoutId = setTimeout(scrollToBottom, 100);
      
      // Extra scroll to ensure final message and suggestions are visible
      const extraTimeoutId = setTimeout(scrollToBottom, 300);
      
      // Final scroll to ensure suggestion buttons are visible
      const finalTimeoutId = setTimeout(scrollToBottom, 800);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(extraTimeoutId);
        clearTimeout(finalTimeoutId);
      };
    }
  }, [isTyping, chatHistory.length, showWelcome]);

  // Auto-scroll to show suggestion buttons after messages are rendered
  useEffect(() => {
    if (chatHistory.length > 0 && !showWelcome) {
      const scrollToShowSuggestions = () => {
        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end' 
          });
        } else if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // Scroll after a delay to ensure all content including suggestions are rendered
      const timeoutId = setTimeout(scrollToShowSuggestions, 200);
      const extraTimeoutId = setTimeout(scrollToShowSuggestions, 600);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(extraTimeoutId);
      };
    }
  }, [chatHistory.length, showWelcome]);

  // Auto-scroll when switching from welcome to chat
  useEffect(() => {
    if (!showWelcome && chatHistory.length > 0) {
      const scrollToBottom = () => {
        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end' 
          });
        } else if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // Scroll when switching to chat view
      const timeoutId = setTimeout(scrollToBottom, 100);
      const extraTimeoutId = setTimeout(scrollToBottom, 300);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(extraTimeoutId);
      };
    }
  }, [showWelcome, chatHistory.length]);

  // Handle inline auth input display
  useEffect(() => {
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
  ]);

  // Handle OTP input display after OTP is sent
  useEffect(() => {
    if (
      otpSent &&
      !verified &&
      !isTyping
    ) {
      setShowOtpInput(true);
    } else {
      setShowOtpInput(false);
    }
  }, [otpSent, verified, isTyping]);

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
      setCurrentChatHistory([]);
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

    // COMMENTED OUT - Auth gate logic disabled for backend-controlled auth
    /* if (sessionId) {
      try {
        const shouldGate =
          localStorage.getItem(AUTH_GATE_KEY(sessionId, chatbotId)) === "1";
        if (shouldGate) {
          setNeedsAuth(true);
          setShowInlineAuth(true);
        }
      } catch {}
    } */
  }, [chatbotId, sessionId, apiBase]);

  // Auto-send conversation transcript after 30 seconds of inactivity
  useEffect(() => {
    // Get current chat history for the active tab
    const chatHistory = getCurrentChatHistory();

    // Only start timer if WhatsApp is verified and there's chat history
    if (verified && phone && sessionId && chatbotId && chatHistory.length > 0) {
      console.log('⏰ Resetting inactivity timer due to chat update');
      frontendInactivityManager.resetInactivityTimer(
        sessionId,
        phone,
        chatbotId,
        chatHistory,
        apiBase
      );
    }

    // Cleanup timer when component unmounts
    return () => {
      if (sessionId) {
        frontendInactivityManager.clearInactivityTimer(sessionId);
      }
    };
  }, [getCurrentChatHistory, verified, phone, sessionId, chatbotId, apiBase]);

  // OTP handling functions
  const handleSendOtp = async () => {
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
  };

  const handleVerifyOtp = async () => {
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
  };

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
      console.log('handleSendMessage called with:', { inputText, message, sessionId, verified, needsAuth, enableStreaming });

      // Hide welcome section when user sends a message
      if (showWelcome) {
        setShowWelcome(false);
      }

      // Check if auth is required after user has sent 2 messages
      if (needsAuth && !verified) {
        console.log('User needs auth - blocking message send');
        return;
      }

      if (!sessionId) {
        console.log('No sessionId, returning early');
        return;
      }

      const textToSend = inputText || message;
      if (!textToSend.trim()) return;

      // Properly stop any currently playing audio and any ongoing streaming
      stopAudio();
      if (streamingChat && streamingChat.isStreaming) {
        streamingChat.stopStreaming();
      }

      // Small delay to ensure audio is fully stopped
      await new Promise(resolve => setTimeout(resolve, 50));
      const userMessage = { sender: "user", text: textToSend, timestamp: new Date() };

      // Add user message to current tab's chat history
      setCurrentChatHistory((prev) => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);
      
      // Scroll immediately when typing starts
      const scrollImmediately = () => {
        if (endOfMessagesRef.current) {
          endOfMessagesRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end' 
          });
        } else if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      };
      
      // Immediate scroll
      scrollImmediately();
      
      // Additional scroll after content is rendered
      setTimeout(scrollImmediately, 100);
      setTimeout(scrollImmediately, 300);

      // Increment user message count
      incrementUserMessageCount();

      try {
        // Use streaming if enabled, otherwise fall back to regular API
        if (enableStreaming && streamingChat) {
          console.log('Using streaming mode');

          // Create a placeholder bot message for streaming
          const streamingMessageId = crypto.randomUUID();
          const streamingMessage = {
            id: streamingMessageId,
            sender: "bot",
            text: "",
            suggestions: [],
            timestamp: new Date(),
            isStreaming: true,
          };

          // Add streaming placeholder to chat history
          setCurrentChatHistory((prev) => [...prev, streamingMessage]);

          // Set current streaming message ID
          setCurrentStreamingMessageId(streamingMessageId);

          // Start streaming
          await streamingChat.sendMessage(textToSend);

          // Scroll to bottom during streaming
          const scrollInterval = setInterval(() => {
            if (endOfMessagesRef.current) {
              endOfMessagesRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
              });
            }
          }, 500);

          // Clear interval after a while
          setTimeout(() => clearInterval(scrollInterval), 5000);

        } else {
          // Regular (non-streaming) message handling - using troika intelligent chat
          console.log('Using regular mode with troika intelligent chat');
          const requestData = {
            chatbotId,
            query: textToSend,
            sessionId,
            phone: verified ? phone : undefined, // Only send phone if user is verified
          };
          console.log('Sending request to backend:', requestData);
          const response = await axios.post(`${apiBase}/troika/intelligent-chat`, requestData);

          const { answer, audio, requiresAuthNext, auth_method, suggestions } = response.data;

          const botMessage = {
            sender: "bot",
            text: answer || "Sorry, I couldn't get that.",
            audio,
            suggestions: suggestions || [],
            timestamp: new Date(),
          };

          setCurrentChatHistory((prev) => {
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

            // Force scroll to bottom after bot message is added
            setTimeout(() => {
              if (endOfMessagesRef.current) {
                endOfMessagesRef.current.scrollIntoView({
                  behavior: 'smooth',
                  block: 'end'
                });
              } else if (messagesContainerRef.current) {
                const container = messagesContainerRef.current;
                container.scrollTo({
                  top: container.scrollHeight,
                  behavior: 'smooth'
                });
              }
            }, 100);

            return nh;
          });

          // Handle authentication requirements from backend - IGNORED since we're using default phone
          if (requiresAuthNext) {
            console.log('Backend requested auth, but ignoring since using default phone');
            // Don't show auth UI - we're using default phone number
          }
        }
      } catch (err) {
        if (
          err?.response?.status === 403 &&
          (err?.response?.data?.error === "NEED_AUTH" ||
            err?.response?.data?.error === "AUTH_REQUIRED")
        ) {
          console.log('Backend auth error, but ignoring since using default phone');
          // Don't show auth UI - we're using default phone number
          toast.error("Authentication error - please try again.");
        } else if (err?.response?.status === 403) {
          const errorMessage = err?.response?.data?.message || "";
          if (
            errorMessage.toLowerCase().includes("subscription") &&
            (errorMessage.toLowerCase().includes("expired") ||
              errorMessage.toLowerCase().includes("inactive"))
          ) {
            toast.error(errorMessage);
          } else {
            console.log('Backend auth error, but ignoring since using default phone');
            // Don't show auth UI - we're using default phone number
            toast.error("Authentication error - please try again.");
          }
        } else {
          console.error("Chat error:", err);
          toast.error("Failed to get a response.");
          setCurrentChatHistory((prev) => [
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
      setCurrentChatHistory,
      setIsTyping,
      incrementUserMessageCount,
      enableStreaming,
      streamingChat,
      setCurrentStreamingMessageId,
      currentStreamingMessageId,
    ]
  );

  const handleServiceSelection = useCallback((serviceName) => {
    console.log('Service selected:', serviceName);
    
    // Hide service selection buttons
    setShowServiceSelection(false);
    
    // Send pricing request message to backend
    const pricingMessage = `give me pricing of ${serviceName}`;
    handleSendMessage(pricingMessage);
  }, [handleSendMessage]);

  const handleBackToWelcome = useCallback(() => {
    console.log('Back to welcome clicked');
    
    // Set resetting flag
    setIsResetting(true);
    
    // Clear audio and animation states
    stopAudio();

    // Stop any ongoing streaming
    if (streamingChat && streamingChat.isStreaming) {
      streamingChat.stopStreaming();
    }

    setIsTyping(false);
    setAnimatedMessageIdx(null);
    setShowServiceSelection(false);
    
    // Clear refs
    lastGeneratedGreeting.current = null;
    greetingAutoPlayed.current = false;
    pendingGreetingAudio.current = null;
    greetingAddedRef.current = false; // Reset this too
    
    // Clear states
    setMessage("");
    setUserMessageCount(0);
    setFinalGreetingReady(false);
    setCurrentChatHistory([]);
    setActivePage('home'); // Reset to home page
    setShowWelcome(false); // Set to false first
    
    // Clear user message count from localStorage
    if (sessionId && chatbotId) {
      try {
        const key = `supa_user_message_count:${chatbotId}:${sessionId}`;
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error clearing user message count:", error);
      }
    }

    // Clear all chat histories from localStorage when starting a new chat
    try {
      localStorage.removeItem(`supa_chat_histories:${chatbotId}`);
      // Also clear the state
      clearAllChatHistories();
    } catch (error) {
      console.error("Error clearing chat histories from localStorage:", error);
    }

    // Generate new session ID
    const newSessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", newSessionId);
    setSessionId(newSessionId);
    
    // After delay, enable welcome mode
    setTimeout(() => {
      setShowWelcome(true);
      setIsResetting(false);
    }, 50);
    
    console.log('Reset to welcome screen with new session:', newSessionId);
  }, [sessionId, chatbotId, stopAudio, clearAllChatHistories, streamingChat]);

  const handleSuggestionClick = useCallback((action) => {
    // CRITICAL: First explicitly clear chat history
    setCurrentChatHistory([]);
    setShowWelcome(false);

    // Handle conversational flow data
    if (typeof action === 'object' && action.type === 'conversational') {
      setTimeout(() => {
        // Add user message
        const userMessage = {
          sender: "user",
          text: action.action.replace('telegram-', '').replace('-', ' ').toUpperCase(),
          timestamp: new Date()
        };
        setCurrentChatHistory([userMessage]);
        
        // Add bot message with conversational content
        setIsTyping(true);
        
        // Scroll immediately when typing starts
        const scrollImmediately = () => {
          if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'end' 
            });
          } else if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        };
        
        // Immediate scroll
        scrollImmediately();
        
        // Additional scroll after content is rendered
        setTimeout(scrollImmediately, 100);
        setTimeout(scrollImmediately, 300);
        
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: action.message,
            timestamp: new Date(),
            suggestions: action.suggestions || []
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]);
          setIsTyping(false);
          
          // Force scroll to bottom after message is added
          setTimeout(() => {
            if (endOfMessagesRef.current) {
              endOfMessagesRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end' 
              });
            } else if (messagesContainerRef.current) {
              const container = messagesContainerRef.current;
              container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 100);
        }, 500);
      }, 50);
      return;
    }

    // Check if action is HTML content (starts with <div)
    if (typeof action === 'string' && action.startsWith('<div')) {
      // Use setTimeout to ensure state clearing is complete
      setTimeout(() => {
        // Add user message
        const userMessage = {
          sender: "user",
          text: "Tell me about AI Calling Agent",
          timestamp: new Date()
        };
        setCurrentChatHistory([userMessage]); // Set directly, not append
        
        // Add bot message with HTML content
        setIsTyping(true);
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: action, // This will be HTML content
            timestamp: new Date(),
            isHTML: true // Flag to indicate this is HTML content
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]); // Now prev will be clean
          setIsTyping(false);
        }, 500);
      }, 50); // Small delay to ensure clearing
      return;
    }
    
    // Special handling for pricing - show pricing content
    if (action === 'pricing') {
      setTimeout(() => {
        const userMessage = { 
          sender: "user", 
          text: "What are your pricing plans?", 
          timestamp: new Date() 
        };
        setCurrentChatHistory([userMessage]); // Direct set, not append
        
        setIsTyping(true);
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: staticFAQs["Pricing"],
            timestamp: new Date()
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }, 50);
      return;
    }

    // Special handling for results - show AI Websites results content
    if (action === 'results') {
      setTimeout(() => {
        const userMessage = { 
          sender: "user", 
          text: "Show me the results of AI Websites", 
          timestamp: new Date() 
        };
        setCurrentChatHistory([userMessage]); // Direct set, not append
        
        setIsTyping(true);
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: `<div style='text-align: left; line-height: 1.6; color: #374151; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;'>
              <div style='font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; color: #1f2937; text-align: center; background: linear-gradient(135deg, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;'>🎯 FINAL RESULT</div>
              <div style='background: linear-gradient(135deg, #1f2937, #374151); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem; color: white; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);'>
                <div style='font-size: 1.8rem; font-weight: 700; margin-bottom: 1.5rem; color: #fbbf24; text-align: center; display: flex; align-items: center; justify-content: center;'>
                  <span style='margin-right: 0.5rem; font-size: 2rem;'>🎯</span>FINAL RESULT
                </div>
                <div style='background: rgba(255, 255, 255, 0.1); padding: 1.5rem; border-radius: 12px; border-left: 5px solid #fbbf24; margin-bottom: 1.5rem;'>
                  <div style='font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: #fbbf24;'>With Troika AI Website, your business gets:</div>
                  <div style='display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));'>
                    <div style='background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #10b981;'>
                      <div style='font-weight: 600; color: #ffffff; margin-bottom: 0.5rem; display: flex; align-items: center;'>
                        <span style='margin-right: 0.5rem; font-size: 1.2rem;'>✅</span>Professional design & AI-powered automation
                      </div>
                    </div>
                    <div style='background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;'>
                      <div style='font-weight: 600; color: #ffffff; margin-bottom: 0.5rem; display: flex; align-items: center;'>
                        <span style='margin-right: 0.5rem; font-size: 1.2rem;'>✅</span>24×7 chat and response system
                      </div>
                    </div>
                    <div style='background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #8b5cf6;'>
                      <div style='font-weight: 600; color: #ffffff; margin-bottom: 0.5rem; display: flex; align-items: center;'>
                        <span style='margin-right: 0.5rem; font-size: 1.2rem;'>✅</span>Lead tracking and analytics
                      </div>
                    </div>
                    <div style='background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b;'>
                      <div style='font-weight: 600; color: #ffffff; margin-bottom: 0.5rem; display: flex; align-items: center;'>
                        <span style='margin-right: 0.5rem; font-size: 1.2rem;'>✅</span>Multilingual reach
                      </div>
                    </div>
                    <div style='background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444;'>
                      <div style='font-weight: 600; color: #ffffff; margin-bottom: 0.5rem; display: flex; align-items: center;'>
                        <span style='margin-right: 0.5rem; font-size: 1.2rem;'>✅</span>Ongoing support & growth insights
                      </div>
                    </div>
                  </div>
                </div>
                <div style='background: rgba(255, 255, 255, 0.1); padding: 1.5rem; border-radius: 12px; border-left: 5px solid #fbbf24; text-align: center;'>
                  <div style='font-size: 1.2rem; font-weight: 600; color: #fbbf24; margin-bottom: 0.5rem; font-style: italic;'>"We don't just design websites  we build digital employees that work for you, every second."</div>
                </div>
              </div>
            </div>`,
            timestamp: new Date(),
            isHTML: true
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }, 50);
      return;
    }

    // Static FAQ responses for AI website questions
    const staticFAQs = {
      "Pricing": `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; margin-bottom: 20px; font-size: 24px; font-weight: 700;">AI WEBSITE PLANS & PRICING</h2>
        
        <div style="margin: 20px 0; overflow-x: auto; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 16px; text-align: left; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Plan</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Setup</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Monthly</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Chats/Month</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Languages</th>
                <th style="padding: 16px; text-align: left; font-weight: 600;">Ideal For</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">Basic</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 18px;">₹50,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 18px;">₹5,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 500;">5,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 500;">2</td>
                <td style="padding: 16px; color: #4b5563;">Small businesses / institutes starting digital presence</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">Advanced</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 18px;">₹75,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 18px;">₹7,500</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 500;">10,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 500;">3–4</td>
                <td style="padding: 16px; color: #4b5563;">Growing brands needing automation & analytics</td>
              </tr>
              <tr>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">Premium</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 18px;">₹1,00,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 18px;">₹10,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 500;">15,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 500;">5+</td>
                <td style="padding: 16px; color: #4b5563;">Enterprises seeking full-scale AI + multilingual setup</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #0c4a6e;">🕒 Timeline: 7 Days to go live</p>
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #0c4a6e;">💬 Support: AI Agent + Human monitoring</p>
          <p style="margin: 0; font-weight: 600; color: #0c4a6e;">📊 Includes: Chat handling • Knowledgebase management • Lead capture • Analytics dashboard • Response optimization</p>
        </div>

        <h3 style="color: #dc2626; margin: 30px 0 15px 0; font-size: 20px; font-weight: 700;">PRICE JUSTIFICATION</h3>
        
        <div style="margin: 20px 0; overflow-x: auto; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white;">
                <th style="padding: 16px; text-align: left; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Component</th>
                <th style="padding: 16px; text-align: left; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Purpose</th>
                <th style="padding: 16px; text-align: center; font-weight: 600;">Included In</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 600; color: #374151;">AI Design & Development</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; color: #4b5563;">Responsive, mobile-first WordPress build with Troika AI interface</td>
                <td style="padding: 16px; text-align: center; color: #059669; font-weight: 600;">Setup</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Knowledgebase Creation</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; color: #4b5563;">Business data, FAQs, and chatbot training</td>
                <td style="padding: 16px; text-align: center; color: #059669; font-weight: 600;">Setup</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 600; color: #374151;">AI Chat Integration</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; color: #4b5563;">Smart lead capture + multilingual AI response system</td>
                <td style="padding: 16px; text-align: center; color: #059669; font-weight: 600;">Setup</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Analytics & Dashboard Setup</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; color: #4b5563;">Google Analytics, heatmaps, and conversion tracking</td>
                <td style="padding: 16px; text-align: center; color: #059669; font-weight: 600;">Setup</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Monthly Hosting & Maintenance</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; color: #4b5563;">Server, SSL, backups, plugin updates</td>
                <td style="padding: 16px; text-align: center; color: #dc2626; font-weight: 600;">Monthly</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Lead & Chat Management</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; color: #4b5563;">Real-time chat handling and response improvement</td>
                <td style="padding: 16px; text-align: center; color: #dc2626; font-weight: 600;">Monthly</td>
              </tr>
              <tr>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Reports & Insights</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; color: #4b5563;">Monthly analytics + optimization suggestions</td>
                <td style="padding: 16px; text-align: center; color: #dc2626; font-weight: 600;">Monthly</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h4 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">✅ Result:</h4>
          <p style="margin: 0 0 10px 0; font-size: 16px;">Your business gets a full digital ecosystem not just a website.</p>
          <p style="margin: 0; font-size: 16px;">It captures leads, answers customers, tracks performance, and improves continuously.</p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px; font-weight: 700;">⚡ WHAT YOU GET IN EVERY PLAN</h4>
          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
            <li style="margin-bottom: 8px;">100% Responsive, fast, Business-ready website</li>
            <li style="margin-bottom: 8px;">AI chat agent integrated (Supa Agent)</li>
            <li style="margin-bottom: 8px;">Multilingual chat & content</li>
            <li style="margin-bottom: 8px;">Analytics and lead dashboard</li>
            <li style="margin-bottom: 8px;">CRM or WhatsApp integration</li>
            <li style="margin-bottom: 8px;">Monthly data reports</li>
            <li style="margin-bottom: 8px;">Technical support & uptime guarantee</li>
            <li style="margin-bottom: 0;">Optional upgrades: Voice calls, RCS, WhatsApp campaigns</li>
          </ul>
        </div>
      </div>`,

      "FAQs": `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; margin-bottom: 30px; font-size: 28px; font-weight: 700; text-align: center;">AI WEBSITES - FREQUENTLY ASKED QUESTIONS</h2>
        
        <div style="margin-bottom: 40px;">
          <h3 style="color: #dc2626; margin-bottom: 20px; font-size: 22px; font-weight: 700; border-bottom: 3px solid #dc2626; padding-bottom: 8px;">General</h3>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q1. What's included in "Monthly Management"?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">We manage your complete digital ecosystem  chat responses, lead handling, analytics tracking, knowledgebase updates, and AI fine-tuning.</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q2. Can the website talk in multiple languages?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Yes  depending on your plan, 2 to 5+ languages are supported (English, Hindi, Marathi, Gujarati, etc.).</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q3. How soon can it go live?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Within 7 working days from receiving your business details.</p>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="color: #7c3aed; margin-bottom: 20px; font-size: 22px; font-weight: 700; border-bottom: 3px solid #7c3aed; padding-bottom: 8px;">Technical</h3>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #8b5cf6;">
            <h4 style="color: #5b21b6; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q4. What platform is used?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Built on WordPress with Troika AI integrations  giving flexibility, security, and performance.</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q5. Will I get admin access?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Yes, complete ownership and backend access are provided.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q6. Is it SEO-friendly?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Yes, it includes keyword-ready structure, Google Analytics setup, and sitemap submission.</p>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="color: #ea580c; margin-bottom: 20px; font-size: 22px; font-weight: 700; border-bottom: 3px solid #ea580c; padding-bottom: 8px;">Integration & Features</h3>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #f97316;">
            <h4 style="color: #c2410c; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q7. Can I connect it with WhatsApp or Telegram?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Absolutely. All Troika AI Websites come pre-integrated with Supa Agent, WhatsApp, Telegram, and optional voice or RCS agents.</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q8. Can I track leads?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Yes  every form, chat, and click is logged in your analytics dashboard.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q9. Can I upgrade my plan later?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Yes  you can move from Basic to Advanced or Premium anytime by paying the difference.</p>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="color: #059669; margin-bottom: 20px; font-size: 22px; font-weight: 700; border-bottom: 3px solid #059669; padding-bottom: 8px;">Pricing & ROI</h3>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q10. Why is there a monthly cost?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Because your website is now an intelligent system, not a static page  monthly maintenance covers AI hosting, chat management, analytics, and updates.</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q11. What is the ROI?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Clients report 2×–6× increase in qualified leads and up to 70% reduction in missed inquiries within the first 60 days.</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 15px;">
            <h4 style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q12. Why Troika Tech?</h4>
            <p style="margin: 0; color: #e0e7ff; font-size: 15px;">Because we deliver complete digital ecosystems  AI Websites + Supa Agent + Analytics  not just templates.</p>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin-top: 30px;">
          <h4 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">Still have questions?</h4>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Our AI assistant is here to help! Ask any specific questions about your business needs.</p>
        </div>
      </div>`,

      "inbound-calling": `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; margin-bottom: 30px; font-size: 28px; font-weight: 700; text-align: center;">INBOUND CALLING AGENT</h2>
        
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; font-size: 22px; font-weight: 700;">24×7 Intelligent Call Handling</h3>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your AI agent never sleeps, never takes breaks, and never misses a call.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📞 Call Reception</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Professional greeting in multiple languages</li>
              <li>Instant call routing to appropriate departments</li>
              <li>Caller identification and verification</li>
              <li>Queue management and hold music</li>
            </ul>
          </div>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🤖 AI Responses</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Natural conversation flow</li>
              <li>Context-aware responses</li>
              <li>FAQ handling and support</li>
              <li>Appointment scheduling</li>
            </ul>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📊 Lead Capture</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Automatic lead qualification</li>
              <li>Contact information collection</li>
              <li>CRM integration</li>
              <li>Follow-up scheduling</li>
            </ul>
          </div>

          <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; border-left: 4px solid #ec4899;">
            <h4 style="color: #be185d; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📈 Analytics</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Call duration tracking</li>
              <li>Conversion rate monitoring</li>
              <li>Customer satisfaction scores</li>
              <li>Performance reports</li>
            </ul>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
          <h4 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">Ready to Never Miss Another Call?</h4>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Let our AI handle your calls while you focus on growing your business.</p>
        </div>
      </div>`,

      "outbound-calling": `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; margin-bottom: 30px; font-size: 28px; font-weight: 700; text-align: center;">OUTBOUND CALLING AGENT</h2>
        
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; font-size: 22px; font-weight: 700;">Proactive Customer Engagement</h3>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Turn your contact list into a revenue-generating machine with AI-powered outbound calls.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #dc2626;">
            <h4 style="color: #991b1b; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📞 Lead Follow-up</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Automatic follow-up calls</li>
              <li>Appointment reminders</li>
              <li>Payment follow-ups</li>
              <li>Customer satisfaction surveys</li>
            </ul>
          </div>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🎯 Sales Calls</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Product/service promotion</li>
              <li>Upselling and cross-selling</li>
              <li>Deal closing assistance</li>
              <li>Objection handling</li>
            </ul>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📅 Campaign Management</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Bulk calling campaigns</li>
              <li>Time zone optimization</li>
              <li>Call scheduling</li>
              <li>Campaign performance tracking</li>
            </ul>
          </div>

          <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; border-left: 4px solid #ec4899;">
            <h4 style="color: #be185d; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📊 Results Tracking</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Call success rates</li>
              <li>Conversion tracking</li>
              <li>ROI measurement</li>
              <li>Detailed analytics</li>
            </ul>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
          <h4 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">Scale Your Sales Efforts</h4>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Let AI make thousands of calls while you focus on closing deals.</p>
        </div>
      </div>`,

      "calling-pricing": `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; margin-bottom: 30px; font-size: 28px; font-weight: 700; text-align: center;">AI CALLING AGENT PRICING</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; position: relative;">
            <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #f59e0b; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600;">MOST POPULAR</div>
            <h3 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">Basic</h3>
            <div style="font-size: 36px; font-weight: 700; margin: 15px 0;">₹15,000</div>
            <div style="opacity: 0.8; margin-bottom: 25px;">per month</div>
            <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ 1,000 calls/month</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ 2 languages</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ Basic analytics</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ Email support</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h3 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">Advanced</h3>
            <div style="font-size: 36px; font-weight: 700; margin: 15px 0;">₹25,000</div>
            <div style="opacity: 0.8; margin-bottom: 25px;">per month</div>
            <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ 5,000 calls/month</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ 5 languages</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ Advanced analytics</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ CRM integration</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ Priority support</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h3 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">Premium</h3>
            <div style="font-size: 36px; font-weight: 700; margin: 15px 0;">₹40,000</div>
            <div style="opacity: 0.8; margin-bottom: 25px;">per month</div>
            <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ Unlimited calls</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ 10+ languages</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ Custom voice training</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ API access</li>
              <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">✓ Dedicated manager</li>
            </ul>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
          <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">What's Included in Every Plan:</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div>✓ 24×7 AI calling agent</div>
            <div>✓ Human-sounding voice</div>
            <div>✓ Lead capture & qualification</div>
            <div>✓ Call recording & analytics</div>
            <div>✓ Multi-language support</div>
            <div>✓ CRM integration</div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
          <h4 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">Ready to Get Started?</h4>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Choose your plan and start making AI-powered calls today!</p>
        </div>
      </div>`,

      "calling-faqs": `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb; margin-bottom: 30px; font-size: 28px; font-weight: 700; text-align: center;">AI CALLING AGENT - FAQs</h2>
        
        <div style="margin-bottom: 40px;">
          <h3 style="color: #dc2626; margin-bottom: 20px; font-size: 22px; font-weight: 700; border-bottom: 3px solid #dc2626; padding-bottom: 8px;">General</h3>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q1. How does the AI calling agent work?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Our AI agent uses advanced voice recognition and natural language processing to have human-like conversations, answer questions, and capture leads automatically.</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q2. Can it handle multiple languages?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Yes! Depending on your plan, our AI agent can speak 2-10+ languages including English, Hindi, Marathi, Gujarati, and more.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q3. What's the setup time?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">We can have your AI calling agent up and running within 3-5 business days after receiving your business details and call scripts.</p>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="color: #7c3aed; margin-bottom: 20px; font-size: 22px; font-weight: 700; border-bottom: 3px solid #7c3aed; padding-bottom: 8px;">Technical</h3>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #8b5cf6;">
            <h4 style="color: #5b21b6; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q4. Can I customize the voice and responses?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Absolutely! We can train the AI with your specific voice, tone, and responses to match your brand perfectly.</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q5. How does it integrate with my existing systems?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Our AI agent integrates seamlessly with popular CRMs, phone systems, and analytics platforms through APIs and webhooks.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q6. What if the AI can't answer a question?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">The AI will politely transfer the call to a human agent or take a message and schedule a callback, ensuring no lead is ever lost.</p>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="color: #ea580c; margin-bottom: 20px; font-size: 22px; font-weight: 700; border-bottom: 3px solid #ea580c; padding-bottom: 8px;">Pricing & ROI</h3>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #f97316;">
            <h4 style="color: #c2410c; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q7. How much can I save with AI calling?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Most businesses save 60-80% on call center costs while increasing lead conversion by 2-3x compared to traditional methods.</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #10b981;">
            <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q8. Can I upgrade or downgrade my plan?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Yes! You can change your plan anytime. Upgrades take effect immediately, and downgrades take effect at the next billing cycle.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Q9. Is there a free trial available?</h4>
            <p style="margin: 0; color: #4b5563; font-size: 15px;">Yes! We offer a 7-day free trial with 100 free calls so you can experience the power of AI calling before committing.</p>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
          <h4 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">Ready to Transform Your Calling?</h4>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Let our AI handle your calls while you focus on growing your business.</p>
        </div>
      </div>`,

      "Overview": `Troika's AI Websites go far beyond traditional web design, They are designed to attract, engage, and convert visitors automatically.<br>

Each site is powered by intelligent automation built to attract visitors, talk to them, capture leads, analyze performance, and help you grow automatically.<br>

Your website becomes a living system that learns from every chat, visit, and click managed end-to-end by Troika Tech.<br>

From AI Knowledgebase to Lead Management, we handle it all for you.<br><br>

🕓 Delivery Time: 7 Days<br>
💬 Support: AI + Human Hybrid<br>
🌐 Integrations: WhatsApp • Telegram • Supa Agent • RCS • Analytics<br><br>


We combine beautiful design, intelligent automation, and integrated chat agents to turn your website into a lead-generating machine powered by AI, driven by data, and perfected by humans.<br>

<br> PROBLEM → SOLUTION → RESULT

<div style="margin: 20px 0; overflow-x: auto;">
  <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <thead>
      <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <th style="padding: 15px; text-align: left; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Problem</th>
        <th style="padding: 15px; text-align: left; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">AI Website Solution</th>
        <th style="padding: 15px; text-align: left; font-weight: 600;">Result</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; font-weight: 500; color: #374151;">Business has a good product but a weak online presence</td>
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; color: #4b5563;">AI-powered professional website with dynamic content and chat integration</td>
        <td style="padding: 15px; vertical-align: top; color: #059669; font-weight: 600;">Builds trust & credibility instantly</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; font-weight: 500; color: #374151;">Visitors browse but don't inquire</td>
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; color: #4b5563;">Built-in AI chat agent captures every lead</td>
        <td style="padding: 15px; vertical-align: top; color: #059669; font-weight: 600;">2×–5× increase in inquiries</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; font-weight: 500; color: #374151;">Team spends time replying manually</td>
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; color: #4b5563;">AI handles FAQs & responses automatically</td>
        <td style="padding: 15px; vertical-align: top; color: #059669; font-weight: 600;">Time saved, faster service</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; font-weight: 500; color: #374151;">You don't know which campaigns work</td>
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; color: #4b5563;">Integrated analytics & CRM show real performance</td>
        <td style="padding: 15px; vertical-align: top; color: #059669; font-weight: 600;">Data-driven marketing decisions</td>
      </tr>
      <tr>
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; font-weight: 500; color: #374151;">Managing updates is complicated</td>
        <td style="padding: 15px; border-right: 1px solid #e5e7eb; vertical-align: top; color: #4b5563;">Troika maintains everything for you monthly</td>
        <td style="padding: 15px; vertical-align: top; color: #059669; font-weight: 600;">Always fresh, always optimized</td>
      </tr>
    </tbody>
  </table>
</div>

`,

      "Why AI Websites Are the Future?": `Traditional websites:

80% of business sites in India are static, brochure-like, and rarely updated.

They fail to capture, engage, or convert visitors.

Owners spend ₹20K–₹50K upfront and get zero ROI because they don't maintain or optimize the site.

AI Vision:

Over 15 crore SMEs in India are online.

Yet fewer than 5% have lead automation, chat AI, or analytics integrated.

AI websites solve this by combining design + automation + data capture into one system.`,
      
      "What makes AI websites different from traditional websites?": `Unlike static, brochure-style websites, AI websites actively capture leads, engage visitors, and provide data-driven insightsall automatically. They combine smart design, automation, and analytics in a single platform.`,

      "How do AI websites help Indian SMEs?": `Over 15 crore SMEs are online, but less than 5% use automation or analytics. AI websites empower businesses to generate leads, automate responses, and track performancemaximizing ROI without constant manual updates.`,

      "Do AI websites improve customer engagement?": `Yes. AI-powered chatbots, personalized interactions, and real-time data capture ensure your visitors stay engaged, increasing the chances of conversions and repeat business.`
    };

    // Check if it's a static FAQ question
    if (staticFAQs[action]) {
      setTimeout(() => {
        const userMessage = { 
          sender: "user", 
          text: action, 
          timestamp: new Date() 
        };
        setCurrentChatHistory([userMessage]); // Direct set, not append
        
        setIsTyping(true);
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: staticFAQs[action],
            timestamp: new Date()
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }, 50);
      return;
    }

    // Check if it's Features suggestion from About page
    if (action === "Features") {
      setTimeout(() => {
        const userMessage = { 
          sender: "user", 
          text: action, 
          timestamp: new Date() 
        };
        setCurrentChatHistory([userMessage]); // Direct set, not append
        
        setIsTyping(true);
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: `**Features**

AI Created. Human Perfected.

Our AI Website isn't a normal website; it's a conversion engine with:

- Auto Lead Capture via chat, forms, and behaviour tracking

- 24x7 Built-in AI Chat that talks in more than 80 languages

- Dynamic SEO Optimization and auto content refresh

- Integrated Analytics Dashboard (visitors, sources, time spent, etc.)

- Appointment Booking, WhatsApp Chat, Blog & Inquiry Tracking

- Custom Industry Tools (e.g., calculators, enquiry forms, quote generators)

> *"We are not selling a website  We are selling a business system that talks, learns, and sells."*`,
            timestamp: new Date()
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }, 50);
      return;
    }

    // Check if it's ROI industry suggestions
    const roiFAQs = {
      "Real Estate": `Replace static property sites with AI that talks to buyers 24x7.

Converts site visitors to verified WhatsApp leads.

Auto-sends property brochures.

📈 **Expected ROI:** 1 sale = ₹5L profit → ₹5K/month is nothing.`,
      
      "Education / Coaching Institutes": `AI Counsellor answers admission queries 24x7.

Collects leads, books demos, and follows up automatically.

📈 **Expected ROI:** Each admission = ₹25K–₹1L; 1 conversion/month pays the yearly fee.`,
      
      "Manufacturing / B2B": `Product inquiry bots handle distributors, dealers, and RFQs.

Auto-replies with catalogues and quote requests.

📈 **Expected ROI:** One converted order = ₹50K+ margin.`,
      
      "Services (Consultants, Lawyers, Hospitals)": `Smart chat captures appointments instantly.

Integrates with WhatsApp & email follow-up.

📈 **Expected ROI:** 2–3 extra clients monthly cover the cost.`
    };

    if (roiFAQs[action]) {
      setTimeout(() => {
        const userMessage = { 
          sender: "user", 
          text: action, 
          timestamp: new Date() 
        };
        setCurrentChatHistory([userMessage]); // Direct set, not append
        
        setIsTyping(true);
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: roiFAQs[action],
            timestamp: new Date()
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }, 50);
      return;
    }

    // Check if it's Pricing suggestion
    if (action === "Pricing") {
      setTimeout(() => {
        const userMessage = { 
          sender: "user", 
          text: action, 
          timestamp: new Date() 
        };
        setCurrentChatHistory([userMessage]); // Direct set, not append
        
        setIsTyping(true);
      setTimeout(() => {
        const botMessage = {
          sender: "bot",
          text: `

AI Website is built for instant replies, 24×7.<br>

• Manage thousands of enquiries during admission season.<br>
• Handle support for multiple departments (Admissions, Placement, Hostel, Courses).<br>
• It will be compatible with All the Devices, CRM & ERP.<br>
• The Delivery will take minimum 3 days to Maximum 7 days to go live.<br>




<style>
  @media (max-width: 768px) {
    .pricing-grid {
      grid-template-columns: 1fr !important;
      gap: 15px !important;
      margin: 15px 0 !important;
      padding: 0 10px !important;
    }
    .pricing-card {
      padding: 20px !important;
      margin-bottom: 15px !important;
      transform: none !important;
    }
    .pricing-header {
      font-size: 16px !important;
      padding: 12px !important;
    }
    .pricing-price {
      font-size: 28px !important;
    }
    .pricing-monthly {
      font-size: 20px !important;
    }
    .pricing-features {
      font-size: 14px !important;
    }
  }
</style>

<div class="pricing-grid" style="
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 20px; 
  margin: 30px 0; 
  max-width: 1200px; 
  margin-left: auto; 
  margin-right: auto;
  width: 100%;
">

  <div class="pricing-card" style="
    background: linear-gradient(145deg, #f8f9fa, #e9ecef);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border: 3px solid #28a745;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  ">
    <div class="pricing-header" style="
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      padding: 15px;
      margin: -30px -30px 20px -30px;
      text-align: center;
      font-weight: 700;
      font-size: 18px;
    ">💎 BASIC PLAN</div>
    
    <div style="text-align: center; margin-bottom: 25px;">
      <div class="pricing-price" style="font-size: 36px; font-weight: 700; color: #28a745; margin-bottom: 5px;">₹50,000</div>
      <div style="color: #6c757d; font-size: 14px;">One-time Setup</div>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
      <div class="pricing-monthly" style="font-size: 24px; font-weight: 600; color: #495057;">₹5,000<span style="font-size: 14px; color: #6c757d;">/month</span></div>
    </div>
    
    <div class="pricing-features" style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
        <span>💬 Chats</span>
        <span style="font-weight: 600;">5,000/month</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
        <span>🌍 Languages</span>
        <span style="font-weight: 600;">2</span>
      </div>
    </div>
    
    <div style="
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      padding: 12px;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
    ">✅ Perfect for small businesses</div>
  </div>

  <div class="pricing-card" style="
    background: linear-gradient(145deg, #f8f9fa, #e9ecef);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
    border: 3px solid #007bff;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    transform: scale(1.05);
  ">
    <div class="pricing-header" style="
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      padding: 15px;
      margin: -30px -30px 20px -30px;
      text-align: center;
      font-weight: 700;
      font-size: 18px;
    ">🚀 ADVANCED PLAN</div>
    
    <div style="text-align: center; margin-bottom: 25px;">
      <div class="pricing-price" style="font-size: 36px; font-weight: 700; color: #007bff; margin-bottom: 5px;">₹75,000</div>
      <div style="color: #6c757d; font-size: 14px;">One-time Setup</div>
    </div>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
      <div class="pricing-monthly" style="font-size: 24px; font-weight: 600; color: #007bff;">₹7,500<span style="font-size: 14px; color: #6c757d;">/month</span></div>
    </div>
    
    <div class="pricing-features" style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
        <span>💬 Chats</span>
        <span style="font-weight: 600;">10,000/month</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
        <span>🌍 Languages</span>
        <span style="font-weight: 600;">3-4</span>
      </div>
    </div>
    
    <div style="
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      padding: 12px;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
    ">✅ Ideal for growing companies</div>
  </div>

  <div class="pricing-card" style="
    background: linear-gradient(145deg, #f8f9fa, #e9ecef);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border: 3px solid #ffc107;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  ">
    <div class="pricing-header" style="
      background: linear-gradient(135deg, #ffc107, #ff8f00);
      color: white;
      padding: 15px;
      margin: -30px -30px 20px -30px;
      text-align: center;
      font-weight: 700;
      font-size: 18px;
    ">👑 PREMIUM PLAN</div>
    
    <div style="text-align: center; margin-bottom: 25px;">
      <div class="pricing-price" style="font-size: 36px; font-weight: 700; color: #ffc107; margin-bottom: 5px;">₹1,00,000</div>
      <div style="color: #6c757d; font-size: 14px;">One-time Setup</div>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
      <div class="pricing-monthly" style="font-size: 24px; font-weight: 600; color: #ffc107;">₹10,000<span style="font-size: 14px; color: #6c757d;">/month</span></div>
    </div>
    
    <div class="pricing-features" style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
        <span>💬 Chats</span>
        <span style="font-weight: 600;">15,000/month</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
        <span>🌍 Languages</span>
        <span style="font-weight: 600;">5+</span>
      </div>
    </div>
    
    <div style="
      background: linear-gradient(135deg, #ffc107, #ff8f00);
      color: white;
      padding: 12px;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
    ">✅ Best for large enterprises</div>
  </div>

</div>

<div style="
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin: 30px 0;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  color: white;
">
  <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; text-align: center;">📋 What's Included in ₹5,000/month</h3>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
      <div style="font-weight: 600; margin-bottom: 8px;"> AI Chat Hosting - ₹1,500</div>
      <div style="font-size: 14px; opacity: 0.9;">Server + cloud AI infrastructure</div>
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
      <div style="font-weight: 600; margin-bottom: 8px;"> Lead Analytics & Dashboard - ₹1,000</div>
      <div style="font-size: 14px; opacity: 0.9;">Behavior tracking + conversion insights</div>
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
      <div style="font-weight: 600; margin-bottom: 8px;"> Content Optimization & SEO - ₹1,000</div>
      <div style="font-size: 14px; opacity: 0.9;">Monthly keyword updates + content refresh</div>
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
      <div style="font-weight: 600; margin-bottom: 8px;"> Maintenance & Security - ₹500</div>
      <div style="font-size: 14px; opacity: 0.9;">Backups, uptime monitoring, feature updates</div>
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
      <div style="font-weight: 600; margin-bottom: 8px;"> Premium Support - ₹1,000</div>
      <div style="font-size: 14px; opacity: 0.9;">Human helpdesk + performance audits</div>
    </div>
  </div>
  
  <div style="
    background: rgba(255,255,255,0.2);
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    margin-top: 20px;
    font-size: 18px;
    font-weight: 600;
  ">💡 Total Value = ₹5,000+ / month</div>
</div>

<div style="
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  font-style: italic;
  font-size: 16px;
  margin: 20px 0;
  box-shadow: 0 10px 25px rgba(255,107,107,0.3);
">
💬 You're not paying for maintenance; you're paying for 24x7 AI marketing that works while you sleep.
</div>`,
          timestamp: new Date()
        };
        setCurrentChatHistory((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);
      }, 50);
      return;
    }

    // Check if it's Sales suggestions
    const salesFAQs = {
      "What offer you have?": `<div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        color: white;
        text-align: center;
      ">
        <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">🎯 Special Offer Package</h2>
      </div>

      <div style="
        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        border-radius: 20px;
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      ">
        <h3 style="color: #495057; margin-bottom: 20px; font-size: 20px;">💰 Pricing</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="background: #e3f2fd; padding: 20px; border-radius: 15px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #1976d2;">₹50,000</div>
            <div style="color: #666; font-size: 14px;">Setup (One-time AI Website)</div>
          </div>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 15px; text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: #2e7d32;">₹5,000/month</div>
            <div style="color: #666; font-size: 14px;">AI System + Maintenance</div>
          </div>
        </div>
      </div>

      <div style="
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        border-radius: 20px;
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 15px 35px rgba(255,107,107,0.3);
        color: white;
      ">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">🎁 Bonuses for Closing Deals</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <div style="font-weight: 600; margin-bottom: 5px;">1 Month Free</div>
            <div style="font-size: 14px; opacity: 0.9;">AI Premium Subscription</div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <div style="font-weight: 600; margin-bottom: 5px;">Free Lead Analytics</div>
            <div style="font-size: 14px; opacity: 0.9;">Dashboard</div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
            <div style="font-weight: 600; margin-bottom: 5px;">₹2,500 Discount</div>
            <div style="font-size: 14px; opacity: 0.9;">Additional Page/Tab</div>
          </div>
        </div>
      </div>

      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        color: white;
        display: none;
      ">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; text-align: center;">💬 Objection Handling</h3>
        
        <div style="display: grid; gap: 15px;">
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
            <div style="font-weight: 600; margin-bottom: 10px; color: #ffeb3b;">"₹5,000 is high"</div>
            <div style="font-size: 14px; opacity: 0.9;">That's ₹166 per day  less than one cup of coffee. It gives you an AI team working 24x7.</div>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
            <div style="font-weight: 600; margin-bottom: 10px; color: #ffeb3b;">"I already have a website"</div>
            <div style="font-size: 14px; opacity: 0.9;">Perfect  but is it generating daily leads? We'll convert your old site into a live salesperson.</div>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
            <div style="font-weight: 600; margin-bottom: 10px; color: #ffeb3b;">"We don't need AI"</div>
            <div style="font-size: 14px; opacity: 0.9;">You already use AI daily  in WhatsApp replies, Google Maps, and voice search. Why not use it to grow business?</div>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
            <div style="font-weight: 600; margin-bottom: 10px; color: #ffeb3b;">"We'll think about it later"</div>
            <div style="font-size: 14px; opacity: 0.9;">Every day delayed is a day of lost leads. We can start with a 1-month trial and prove ROI.</div>
          </div>
        </div>
      </div>

      <div style="
        background: linear-gradient(135deg, #4caf50, #2e7d32);
        color: white;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        margin: 20px 0;
        box-shadow: 0 10px 25px rgba(76,175,80,0.3);
      ">
        🚀 Ready to close the deal?
      </div>`,
      
      "How much discount I can Get?": `<div style="
        background: linear-gradient(135deg, #ff9800, #f57c00);
        border-radius: 20px;
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 20px 40px rgba(255,152,0,0.3);
        color: white;
        text-align: center;
      ">
        <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">💸 Discount Information</h2>
        <div style="
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
        ">
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">This information will be provided soon. Please check back later for available discounts and special offers.</p>
        </div>
        <div style="
          background: rgba(255,255,255,0.2);
          padding: 15px;
          border-radius: 10px;
          font-weight: 600;
        ">
          📞 Contact us for personalized discount offers!
        </div>
      </div>`
    };

    if (salesFAQs[action]) {
      setTimeout(() => {
        const userMessage = { 
          sender: "user", 
          text: action, 
          timestamp: new Date() 
        };
        setCurrentChatHistory([userMessage]); // Direct set, not append
        
        setIsTyping(true);
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: salesFAQs[action],
            timestamp: new Date()
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }, 50);
      return;
    }

    // Check if it's Marketing suggestion
    const marketingFAQs = {
      "Marketing": `<div style="
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      ">
        <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #1f2937; text-align: center;">AI Marketing Solutions</h2>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #374151; margin-bottom: 10px; font-size: 18px; font-weight: 600;">The Problem with Most Websites</h3>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
            Most websites in India are sleeping  they look good but don't sell.
          </p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #374151; margin-bottom: 10px; font-size: 18px; font-weight: 600;">Our AI Solution</h3>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
            Our AI Websites don't just look great  they talk, capture leads, and convert visitors automatically.
          </p>
        </div>
        
        <div style="
          background: #f3f4f6;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 20px 0;
        ">
          <p style="margin: 0; font-size: 16px; color: #1f2937; font-weight: 500;">
            For just <strong>₹5,000 a month</strong>, you get a 24x7 AI team managing your business online.
          </p>
        </div>
      </div>

      <div style="
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 30px;
        margin: 20px 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      ">
        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Follow Us on Social Media</h3>
        
        <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
          <a href="https://www.facebook.com/troikatechservices" target="_blank" style="
            background: #3b82f6;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          " onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">
            <span>📘</span> Facebook
          </a>
          
          <a href="https://instagram.com/troikatech" target="_blank" style="
            background: #e11d48;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          " onmouseover="this.style.backgroundColor='#be123c'" onmouseout="this.style.backgroundColor='#e11d48'">
            <span>📷</span> Instagram
          </a>
          
          <a href="https://youtube.com/@troikatech" target="_blank" style="
            background: #dc2626;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          " onmouseover="this.style.backgroundColor='#b91c1c'" onmouseout="this.style.backgroundColor='#dc2626'">
            <span>📺</span> YouTube
          </a>
          
          <a href="https://linkedin.com/company/troikatech" target="_blank" style="
            background: #0a66c2;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          " onmouseover="this.style.backgroundColor='#004182'" onmouseout="this.style.backgroundColor='#0a66c2'">
            <span>💼</span> LinkedIn
          </a>
          
          <a href="https://twitter.com/troikatech" target="_blank" style="
            background: #1da1f2;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          " onmouseover="this.style.backgroundColor='#0d8bd9'" onmouseout="this.style.backgroundColor='#1da1f2'">
            <span>🐦</span> Twitter
          </a>
        </div>
      </div>`
    };

    if (marketingFAQs[action]) {
      setTimeout(() => {
        const userMessage = { 
          sender: "user", 
          text: action, 
          timestamp: new Date() 
        };
        setCurrentChatHistory([userMessage]); // Direct set, not append
        
        setIsTyping(true);
        setTimeout(() => {
          const botMessage = {
            sender: "bot",
            text: marketingFAQs[action],
            timestamp: new Date()
          };
          setCurrentChatHistory((prev) => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }, 50);
      return;
    }
    
    // Fallback for other actions
    const suggestionMessages = {
      'programs': 'What Programs Does ITM Offer?',
      'placements': 'How Are Placements at ITM Business School?',
      'global': 'Does ITM Provide Global Study Opportunities?',
      'campus': 'What Is Campus Life Like at ITM Kharghar?'
    };
    
    const message = suggestionMessages[action] || 'Tell me more about this';
    setTimeout(() => {
      handleSendMessage(message);
    }, 50);
  }, [handleSendMessage]);

  // Handler for suggestion buttons from bot responses
  const handleBotSuggestionClick = useCallback((suggestion) => {
    console.log('Bot suggestion clicked:', suggestion);
    setShowWelcome(false);
    
    // Handle conversational flow suggestions
    if (typeof suggestion === 'object' && suggestion.action) {
      // Handle conversational flow actions for all services
      if (suggestion.action.startsWith('telegram-') || suggestion.action.startsWith('back-to-telegram') ||
          suggestion.action.startsWith('whatsapp-') || suggestion.action.startsWith('back-to-whatsapp') ||
          suggestion.action.startsWith('calling-') || suggestion.action.startsWith('back-to-calling') ||
          suggestion.action.startsWith('websites-') || suggestion.action.startsWith('back-to-websites')) {
        // Import the conversational flow data from WelcomeSection
        const telegramConversationalFlow = {
          "telegram-overview": {
            initialMessage: "📱 **AI Telegram Agent - Overview**\n\nThe AI Telegram Agent from Troika Tech is your intelligent digital executive designed to handle customer chats, share product info, qualify leads, and manage communities automatically.\n\nIt blends AI conversation, instant messaging, and data intelligence inside your official Telegram channel or bot - perfect for businesses that value speed, security, and automation.",
            suggestions: [
              { text: "What problems does it solve?", action: "telegram-problems" },
              { text: "What are the key features?", action: "telegram-features" },
              { text: "How does it work?", action: "telegram-how-it-works" },
              { text: "Back to main menu", action: "back-to-telegram-main" }
            ]
          },
          "telegram-problems": {
            message: "🔹 **Common Business Problems**\n\n**Delayed Responses**\nCustomers message on Telegram but get delayed responses\n\n**Group Management**\nManaging large Telegram groups or channels is tough\n\n**Repetitive Queries**\nTeams waste time replying to repetitive queries\n\n**Lost Leads**\nYou lose potential leads due to untracked inquiries\n\n**No Central Control**\nNo central control or data from Telegram chats",
            suggestions: [
              { text: "What are the solutions?", action: "telegram-solutions" },
              { text: "Show key features", action: "telegram-features" },
              { text: "Back to overview", action: "telegram-overview" }
            ]
          },
          "telegram-solutions": {
            message: "✅ **Solutions with AI Telegram Agent**\n\n**Instant Replies**\nAI replies instantly with the right information and tone\n\n**Smart Moderation**\nAI moderates chats, answers FAQs, and filters spam\n\n**Automated Handling**\nAI handles FAQs and data requests automatically\n\n**Lead Capture**\nAI collects names, numbers, and requirements automatically\n\n**Data Sync**\nAI syncs all data with CRM or email dashboards",
            suggestions: [
              { text: "Show key features", action: "telegram-features" },
              { text: "How does it work?", action: "telegram-how-it-works" },
              { text: "Back to overview", action: "telegram-overview" }
            ]
          },
          "telegram-features": {
            message: "✨ **Key Features**\n\n**24×7 Smart Replies**\nHandles all inquiries anytime\n\n**Multilingual Conversations**\nReplies in Hindi, English, Marathi, Gujarati, and 20+ languages\n\n**AI Understanding**\nDetects intent, mood, and urgency\n\n**Lead Capture & Reporting**\nAuto-saves user data and exports to CRM or Google Sheets\n\n**Seamless Integration**\nWorks with your website, CRM, WhatsApp, or Supa Agent ecosystem\n\n**Group Management**\nAuto-welcomes new users, filters spam, and enforces rules\n\n**Broadcasting**\nSends automated updates, offers, and announcements to subscribers",
            suggestions: [
              { text: "How does it work?", action: "telegram-how-it-works" },
              { text: "What's the pricing?", action: "telegram-pricing" },
              { text: "Back to overview", action: "telegram-overview" }
            ]
          },
          "telegram-how-it-works": {
            message: "⚙️ **How It Works**\n\n**Step 1: Setup**\nWe create your custom Telegram bot and train it on your business data\n\n**Step 2: Integration**\nConnect it to your Telegram channel or group\n\n**Step 3: Automation**\nThe AI automatically responds to messages, moderates groups, and captures leads\n\n**Step 4: Analytics**\nAll data is synced to your dashboard for easy tracking and follow-up\n\n**Ready to transform your Telegram business?**\nGet your AI Telegram Agent up and running in just 48 hours. No technical knowledge required - we handle everything from setup to training.",
            suggestions: [
              { text: "What's the pricing?", action: "telegram-pricing" },
              { text: "Any FAQs?", action: "telegram-faqs" },
              { text: "Back to overview", action: "telegram-overview" }
            ]
          },
          "telegram-pricing": {
            initialMessage: "💰 **AI Telegram Agent - Pricing Structure**\n\nOur AI Telegram Agent pricing is designed to be transparent and cost-effective. We offer a one-time setup fee plus usage-based pricing that scales with your business needs.\n\n**Key Benefits of Our Pricing:**\n\n**No Hidden Costs**\nEverything is clearly outlined\n\n**Pay Only for What You Use**\nUsage-based chat pricing\n\n**Scalable**\nGrows with your business\n\n**ROI-Focused**\nSave more than you spend\n\n**Pricing Overview:**\n\n**One-Time Setup: ₹1,00,000**\nComplete bot creation, training, and deployment\n\n**Monthly Costs:**\n\n**Maintenance**\n₹5,000/month per bot\n\n**Usage**\n₹1 per active chat\n\n**Languages**\n2 included, ₹2,500 per additional language\n\n**Ready to see the detailed pricing table?**",
            suggestions: [
              { text: "Show detailed pricing table", action: "telegram-pricing-table" },
              { text: "What's included in setup?", action: "telegram-setup-details" },
              { text: "How is pricing calculated?", action: "telegram-pricing-breakdown" },
              { text: "Back to main menu", action: "back-to-telegram-main" }
            ]
          },
          "telegram-pricing-table": {
            message: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 100%;">
        <h2 style="color: #2563eb; margin-bottom: 20px; font-size: 24px; font-weight: 700; text-align: center;">🤖 AI Telegram Agent - Complete Pricing Structure</h2>
        
        <div style="margin: 20px 0; overflow-x: auto; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 16px; text-align: left; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Component</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Type</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Price</th>
                <th style="padding: 16px; text-align: center; font-weight: 600; border-right: 1px solid rgba(255,255,255,0.2);">Included</th>
                <th style="padding: 16px; text-align: left; font-weight: 600;">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">🎨 Bot Design & AI Training</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 14px;">One-time</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 700; font-size: 18px;">₹1,00,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 600;">✅</td>
                <td style="padding: 16px; color: #6b7280; font-size: 14px;">Custom bot creation, AI model training, brand tone customization</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">🔗 API Integration</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 14px;">One-time</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 700; font-size: 18px;">Included</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 600;">✅</td>
                <td style="padding: 16px; color: #6b7280; font-size: 14px;">Telegram API setup, webhook configuration, token management</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">🌍 Multilingual Setup</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 14px;">One-time</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 700; font-size: 18px;">2 Languages</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 600;">✅</td>
                <td style="padding: 16px; color: #6b7280; font-size: 14px;">Hindi + English included, additional languages at extra cost</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">📊 CRM Integration</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 14px;">One-time</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 700; font-size: 18px;">Included</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 600;">✅</td>
                <td style="padding: 16px; color: #6b7280; font-size: 14px;">Google Sheets, Zoho, HubSpot, or custom CRM integration</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">🧪 Testing & Deployment</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 700; font-size: 14px;">One-time</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 700; font-size: 18px;">Included</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 600;">✅</td>
                <td style="padding: 16px; color: #6b7280; font-size: 14px;">Complete testing, QA, and deployment to your Telegram channel</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">⚙️ Monthly Maintenance</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #f59e0b; font-weight: 700; font-size: 14px;">Monthly</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 700; font-size: 18px;">₹5,000</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 600;">✅</td>
                <td style="padding: 16px; color: #6b7280; font-size: 14px;">Server hosting, updates, API maintenance, technical support</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">💬 Chat Usage</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #f59e0b; font-weight: 700; font-size: 14px;">Per Chat</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 700; font-size: 18px;">₹1</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #f59e0b; font-weight: 600;">❌</td>
                <td style="padding: 16px; color: #6b7280; font-size: 14px;">Only charged for active conversations (not messages)</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; font-weight: 700; color: #374151; font-size: 16px;">🌐 Additional Languages</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #f59e0b; font-weight: 700; font-size: 14px;">Per Language</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #dc2626; font-weight: 700; font-size: 18px;">₹2,500</td>
                <td style="padding: 16px; border-right: 1px solid #e5e7eb; text-align: center; color: #f59e0b; font-weight: 600;">❌</td>
                <td style="padding: 16px; color: #6b7280; font-size: 14px;">Each additional language beyond Hindi and English</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin-bottom: 15px; font-size: 18px; font-weight: 700;">💡 Pricing Summary</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-weight: 700; color: #0c4a6e; margin-bottom: 5px;">One-Time Setup</div>
              <div style="font-size: 24px; font-weight: 700; color: #dc2626;">₹1,00,000</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-weight: 700; color: #0c4a6e; margin-bottom: 5px;">Monthly Minimum</div>
              <div style="font-size: 24px; font-weight: 700; color: #dc2626;">₹5,000</div>
            </div>
          </div>
          <p style="color: #0c4a6e; font-size: 14px; margin: 0; font-style: italic;">* Plus usage charges (₹1 per active chat) and any additional language costs</p>
        </div>
        
        <div style="background: rgba(34, 197, 94, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
          <div style="font-weight: 700; color: #166534; margin-bottom: 8px; display: flex; align-items: center;">
            <span style="margin-right: 8px; font-size: 18px;">✅</span>No Hidden Costs
          </div>
          <div style="color: #166534; font-size: 14px;">All prices are transparent and include taxes. No setup fees beyond the one-time cost.</div>
        </div>
      </div>`,
            suggestions: [
              { text: "What's included in setup?", action: "telegram-setup-details" },
              { text: "How is pricing calculated?", action: "telegram-pricing-breakdown" },
              { text: "Compare with manual handling", action: "telegram-comparison" },
              { text: "Back to pricing overview", action: "telegram-pricing" }
            ]
          },
          "telegram-setup-details": {
            message: "🔧 **Setup Fee Includes**\n\n**AI Voice & Text Model Training**\nTrained to understand your brand tone, FAQs, and customer queries\n\n**Telegram API Integration**\nSecure bot setup, webhook linking, and token management\n\n**Data & CRM Sync Setup**\nAuto-push lead data to Google Sheets, CRM, or dashboards\n\n**Flow Design & UI**\nCreating intuitive conversational flows with buttons, menus, and CTAs\n\n**Testing & Deployment**\nMulti-device, multi-language QA testing before launch",
            suggestions: [
              { text: "How is pricing calculated?", action: "telegram-pricing-breakdown" },
              { text: "Compare with manual handling", action: "telegram-comparison" },
              { text: "Back to pricing", action: "telegram-pricing" }
            ]
          },
          "telegram-pricing-breakdown": {
            message: "💡 **Price Justification**\n\n**Why these costs?**\n\n**AI Model Design**\nTraining custom NLP on your business FAQs, tone, and keywords\n\n**Integration Setup**\nLinking WhatsApp API, website forms, payment gateway, and CRM\n\n**UI/UX & Flow Design**\nCreating branded chat experiences with visuals, emojis, and flowcharts\n\n**Testing & Fine-Tuning**\nEnsuring accuracy, context handling, and fallback responses\n\n**Maintenance**\n24×7 hosting, updates, and technical support\n\n**Result**: You get a smart Telegram agent that engages, qualifies, and converts users 24×7 without adding staff or complexity.",
            suggestions: [
              { text: "Compare with manual handling", action: "telegram-comparison" },
              { text: "Show ROI", action: "telegram-results" },
              { text: "Back to pricing", action: "telegram-pricing" }
            ]
          },
          "telegram-comparison": {
            message: "⚖️ **Benefits Over Manual Telegram Handling**\n\n| Aspect | Human Operator | AI Telegram Agent |\n|--------|----------------|-------------------|\n| Availability | 8 hours/day | 24×7 |\n| Response Speed | Minutes to hours | Instant |\n| Accuracy | Varies | 100% Consistent |\n| Handling Capacity | 1:1 | 1:Unlimited |\n| Multilingual Support | Limited | 20+ Languages |\n| Reporting | Manual | Automated |\n| Monthly Cost | ₹25k–₹40k | ₹5k + usage |",
            suggestions: [
              { text: "Show ROI", action: "telegram-results" },
              { text: "Any FAQs?", action: "telegram-faqs" },
              { text: "Back to pricing", action: "telegram-pricing" }
            ]
          },
          "telegram-faqs": {
            initialMessage: "❓ **AI Telegram Agent - FAQs**\n\nHere are the most frequently asked questions about our AI Telegram Agent. Choose a topic you'd like to know more about:",
            suggestions: [
              { text: "What is an AI Telegram Agent?", action: "telegram-faq-general" },
              { text: "How does it work technically?", action: "telegram-faq-technical" },
              { text: "What are the costs?", action: "telegram-faq-costs" },
              { text: "Back to main menu", action: "back-to-telegram-main" }
            ]
          },
          "telegram-faq-general": {
            message: "🤖 **What is an AI Telegram Agent?**\n\nAn AI Telegram Agent is a custom-built AI bot that chats naturally with users on Telegram. It's designed to:\n\n• Answer customer questions automatically\n• Handle inquiries 24/7\n• Collect leads and customer information\n• Provide instant responses in multiple languages\n• Integrate with your existing business systems\n\n**Is it officially approved by Telegram?**\nYes! It uses the official Telegram Bot API, ensuring full compliance and stability.\n\n**Do I need coding knowledge?**\nNo. Troika handles the complete setup - you get a ready-to-use dashboard.",
            suggestions: [
              { text: "How does it work technically?", action: "telegram-faq-technical" },
              { text: "What are the costs?", action: "telegram-faq-costs" },
              { text: "Back to FAQs", action: "telegram-faqs" }
            ]
          },
          "telegram-faq-technical": {
            message: "⚙️ **How does it work technically?**\n\n**Setup Process:**\n\n**Bot Creation**\nWe create your custom Telegram bot\n\n**Data Training**\nTrain it on your business data and FAQs\n\n**Channel Integration**\nConnect it to your Telegram channel/group\n\n**Language Configuration**\nConfigure multilingual support\n\n**Features:**\n\n**Chat Handling**\nHandles both private chats and group messages\n\n**Spam Protection**\nDetects and filters spam automatically\n\n**Media Support**\nSends media, videos, and documents\n\n**Interactive Elements**\nSupports interactive buttons and menus\n\n**Language Switching**\nSwitches between languages automatically\n\n**Integration:**\n\n**CRM Integration**\nWorks with WhatsApp and your CRM\n\n**Broadcasting**\nBroadcasts messages to users\n\n**Lead Management**\nCollects and exports lead data\n\n**Data Sync**\nSyncs with Google Sheets, Zoho, HubSpot",
            suggestions: [
              { text: "What are the costs?", action: "telegram-faq-costs" },
              { text: "Is it secure?", action: "telegram-faq-security" },
              { text: "Back to FAQs", action: "telegram-faqs" }
            ]
          },
          "telegram-faq-costs": {
            message: "💰 **What are the costs?**\n\n**Setup Fee: ₹1,00,000 (One-time)**\nIncludes:\n\n**Bot Design & AI Training**\nCustom bot creation and AI model training\n\n**Brand Tone Customization**\nTailored to match your brand voice\n\n**Multilingual Setup**\nConfigure multiple language support\n\n**CRM/API Integration**\nConnect with your existing systems\n\n**Testing and Deployment**\nComplete testing and launch support\n\n**Monthly Costs:**\n\n**Maintenance**\n₹5,000/month per bot\n\n**Usage**\n₹1 per chat (only active conversations)\n\n**Extra Languages**\n₹2,500 each\n\n**What's included in maintenance?**\n\n**Server Hosting & Analytics**\n24/7 hosting and performance tracking\n\n**Version Upgrades & Updates**\nRegular feature updates and improvements\n\n**Telegram API Maintenance**\nAPI monitoring and optimization\n\n**Technical Support**\nOngoing technical assistance\n\n**Is ₹1/chat fixed?**\nYes, but discounted bundles available for higher volumes.",
            suggestions: [
              { text: "Is it secure?", action: "telegram-faq-security" },
              { text: "Why choose Telegram?", action: "telegram-why-telegram" },
              { text: "Back to FAQs", action: "telegram-faqs" }
            ]
          },
          "telegram-faq-security": {
            message: "🔒 **Is it secure?**\n\n**100% Secure!**\n\n**Data Encryption**\nAll data and chats are encrypted\n\n**Private Servers**\nStored on private, secure servers\n\n**Compliance**\nComplies with data protection regulations\n\n**No Data Sharing**\nNo data sharing with third parties\n\n**Privacy Features:**\n\n**Customer Data Protection**\nCustomer data is protected\n\n**Confidential Conversations**\nConversations are confidential\n\n**Secure API Connections**\nSecure API connections\n\n**Regular Security Updates**\nRegular security updates\n\n**Why choose Telegram?**\n\n**Business Popularity**\nExtremely popular in business and trading\n\n**Higher Engagement**\nHigher engagement than email/websites\n\n**Easy Connection**\nEasy to connect via QR codes or links\n\n**Lightweight & Fast**\nLightweight and fast\n\n**Perfect for Automation**\nPerfect for automation",
            suggestions: [
              { text: "Why choose Telegram?", action: "telegram-why-telegram" },
              { text: "How to get started?", action: "telegram-get-started" },
              { text: "Back to FAQs", action: "telegram-faqs" }
            ]
          },
          "telegram-why-telegram": {
            message: "💡 **Why Telegram?**\n\n**Business Popularity**\nExtremely popular in business, trading, crypto, and community spaces\n\n**Higher Engagement Rate**\nHigher engagement rate than email or websites\n\n**Easy Connection**\nEasy to connect via QR codes, links, or website embeds\n\n**Lightweight & Rich Media**\nLightweight, fast, and supports rich media - perfect for automation",
            suggestions: [
              { text: "Show results", action: "telegram-results" },
              { text: "Back to FAQs", action: "telegram-faqs" }
            ]
          },
          "telegram-results": {
            initialMessage: "📊 **AI Telegram Agent - Results**\n\n🎯 **FINAL RESULT**\nWith Troika's AI Telegram Agent, your business gains:\n\n**⚡ Instant chat automation**\nResponds to customers immediately, 24/7\n\n**📈 Real-time lead capture**\nAutomatically collects and saves customer information\n\n**🌍 Multilingual customer handling**\nServes customers in 20+ languages seamlessly\n\n**🛡️ Smart community moderation**\nAutomatically manages groups and filters spam\n\n**📊 Integrated analytics and CRM sync**\nTracks performance and syncs data with your systems\n\n*\"Let your Telegram channel become your 24×7 digital office - powered by Troika AI.\"*",
            suggestions: [
              { text: "What's the ROI?", action: "telegram-roi" },
              { text: "How to get started?", action: "telegram-get-started" },
              { text: "Back to main menu", action: "back-to-telegram-main" }
            ]
          },
          "telegram-roi": {
            message: "📈 **ROI: 1 AI Telegram Agent = 10 Human Operators**\n\n**Save ₹3–5 Lakhs/year** in manpower + boost customer engagement.\n\n**Key Benefits:**\n\n**24×7 availability**\nvs 8 hours/day human operators\n\n**Instant responses**\nvs minutes to hours\n\n**100% consistent accuracy**\nvs varying human performance\n\n**Unlimited handling capacity**\nvs 1:1 human ratio\n\n**20+ languages**\nvs limited human language skills\n\n**Automated reporting**\nvs manual tracking",
            suggestions: [
              { text: "How to get started?", action: "telegram-get-started" },
              { text: "Back to results", action: "telegram-results" }
            ]
          },
          "telegram-get-started": {
            message: "🚀 **Ready to Get Started?**\n\n**Next Steps:**\n\n**Step 1: Contact us**\nfor a free consultation\n\n**Step 2: Share your requirements**\nwe'll customize the solution\n\n**Step 3: 48-hour setup**\nwe handle everything\n\n**Step 4: Go live**\nwith your AI Telegram Agent\n\n**No technical knowledge required** - we handle everything from setup to training!",
            suggestions: [
              { text: "Contact now", action: "contact-us" },
              { text: "Back to results", action: "telegram-results" }
            ]
          },
          "back-to-telegram-main": {
            message: "📱 **AI Telegram Agent**\n\nChoose what you'd like to know more about:",
            suggestions: [
              { text: "Overview", action: "telegram-overview" },
              { text: "Pricing", action: "telegram-pricing" },
              { text: "FAQs", action: "telegram-faqs" },
              { text: "Results", action: "telegram-results" }
            ]
          }
        };
        
        // Add other conversational flows
        const whatsappConversationalFlow = {
          "whatsapp-overview": {
            initialMessage: "📱 **AI WhatsApp Agent - Overview**\n\nYour customers already use WhatsApp - so why not let your business do the same, intelligently?\n\nOur AI WhatsApp Agent automates customer conversations, answers FAQs, shares product details, books appointments, and collects leads - all through a familiar chat interface.\n\nBuilt using Troika's proprietary AI engine, it's custom-trained on your business data, brand tone, and FAQs - responding instantly in multiple languages, 24×7.",
            suggestions: [
              { text: "What problems does it solve?", action: "whatsapp-problems" },
              { text: "What are the key features?", action: "whatsapp-features" },
              { text: "How does it work?", action: "whatsapp-how-it-works" },
              { text: "Back to main menu", action: "back-to-whatsapp-main" }
            ]
          },
          "whatsapp-problems": {
            message: "🔹 **Common Business Problems**\n\n**Delayed Responses**\nCustomers message after office hours, but no one replies\n\n**Human Errors**\nHuman team takes time to respond or makes mistakes\n\n**Missed Leads**\nYou spend heavily on social media but don't capture leads\n\n**Repetitive Work**\nFAQs and inquiries waste employee time\n\n**Poor Follow-up**\nYou struggle to follow up with all leads",
            suggestions: [
              { text: "What are the solutions?", action: "whatsapp-solutions" },
              { text: "Show key features", action: "whatsapp-features" },
              { text: "Back to overview", action: "whatsapp-overview" }
            ]
          },
          "whatsapp-solutions": {
            message: "✅ **Solutions with AI WhatsApp Agent**\n\n**Instant Replies**\nAI replies instantly with correct information\n\n**100% Accuracy**\nAI handles chats instantly, 100% accuracy\n\n**Auto Lead Capture**\nWhatsApp Agent auto-converts visitors into chats & leads\n\n**Automated FAQs**\nAI answers repetitive questions automatically\n\n**Smart Follow-up**\nAI follows up automatically via pre-set workflows",
            suggestions: [
              { text: "Show key features", action: "whatsapp-features" },
              { text: "How does it work?", action: "whatsapp-how-it-works" },
              { text: "Back to overview", action: "whatsapp-overview" }
            ]
          },
          "whatsapp-features": {
            message: "✨ **Key Features**\n\n**24×7 Availability**\nNever miss a message, even at midnight\n\n**Human-like Conversations**\nCustom-trained tone, emojis, and smart understanding\n\n**Multilingual Support**\nHindi, English, Marathi, Gujarati, Tamil & 20+ languages\n\n**CRM Integration**\nAuto-save leads and export to Excel, email, or dashboard\n\n**Automated Notifications**\nSends offers, reminders, and payment links\n\n**Website & Ads Integration**\nDirectly link chats from websites, ads, or QR codes\n\n**Smart Routing**\nEscalates to real staff for complex queries",
            suggestions: [
              { text: "How does it work?", action: "whatsapp-how-it-works" },
              { text: "What's the pricing?", action: "whatsapp-pricing" },
              { text: "Back to overview", action: "whatsapp-overview" }
            ]
          },
          "whatsapp-how-it-works": {
            message: "⚙️ **How It Works**\n\n**Step 1: Setup**\nWe create your custom WhatsApp bot and train it on your business data\n\n**Step 2: Integration**\nConnect it to your WhatsApp Business API\n\n**Step 3: Automation**\nThe AI automatically responds to messages, captures leads, and handles inquiries\n\n**Step 4: Analytics**\nAll data is synced to your dashboard for easy tracking and follow-up\n\n**Ready to transform your WhatsApp business?**\nGet your AI WhatsApp Agent up and running in just 48 hours. No technical knowledge required - we handle everything from setup to training.",
            suggestions: [
              { text: "What's the pricing?", action: "whatsapp-pricing" },
              { text: "Any FAQs?", action: "whatsapp-faqs" },
              { text: "Back to overview", action: "whatsapp-overview" }
            ]
          },
          "whatsapp-pricing": {
            initialMessage: "💰 **AI WhatsApp Agent - Pricing Structure**\n\nOur AI WhatsApp Agent pricing is designed to be transparent and cost-effective. We offer a one-time setup fee plus usage-based pricing that scales with your business needs.\n\n**Key Benefits of Our Pricing:**\n\n**No Hidden Costs**\nEverything is clearly outlined\n\n**Pay Only for What You Use**\nUsage-based chat pricing\n\n**Scalable**\nGrows with your business\n\n**ROI-Focused**\nSave more than you spend\n\n**Pricing Overview:**\n\n**One-Time Setup: ₹1,00,000**\nComplete bot creation, training, and deployment\n\n**Monthly Costs:**\n\n**Maintenance**\n₹5,000/month per number\n\n**Usage**\n₹1 per chat\n\n**Languages**\n2 included, ₹2,500 per additional language\n\n**Ready to see the detailed pricing table?**",
            suggestions: [
              { text: "Show detailed pricing table", action: "whatsapp-pricing-table" },
              { text: "What's included in setup?", action: "whatsapp-setup-details" },
              { text: "How is pricing calculated?", action: "whatsapp-pricing-breakdown" },
              { text: "Back to main menu", action: "back-to-whatsapp-main" }
            ]
          },
          "whatsapp-pricing-table": {
            message: "💰 **AI WhatsApp Agent - Complete Pricing Structure**\n\n**Component Pricing:**\n\n**Design & Deployment (One-Time): ₹1,00,000**\nAI training on your business data, brand tone design, multilingual setup, custom chatbot logic, integration with your website/CRM\n\n**Chat Engine Usage: ₹1 per chat**\nIntelligent chat handling, NLP processing, data storage, and AI model usage\n\n**Monthly Maintenance: ₹5,000/month per number**\nDashboard, analytics, API hosting, version updates, and technical support\n\n**Languages: 2 Languages (Basic Plan) - Included**\n**Extra Languages: ₹2,500 each**\n\n**Total Cost: Pay as you grow - Based on chat volume**",
            suggestions: [
              { text: "What's included in setup?", action: "whatsapp-setup-details" },
              { text: "How is pricing calculated?", action: "whatsapp-pricing-breakdown" },
              { text: "Compare with manual chat", action: "whatsapp-comparison" },
              { text: "Back to pricing overview", action: "whatsapp-pricing" }
            ]
          },
          "whatsapp-setup-details": {
            message: "🔧 **What's Included in Setup?**\n\n**AI Model Design**\nTraining custom NLP on your business FAQs, tone, and keywords\n\n**Integration Setup**\nLinking WhatsApp API, website forms, payment gateway, and CRM\n\n**UI/UX & Flow Design**\nCreating branded chat experiences with visuals, emojis, and flowcharts\n\n**Testing & Fine-Tuning**\nEnsuring accuracy, context handling, and fallback responses\n\n**Maintenance**\n24×7 hosting, updates, and support\n\n**Result:**\nYour own 24×7 WhatsApp Sales Executive that never forgets a lead",
            suggestions: [
              { text: "How is pricing calculated?", action: "whatsapp-pricing-breakdown" },
              { text: "Compare with manual chat", action: "whatsapp-comparison" },
              { text: "Back to pricing overview", action: "whatsapp-pricing" }
            ]
          },
          "whatsapp-pricing-breakdown": {
            message: "📊 **How is Pricing Calculated?**\n\n**One-Time Setup (₹1,00,000):**\n• Custom AI model training\n• WhatsApp Business API integration\n• Brand tone and personality setup\n• Multilingual configuration\n• CRM integration\n• Testing and deployment\n\n**Monthly Maintenance (₹5,000):**\n• 24×7 server hosting\n• Dashboard access\n• Analytics and reporting\n• Technical support\n• Regular updates\n\n**Usage Charges (₹1 per chat):**\n• Only charged for actual conversations\n• No charges for failed messages\n• Transparent billing\n\n**Language Costs:**\n• 2 languages included\n• Additional languages: ₹2,500 each",
            suggestions: [
              { text: "Compare with manual chat", action: "whatsapp-comparison" },
              { text: "Show ROI benefits", action: "whatsapp-roi" },
              { text: "Back to pricing overview", action: "whatsapp-pricing" }
            ]
          },
          "whatsapp-comparison": {
            message: "⚖️ **Benefits Over Manual Chat**\n\n**Availability:**\nHuman Chat: 8–10 hours/day\nAI WhatsApp Agent: 24×7\n\n**Response Time:**\nHuman Chat: Minutes/Hours\nAI WhatsApp Agent: Instant\n\n**Accuracy:**\nHuman Chat: 70–80%\nAI WhatsApp Agent: 100%\n\n**Cost:**\nHuman Chat: ₹25,000–₹30,000/month per executive\nAI WhatsApp Agent: ₹5,000 + usage\n\n**Lead Capture:**\nHuman Chat: Manual\nAI WhatsApp Agent: Automatic\n\n**Multilingual:**\nHuman Chat: Limited\nAI WhatsApp Agent: 20+ Languages",
            suggestions: [
              { text: "Show ROI benefits", action: "whatsapp-roi" },
              { text: "What are the key features?", action: "whatsapp-features" },
              { text: "Back to pricing overview", action: "whatsapp-pricing" }
            ]
          },
          "whatsapp-roi": {
            message: "📈 **ROI: 1 AI Agent = 10 Human Executives**\n\n**Save ₹3–5 Lakh/year** in staffing while improving customer satisfaction.\n\n**Key Benefits:**\n\n**24×7 availability**\nvs 8 hours/day human executives\n\n**Instant responses**\nvs minutes to hours\n\n**100% consistent accuracy**\nvs varying human performance\n\n**Unlimited handling capacity**\nvs 1:1 human ratio\n\n**20+ languages**\nvs limited human language skills\n\n**Automated reporting**\nvs manual tracking",
            suggestions: [
              { text: "How does it work?", action: "whatsapp-how-it-works" },
              { text: "What's the pricing?", action: "whatsapp-pricing" },
              { text: "Back to overview", action: "whatsapp-overview" }
            ]
          },
          "whatsapp-faqs": {
            message: "❓ **Frequently Asked Questions**\n\n**What is an AI WhatsApp Agent?**\nAn AI-powered chatbot that handles customer conversations on WhatsApp automatically.\n\n**Do I need coding knowledge?**\nNo. We handle everything from setup to training.\n\n**Can it handle multiple languages?**\nYes, supports 20+ languages including Hindi, English, Marathi, Gujarati.\n\n**Is it officially approved by WhatsApp?**\nYes, uses official WhatsApp Business API.\n\n**How accurate are the responses?**\n100% accurate as it's trained on your specific business data.\n\n**Can I integrate it with my CRM?**\nYes, integrates with Google Sheets, Zoho, HubSpot, and custom CRMs.",
            suggestions: [
              { text: "How does it work?", action: "whatsapp-how-it-works" },
              { text: "What's the pricing?", action: "whatsapp-pricing" },
              { text: "Back to overview", action: "whatsapp-overview" }
            ]
          },
          "back-to-whatsapp-main": {
            message: "📱 **AI WhatsApp Agent**\n\nChoose what you'd like to know more about:",
            suggestions: [
              { text: "Overview", action: "whatsapp-overview" },
              { text: "Pricing", action: "whatsapp-pricing" },
              { text: "FAQs", action: "whatsapp-faqs" },
              { text: "Results", action: "whatsapp-results" }
            ]
          }
        };
        
        const callingConversationalFlow = {
          "calling-inbound": {
            initialMessage: "📞 **INBOUND CALLING AGENT**\n\nTo attend incoming calls - answering customer queries, booking appointments, providing information, and capturing leads automatically.\n\n**Ideal For:**\n\n• Real estate project inquiries\n• Coaching or education institutes\n• Service bookings (salon, clinic, gym, etc.)\n• Product support lines\n• Customer service hotlines",
            suggestions: [
              { text: "How does it work?", action: "calling-inbound-how" },
              { text: "What are the benefits?", action: "calling-inbound-benefits" },
              { text: "What's the pricing?", action: "calling-inbound-pricing" },
              { text: "Back to main menu", action: "back-to-calling-main" }
            ]
          },
          "calling-inbound-how": {
            message: "⚙️ **How Inbound Calling Works:**\n\n**Step 1:** Customer calls your virtual number\n\n**Step 2:** AI agent greets in natural tone and selected language\n\n**Step 3:** It answers FAQs, explains offerings, captures details (name, phone, requirement)\n\n**Step 4:** Data is auto-saved to CRM or sent to WhatsApp/email",
            suggestions: [
              { text: "What are the benefits?", action: "calling-inbound-benefits" },
              { text: "What's the pricing?", action: "calling-inbound-pricing" },
              { text: "Back to inbound overview", action: "calling-inbound" }
            ]
          },
          "calling-inbound-benefits": {
            message: "✨ **Key Benefits of Inbound Calling:**\n\n**24×7 professional response**\nNever miss a call\n\n**Zero human errors or missed calls**\nConsistent performance\n\n**Supports Hindi, English, Marathi, Gujarati & more**\nMultilingual support\n\n**Captures 100% of calls as qualified leads**\nNo lost opportunities\n\n**Can handle multiple calls at once**\nUnlimited capacity",
            suggestions: [
              { text: "What's the pricing?", action: "calling-inbound-pricing" },
              { text: "How does it work?", action: "calling-inbound-how" },
              { text: "Back to inbound overview", action: "calling-inbound" }
            ]
          },
          "calling-inbound-pricing": {
            message: "💰 **Inbound Calling Agent Pricing:**\n\n**One-time Setup: ₹1,00,000**\nDesign & Deployment Fees\n\n**Per Minute Usage: ₹25 per minute**\nBilled on actual talk time\n\n**Monthly Maintenance: ₹10,000 per virtual number**\nMaintenance, server, AI hosting & updates",
            suggestions: [
              { text: "How does it work?", action: "calling-inbound-how" },
              { text: "What are the benefits?", action: "calling-inbound-benefits" },
              { text: "Back to inbound overview", action: "calling-inbound" }
            ]
          },
          "calling-outbound": {
            initialMessage: "📱 **OUTBOUND CALLING AGENT**\n\nTo initiate calls to leads or customers for promotions, follow-ups, reminders, or surveys - without manual effort.\n\n**Ideal For:**\n\n• Promotional campaigns (offers, event invites)\n• Lead follow-ups or re-engagement\n• Payment, delivery, or appointment reminders\n• Customer feedback or survey collection",
            suggestions: [
              { text: "How does it work?", action: "calling-outbound-how" },
              { text: "What are the benefits?", action: "calling-outbound-benefits" },
              { text: "What's the pricing?", action: "calling-outbound-pricing" },
              { text: "Back to main menu", action: "back-to-calling-main" }
            ]
          },
          "calling-outbound-how": {
            message: "⚙️ **How Outbound Calling Works:**\n\n**Step 1:** Upload your contact list (CSV or CRM)\n\n**Step 2:** AI agent automatically starts calling one by one\n\n**Step 3:** Delivers personalized pitch, collects responses, books appointments\n\n**Step 4:** Generates reports: answered, not answered, interested, follow-up needed",
            suggestions: [
              { text: "What are the benefits?", action: "calling-outbound-benefits" },
              { text: "What's the pricing?", action: "calling-outbound-pricing" },
              { text: "Back to outbound overview", action: "calling-outbound" }
            ]
          },
          "calling-outbound-benefits": {
            message: "✨ **Key Benefits of Outbound Calling:**\n\n**100s of calls per hour – zero manual dialing**\nMassive efficiency\n\n**Consistent pitch, tone & data capture**\nUniform quality\n\n**Multilingual and customizable voice scripts**\nFlexible communication\n\n**Fully automated reporting**\nComplete analytics\n\n**Saves manpower cost & training time**\nCost effective",
            suggestions: [
              { text: "What's the pricing?", action: "calling-outbound-pricing" },
              { text: "How does it work?", action: "calling-outbound-how" },
              { text: "Back to outbound overview", action: "calling-outbound" }
            ]
          },
          "calling-outbound-pricing": {
            message: "💰 **Outbound Calling Agent Pricing:**\n\n**One-time Setup: ₹1,00,000**\nDesign & Deployment Fees\n\n**Per Minute Usage: ₹25 per minute**\nBilled per live call\n\n**Monthly Maintenance: ₹10,000 per virtual number**\nMaintenance, CRM integration, analytics",
            suggestions: [
              { text: "How does it work?", action: "calling-outbound-how" },
              { text: "What are the benefits?", action: "calling-outbound-benefits" },
              { text: "Back to outbound overview", action: "calling-outbound" }
            ]
          },
          "back-to-calling-main": {
            message: "📞 **AI Calling Agent**\n\nChoose what you'd like to know more about:",
            suggestions: [
              { text: "Inbound Calling Agent", action: "calling-inbound" },
              { text: "Outbound Calling Agent", action: "calling-outbound" },
              { text: "Pricing", action: "calling-pricing" },
              { text: "FAQs", action: "calling-faqs" }
            ]
          }
        };
        
        const websitesConversationalFlow = {
          "websites-overview": {
            initialMessage: "🌐 **AI Websites - Overview**\n\nAI Created. Human Perfected.\n\nWhether it's a factory owner, lawyer, CA, doctor, institute, or politician - a Troika AI Website gives each, a voice, system, and intelligence that grows their business, brand, or public trust automatically.\n\n'AI Websites don't just inform - they influence, interact, and inspire.'",
            suggestions: [
              { text: "What problems does it solve?", action: "websites-problems" },
              { text: "What are the key features?", action: "websites-features" },
              { text: "How does it work?", action: "websites-how-it-works" },
              { text: "Back to main menu", action: "back-to-websites-main" }
            ]
          },
          "websites-problems": {
            message: "🔹 **Common Business Problems**\n\n**Static Websites**\nYour website just sits there, not engaging visitors\n\n**No Lead Capture**\nVisitors leave without any interaction or data\n\n**Poor User Experience**\nConfusing navigation and outdated information\n\n**No Personalization**\nSame experience for everyone\n\n**Limited Reach**\nOnly works in one language\n\n**No Analytics**\nNo insights into visitor behavior",
            suggestions: [
              { text: "What are the solutions?", action: "websites-solutions" },
              { text: "Show key features", action: "websites-features" },
              { text: "Back to overview", action: "websites-overview" }
            ]
          },
          "websites-solutions": {
            message: "✅ **Solutions with AI Websites**\n\n**Smart Engagement**\nAI greets visitors and guides them through your offerings\n\n**Automatic Lead Capture**\nAI collects visitor information and interests\n\n**Personalized Experience**\nAI adapts content based on visitor behavior\n\n**Multilingual Support**\nSpeaks to visitors in their preferred language\n\n**Real-time Analytics**\nTrack visitor behavior and conversion rates\n\n**24×7 Availability**\nWorks around the clock to engage visitors",
            suggestions: [
              { text: "Show key features", action: "websites-features" },
              { text: "How does it work?", action: "websites-how-it-works" },
              { text: "Back to overview", action: "websites-overview" }
            ]
          },
          "websites-features": {
            message: "✨ **Key Features**\n\n**Smart Websites**\nAI-powered websites that engage visitors\n\n**Auto Engagement**\nAutomatically interacts with visitors\n\n**AI Conversion**\nConverts visitors into leads and customers\n\n**Multilingual Support**\nSpeaks 20+ languages\n\n**Real-time Analytics**\nTrack visitor behavior and conversions\n\n**Mobile Responsive**\nWorks perfectly on all devices\n\n**SEO Optimized**\nRanks higher in search results",
            suggestions: [
              { text: "How does it work?", action: "websites-how-it-works" },
              { text: "What's the pricing?", action: "websites-pricing" },
              { text: "Back to overview", action: "websites-overview" }
            ]
          },
          "websites-how-it-works": {
            message: "⚙️ **How AI Websites Work**\n\n**Step 1: Design**\nWe create a beautiful, responsive website for your business\n\n**Step 2: AI Integration**\nWe integrate AI chatbot and engagement features\n\n**Step 3: Training**\nAI is trained on your business data and offerings\n\n**Step 4: Launch**\nYour AI website goes live and starts engaging visitors\n\n**Step 5: Analytics**\nTrack performance and optimize for better results\n\n**Ready to transform your online presence?**\nGet your AI Website up and running in just 48 hours.",
            suggestions: [
              { text: "What's the pricing?", action: "websites-pricing" },
              { text: "Any FAQs?", action: "websites-faqs" },
              { text: "Back to overview", action: "websites-overview" }
            ]
          },
          "websites-pricing": {
            initialMessage: "💰 **AI Websites - Pricing Structure**\n\nOur AI Websites pricing is designed to be transparent and cost-effective. We offer a one-time setup fee plus optional maintenance packages.\n\n**Key Benefits of Our Pricing:**\n\n**No Hidden Costs**\nEverything is clearly outlined\n\n**One-Time Investment**\nNo recurring monthly fees\n\n**Scalable**\nGrows with your business\n\n**ROI-Focused**\nSave more than you spend\n\n**Pricing Overview:**\n\n**One-Time Setup: ₹50,000**\nComplete website creation, AI integration, and deployment\n\n**Optional Maintenance: ₹5,000/month**\nUpdates, hosting, and technical support\n\n**Ready to see the detailed pricing?**",
            suggestions: [
              { text: "Show detailed pricing", action: "websites-pricing-details" },
              { text: "What's included in setup?", action: "websites-setup-details" },
              { text: "Compare with traditional websites", action: "websites-comparison" },
              { text: "Back to main menu", action: "back-to-websites-main" }
            ]
          },
          "websites-pricing-details": {
            message: "💰 **AI Websites - Complete Pricing**\n\n**One-Time Setup: ₹50,000**\n• Custom website design\n• AI chatbot integration\n• Mobile responsive design\n• SEO optimization\n• Content management system\n• Basic training\n\n**Optional Monthly Maintenance: ₹5,000**\n• Regular updates\n• Hosting and domain\n• Technical support\n• Performance monitoring\n• Content updates\n\n**Additional Features:**\n• E-commerce integration: ₹25,000\n• Advanced analytics: ₹10,000\n• Custom integrations: ₹15,000",
            suggestions: [
              { text: "What's included in setup?", action: "websites-setup-details" },
              { text: "Compare with traditional websites", action: "websites-comparison" },
              { text: "Show ROI benefits", action: "websites-roi" },
              { text: "Back to pricing overview", action: "websites-pricing" }
            ]
          },
          "websites-setup-details": {
            message: "🔧 **What's Included in Setup?**\n\n**Custom Website Design**\nBeautiful, professional design tailored to your business\n\n**AI Chatbot Integration**\nSmart chatbot that engages visitors\n\n**Mobile Responsive Design**\nWorks perfectly on all devices\n\n**SEO Optimization**\nOptimized for search engines\n\n**Content Management System**\nEasy to update and manage\n\n**Basic Training**\nTraining on how to use your new website\n\n**Result:**\nA complete AI-powered website that works 24×7",
            suggestions: [
              { text: "Compare with traditional websites", action: "websites-comparison" },
              { text: "Show ROI benefits", action: "websites-roi" },
              { text: "Back to pricing overview", action: "websites-pricing" }
            ]
          },
          "websites-comparison": {
            message: "⚖️ **AI Websites vs Traditional Websites**\n\n**Engagement:**\nTraditional: Static, no interaction\nAI Websites: Dynamic, interactive\n\n**Lead Capture:**\nTraditional: Manual forms\nAI Websites: Automatic capture\n\n**Personalization:**\nTraditional: Same for everyone\nAI Websites: Personalized experience\n\n**Availability:**\nTraditional: 24×7 but static\nAI Websites: 24×7 and interactive\n\n**Cost:**\nTraditional: ₹20,000-50,000\nAI Websites: ₹50,000 (one-time)\n\n**ROI:**\nTraditional: Low engagement\nAI Websites: High conversion rates",
            suggestions: [
              { text: "Show ROI benefits", action: "websites-roi" },
              { text: "What are the key features?", action: "websites-features" },
              { text: "Back to pricing overview", action: "websites-pricing" }
            ]
          },
          "websites-roi": {
            message: "📈 **ROI: AI Websites vs Traditional Websites**\n\n**Higher Conversion Rates**\nAI Websites convert 3-5x more visitors into leads\n\n**Better User Experience**\nVisitors stay longer and engage more\n\n**Automatic Lead Capture**\nNo missed opportunities\n\n**24×7 Engagement**\nWorks around the clock\n\n**Multilingual Reach**\nReach more customers\n\n**Real-time Analytics**\nTrack and optimize performance\n\n**Cost Effective**\nOne-time investment, long-term benefits",
            suggestions: [
              { text: "How does it work?", action: "websites-how-it-works" },
              { text: "What's the pricing?", action: "websites-pricing" },
              { text: "Back to overview", action: "websites-overview" }
            ]
          },
          "websites-faqs": {
            message: "❓ **Frequently Asked Questions**\n\n**What is an AI Website?**\nA website with integrated AI chatbot that engages visitors automatically.\n\n**Do I need coding knowledge?**\nNo. We handle everything from design to deployment.\n\n**How long does it take to build?**\nTypically 48 hours from start to finish.\n\n**Can I update content myself?**\nYes, we provide a user-friendly content management system.\n\n**Is it mobile responsive?**\nYes, works perfectly on all devices.\n\n**Do you provide hosting?**\nYes, hosting and domain are included in maintenance package.",
            suggestions: [
              { text: "How does it work?", action: "websites-how-it-works" },
              { text: "What's the pricing?", action: "websites-pricing" },
              { text: "Back to overview", action: "websites-overview" }
            ]
          },
          "back-to-websites-main": {
            message: "🌐 **AI Websites**\n\nChoose what you'd like to know more about:",
            suggestions: [
              { text: "Overview", action: "websites-overview" },
              { text: "Pricing", action: "websites-pricing" },
              { text: "FAQs", action: "websites-faqs" },
              { text: "Results", action: "websites-results" }
            ]
          }
        };
        
        // Determine which flow to use based on action
        let flowData = null;
        if (telegramConversationalFlow[suggestion.action]) {
          flowData = telegramConversationalFlow[suggestion.action];
        } else if (whatsappConversationalFlow[suggestion.action]) {
          flowData = whatsappConversationalFlow[suggestion.action];
        } else if (callingConversationalFlow[suggestion.action]) {
          flowData = callingConversationalFlow[suggestion.action];
        } else if (websitesConversationalFlow[suggestion.action]) {
          flowData = websitesConversationalFlow[suggestion.action];
        }
        if (flowData) {
          const message = flowData.initialMessage || flowData.message;
          const suggestions = flowData.suggestions || [];
          
          // Add user message
          const userMessage = {
            sender: "user",
            text: suggestion.text,
            timestamp: new Date()
          };
          
        // Add bot message with conversational content
        const botMessage = {
          sender: "bot",
          text: message,
          timestamp: new Date(),
          suggestions: suggestions
        };
        
        setCurrentChatHistory(prev => [...prev, userMessage, botMessage]);
        
        // Force scroll to bottom after messages are added
        const scrollToBottom = () => {
          if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'end' 
            });
          } else if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        };
        
        // Immediate scroll
        scrollToBottom();
        
        // Additional scroll after content is rendered
        setTimeout(scrollToBottom, 50);
        setTimeout(scrollToBottom, 200);
        setTimeout(scrollToBottom, 500);
        return;
        }
      }
      
      // For other conversational actions, send as regular message
      handleSendMessage(suggestion.text);
    } else {
      // Handle regular text suggestions
      handleSendMessage(suggestion);
    }
  }, [handleSendMessage]);

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

  // Sidebar and page management handlers
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handlePageChange = useCallback((pageId) => {
    if (pageId === 'new-chat') {
      handleBackToWelcome();
      return;
    }

    // Stop audio from current tab
    stopAudio();

    // Check if the new tab has chat history
    const newTabHistory = chatHistories[pageId] || [];

    // Change the active page
    setActivePage(pageId);

    // Show welcome screen only if the tab is empty
    if (newTabHistory.length === 0) {
      setShowWelcome(true);
      greetingAddedRef.current = false;
      setFinalGreetingReady(false);
    } else {
      setShowWelcome(false);
      greetingAddedRef.current = true;
      setFinalGreetingReady(true);
    }

    // Clear audio-related refs
    lastGeneratedGreeting.current = null;
    greetingAutoPlayed.current = false;
    pendingGreetingAudio.current = null;
  }, [handleBackToWelcome, stopAudio, chatHistories]);

  // Social media feed handlers
  const handleSocialMediaClick = useCallback((platform) => {
    setSelectedPlatform(platform);
    setSocialFeedOpen(true);
  }, []);

  const handleSocialFeedClose = useCallback(() => {
    setSocialFeedOpen(false);
    setSelectedPlatform(null);
  }, []);

  // Handle page change for social media
  const handlePageChangeWithSocial = useCallback((pageId) => {
    // CRITICAL: Stop any audio playing from the current tab
    stopAudio();

    // NOTE: We do NOT stop streaming when switching tabs
    // The streaming will continue in the background and update the message
    // When user returns to the tab, they'll see the completed/in-progress response
    // This prevents losing the backend response when switching tabs

    // We also do NOT reset typing state or clean up streaming messages
    // because the streaming is still active and will complete
    // The per-tab state management ensures each tab shows its correct state

    // Check if the new tab has chat history BEFORE changing activePage
    const newTabHistory = chatHistories[pageId] || [];

    // Change to new tab
    setActivePage(pageId);

    // Show welcome screen only if the tab is empty
    if (newTabHistory.length === 0) {
      setShowWelcome(true);
      // Reset greeting flags for empty tabs
      greetingAddedRef.current = false;
      setFinalGreetingReady(false);
    } else {
      // Tab has messages, don't show welcome screen
      setShowWelcome(false);
      // Mark greeting as already added to prevent greeting useEffect from triggering
      greetingAddedRef.current = true;
      setFinalGreetingReady(true);
    }

    if (pageId === 'social-media') {
      // Show social media options
      setSocialFeedOpen(false);
      setSelectedPlatform(null);
    } else {
      setSocialFeedOpen(false);
      setSelectedPlatform(null);
    }
  }, [chatHistories, activePage, stopAudio]);

  // Listen for social media clicks from suggestion cards
  useEffect(() => {
    const handleSocialMediaEvent = (event) => {
      handleSocialMediaClick(event.detail);
    };

    window.addEventListener('socialMediaClick', handleSocialMediaEvent);
    return () => window.removeEventListener('socialMediaClick', handleSocialMediaEvent);
  }, [handleSocialMediaClick]);

  // Listen for navigation events from home page suggestions
  useEffect(() => {
    const handleNavigationEvent = (event) => {
      handlePageChangeWithSocial(event.detail);
    };

    window.addEventListener('navigateToPage', handleNavigationEvent);
    return () => window.removeEventListener('navigateToPage', handleNavigationEvent);
  }, [handlePageChangeWithSocial]);

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
        <Overlay ref={overlayRef} $isDarkMode={isDarkMode}>
          <AnimatedBlob $isDarkMode={isDarkMode} />
          
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
            activePage={activePage}
            onPageChange={handlePageChangeWithSocial}
          />

          {/* Main Content Area */}
          <MainContentArea $isDarkMode={isDarkMode} $sidebarOpen={sidebarOpen}>
            <Chatbox ref={chatboxRef} $isDarkMode={isDarkMode}>
              <ChatHeader
                currentTime={currentTime}
                batteryLevel={batteryLevel}
                isCharging={isCharging}
                chatbotLogo={chatbotLogo}
                isMuted={isMuted}
                toggleMute={toggleMute}
                onSidebarToggle={handleSidebarToggle}
                sidebarOpen={sidebarOpen}
              />

              <ChatContainer $isWelcomeMode={showWelcome}>
        {showWelcome && (
            <WelcomeSection 
              onSuggestionClick={handleSuggestionClick} 
              activePage={activePage}
              socialFeedOpen={socialFeedOpen}
              selectedPlatform={selectedPlatform}
              onSocialFeedClose={handleSocialFeedClose}
            />
        )}
                
                <MessagesContainer 
                  ref={messagesContainerRef}
                  $isDarkMode={isDarkMode}
                  style={{ display: showWelcome ? 'none' : 'flex' }}
                >
                  <MessagesInnerContainer>
                    {chatHistory.map((msg, idx) => (
                      <React.Fragment key={idx}>
                        {msg.isStreaming ? (
                          // Use StreamingMessage component for streaming messages
                          <StreamingMessage
                            text={msg.text}
                            isStreaming={true}
                            audioPlaying={msg.audioPlaying || false}
                            error={streamingChat?.error}
                            metrics={msg.metrics}
                            isDarkMode={isDarkMode}
                            showCursor={true}
                            onRetry={streamingChat?.retry}
                          />
                        ) : (
                          // Use regular MessageBubble for non-streaming messages
                          <MessageBubbleComponent
                            message={{
                              ...msg,
                              suggestions: chatHistory.length >= 6 ? [] : msg.suggestions
                            }}
                            index={idx}
                            isUser={msg.sender === "user"}
                            isTyping={msg.wasStreamed ? false : isTyping}
                            animatedMessageIdx={msg.wasStreamed ? null : animatedMessageIdx}
                            chatHistoryLength={chatHistory.length}
                            currentlyPlaying={currentlyPlaying}
                            playAudio={playAudio}
                            setAnimatedMessageIdx={setAnimatedMessageIdx}
                            onSuggestionClick={handleBotSuggestionClick}
                          />
                        )}
                        {msg.showServiceButtons && showServiceSelection && (
                          <ServiceSelectionButtons
                            isVisible={true}
                            onServiceClick={handleServiceSelection}
                          />
                        )}
                      </React.Fragment>
                    ))}

                    {/* Typing indicator removed - streaming has built-in cursor animation */}

                    {/* WhatsApp OTP Authentication Components */}
                    <InlineAuth
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
                    />

                    <div ref={endOfMessagesRef} />
                  </MessagesInnerContainer>
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
            </Chatbox>
          </MainContentArea>

          <ToastContainer position="top-center" />
          <Confetti 
            trigger={confettiTrigger} 
            onComplete={() => console.log('Confetti animation completed')}
          />
          
          {/* Social Media Feed Panel */}
          <SocialFeedPanel
            isOpen={socialFeedOpen}
            onClose={handleSocialFeedClose}
            platform={selectedPlatform}
          />
        </Overlay>
      )}
    </Wrapper>
  );
};

const SupaChatbot = (props) => {
  return (
    <ThemeProvider>
      <SupaChatbotInner {...props} />
    </ThemeProvider>
  );
};

export default SupaChatbot;
