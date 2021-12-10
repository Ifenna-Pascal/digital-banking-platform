const User = require('../model/user');

class admin_service {
    constructor() {
        this.find_user_by_email = async (email) => {
            const user = await User.findOne({ email: email });
            return user ? user : null;
        };
    }
    async create_user(data) {
        console.log(data.password);
        try {
            const user = await this.find_user_by_email(data.email);
            console.log(user);
            if (user) throw new Error('user already exist in database');
            const new_user = User.create(data);
            return new_user;
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = new admin_service();
