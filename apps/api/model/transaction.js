const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const transactionSchema = new Schema({
    user_id: {
        type: String,
        required: [true, 'user id is required'],
    },
});
