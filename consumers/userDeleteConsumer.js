const kafka = require('../config/kafkaConfig');
const { decryptMessage } = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'login-service-delete-group' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Delete Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_DELETE, fromBeginning: true });
    logger.info(`Delete Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_DELETE}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log('Received message:', message.value.toString());
        let encryptedMessage;
        try {
          encryptedMessage = JSON.parse(message.value.toString());
        } catch (error) {
          console.error('Error parsing message as JSON:', error);
          return;
        }
        console.log('Encrypted message:', encryptedMessage);
        const decryptedMessage = decryptMessage(encryptedMessage);
        console.log('Decrypted message:', decryptedMessage);
        const { id } = JSON.parse(decryptedMessage);

        console.log('User ID to delete:', id);

        const user = await User.findByIdAndDelete(id);
        if (user) {
          console.log('User deleted successfully:', user.id);
        } else {
          console.log('User not found:', id);
        }
      }
    });
  } catch (error) {
    logger.error('Delete Consumer: Error in Kafka consumer:', error);
    throw error;
  }
};

run().catch(console.error);

module.exports = { run };
