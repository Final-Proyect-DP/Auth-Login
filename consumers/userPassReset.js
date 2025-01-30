const kafka = require('../config/kafkaConfig');
const { decryptMessage } = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'login-service-passReset-group' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Password Reset Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_PASS_RESET, fromBeginning: true });
    logger.info(`Password Reset Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_PASS_RESET}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          // Parse the incoming Kafka message
          const encryptedPayload = JSON.parse(message.value.toString());
          console.log('Received encrypted payload:', encryptedPayload);

          // Decrypt the message using the IV and encryptedData
          const userData = decryptMessage(encryptedPayload);
          console.log('Decrypted message:', userData);

          // Update the user's password in the database using the correct property names
          const user = await User.findByIdAndUpdate(
            userData.userId, // Cambiado de id a userId
            { $set: { password: userData.password } }, // Cambiado de newPassword a password
            { new: true }
          );
          
          if (user) {
            logger.info(`Password updated successfully for user: ${user.id}`);
          } else {
            logger.warn(`User not found for password update: ${userData.userId}`);
          }
        } catch (error) {
          logger.error('Error processing message:', error);
          console.log('Error details:', {
            message: error.message,
            stack: error.stack
          });
        }
      }
    });
  } catch (error) {
    logger.error('Password Reset Consumer: Error in Kafka consumer:', error);
    throw error;
  }
};

run().catch(console.error);

module.exports = { run };
