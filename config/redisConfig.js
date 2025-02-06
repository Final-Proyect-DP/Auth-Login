require('dotenv').config();
const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

// Conectar al iniciar
redisClient.connect().catch(err => {
  logger.error('connection error: Redis', err);
});

redisClient.on('error', (err) => {
  logger.error('connection error: Redis', err);
});

module.exports = redisClient;
