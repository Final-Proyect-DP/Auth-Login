const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({ url: process.env.REDIS_URI });

client.on('error', console.error.bind(console, 'Redis client error'));

client.connect().catch(console.error);

module.exports = client;
