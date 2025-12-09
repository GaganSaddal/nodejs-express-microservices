const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default || require('rate-limit-redis').RedisStore || require('rate-limit-redis');
const Redis = require('ioredis');
const config = require('../config');

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
});

/**
 * Rate limiter middleware with Redis store
 */
const rateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'rl:',
  }),
  windowMs: config.rateLimit.windowMs,
  max: (req) => {
    // Higher limit for authenticated users
    if (req.headers.authorization) {
      return config.rateLimit.maxAuth;
    }
    return config.rateLimit.max;
  },
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

module.exports = rateLimiter;
