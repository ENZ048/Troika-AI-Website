import { useState, useRef, useCallback, useEffect } from 'react';
import { SSEStreamReader } from '../utils/sseParser';
import { WebAudioPlayer } from '../utils/WebAudioPlayer';

/**
 * Custom hook for streaming chat functionality
 * @param {Object} options - Configuration options
 * @param {string} options.apiBase - Base API URL
 * @param {string} options.chatbotId - Chatbot ID
 * @param {string} options.sessionId - Session ID
 * @param {boolean} options.enableTTS - Enable text-to-speech
 * @param {boolean} options.isMuted - Audio mute state
 * @param {Function} options.onComplete - Callback when streaming completes
 * @param {Function} options.onError - Callback on error
 * @returns {Object} Streaming chat state and controls
 */
export function useStreamingChat(options) {
  const {
    apiBase,
    chatbotId,
    sessionId,
    phone,
    enableTTS = true,
    isMuted = false,
    onComplete,
    onError,
  } = options;

  // State
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // Refs
  const audioPlayerRef = useRef(null);
  const streamReaderRef = useRef(null);
  const lastQueryRef = useRef(null);
  const startTimeRef = useRef(null);
  const firstTokenTimeRef = useRef(null);
  const firstAudioTimeRef = useRef(null);
  const updateThrottleRef = useRef(null);
  const suggestionsRef = useRef(null);
  const completedRef = useRef(false); // Flag to prevent duplicate onComplete calls
  const currentMetadataRef = useRef(null); // ✨ Use ref for immediate access to metadata

  // Initialize Web Audio player
  useEffect(() => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new WebAudioPlayer();

      // Set up event handlers
      audioPlayerRef.current.onPlaybackStateChange = (state) => {
        setAudioPlaying(state.isPlaying);
      };

      audioPlayerRef.current.onError = (error) => {
        console.error('Audio player error:', error);
      };
    }

    return () => {
      // Cleanup on unmount
      if (audioPlayerRef.current) {
        audioPlayerRef.current.destroy();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  // Update audio player mute state
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setMuted(isMuted);
    }
  }, [isMuted]);

  /**
   * Send a message and start streaming
   */
  const sendMessage = useCallback(
    async (query) => {
      if (!apiBase || !chatbotId || !sessionId) {
        console.error('Missing required parameters for streaming');
        return;
      }

      if (isStreaming) {
        console.warn('Already streaming, ignoring new request');
        return;
      }

      // Reset state
      setStreamingResponse('');
      setError(null);
      setIsStreaming(true);
      setMetrics(null);
      currentMetadataRef.current = null; // Reset metadata ref
      lastQueryRef.current = query;
      startTimeRef.current = Date.now();
      firstTokenTimeRef.current = null;
      firstAudioTimeRef.current = null;
      suggestionsRef.current = null;
      completedRef.current = false; // Reset completion flag

      // Stop any existing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop();
      }

      // Create streaming endpoint URL
      const streamUrl = `${apiBase}/troika/intelligent-chat/stream`;

      // Request data
      // TEMPORARILY DISABLED TTS - forcing enableTTS to false
      const requestData = {
        chatbotId,
        query,
        sessionId,
        enableTTS: false, // Temporarily disabled
        phone: phone || "", // Use provided phone or empty string
      };

      console.log('Starting streaming request:', { streamUrl, requestData });

      // Create stream reader
      const reader = new SSEStreamReader(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      streamReaderRef.current = reader;

      // Start streaming with handlers
      try {
        await reader.start({
          onText: (token) => {
            // Token is already a string from sseParser
            console.log('Text token received:', token);

            // Track first token time
            if (!firstTokenTimeRef.current) {
              firstTokenTimeRef.current = Date.now();
              const firstTokenLatency = firstTokenTimeRef.current - startTimeRef.current;
              console.log('First token received. Latency:', firstTokenLatency, 'ms');
            }

            // Update state immediately and filter out [SUGGESTIONS] and suggestion button text
            setStreamingResponse((prev) => {
              const newText = prev + token;
              let cleaned = newText;

              // Step 1: Remove pipe-separated suggestions format (: suggestion1 | suggestion2 | suggestion3])
              // This is the most common format from backend
              cleaned = cleaned.replace(/:\s*[^:]*\|[^\]]*\]\s*$/gi, '');

              // Step 2: Remove complete [SUGGESTIONS] pattern
              cleaned = cleaned.replace(/\[SUGGESTIONS\][\s\S]*$/gi, '');
              cleaned = cleaned.replace(/\[SUGGESTIONS:[\s\S]*$/gi, '');
              cleaned = cleaned.replace(/\[SUGGESTION\][\s\S]*$/gi, '');
              cleaned = cleaned.replace(/\[SUGGESTION:[\s\S]*$/gi, '');

              // Step 3: Remove partial [S, [SU, [SUG... patterns at end
              cleaned = cleaned.replace(/\[S(U(G(G(E(S(T(I(O(N(S)?)?)?)?)?)?)?)?)?)?[\s\S]*$/gi, '');

              // Step 4: Remove orphaned UGGESTIONS (when [ was already filtered)
              // Match at word boundary or after whitespace/newline
              cleaned = cleaned.replace(/\s+UGGESTIONS[:\]]?[\s\S]*$/gi, '');
              cleaned = cleaned.replace(/\nUGGESTIONS[:\]]?[\s\S]*$/gi, '');
              cleaned = cleaned.replace(/\s+UGGESTION[:\]]?[\s\S]*$/gi, '');
              cleaned = cleaned.replace(/\nUGGESTION[:\]]?[\s\S]*$/gi, '');

              // Step 5: Catch UGGESTIONS at end even without preceding space
              if (cleaned.endsWith('UGGESTIONS') || /UGGESTIONS[:\]]?[\s\S]*$/.test(cleaned)) {
                cleaned = cleaned.replace(/UGGESTIONS[\s\S]*$/gi, '');
              }
              if (cleaned.endsWith('UGGESTION') || /UGGESTION[:\]]?[\s\S]*$/.test(cleaned)) {
                cleaned = cleaned.replace(/UGGESTION[\s\S]*$/gi, '');
              }

              // Step 6: Remove any JSON-like suggestion arrays that might leak through
              // Pattern: ["text1", "text2"] or {'text': 'value'}
              cleaned = cleaned.replace(/\s*[\[{][\s\S]*?["'].*?["'][\s\S]*?[\]}]\s*$/gi, '');

              // Only trim leading spaces, preserve trailing spaces as they might be intentional
              return cleaned.replace(/^\s+/, '');
            });
          },

          onAudio: (audioContent, sequence) => {
            // TEMPORARILY DISABLED: TTS Audio playback
            /* // Track first audio time
            if (!firstAudioTimeRef.current) {
              firstAudioTimeRef.current = Date.now();
              const firstAudioLatency = firstAudioTimeRef.current - startTimeRef.current;
              console.log('First audio chunk received. Latency:', firstAudioLatency, 'ms');
            }

            // Add sequenced audio chunk to player if enabled and not muted
            if (enableTTS && audioPlayerRef.current && !isMuted) {
              console.log('Adding sequenced audio chunk:', sequence);
              setAudioPlaying(true);
              // Use new sequenced API for proper ordering of audio chunks
              audioPlayerRef.current.addSequencedChunk(audioContent, sequence);
            } else {
              console.log('Audio chunk skipped:', {
                enableTTS,
                hasPlayer: !!audioPlayerRef.current,
                isMuted,
                sequence
              });
            } */
            console.log('TTS Audio temporarily disabled - ignoring audio chunk');
          },

          onSuggestions: (suggestionsData) => {
            console.log('Suggestions received:', suggestionsData);
            // Store suggestions to be included in completion
            suggestionsRef.current = suggestionsData.items || suggestionsData;
          },

          onMetadata: (metadataData) => {
            console.log('🔔 [useStreamingChat] ===== METADATA EVENT RECEIVED =====');
            console.log('🔔 [useStreamingChat] Metadata data:', metadataData);
            console.log('🔔 [useStreamingChat] Metadata action:', metadataData?.action);
            console.log('🔔 [useStreamingChat] Metadata calendly_url:', metadataData?.calendly_url);

            // Store metadata in ref for immediate access (not state to avoid timing issues)
            currentMetadataRef.current = metadataData;
            console.log('🔔 [useStreamingChat] Current metadata ref updated to:', metadataData);
          },

          onDone: (data) => {
            console.log('=== onDone called ===');
            console.log('Streaming completed:', data);

            // Use functional update to get the current accumulated response
            setStreamingResponse((currentResponse) => {
              // Prevent duplicate onComplete calls - check INSIDE setState callback
              if (completedRef.current) {
                console.warn('⚠️ setState callback called multiple times - ignoring duplicate');
                return currentResponse; // Return current value without triggering onComplete again
              }
              completedRef.current = true;

              console.log('Current accumulated response length:', currentResponse.length);
              console.log('Backend fullAnswer:', data.fullAnswer);

              const endTime = Date.now();
              const totalDuration = endTime - startTimeRef.current;
              const firstTokenLatency = firstTokenTimeRef.current
                ? firstTokenTimeRef.current - startTimeRef.current
                : null;
              const firstAudioLatency = firstAudioTimeRef.current
                ? firstAudioTimeRef.current - startTimeRef.current
                : null;

              // Use backend's fullAnswer if available, otherwise use accumulated response
              let finalAnswer = data.fullAnswer || currentResponse;

              // Clean up [SUGGESTIONS], UGGESTIONS, and suggestion button text from final answer
              // Step 1: Remove pipe-separated suggestions format (: suggestion1 | suggestion2 | suggestion3])
              finalAnswer = finalAnswer.replace(/:\s*[^:]*\|[^\]]*\]\s*$/gi, '');

              // Step 2: Remove [SUGGESTIONS] patterns
              finalAnswer = finalAnswer.replace(/\[SUGGESTIONS\][\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/\[SUGGESTIONS:[\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/\[SUGGESTION\][\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/\[SUGGESTION:[\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/\[S(U(G(G(E(S(T(I(O(N(S)?)?)?)?)?)?)?)?)?)?[\s\S]*$/gi, '');

              // Step 3: Remove orphaned UGGESTIONS
              finalAnswer = finalAnswer.replace(/\s+UGGESTIONS[:\]]?[\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/\nUGGESTIONS[:\]]?[\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/\s+UGGESTION[:\]]?[\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/\nUGGESTION[:\]]?[\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/UGGESTIONS[\s\S]*$/gi, '');
              finalAnswer = finalAnswer.replace(/UGGESTION[\s\S]*$/gi, '');

              // Step 4: Remove any JSON-like suggestion arrays
              finalAnswer = finalAnswer.replace(/\s*[\[{][\s\S]*?["'].*?["'][\s\S]*?[\]}]\s*$/gi, '');
              finalAnswer = finalAnswer.trim();
              const wordCount = finalAnswer ? finalAnswer.split(/\s+/).filter(Boolean).length : 0;

              const streamingMetrics = {
                duration: totalDuration,
                firstTokenLatency,
                firstAudioLatency,
                wordCount,
                ...data.metrics,
              };

              setMetrics(streamingMetrics);

              console.log('Streaming metrics:', streamingMetrics);
              console.log('Final answer length:', finalAnswer.length, 'words:', wordCount);
              console.log('Suggestions:', suggestionsRef.current);

              // TEMPORARILY DISABLED: Finalize audio stream - flush any remaining audio chunks
              /* if (audioPlayerRef.current) {
                audioPlayerRef.current.finalizeStream();
              } */

              // Call completion callback with the final answer, suggestions, and metadata
              // This callback will set currentStreamingMessageId to null
              const metadataToAttach = currentMetadataRef.current; // Get from ref (immediate access)

              console.log('🎯 [useStreamingChat] ===== CALLING onComplete =====');
              console.log('🎯 [useStreamingChat] Final answer length:', finalAnswer.length);
              console.log('🎯 [useStreamingChat] Metadata to attach:', metadataToAttach);
              console.log('🎯 [useStreamingChat] Has metadata?', !!metadataToAttach);
              console.log('🎯 [useStreamingChat] Metadata action:', metadataToAttach?.action);

              const completeData = {
                ...data,
                fullAnswer: finalAnswer,
                suggestions: suggestionsRef.current || [],
                metrics: streamingMetrics,
                metadata: metadataToAttach, // Attach metadata from ref
              };

              console.log('🎯 [useStreamingChat] Complete data object:', completeData);
              onComplete?.(completeData);

              // Set isStreaming to false AFTER onComplete to ensure proper state sync
              setIsStreaming(false);
              console.log('=== onDone finished ===');

              return finalAnswer;
            });
          },

          onError: (errorData) => {
            console.error('Streaming error:', errorData);
            setError(errorData.message || 'An error occurred during streaming');
            setIsStreaming(false);

            // Call error callback
            onError?.(errorData);
          },

          onConnectionError: (error) => {
            console.error('Connection error:', error);
            setError(error.message || 'Connection error');
            setIsStreaming(false);

            // Call error callback
            onError?.({ message: error.message, code: 'CONNECTION_ERROR' });
          },
        });
      } catch (error) {
        console.error('Failed to start streaming:', error);
        setError(error.message || 'Failed to start streaming');
        setIsStreaming(false);
        onError?.({ message: error.message, code: 'STREAM_START_ERROR' });
      }
    },
    [apiBase, chatbotId, sessionId, enableTTS, isMuted, isStreaming, onComplete, onError]
  );

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback(() => {
    console.log('Stopping streaming');

    if (streamReaderRef.current) {
      streamReaderRef.current.stop();
      streamReaderRef.current = null;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
    }

    setIsStreaming(false);
    setAudioPlaying(false);
  }, []);

  /**
   * Retry last query
   */
  const retry = useCallback(() => {
    if (lastQueryRef.current) {
      console.log('Retrying last query:', lastQueryRef.current);
      sendMessage(lastQueryRef.current);
    }
  }, [sendMessage]);

  /**
   * Pause audio playback
   */
  const pauseAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  }, []);

  /**
   * Resume audio playback
   */
  const resumeAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.resume();
    }
  }, []);

  /**
   * Get current audio state
   */
  const getAudioState = useCallback(() => {
    if (audioPlayerRef.current) {
      return audioPlayerRef.current.getState();
    }
    return {
      isPlaying: false,
      queueLength: 0,
      isMuted: false,
      hasCurrentAudio: false,
    };
  }, []);

  return {
    // State
    streamingResponse,
    isStreaming,
    error,
    audioPlaying,
    metrics,

    // Controls
    sendMessage,
    stopStreaming,
    retry,
    pauseAudio,
    resumeAudio,
    getAudioState,
  };
}

export default useStreamingChat;
