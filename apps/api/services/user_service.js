const User = require('../model/user');
const JWT_SECRET = process.env.JWT_SECRET;
const Transaction = require('../model/transaction');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class user_service {
    constructor() {
        this.find_user_by_email = async (email) => {
            const user = await User.findOne({ email: email });
            return user;
        };
    }

    async update_pin(id, pin) {
        console.log(pin, id);
        const setPin = await User.findByIdAndUpdate(id, { $set: { transaction_pin: pin } }, { new: true });
        return setPin;
    }

    async user_login(data, next) {
        const user = await this.find_user_by_email(data.email);
        console.log(user);
        if (!user) throw new Error('Invalid Email and Password');
        const isValidPassword = await bcrypt.compare(data.password, user.password);
        console.log(isValidPassword);
        if (!isValidPassword) throw next(new Error('Password does not match'));
        // sign token
        const token = jwt.sign({ user_id: user._id }, JWT_SECRET);
        const user_data = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            token: token,
        };
        return user_data;
    }

    async view_all_user_transactions(id) {
        const user_transactions = await Transaction.find({ user_id: id });
        return user_transactions;
    }
}

module.exports = new user_service();
