const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const userService = require('../services/userService');
const redisUtils = require('../utils/redisUtils');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'Auth-Login-Logout-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Logout Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGOUT, fromBeginning: true });
    logger.info(`Logout Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGOUT}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          
          if (!decryptedMessage || !decryptedMessage.userId) {
            throw new Error('invalid uncrypted message or userId not found');
          }
          
          await redisUtils.deleteToken(decryptedMessage.userId);
          logger.info(`Session closed for user: ${decryptedMessage.userId}`);

        } catch (error) {
          logger.error('Error processing message:', error.message);
        }
      },
    });
  } catch (error) {
    logger.error('login Consumer: Error starting consumer:', error);
    throw error;
  }
};

module.exports = { run };