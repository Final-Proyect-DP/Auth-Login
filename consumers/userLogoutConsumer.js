const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const userService = require('../services/userService');
const redisUtils = require('../utils/redisUtils');
require('dotenv').config();

const consumer = kafka.consumer({ groupId: 'login-service-logout-group' });

const run = async () => {
  try {
    await consumer.connect();
    logger.info('Create Consumer: Kafka consumer connected');
    await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_LOGOUT, fromBeginning: true });
    logger.info(`Create Consumer: Subscribed to topic: ${process.env.KAFKA_TOPIC_LOGOUT}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const encryptedMessage = JSON.parse(message.value.toString());
          logger.info('Mensaje cifrado recibido:', encryptedMessage);
          
          const decryptedMessage = userService.decryptMessage(encryptedMessage);
          
          if (!decryptedMessage || !decryptedMessage.userId) {
            throw new Error('Mensaje descifrado inválido o userId no encontrado');
          }
          
          logger.info(`Procesando cierre de sesión para usuario: ${decryptedMessage.userId}`);
          await redisUtils.deleteToken(decryptedMessage.userId);
          logger.info(`Token eliminado exitosamente para usuario: ${decryptedMessage.userId}`);

        } catch (error) {
          logger.error('Error procesando mensaje de cierre de sesión:', error.message);
        }
      },
    });
  } catch (error) {
    logger.error('login Consumer: Error iniciando el consumidor:', error);
    throw error;
  }
};

module.exports = { run };