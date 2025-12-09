const nodemailer = require('nodemailer');
const config = require('../config');
const createLogger = require('../../../shared/utils/logger');

const logger = createLogger(config.serviceName);

/**
 * Create email transporter
 */
const transporter = nodemailer.createTransport(config.email.smtp);

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    logger.error(`Email transporter verification failed: ${error.message}`);
  } else {
    logger.info('Email transporter is ready');
  }
});

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, html) => {
  const msg = {
    from: config.email.from,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(msg);
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw new Error('Failed to send email');
  }
};

/**
 * Send verification email
 * @param {string} to - Recipient email
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Thank you for registering! Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (to, token) => {
  const subject = 'Password Reset';
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset</h2>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome ${name}!</h2>
      <p>Thank you for joining us. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
