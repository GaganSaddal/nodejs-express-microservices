const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const RefreshToken = require('../models/RefreshToken');
const redisClient = require('../config/redis');

/**
 * Generate JWT token
 * @param {ObjectId} userId
 * @param {string} type - Token type (access, refresh, etc.)
 * @param {string} expires - Expiration time
 * @param {string} [secret] - JWT secret
 * @returns {string}
 */
const generateToken = (userId, type, expires, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    type,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, secret, { expiresIn: expires });
};

/**
 * Verify JWT token
 * @param {string} token
 * @param {string} type - Expected token type
 * @returns {Promise<Object>}
 */
const verifyToken = async (token, type) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    if (payload.type !== type) {
      throw new Error('Invalid token type');
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new Error('Token has been revoked');
    }

    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Generate auth tokens (access + refresh)
 * @param {ObjectId} userId
 * @param {string} [ip] - User's IP address
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (userId, ip) => {
  const accessToken = generateToken(userId, 'access', config.jwt.accessExpirationMinutes);
  const refreshTokenExpires = new Date();
  refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

  const refreshTokenValue = generateToken(userId, 'refresh', config.jwt.refreshExpirationDays);

  // Save refresh token to database
  const refreshToken = await RefreshToken.create({
    token: refreshTokenValue,
    user: userId,
    expires: refreshTokenExpires,
    createdByIp: ip,
  });

  return {
    access: {
      token: accessToken,
      expires: config.jwt.accessExpirationMinutes,
    },
    refresh: {
      token: refreshToken.token,
      expires: refreshToken.expires,
    },
  };
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @param {string} [ip] - User's IP address
 * @returns {Promise<Object>}
 */
const refreshAuthTokens = async (refreshToken, ip) => {
  try {
    const payload = await verifyToken(refreshToken, 'refresh');
    const refreshTokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      user: payload.sub,
    });

    if (!refreshTokenDoc || !refreshTokenDoc.isActive) {
      throw new Error('Invalid refresh token');
    }

    // Revoke old refresh token
    refreshTokenDoc.revokedAt = new Date();
    refreshTokenDoc.revokedByIp = ip;
    await refreshTokenDoc.save();

    // Generate new tokens
    const tokens = await generateAuthTokens(payload.sub, ip);
    refreshTokenDoc.replacedByToken = tokens.refresh.token;
    await refreshTokenDoc.save();

    return tokens;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Revoke token (add to blacklist)
 * @param {string} token
 * @param {string} type - Token type
 * @returns {Promise<void>}
 */
const revokeToken = async (token, type = 'access') => {
  const payload = jwt.decode(token);
  if (!payload) {
    throw new Error('Invalid token');
  }

  const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
  if (expiresIn > 0) {
    await redisClient.setex(`blacklist:${token}`, expiresIn, '1');
  }

  // If refresh token, also revoke in database
  if (type === 'refresh') {
    await RefreshToken.updateOne({ token }, { revokedAt: new Date() });
  }
};

/**
 * Revoke all user tokens
 * @param {ObjectId} userId
 * @returns {Promise<void>}
 */
const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
};

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens,
  refreshAuthTokens,
  revokeToken,
  revokeAllUserTokens,
};
