const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Resource already exists.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'Referenced resource does not exist.' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;