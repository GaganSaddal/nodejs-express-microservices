const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * Security middleware configuration
 */
const securityMiddleware = [
  // Set security HTTP headers
  helmet(),

  // Sanitize request data against NoSQL injection
  mongoSanitize(),

  // Sanitize request data against XSS
  xss(),

  // Prevent HTTP Parameter Pollution
  hpp(),
];

module.exports = securityMiddleware;
