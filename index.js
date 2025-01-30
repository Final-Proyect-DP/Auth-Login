const express = require('express');
const dotenv = require('dotenv');
const os = require('os');
const cors = require('cors');
const connectDB = require('./config/dbConfig');
const logger = require('./config/logger');
const authRoutes = require('./routes/auth');
const userCreateConsumer = require('./consumers/userCreateConsumer');
const userDeleteConsumer = require('./consumers/userDeleteConsumer');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3018;
const HOST = '0.0.0.0';

// Obtener la dirección IP de la red local
const networkInterfaces = os.networkInterfaces();
const localIp = Object.values(networkInterfaces)
  .flat()
  .find((iface) => iface.family === 'IPv4' && !iface.internal).address;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Configuración de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth API',
      version: '1.0.0',
      description: 'API para la gestión de autenticación'
    },
    servers: [
      {
        url: `http://${localIp}:${PORT}`
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

connectDB().then(() => {
  const server = app.listen(PORT, HOST, () => {
    logger.info(`Server running on http://${localIp}:${PORT}`);
  });

  // Iniciar los consumidores de Kafka
  userCreateConsumer.run().catch(err => {
    logger.error('Error al iniciar userCreateConsumer:', err);
  });
  userDeleteConsumer.run().catch(err => {
    logger.error('Error al iniciar userDeleteConsumer:', err);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      logger.error('Server error:', err);
    }
  });

  // Manejar el cierre del servidor
  const shutdown = async () => {
    logger.info('Shutting down server...');
    try {
      await userCreateConsumer.disconnect();
      await userDeleteConsumer.disconnect();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}).catch(err => {
  logger.error('Server error:', err.message, err.stack);
});
