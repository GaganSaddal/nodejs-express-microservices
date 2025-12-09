const passport = require('passport');
const httpStatus = require('http-status');
const tokenService = require('../services/token.service');
const catchAsync = require('../../../shared/utils/catchAsync');
const ApiResponse = require('../../../shared/utils/ApiResponse');

/**
 * Google OAuth callback
 */
const googleCallback = catchAsync(async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const tokens = await tokenService.generateAuthTokens(req.user._id, ip);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', tokens.refresh.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: tokens.refresh.expires,
  });

  // Redirect to frontend with access token
  const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${tokens.access.token}`;
  res.redirect(redirectUrl);
});

/**
 * Apple OAuth callback
 */
const appleCallback = catchAsync(async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const tokens = await tokenService.generateAuthTokens(req.user._id, ip);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', tokens.refresh.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: tokens.refresh.expires,
  });

  // Redirect to frontend with access token
  const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${tokens.access.token}`;
  res.redirect(redirectUrl);
});

module.exports = {
  googleCallback,
  appleCallback,
};
