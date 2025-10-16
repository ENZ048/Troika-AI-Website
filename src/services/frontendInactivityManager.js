// Frontend inactivity manager for automatic conversation transcript sending
// Tracks user activity and sends transcript after 30 seconds of inactivity

import conversationTranscriptService from './conversationTranscriptService';

class FrontendInactivityManager {
  constructor() {
    this.activeTimers = new Map(); // sessionId -> timer
    this.inactivityTimeout = 30000; // 30 seconds
    this.isEnabled = true;
  }

  /**
   * Start or reset inactivity timer for a conversation
   * @param {String} sessionId - Session ID
   * @param {String} phone - User phone number
   * @param {String} chatbotId - Chatbot ID
   * @param {Array} chatHistory - Current chat history
   * @param {String} apiBase - API base URL
   */
  startInactivityTimer(sessionId, phone, chatbotId, chatHistory, apiBase) {
    // Clear existing timer if any
    this.clearInactivityTimer(sessionId);

    if (!this.isEnabled || !sessionId || !phone || !chatbotId) {
      return;
    }

    console.log(`⏰ Starting 30s inactivity timer for session: ${sessionId}`);

    const timer = setTimeout(async () => {
      try {
        await this.handleInactivity(sessionId, phone, chatbotId, chatHistory, apiBase);
      } catch (error) {
        console.error('Error handling inactivity:', error);
      }
    }, this.inactivityTimeout);

    this.activeTimers.set(sessionId, timer);
  }

  /**
   * Clear inactivity timer for a session
   * @param {String} sessionId - Session ID
   */
  clearInactivityTimer(sessionId) {
    const timer = this.activeTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(sessionId);
      console.log(`⏰ Cleared inactivity timer for session: ${sessionId}`);
    }
  }

  /**
   * Reset timer when user interacts
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
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearAllTimers();
    }
  }

  /**
   * Get active timer count (for monitoring)
   */
  getActiveTimerCount() {
    return this.activeTimers.size;
  }

  /**
   * Clear all timers (for cleanup)
   */
  clearAllTimers() {
    for (const [sessionId, timer] of this.activeTimers) {
      clearTimeout(timer);
      console.log(`⏰ Cleared timer for session: ${sessionId}`);
    }
    this.activeTimers.clear();
  }

  /**
   * Check if timer is active for a session
   * @param {String} sessionId - Session ID
   */
  hasActiveTimer(sessionId) {
    return this.activeTimers.has(sessionId);
  }
}

// Create and export singleton instance
const frontendInactivityManager = new FrontendInactivityManager();
export default frontendInactivityManager;
