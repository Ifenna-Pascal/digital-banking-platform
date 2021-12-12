const user_repository_instance = require('../Database/Repository/userRepo');
const transaction_repository_instance = require('../Database/Repository/transactionRepo');
const bcrypt = require('bcrypt');
const { randomly_generated_transaction_id } = require('../utility/randomly_generated_string');

class transaction_service {
    async check_user_isActive(id) {
        const user = await user_repository_instance.find_user_by_id(id);
        return user.isActive;
    }

    async check_user_transactionPin_iscreated(id) {
        const user = await user_repository_instance.find_user_by_id(id);
        return user.transaction_pin;
    }

    async check_if_userPin_equals_insertedPin(transaction_pin, id) {
        const user = await user_repository_instance.find_user_by_id(id);
        const user_pin = user.transaction_pin;
        console.log(user);
        console.log(user_pin, 'pin');
        const isValid_pin = await bcrypt.compare(transaction_pin, user_pin);
        return isValid_pin;
    }

    async deposit_transaction(data, id) {
        const user = await user_repository_instance.find_user_by_id(id);
        if (!user) throw new Error('user does not exist');
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
        const new_transaction = await transaction_repository_instance.create_transaction(transaction_data);
        if (!new_transaction) throw new Error('Transaction not created');
        const new_amount = user.account_details.account_balance + data.amount;
        const updated_user_balance = await user_repository_instance.update_user_amount(id, new_amount);
        if (!updated_user_balance) throw new Error('cannot update ballance');
        return {
            msg: 'Deposit transaction completed successfully',
            new_transaction,
            updated_user_balance,
        };
    }

    // @description :>> withdrawal service
    async withdrawal_transaction(data, id) {
        const user = await user_repository_instance.find_user_by_id(id);
        if (!user) throw new Error('user does not exist');
        if (user.account_details.account_balance < parseInt(data.amount))
            throw new Error('you do not have enough balance for your withdrwal');
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
        const new_transaction = await transaction_repository_instance.create_transaction(transaction_data);
        if (!new_transaction) throw new Error('Transaction not created');
        const new_amount = user.account_details.account_balance - data.amount;
        const updated_user_balance = await user_repository_instance.update_user_amount(id, new_amount);
        if (!updated_user_balance) throw new Error('cannot update ballance');
        return {
            msg: 'Withdrawal transaction completed successfully',
            new_transaction,
            updated_user_balance,
        };
    }

    async increment_beneficiary_account(account_number, amount) {
        const beneficiary = await user_repository_instance.find_beneficiary(account_number);
        const new_balance = beneficiary.account_details.account_balance + amount;
        const update_beneficiary_amount = await user_repository_instance.update_user_amount(
            beneficiary._id,
            new_balance,
        );
        return update_beneficiary_amount;
    }

    async depositor_transaction(id, amount, account_number, narration) {
        const depositor_details = await user_repository_instance.find_user_by_id(id);
        const beneficiary = await user_repository_instance.find_beneficiary(account_number);
        console.log(beneficiary, 'depopfd');
        if (!beneficiary) throw Error('The Beneficiary Account Number Does Not Exist');
        if (beneficiary._id === id) throw Error('You cannot transfer money to your account rather deposit');
        if (depositor_details.account_details.account_balance < parseInt(amount))
            throw new Error('you do not have enough balance for your transfer');
        const transaction_data = {
            user_id: id,
            transaction_id: randomly_generated_transaction_id(),
            transaction_type: 'transfer',
            amount_transacted: parseInt(amount),
            transaction_status: 'success',
            previous_balance: depositor_details.account_details.account_balance,
            current_balance: depositor_details.account_details.account_balance - amount,
            transaction_narration: narration,
            from: id,
            to: beneficiary._id,
        };
        console.log(transaction_data, 'dataaaa');
        const new_transaction = await transaction_repository_instance.create_transaction(transaction_data);
        console.log(new_transaction, 'newwww');
        if (!new_transaction) throw new Error('Transaction not created');
        const new_balance = depositor_details.account_details.account_balance - amount;
        const update_depositor_amount = await user_repository_instance.update_user_amount(id, new_balance);
        return new_transaction;
    }
}

module.exports = new transaction_service();
