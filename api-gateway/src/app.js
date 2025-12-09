const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const config = require('./config');
const createLogger = require('../../shared/utils/logger');
const createMorganMiddleware = require('../../shared/middleware/logger');
const rateLimiter = require('./middleware/rateLimiter');

const logger = createLogger(config.serviceName);

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
// Body parser removed to allow proxying of request body
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(createMorganMiddleware(config.serviceName));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: config.serviceName });
});

// Swagger documentation
if (config.swagger.enabled) {
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, './config/swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    logger.info('Swagger documentation available at /api-docs');
  } catch (error) {
    logger.warn('Swagger documentation not available');
  }
}

// Proxy to Auth Service
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: config.services.authService,
    changeOrigin: true,
    onError: (err, req, res) => {
      logger.error(`Proxy error to auth service: ${err.message}`);
      res.status(503).json({ error: 'Auth service unavailable' });
    },
  })
);

// Proxy to User Service
app.use(
  '/api/users',
  createProxyMiddleware({
    target: config.services.userService,
    changeOrigin: true,
    onError: (err, req, res) => {
      logger.error(`Proxy error to user service: ${err.message}`);
      res.status(503).json({ error: 'User service unavailable' });
    },
  })
);

// Proxy to Notification Service
app.use(
  '/api/notifications',
  createProxyMiddleware({
    target: config.services.notificationService,
    changeOrigin: true,
    onError: (err, req, res) => {
      logger.error(`Proxy error to notification service: ${err.message}`);
      res.status(503).json({ error: 'Notification service unavailable' });
    },
  })
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

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

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
