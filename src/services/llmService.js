// src/services/llmService.js
// Service for handling LLM interactions using Ollama

import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

/**
 * Generate a response using the LLM service via the backend
 * 
 * @param {Object} params - Parameters for generating response
 * @param {string} params.userPrompt - The user's input text
 * @param {string} params.detectedText - Text detected from image
 * @returns {Promise<Object>} - Object containing success status and response text or error
 */
export const generateResponse = async ({ userPrompt, detectedText }) => {
  try {
    // Prepare the request data
    const requestData = {
      userPrompt: userPrompt || 'What is this?',
      detectedText: detectedText || ''
    };
    
    // Send request to backend LLM service
    const response = await axios.post(
      `${API_BASE_URL}/api/llm/generate`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
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
        error: response.data.error || 'Failed to generate response'
      };
    }
  } catch (error) {
    console.error('Error in LLM service:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to generate response'
    };
  }
};