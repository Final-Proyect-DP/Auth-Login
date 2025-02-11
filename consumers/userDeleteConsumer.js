const kafka = require('../config/kafkaConfig');
const { decryptMessage } = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'Auth-Login-Delete-Consumer' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Delete Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_DELETE, fromBeginning: true });
    logger.info(`Delete Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_DELETE}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let encryptedMessage;
        try {
          encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = decryptMessage(encryptedMessage);
          const { id } = JSON.parse(decryptedMessage);

          logger.info(`Attempting to delete user: ${id}`);
          const user = await User.findByIdAndDelete(id);
          
          if (user) {
            logger.info(`User deleted successfully: ${user.id}`);
          } else {
            logger.warn(`User not found for deletion: ${id}`);
          }
        } catch (error) {
          logger.error('Error processing delete message:', error);
        }
      }
    });
  } catch (error) {
    logger.error('Delete Consumer: Error in Kafka consumer:', error);
    throw error;
  }
};

module.exports = { run };
