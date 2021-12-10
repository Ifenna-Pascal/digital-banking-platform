// all imports
const express = require('express');
const morgan = require('morgan');
require('dotenv').config({ path: './config/config.env' });

// initialize the app
const app = express();

// App middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/ping', (req, res) => {
    res.status(300).json({ msg: 'Welcome to our banking system' });
});

// Not found route - 404
app.use('**', (req, res) => {
    res.status(404).send({ message: 'Route not found' });
});

// Error middleware
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).send({ message: 'Something went wrong', error: error.message });
});

module.exports = app;
