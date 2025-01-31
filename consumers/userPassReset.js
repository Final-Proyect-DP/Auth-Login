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
          const encryptedPayload = JSON.parse(message.value.toString());
          logger.info('Processing password reset request');

          const userData = decryptMessage(encryptedPayload);
          logger.info(`Attempting to update password for user: ${userData.userId}`);

          // Verificar que tenemos la contraseña hasheada
          if (!userData.hashedPassword) {
            throw new Error('No hashedPassword provided in message');
          }

          // Actualizar usando hashedPassword en lugar de password
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
            logger.info(`Password updated successfully for user: ${user.id}`);
            logger.info(`New password hash: ${user.password}`);
          } else {
            logger.error(`User not found for password update: ${userData.userId}`);
          }
        } catch (error) {
          logger.error('Error processing password reset:', error);
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
