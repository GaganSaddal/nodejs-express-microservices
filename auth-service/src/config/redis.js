const Redis = require('ioredis');
const config = require('./index');
const createLogger = require('../../../shared/utils/logger');

const logger = createLogger(config.serviceName);

/**
 * Create Redis client
 */
const createRedisClient = () => {
  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redis.on('error', (err) => {
    logger.error(`Redis connection error: ${err.message}`);
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    redis.quit(() => {
      logger.info('Redis connection closed through app termination');
    });
  });

  return redis;
};

const redisClient = createRedisClient();

module.exports = redisClient;
