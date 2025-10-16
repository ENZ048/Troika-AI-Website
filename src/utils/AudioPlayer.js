/**
 * AudioPlayer Class
 * Handles progressive audio playback for streaming responses with sequenced audio chunks
 */

import { decodeBase64Audio, createWavBlob } from './wavHeader.js';

export class AudioPlayer {
  constructor() {
    this.audioQueue = []; // Queue of audio URLs ready to play
    this.chunkBuffer = new Map(); // Map<sequence, Uint8Array> for buffering out-of-order chunks
    this.nextSequence = 0; // Next expected sequence number
    this.isPlaying = false;
    this.currentAudio = null;
    this.isMuted = false;
    this.onPlaybackStateChange = null;
    this.onError = null;
    this.accumulatedChunks = []; // Accumulate chunks for creating WAV file
    this.sampleRate = 24000; // Default sample rate for TTS
  }

  /**
   * Add a sequenced audio chunk (new backend format)
   * @param {string} base64Audio - Base64 encoded PCM audio data
   * @param {number} sequence - Sequence number for ordering chunks
   */
  addSequencedChunk(base64Audio, sequence) {
    try {
      console.log(`Received audio chunk sequence: ${sequence}, size: ${base64Audio?.length || 0} bytes`);

      // Decode base64 to PCM audio data
      const pcmData = decodeBase64Audio(base64Audio);
      console.log(`Decoded PCM data: ${pcmData.length} bytes`);

      // Store chunk in buffer
      this.chunkBuffer.set(sequence, pcmData);

      // Process chunks in order
      this.processBufferedChunks();
    } catch (error) {
      console.error('❌ Error adding sequenced audio chunk:', error);
      console.error('Error details:', {
        sequence,
        base64Length: base64Audio?.length,
        errorMessage: error.message,
        errorStack: error.stack
      });
      // Don't call onError - audio errors should not stop text streaming
      // this.onError?.(error);
    }
  }

  /**
   * Process buffered chunks in sequence order
   * @private
   */
  processBufferedChunks() {
    // Process all consecutive chunks starting from nextSequence
    while (this.chunkBuffer.has(this.nextSequence)) {
      const chunk = this.chunkBuffer.get(this.nextSequence);
      this.chunkBuffer.delete(this.nextSequence);

      // Add to accumulated chunks
      this.accumulatedChunks.push(chunk);
      console.log(`Processed audio chunk ${this.nextSequence}, accumulated: ${this.accumulatedChunks.length}`);

      this.nextSequence++;

      // Create audio file when we have enough chunks (e.g., every 5 chunks or 1 second of audio)
      // At 24000 Hz, 16-bit mono: ~48KB per second
      const totalBytes = this.accumulatedChunks.reduce((sum, c) => sum + c.length, 0);
      const shouldFlush = totalBytes >= 48000; // ~1 second of audio

      if (shouldFlush && this.accumulatedChunks.length > 0) {
        this.flushAccumulatedChunks();
      }
    }
  }

  /**
   * Flush accumulated chunks into a playable audio file
   * @private
   */
  flushAccumulatedChunks() {
    if (this.accumulatedChunks.length === 0) return;

    try {
      // Create WAV blob from accumulated PCM chunks
      const wavBlob = createWavBlob(this.accumulatedChunks, this.sampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);

      // Add to playback queue
      this.audioQueue.push(audioUrl);
      console.log(`Created WAV audio file from ${this.accumulatedChunks.length} chunks. Queue length: ${this.audioQueue.length}`);

      // Clear accumulated chunks
      this.accumulatedChunks = [];

      // Start playing if not already playing
      if (!this.isPlaying) {
        this.playNext();
      }
    } catch (error) {
      console.error('Error flushing audio chunks:', error);
      this.onError?.(error);
    }
  }

  /**
   * Add an audio chunk to the queue (legacy format - for backward compatibility)
   * @param {string} base64Audio - Base64 encoded audio data
   */
  addChunk(base64Audio) {
    try {
      const audioBlob = this.base64ToBlob(base64Audio, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      this.audioQueue.push(audioUrl);

      console.log('Audio chunk added to queue. Queue length:', this.audioQueue.length);

      // Start playing if not already playing
      if (!this.isPlaying) {
        this.playNext();
      }
    } catch (error) {
      console.error('Error adding audio chunk:', error);
      this.onError?.(error);
    }
  }

  /**
   * Play the next audio chunk in queue
   */
  playNext() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.currentAudio = null;
      this.onPlaybackStateChange?.({ isPlaying: false, queueLength: 0 });
      console.log('Audio playback complete - queue empty');
      return;
    }

    this.isPlaying = true;
    const audioUrl = this.audioQueue.shift();

    try {
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.muted = this.isMuted;

      // Event listeners
      this.currentAudio.addEventListener('ended', () => {
        console.log('Audio chunk finished playing');
        URL.revokeObjectURL(audioUrl); // Clean up memory
        this.playNext(); // Play next in queue
      });

      this.currentAudio.addEventListener('error', (err) => {
        console.error('Audio playback error:', err);
        URL.revokeObjectURL(audioUrl); // Clean up even on error
        this.onError?.(err);
        this.playNext(); // Skip to next chunk
      });

      this.currentAudio.addEventListener('canplaythrough', () => {
        console.log('Audio chunk ready to play');
      });

      // Play the audio
      this.currentAudio.play()
        .then(() => {
          console.log('Audio playback started');
          this.onPlaybackStateChange?.({
            isPlaying: true,
            queueLength: this.audioQueue.length
          });
        })
        .catch((error) => {
          console.error('Failed to play audio:', error);
          this.onError?.(error);
          URL.revokeObjectURL(audioUrl);
          this.playNext();
        });
    } catch (error) {
      console.error('Error creating audio:', error);
      URL.revokeObjectURL(audioUrl);
      this.onError?.(error);
      this.playNext();
    }
  }

  /**
   * Pause current audio playback
   */
  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPlaying = false;
      this.onPlaybackStateChange?.({
        isPlaying: false,
        queueLength: this.audioQueue.length
      });
      console.log('Audio playback paused');
    }
  }

  /**
   * Resume paused audio playback
   */
  resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play()
        .then(() => {
          this.isPlaying = true;
          this.onPlaybackStateChange?.({
            isPlaying: true,
            queueLength: this.audioQueue.length
          });
          console.log('Audio playback resumed');
        })
        .catch((error) => {
          console.error('Failed to resume audio:', error);
          this.onError?.(error);
        });
    }
  }

  /**
   * Finalize audio streaming - flush any remaining chunks
   * Call this when the stream is complete
   */
  finalizeStream() {
    console.log('Finalizing audio stream...');

    // Flush any remaining accumulated chunks
    if (this.accumulatedChunks.length > 0) {
      this.flushAccumulatedChunks();
    }

    // Clear the chunk buffer (shouldn't have anything if chunks arrived in order)
    if (this.chunkBuffer.size > 0) {
      console.warn(`${this.chunkBuffer.size} audio chunks were out of order and not played`);
      this.chunkBuffer.clear();
    }

    console.log(`Audio stream finalized. ${this.audioQueue.length} audio files queued for playback`);
  }

  /**
   * Stop all audio playback and clear queue
   */
  stop() {
    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Clean up queue
    while (this.audioQueue.length > 0) {
      const url = this.audioQueue.shift();
      URL.revokeObjectURL(url);
    }

    // Clear buffers
    this.chunkBuffer.clear();
    this.accumulatedChunks = [];
    this.nextSequence = 0;

    this.isPlaying = false;
    this.onPlaybackStateChange?.({ isPlaying: false, queueLength: 0 });
    console.log('Audio playback stopped and queue cleared');
  }

  /**
   * Set mute state
   * @param {boolean} muted - Whether to mute audio
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (this.currentAudio) {
      this.currentAudio.muted = muted;
    }
    console.log('Audio mute state:', muted);
  }

  /**
   * Get current playback state
   * @returns {Object} Current state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.audioQueue.length,
      isMuted: this.isMuted,
      hasCurrentAudio: this.currentAudio !== null,
    };
  }

  /**
   * Convert base64 to Blob
   * @private
   * @param {string} base64 - Base64 encoded data
   * @param {string} mimeType - MIME type
   * @returns {Blob} Audio blob
   */
  base64ToBlob(base64, mimeType) {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:audio\/[a-z]+;base64,/, '');

    const byteCharacters = atob(base64Data);
    const byteArrays = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([byteArrays], { type: mimeType });
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    this.onPlaybackStateChange = null;
    this.onError = null;
  }
}
