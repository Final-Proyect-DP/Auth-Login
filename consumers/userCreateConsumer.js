const kafka = require('../config/kafkaConfig'); // Actualizar la ruta
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/User');
const logger = require('../config/logger'); // Actualizar la ruta
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
          const encryptedMessage = JSON.parse(message.value.toString());
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          logger.info('Mensaje descifrado:', decryptedMessage);

          const userData = JSON.parse(decryptedMessage);
          const user = new User(userData);
          await user.save();
          logger.info(`Usuario insertado en la base de datos: ${user._id}`);
        } catch (error) {
          logger.error('Error al procesar el mensaje de Kafka:', error);
        }
      },
    });
  } catch (error) {
    logger.error('Create Consumer: Error iniciando el consumidor:', error);
    throw error;
  }
};

module.exports = { run };
