/**
 * 404 Not Found middleware
 * Handles routes that don't exist
 */

const { ApiError } = require('./errorHandler');

const notFound = (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  next(new ApiError(404, message));
};

module.exports = notFound;
