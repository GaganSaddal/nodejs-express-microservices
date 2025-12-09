const httpStatus = require('http-status');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const catchAsync = require('../../../shared/utils/catchAsync');
const ApiResponse = require('../../../shared/utils/ApiResponse');

/**
 * Register
 */
const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(httpStatus.CREATED).json(
    ApiResponse.created(
      { user },
      'Registration successful. Please check your email to verify your account.'
    )
  );
});

/**
 * Login
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const { user, tokens } = await authService.login(email, password, ip);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', tokens.refresh.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: tokens.refresh.expires,
  });

  res.json(
    ApiResponse.success({
      user,
      accessToken: tokens.access.token,
    })
  );
});

/**
 * Logout
 */
const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logout(refreshToken);

  res.clearCookie('refreshToken');
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Refresh tokens
 */
const refreshTokens = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const ip = req.ip || req.connection.remoteAddress;
  const tokens = await authService.refreshTokens(refreshToken, ip);

  // Set new refresh token in HTTP-only cookie
  res.cookie('refreshToken', tokens.refresh.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: tokens.refresh.expires,
  });

  res.json(
    ApiResponse.success({
      accessToken: tokens.access.token,
    })
  );
});

/**
 * Verify email
 */
const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.json(ApiResponse.success(null, 'Email verified successfully'));
});

/**
 * Forgot password
 */
const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json(
    ApiResponse.success(null, 'If that email exists, a password reset link has been sent')
  );
});

/**
 * Reset password
 */
const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.json(ApiResponse.success(null, 'Password reset successful'));
});

/**
 * Change password
 */
const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.oldPassword, req.body.newPassword);
  res.json(ApiResponse.success(null, 'Password changed successfully'));
});

/**
 * Get current user
 */
const getCurrentUser = catchAsync(async (req, res) => {
  res.json(ApiResponse.success({ user: req.user }));
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
};
