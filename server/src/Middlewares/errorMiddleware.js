/**
 * Centralized error handler middleware.
 * Formats errors to ensure consistent JSON API responses.
 * Never exposes stack traces or secrets to the client.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('API Error:', err);

  let statusCode = 500;
  let message = 'An unexpected server error occurred';
  let errors = [];

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key error (e.g., unique email)
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate entry detected';
    const field = Object.keys(err.keyValue)[0];
    errors = [`The value for '${field}' is already in use.`];
  }

  // Mongoose invalid ObjectId type cast
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid reference format for field: ${err.path}`;
    errors = [`The value '${err.value}' is not a valid ObjectId.`];
  }

  // Multer upload limit error
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size limit exceeded';
    errors = ['The uploaded image exceeds the maximum limit of 5MB.'];
  }

  // Multer generic upload errors
  else if (err.message && err.message.startsWith('Invalid image format')) {
    statusCode = 400;
    message = 'File validation failed';
    errors = [err.message];
  }

  // General Error instances with status codes
  else {
    statusCode = err.statusCode || 500;
    message = err.message || message;
    errors = err.errors || [message];
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors.length > 0 ? errors : [message]
  });
};

module.exports = errorMiddleware;
