const express = require('express');
const dotenv = require('dotenv');
const os = require('os');
const cors = require('cors');
const connectDB = require('./config/db');
const setupSwagger = require('./config/swagger');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
//const logoutAuthConsumer = require('./consumers/logoutAuthConsumer');
//const passResetConsumer = require('./consumers/passResetConsumer');
const userCreateConsumer = require('./consumers/userCreateConsumer');
const userDeleteConsumer = require('./consumers/userDeleteConsumer');
const userEditConsumer = require('./consumers/userEditConsumer');

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

setupSwagger(app);

connectDB().then(() => {
  const server = app.listen(PORT, HOST, () => {
    logger.info(`Server running on http://${localIp}:${PORT}`);
  });

  // Iniciar los consumidores de Kafka
  //logoutAuthConsumer.run().catch(console.error);
  //passResetConsumer.run().catch(console.error);
  userCreateConsumer.run().catch(console.error);
  userDeleteConsumer.run().catch(console.error);
  userEditConsumer.run().catch(console.error);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      logger.error('Server error:', err);
    }
  });
}).catch(err => {
  logger.error('Server error:', err);
});
