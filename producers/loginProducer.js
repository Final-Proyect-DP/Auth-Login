const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');
const { encrypt } = require('../utils/encryption');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'login-service',
  brokers: [process.env.KAFKA_BROKER] // Usar la variable de entorno
});

const producer = kafka.producer();

const sendLoginMessage = async (userId, token) => {
  await producer.connect();
  try {
    const message = JSON.stringify({ userId, token });
    const encryptedMessage = encrypt(message);

    await producer.send({
      topic: 'login.auth',
      messages: [
        {
          value: JSON.stringify(encryptedMessage)
        }
      ]
    });
    logger.info('Encrypted login message sent to Kafka');
  } catch (err) {
    logger.error('Error sending encrypted login message to Kafka:', err);
  } finally {
    await producer.disconnect();
  }
};

module.exports = sendLoginMessage;
