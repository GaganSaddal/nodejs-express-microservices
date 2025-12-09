const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const config = require('../config');
const User = require('../models/User');

/**
 * Google OAuth service
 * @param {Object} profile - Google profile
 * @returns {Promise<User>}
 */
const googleOAuth = async (profile) => {
  const { id, emails, displayName } = profile;
  const email = emails[0].value;

  let user = await User.findOne({ 'oauth.google.id': id });

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing user
      user.oauth.google = { id, email };
      user.isEmailVerified = true;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        email,
        name: displayName,
        password: Math.random().toString(36).slice(-8), // Random password
        oauth: { google: { id, email } },
        isEmailVerified: true,
      });
    }
  }

  return user;
};

/**
 * Apple OAuth service
 * @param {Object} profile - Apple profile
 * @returns {Promise<User>}
 */
const appleOAuth = async (profile) => {
  const { id, email, name } = profile;

  let user = await User.findOne({ 'oauth.apple.id': id });

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      // Link Apple account to existing user
      user.oauth.apple = { id, email };
      user.isEmailVerified = true;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        email,
        name: name || 'Apple User',
        password: Math.random().toString(36).slice(-8), // Random password
        oauth: { apple: { id, email } },
        isEmailVerified: true,
      });
    }
  }

  return user;
};

/**
 * Configure Google OAuth strategy
 */
if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientId,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await googleOAuth(profile);
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

/**
 * Configure Apple OAuth strategy
 */
if (config.oauth.apple.clientId && config.oauth.apple.teamId) {
  passport.use(
    new AppleStrategy(
      {
        clientID: config.oauth.apple.clientId,
        teamID: config.oauth.apple.teamId,
        keyID: config.oauth.apple.keyId,
        privateKeyLocation: config.oauth.apple.privateKeyPath,
        callbackURL: config.oauth.apple.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await appleOAuth(profile);
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

module.exports = {
  googleOAuth,
  appleOAuth,
};
