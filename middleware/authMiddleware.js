const jwt = require('jsonwebtoken');
const redis = require('../config/redisConfig');
const logger = require('../config/logger');

const verifyToken = async (req, res, next) => {
  const { token } = req.query;
  const { id } = req.params;

  if (!token || !id) {
    logger.warn('Token or ID missing');
    return res.status(401).json({ 
      success: false, 
      message: 'Token or ID missing' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const storedToken = await redis.getToken(id);

    if (!storedToken || storedToken !== token) {
      logger.warn(`Invalid or expired token for user ${id}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }

    logger.info(`Token verified for user ${id}`);
    req.userId = id;
    next();
  } catch (err) {
    logger.error('Error verifying token:', err);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid JWT token' 
    });
  }
};

module.exports = {
  verifyToken
};