const crypto = require('crypto');

const generateRandomToken = () => crypto.randomBytes(40).toString('hex');

module.exports = { generateRandomToken };