const { createConsumer } = require('./kafkaConsumer');
const userService = require('../services/userService');
const User = require('../models/User');
require('dotenv').config();

const messageHandler = async (message) => {
  try {
    console.log('Mensaje recibido desde Kafka:', message.value.toString());
    const encryptedMessage = JSON.parse(message.value.toString());
    console.log('Mensaje encriptado:', encryptedMessage);
    const decryptedMessage = userService.decryptMessage(encryptedMessage);
    console.log('Mensaje descifrado:', decryptedMessage);

    const { id } = JSON.parse(decryptedMessage);
    console.log('ID del usuario a eliminar:', id);

    await User.findByIdAndDelete(id);
    console.log('Usuario eliminado exitosamente');
  } catch (error) {
    console.error('Error al procesar el mensaje de Kafka:', error);
  }
};

const consumer = createConsumer('user-delete-group', process.env.KAFKA_TOPIC_USER_DELETE, messageHandler);
consumer.run().catch(console.error);

module.exports = { run: consumer.run };
