const {
    deposit_transaction,
    withdrawal_transaction,
    depositor_transaction,
    increment_beneficiary_account,
} = require('../services/transaction_service');
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
        res.status(200).json({ msg: ' Deposit Transactions Completed Successfully', details: deposit });
    } catch (error) {
        res.status(400).json({ msg: 'Deposit error occured', error: error.message });
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
        res.status(200).json({ details: withdrawal });
    } catch (error) {
        res.status(400).json({ msg: 'Withdrawal Error occured', error: error.message });
    }
};

transaction_controller.transfer = async (req, res) => {
    const { amount, account_number, narration } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // use async.series
    try {
        const depositor_details = await depositor_transaction(req.USER_ID, amount, account_number, narration);
        console.log(depositor_details);
        if (depositor_details) {
            console.log('beneficial');
            const beneficial_details = await increment_beneficiary_account(account_number, amount);
            res.status(200).json({ depositor_details: depositor_details });
            console.log(beneficial_details, 'dfsdvds');
        }
    } catch (error) {
        res.status(400).json({ msg: 'Transfer Error occured', error: error.message });
    }
};

module.exports = transaction_controller;
