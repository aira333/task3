// server/routes/audio.js
// Routes for handling audio processing with Whisper (OpenAI's open-source ASR model)

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const fetch = require('node-fetch');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + '.webm');
  }
});

// Set up multer upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Convert webm audio to wav format using ffmpeg
const convertWebmToWav = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      outputPath
    ]);
    
    ffmpeg.stderr.on('data', (data) => {
      console.log(`ffmpeg: ${data}`);
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg process exited with code ${code}`));
      }
    });
  });
};

// Process audio with Whisper (local model using Whisper.cpp)
const processAudioWithWhisper = async (audioPath) => {
  return new Promise((resolve, reject) => {
    // Path to whisper.cpp executable - adjust based on your installation
    const whisperPath = process.env.WHISPER_PATH || path.join(__dirname, '../../whisper.cpp/main');
    const modelPath = process.env.WHISPER_MODEL_PATH || path.join(__dirname, '../../whisper.cpp/models/ggml-base.en.bin');
    
    // Execute whisper.cpp command
    const whisper = spawn(whisperPath, [
      '-m', modelPath,
      '-f', audioPath,
      '--output-txt'
    ]);
    
    let output = '';
    let errorOutput = '';
    
    whisper.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    whisper.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log(`whisper stderr: ${data}`);
    });
    
    whisper.on('close', (code) => {
      if (code === 0) {
        // Whisper.cpp normally writes to a .txt file with the same name as input
        const txtPath = audioPath.replace('.wav', '.txt');
        
        if (fs.existsSync(txtPath)) {
          const transcription = fs.readFileSync(txtPath, 'utf8');
          fs.unlinkSync(txtPath); // Delete the txt file
          resolve(transcription.trim());
        } else if (output) {
          // Some versions output directly to stdout
          resolve(output.trim());
        } else {
          reject(new Error('No transcription output found'));
        }
      } else {
        reject(new Error(`Whisper process exited with code ${code}: ${errorOutput}`));
      }
    });
  });
};

/**
 * Process audio with Whisper
 * POST /api/audio/process
 */
router.post('/process', upload.single('audio'), async (req, res, next) => {
  try {
    // Get Socket.IO instance
    const io = req.app.get('io');
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }
    
    // Get file paths
    const webmPath = req.file.path;
    const wavPath = webmPath.replace('.webm', '.wav');
    
    // Notify client that processing has started
    io.emit('processing-update', {
      type: 'audio',
      status: 'started',
      message: 'Starting speech recognition with Whisper'
    });
    
    // Convert webm to wav
    await convertWebmToWav(webmPath, wavPath);
    
    // Notify progress
    io.emit('processing-update', {
      type: 'audio',
      status: 'processing',
      progress: 0.5,
      message: 'Processing audio with Whisper...'
    });
    
    // Process with Whisper
    const text = await processAudioWithWhisper(wavPath);
    
    // Clean up temporary files
    fs.unlinkSync(webmPath);
    fs.unlinkSync(wavPath);
    
    // Notify client that processing is complete
    io.emit('processing-update', {
      type: 'audio',
      status: 'completed',
      message: 'Speech recognition complete'
    });
    
    // Return the results
    return res.status(200).json({
      success: true,
      text: text
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    
    // Delete files if they exist and there's an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        const wavPath = req.file.path.replace('.webm', '.wav');
        if (fs.existsSync(wavPath)) {
          fs.unlinkSync(wavPath);
        }
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error processing audio'
    });
  }
});

module.exports = router;