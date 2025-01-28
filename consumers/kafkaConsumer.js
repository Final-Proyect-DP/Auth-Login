const { Kafka } = require('kafkajs');

const createConsumer = (groupId, topic, messageHandler) => {
  const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });
  const consumer = kafka.consumer({ groupId });

  const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await messageHandler(message);
      },
    });
  };

  return { run };
};

module.exports = { createConsumer };
