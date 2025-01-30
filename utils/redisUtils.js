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
      const token = await new Promise((resolve, reject) => {
        redisClient.get(userId, (err, reply) => {
          if (err) reject(err);
          resolve(reply);
        });
      });
      return token;
    } catch (error) {
      logger.error('Error al obtener token de Redis:', error);
      throw error;
    }
  },

  async deleteToken(userId) {
    try {
      const result = await redisClient.del(userId);
      const message = result ? 'Sesión cerrada exitosamente' : 'Sesión no encontrada';
      logger.info(`${message} para usuario ${userId}`);
      return { success: true, message };
    } catch (error) {
      logger.error('Error al eliminar token de Redis:', error);
      throw error;
    }
  }
};

module.exports = redisUtils;
