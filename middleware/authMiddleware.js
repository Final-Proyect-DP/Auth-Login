const jwt = require('jsonwebtoken');
const redis = require('../config/redisConfig');
const logger = require('../config/logger');

const verifyToken = async (req, res, next) => {
  const { token } = req.query;
  const { id } = req.params;

  if (!token || !id) {
    logger.warn('Token o ID faltante en la solicitud');
    return res.status(401).json({ 
      success: false, 
      message: 'Token o ID faltante' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const storedToken = await redis.getToken(id);

    if (!storedToken || storedToken !== token) {
      logger.warn(`Token inválido o expirado para usuario ${id}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Sesión inválida o expirada' 
      });
    }

    logger.info(`Token verificado para usuario ${id}`);
    req.userId = id;
    next();
  } catch (err) {
    logger.error('Error en verificación de token:', err);
    return res.status(401).json({ 
      success: false, 
      message: 'Token JWT no válido' 
    });
  }
};

// Manejador de errores por si algo falla en el proceso
const handleAuthError = (err, req, res, next) => {
  logger.error('Error en autenticación:', err);
  return res.status(500).json({
    success: false,
    message: 'Error en el proceso de autenticación'
  });
};

module.exports = {
  verifyToken,
  handleAuthError
};
