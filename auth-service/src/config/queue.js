const { Queue, Worker } = require('bullmq');
const config = require('./index');
const redisClient = require('./redis');
const createLogger = require('../../../shared/utils/logger');

const logger = createLogger(config.serviceName);

/**
 * Create BullMQ queue
 */
const createQueue = (queueName) => {
  const queue = new Queue(queueName, {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    },
  });

  logger.info(`Queue "${queueName}" created`);
  return queue;
};

/**
 * Create BullMQ worker
 */
const createWorker = (queueName, processor) => {
  const worker = new Worker(queueName, processor, {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    },
  });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed: ${err.message}`);
  });

  logger.info(`Worker for queue "${queueName}" started`);
  return worker;
};

// Email queue
const emailQueue = createQueue('email');

module.exports = {
  createQueue,
  createWorker,
  emailQueue,
};
