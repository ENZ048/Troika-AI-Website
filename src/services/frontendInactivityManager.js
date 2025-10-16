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
    // Clear existing timer if any
    if (this.activeTimers.has(sessionId)) {
      clearTimeout(this.activeTimers.get(sessionId));
    }

    console.log(`⏰ Starting inactivity timer for session: ${sessionId}`);

    // Set new timer
    const timerId = setTimeout(() => {
      this.handleInactivity(sessionId, phone, chatbotId, chatHistory, apiBase);
      this.activeTimers.delete(sessionId);
    }, this.INACTIVITY_TIMEOUT);

    this.activeTimers.set(sessionId, timerId);
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
      console.log(`📄 Generating conversation transcript for inactive session: ${sessionId}`);

      if (!chatHistory || chatHistory.length === 0) {
        console.warn(`No chat history found for session: ${sessionId}`);
        return;
      }

      // Send conversation transcript via backend API
      const result = await conversationTranscriptService.sendConversationTranscript(
        phone,
        chatHistory,
        sessionId,
        chatbotId,
        apiBase
      );

      if (result.success) {
        console.log(`✅ Conversation transcript sent successfully for session: ${sessionId}`);
        console.log(`📱 PDF URL: ${result.s3Url}`);
      } else {
        console.error(`❌ Failed to send conversation transcript: ${result.message}`);
      }

    } catch (error) {
      console.error('Error handling inactivity:', error);
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
      clearTimeout(this.activeTimers.get(sessionId));
      this.activeTimers.delete(sessionId);
      console.log(`⏰ Cleared inactivity timer for session: ${sessionId}`);
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
