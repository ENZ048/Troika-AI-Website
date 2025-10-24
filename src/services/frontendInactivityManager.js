import conversationTranscriptService from './conversationTranscriptService';

class FrontendInactivityManager {
  constructor() {
    this.activeTimers = new Map();
    this.INACTIVITY_TIMEOUT = 30000; // 30 seconds
    this.TRANSCRIPT_TRACKING_KEY = 'supa_transcript_sent_sessions';

    // Load previously sent sessions from localStorage
    this.transcriptSentSessions = this.loadTranscriptTracking();
  }

  /**
   * Load transcript tracking from localStorage
   * @returns {Set} Set of session IDs that have received transcripts
   */
  loadTranscriptTracking() {
    try {
      const stored = localStorage.getItem(this.TRANSCRIPT_TRACKING_KEY);
      if (stored) {
        const sessions = JSON.parse(stored);
        console.log('📂 [TRANSCRIPT DEBUG] Loaded transcript tracking from localStorage:', sessions.length, 'sessions');
        return new Set(sessions);
      }
    } catch (error) {
      console.error('❌ [TRANSCRIPT DEBUG] Error loading transcript tracking:', error);
    }
    return new Set();
  }

  /**
   * Save transcript tracking to localStorage
   */
  saveTranscriptTracking() {
    try {
      const sessions = Array.from(this.transcriptSentSessions);
      localStorage.setItem(this.TRANSCRIPT_TRACKING_KEY, JSON.stringify(sessions));
      console.log('💾 [TRANSCRIPT DEBUG] Saved transcript tracking to localStorage:', sessions.length, 'sessions');
    } catch (error) {
      console.error('❌ [TRANSCRIPT DEBUG] Error saving transcript tracking:', error);
    }
  }

  /**
   * Start inactivity timer for a session
   * @param {String} sessionId - Session ID
   * @param {String} phone - User phone number
   * @param {String} chatbotId - Chatbot ID
   * @param {Array} chatHistory - Current chat history
   * @param {String} apiBase - API base URL
   */
  startInactivityTimer(sessionId, phone, chatbotId, chatHistory, apiBase) {
    console.log('🚀 [TIMER DEBUG] Starting inactivity timer');
    console.log('🆔 [TIMER DEBUG] Session ID:', sessionId);
    console.log('📞 [TIMER DEBUG] Phone:', phone);
    console.log('🤖 [TIMER DEBUG] Chatbot ID:', chatbotId);
    console.log('📊 [TIMER DEBUG] Chat history length:', chatHistory?.length || 0);
    console.log('⏱️ [TIMER DEBUG] Timeout duration:', this.INACTIVITY_TIMEOUT, 'ms');
    
    // Clear existing timer if any
    if (this.activeTimers.has(sessionId)) {
      console.log('🔄 [TIMER DEBUG] Clearing existing timer for session:', sessionId);
      clearTimeout(this.activeTimers.get(sessionId));
    }

    console.log(`⏰ [TIMER DEBUG] Starting inactivity timer for session: ${sessionId}`);

    // Set new timer
    const timerId = setTimeout(() => {
      console.log('⏰ [TIMER DEBUG] Timer expired! Calling handleInactivity...');
      this.handleInactivity(sessionId, phone, chatbotId, chatHistory, apiBase);
      this.activeTimers.delete(sessionId);
    }, this.INACTIVITY_TIMEOUT);

    this.activeTimers.set(sessionId, timerId);
    console.log('✅ [TIMER DEBUG] Timer set successfully. Active timers count:', this.activeTimers.size);
  }

  /**
   * Reset inactivity timer (clear and restart)
   * @param {String} sessionId - Session ID
   * @param {String} phone - User phone number
   * @param {String} chatbotId - Chatbot ID
   * @param {Array} chatHistory - Current chat history
   * @param {String} apiBase - API base URL
   */
  resetInactivityTimer(sessionId, phone, chatbotId, chatHistory, apiBase) {
    console.log('🔄 [TIMER DEBUG] Resetting inactivity timer for session:', sessionId);
    this.startInactivityTimer(sessionId, phone, chatbotId, chatHistory, apiBase);
  }

  /**
   * Handle user inactivity - send conversation transcript
   * @param {String} sessionId - Session ID
   * @param {String} phone - User phone number
   * @param {String} chatbotId - Chatbot ID
   * @param {Array} chatHistory - Current chat history
   * @param {String} apiBase - API base URL
   */
  async handleInactivity(sessionId, phone, chatbotId, chatHistory, apiBase) {
    try {
      console.log('🚀 [INACTIVITY DEBUG] Starting handleInactivity process');
      console.log(`📄 [INACTIVITY DEBUG] Generating conversation transcript for inactive session: ${sessionId}`);
      console.log('📞 [INACTIVITY DEBUG] Phone:', phone);
      console.log('🤖 [INACTIVITY DEBUG] Chatbot ID:', chatbotId);
      console.log('📊 [INACTIVITY DEBUG] Chat history length:', chatHistory?.length || 0);

      // Check if transcript was already sent for this session
      if (this.transcriptSentSessions.has(sessionId)) {
        console.log(`⚠️ [INACTIVITY DEBUG] Transcript already sent for session: ${sessionId}. Skipping duplicate send.`);
        return;
      }

      if (!chatHistory || chatHistory.length === 0) {
        console.warn(`⚠️ [INACTIVITY DEBUG] No chat history found for session: ${sessionId}`);
        return;
      }

      console.log('📤 [INACTIVITY DEBUG] Calling conversationTranscriptService.sendConversationTranscript...');
      // Send conversation transcript via backend API
      const result = await conversationTranscriptService.sendConversationTranscript(
        phone,
        chatHistory,
        sessionId,
        chatbotId,
        apiBase
      );

      console.log('📥 [INACTIVITY DEBUG] Transcript service result:', result);

      if (result.success) {
        // Mark this session as having received a transcript
        this.transcriptSentSessions.add(sessionId);
        this.saveTranscriptTracking(); // Persist to localStorage
        console.log(`✅ [INACTIVITY DEBUG] Conversation transcript sent successfully for session: ${sessionId}`);
        console.log(`📱 [INACTIVITY DEBUG] PDF URL: ${result.s3Url}`);
        console.log(`📊 [INACTIVITY DEBUG] Message count: ${result.messageCount}`);
        console.log(`🔒 [INACTIVITY DEBUG] Session marked as transcript-sent. Total sessions with transcripts: ${this.transcriptSentSessions.size}`);
      } else {
        console.error(`❌ [INACTIVITY DEBUG] Failed to send conversation transcript: ${result.message}`);
        console.error(`❌ [INACTIVITY DEBUG] Error details:`, result.error);
      }

    } catch (error) {
      console.error('❌ [INACTIVITY DEBUG] Error handling inactivity:', error);
      console.error('❌ [INACTIVITY DEBUG] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }

  /**
   * Enable/disable the inactivity manager
   * @param {Boolean} enabled - Whether to enable the manager
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`Inactivity manager ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clear inactivity timer for a session
   * @param {String} sessionId - Session ID
   */
  clearInactivityTimer(sessionId) {
    if (this.activeTimers.has(sessionId)) {
      console.log(`🧹 [TIMER DEBUG] Clearing inactivity timer for session: ${sessionId}`);
      clearTimeout(this.activeTimers.get(sessionId));
      this.activeTimers.delete(sessionId);
      console.log(`✅ [TIMER DEBUG] Cleared inactivity timer for session: ${sessionId}`);
      console.log('📊 [TIMER DEBUG] Remaining active timers:', this.activeTimers.size);
    } else {
      console.log(`ℹ️ [TIMER DEBUG] No timer found for session: ${sessionId}`);
    }
  }

  /**
   * Clear all active timers
   */
  clearAllTimers() {
    this.activeTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.activeTimers.clear();
    console.log('🧹 Cleared all inactivity timers');
  }

  /**
   * Get count of active timers
   * @returns {Number} Number of active timers
   */
  getActiveTimerCount() {
    return this.activeTimers.size;
  }

  /**
   * Check if transcript was already sent for a session
   * @param {String} sessionId - Session ID
   * @returns {Boolean} True if transcript was sent
   */
  isTranscriptSent(sessionId) {
    return this.transcriptSentSessions.has(sessionId);
  }

  /**
   * Clear transcript sent tracking for a session
   * @param {String} sessionId - Session ID
   */
  clearTranscriptTracking(sessionId) {
    if (this.transcriptSentSessions.has(sessionId)) {
      this.transcriptSentSessions.delete(sessionId);
      this.saveTranscriptTracking(); // Update localStorage
      console.log(`🧹 [TRANSCRIPT DEBUG] Cleared transcript tracking for session: ${sessionId}`);
    }
  }

  /**
   * Clear all transcript tracking
   */
  clearAllTranscriptTracking() {
    this.transcriptSentSessions.clear();
    this.saveTranscriptTracking(); // Update localStorage
    console.log('🧹 [TRANSCRIPT DEBUG] Cleared all transcript tracking');
  }

  /**
   * Get count of sessions with sent transcripts
   * @returns {Number} Number of sessions with sent transcripts
   */
  getTranscriptSentCount() {
    return this.transcriptSentSessions.size;
  }
}

// Create and export singleton instance
const frontendInactivityManager = new FrontendInactivityManager();
export { FrontendInactivityManager };
export default frontendInactivityManager;
