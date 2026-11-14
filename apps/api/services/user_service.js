const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user_repository_instance = require('../Database/Repository/userRepo');
const transaction_repository_instance = require('../Database/Repository/transactionRepo');
const Hash = require('../utility/bycrpt_hashing');
const { AppError } = require('../utility/errors');
const { to_money } = require('../utility/money');

const INVALID_LOGIN = 'Invalid email or password';

class user_service {
    async user_login({ email, password }) {
        const user = await user_repository_instance.find_user_by_email(email, '+password');
        // same message for "no such email" and "wrong password", so the
        // endpoint can't be used to discover which emails have accounts
        if (!user) throw new AppError(INVALID_LOGIN, 401);
        if (!user.password)
            throw new AppError(
                'Your account setup is not finished. Set your password with your setup code first.',
                403,
            );
        const isValidPassword = await bcrypt.compare(String(password), user.password);
        if (!isValidPassword) throw new AppError(INVALID_LOGIN, 401);

        const token = jwt.sign({ user_id: String(user._id), role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        });
        return {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            token,
        };
    }

    // First password, using the one-time code the admin gave the customer.
    async setup_password({ email, setup_token, password }) {
        const user = await user_repository_instance.find_user_by_email(
            email,
            '+password +setup_token +setup_token_expires',
        );
        const invalid = new AppError('Invalid or expired setup code', 400);
        if (!user || !user.setup_token || !user.setup_token_expires) throw invalid;
        if (user.setup_token_expires.getTime() < Date.now()) throw invalid;
        const valid = await bcrypt.compare(String(setup_token).toUpperCase(), user.setup_token);
        if (!valid) throw invalid;
        await user_repository_instance.set_password(user._id, await Hash(password));
    }

    async change_password(id, { current_password, new_password }) {
        const user = await user_repository_instance.find_user_by_id(id, '+password');
        if (!user || !user.password) throw new AppError('User not found', 404);
        const valid = await bcrypt.compare(String(current_password), user.password);
        if (!valid) throw new AppError('Current password is incorrect', 400);
        await user_repository_instance.set_password(id, await Hash(new_password));
    }

    async update_pin(id, { pin, current_pin, password }) {
        const user = await user_repository_instance.find_user_by_id(id, '+password +transaction_pin');
        // changing an existing PIN needs the old PIN or the account password,
        // so a stolen login token alone can't be used to set a new PIN
        if (user.transaction_pin) {
            const ok =
                (current_pin && (await bcrypt.compare(String(current_pin), user.transaction_pin))) ||
                (password && user.password && (await bcrypt.compare(String(password), user.password)));
            if (!ok) throw new AppError('To change your PIN, send your current_pin or your password', 400);
        }
        await user_repository_instance.update_pin(id, await Hash(String(pin)));
    }

    async update_profile(id, data) {
        const fields = {};
        for (const key of ['first_name', 'last_name', 'email']) {
            if (data[key] !== undefined) fields[key] = data[key];
        }
        if (Object.keys(fields).length === 0) throw new AppError('Nothing to update', 400);
        if (fields.email) {
            const existing = await user_repository_instance.find_user_by_email(fields.email);
            if (existing && !existing._id.equals(id)) throw new AppError('That email is already in use', 409);
        }
        const updated_user = await user_repository_instance.update_profile(id, fields);
        if (!updated_user) throw new AppError('User not found', 404);
        return updated_user;
    }

    async view_all_user_transactions(id, { page = 1, limit = 20, type } = {}) {
        const skip = (page - 1) * limit;
        const [items, total] = await transaction_repository_instance.list_for_user(id, { skip, limit, type });
        return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }

    async get_user_details(id) {
        const user = await user_repository_instance.find_user_by_id(id, '+transaction_pin +password');
        if (!user) throw new AppError('User not found', 404);
        const profile = user.toJSON();
        profile.has_pin = Boolean(user.transaction_pin);
        return profile;
    }

    async get_summary(id, days = 7) {
        const user = await user_repository_instance.find_user_by_id(id);
        if (!user) throw new AppError('User not found', 404);
        const { totals, daily, since } = await transaction_repository_instance.summary_for_user(id, days);

        const pick = (direction) => totals.find((t) => t._id === direction) || { total: 0, count: 0 };
        const credit = pick('credit');
        const debit = pick('debit');

        // one row per day, including days with no activity, oldest first
        const by_day = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(since);
            d.setUTCDate(since.getUTCDate() + i);
            const day = d.toISOString().slice(0, 10);
            const sum = (dir) =>
                to_money((daily.find((x) => x._id.day === day && x._id.direction === dir) || {}).total || 0);
            by_day.push({ day, credit: sum('credit'), debit: sum('debit') });
        }

        return {
            account_balance: user.account_details.account_balance,
            account_number: user.account_details.account_number,
            total_credit: to_money(credit.total),
            total_debit: to_money(debit.total),
            transaction_count: credit.count + debit.count,
            by_day,
        };
    }
}

module.exports = new user_service();
