const user_repository_instance = require('../Database/Repository/userRepo');
const transaction_repository_instance = require('../Database/Repository/transactionRepo');
const Hash = require('../utility/bycrpt_hashing');
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class user_service {
    async update_pin(id, pin) {
        const hashed_pin = await Hash(pin.toString());
        const setPin = await user_repository_instance.update_pin(id, hashed_pin);
        return setPin;
    }

    async user_login(data) {
        const { email } = data;
        const user = await user_repository_instance.find_user_by_email(email);
        if (!user.password)
            throw new Error(
                'Your Password Has Not Been Created Yet, Kindly Create Your Password At >>> /user/update_password',
            );
        if (!user) throw new Error('Invalid Email and Password');
        const isValidPassword = await bcrypt.compare(data.password, user.password);
        if (!isValidPassword) throw new Error('Password does not match');
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

    async update_password(email, password) {
        const user = await user_repository_instance.find_user_by_email(email);
        if (!user) throw new Error('user does not exist in database');
        const hashed_password = (await Hash(password)).toString();
        const set_Password = await user_repository_instance.update_password(email, hashed_password);
        return set_Password;
    }

    async view_all_user_transactions(id) {
        const user_transactions = await transaction_repository_instance.view_all_user_transactions(id);
        return user_transactions;
    }
}

module.exports = new user_service();
