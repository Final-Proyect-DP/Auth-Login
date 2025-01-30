require('dotenv').config();
const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

// Conectar al iniciar
redisClient.connect().catch(err => {
  logger.error('Error al conectar a Redis durante la inicialización', err);
});

redisClient.on('error', (err) => {
  logger.error('Error en la conexión Redis:', err);
});

module.exports = redisClient;
