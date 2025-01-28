const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const setupSwagger = (app) => {
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Login Users API',
        version: '1.0.0',
        description: 'API for user login and JWT generation'
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3001}`
        }
      ]
    },
    apis: ['./routes/*.js']
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;
