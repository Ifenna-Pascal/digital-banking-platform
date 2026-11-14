const mongoose = require('mongoose');
const Transaction = require('../model/transaction');

const PARTY_FIELDS = 'first_name last_name account_details.account_number';

class transactionRepository {
    create_transactions(docs) {
        return Transaction.insertMany(docs);
    }

    list_for_user(user_id, { skip = 0, limit = 20, type } = {}) {
        const filter = { user_id };
        if (type) filter.transaction_type = type;
        return Promise.all([
            Transaction.find(filter)
                .sort({ created_at: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .populate('from', PARTY_FIELDS)
                .populate('to', PARTY_FIELDS),
            Transaction.countDocuments(filter),
        ]);
    }

    list_all({ skip = 0, limit = 20 } = {}) {
        return Promise.all([
            Transaction.find()
                .sort({ created_at: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user_id', 'first_name last_name email'),
            Transaction.countDocuments(),
        ]);
    }

    find_by_transaction_id(transaction_id) {
        return Transaction.findOne({ transaction_id });
    }

    find_by_reference(reference) {
        return Transaction.find({ reference });
    }

    // Sets is_reversed on both sides of a transfer, but only where it is still
    // false, so a transfer is reversed once even if two admins click together.
    // Returns how many entries changed (2 = we won, 0 = already reversed).
    async mark_reversed(reference) {
        const { modifiedCount } = await Transaction.updateMany(
            { reference, transaction_type: 'transfer', is_reversed: false },
            { $set: { is_reversed: true, reversed_at: new Date() } },
        );
        return modifiedCount;
    }

    // Undo mark_reversed when the reversal could not be completed.
    async unmark_reversed(reference) {
        await Transaction.updateMany(
            { reference, transaction_type: 'transfer' },
            { $set: { is_reversed: false }, $unset: { reversed_at: 1 } },
        );
    }

    // Credit/debit totals plus per-day totals for the last `days` days (UTC).
    async summary_for_user(user_id, days = 7) {
        const id = new mongoose.Types.ObjectId(String(user_id));
        const since = new Date();
        since.setUTCHours(0, 0, 0, 0);
        since.setUTCDate(since.getUTCDate() - (days - 1));

        const [totals, daily] = await Promise.all([
            Transaction.aggregate([
                { $match: { user_id: id } },
                { $group: { _id: '$direction', total: { $sum: '$amount_transacted' }, count: { $sum: 1 } } },
            ]),
            Transaction.aggregate([
                { $match: { user_id: id, created_at: { $gte: since } } },
                {
                    $group: {
                        _id: {
                            day: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                            direction: '$direction',
                        },
                        total: { $sum: '$amount_transacted' },
                    },
                },
            ]),
        ]);
        return { totals, daily, since };
    }
}

module.exports = new transactionRepository();
