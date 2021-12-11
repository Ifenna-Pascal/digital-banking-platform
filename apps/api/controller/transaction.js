const { deposit_transaction, withdrawal_transaction } = require('../services/transaction_service');
const { validationResult } = require('express-validator');

const transaction_controller = {};

transaction_controller.deposit = async (req, res) => {
    const data = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const deposit = await deposit_transaction(data, req.USER_ID);
        res.status(200).json({ msg: ' Deposit Transaction Completed Successfully', details: deposit });
    } catch (error) {
        res.status(400).json({ msg: 'Deposit Error occured', error: error });
    }
};

transaction_controller.withdrawal = async (req, res) => {
    const data = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const withdrawal = await withdrawal_transaction(data, req.USER_ID);
        res.status(200).json({ msg: 'Withdrawal Transaction Completed Successfully', details: withdrawal });
    } catch (error) {
        res.status(400).json({ msg: 'Withdrawal Error occured', error: error });
    }
};

module.exports = transaction_controller;
