const crypto = require('crypto');

const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// crypto.randomInt is uniform and unpredictable, unlike Math.random
const random_string = (length, alphabet) => {
    let out = '';
    for (let i = 0; i < length; i++) out += alphabet[crypto.randomInt(alphabet.length)];
    return out;
};

const randomly_generated_account_number = () => random_string(10, '0123456789');

const randomly_generated_transaction_id = () => random_string(12, ALPHANUMERIC);

// 8-character code a new customer uses once to choose their password
const randomly_generated_setup_token = () => random_string(8, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');

module.exports = {
    randomly_generated_account_number,
    randomly_generated_transaction_id,
    randomly_generated_setup_token,
};
