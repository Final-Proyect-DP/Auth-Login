const { createConsumer } = require('./kafkaConsumer');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/User');

const messageHandler = async (message) => {
  try {
    console.log('Mensaje recibido desde Kafka:', message.value.toString());
    const encryptedMessage = JSON.parse(message.value.toString());
    const decryptedMessage = userService.decryptMessage(encryptedMessage);
    console.log('Mensaje descifrado:', decryptedMessage);

    const userData = JSON.parse(decryptedMessage);
    const { _id, email, password } = userData;
    if (!_id) {
      throw new Error('ID is missing from the decrypted message');
    }

    await User.findByIdAndUpdate(_id, { email, password }, { new: true });
    console.log(`Usuario con ID ${_id} actualizado en la base de datos`);
  } catch (error) {
    console.error('Error al procesar el mensaje de Kafka:', error);
  }
};

const consumer = createConsumer('user-edit-group', process.env.KAFKA_TOPIC_USER_EDIT, messageHandler);
consumer.run().catch(console.error);

module.exports = { run: consumer.run };