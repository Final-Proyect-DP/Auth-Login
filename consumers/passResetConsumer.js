const { Kafka } = require('kafkajs');
const userService = require('../services/userService');
const User = require('../models/User');
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });

const consumer = kafka.consumer({ groupId: 'pass-reset-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_PASS_RESET, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log('Mensaje recibido desde Kafka:', message.value.toString());
        const encryptedMessage = JSON.parse(message.value.toString());
        const decryptedMessage = userService.decryptMessage(encryptedMessage);
        console.log('Mensaje descifrado:', decryptedMessage);

        const { id, newPassword } = JSON.parse(decryptedMessage);
        await User.updateOne({ _id: id }, { password: newPassword });
        console.log(`Contraseña actualizada para el usuario con ID: ${id}`);
      } catch (error) {
        console.error('Error al desencriptar el mensaje:', error.message);
      }
    },
  });
};

module.exports = { run };

run().catch(console.error);
