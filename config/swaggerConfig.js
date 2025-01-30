require('dotenv').config();

const swaggerOptions = {
  definition: {  // Cambiado de swaggerDefinition a definition
    openapi: '3.0.0',
    info: {
      title: 'Auth API',
      version: '1.0.0',
      description: 'API to autenticate'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3018}`
      }
    ]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerOptions;