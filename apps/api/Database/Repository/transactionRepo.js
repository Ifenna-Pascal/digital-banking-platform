const Transaction = require('../model/transaction');

class transactionRepository {
    async view_all_user_transactions(id) {
        const user_transactions = await Transaction.find({ user_id: id }).populate("from").populate("to").exec();
        return user_transactions;
    }

    async create_transaction(data) {
        const new_transaction = await Transaction.create(data);
        return new_transaction;
    }

    async get_tranasction_by_id (id) {
        const transaction = await Transaction.findById(id);
        return transaction;
    }

    async delete_transaction (id) {
        const deleted_transaction = await Transaction.findByIdAndDelete(id);
        return deleted_transaction;
    }
}

module.exports = new transactionRepository();
