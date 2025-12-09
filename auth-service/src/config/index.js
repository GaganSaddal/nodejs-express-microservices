const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Validation schema for environment variables
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(3001),
    SERVICE_NAME: Joi.string().default('auth-service'),
    MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').default(''),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
    JWT_RESET_PASSWORD_EXPIRATION: Joi.string().default('10m'),
    JWT_VERIFY_EMAIL_EXPIRATION: Joi.string().default('24h'),
    API_KEY_GATEWAY: Joi.string().required(),
    API_KEY_USER_SERVICE: Joi.string().required(),
    API_KEY_NOTIFICATION_SERVICE: Joi.string().required(),
    SMTP_HOST: Joi.string().description('SMTP server host'),
    SMTP_PORT: Joi.number().description('SMTP server port'),
    SMTP_USERNAME: Joi.string().description('SMTP username'),
    SMTP_PASSWORD: Joi.string().description('SMTP password'),
    EMAIL_FROM: Joi.string().description('Email from address'),
    GOOGLE_CLIENT_ID: Joi.string().allow(''),
    GOOGLE_CLIENT_SECRET: Joi.string().allow(''),
    GOOGLE_CALLBACK_URL: Joi.string().allow(''),
    APPLE_CLIENT_ID: Joi.string().allow(''),
    APPLE_TEAM_ID: Joi.string().allow(''),
    APPLE_KEY_ID: Joi.string().allow(''),
    APPLE_PRIVATE_KEY_PATH: Joi.string().allow(''),
    APPLE_CALLBACK_URL: Joi.string().allow(''),
    RABBITMQ_URL: Joi.string().default('amqp://localhost:5672'),
    QUEUE_NAME: Joi.string().default('auth-queue'),
    RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
    CORS_ORIGIN: Joi.string().default('*'),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
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
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION,
    verifyEmailExpirationHours: envVars.JWT_VERIFY_EMAIL_EXPIRATION,
  },
  apiKeys: {
    gateway: envVars.API_KEY_GATEWAY,
    userService: envVars.API_KEY_USER_SERVICE,
    notificationService: envVars.API_KEY_NOTIFICATION_SERVICE,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  oauth: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    apple: {
      clientId: envVars.APPLE_CLIENT_ID,
      teamId: envVars.APPLE_TEAM_ID,
      keyId: envVars.APPLE_KEY_ID,
      privateKeyPath: envVars.APPLE_PRIVATE_KEY_PATH,
      callbackURL: envVars.APPLE_CALLBACK_URL,
    },
  },
  rabbitmq: {
    url: envVars.RABBITMQ_URL,
    queueName: envVars.QUEUE_NAME,
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  cors: {
    origin: envVars.CORS_ORIGIN,
  },
  logLevel: envVars.LOG_LEVEL,
};
