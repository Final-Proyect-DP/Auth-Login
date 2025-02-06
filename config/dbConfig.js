const mongoose = require('mongoose');
const logger = require('./logger');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
