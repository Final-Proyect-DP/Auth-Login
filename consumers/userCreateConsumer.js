const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const userService = require('../services/userService');
const User = require('../models/User');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'login-service-create-group' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Create Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_USER_CREATE, fromBeginning: true });
    logger.info(`Create Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_USER_CREATE}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          // Recibir el mensaje encriptado exactamente como viene
          const encryptedMessage = JSON.parse(message.value.toString());
          logger.info('Received encrypted message:', encryptedMessage);

          // Usar el decryptMessage existente sin modificaciones
          const decryptedData = userService.decryptMessage(encryptedMessage);
          logger.info('Successfully decrypted message');

          // Crear el usuario directamente con los datos descifrados
          const user = new User(decryptedData);
          await user.save();
          logger.info(`User created with ID: ${user._id}`);

        } catch (error) {
          logger.error('Error processing message:', {
            error: error.message,
            stack: error.stack
          });
        }
      },
    });
  } catch (error) {
    logger.error('Create Consumer: Error starting consumer:', error);
    throw error;
  }
};

module.exports = { run };
