const httpStatus = require('http-status');
const tokenService = require('../services/token.service');
const User = require('../models/User');
const ApiError = require('../../../shared/utils/ApiError');
const catchAsync = require('../../../shared/utils/catchAsync');

/**
 * Authenticate user with JWT
 */
const auth = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }

  try {
    const payload = await tokenService.verifyToken(token, 'access');
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
});

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const payload = await tokenService.verifyToken(token, 'access');
      const user = await User.findById(payload.sub);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
  }

  next();
});

module.exports = {
  auth,
  optionalAuth,
};
