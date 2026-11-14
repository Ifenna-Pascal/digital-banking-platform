const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        first_name: { type: String, required: [true, 'firstname is required'], trim: true },
        last_name: { type: String, required: [true, 'lastname is required'], trim: true },
        email: {
            type: String,
            required: [true, 'please add an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'please enter a valid email'],
        },
        // bcrypt hash; empty until the customer finishes account setup
        password: { type: String, select: false },
        role: { type: String, required: true, enum: ['admin', 'user'], default: 'user' },
        isActive: { type: Boolean, default: true },
        // bcrypt hash of the 4-digit transaction PIN
        transaction_pin: { type: String, select: false },
        // bcrypt hash of the one-time code used to set the first password
        setup_token: { type: String, select: false },
        setup_token_expires: { type: Date, select: false },
        account_details: {
            account_balance: { type: Number, required: true, default: 0, min: 0 },
            account_number: { type: String, required: true, unique: true },
        },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

// never send secrets back to clients, even if a query selected them
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.transaction_pin;
        delete ret.setup_token;
        delete ret.setup_token_expires;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model('user', userSchema);
