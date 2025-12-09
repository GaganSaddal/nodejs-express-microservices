const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config');
const connectDB = require('./config/database');
const createLogger = require('../../shared/utils/logger');
const createMorganMiddleware = require('../../shared/middleware/logger');
const { errorConverter, errorHandler } = require('../../shared/middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/oauth.routes');
const ApiError = require('../../shared/utils/ApiError');

// Initialize OAuth strategies
require('./services/oauth.service');

// Initialize email worker
require('./events/workers/emailWorker');

const logger = createLogger(config.serviceName);

// Connect to database
connectDB();

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Passport
app.use(passport.initialize());

// Request logging
app.use(createMorganMiddleware(config.serviceName));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: config.serviceName });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Error handling
app.use(errorConverter);
app.use(errorHandler);

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  logger.info(`${config.serviceName} running on port ${PORT} in ${config.env} mode`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
