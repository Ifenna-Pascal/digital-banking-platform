const bcrypt = require('bcrypt');
const Hash = async (value) => {
    const ROUNDS = 10;
    const Salt = await bcrypt.genSalt(ROUNDS);
    const hash = await bcrypt.hash(value, Salt);
    return hash;
};

module.exports = Hash;
