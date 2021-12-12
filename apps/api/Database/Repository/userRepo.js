const User = require('../model/user');
const Transaction = require('../model/transaction');

class userRepository {
    async create_user(user_data) {
        const new_user = await User.create(user_data);
        return new_user;
    }

    async find_user_by_email(email) {
        const user = await User.findOne({ email: email });
        return user;
    }

    async find_user_by_id(id) {
        const user = await User.findOne({ _id: id });
        return user;
    }

    async find_beneficiary(account_number) {
        const beneficiary = await User.findOne({ 'account-details.account_number': account_number });
        return beneficiary;
    }

    async update_pin(id, pin) {
        const setPin = await User.findByIdAndUpdate(id, { $set: { transaction_pin: pin } }, { new: true });
        return setPin;
    }

    async disable_user(id) {
        const disable_user = await User.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
        return disable_user;
    }

    async enable_user(id) {
        const enable_user = await User.findByIdAndUpdate(id, { $set: { isActive: true } }, { new: true });
        return enable_user;
    }

    async update_user_amount(id, amount) {
        const updated_user_amount = await User.findByIdAndUpdate(
            id,
            { $set: { account_details: { account_balance: amount } } },
            { new: true },
        );
        return updated_user_amount;
    }

    async delete_user(id) {
        const deleted_user = await User.findByIdAndDelete(id);
        // delete_user_tranasactions also
        const deleted_user_tranasactions = await Transaction.findOneAndDelete({ user_id: id });
        return { deleted_user, deleted_user_tranasactions };
    }
}

module.exports = new userRepository();
