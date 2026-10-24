const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;

  if (!statusCode) {
    statusCode = 500;
    message = message || 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
