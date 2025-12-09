const httpStatus = require('http-status');
const config = require('../config');
const ApiError = require('../../../shared/utils/ApiError');

/**
 * API Key authentication middleware for internal service communication
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'API key required'));
  }

  const validApiKeys = [
    config.apiKeys.gateway,
    config.apiKeys.userService,
    config.apiKeys.notificationService,
  ];

  if (!validApiKeys.includes(apiKey)) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid API key'));
  }

  // Store which service is making the request
  if (apiKey === config.apiKeys.gateway) {
    req.serviceId = 'api-gateway';
  } else if (apiKey === config.apiKeys.userService) {
    req.serviceId = 'user-service';
  } else if (apiKey === config.apiKeys.notificationService) {
    req.serviceId = 'notification-service';
  }

  next();
};

module.exports = apiKeyAuth;
