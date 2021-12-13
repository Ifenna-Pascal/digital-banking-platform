const bcrypt = require('bcrypt');
const Hash = async (value) => {
    const ROUNDS = 10;
    const Salt = await bcrypt.genSalt(ROUNDS);
    const hash = await bcrypt.hash(value, Salt);
    return hash;
};

const res = async () => {
    var result = await Hash('hash_test');
    console.log(result);
};
console.log(res());
module.exports = Hash;
