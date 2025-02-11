const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

dotenv.config();
const connectDB = require('./config/dbConfig');
const logger = require('./config/logger');
const swaggerOptions = require('./config/swaggerConfig');


const authRoutes = require('./routes/auth');
const consumers = {
  userCreate: require('./consumers/userCreateConsumer'),
  userDelete: require('./consumers/userDeleteConsumer'),
  userLogout: require('./consumers/userLogoutConsumer'),
  userPassReset: require('./consumers/userPassReset')
};

const app = express();
const PORT = process.env.PORT || 3018;
const HOST = '0.0.0.0';


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-login' });
});


const initializeKafkaConsumers = async () => {
  try {
    await Promise.all([
      consumers.userCreate.run(),
      consumers.userDelete.run(),
      consumers.userLogout.run(),
      consumers.userPassReset.run()
    ]);
    logger.info('All Kafka consumers started successfully');
  } catch (error) {
    logger.error('Failed to initialize Kafka consumers:', error);
    throw error;
  }
};


const startServer = async () => {
  try {
    await connectDB();
    await initializeKafkaConsumers();
    
    app.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT}`);
      logger.info(`Swagger documentation available at http://${HOST}:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
