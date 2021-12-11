// all imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Hash = require('../utility/bycrpt_hashing');

// user detail parent schema definition
const userSchema = new Schema({
    first_name: {
        type: String,
        required: [true, 'firstname is required'],
    },
    last_name: {
        type: String,
        required: [true, 'lastname is required'],
    },
    email: {
        type: Schema.Types.String,
        required: [true, 'please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value);
            },
            message: 'please enter a valid email',
        },
    },

    password: {
        type: Schema.Types.String,
        minlength: 6,
    },

    role: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        default: 'user',
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    transaction_pin: {
        type: String,
    },

    account_details: {
        account_balance: {
            type: Number,
            required: true,
            default: 0,
        },
        account_number: {
            type: String,
            required: true,
        },
    },

    created_at: {
        type: Date,
        default: new Date(),
    },

    updated_at: {
        type: Date,
    },
});

userSchema.pre('save', async function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    const hashed_password = await Hash(user.password);
    user.password = hashed_password;
    next();
});
module.exports = mongoose.model('user', userSchema);
