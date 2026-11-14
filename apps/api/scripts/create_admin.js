// Creates the first admin, which the API itself can't do (only admins create users).
// Usage: set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then `npm run seed:admin`.
require('dotenv').config();
const mongoose = require('mongoose');
const { Db_connection } = require('../config/db_connection');
const User = require('../Database/model/user');
const Hash = require('../utility/bycrpt_hashing');
const { randomly_generated_account_number } = require('../utility/randomly_generated_string');

const main = async () => {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME = 'Admin', ADMIN_LAST_NAME = 'User' } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
        throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) in .env');
    }
    await Db_connection();
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
        console.log(`A user with ${ADMIN_EMAIL} already exists (role: ${existing.role}). Nothing changed.`);
        return;
    }
    await User.create({
        first_name: ADMIN_FIRST_NAME,
        last_name: ADMIN_LAST_NAME,
        email: ADMIN_EMAIL,
        password: await Hash(ADMIN_PASSWORD),
        role: 'admin',
        account_details: { account_number: randomly_generated_account_number() },
    });
    console.log(`Admin ${ADMIN_EMAIL} created. Log in with POST /user/signin.`);
};

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
