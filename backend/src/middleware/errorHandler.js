const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Map CORS rejection to 403 Forbidden instead of 500 Internal Server Error
  if (err && typeof err.message === 'string' && err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({ success: false, message: 'CORS origin not allowed' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
