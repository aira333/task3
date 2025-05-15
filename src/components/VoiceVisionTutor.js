// src/components/VoiceVisionTutor.js
// Main component that orchestrates the entire application

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Conversation from './Conversation';
import InputArea from './InputArea';
import { processAudio } from '../services/audioService';
import { processImage } from '../services/imageService';
import { generateResponse } from '../services/llmService';
import { socket } from '../utils/api';
import * as mockServices from '../services/mockServices';

const VoiceVisionTutor = ({ useMockMode = false }) => {
  const [conversation, setConversation] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState('');
  const [ocrText, setOcrText] = useState('');

  // Set up socket connection for real-time updates
  useEffect(() => {
    // Listen for processing updates
    socket.on('processing-update', (update) => {
      console.log('Processing update:', update);
    });

    // Listen for errors
    socket.on('error', (errorMsg) => {
      setError(errorMsg);
      setProcessing(false);
    });

    return () => {
      socket.off('processing-update');
      socket.off('error');
    };
  }, []);

  // Handle image upload and processing
  const handleImageUpload = async (imageFile) => {
    if (!imageFile) return null;
    
    try {
      setProcessing(true);
      
      // Use mock or real service based on mode
      const result = useMockMode 
        ? await mockServices.processImage(imageFile)
        : await processImage(imageFile);
      
      if (result.success) {
        setOcrText(result.text);
        return {
          preview: result.preview || URL.createObjectURL(imageFile),
          ocrText: result.text
        };
      } else {
        setError(result.error || 'Image processing failed');
        return null;
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again.');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  // Handle audio recording and processing
  const handleAudioProcessing = async (audioBlob) => {
    if (!audioBlob) return null;
    
    try {
      setProcessing(true);
      
      // Use mock or real service based on mode
      const result = useMockMode 
        ? await mockServices.processAudio(audioBlob)
        : await processAudio(audioBlob);
      
      if (result.success) {
        return result.text;
      } else {
        setError(result.error || 'Audio processing failed');
        return null;
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setError('Failed to process audio. Please try again.');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (textInput, imageData) => {
    if ((!textInput && !imageData) || processing) return;
    
    // Add user message to conversation
    const userMessage = {
      type: 'user',
      text: textInput,
      image: imageData?.preview
    };
    
    setConversation([...conversation, userMessage]);
    setProcessing(true);
    setShowWelcome(false);
    
    try {
      // Generate response using the LLM service
      const result = useMockMode
        ? await mockServices.generateResponse({
            userPrompt: textInput || 'What is this?',
            detectedText: imageData?.ocrText || ocrText
          })
        : await generateResponse({
            userPrompt: textInput || 'What is this?',
            detectedText: imageData?.ocrText || ocrText
          });
      
      if (result.success) {
        const aiResponse = {
          type: 'ai',
          text: result.text
        };
        
        setConversation(prev => [...prev, aiResponse]);
      } else {
        setError(result.error || 'Failed to generate response');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setError('Failed to generate response. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <Header />
      
      <Conversation
        conversation={conversation}
        processing={processing}
        showWelcome={showWelcome}
        error={error}
      />
      
      <InputArea
        onSendMessage={handleSendMessage}
        onImageUpload={handleImageUpload}
        onAudioProcess={handleAudioProcessing}
        processing={processing}
        ocrText={ocrText}
      />
    </div>
  );
};

export default VoiceVisionTutor;