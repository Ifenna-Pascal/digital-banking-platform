const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// One document per balance change on one account. A transfer creates two:
// a debit on the sender and a credit on the recipient, sharing a reference.
const transactionSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'user', required: [true, 'user id is required'], index: true },
        transaction_id: { type: String, required: [true, 'transaction id is required'], unique: true },
        // groups the entries of one operation (both sides of a transfer, a reversal and its original)
        reference: { type: String, required: true, index: true },
        transaction_type: {
            type: String,
            enum: ['transfer', 'deposit', 'withdrawal', 'reversal'],
            required: [true, 'type of transaction is required'],
        },
        direction: { type: String, enum: ['credit', 'debit'], required: true },
        transaction_status: { type: String, enum: ['failed', 'success'], default: 'success' },
        is_reversed: { type: Boolean, default: false },
        reversed_at: { type: Date },
        amount_transacted: { type: Number, required: [true, 'Amount is needed'], min: 0.01 },
        previous_balance: { type: Number, required: true },
        current_balance: { type: Number, required: true },
        transaction_narration: { type: String, trim: true, maxlength: 140 },
        from: { type: Schema.Types.ObjectId, ref: 'user' },
        to: { type: Schema.Types.ObjectId, ref: 'user' },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

transactionSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model('transaction', transactionSchema);
