// Shared test harness: a fresh in-memory MongoDB per test file, plus helpers
// that walk a customer through the real API (admin creates, user sets password).
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const User = require('../../Database/model/user');
const Hash = require('../../utility/bycrpt_hashing');

let mongo;

const start = async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await mongoose.connection.syncIndexes();
};

const stop = async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
};

const reset = async () => {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
};

const api = () => request(app);
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

let counter = 0;
const unique_email = (prefix = 'user') => `${prefix}${++counter}@example.com`;

const create_admin = async () => {
    const email = unique_email('admin');
    await User.create({
        first_name: 'Ada',
        last_name: 'Admin',
        email,
        password: await Hash('admin-pass-123'),
        role: 'admin',
        account_details: { account_number: String(1000000000 + counter) },
    });
    const res = await api().post('/user/signin').send({ email, password: 'admin-pass-123' });
    return { email, token: res.body.data.token };
};

// Full onboarding through the API. Returns the user's token, id and account number.
const create_customer = async (admin, { pin = '1234', deposit = 0, first_name = 'Jane' } = {}) => {
    const email = unique_email();
    const created = await api()
        .post('/admin/create_user')
        .set(bearer(admin.token))
        .send({ email, first_name, last_name: 'Doe' });
    if (created.status !== 201) throw new Error(`create_user failed: ${JSON.stringify(created.body)}`);

    await api()
        .post('/user/setup_password')
        .send({ email, setup_token: created.body.setup_token, password: 'password-123' })
        .expect(200);
    const login = await api().post('/user/signin').send({ email, password: 'password-123' }).expect(200);
    const token = login.body.data.token;
    if (pin) await api().post('/user/setpin').set(bearer(token)).send({ pin }).expect(200);
    if (deposit) await api().post('/transaction/deposit').set(bearer(token)).send({ amount: deposit, pin }).expect(200);

    return {
        email,
        token,
        pin,
        id: created.body.data._id,
        account_number: created.body.data.account_details.account_number,
        setup_token: created.body.setup_token,
    };
};

const balance_of = async (id) => (await User.findById(id)).account_details.account_balance;

module.exports = { start, stop, reset, api, bearer, create_admin, create_customer, balance_of, unique_email };
