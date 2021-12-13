const user_service = require('../services/user_service');
const { validationResult } = require('express-validator');
const Hash = require('../utility/bycrpt_hashing');
const user_controller = {};

user_controller.login = async (req, res) => {
    const data = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user_data = await user_service.user_login(data);
        res.status(200).json({ msg: 'user logged in ', data: user_data });
    } catch (error) {
        res.status(400).json({ message: "user wasn't signed in", error: error.message });
        console.log(error, 'error');
    }
};

user_controller.setPin = async (req, res) => {
    const { pin } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const setPin = await user_service.update_pin(req.USER_ID, pin);
        res.status(200).json({ msg: 'Your Transaction Pin has been set succssfully' });
    } catch (error) {
        res.status(400).json({ msg: 'Error occured', error: error.message });
    }
};

user_controller.setPassword = async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const setPassword = await user_service.update_password(email, password);
        res.status(200).json({ msg: 'Password set Successfully' });
    } catch (error) {
        res.status(400).json({ msg: 'Error occured', error: error.message });
    }
};

user_controller.update_profile = async (req, res) => {
    const data = req.body;
    try {
        const updated_profile = await user_service.update_profile(req.USER_ID, data);
        res.status(200).json({ msg: 'Profile set Successfully', data: updated_profile });
    } catch (error) {
        res.status(400).json({ msg: 'Error occured', error: error.message });
    }
};

user_controller.view_transactions = async (req, res) => {
    try {
        const user_transactions = await user_service.view_all_user_transactions(req.USER_ID);
        res.status(200).json({ msg: 'All your transactions', user_transactions: user_transactions });
    } catch (error) {
        res.status(400).json({ msg: 'Error occured', error: error.message });
    }
};

module.exports = user_controller;
