// src/services/audioService.js
// Service for handling audio processing using DeepSpeech

import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

// For better error handling in API calls
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with non-2xx status
    console.error('API Error Response:', error.response.status, error.response.data);
    return {
      success: false,
      error: `Server error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`
    };
  } else if (error.request) {
    // Request made but no response received
    console.error('API No Response:', error.request);
    return {
      success: false,
      error: 'No response from server. Please check server connectivity.'
    };
  } else {
    // Request setup failed
    console.error('API Request Error:', error.message);
    return {
      success: false,
      error: `Request failed: ${error.message}`
    };
  }
};

/**
 * Process an audio blob using DeepSpeech via the backend
 * 
 * @param {Blob} audioBlob - The audio blob to process
 * @returns {Promise<Object>} - Object containing success status and text or error
 */
export const processAudio = async (audioBlob) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Send audio to backend for speech recognition
    const response = await axios.post(
      `${API_BASE_URL}/api/audio/process`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        text: response.data.text
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Audio processing failed'
      };
    }
  } catch (error) {
    console.error('Error in audio service:', error);
    return handleApiError(error);
  }
};