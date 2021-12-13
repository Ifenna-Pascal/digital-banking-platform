const user_repository_instance = require('../Database/Repository/userRepo');
const transaction_repository_instance = require('../Database/Repository/transactionRepo');
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
                email: data.email,
                role: data.role ? data.role : 'user',
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

    // transaction is deleted aftyer reverse
    async reverse_transaction(id) {
        try {
            // gets transaction details
            const Transaction = await transaction_repository_instance.get_tranasction_by_id(id);
            if (!Transaction) throw new Error('Transaction does not exist in the database');
            if (Transaction.transaction_type !== 'transfer')
                throw new Error('Only transfer transactions can be reversed');

            // destrcuture transaction details
            const { amount_transacted, to, from } = Transaction;

            // decrements beneficiary account balance during transaction reverse
            const beneficiary_details = await user_repository_instance.find_user_by_id(to);
            const reverse_beneficiary_amount = (beneficiary_details.account_details.account_balance -=
                amount_transacted);
            const updated_beneficiary_details = await user_repository_instance.update_user_amount(
                to,
                reverse_beneficiary_amount,
            );

            // increments depositor account balance during transaction reverse
            const depositor_details = await user_repository_instance.find_user_by_id(from);
            const reverse_depositor_amount = (depositor_details.account_details.account_balance += amount_transacted);
            const updated_depositor_details = await user_repository_instance.update_user_amount(
                from,
                reverse_depositor_amount,
            );

            // deletes transaction after reverse
            const deleted_transaction = await transaction_repository_instance.delete_transaction(id);

            return {
                deleted_transaction,
                updated_beneficiary_details,
                updated_depositor_details,
            };
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = new admin_service();
