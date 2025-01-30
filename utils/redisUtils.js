const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');

const redisUtils = {
  async setToken(userId, token, expirationTime = 3600) {
    try {
      await redisClient.set(userId, token, { EX: expirationTime });
      logger.info(`Token set for user ${userId}`);
    } catch (error) {
      logger.error('Error setting token in Redis:', error);
      throw error;
    }
  },

  async getToken(userId) {
    try {
      const token = await new Promise((resolve, reject) => {
        redisClient.get(userId, (err, reply) => {
          if (err) reject(err);
          resolve(reply);
        });
      });
      return token;
    } catch (error) {
      logger.error('Error retrieving token from Redis:', error);
      throw error;
    }
  },

  async deleteToken(userId) {
    try {
      const result = await redisClient.del(userId);
      const message = result ? 'Session successfully closed' : 'Session not found';
      logger.info(`${message} for user ${userId}`);
      return { success: true, message };
    } catch (error) {
      logger.error('Error deleting token from Redis:', error);
      throw error;
    }
  }
};

module.exports = redisUtils;
