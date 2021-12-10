const mongoose = require('mongoose');

module.exports = {
    Db_connection: () => {
        mongoose
            .connect(process.env.MONGO_URL)
            .then(() => {
                console.log('db coonected successfully');
            })
            .catch((err) => {
                console.log('mongoose connection error', err);
            });
    },
};
