const { rateLimit } = require('express-rate-limit');

const make = (limit, message) =>
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: Number(process.env.RATE_LIMIT_MAX || limit),
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { msg: message },
        skip: () => process.env.NODE_ENV === 'test' && !process.env.RATE_LIMIT_MAX,
    });

// Login and setup-code attempts: slows down password and code guessing.
const auth_limiter = make(20, 'Too many attempts, try again in 15 minutes');

// Money endpoints: slows down PIN guessing with a stolen login.
const transaction_limiter = make(60, 'Too many transactions, try again in 15 minutes');

module.exports = { auth_limiter, transaction_limiter };
