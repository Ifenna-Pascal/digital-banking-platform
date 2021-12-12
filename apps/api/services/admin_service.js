const user_repository_instance = require('../Database/Repository/userRepo');
const {
    randomly_generated_password,
    randomly_generated_account_number,
} = require('../utility/randomly_generated_string');

class admin_service {
    async create_user(data) {
        try {
            const user_data = {
                first_name: data.first_name,
                last_name: data.last_name,
                password: randomly_generated_password(),
                email: data.email,
                role: data.role ? data.role : "user",
                account_details: {
                    account_number: randomly_generated_account_number(),
                },
            };
            console.log(user_data.password);
            const user = await user_repository_instance.find_user_by_email(data.email);
            if (user) throw new Error('user already exist in database');
            const new_user = user_repository_instance.create_user(user_data);
            return new_user;
        } catch (e) {
            throw new Error(e);
        }
    }
    async delete_user(id) {
        try {
            const deleted_user = await user_repository_instance.delete_user(id);
            return deleted_user;
        } catch (error) {
            throw new Error(error);
        }
    }

    async enable_user(id) {
        try {
            const enable_user = await user_repository_instance.enable_user(id);
            return enable_user;
        } catch (error) {
            throw new Error(error);
        }
    }
    async disable_user(id) {
        try {
            const disable_user = await user_repository_instance.disable_user(id);
            return disable_user;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = new admin_service();
