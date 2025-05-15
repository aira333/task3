// src/services/imageService.js
// Service for handling image processing using Tesseract.js (OCR)

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
 * Process an image file using Tesseract OCR via the backend
 * 
 * @param {File} imageFile - The image file to process
 * @returns {Promise<Object>} - Object containing success status and text or error
 */
export const processImage = async (imageFile) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Send image to backend for OCR processing
    const response = await axios.post(
      `${API_BASE_URL}/api/image/process`,
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
        error: response.data.error || 'Image processing failed'
      };
    }
  } catch (error) {
    console.error('Error in image service:', error);
    return handleApiError(error);
  }
};