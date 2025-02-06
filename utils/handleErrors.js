const logger = require('../config/logger'); // Update the path

const handleErrors = (error, id = '') => {
  logger.error(`Error in operation ${id ? `for ID ${id}` : ''}:`, error);

  // Required fields error
  if (error.message.includes('Required fields')) {
    return {
      status: 400,
      response: {
        success: false,
        message: error.message
      }
    };
  }

  // Duplicate key error (existing user)
  if (error.code === 11000) {
    return {
      status: 400,
      response: {
        success: false,
        message: 'Username already exists'
      }
    };
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return {
      status: 400,
      response: {
        success: false,
        message: 'Validation error',
        details: error.message
      }
    };
  }

  // User not found error
  if (error.message === 'User not found') {
    return {
      status: 404,
      response: {
        success: false,
        message: 'User not found'
      }
    };
  }

  // Default error (500 Internal Server Error)
  return {
    status: 500,
    response: {
      success: false,
      message: 'Internal server error'
    }
  };
};

module.exports = handleErrors;
