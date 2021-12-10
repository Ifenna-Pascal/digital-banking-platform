const user_service = require('../services/user_service');
const { validationResult } = require('express-validator');
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
        res.status(400).send({ message: "user wasn't signed in", error });
        console.log(error);
    }
};

module.exports = user_controller;
