const { createWorker } = require('../../config/queue');
const emailService = require('../../services/email.service');
const createLogger = require('../../../../shared/utils/logger');
const config = require('../../config');

const logger = createLogger(config.serviceName);

/**
 * Email queue worker
 */
const emailWorker = createWorker('email', async (job) => {
  const { name, data } = job;

  try {
    switch (name) {
      case 'send-verification-email':
        await emailService.sendVerificationEmail(data.email, data.token);
        break;
      case 'send-password-reset-email':
        await emailService.sendPasswordResetEmail(data.email, data.token);
        break;
      case 'send-welcome-email':
        await emailService.sendWelcomeEmail(data.email, data.name);
        break;
      default:
        logger.warn(`Unknown email job type: ${name}`);
    }
  } catch (error) {
    logger.error(`Email job failed: ${error.message}`);
    throw error;
  }
});

module.exports = emailWorker;
