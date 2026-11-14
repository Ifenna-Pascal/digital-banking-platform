const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { AppError } = require('./utility/errors');

// Builds the Express app without connecting to the database or listening,
// so tests can import it. server.js does both.
const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
    cors({
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim()),
    }),
);
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

app.get('/ping', (_req, res) => {
    res.status(200).json({ msg: 'Welcome to our banking system' });
});
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/transaction', require('./routes/transaction'));

app.use((_req, res) => {
    res.status(404).json({ msg: 'Route not found' });
});

// Known errors keep their status and message; anything unexpected becomes a
// generic 500 so internal details (stack, DB errors) never reach the client.
// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
    if (error instanceof AppError) return res.status(error.status).json({ msg: error.message });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ msg: 'Request body is not valid JSON' });
    if (error.type === 'entity.too.large') return res.status(413).json({ msg: 'Request body is too large' });
    if (error.name === 'ValidationError') return res.status(400).json({ msg: error.message });
    if (error.name === 'CastError') return res.status(400).json({ msg: 'Invalid id' });
    if (error.code === 11000) return res.status(409).json({ msg: 'That record already exists' });
    console.error(error);
    res.status(500).json({ msg: 'Something went wrong' });
});

module.exports = app;
