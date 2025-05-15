// src/utils/helpers.js
// Utility functions for the application

/**
 * Format a date for display
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  /**
   * Truncate text to a maximum length
   * @param {string} text - The text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Generate a unique ID
   * @returns {string} - Unique ID
   */
  export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  /**
   * Convert blob to base64
   * @param {Blob} blob - The blob to convert
   * @returns {Promise<string>} - Base64 string
   */
  export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  /**
   * Validate file type
   * @param {File} file - The file to validate
   * @param {Array<string>} allowedTypes - Array of allowed MIME types
   * @returns {boolean} - True if valid
   */
  export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  };
  
  /**
   * Format bytes to human-readable size
   * @param {number} bytes - Size in bytes
   * @returns {string} - Formatted size
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Detect if the device is mobile
   * @returns {boolean} - True if mobile device
   */
  export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  /**
   * Check browser support for features
   * @returns {Object} - Object with support flags
   */
  export const checkBrowserSupport = () => {
    return {
      mediaRecorder: 'MediaRecorder' in window,
      audioContext: 'AudioContext' in window || 'webkitAudioContext' in window,
      fileReader: 'FileReader' in window,
      webSockets: 'WebSocket' in window,
    };
  };