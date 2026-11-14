const bcrypt = require('bcrypt');

const ROUNDS = 10;

const Hash = (value) => bcrypt.hash(String(value), ROUNDS);

module.exports = Hash;
