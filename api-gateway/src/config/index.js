const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(3000),
    SERVICE_NAME: Joi.string().default('api-gateway'),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').default(''),
    AUTH_SERVICE_URL: Joi.string().required(),
    USER_SERVICE_URL: Joi.string().required(),
    NOTIFICATION_SERVICE_URL: Joi.string().required(),
    RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
    RATE_LIMIT_MAX_REQUESTS_AUTH: Joi.number().default(1000),
    CORS_ORIGIN: Joi.string().default('*'),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    SWAGGER_ENABLED: Joi.boolean().default(true),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  serviceName: envVars.SERVICE_NAME,
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  services: {
    authService: envVars.AUTH_SERVICE_URL,
    userService: envVars.USER_SERVICE_URL,
    notificationService: envVars.NOTIFICATION_SERVICE_URL,
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
    maxAuth: envVars.RATE_LIMIT_MAX_REQUESTS_AUTH,
  },
  cors: {
    origin: envVars.CORS_ORIGIN,
  },
  logLevel: envVars.LOG_LEVEL,
  swagger: {
    enabled: envVars.SWAGGER_ENABLED,
  },
};
