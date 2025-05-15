// src/components/InputArea.js
// Component for handling user input (text, image, audio)

import React, { useState, useRef } from 'react';
import { Mic, Image, Send, X, Loader } from 'lucide-react';
import DrawDiagram from './DrawDiagram';

const InputArea = ({ onSendMessage, onImageUpload, onAudioProcess, processing, ocrText }) => {
  const [recording, setRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageOcrText, setImageOcrText] = useState('');
  const [showDiagram, setShowDiagram] = useState(false);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Handle file selection for images
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Process image with OCR service
      const imageData = await onImageUpload(file);
      
      if (imageData) {
        setImagePreview(imageData.preview);
        setImageOcrText(imageData.ocrText);
      }
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Clear image data
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageOcrText('');
  };
  
  // Start audio recording
  const startRecording = () => {
    setRecording(true);
    audioChunksRef.current = [];
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Process audio with speech recognition service
          const transcribedText = await onAudioProcess(audioBlob);
          
          if (transcribedText) {
            setTextInput(transcribedText);
          }
          
          setRecording(false);
        };
        
        mediaRecorder.start();
      })
      .catch(error => {
        console.error("Error accessing microphone:", error);
        setRecording(false);
      });
  };
  
  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  // Toggle recording state
  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Send message to parent component
  const sendMessage = () => {
    if ((!textInput && !imagePreview) || processing) return;
    
    const imageData = imagePreview ? {
      preview: imagePreview,
      ocrText: imageOcrText
    } : null;
    
    onSendMessage(textInput, imageData);
    setTextInput('');
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Show detected OCR text
  const getDebugInfo = () => {
    if (!imagePreview) return null;
    
    return (
      <div className="mt-1 text-xs text-gray-400">
        {imageOcrText ? `OCR detected: "${imageOcrText}"` : "Processing image..."}
      </div>
    );
  };
  
  // Handle diagram submission
  const handleDiagramSubmit = async (dataUrl) => {
    // Convert dataURL to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    // Use the same image upload logic
    const imageData = await onImageUpload(blob);
    if (imageData) {
      setImageFile(blob);
      setImagePreview(imageData.preview);
      setImageOcrText(imageData.ocrText);
    }
    setShowDiagram(false); // Hide the canvas after submitting
  };

  const handleOpenDiagram = () => setShowDiagram(true);
  const handleCloseDiagram = () => setShowDiagram(false);
  
  return (
    <div className="border-t border-gray-200 p-4">
      {/* Diagram Drawing Feature */}
      {showDiagram ? (
        <div className="mb-2 relative">
          <button onClick={handleCloseDiagram} className="absolute top-0 right-0 text-xs px-2 py-1 bg-gray-300 rounded">Close</button>
          <DrawDiagram onSubmit={handleDiagramSubmit} />
        </div>
      ) : (
        <button onClick={handleOpenDiagram} className="mb-2 px-3 py-1 bg-blue-500 text-white rounded">Draw Diagram</button>
      )}
      
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="h-16 rounded"
          />
          <button 
            className="absolute top-1 right-1 bg-gray-800 rounded-full p-1 text-white"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </button>
          {getDebugInfo()}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <button 
          className={`p-2 rounded-full ${recording ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
          onClick={toggleRecording}
          disabled={processing}
        >
          <Mic className="h-5 w-5" />
        </button>
        
        <button 
          className="p-2 rounded-full bg-gray-100"
          onClick={triggerFileInput}
          disabled={processing}
        >
          <Image className="h-5 w-5" />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </button>
        
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          placeholder={recording ? "Listening..." : "Type or speak your question..."}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={recording || processing}
        />
        
        <button 
          className="p-2 rounded-full bg-black text-white disabled:bg-gray-300"
          onClick={sendMessage}
          disabled={(!textInput && !imagePreview) || recording || processing}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      {recording && (
        <div className="mt-2 text-sm text-gray-500 animate-pulse">
          Recording... Speak clearly (using DeepSpeech)
        </div>
      )}
    </div>
  );
};

export default InputArea;