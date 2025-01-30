require('dotenv').config();
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

const decryptMessage = (encryptedMessage) => {
  const { iv, encryptedData } = encryptedMessage;
  if (!iv || !encryptedData) {
    throw new Error('Invalid encrypted message format');
  }
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(text));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

module.exports = {
  decryptMessage,
  encrypt
};