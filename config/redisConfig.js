require('dotenv').config();
const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});


redisClient.connect().catch(err => {
  logger.error('connection error: Redis', err);
});

redisClient.on('error', (err) => {
  logger.error('connection error: Redis', err);
});

module.exports = redisClient;
