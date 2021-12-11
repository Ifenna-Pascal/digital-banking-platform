const mongoose = require('mongoose');
const Hash = require('../utility/bycrpt_hashing');
const Schema = mongoose.Schema;
const transactionSchema = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'user id is required'],
    },
    transaction_id: {
        type: String,
        require: [true, 'tranaction id is required'],
    },
    transaction_type: {
        type: String,
        enum: ['transfer', 'deposit', 'withdrawal'],
        required: [true, 'type of transaction is required'],
    },
    tranaction_is_reversed: {
        type: Boolean,
        default: false,
    },
    transaction_status: {
        type: String,
        enum: ['failed', 'success'],
    },
    amount_transacted: {
        type: Number,
        required: [true, 'Amount is needed'],
    },
    previous_balance: {
        type: Number,
        require: [true, 'Your Previous balance is required'],
    },
    current_balance: {
        type: Number,
        required: [true, 'your current balance is required'],
    },
    transaction_narration: {
        type: String,
    },
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
});
module.exports = mongoose.model('transaction', transactionSchema);
