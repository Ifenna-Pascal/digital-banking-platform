const {
    deposit_transaction,
    withdrawal_transaction,
    transfer_transaction,
    lookup_account,
} = require('../services/transaction_service');
const wrap = require('../utility/wrap');

const transaction_controller = {};

transaction_controller.deposit = wrap(async (req, res) => {
    const details = await deposit_transaction(req.body, req.USER_ID);
    res.status(200).json({ msg: 'Deposit completed successfully', details });
});

transaction_controller.withdrawal = wrap(async (req, res) => {
    const details = await withdrawal_transaction(req.body, req.USER_ID);
    res.status(200).json({ msg: 'Withdrawal completed successfully', details });
});

transaction_controller.transfer = wrap(async (req, res) => {
    const details = await transfer_transaction(req.body, req.USER_ID);
    res.status(200).json({ msg: 'Transfer completed successfully', details });
});

transaction_controller.lookup = wrap(async (req, res) => {
    const account = await lookup_account(req.params.account_number);
    res.status(200).json({ msg: 'account found', account });
});

module.exports = transaction_controller;
