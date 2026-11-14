const User = require('../model/user');
const Transaction = require('../model/transaction');

const BALANCE = 'account_details.account_balance';

// Atomic balance change: an aggregation-pipeline update reads and writes the
// balance in one step on the server, so two concurrent requests can never both
// spend the same money. $round keeps the stored value at 2 decimal places.
const change_balance = (filter, delta) =>
    User.findOneAndUpdate(filter, [{ $set: { [BALANCE]: { $round: [{ $add: ['$' + BALANCE, delta] }, 2] } } }], {
        new: true,
    });

class userRepository {
    create_user(user_data) {
        return User.create(user_data);
    }

    find_user_by_email(email, secrets = '') {
        return User.findOne({ email: String(email).toLowerCase().trim() }).select(secrets);
    }

    find_user_by_id(id, secrets = '') {
        return User.findById(id).select(secrets);
    }

    find_by_account_number(account_number) {
        return User.findOne({ 'account_details.account_number': String(account_number) });
    }

    list_users({ skip = 0, limit = 20 } = {}) {
        return Promise.all([User.find().sort({ created_at: -1 }).skip(skip).limit(limit), User.countDocuments()]);
    }

    update_pin(id, hashed_pin) {
        return User.findByIdAndUpdate(id, { $set: { transaction_pin: hashed_pin } }, { new: true });
    }

    set_setup_token(id, hashed_token, expires) {
        return User.findByIdAndUpdate(
            id,
            { $set: { setup_token: hashed_token, setup_token_expires: expires } },
            { new: true },
        );
    }

    // also clears any outstanding setup code, so it can only be used once
    set_password(id, hashed_password) {
        return User.findByIdAndUpdate(
            id,
            { $set: { password: hashed_password }, $unset: { setup_token: 1, setup_token_expires: 1 } },
            { new: true },
        );
    }

    set_active(id, isActive) {
        return User.findByIdAndUpdate(id, { $set: { isActive } }, { new: true });
    }

    update_profile(id, fields) {
        return User.findByIdAndUpdate(id, { $set: fields }, { new: true, runValidators: true });
    }

    // Adds money. Only to active accounts.
    credit(id, amount) {
        return change_balance({ _id: id, isActive: true }, amount);
    }

    // Removes money only if the account is active and holds at least `amount`.
    // Returns null when that condition fails, without changing anything.
    debit(id, amount) {
        return change_balance({ _id: id, isActive: true, [BALANCE]: { $gte: amount } }, -amount);
    }

    // Undo for a debit or credit made moments ago; skips the active check so a
    // refund always lands even if an admin disabled the account in between.
    force_adjust(id, delta) {
        return change_balance({ _id: id }, delta);
    }

    async delete_user(id) {
        const deleted_user = await User.findByIdAndDelete(id);
        const { deletedCount } = await Transaction.deleteMany({ user_id: id });
        return { deleted_user, deleted_transactions: deletedCount };
    }
}

module.exports = new userRepository();
