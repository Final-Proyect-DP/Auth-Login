const kafka = require('../config/kafkaConfig');
const logger = require('../config/logger');
const { encrypt } = require('../services/userService');
const handleErrors = require('../utils/handleErrors');

const producer = kafka.producer();

const sendLoginMessage = async (userId, token) => {
  try {
    const messageData = { userId, token };
    const encryptedMessage = encrypt(messageData);

    await producer.send({
      topic: process.env.KAFKA_TOPIC_LOGIN,
      messages: [
        {
          key: userId,
          value: JSON.stringify(encryptedMessage),
        },
      ],
    });
    logger.info(`Encrypted login message sent for user ${userId}`);
  } catch (error) {
    const handledError = handleErrors(error, userId);
    logger.error(`Error sending login message: ${handledError.response.message}`);
    throw handledError;
  }
};

// Initialize the producer
producer.connect().catch((err) => {
  const handledError = handleErrors(err);
  logger.error(`Error connecting Kafka producer: ${handledError.response.message}`);
});

module.exports = { sendLoginMessage };