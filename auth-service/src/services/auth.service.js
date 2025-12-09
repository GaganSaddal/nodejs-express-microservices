const httpStatus = require('http-status');
const crypto = require('crypto');
const User = require('../models/User');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const { emailQueue } = require('../config/queue');
const ApiError = require('../../../shared/utils/ApiError');

/**
 * Register a new user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const register = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const user = await User.create(userBody);

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Queue email sending
  await emailQueue.add('send-verification-email', {
    email: user.email,
    token: verificationToken,
  });

  return user;
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} [ip] - User's IP address
 * @returns {Promise<Object>}
 */
const login = async (email, password, ip) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.isPasswordMatch(password))) {
    if (user) {
      await user.incLoginAttempts();
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  if (user.isLocked()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is locked due to too many failed login attempts');
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const tokens = await tokenService.generateAuthTokens(user._id, ip);

  return { user, tokens };
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const logout = async (refreshToken) => {
  await tokenService.revokeToken(refreshToken, 'refresh');
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @param {string} [ip] - User's IP address
 * @returns {Promise<Object>}
 */
const refreshTokens = async (refreshToken, ip) => {
  return tokenService.refreshAuthTokens(refreshToken, ip);
};

/**
 * Verify email
 * @param {string} token
 * @returns {Promise<void>}
 */
const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // Send welcome email
  await emailQueue.add('send-welcome-email', {
    email: user.email,
    name: user.name,
  });
};

/**
 * Forgot password
 * @param {string} email
 * @returns {Promise<void>}
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists
    return;
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // Queue password reset email
  await emailQueue.add('send-password-reset-email', {
    email: user.email,
    token: resetToken,
  });
};

/**
 * Reset password
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Revoke all existing tokens
  await tokenService.revokeAllUserTokens(user._id);
};

/**
 * Change password
 * @param {ObjectId} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);

  if (!user || !(await user.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }

  user.password = newPassword;
  await user.save();

  // Revoke all existing tokens
  await tokenService.revokeAllUserTokens(user._id);
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};
