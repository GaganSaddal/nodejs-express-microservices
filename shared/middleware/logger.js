const morgan = require('morgan');
const createLogger = require('../utils/logger');

/**
 * Create Morgan middleware with Winston logger
 * @param {string} serviceName - Name of the service
 * @returns {Function} Morgan middleware
 */
const createMorganMiddleware = (serviceName) => {
  const logger = createLogger(serviceName);

  // Morgan token for response time
  morgan.token('message', (req, res) => res.locals.errorMessage || '');

  const getIpFormat = () => (process.env.NODE_ENV === 'production' ? ':remote-addr - ' : '');
  const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
  const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

  const successHandler = morgan(successResponseFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.info(message.trim()) },
  });

  const errorHandler = morgan(errorResponseFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.error(message.trim()) },
  });

  return [successHandler, errorHandler];
};

module.exports = createMorganMiddleware;
