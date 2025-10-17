import conversationTranscriptService from './conversationTranscriptService';

class FrontendInactivityManager {
  constructor() {
    this.activeTimers = new Map();
    this.INACTIVITY_TIMEOUT = 30000; // 30 seconds
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
        console.log(`✅ [INACTIVITY DEBUG] Conversation transcript sent successfully for session: ${sessionId}`);
        console.log(`📱 [INACTIVITY DEBUG] PDF URL: ${result.s3Url}`);
        console.log(`📊 [INACTIVITY DEBUG] Message count: ${result.messageCount}`);
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
}

// Create and export singleton instance
const frontendInactivityManager = new FrontendInactivityManager();
export { FrontendInactivityManager };
export default frontendInactivityManager;
