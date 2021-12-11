const Transaction = require('../model/transaction');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const { randomly_generated_transaction_id } = require('../utility/randomly_generated_string');

class transaction_service {
    async check_user_isActive(id) {
        const user = await User.findOne({ _id: id });
        return user.isActive;
    }

    async check_user_transactionPin_iscreated(id) {
        console.log(id);
        const user = await User.findOne({ _id: id });
        return user.transaction_pin;
    }

    async check_if_userPin_equals_insertedPin(transaction_pin, userID) {
        console.log('idd', userID);
        const user = await User.findOne({ _id: userID });
        const user_pin = user.transaction_pin;
        const isValid_pin = await bcrypt.compare(transaction_pin, user_pin);
        return isValid_pin;
    }

    async deposit_transaction(data, id) {
        const user = await User.findOne({ _id: id });
        console.log('iden', data);
        const transaction_data = {
            user_id: id,
            transaction_id: randomly_generated_transaction_id(),
            transaction_type: 'deposit',
            amount_transacted: parseInt(data.amount),
            transaction_status: 'success',
            previous_balance: user.account_details.account_balance,
            current_balance: user.account_details.account_balance + data.amount,
            transaction_narration: data.narration,
        };
        const new_transaction = await new Transaction(transaction_data);
        const saved_transaction = await new_transaction.save();
        user.account_details.account_balance += data.amount;
        const saved_user = await user.save();
        return {
            saved_transaction,
            saved_user,
        };
    }

    async withdrawal_transaction(data, id) {
        const user = await User.findOne({ _id: id });
        if (user.account_details.account_balance < parseInt(data.amount))
            return 'you do not have enough balance for your withdrwal';
        const transaction_data = {
            user_id: id,
            transaction_id: randomly_generated_transaction_id(),
            transaction_type: 'withdrawal',
            amount_transacted: parseInt(data.amount),
            transaction_status: 'success',
            previous_balance: user.account_details.account_balance,
            current_balance: user.account_details.account_balance - data.amount,
            transaction_narration: data.narration,
        };
        const new_transaction = await new Transaction(transaction_data);
        const saved_transaction = await new_transaction.save();
        user.account_details.account_balance -= data.amount;
        const saved_user = await user.save();
        return {
            msg: ' Withdrawal transaction completed successfully',
            saved_transaction,
            saved_user,
        };
    }
}

module.exports = new transaction_service();
