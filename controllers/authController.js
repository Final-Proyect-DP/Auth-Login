const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger'); // Actualizar la ruta
const redisUtils = require('../utils/redisUtils'); // Actualizar la ruta
const bcrypt = require('bcryptjs');
const { sendLoginMessage } = require('../producers/kafkaProducer');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Invalid credentials');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    await redisUtils.setToken(user._id.toString(), token);

    // Enviar mensaje a Kafka (ahora con manejo de errores)
    try {
      await sendLoginMessage(user._id.toString(), token);
    } catch (kafkaError) {
      logger.error('Error al enviar mensaje a Kafka:', kafkaError);
      // Continuamos con la respuesta aunque falle Kafka
    }

    logger.info('User logged in successfully');
    // Devolver token y userId en la respuesta
    res.json({ 
      token,
      userId: user._id.toString()
    });
  } catch (err) {
    logger.error('Server error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  loginUser
};
