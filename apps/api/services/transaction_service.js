const bcrypt = require('bcrypt');
const user_repository_instance = require('../Database/Repository/userRepo');
const transaction_repository_instance = require('../Database/Repository/transactionRepo');
const { randomly_generated_transaction_id } = require('../utility/randomly_generated_string');
const { AppError } = require('../utility/errors');
const { to_money } = require('../utility/money');
const { send_mail } = require('../utility/mailer');

const entry = (user, type, direction, amount, narration, extra = {}) => {
    const current = user.account_details.account_balance;
    return {
        user_id: user._id,
        transaction_id: randomly_generated_transaction_id(),
        transaction_type: type,
        direction,
        transaction_status: 'success',
        amount_transacted: amount,
        // `user` is the document returned *after* the atomic update
        previous_balance: to_money(direction === 'credit' ? current - amount : current + amount),
        current_balance: current,
        transaction_narration: narration,
        ...extra,
    };
};

const alert = (user, entryDoc) =>
    send_mail({
        to: user.email,
        subject: `${entryDoc.direction === 'credit' ? 'Credit' : 'Debit'} alert: ${entryDoc.amount_transacted}`,
        text:
            `Hello ${user.first_name},\n\n` +
            `A ${entryDoc.transaction_type} of ${entryDoc.amount_transacted} was ${entryDoc.direction}ed ` +
            `${entryDoc.direction === 'credit' ? 'to' : 'from'} your account ${user.account_details.account_number}.\n` +
            `Reference: ${entryDoc.transaction_id}\nNew balance: ${entryDoc.current_balance}\n`,
    });

class transaction_service {
    async check_user_isActive(id) {
        const user = await user_repository_instance.find_user_by_id(id);
        return Boolean(user && user.isActive);
    }

    async check_user_transactionPin_iscreated(id) {
        const user = await user_repository_instance.find_user_by_id(id, '+transaction_pin');
        return Boolean(user && user.transaction_pin);
    }

    async check_if_userPin_equals_insertedPin(transaction_pin, id) {
        const user = await user_repository_instance.find_user_by_id(id, '+transaction_pin');
        if (!user || !user.transaction_pin) return false;
        return bcrypt.compare(String(transaction_pin), user.transaction_pin);
    }

    async deposit_transaction({ amount, narration }, id) {
        amount = to_money(amount);
        const user = await user_repository_instance.credit(id, amount);
        if (!user) throw new AppError('Account not found or disabled', 400);
        const [transaction] = await transaction_repository_instance.create_transactions([
            entry(user, 'deposit', 'credit', amount, narration || 'Deposit', {
                reference: randomly_generated_transaction_id(),
            }),
        ]);
        alert(user, transaction);
        return { transaction, account_balance: user.account_details.account_balance };
    }

    async withdrawal_transaction({ amount, narration }, id) {
        amount = to_money(amount);
        const user = await user_repository_instance.debit(id, amount);
        if (!user) throw new AppError('You do not have enough balance for this withdrawal', 400);
        const [transaction] = await transaction_repository_instance.create_transactions([
            entry(user, 'withdrawal', 'debit', amount, narration || 'Withdrawal', {
                reference: randomly_generated_transaction_id(),
            }),
        ]);
        alert(user, transaction);
        return { transaction, account_balance: user.account_details.account_balance };
    }

    async transfer_transaction({ amount, account_number, narration }, id) {
        amount = to_money(amount);
        const beneficiary = await user_repository_instance.find_by_account_number(account_number);
        if (!beneficiary) throw new AppError('The beneficiary account number does not exist', 404);
        if (beneficiary._id.equals(id)) throw new AppError('You cannot transfer to your own account', 400);
        if (!beneficiary.isActive) throw new AppError('The beneficiary account cannot receive transfers', 400);

        // 1. take the money from the sender (fails cleanly if not enough)
        const sender = await user_repository_instance.debit(id, amount);
        if (!sender) throw new AppError('You do not have enough balance for this transfer', 400);

        // 2. give it to the recipient; if that fails, put it back
        const recipient = await user_repository_instance.credit(beneficiary._id, amount);
        if (!recipient) {
            await user_repository_instance.force_adjust(id, amount);
            throw new AppError('The beneficiary account cannot receive transfers', 400);
        }

        // 3. record both sides under one reference
        const reference = randomly_generated_transaction_id();
        const parties = { reference, from: sender._id, to: recipient._id };
        const [debit, credit] = await transaction_repository_instance.create_transactions([
            entry(sender, 'transfer', 'debit', amount, narration, parties),
            entry(recipient, 'transfer', 'credit', amount, narration, parties),
        ]);
        alert(sender, debit);
        alert(recipient, credit);

        return {
            transaction: debit,
            account_balance: sender.account_details.account_balance,
            beneficiary: {
                name: `${recipient.first_name} ${recipient.last_name}`,
                account_number: recipient.account_details.account_number,
            },
        };
    }

    // Lets the sender confirm who they're paying before sending money.
    async lookup_account(account_number) {
        const user = await user_repository_instance.find_by_account_number(account_number);
        if (!user || !user.isActive) throw new AppError('Account not found', 404);
        return { name: `${user.first_name} ${user.last_name}`, account_number: user.account_details.account_number };
    }
}

module.exports = new transaction_service();
