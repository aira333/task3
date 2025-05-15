// server/middleware/errorHandler.js
// Error handling middleware for the Express server

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    // Get Socket.IO instance if available
    const io = req.app.get('io');
    
    // Log the error
    console.error('Server error:', err);
    
    // Notify connected clients about the error
    if (io) {
      io.emit('error', err.message || 'An unexpected error occurred');
    }
    
    // Check if headers have already been sent
    if (res.headersSent) {
      return next(err);
    }
    
    // Determine status code (default to 500)
    const statusCode = err.statusCode || 500;
    
    // Send error response
    res.status(statusCode).json({
      success: false,
      error: err.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorHandler;