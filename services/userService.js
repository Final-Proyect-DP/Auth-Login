const crypto = require('crypto');

const decryptMessage = (encryptedMessage) => {
  const iv = Buffer.from(encryptedMessage.iv, 'hex');
  const encryptedData = Buffer.from(encryptedMessage.encryptedData, 'hex');
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

module.exports = { decryptMessage };
