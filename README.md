# Task - Reinventing Educational Interaction through Multimodal AI

## What I Built

Hey there! This is my project for the AI-powered educational tool assignment. I've created an app that lets students learn by talking to their device and showing it images of problems they need help with.

## Current Status - UI Mockup Only! 

**Important Note:** This is currently just a UI mockup! Getting the AI APIs working has been... challenging

I've spent days trying to get the backend connections working with all the AI models, but ran into some frustrating issues with local development. Rather than submit nothing, I created this interactive mockup that shows how the finished product would work.

## The Concept

VoiceVision Tutor combines:
- **Voice input** (using Whisper) - so you can just ask questions naturally
- **Image recognition** (using Tesseract OCR) - to understand diagrams, math problems, etc.
- **AI responses** (using open-source LLMs like Llama) - to give helpful educational answers

## Technologies Used

I'm using these open-source technologies (when the API connections are fixed):

- **Whisper** for converting speech to text
- **Tesseract.js** for reading text and math from images
- **Ollama** for running local LLMs like Llama 3
- **React** for the frontend
- **Node.js/Express** for the backend

## Why This Helps Students

- **Multiple Learning Styles** - speak, show, or type questions
- **Immediate Help** - like having a tutor 24/7
- **Accessibility** - helps students with different needs
- **Visual Learning** - combines text and visuals for better understanding

## What's Working vs. What's Not

### ✅ Working in this Demo:
- Complete UI for the educational assistant
- Mockup of conversation flow
- Image upload interface
- Voice input UI
- Sample educational responses

### ❌ Still Need to Fix:
- Connection to the Whisper API for voice recognition
- Connection to Tesseract for image processing
- Connection to Ollama for AI responses
- Backend server connection issues

## Next Steps

I plan to continue working on:
1. Fixing the API connections (they're configured but not connecting)
2. Completing the server setup
3. Adding more educational content examples
4. Improving accessibility features

## How to Run This Mockup

1. Clone the repository
2. Run `npm install`
3. Run `npm start` to see the UI mockup

## Evaluation Points

- **Creativity** - Combines voice, image, and AI in one educational tool
- **Feasibility** - All the technologies exist, just need to connect properly
- **User-Centered** - Designed based on how students actually learn
- **Technical** - Integrates multiple AI models (when working!)

Note: I will be able to get the API's working in by tomorrow, thanks!