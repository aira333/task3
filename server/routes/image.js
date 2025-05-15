// server/routes/image.js
// Routes for handling image processing with Tesseract OCR

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');

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
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

// Set up multer upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Process image with Tesseract OCR
 * POST /api/image/process
 */
router.post('/process', upload.single('image'), async (req, res, next) => {
  try {
    // Get Socket.IO instance
    const io = req.app.get('io');
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }
    
    // Get file path
    const imagePath = req.file.path;
    
    // Notify client that processing has started
    io.emit('processing-update', {
      type: 'image',
      status: 'started',
      message: 'Starting OCR processing'
    });
    
    // Initialize Tesseract worker
    const worker = await createWorker();
    
    // Set progress handler
    worker.setProgressHandler((progress) => {
      io.emit('processing-update', {
        type: 'image',
        status: 'processing',
        progress: progress.progress,
        message: `OCR processing: ${Math.floor(progress.progress * 100)}%`
      });
    });
    
    // Recognize text in image
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_ocr_engine_mode: 1, // 1 = neural net LSTM engine only
      preserve_interword_spaces: 1,
    });
    
    // Process the image
    const { data } = await worker.recognize(imagePath);
    
    // Clean up the worker
    await worker.terminate();
    
    // Remove the temporary file
    fs.unlinkSync(imagePath);
    
    // Special handling for math equations
    let text = data.text.trim();
    
    // Notify client that processing is complete
    io.emit('processing-update', {
      type: 'image',
      status: 'completed',
      message: 'OCR processing complete'
    });
    
    // Return the results
    return res.status(200).json({
      success: true,
      text: text,
      confidence: data.confidence
    });
  } catch (error) {
    console.error('Error processing image:', error);
    
    // Delete file if it exists and there's an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error processing image'
    });
  }
});

module.exports = router;