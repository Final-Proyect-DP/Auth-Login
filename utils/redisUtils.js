const redisClient = require('../config/redisConfig');
const logger = require('../config/logger');

const redisUtils = {
  async setToken(userId, token, expirationTime = 3600) {
    try {
      await redisClient.set(userId, token, { EX: expirationTime });
      logger.info(`Token establecido para usuario ${userId}`);
    } catch (error) {
      logger.error('Error al establecer token en Redis:', error);
      throw error;
    }
  },

  async getToken(userId) {
    try {
      const token = await redisClient.get(userId);
      return token;
    } catch (error) {
      logger.error('Error al obtener token de Redis:', error);
      throw error;
    }
  },

  async deleteToken(userId) {
    try {
      await redisClient.del(userId);
      logger.info(`Token eliminado para usuario ${userId}`);
    } catch (error) {
      logger.error('Error al eliminar token de Redis:', error);
      throw error;
    }
  }
};

module.exports = redisUtils;
