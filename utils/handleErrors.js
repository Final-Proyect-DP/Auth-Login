const logger = require('../config/logger'); // Actualizar la ruta

const handleErrors = (error, id = '') => {
  logger.error(`Error en la operación ${id ? `para ID ${id}` : ''}:`, error);

  // Error de campos requeridos
  if (error.message.includes('Campos requeridos')) {
    return {
      status: 400,
      response: {
        success: false,
        message: error.message
      }
    };
  }

  // Error de clave duplicada (usuario existente)
  if (error.code === 11000) {
    return {
      status: 400,
      response: {
        success: false,
        message: 'El nombre de usuario ya existe'
      }
    };
  }

  // Error de validación de Mongoose
  if (error.name === 'ValidationError') {
    return {
      status: 400,
      response: {
        success: false,
        message: 'Error de validación',
        details: error.message
      }
    };
  }

  // Error de usuario no encontrado
  if (error.message === 'User not found') {
    return {
      status: 404,
      response: {
        success: false,
        message: 'Usuario no encontrado'
      }
    };
  }

  // Error por defecto (500 Internal Server Error)
  return {
    status: 500,
    response: {
      success: false,
      message: 'Error interno del servidor'
    }
  };
};

module.exports = handleErrors;
