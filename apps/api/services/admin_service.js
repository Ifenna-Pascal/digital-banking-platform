const user_repository_instance = require('../Database/Repository/userRepo');
const transaction_repository_instance = require('../Database/Repository/transactionRepo');
const Hash = require('../utility/bycrpt_hashing');
const {
    randomly_generated_account_number,
    randomly_generated_transaction_id,
    randomly_generated_setup_token,
} = require('../utility/randomly_generated_string');
const { AppError } = require('../utility/errors');
const { to_money } = require('../utility/money');
const { send_mail } = require('../utility/mailer');

const SETUP_TOKEN_DAYS = 7;

const issue_setup_token = async (user) => {
    const setup_token = randomly_generated_setup_token();
    const expires = new Date(Date.now() + SETUP_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await user_repository_instance.set_setup_token(user._id, await Hash(setup_token), expires);
    await send_mail({
        to: user.email,
        subject: 'Finish setting up your bank account',
        text:
            `Hello ${user.first_name},\n\nYour account ${user.account_details.account_number} is ready.\n` +
            `Use this setup code to choose your password: ${setup_token}\n` +
            `It expires on ${expires.toUTCString()}.\n`,
    });
    return { setup_token, setup_token_expires: expires };
};

const is_duplicate = (error, field) => error && error.code === 11000 && error.keyPattern && error.keyPattern[field];

class admin_service {
    async create_user({ first_name, last_name, email, role }) {
        const existing = await user_repository_instance.find_user_by_email(email);
        if (existing) throw new AppError('A user with this email already exists', 409);

        // account numbers are random; on the rare clash, draw again
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const user = await user_repository_instance.create_user({
                    first_name,
                    last_name,
                    email,
                    role: role || 'user',
                    account_details: { account_number: randomly_generated_account_number() },
                });
                // the code is returned once so the admin can hand it over if email is off
                const setup = await issue_setup_token(user);
                return { user, ...setup };
            } catch (error) {
                if (is_duplicate(error, 'account_details.account_number')) continue;
                if (is_duplicate(error, 'email')) throw new AppError('A user with this email already exists', 409);
                throw error;
            }
        }
        throw new AppError('Could not allocate an account number, try again', 503);
    }

    async resend_setup(id) {
        const user = await user_repository_instance.find_user_by_id(id, '+password');
        if (!user) throw new AppError('User not found', 404);
        if (user.password) throw new AppError('This user has already set a password', 400);
        return issue_setup_token(user);
    }

    async list_users(page = 1, limit = 20) {
        const [items, total] = await user_repository_instance.list_users({ skip: (page - 1) * limit, limit });
        return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }

    async list_transactions(page = 1, limit = 20) {
        const [items, total] = await transaction_repository_instance.list_all({ skip: (page - 1) * limit, limit });
        return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }

    async delete_user(id, admin_id) {
        if (String(id) === String(admin_id)) throw new AppError('You cannot delete your own account', 400);
        const result = await user_repository_instance.delete_user(id);
        if (!result.deleted_user) throw new AppError('User not found', 404);
        return result;
    }

    async set_active(id, isActive, admin_id) {
        if (!isActive && String(id) === String(admin_id))
            throw new AppError('You cannot disable your own account', 400);
        const user = await user_repository_instance.set_active(id, isActive);
        if (!user) throw new AppError('User not found', 404);
        return user;
    }

    // Reverses a transfer by its transaction_id (either side's ID works).
    // The original entries stay, marked is_reversed, and two new 'reversal'
    // entries record the money moving back, so the history stays complete.
    async reverse_transaction(transaction_id) {
        const original = await transaction_repository_instance.find_by_transaction_id(transaction_id);
        if (!original) throw new AppError('Transaction does not exist', 404);
        if (original.transaction_type !== 'transfer')
            throw new AppError('Only transfer transactions can be reversed', 400);
        if (original.is_reversed) throw new AppError('This transaction has already been reversed', 409);

        const { reference, from, to } = original;
        const amount = to_money(original.amount_transacted);

        // claim the reversal first so a second request can't run it again
        const claimed = await transaction_repository_instance.mark_reversed(reference);
        if (claimed === 0) throw new AppError('This transaction has already been reversed', 409);

        // take the money back from the recipient only if they still have it
        const recipient = await user_repository_instance.debit(to, amount);
        if (!recipient) {
            await transaction_repository_instance.unmark_reversed(reference);
            throw new AppError(
                'The recipient no longer has enough balance (or is disabled) to reverse this transfer',
                400,
            );
        }
        const sender = await user_repository_instance.force_adjust(from, amount);
        if (!sender) {
            // sender was deleted; give the recipient their money back
            await user_repository_instance.force_adjust(to, amount);
            await transaction_repository_instance.unmark_reversed(reference);
            throw new AppError('The original sender no longer exists', 400);
        }

        const narration = `Reversal of ${reference}`;
        const make = (user, direction) => {
            const current = user.account_details.account_balance;
            return {
                user_id: user._id,
                transaction_id: randomly_generated_transaction_id(),
                reference,
                transaction_type: 'reversal',
                direction,
                amount_transacted: amount,
                previous_balance: to_money(direction === 'credit' ? current - amount : current + amount),
                current_balance: current,
                transaction_narration: narration,
                from: to,
                to: from,
            };
        };
        const entries = await transaction_repository_instance.create_transactions([
            make(recipient, 'debit'),
            make(sender, 'credit'),
        ]);

        return {
            reference,
            reversal_entries: entries,
            sender_balance: sender.account_details.account_balance,
            recipient_balance: recipient.account_details.account_balance,
        };
    }
}

module.exports = new admin_service();
