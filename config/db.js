const mongoose = require('mongoose');
const logger = require('../utils/logger'); // Actualizar la ruta de importación

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports = connectDB;
