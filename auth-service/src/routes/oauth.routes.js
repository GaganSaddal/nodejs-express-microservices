const express = require('express');
const passport = require('passport');
const oauthController = require('../controllers/oauth.controller');

const router = express.Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [OAuth]
 *     responses:
 *       "302":
 *         description: Redirect to Google
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     responses:
 *       "302":
 *         description: Redirect to client
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  oauthController.googleCallback
);

/**
 * @swagger
 * /auth/apple:
 *   get:
 *     summary: Apple OAuth login
 *     tags: [OAuth]
 *     responses:
 *       "302":
 *         description: Redirect to Apple
 */
router.get('/apple', passport.authenticate('apple'));

/**
 * @swagger
 * /auth/apple/callback:
 *   post:
 *     summary: Apple OAuth callback
 *     tags: [OAuth]
 *     responses:
 *       "302":
 *         description: Redirect to client
 */
router.post(
  '/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: '/login' }),
  oauthController.appleCallback
);

module.exports = router;
