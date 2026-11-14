const mongoose = require('mongoose');

module.exports = {
    Db_connection: async (url = process.env.MONGO_URL) => {
        await mongoose.connect(url);
        // build the unique indexes (email, account number, transaction id)
        await mongoose.connection.syncIndexes();
        console.log('db connected successfully');
    },
};
