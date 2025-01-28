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
    userData._id = new mongoose.Types.ObjectId(userData._id);
    delete userData.id; // Eliminar el campo id duplicado
    const user = new User(userData);
    await user.save();
    console.log('Usuario insertado en la base de datos:', user);
  } catch (error) {
    console.error('Error al procesar el mensaje de Kafka:', error);
  }
};

const consumer = createConsumer('user-create-group', process.env.KAFKA_TOPIC_USER_CREATE, messageHandler);
consumer.run().catch(console.error);

module.exports = { run: consumer.run };
