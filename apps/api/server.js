require('dotenv').config();
const { Db_connection } = require('./config/db_connection');

const required = ['MONGO_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}. See .env.example.`);
    process.exit(1);
}
if (process.env.JWT_SECRET === 'change-me' && process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET is still the example value. Set a long random secret.');
    process.exit(1);
}

const app = require('./app');
const port = Number(process.env.PORT) || 4000;

// connect first, so the API never accepts requests it can't serve
Db_connection()
    .then(() => {
        app.listen(port, () => console.log('app is listening on', port));
    })
    .catch((err) => {
        console.error('mongoose connection error', err.message);
        process.exit(1);
    });
