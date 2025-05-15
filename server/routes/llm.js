// server/routes/llm.js
// Routes for handling LLM interactions with Ollama

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Ollama API URL (can be configured in .env)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

/**
 * Generate response using Ollama
 * POST /api/llm/generate
 */
router.post('/generate', async (req, res, next) => {
  try {
    // Get Socket.IO instance
    const io = req.app.get('io');
    
    // Get request data
    const { userPrompt, detectedText } = req.body;
    
    // Validate request data
    if (!userPrompt && !detectedText) {
      return res.status(400).json({
        success: false,
        error: 'No input provided'
      });
    }
    
    // Notify client that processing has started
    io.emit('processing-update', {
      type: 'llm',
      status: 'started',
      message: 'Generating response'
    });
    
    // Create a prompt that combines the user's question with any detected text
    let prompt = '';
    
    if (detectedText) {
      prompt = `I have the following content: "${detectedText}". My question is: ${userPrompt || "What is this?"}`;
    } else {
      prompt = userPrompt;
    }
    
    // Create system message for educational context
    const systemMessage = `You are an educational assistant specializing in explaining concepts and solving problems. 
Provide clear, step-by-step explanations that help students understand the underlying principles.
For math problems, show each step of the calculation.
For science concepts, use clear explanations with examples.`;
    
    // Make request to Ollama API
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      })
    });
    
    // Parse response
    const data = await response.json();
    
    // Check for valid response
    if (!data.message) {
      throw new Error('Invalid response from LLM service');
    }
    
    // Notify client that processing is complete
    io.emit('processing-update', {
      type: 'llm',
      status: 'completed',
      message: 'Response generated'
    });
    
    // Return the response
    return res.status(200).json({
      success: true,
      text: data.message.content
    });
  } catch (error) {
    console.error('Error generating LLM response:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error generating response'
    });
  }
});

/**
 * Check if LLM service is available
 * GET /api/llm/health
 */
router.get('/health', async (req, res, next) => {
  try {
    // Check Ollama API availability
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    
    // Check if the required model is available
    const modelAvailable = data.models && data.models.some(model => model.name === OLLAMA_MODEL);
    
    return res.status(200).json({
      success: true,
      available: true,
      modelAvailable: modelAvailable
    });
  } catch (error) {
    console.error('Error checking LLM service health:', error);
    
    return res.status(200).json({
      success: true,
      available: false,
      error: error.message
    });
  }
});

module.exports = router;