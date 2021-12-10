const User = require('../model/user');
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class user_service {
    constructor() {
        this.find_user_by_email = async (email) => {
            const user = await User.findOne({ email: email });
            return user;
        };
    }
    async user_login(data) {
        const user = await this.find_user_by_email(data.email);
        console.log(user);
        if (!user) throw new Error('Invalid Email and Password');
        const isValidPassword = await bcrypt.compare(data.password, user.password);
        console.log(isValidPassword);
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
}

module.exports = new user_service();
