const kafka = require('../config/kafkaConfig');
const { decryptMessage } = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'Auth-Login-PassReset-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Pass Reset Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_PASS_RESET, fromBeginning: true });
    logger.info(`Pass Reset Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_PASS_RESET}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedPayload = JSON.parse(message.value.toString());
          logger.info('Processing password reset request');

          const userData = decryptMessage(encryptedPayload);
          logger.info(`Updating password for user: ${userData.userId}`);

          if (!userData.hashedPassword) {
            throw new Error('No hashedPassword provided in message');
          }

          const user = await User.findByIdAndUpdate(
            userData.userId,
            { 
              $set: { 
                password: userData.hashedPassword 
              } 
            },
            { new: true }
          );
          
          if (user) {
            logger.info(`Password updated for user: ${user.id}`);
          } else {
            logger.error(`User not found: ${userData.userId}`);
          }
        } catch (error) {
          logger.error('Error processing password reset:', error);
          logger.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
        }
      }
    });
  } catch (error) {
    logger.error('Error in Kafka consumer:', error);
    throw error;
  }
};

module.exports = { run };
